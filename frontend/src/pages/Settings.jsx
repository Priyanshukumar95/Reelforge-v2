import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export default function Settings() {
  const qc = useQueryClient();
  const [time, setTime] = useState("18:00");
  const [max, setMax] = useState("3");

  useQuery({
    queryKey: ["schedule"],
    queryFn: () => fetch("/api/schedule").then((r) => r.json()),
    onSuccess: (d) => {
      setTime(d.publish_time || "18:00");
      setMax(String(d.max_per_day || "3"));
    },
  });

  const save = useMutation({
    mutationFn: () =>
      fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publish_time: time,
          max_per_day: parseInt(max),
        }),
      }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries(["schedule"]),
  });

  const trigger = useMutation({
    mutationFn: () =>
      fetch("/api/pipeline/trigger", { method: "POST" }).then((r) => r.json()),
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
          ⚙️ Settings
        </h1>
        <p style={{ color: "#6b6b8a", fontSize: 14, marginTop: 4 }}>
          Configure publish schedule and pipeline
        </p>
      </div>

      <div
        style={{
          maxWidth: 480,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {/* Schedule */}
        <div
          style={{
            background: "#0d0d14",
            border: "1px solid rgba(120,80,255,0.12)",
            borderRadius: 12,
            padding: 24,
          }}
        >
          <p style={{ fontWeight: 600, color: "#f0eeff", marginBottom: 18 }}>
            Publish Schedule
          </p>

          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                color: "#9898b8",
                fontSize: 13,
                display: "block",
                marginBottom: 8,
              }}
            >
              Daily Publish Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              style={{
                background: "#13131e",
                border: "1px solid rgba(120,80,255,0.2)",
                borderRadius: 8,
                padding: "10px 14px",
                color: "#f0eeff",
                fontSize: 14,
                width: "100%",
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                color: "#9898b8",
                fontSize: 13,
                display: "block",
                marginBottom: 8,
              }}
            >
              Max Reels Per Day
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={max}
              onChange={(e) => setMax(e.target.value)}
              style={{
                background: "#13131e",
                border: "1px solid rgba(120,80,255,0.2)",
                borderRadius: 8,
                padding: "10px 14px",
                color: "#f0eeff",
                fontSize: 14,
                width: "100%",
              }}
            />
          </div>

          <button
            onClick={() => save.mutate()}
            disabled={save.isPending}
            style={{
              width: "100%",
              background: "#7c4dff",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "12px",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              opacity: save.isPending ? 0.5 : 1,
            }}
          >
            {save.isPending ? "Saving…" : "💾 Save Settings"}
          </button>

          {save.isSuccess && (
            <p
              style={{
                color: "#00e5a0",
                fontSize: 13,
                textAlign: "center",
                marginTop: 12,
              }}
            >
              Settings saved ✅
            </p>
          )}
        </div>

        {/* Pipeline */}
        <div
          style={{
            background: "#0d0d14",
            border: "1px solid rgba(120,80,255,0.12)",
            borderRadius: 12,
            padding: 24,
          }}
        >
          <p style={{ fontWeight: 600, color: "#f0eeff", marginBottom: 16 }}>
            Pipeline Control
          </p>
          <button
            onClick={() => trigger.mutate()}
            disabled={trigger.isPending}
            style={{
              width: "100%",
              background: "#4a0080",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "12px",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              opacity: trigger.isPending ? 0.5 : 1,
            }}
          >
            {trigger.isPending ? "Triggering…" : "▶️ Trigger Pipeline Now"}
          </button>
          {trigger.isSuccess && (
            <p
              style={{
                color: "#00e5a0",
                fontSize: 13,
                textAlign: "center",
                marginTop: 12,
              }}
            >
              Pipeline triggered ✅
            </p>
          )}
          <p style={{ color: "#6b6b8a", fontSize: 11, marginTop: 12 }}>
            This will fetch trends → generate script → create reel → add to
            review queue
          </p>
        </div>
      </div>
    </div>
  );
}
