import React, { useState, useRef } from "react";
import "./Feature1.css";
import html2canvas from "html2canvas";

/* -------------------- PRESET COLOR THEMES -------------------- */
const COLOR_PRESETS = [
  { name: "Default", primary: "#6A11CB", secondary: "#2575FC", headerBg: "#6A11CB", bodyBg: "#FFFFFF" },
  { name: "Ocean", primary: "#0077BE", secondary: "#00C6FF", headerBg: "#003F63", bodyBg: "#E6F7FF" },
  { name: "Warm", primary: "#FF7B54", secondary: "#FFB26B", headerBg: "#FF7B54", bodyBg: "#FFF3E2" },
  { name: "Mint", primary: "#00C896", secondary: "#00E0B5", headerBg: "#00A67E", bodyBg: "#E9FFF6" },
  { name: "Royal", primary: "#542E71", secondary: "#FB3640", headerBg: "#542E71", bodyBg: "#FFF5F7" },
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
    headerBg: pick[0],
    bodyBg: "#ffffff",
  };
}

/* -------------------- RANDOM EMOJIS -------------------- */
const EMOJIS = ["👨‍💻", "👩‍🎨", "🧑‍🚀", "🧑‍🔧", "🧑‍💼", "🦸‍♂️", "🧑‍🏫", "🧑‍🍳", "🎮", "🧠"];

export default function Feature1() {
  /* =============== STATE =============== */
  const [primary, setPrimary] = useState("#6A11CB");
  const [secondary, setSecondary] = useState("#2575FC");
  const [headerBg, setHeaderBg] = useState("#6A11CB");
  const [bodyBg, setBodyBg] = useState("#FFFFFF");

  const [fontFamily, setFontFamily] = useState("system");
  const [fontSize, setFontSize] = useState(16);
  const [spacing, setSpacing] = useState(28);
  const [radius, setRadius] = useState(20);

  const [shadowBlur, setShadowBlur] = useState(24);
  const [shadowOpacity, setShadowOpacity] = useState(0.32);

  const [avatar, setAvatar] = useState("👨‍💻");
  const fileRef = useRef(null);

  const [savedThemes, setSavedThemes] = useState(
    JSON.parse(localStorage.getItem("themes_v1") || "[]")
  );

  /* ================= RANDOM COLOR ================= */
  const randomColors = () => {
    const p = randomPalette();
    setPrimary(p.primary);
    setSecondary(p.secondary);
    setHeaderBg(p.headerBg);
    setBodyBg(p.bodyBg);
  };

  /* ================= SAVE THEME ================= */
  const saveTheme = () => {
    const theme = { primary, secondary, headerBg, bodyBg };
    const newList = [...savedThemes, theme];
    setSavedThemes(newList);
    localStorage.setItem("themes_v1", JSON.stringify(newList));
  };

  /* ================= UPLOAD AVATAR ================= */
  const uploadAvatar = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const size = 64;
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, size, size);

      setAvatar(canvas.toDataURL());
    };
    img.src = URL.createObjectURL(file);
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

  /* ================= RESET ALL ================= */
  const resetAll = () => {
    setPrimary("#6A11CB");
    setSecondary("#2575FC");
    setHeaderBg("#6A11CB");
    setBodyBg("#FFFFFF");

    setFontFamily("system");
    setFontSize(16);
    setSpacing(28);
    setRadius(20);
    setShadowBlur(24);
    setShadowOpacity(0.32);

    setAvatar("👨‍💻");
  };

  /* ================= SAVE PROFILE ================= */
  const saveProfile = () => {
    const profile = {
      theme: { primary, secondary, headerBg, bodyBg },
      settings: { fontFamily, fontSize, spacing, radius, shadowBlur, shadowOpacity },
      avatar,
    };

    localStorage.setItem("profile_v1", JSON.stringify(profile));
    alert("✔️ Profile Saved!");
  };

  /* ================= BACK TO FRIEND PAGE ================= */
  const goBack = () => {
    window.location.href = "/friends"; // เปลี่ยน path ได้ตามโปรเจ็กต์มึง
  };

  /* ===================== JSX ===================== */
  return (
    <div className="feature1-container">
      
      {/* Back Button */}
      <button className="btn2 back-btn" onClick={goBack}>
        ← Back
      </button>

      {/* ---------------- LEFT SIDEBAR ---------------- */}
      <aside className="sidebar2">

        {/* PRESETS */}
        <div className="card">
          <div className="card-title">🎨 Color Presets</div>
          <div className="preset-list">
            {COLOR_PRESETS.map((p) => (
              <button
                key={p.name}
                className="preset-button"
                onClick={() => {
                  setPrimary(p.primary);
                  setSecondary(p.secondary);
                  setHeaderBg(p.headerBg);
                  setBodyBg(p.bodyBg);
                }}
              >
                <div className="preset-name">{p.name}</div>
                <div className="preset-colors">
                  <span style={{ background: p.primary }} />
                  <span style={{ background: p.secondary }} />
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
            <div className="card-title">📁 Saved Themes</div>
            <div className="saved-themes">
              {savedThemes.map((t, i) => (
                <button
                  key={i}
                  className="saved-item"
                  onClick={() => {
                    setPrimary(t.primary);
                    setSecondary(t.secondary);
                    setHeaderBg(t.headerBg);
                    setBodyBg(t.bodyBg);
                  }}
                >
                  <span style={{ background: t.primary }} />
                  <span style={{ background: t.secondary }} />
                </button>
              ))}
            </div>
          </div>
        )}

        <button className="btn save-theme" onClick={saveTheme}>
          💾 Save Theme
        </button>

        {/* FONT + SPACING */}
        <div className="card">
          <div className="card-title">🔤 Typography</div>

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

        {/* AVATAR */}
        <div className="card">
          <div className="card-title">👤 Avatar</div>

          <div className="avatar-box">
            {avatar.startsWith("data:") ? (
              <img src={avatar} alt="avatar" className="avatar-img" />
            ) : (
              <div className="avatar-emoji">{avatar}</div>
            )}
          </div>

          <button className="btn" onClick={() => setAvatar(EMOJIS[Math.floor(Math.random() * EMOJIS.length)])}>
            🔀 Random Emoji
          </button>

          <input
            type="file"
            ref={fileRef}
            accept="image/*"
            style={{ display: "none" }}
            onChange={uploadAvatar}
          />
          <button className="btn" onClick={() => fileRef.current.click()}>
            📁 Upload Avatar
          </button>
        </div>

      </aside>

      {/* ---------------- RIGHT PREVIEW ---------------- */}
      <div className="preview-area">
        <div className="preview-header">

          <div className="preview-title">👁 Live Preview</div>

          <div className="preview-actions">
            <button className="btn small" onClick={saveProfile}>⭐ Save</button>
            <button className="btn small" onClick={resetAll}>♻ Reset</button>
            <button className="btn export" onClick={exportPNG}>📦 Export PNG</button>
          </div>

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
            <div className="avatar-preview">
              {avatar.startsWith("data:") ? (
                <img src={avatar} alt="avatar" />
              ) : (
                <span>{avatar}</span>
              )}
            </div>




            <h2>Alex Johnson</h2>
            <p className="subtitle">Senior Software Engineer</p>
            <p className="bio">
              Passionate developer with 8+ years of experience building scalable
              web applications.
            </p>
          </div>

          <div className="preview-body" style={{ padding: spacing }}>
            <h3>Work Experience</h3>
            <p>Senior Software Engineer @ Tech Giants Inc.</p>
            <p>Led cloud microservice architecture.</p>

            <h3>Skills</h3>
            <div className="tags">
              <span>JavaScript</span>
              <span>React</span>
              <span>Node.js</span>
              <span>AWS</span>
            </div>

            <h3>Education</h3>
            <p>M.S. Computer Science — Stanford University</p>
          </div>
        </div>
      </div>
    </div>
  );
}