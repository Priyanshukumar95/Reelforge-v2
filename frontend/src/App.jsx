import { useState, useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import Queue from "./pages/Queue";
import Editor from "./pages/Editor";
import Settings from "./pages/Settings";
import Generate from "./pages/Generate";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "⚡" },
  { id: "queue", label: "Queue", icon: "🎬", badge: 7 },
  { id: "editor", label: "Editor", icon: "✂️" },
  { id: "generate", label: "Generate", icon: "🚀" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
        background: "#ffffff",
        overflow: "hidden",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ── SIDEBAR ── */}
      <aside
        style={{
          width: sidebarOpen ? "220px" : "0px",
          flexShrink: 0,
          background: "#ffffff",
          borderRight: sidebarOpen ? "1px solid #e0e0e0" : "none",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          transition: "width 0.25s ease",
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "18px 16px",
            borderBottom: "1px solid #e0e0e0",
            minWidth: "220px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: "linear-gradient(135deg, #6d28d9, #2563eb)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 800,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            R
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#111111" }}>
              ReelForge
            </div>
            <div
              style={{ fontSize: 9, color: "#999999", letterSpacing: "1.5px" }}
            >
              AI STUDIO
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: "10px 8px", minWidth: "220px" }}>
          {NAV.map((item) => {
            const isActive = page === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = "#f0f0f0";
                }}
                onMouseLeave={(e) => {
                  if (!isActive)
                    e.currentTarget.style.background = "transparent";
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 12px",
                  borderRadius: 7,
                  border: "none",
                  background: isActive ? "#f5f5f5" : "transparent",
                  cursor: "pointer",
                  textAlign: "left",
                  position: "relative",
                  transition: "all 0.15s",
                  marginBottom: 2,
                }}
              >
                {/* Active left bar */}
                {isActive && (
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: "15%",
                      height: "70%",
                      width: 2.5,
                      background: "#ffffff",
                      borderRadius: "0 2px 2px 0",
                    }}
                  />
                )}

                <span style={{ fontSize: 15, flexShrink: 0 }}>{item.icon}</span>

                <span
                  style={{
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? "#111111" : "#666666",
                    flex: 1,
                  }}
                >
                  {item.label}
                </span>

                {item.badge && (
                  <span
                    style={{
                      background: "#ebebeb",
                      color: "#555555",
                      fontSize: 10,
                      fontWeight: 600,
                      borderRadius: 8,
                      padding: "1px 6px",
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div
          style={{
            padding: "10px 8px",
            borderTop: "1px solid #e0e0e0",
            minWidth: "220px",
          }}
        >
          {/* Clock */}
          <div
            style={{
              fontSize: 11,
              color: "#aaaaaa",
              fontFamily: "monospace",
              padding: "4px 12px",
              marginBottom: 8,
            }}
          >
            {time.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </div>

          {/* Online status */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              background: "#f5faf5",
              border: "1px solid #d1ead1",
              borderRadius: 7,
              padding: "7px 10px",
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#22c55e",
                boxShadow: "0 0 6px #22c55e",
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 11, color: "#555555", fontWeight: 500 }}>
              All Systems Online
            </span>
          </div>
        </div>
      </aside>

      {/* ── MAIN AREA ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* TOP BAR */}
        <div
          style={{
            height: "52px",
            background: "#ffffff",
            borderBottom: "1px solid #e0e0e0",
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            gap: 14,
            flexShrink: 0,
          }}
        >
          {/* Hamburger */}
          <button
            onClick={() => setSidebarOpen((prev) => !prev)}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f0f0")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "6px 8px",
              borderRadius: 6,
              fontSize: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.15s",
              color: "#888888",
            }}
          >
            ☰
          </button>

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                background: "linear-gradient(135deg, #6d28d9, #2563eb)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 800,
                color: "#fff",
              }}
            >
              R
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#111111" }}>
              ReelForge AI
            </span>
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 20, background: "#e0e0e0" }} />

          {/* Current page name */}
          <span
            style={{
              fontSize: 13,
              color: "#888888",
              textTransform: "capitalize",
            }}
          >
            {page}
          </span>
        </div>

        {/* Page Content */}
        <main
          style={{
            flex: 1,
            overflow: "auto",
            background: "#f5f5f5",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          {pages[page]}
        </main>
      </div>
    </div>
  );
}
