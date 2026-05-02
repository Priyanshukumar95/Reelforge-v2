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
        background: "#050508",
        fontFamily: "'Syne', sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 4,
          }}
        >
          <h1
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: "#f0eeff",
              letterSpacing: "-0.5px",
            }}
          >
            Dashboard
          </h1>
          <span
            style={{
              background: "rgba(0,229,160,0.1)",
              border: "1px solid rgba(0,229,160,0.25)",
              borderRadius: 20,
              padding: "3px 10px",
              fontSize: 11,
              color: "#00e5a0",
              fontWeight: 600,
            }}
          >
            ● LIVE
          </span>
        </div>
        <p style={{ color: "#6b6b8a", fontSize: 14 }}>
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
          { key: "total", label: "Generated", color: "#00d4ff" },
          { key: "pending", label: "Pending", color: "#ffb300" },
          { key: "published", label: "Published", color: "#00e5a0" },
          { key: "failed", label: "Failed", color: "#ff4d6d" },
        ].map((s) => (
          <div
            key={s.key}
            style={{
              background: "#0d0d14",
              border: "1px solid rgba(120,80,255,0.12)",
              borderRadius: 12,
              padding: "20px",
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: "#6b6b8a",
                letterSpacing: "1.5px",
                fontWeight: 500,
                marginBottom: 8,
              }}
            >
              {s.label.toUpperCase()}
            </div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: s.color,
                lineHeight: 1,
              }}
            >
              {isLoading ? "…" : stats?.[s.key] ?? "0"}
            </div>
          </div>
        ))}
      </div>

      {/* Pipeline Progress */}
      <div
        style={{
          background: "#0d0d14",
          border: "1px solid rgba(120,80,255,0.12)",
          borderRadius: 12,
          padding: "20px",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 18,
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 600, color: "#f0eeff" }}>
            📋 Pipeline Progress
          </span>
          <span style={{ fontSize: 11, color: "#6b6b8a" }}>polls every 5s</span>
        </div>

        {queueData.length === 0 && pipelineJobs.length === 0 ? (
          <p style={{ color: "#6b6b8a", fontSize: 13 }}>
            No pipeline running. Trigger from Settings!
          </p>
        ) : (
          [...pipelineJobs, ...queueData].slice(0, 3).map((job) => (
            <div
              key={job.id}
              style={{
                background: "#13131e",
                border: "1px solid rgba(0,229,160,0.2)",
                borderRadius: 10,
                padding: "16px",
                marginBottom: 12,
              }}
            >
              {/* Job Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: "#a78bfa",
                    fontFamily: "monospace",
                  }}
                >
                  #{job.id?.slice(0, 8)}
                </span>
                <span
                  style={{
                    background: "rgba(0,229,160,0.1)",
                    border: "1px solid rgba(0,229,160,0.3)",
                    borderRadius: 6,
                    padding: "2px 10px",
                    fontSize: 11,
                    color: "#00e5a0",
                    fontWeight: 600,
                  }}
                >
                  ✓ DONE
                </span>
              </div>

              {/* Progress Bar */}
              <div
                style={{
                  height: 4,
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: 2,
                  marginBottom: 14,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: "100%",
                    background: "linear-gradient(90deg, #7c4dff, #00e5a0)",
                    borderRadius: 2,
                  }}
                />
              </div>

              {/* Steps */}
              {PIPELINE_STEPS.map((step) => (
                <div
                  key={step.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "6px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.03)",
                  }}
                >
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 3,
                      background: "rgba(0,229,160,0.2)",
                      border: "1px solid rgba(0,229,160,0.4)",
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: 12, color: "#9898b8", flex: 1 }}>
                    {step.label}
                  </span>
                  <span style={{ fontSize: 11, color: "#00e5a0" }}>✓</span>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Live Activity Feed */}
      <div
        style={{
          background: "#0d0d14",
          border: "1px solid rgba(120,80,255,0.12)",
          borderRadius: 12,
          padding: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 18,
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 600, color: "#f0eeff" }}>
            Live Activity
          </span>
          <span
            style={{
              background: "rgba(124,77,255,0.12)",
              border: "1px solid rgba(124,77,255,0.25)",
              borderRadius: 6,
              padding: "3px 10px",
              fontSize: 11,
              color: "#a78bfa",
            }}
          >
            Live
          </span>
        </div>
        {feed.length === 0 ? (
          <p style={{ color: "#6b6b8a", fontSize: 13 }}>
            Waiting for pipeline events…
          </p>
        ) : (
          feed.map((j, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 8px",
                borderBottom:
                  i < feed.length - 1
                    ? "1px solid rgba(255,255,255,0.04)"
                    : "none",
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#00e5a0",
                  boxShadow: "0 0 8px #00e5a0",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  flex: 1,
                  fontSize: 12,
                  color: "#9898b8",
                  fontFamily: "monospace",
                }}
              >
                {j.title || j.id}
              </span>
              <span
                style={{
                  fontSize: 11,
                  padding: "2px 8px",
                  borderRadius: 5,
                  fontWeight: 500,
                  background: "#00e5a020",
                  border: "1px solid #00e5a050",
                  color: "#00e5a0",
                }}
              >
                {j.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
