import React, { useState } from "react";
import "./Feature1.css";
import html2canvas from "html2canvas";

/* -------------------- PRESET COLOR THEMES (by Career) -------------------- */
const COLOR_PRESETS = [
  { 
    name: "Tech Developer", 
    primary: "#0D1B2A", 
    secondary: "#1B4965", 
    accent: "#00D9FF",
    bodyBg: "#FFFFFF" 
  },
  { 
    name: "Creative Designer", 
    primary: "#FF006E", 
    secondary: "#8338EC", 
    accent: "#FFBE0B",
    bodyBg: "#FFFFFF" 
  },
  { 
    name: "Business Professional", 
    primary: "#003366", 
    secondary: "#0066CC", 
    accent: "#FFD700",
    bodyBg: "#FFFFFF" 
  },
  { 
    name: "Startup Founder", 
    primary: "#6A11CB", 
    secondary: "#2575FC", 
    accent: "#FF006E",
    bodyBg: "#FFFFFF" 
  },
];

/* -------------------- RANDOM COLOR GENERATOR -------------------- */
const niceColors = [
  ["#6A11CB", "#2575FC"],
  ["#FF7B54", "#FFB26B"],
  ["#00C896", "#00E0B5"],
  ["#0077BE", "#00C6FF"],
  ["#F72585", "#7209B7"],
  ["#FF006E", "#8338EC"],
  ["#06D6A0", "#118AB2"],
];

function randomPalette() {
  const pick = niceColors[Math.floor(Math.random() * niceColors.length)];
  return {
    primary: pick[0],
    secondary: pick[1],
    accent: "#FF006E",
    bodyBg: "#ffffff",
  };
}

export default function Feature1() {
  /* =============== STATE =============== */
  const [primary, setPrimary] = useState("#6A11CB");
  const [secondary, setSecondary] = useState("#2575FC");
  const [accent, setAccent] = useState("#FF006E");
  const [bodyBg, setBodyBg] = useState("#FFFFFF");

  const [fontFamily, setFontFamily] = useState("system");
  const [fontSize, setFontSize] = useState(16);
  const [spacing, setSpacing] = useState(28);
  const [radius, setRadius] = useState(20);

  const [shadowBlur, setShadowBlur] = useState(24);
  const [shadowOpacity, setShadowOpacity] = useState(0.32);

  const [savedThemes, setSavedThemes] = useState(
    JSON.parse(localStorage.getItem("themes_v1") || "[]")
  );

  /* ================= RANDOM COLOR ================= */
  const randomColors = () => {
    const p = randomPalette();
    setPrimary(p.primary);
    setSecondary(p.secondary);
    setAccent(p.accent);
    setBodyBg(p.bodyBg);
  };

  /* ================= SAVE THEME ================= */
  const saveTheme = () => {
    const theme = { primary, secondary, accent, bodyBg };
    const newList = [...savedThemes, theme];
    setSavedThemes(newList);
    localStorage.setItem("themes_v1", JSON.stringify(newList));
  };

  /* ================= EXPORT PNG ================= */
  const exportPNG = () => {
    const node = document.getElementById("profileCard");

    html2canvas(node, { scale: 2 }).then((canvas) => {
      const link = document.createElement("a");
      link.download = "profile-preview.png";
      link.href = canvas.toDataURL();
      link.click();
    });
  };

  /* ===================== JSX ===================== */
  return (
    <div className="feature1-container">
      {/* ---------------- LEFT SIDEBAR ---------------- */}
      <aside className="sidebar2">

        {/* PRESETS */}
        <div className="card">
          <div className="card-title">🎨 Career Presets</div>
          <div className="preset-list">
            {COLOR_PRESETS.map((p) => (
              <button
                key={p.name}
                className="preset-button"
                onClick={() => {
                  setPrimary(p.primary);
                  setSecondary(p.secondary);
                  setAccent(p.accent);
                  setBodyBg(p.bodyBg);
                }}
              >
                <div className="preset-name">{p.name}</div>
                <div className="preset-colors">
                  <span style={{ background: p.primary }} />
                  <span style={{ background: p.secondary }} />
                  <span style={{ background: p.accent }} />
                </div>
              </button>
            ))}
          </div>

          <button className="btn random" onClick={randomColors}>
            🎲 Random Colors
          </button>
        </div>

        {/* SAVED THEMES */}
        {savedThemes.length > 0 && (
          <div className="card">
            <div className="card-title">📌 Saved Themes</div>
            <div className="saved-themes">
              {savedThemes.map((t, i) => (
                <button
                  key={i}
                  className="saved-item"
                  onClick={() => {
                    setPrimary(t.primary);
                    setSecondary(t.secondary);
                    setAccent(t.accent);
                    setBodyBg(t.bodyBg);
                  }}
                >
                  <span style={{ background: t.primary }} />
                  <span style={{ background: t.secondary }} />
                  <span style={{ background: t.accent }} />
                </button>
              ))}
            </div>
          </div>
        )}

        <button className="btn save-theme" onClick={saveTheme}>
          💾 Save Theme
        </button>

        {/* COLOR PICKERS */}
        <div className="card">
          <div className="card-title">🎯 Color Customization</div>

          <label>Primary Color</label>
          <input
            type="color"
            value={primary}
            onChange={(e) => setPrimary(e.target.value)}
          />

          <label>Secondary Color</label>
          <input
            type="color"
            value={secondary}
            onChange={(e) => setSecondary(e.target.value)}
          />

          <label>Accent Color</label>
          <input
            type="color"
            value={accent}
            onChange={(e) => setAccent(e.target.value)}
          />

          <label>Background Color</label>
          <input
            type="color"
            value={bodyBg}
            onChange={(e) => setBodyBg(e.target.value)}
          />
        </div>

        {/* FONT + SPACING */}
        <div className="card">
          <div className="card-title">📝 Typography</div>

          <label>Font Family</label>
          <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
            <option value="system">System</option>
            <option value="serif">Serif</option>
            <option value="mono">Monospace</option>
          </select>

          <label>Font Size ({fontSize}px)</label>
          <input
            type="range"
            min="14"
            max="22"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
          />

          <label>Spacing ({spacing}px)</label>
          <input
            type="range"
            min="12"
            max="48"
            value={spacing}
            onChange={(e) => setSpacing(Number(e.target.value))}
          />

          <label>Corner Radius ({radius}px)</label>
          <input
            type="range"
            min="0"
            max="32"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
          />
        </div>

        {/* EFFECTS */}
        <div className="card">
          <div className="card-title">✨ Effects</div>

          <label>Shadow Blur ({shadowBlur}px)</label>
          <input
            type="range"
            min="0"
            max="40"
            value={shadowBlur}
            onChange={(e) => setShadowBlur(Number(e.target.value))}
          />

          <label>Shadow Opacity ({Math.round(shadowOpacity * 100)}%)</label>
          <input
            type="range"
            min="0.1"
            max="0.5"
            step="0.01"
            value={shadowOpacity}
            onChange={(e) => setShadowOpacity(Number(e.target.value))}
          />
        </div>

      </aside>

      {/* ---------------- RIGHT PREVIEW ---------------- */}
      <div className="preview-area">
        <div className="preview-header">
          <div className="preview-title">👁️ Live Preview</div>

          <button className="btn export" onClick={exportPNG}>
            📦 Export PNG
          </button>
        </div>

        <div
          id="profileCard"
          className="preview-card"
          style={{
            borderRadius: radius,
            boxShadow: `0 ${shadowBlur}px ${shadowBlur * 1.8}px rgba(0,0,0,${shadowOpacity})`,
            background: bodyBg,
            fontFamily:
              fontFamily === "system"
                ? "Inter, sans-serif"
                : fontFamily === "serif"
                ? "Georgia, serif"
                : "JetBrains Mono, monospace",
            fontSize: fontSize,
          }}
        >
          <div
            className="preview-header-bar"
            style={{
              background: `linear-gradient(45deg, ${primary}, ${secondary})`,
              borderRadius: `${radius}px ${radius}px 0 0`,
            }}
          >
            <h2 style={{ color: "#FFFFFF" }}>Rachapoom</h2>
            <p className="subtitle" style={{ color: "#FFFFFF" }}>Your Professional Title</p>
            <p className="bio" style={{ color: "#FFFFFF" }}>
              Your professional bio goes here - Click Edit Profile to add your information
            </p>
          </div>

          <div className="preview-body" style={{ padding: spacing }}>
            <h3 style={{ color: primary }}>Work Experience</h3>
            <p>Senior Software Engineer @ Tech Giants Inc.</p>
            <p>Led cloud microservice architecture.</p>

            <h3 style={{ color: primary }}>Skills</h3>
            <div className="tags">
              <span style={{ background: accent, color: "#FFFFFF" }}>JavaScript</span>
              <span style={{ background: accent, color: "#FFFFFF" }}>React</span>
              <span style={{ background: accent, color: "#FFFFFF" }}>Node.js</span>
              <span style={{ background: accent, color: "#FFFFFF" }}>AWS</span>
            </div>

            <h3 style={{ color: primary }}>Education</h3>
            <p>M.S. Computer Science – Stanford University</p>
          </div>
        </div>
      </div>
    </div>
  );
}