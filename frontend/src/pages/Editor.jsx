import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function Editor() {
  const [selected, setSelected] = useState(null);

  const { data: jobs = [] } = useQuery({
    queryKey: ["queue"],
    queryFn: () => fetch("/api/queue").then((r) => r.json()),
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
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: "#f0eeff",
            letterSpacing: "-0.5px",
          }}
        >
          ✂️ Editor
        </h1>
        <p style={{ color: "#6b6b8a", fontSize: 14, marginTop: 4 }}>
          Preview and review generated reels
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}>
        {/* Left list */}
        <div>
          <p
            style={{
              fontSize: 11,
              color: "#6b6b8a",
              letterSpacing: "1.5px",
              marginBottom: 12,
            }}
          >
            REELS IN QUEUE
          </p>
          {jobs.length === 0 && (
            <p style={{ color: "#6b6b8a", fontSize: 13 }}>
              No reels in queue yet.
            </p>
          )}
          {jobs.map((job) => (
            <div
              key={job.id}
              onClick={() => setSelected(job)}
              style={{
                cursor: "pointer",
                borderRadius: 10,
                padding: "14px 16px",
                marginBottom: 10,
                border:
                  selected?.id === job.id
                    ? "1px solid #7c4dff"
                    : "1px solid rgba(120,80,255,0.12)",
                background:
                  selected?.id === job.id ? "rgba(124,77,255,0.1)" : "#0d0d14",
                transition: "all 0.15s",
              }}
            >
              <p style={{ fontSize: 13, fontWeight: 600, color: "#f0eeff" }}>
                {job.script?.trend?.title || job.id}
              </p>
              <p style={{ fontSize: 11, color: "#6b6b8a", marginTop: 4 }}>
                {job.status}
              </p>
            </div>
          ))}
        </div>

        {/* Right preview */}
        <div>
          {!selected ? (
            <div
              style={{
                height: "100%",
                minHeight: 300,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#0d0d14",
                borderRadius: 12,
                border: "1px solid rgba(120,80,255,0.12)",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 48, marginBottom: 12 }}>✂️</p>
                <p style={{ color: "#6b6b8a" }}>Select a reel to preview</p>
              </div>
            </div>
          ) : (
            <div
              style={{
                background: "#0d0d14",
                borderRadius: 12,
                padding: 24,
                border: "1px solid rgba(120,80,255,0.12)",
              }}
            >
              <h2
                style={{
                  fontWeight: 700,
                  fontSize: 16,
                  color: "#f0eeff",
                  marginBottom: 16,
                }}
              >
                {selected.script?.trend?.title}
              </h2>
              <video
                src={selected.video_url || ""}
                controls
                style={{
                  width: "100%",
                  maxHeight: 400,
                  borderRadius: 10,
                  background: "#000",
                  objectFit: "contain",
                }}
              />
              <div
                style={{
                  marginTop: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <p style={{ fontSize: 13, color: "#9898b8" }}>
                  <span style={{ color: "#7c4dff" }}>Status: </span>
                  {selected.status}
                </p>
                <p style={{ fontSize: 13, color: "#9898b8" }}>
                  <span style={{ color: "#7c4dff" }}>ID: </span>
                  {selected.id}
                </p>
                <p style={{ fontSize: 13, color: "#9898b8" }}>
                  <span style={{ color: "#7c4dff" }}>Script: </span>
                  {selected.script?.body}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
