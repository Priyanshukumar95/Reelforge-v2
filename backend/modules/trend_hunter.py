import feedparser, redis, json, uuid
from datetime import datetime
from config import settings

SOURCES = {
    "youtube": "https://www.youtube.com/feeds/videos.xml?chart=mostPopular",
    "hackernews": "https://hnrss.org/frontpage",
    "reddit_tech": "https://www.reddit.com/r/technology/.rss",
    "reddit_news": "https://www.reddit.com/r/worldnews/hot/.rss",
}
r = redis.from_url(settings.REDIS_URL, decode_responses=True)


def score_trend(entry) -> float:
    try:
        age_hours = (
            datetime.now() - datetime(*entry.published_parsed[:6])
        ).total_seconds() / 3600
    except Exception:
        age_hours = 12
    recency = max(0.0, 1.0 - age_hours / 24)
    keywords = [
        "viral",
        "breaking",
        "new",
        "top",
        "how to",
        "best",
        "secret",
        "ai",
        "2025",
    ]
    kw = sum(1 for k in keywords if k in entry.title.lower()) * 0.1
    return round(min(1.0, recency + kw), 3)


def fetch_all_trends() -> list[dict]:
    trends = []
    for src, url in SOURCES.items():
        try:
            feed = feedparser.parse(url)
            for e in feed.entries[:5]:
                if not hasattr(e, "published_parsed"):
                    continue
                trends.append(
                    {
                        "id": str(uuid.uuid4())[:8],
                        "source": src,
                        "title": e.title,
                        "link": e.link,
                        "score": score_trend(e),
                        "fetched": datetime.now().isoformat(),
                    }
                )
        except Exception as ex:
            print(f"[TrendHunter] {src}: {ex}")
    trends.sort(key=lambda x: x["score"], reverse=True)
    top = trends[:3]
    for t in top:
        r.lpush("trend_queue", json.dumps(t))
    print(f"[TrendHunter] Pushed {len(top)} trends")
    return top


if __name__ == "__main__":
    fetch_all_trends()
