import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

const PIPELINE_STEPS = [
  { key: "trend", label: "🔍 Trend Hunt" },
  { key: "script", label: "✍️ AI Script" },
  { key: "voice", label: "🎙️ Voiceover" },
  { key: "visuals", label: "🖼️ Visuals" },
  { key: "edit", label: "✂️ Editing" },
  { key: "queue", label: "📋 Review Queue" },
];

export default function Dashboard() {
  const [feed, setFeed] = useState([]);
  const [pipelineJobs, setPipelineJobs] = useState([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws");
    ws.onmessage = (e) => {
      try {
        const job = JSON.parse(e.data);
        setFeed((prev) => [job, ...prev.slice(0, 9)]);
        if (job.steps) {
          setPipelineJobs((prev) => {
            const exists = prev.find((j) => j.id === job.id);
            if (exists) return prev.map((j) => (j.id === job.id ? job : j));
            return [job, ...prev.slice(0, 4)];
          });
        }
      } catch {}
    };
    return () => ws.close();
  }, []);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: () => fetch("/api/stats").then((r) => r.json()),
    refetchInterval: 5_000,
  });

  const { data: queueData = [] } = useQuery({
    queryKey: ["queue"],
    queryFn: () => fetch("/api/queue").then((r) => r.json()),
    refetchInterval: 5_000,
  });

  return (
    <div
      style={{
        padding: "28px 32px",
        minHeight: "100vh",
        background: "#ffffff",
        fontFamily: "'Syne', sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#111111" }}>
            Dashboard
          </h1>
          <span
            style={{
              background: "#e6fff5",
              border: "1px solid #b6f0d9",
              borderRadius: 20,
              padding: "3px 10px",
              fontSize: 11,
              color: "#00a86b",
              fontWeight: 600,
            }}
          >
            ● LIVE
          </span>
        </div>
        <p style={{ color: "#666666", fontSize: 14 }}>
          Your ReelForge AI pipeline at a glance — refreshes every 5s
        </p>
      </div>

      {/* Stat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 14,
          marginBottom: 24,
        }}
      >
        {[
          { key: "total", label: "Generated", color: "#2563eb" },
          { key: "pending", label: "Pending", color: "#f59e0b" },
          { key: "published", label: "Published", color: "#10b981" },
          { key: "failed", label: "Failed", color: "#ef4444" },
        ].map((s) => (
          <div
            key={s.key}
            style={{
              background: "#ffffff",
              border: "1px solid #e5e5e5",
              borderRadius: 12,
              padding: "20px",
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: "#666666",
                letterSpacing: "1.5px",
                marginBottom: 8,
              }}
            >
              {s.label.toUpperCase()}
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: s.color }}>
              {isLoading ? "…" : stats?.[s.key] ?? "0"}
            </div>
          </div>
        ))}
      </div>

      {/* Pipeline */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5e5e5",
          borderRadius: 12,
          padding: "20px",
          marginBottom: 16,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: "#111111" }}>
          📋 Pipeline Progress
        </span>

        {queueData.length === 0 && pipelineJobs.length === 0 ? (
          <p style={{ color: "#666666", fontSize: 13 }}>
            No pipeline running. Trigger from Settings!
          </p>
        ) : (
          [...pipelineJobs, ...queueData].slice(0, 3).map((job) => (
            <div
              key={job.id}
              style={{
                background: "#f9f9f9",
                border: "1px solid #e5e5e5",
                borderRadius: 10,
                padding: "16px",
                marginTop: 12,
              }}
            >
              {PIPELINE_STEPS.map((step) => (
                <div
                  key={step.key}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "6px 0",
                  }}
                >
                  <span style={{ fontSize: 12, color: "#444444" }}>
                    {step.label}
                  </span>
                  <span style={{ fontSize: 11, color: "#10b981" }}>✓</span>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Activity */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5e5e5",
          borderRadius: 12,
          padding: "20px",
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: "#111111" }}>
          Live Activity
        </span>

        {feed.length === 0 ? (
          <p style={{ color: "#666666", fontSize: 13 }}>
            Waiting for pipeline events…
          </p>
        ) : (
          feed.map((j, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: "1px solid #eee",
              }}
            >
              <span style={{ fontSize: 12, color: "#444444" }}>
                {j.title || j.id}
              </span>
              <span style={{ fontSize: 11, color: "#10b981" }}>{j.status}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
