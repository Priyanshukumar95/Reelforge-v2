import { useState } from "react";

const STYLES = [
  { id: "viral", label: "🔥 Viral", desc: "Fast cuts, trending" },
  { id: "cinematic", label: "🎬 Cinematic", desc: "Dark, dramatic" },
  { id: "educational", label: "📚 Educational", desc: "Clean, informative" },
  { id: "motivational", label: "💪 Motivational", desc: "Energy, music" },
];

const EFFECTS = [
  { id: "captions", label: "💬 Captions" },
  { id: "music", label: "🎵 Music" },
  { id: "zoom", label: "🔍 Zoom" },
  { id: "trim", label: "✂️ Trim" },
  { id: "filter", label: "🎨 Filter" },
  { id: "speed", label: "⚡ Speed" },
];

const DURATIONS = ["15s", "30s", "60s"];

const STEPS = [
  { id: "search", label: "Searching YouTube", icon: "🔍" },
  { id: "download", label: "Downloading clips", icon: "📥" },
  { id: "analyse", label: "Analysing prompt", icon: "🤖" },
  { id: "effects", label: "Applying effects", icon: "🎨" },
  { id: "render", label: "Rendering video", icon: "🎬" },
  { id: "done", label: "Video ready!", icon: "✅" },
];

export default function Generate() {
  const [topic, setTopic] = useState("");
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("viral");
  const [effects, setEffects] = useState(["captions", "music"]);
  const [duration, setDuration] = useState("30s");
  const [status, setStatus] = useState("idle");
  const [currentStep, setCurrentStep] = useState(-1);
  const [videoUrl, setVideoUrl] = useState("");
  const [logs, setLogs] = useState([]);

  const toggleEffect = (id) => {
    setEffects((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const addLog = (msg) =>
    setLogs((prev) => [
      ...prev,
      { msg, time: new Date().toLocaleTimeString() },
    ]);

  const handleGenerate = async () => {
    if (!topic || !prompt) return;

    setStatus("loading");
    setCurrentStep(0);
    setLogs([]);
    setVideoUrl("");

    try {
      addLog("Searching YouTube for: " + topic);
      setCurrentStep(0);

      const interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < STEPS.length - 2) {
            addLog(STEPS[prev + 1]?.label || "");
            return prev + 1;
          }
          return prev;
        });
      }, 2500);

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, prompt, style, effects, duration }),
      });

      const data = await res.json();
      clearInterval(interval);
      setCurrentStep(STEPS.length - 1);
      addLog("Video ready!");
      setVideoUrl(data.videoUrl);
      setStatus("done");
    } catch (err) {
      addLog("❌ Error: " + err.message);
      setStatus("error");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050508",
        fontFamily: "'Syne', sans-serif",
        padding: "28px 32px",
        color: "#f0eeff",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: "#f0eeff",
            letterSpacing: "-0.5px",
            marginBottom: 4,
          }}
        >
          🚀 AI Video Generator
        </h1>
        <p style={{ color: "#6b6b8a", fontSize: 14 }}>
          Type a topic → AI searches YouTube → Downloads clips → Edits
          automatically
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
        }}
      >
        {/* LEFT — Controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Topic */}
          <div
            style={{
              background: "#0d0d14",
              border: "1px solid rgba(120,80,255,0.15)",
              borderRadius: 12,
              padding: 20,
            }}
          >
            <label
              style={{
                fontSize: 11,
                color: "#6b6b8a",
                letterSpacing: "1.5px",
                fontWeight: 600,
                display: "block",
                marginBottom: 10,
              }}
            >
              🔍 YOUTUBE TOPIC
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. crypto news, fitness tips, AI trends..."
              style={{
                width: "100%",
                background: "#13131e",
                border: "1px solid rgba(124,77,255,0.2)",
                borderRadius: 8,
                padding: "12px 14px",
                color: "#f0eeff",
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            {/* Quick topics */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                marginTop: 10,
              }}
            >
              {[
                "crypto news",
                "AI trends",
                "fitness tips",
                "success mindset",
                "tech 2025",
              ].map((t) => (
                <span
                  key={t}
                  onClick={() => setTopic(t)}
                  style={{
                    fontSize: 11,
                    color: "#a78bfa",
                    background: "rgba(124,77,255,0.08)",
                    border: "1px solid rgba(124,77,255,0.2)",
                    borderRadius: 20,
                    padding: "3px 10px",
                    cursor: "pointer",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Prompt */}
          <div
            style={{
              background: "#0d0d14",
              border: "1px solid rgba(120,80,255,0.15)",
              borderRadius: 12,
              padding: 20,
            }}
          >
            <label
              style={{
                fontSize: 11,
                color: "#6b6b8a",
                letterSpacing: "1.5px",
                fontWeight: 600,
                display: "block",
                marginBottom: 10,
              }}
            >
              ✍️ EDIT PROMPT
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Add bold captions, fast cuts, viral music, trim pauses..."
              rows={3}
              style={{
                width: "100%",
                background: "#13131e",
                border: "1px solid rgba(124,77,255,0.2)",
                borderRadius: 8,
                padding: "12px 14px",
                color: "#f0eeff",
                fontSize: 14,
                outline: "none",
                resize: "none",
                boxSizing: "border-box",
              }}
            />
            {/* Suggestions */}
            <div style={{ marginTop: 8 }}>
              {[
                "Add bold captions and fast viral cuts",
                "Cinematic dark theme with dramatic music",
                "Educational clean style with text overlays",
              ].map((s) => (
                <p
                  key={s}
                  onClick={() => setPrompt(s)}
                  style={{
                    fontSize: 11,
                    color: "#6b6b8a",
                    cursor: "pointer",
                    padding: "3px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.03)",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#a78bfa")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#6b6b8a")
                  }
                >
                  → {s}
                </p>
              ))}
            </div>
          </div>

          {/* Style */}
          <div
            style={{
              background: "#0d0d14",
              border: "1px solid rgba(120,80,255,0.15)",
              borderRadius: 12,
              padding: 20,
            }}
          >
            <label
              style={{
                fontSize: 11,
                color: "#6b6b8a",
                letterSpacing: "1.5px",
                fontWeight: 600,
                display: "block",
                marginBottom: 10,
              }}
            >
              🎨 VIDEO STYLE
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
            >
              {STYLES.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setStyle(s.id)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 8,
                    border:
                      style === s.id
                        ? "1px solid rgba(124,77,255,0.5)"
                        : "1px solid rgba(255,255,255,0.06)",
                    background:
                      style === s.id ? "rgba(124,77,255,0.1)" : "#13131e",
                    cursor: "pointer",
                  }}
                >
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: style === s.id ? "#a78bfa" : "#f0eeff",
                    }}
                  >
                    {s.label}
                  </p>
                  <p style={{ fontSize: 11, color: "#6b6b8a", marginTop: 2 }}>
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Effects + Duration */}
          <div
            style={{
              background: "#0d0d14",
              border: "1px solid rgba(120,80,255,0.15)",
              borderRadius: 12,
              padding: 20,
            }}
          >
            <label
              style={{
                fontSize: 11,
                color: "#6b6b8a",
                letterSpacing: "1.5px",
                fontWeight: 600,
                display: "block",
                marginBottom: 10,
              }}
            >
              ⚙️ EFFECTS
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 6,
                marginBottom: 16,
              }}
            >
              {EFFECTS.map((ef) => (
                <div
                  key={ef.id}
                  onClick={() => toggleEffect(ef.id)}
                  style={{
                    padding: "8px",
                    borderRadius: 8,
                    border: effects.includes(ef.id)
                      ? "1px solid rgba(0,229,160,0.4)"
                      : "1px solid rgba(255,255,255,0.06)",
                    background: effects.includes(ef.id)
                      ? "rgba(0,229,160,0.08)"
                      : "#13131e",
                    cursor: "pointer",
                    textAlign: "center",
                    fontSize: 12,
                    color: effects.includes(ef.id) ? "#00e5a0" : "#9898b8",
                    fontWeight: effects.includes(ef.id) ? 600 : 400,
                  }}
                >
                  {ef.label}
                </div>
              ))}
            </div>

            <label
              style={{
                fontSize: 11,
                color: "#6b6b8a",
                letterSpacing: "1.5px",
                fontWeight: 600,
                display: "block",
                marginBottom: 8,
              }}
            >
              ⏱️ DURATION
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  style={{
                    flex: 1,
                    padding: "8px",
                    borderRadius: 8,
                    border:
                      duration === d
                        ? "1px solid rgba(124,77,255,0.5)"
                        : "1px solid rgba(255,255,255,0.06)",
                    background:
                      duration === d ? "rgba(124,77,255,0.1)" : "#13131e",
                    color: duration === d ? "#a78bfa" : "#9898b8",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!topic || !prompt || status === "loading"}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: 12,
              border: "none",
              background:
                !topic || !prompt || status === "loading"
                  ? "rgba(124,77,255,0.3)"
                  : "linear-gradient(135deg, #7c4dff, #00d4ff)",
              color: "#fff",
              fontSize: 16,
              fontWeight: 700,
              cursor:
                !topic || !prompt || status === "loading"
                  ? "not-allowed"
                  : "pointer",
              boxShadow:
                status !== "loading" ? "0 0 30px rgba(124,77,255,0.3)" : "none",
              transition: "all 0.2s",
            }}
          >
            {status === "loading" ? "⚙️ AI is working..." : "🚀 Generate Video"}
          </button>
        </div>

        {/* RIGHT — Output */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Steps Progress */}
          <div
            style={{
              background: "#0d0d14",
              border: "1px solid rgba(120,80,255,0.15)",
              borderRadius: 12,
              padding: 20,
            }}
          >
            <label
              style={{
                fontSize: 11,
                color: "#6b6b8a",
                letterSpacing: "1.5px",
                fontWeight: 600,
                display: "block",
                marginBottom: 14,
              }}
            >
              📋 PIPELINE STATUS
            </label>
            {STEPS.map((step, index) => {
              const isDone = index < currentStep;
              const isActive = index === currentStep;
              const isPending = index > currentStep;
              return (
                <div
                  key={step.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 0",
                    borderBottom:
                      index < STEPS.length - 1
                        ? "1px solid rgba(255,255,255,0.03)"
                        : "none",
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16,
                      background: isDone
                        ? "rgba(0,229,160,0.1)"
                        : isActive
                        ? "rgba(124,77,255,0.15)"
                        : "rgba(255,255,255,0.03)",
                      border: isDone
                        ? "1px solid rgba(0,229,160,0.3)"
                        : isActive
                        ? "1px solid rgba(124,77,255,0.4)"
                        : "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    {step.icon}
                  </div>
                  <span
                    style={{
                      fontSize: 13,
                      color: isDone
                        ? "#00e5a0"
                        : isActive
                        ? "#a78bfa"
                        : "#6b6b8a",
                      fontWeight: isActive ? 600 : 400,
                      flex: 1,
                    }}
                  >
                    {step.label}
                  </span>
                  {isDone && (
                    <span style={{ color: "#00e5a0", fontSize: 12 }}>✓</span>
                  )}
                  {isActive && (
                    <span style={{ color: "#a78bfa", fontSize: 11 }}>
                      processing...
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Live Logs */}
          {logs.length > 0 && (
            <div
              style={{
                background: "#0d0d14",
                border: "1px solid rgba(120,80,255,0.15)",
                borderRadius: 12,
                padding: 20,
              }}
            >
              <label
                style={{
                  fontSize: 11,
                  color: "#6b6b8a",
                  letterSpacing: "1.5px",
                  fontWeight: 600,
                  display: "block",
                  marginBottom: 10,
                }}
              >
                🖥️ LIVE LOGS
              </label>
              <div
                style={{
                  maxHeight: 140,
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                {logs.map((log, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: 8,
                      fontSize: 11,
                      fontFamily: "monospace",
                    }}
                  >
                    <span style={{ color: "#6b6b8a" }}>{log.time}</span>
                    <span style={{ color: "#9898b8" }}>{log.msg}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Video Result */}
          {status === "done" && videoUrl && (
            <div
              style={{
                background: "#0d0d14",
                border: "1px solid rgba(0,229,160,0.2)",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "14px 20px",
                  borderBottom: "1px solid rgba(0,229,160,0.1)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#00e5a0",
                  }}
                >
                  ✅ Video Ready!
                </span>
                <span style={{ fontSize: 11, color: "#6b6b8a" }}>
                  {duration} · {style}
                </span>
              </div>
              <video
                src={videoUrl}
                controls
                style={{ width: "100%", maxHeight: 260, background: "#000" }}
              />
              <div style={{ padding: 16 }}>
                <button
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: 8,
                    border: "none",
                    background: "linear-gradient(135deg, #7c4dff, #00d4ff)",
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  📤 Send to Review Queue
                </button>
              </div>
            </div>
          )}

          {/* Idle state */}
          {status === "idle" && (
            <div
              style={{
                background: "#0d0d14",
                border: "1px solid rgba(120,80,255,0.15)",
                borderRadius: 12,
                padding: 32,
                textAlign: "center",
              }}
            >
              <p style={{ fontSize: 48, marginBottom: 12 }}>🎬</p>
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#f0eeff",
                  marginBottom: 8,
                }}
              >
                How it works
              </p>
              {[
                "1️⃣ Type a topic — AI searches YouTube",
                "2️⃣ Best clips downloaded automatically",
                "3️⃣ Your prompt guides the AI edit",
                "4️⃣ Effects & music added",
                "5️⃣ Final reel ready to post",
              ].map((s, i) => (
                <p
                  key={i}
                  style={{
                    fontSize: 13,
                    color: "#6b6b8a",
                    padding: "4px 0",
                    textAlign: "left",
                  }}
                >
                  {s}
                </p>
              ))}
            </div>
          )}

          {/* Error */}
          {status === "error" && (
            <div
              style={{
                background: "rgba(255,77,109,0.05)",
                border: "1px solid rgba(255,77,109,0.2)",
                borderRadius: 12,
                padding: 20,
              }}
            >
              <p
                style={{
                  color: "#ff4d6d",
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                ❌ Generation Failed
              </p>
              <button
                onClick={() => setStatus("idle")}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "#13131e",
                  color: "#f0eeff",
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
