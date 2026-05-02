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
        background: "#ffffff",
        fontFamily: "'Syne', sans-serif",
        padding: "28px 32px",
        color: "#111111",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700 }}>🚀 AI Video Generator</h1>
        <p style={{ color: "#666666", fontSize: 14 }}>
          Type a topic → AI searches YouTube → Downloads clips → Edits
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* LEFT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Card style reusable */}
          {/** use this look everywhere */}

          {/* Topic */}
          <div style={card}>
            <label style={label}>🔍 YOUTUBE TOPIC</label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="crypto, AI, fitness..."
              style={input}
            />
          </div>

          {/* Prompt */}
          <div style={card}>
            <label style={label}>✍️ EDIT PROMPT</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              style={input}
            />
          </div>

          {/* Style */}
          <div style={card}>
            <label style={label}>🎨 VIDEO STYLE</label>
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
                    padding: 10,
                    borderRadius: 8,
                    border:
                      style === s.id
                        ? "1px solid #2563eb"
                        : "1px solid #e5e5e5",
                    background: style === s.id ? "#eef2ff" : "#ffffff",
                    cursor: "pointer",
                  }}
                >
                  <p style={{ fontWeight: 600 }}>{s.label}</p>
                  <p style={{ fontSize: 11, color: "#666" }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!topic || !prompt}
            style={{
              padding: 16,
              borderRadius: 12,
              border: "none",
              background: "linear-gradient(135deg, #2563eb, #60a5fa)",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            🚀 Generate Video
          </button>
        </div>

        {/* RIGHT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Steps */}
          <div style={card}>
            <label style={label}>📋 PIPELINE STATUS</label>
            {STEPS.map((step, i) => (
              <div key={i} style={{ padding: "8px 0" }}>
                {step.icon} {step.label}
              </div>
            ))}
          </div>

          {/* Logs */}
          {logs.length > 0 && (
            <div style={card}>
              <label style={label}>🖥️ LOGS</label>
              {logs.map((l, i) => (
                <p key={i} style={{ fontSize: 12, color: "#444" }}>
                  {l.time} — {l.msg}
                </p>
              ))}
            </div>
          )}

          {/* Video */}
          {videoUrl && (
            <div style={card}>
              <video src={videoUrl} controls style={{ width: "100%" }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* 🔥 reusable styles */
const card = {
  background: "#ffffff",
  border: "1px solid #e5e5e5",
  borderRadius: 12,
  padding: 20,
};

const label = {
  fontSize: 11,
  color: "#666666",
  marginBottom: 10,
  display: "block",
};

const input = {
  width: "100%",
  padding: "10px",
  borderRadius: 8,
  border: "1px solid #ddd",
  fontSize: 14,
};
