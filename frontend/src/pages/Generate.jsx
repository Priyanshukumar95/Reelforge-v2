import { useState } from "react";

const EDIT_SUGGESTIONS = [
  "Add bold captions, fast cuts and viral music",
  "Make it educational with clean text overlays",
  "Add meme transitions and funny sound effects",
  "Make it news style with professional tone",
  "Add zoom effects on key moments and trim pauses",
];

const EFFECTS = [
  { id: "captions", label: "💬 Captions" },
  { id: "music", label: "🎵 Music" },
  { id: "filter", label: "🎨 Filter" },
  { id: "speed", label: "⚡ Speed" },
  { id: "zoom", label: "🔍 Zoom" },
  { id: "trim", label: "✂️ Trim" },
];

const DURATIONS = ["15s", "30s", "60s"];

export default function Generate() {
  const [topic, setTopic] = useState("");
  const [prompt, setPrompt] = useState("");
  const [effects, setEffects] = useState(["captions"]);
  const [duration, setDuration] = useState("30s");
  const [status, setStatus] = useState("idle");
  // idle | fetching | editing | done | error
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [resultVideo, setResultVideo] = useState(null);
  const [logs, setLogs] = useState([]);

  const toggleEffect = (id) => {
    setEffects((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const addLog = (msg) => setLogs((prev) => [...prev, msg]);

  const handleGenerate = async () => {
    if (!topic || !prompt) return;

    setStatus("fetching");
    setProgress(0);
    setLogs([]);
    setResultVideo(null);

    try {
      // STEP 1 — Fetch YouTube video
      addLog("🔍 Searching YouTube for: " + topic);
      setProgressLabel("Fetching from YouTube...");
      setProgress(10);

      const fetchRes = await fetch("/api/generate/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, prompt, effects, duration }),
      });

      if (!fetchRes.ok) throw new Error("Failed to fetch video");

      const fetchData = await fetchRes.json();
      addLog("✅ Found video: " + fetchData.title);
      addLog("📥 Downloading...");
      setProgress(30);

      // STEP 2 — Wait for editing
      setStatus("editing");
      setProgressLabel("AI is editing your video...");
      addLog("🤖 Analysing prompt: " + prompt);
      setProgress(50);

      // Poll for job status
      let done = false;
      let attempts = 0;
      while (!done && attempts < 30) {
        await new Promise((r) => setTimeout(r, 2000));
        attempts++;

        const statusRes = await fetch(
          `/api/generate/status/${fetchData.job_id}`
        );
        const statusData = await statusRes.json();

        if (statusData.status === "applying_effects") {
          addLog("🎨 Applying effects: " + effects.join(", "));
          setProgress(60);
        }
        if (statusData.status === "rendering") {
          addLog("🎬 Rendering final video...");
          setProgressLabel("Rendering...");
          setProgress(80);
        }
        if (statusData.status === "done") {
          setProgress(100);
          setProgressLabel("Done!");
          addLog("✅ Video ready!");
          setResultVideo(statusData.video_url);
          done = true;
        }
        if (statusData.status === "error") {
          throw new Error(statusData.message || "Processing failed");
        }
      }

      if (!done) throw new Error("Timeout — took too long");
      setStatus("done");
    } catch (err) {
      addLog("❌ Error: " + err.message);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-cyan-400">
          🚀 AI Video Generator
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Type a topic → AI fetches from YouTube → Edits it → Ready to post
        </p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* LEFT — Controls */}
        <div className="space-y-6">
          {/* Topic Input */}
          <div>
            <label className="text-gray-400 text-sm block mb-2 font-medium">
              🔍 Topic to search on YouTube
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. crypto news, AI trends, fitness tips..."
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500 placeholder-gray-600"
            />
          </div>

          {/* Prompt Input */}
          <div>
            <label className="text-gray-400 text-sm block mb-2 font-medium">
              ✍️ How should AI edit it?
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Add bold captions, make it viral, speed up slow parts, add trending music..."
              rows={4}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm resize-none focus:outline-none focus:border-cyan-500 placeholder-gray-600"
            />
            {/* Suggestions */}
            <div className="mt-2 space-y-1">
              {EDIT_SUGGESTIONS.map((s, i) => (
                <p
                  key={i}
                  onClick={() => setPrompt(s)}
                  className="text-xs text-gray-600 hover:text-cyan-400 cursor-pointer transition-colors"
                >
                  → {s}
                </p>
              ))}
            </div>
          </div>

          {/* Effects */}
          <div>
            <label className="text-gray-400 text-sm block mb-3 font-medium">
              ⚙️ Effects
            </label>
            <div className="grid grid-cols-3 gap-2">
              {EFFECTS.map((ef) => (
                <div
                  key={ef.id}
                  onClick={() => toggleEffect(ef.id)}
                  className={`p-3 rounded-xl border cursor-pointer text-center transition-all ${
                    effects.includes(ef.id)
                      ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                      : "border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-500"
                  }`}
                >
                  <p className="text-xs font-semibold">{ef.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="text-gray-400 text-sm block mb-3 font-medium">
              ⏱️ Output Duration
            </label>
            <div className="flex gap-3">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`flex-1 py-2 rounded-xl border text-sm font-semibold transition-all ${
                    duration === d
                      ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                      : "border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-500"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={
              !topic || !prompt || status === "fetching" || status === "editing"
            }
            className="w-full py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500"
          >
            {status === "fetching" && "🔍 Fetching from YouTube..."}
            {status === "editing" && "🤖 AI Editing..."}
            {(status === "idle" || status === "done" || status === "error") &&
              "🚀 Generate Video"}
          </button>
        </div>

        {/* RIGHT — Output */}
        <div className="space-y-6">
          {/* Progress */}
          {(status === "fetching" || status === "editing") && (
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <div className="flex justify-between mb-3">
                <p className="text-sm font-semibold text-gray-300">
                  {progressLabel}
                </p>
                <p className="text-cyan-400 font-bold">{progress}%</p>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-3 mb-4">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {/* Live Logs */}
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {logs.map((log, i) => (
                  <p key={i} className="text-xs text-gray-500 font-mono">
                    {log}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {status === "error" && (
            <div className="bg-red-900/20 rounded-2xl p-6 border border-red-800">
              <p className="text-red-400 font-bold mb-2">
                ❌ Something went wrong
              </p>
              <div className="space-y-1">
                {logs.map((log, i) => (
                  <p key={i} className="text-xs text-gray-500 font-mono">
                    {log}
                  </p>
                ))}
              </div>
              <button
                onClick={() => setStatus("idle")}
                className="mt-4 w-full py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Result Video */}
          {status === "done" && resultVideo && (
            <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
              <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                <p className="text-sm font-semibold text-green-400">
                  ✅ Video Ready!
                </p>
                <span className="text-xs text-gray-500">{duration}</span>
              </div>
              <video
                src={resultVideo}
                controls
                className="w-full max-h-72 bg-black object-contain"
              />
              <div className="p-4 space-y-3">
                <div className="text-xs text-gray-500 space-y-1">
                  <p>
                    🔍 Topic: <span className="text-white">{topic}</span>
                  </p>
                  <p>
                    ✍️ Prompt: <span className="text-white">{prompt}</span>
                  </p>
                  <p>
                    ⚙️ Effects:{" "}
                    <span className="text-white">{effects.join(", ")}</span>
                  </p>
                </div>
                <button className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-semibold text-sm">
                  📤 Send to Review Queue
                </button>
              </div>
            </div>
          )}

          {/* Idle state */}
          {status === "idle" && (
            <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 text-center">
              <p className="text-5xl mb-4">🎬</p>
              <p className="text-gray-400 font-semibold">How it works</p>
              <div className="mt-4 space-y-3 text-left">
                {[
                  "1️⃣ Type a topic — AI searches YouTube",
                  "2️⃣ Best matching video is downloaded",
                  "3️⃣ Your prompt tells AI how to edit",
                  "4️⃣ Effects applied automatically",
                  "5️⃣ Final video ready to post",
                ].map((step, i) => (
                  <p key={i} className="text-sm text-gray-500">
                    {step}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
