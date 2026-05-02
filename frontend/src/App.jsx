import { useState, useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import Queue from "./pages/Queue";
import Editor from "./pages/Editor";
import Settings from "./pages/Settings";
import Generate from "./pages/Generate";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "⬡" },
  { id: "queue", label: "Queue", icon: "▦" },
  { id: "editor", label: "Editor", icon: "◈" },
  { id: "settings", label: "Settings", icon: "⊛" },
  { id: "generate", label: "Generate", icon: "🚀" },
];

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const pages = {
    dashboard: <Dashboard />,
    queue: <Queue />,
    editor: <Editor />,
    settings: <Settings />,
    generate: <Generate />,
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        background: "#050508",
        overflow: "hidden",
        fontFamily: "'Syne', sans-serif",
      }}
    >
      <aside
        style={{
          width: "220px",
          flexShrink: 0,
          background: "#0d0d14",
          borderRight: "1px solid rgba(120,80,255,0.12)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -40,
            left: -40,
            width: 160,
            height: 160,
            background:
              "radial-gradient(circle, rgba(124,77,255,0.15) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            padding: "24px 20px 20px",
            borderBottom: "1px solid rgba(120,80,255,0.12)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "linear-gradient(135deg, #7c4dff, #00d4ff)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                fontWeight: 700,
                color: "#fff",
                boxShadow: "0 0 20px rgba(124,77,255,0.4)",
              }}
            >
              R
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#f0eeff" }}>
                ReelForge
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: "#6b6b8a",
                  letterSpacing: "2px",
                  marginTop: 1,
                }}
              >
                AI STUDIO
              </div>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: "16px 12px" }}>
          {NAV.map((n) => {
            const active = page === n.id;
            return (
              <button
                key={n.id}
                onClick={() => setPage(n.id)}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "rgba(124,77,255,0.06)";
                    e.currentTarget.style.borderColor = "rgba(124,77,255,0.2)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.borderColor = "transparent";
                  }
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "11px 14px",
                  borderRadius: 8,
                  marginBottom: 4,
                  border: active
                    ? "1px solid rgba(124,77,255,0.35)"
                    : "1px solid transparent",
                  background: active ? "rgba(124,77,255,0.12)" : "transparent",
                  cursor: "pointer",
                  textAlign: "left",
                  position: "relative",
                  boxShadow: active ? "0 0 20px rgba(124,77,255,0.2)" : "none",
                  transition: "all 0.2s",
                }}
              >
                {active && (
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: "20%",
                      height: "60%",
                      width: 3,
                      background: "#7c4dff",
                      borderRadius: "0 3px 3px 0",
                    }}
                  />
                )}
                <span
                  style={{
                    fontSize: 16,
                    opacity: active ? 1 : 0.5,
                    color: active ? "#a78bfa" : "#9898b8",
                  }}
                >
                  {n.icon}
                </span>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: active ? 600 : 400,
                    color: active ? "#a78bfa" : "#9898b8",
                  }}
                >
                  {n.label}
                </span>
                {n.id === "queue" && (
                  <span
                    style={{
                      marginLeft: "auto",
                      background: "#7c4dff",
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: 700,
                      borderRadius: 10,
                      padding: "1px 7px",
                    }}
                  >
                    7
                  </span>
                )}
                {n.id === "dashboard" && (
                  <span
                    style={{
                      marginLeft: "auto",
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#00e5a0",
                      boxShadow: "0 0 8px #00e5a0",
                    }}
                  />
                )}
              </button>
            );
          })}
        </nav>
        <div
          style={{
            padding: "16px 20px",
            borderTop: "1px solid rgba(120,80,255,0.12)",
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "#6b6b8a",
              fontFamily: "monospace",
              marginBottom: 8,
            }}
          >
            {time.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              background: "rgba(0,229,160,0.08)",
              border: "1px solid rgba(0,229,160,0.2)",
              borderRadius: 6,
              padding: "6px 10px",
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#00e5a0",
                boxShadow: "0 0 8px #00e5a0",
              }}
            />
            <span style={{ fontSize: 11, color: "#00e5a0", fontWeight: 500 }}>
              All Systems Online
            </span>
          </div>
        </div>
      </aside>
      <main
        style={{
          flex: 1,
          overflow: "auto",
          background: "#050508",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {pages[page]}
      </main>
    </div>
  );
}
