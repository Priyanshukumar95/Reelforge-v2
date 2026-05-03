import openai, redis, json
from config import settings

client = openai.OpenAI(
    api_key=settings.OPENAI_API_KEY, base_url="https://api.groq.com/openai/v1"
)
r = redis.from_url(settings.REDIS_URL, decode_responses=True)

SYSTEM_PROMPT = """You are a viral short-form scriptwriter.
Given a trending topic write a reel script with:
1. HOOK (0-3s): Bold attention-grabbing opening line.
2. BODY (4-25s): 3-4 punchy factual sentences. No fluff.
3. CTA (26-30s): One clear call-to-action line.
4. CAPTION: 2-line caption with emojis.
5. HASHTAGS: 10 relevant hashtags as a list.
Return ONLY valid JSON. No markdown. No explanation.
Schema: {hook, body, cta, caption, hashtags: []}"""


def generate_script(trend: dict) -> dict:
    prompt = (
        f"Trend: {trend['title']}\n"
        f"Source: {trend['source']}\n"
        f"Target: 30 seconds, engaging & educational"
    )
    try:
        resp = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0.8,
            timeout=30,
        )
        script = json.loads(resp.choices[0].message.content)
    except Exception as e:
        print(f"[ScriptGen] GPT error: {e}")
        script = {
            "hook": f"Did you know about {trend['title'][:40]}?",
            "body": "Here's what everyone is talking about right now.",
            "cta": "Follow for more trending content!",
            "caption": f"Trending now 🔥\n{trend['title'][:50]}",
            "hashtags": [
                "#trending",
                "#viral",
                "#news",
                "#reels",
                "#shorts",
                "#fyp",
                "#ai",
                "#tech",
                "#learn",
                "#today",
            ],
        }
    script["trend"] = trend
    script["status"] = "pending_review"
    r.lpush("script_queue", json.dumps(script))
    return script
