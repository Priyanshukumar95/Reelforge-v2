import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const api = (path, opts) => fetch(`/api${path}`, opts).then((r) => r.json());

export default function Queue() {
  const qc = useQueryClient();

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["queue"],
    queryFn: () => api("/queue"),
    refetchInterval: 5_000,
  });

  const approve = useMutation({
    mutationFn: (id) => api(`/jobs/${id}/approve`, { method: "POST" }),
    onSuccess: () => qc.invalidateQueries(["queue"]),
  });

  const reject = useMutation({
    mutationFn: (id) => api(`/jobs/${id}/reject`, { method: "POST" }),
    onSuccess: () => qc.invalidateQueries(["queue"]),
  });

  if (isLoading)
    return <div style={{ padding: 32, color: "#666" }}>Loading queue…</div>;

  if (jobs.length === 0)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Syne', sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 64, marginBottom: 16 }}>🎬</p>
          <p style={{ color: "#444", fontSize: 18 }}>
            No reels awaiting review
          </p>
          <p style={{ color: "#888", fontSize: 13, marginTop: 8 }}>
            Trigger the pipeline from Settings
          </p>
        </div>
      </div>
    );

  return (
    <div
      style={{
        padding: "28px 32px",
        minHeight: "100vh",
        background: "#ffffff",
        fontFamily: "'Syne', sans-serif",
      }}
    >
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: "#111111",
            letterSpacing: "-0.5px",
          }}
        >
          🎬 Review Queue
        </h1>
        <p style={{ color: "#666", fontSize: 14, marginTop: 4 }}>
          {jobs.length} reel{jobs.length !== 1 ? "s" : ""} awaiting review
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {jobs.map((job) => (
          <div
            key={job.id}
            style={{
              background: "#ffffff",
              border: "1px solid #e5e5e5",
              borderRadius: 12,
              padding: 20,
              display: "flex",
              alignItems: "center",
              gap: 20,
            }}
          >
            {/* Video Player */}
            <video
              src={
                job.video_url || job.video
                  ? `http://localhost:8000/outputs/${job.video}`
                  : "http://localhost:8000/outputs/test.mp4"
              }
              controls
              style={{
                width: 100,
                height: 160,
                borderRadius: 10,
                objectFit: "cover",
                background: "#000",
                flexShrink: 0,
              }}
            />

            {/* Job Details */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontWeight: 700,
                  color: "#111111",
                  fontSize: 15,
                  marginBottom: 6,
                }}
              >
                {job.script?.hook || job.script?.trend?.title || job.id}
              </p>
              <p style={{ color: "#555", fontSize: 13, marginBottom: 6 }}>
                {job.script?.body}
              </p>
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  marginTop: 8,
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    color: "#888",
                    fontFamily: "monospace",
                  }}
                >
                  ID: {job.id}
                </span>
                <span style={{ fontSize: 11, color: "#f59e0b" }}>
                  {job.status}
                </span>
                {job.script?.caption && (
                  <span style={{ fontSize: 11, color: "#2563eb" }}>
                    {job.script.caption}
                  </span>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                flexShrink: 0,
              }}
            >
              <button
                onClick={() => approve.mutate(job.id)}
                disabled={approve.isPending}
                style={{
                  background: "#22c55e",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 22px",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                  opacity: approve.isPending ? 0.5 : 1,
                }}
              >
                ✓ Approve
              </button>
              <button
                onClick={() => reject.mutate(job.id)}
                disabled={reject.isPending}
                style={{
                  background: "transparent",
                  color: "#ef4444",
                  border: "1px solid #ef444450",
                  borderRadius: 8,
                  padding: "10px 22px",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                  opacity: reject.isPending ? 0.5 : 1,
                }}
              >
                ✗ Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
