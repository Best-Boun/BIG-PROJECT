import React, { useState, useRef } from "react";
import "./Feature1.css";
import html2canvas from "html2canvas";

/* -------------------- PRESET COLOR THEMES -------------------- */
const COLOR_PRESETS = [
  { name: "Default", primary: "#6A11CB", secondary: "#2575FC", bodyBg: "#FFFFFF" },
  { name: "Ocean", primary: "#0077BE", secondary: "#00C6FF", bodyBg: "#E6F7FF" },
  { name: "Warm", primary: "#FF7B54", secondary: "#FFB26B", bodyBg: "#FFF3E2" },
  { name: "Mint", primary: "#00C896", secondary: "#00E0B5", bodyBg: "#E9FFF6" },
  { name: "Royal", primary: "#542E71", secondary: "#FB3640", bodyBg: "#FFF5F7" },
];

/* -------------------- RANDOM COVER PRESETS -------------------- */
const COVER_PRESETS = [
  "https://images.unsplash.com/photo-1503264116251-35a269479413?w=1200",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200",
  "https://images.unsplash.com/photo-1500534623283-312aade485b7?w=1200",
  "https://images.unsplash.com/photo-1495567720989-cebdbdd97913?w=1200",
  "https://images.unsplash.com/photo-1431576901776-e539bd916ba2?w=1200",
  "https://images.unsplash.com/photo-1520974679593-1a4d1cfd71c5?w=1200",
];

/* -------------------- RANDOM EMOJIS -------------------- */
const EMOJIS = ["👨‍💻","👩‍🎨","🧑‍🚀","🧑‍🔧","🧑‍💼","🦸‍♂️","🧑‍🏫","🧑‍🍳","🧠","🎮"];

/* -------------------- AUTO TEXT CONTRAST -------------------- */
function autoTextColor(hex) {
  const r = parseInt(hex.substr(1, 2), 16);
  const g = parseInt(hex.substr(3, 2), 16);
  const b = parseInt(hex.substr(5, 2), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 150 ? "#111" : "#fff";
}

export default function Feature1() {
  /* -------------------- STATE -------------------- */
  const [primary, setPrimary] = useState("#6A11CB");
  const [secondary, setSecondary] = useState("#2575FC");
  const [bodyBg, setBodyBg] = useState("#FFFFFF");

  const [layout, setLayout] = useState("classic");

  const [avatar, setAvatar] = useState("👨‍💻");
  const avatarFileRef = useRef(null);
  const [avatarSize, setAvatarSize] = useState(80);

  const [cover, setCover] = useState("");
  const coverFileRef = useRef(null);
  const [coverBlur, setCoverBlur] = useState(0);

  const [fontFamily, setFontFamily] = useState("system");
  const [fontSize, setFontSize] = useState(16);
  const [spacing, setSpacing] = useState(28);
  const [radius, setRadius] = useState(20);

  const [shadowBlur, setShadowBlur] = useState(24);
  const [shadowOpacity, setShadowOpacity] = useState(0.32);

  const [toast, setToast] = useState(false);

  /* -------------------- AVATAR UPLOAD -------------------- */
  const uploadAvatar = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = avatarSize;
      canvas.height = avatarSize;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, avatarSize, avatarSize);
      setAvatar(canvas.toDataURL());
    };
    img.src = URL.createObjectURL(f);
  };

  /* -------------------- COVER UPLOAD -------------------- */
  const uploadCover = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    const reader = new FileReader();
    reader.onload = () => setCover(reader.result);
    reader.readAsDataURL(f);
  };

  /* -------------------- EXPORT PNG -------------------- */
  const exportPNG = () => {
    const node = document.getElementById("feature1-profilePreview");
    html2canvas(node, { scale: 2 }).then((canvas) => {
      const link = document.createElement("a");
      link.download = "profile-preview.png";
      link.href = canvas.toDataURL();
      link.click();
    });
  };

  /* -------------------- SAVE / RESET -------------------- */
  const saveProfile = () => {
    setToast(true);
    setTimeout(() => setToast(false), 1500);
  };

  const resetAll = () => {
    if (!window.confirm("Reset all settings?")) return;

    setPrimary("#6A11CB");
    setSecondary("#2575FC");
    setBodyBg("#FFFFFF");

    setAvatar("👨‍💻");
    setAvatarSize(80);

    setCover("");
    setCoverBlur(0);

    setLayout("classic");

    setFontFamily("system");
    setFontSize(16);
    setSpacing(28);
    setRadius(20);

    setShadowBlur(24);
    setShadowOpacity(0.32);

    setToast(true);
    setTimeout(() => setToast(false), 1500);
  };

  /* ===========================================================
     JSX RETURN
  =========================================================== */
  return (
    <div className="feature1-container">

      {/* ---------------- TOP BAR ---------------- */}
      <div className="feature1-topbar">
        <button className="feature1-top-btn" onClick={() => window.history.back()}>
          ← Back
        </button>

        <div className="feature1-top-title">Customize Your Profile</div>

        <div className="feature1-top-actions">
          <button className="feature1-top-btn" onClick={resetAll}>Reset</button>
          <button className="feature1-top-btn primary" onClick={saveProfile}>Save</button>
          <button className="feature1-top-btn export" onClick={exportPNG}>Export PNG</button>
        </div>
      </div>

      {/* ---------------- LEFT SIDEBAR ---------------- */}
      <aside className="feature1-sidebar">

        {/* COVER PHOTO */}
        <div className="feature1-card">
          <div className="feature1-card-title">🖼 Cover Photo</div>

          <button className="feature1-btn" onClick={() =>
            setCover(COVER_PRESETS[Math.floor(Math.random()*COVER_PRESETS.length)])
          }>
            🔀 Random Cover
          </button>

          <button className="feature1-btn" onClick={() => coverFileRef.current.click()}>
            📁 Upload Cover
          </button>
          <input type="file" ref={coverFileRef} style={{display:"none"}} onChange={uploadCover} />

          <label>Blur ({coverBlur}px)</label>
          <input type="range" min="0" max="20" value={coverBlur} onChange={e=>setCoverBlur(Number(e.target.value))} />
        </div>

        {/* AVATAR CONTROL */}
        <div className="feature1-card">
          <div className="feature1-card-title">👤 Avatar</div>

          <div className="feature1-avatar-box">
            {avatar.startsWith("data:")
              ? <img src={avatar} className="feature1-avatar-img" style={{width:avatarSize,height:avatarSize}} />
              : <div className="feature1-avatar-emoji" style={{fontSize:avatarSize*0.5,width:avatarSize,height:avatarSize}}>{avatar}</div>
            }
          </div>

          <label>Size ({avatarSize}px)</label>
          <input type="range" min="64" max="128" value={avatarSize} onChange={e=>setAvatarSize(Number(e.target.value))} />

          <button className="feature1-btn" onClick={() =>
            setAvatar(EMOJIS[Math.floor(Math.random()*EMOJIS.length)])
          }>
            🔀 Random Emoji
          </button>

          <button className="feature1-btn" onClick={() => avatarFileRef.current.click()}>
            📁 Upload Avatar
          </button>
          <input type="file" ref={avatarFileRef} style={{display:"none"}} onChange={uploadAvatar}/>
        </div>

        {/* LAYOUT SWITCHER */}
        <div className="feature1-card">
          <div className="feature1-card-title">📐 Layout</div>

          <div className="feature1-layout-grid">
            <div className={`feature1-layout-card ${layout==="classic"?"active":""}`}
              onClick={()=>setLayout("classic")}>Classic</div>

            <div className={`feature1-layout-card ${layout==="left"?"active":""}`}
              onClick={()=>setLayout("left")}>Left Profile</div>

            <div className={`feature1-layout-card ${layout==="split"?"active":""}`}
              onClick={()=>setLayout("split")}>Split View</div>
          </div>
        </div>

        {/* COLOR THEMES */}
        <div className="feature1-card">
          <div className="feature1-card-title">🎨 Theme Colors</div>

          <div className="feature1-preset-list">
            {COLOR_PRESETS.map(p=>(
              <button key={p.name} className="feature1-preset-button"
                onClick={()=>{
                  setPrimary(p.primary);
                  setSecondary(p.secondary);
                  setBodyBg(p.bodyBg);
                }}>
                <div className="feature1-preset-name">{p.name}</div>
                <div className="feature1-preset-colors">
                  <span style={{background:p.primary}}/>
                  <span style={{background:p.secondary}}/>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* TYPOGRAPHY */}
        <div className="feature1-card">
          <div className="feature1-card-title">🔤 Typography</div>

          <label>Font Family</label>
          <select value={fontFamily} onChange={e=>setFontFamily(e.target.value)}>
            <option value="system">System</option>
            <option value="serif">Serif</option>
            <option value="mono">Monospace</option>
          </select>

          <label>Font Size ({fontSize}px)</label>
          <input type="range" min="14" max="22" value={fontSize} onChange={e=>setFontSize(Number(e.target.value))}/>

          <label>Content Spacing ({spacing}px)</label>
          <input type="range" min="12" max="48" value={spacing} onChange={e=>setSpacing(Number(e.target.value))}/>

          <label>Corner Radius ({radius}px)</label>
          <input type="range" min="0" max="32" value={radius} onChange={e=>setRadius(Number(e.target.value))} />
        </div>

        {/* EFFECTS */}
        <div className="feature1-card">
          <div className="feature1-card-title">✨ Effects</div>

          <label>Shadow Blur ({shadowBlur}px)</label>
          <input type="range" min="0" max="40" value={shadowBlur} onChange={e=>setShadowBlur(Number(e.target.value))}/>

          <label>Shadow Opacity ({Math.round(shadowOpacity*100)}%)</label>
          <input type="range" min="0.1" max="0.5" step="0.01"
            value={shadowOpacity} onChange={e=>setShadowOpacity(Number(e.target.value))}/>
        </div>

      </aside>

      {/* ---------------- PREVIEW SIDE ---------------- */}
      <div className="feature1-preview-area">

        <div
          id="feature1-profilePreview"
          className={`feature1-preview-card layout-${layout}`}
          style={{
            borderRadius: radius,
            boxShadow: `0 ${shadowBlur}px ${shadowBlur*1.5}px rgba(0,0,0,${shadowOpacity})`,
            background: bodyBg,
            fontSize,
            fontFamily:
              fontFamily==="system" ? "Inter, sans-serif" :
              fontFamily==="serif" ? "Georgia, serif" :
              "JetBrains Mono, monospace"
          }}
        >

          {/* -------- HEADER WITH COVER BEHIND GRADIENT -------- */}
          <div
            className="feature1-preview-header-bar"
            style={{
              backgroundImage: cover
                ? `linear-gradient(45deg, ${primary}, ${secondary}), url(${cover})`
                : `linear-gradient(45deg, ${primary}, ${secondary})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundBlendMode: "overlay",
              filter: cover ? `blur(${coverBlur}px)` : "none",

              color: autoTextColor(primary),
              borderRadius: `${radius}px ${radius}px 0 0`
            }}
          >

            {/* avatar */}
            <div
              className="feature1-avatar-preview"
              style={{
                width: avatarSize,
                height: avatarSize,
                marginTop: cover ? -avatarSize/2 : 0
              }}
            >
              {avatar.startsWith("data:")
                ? <img src={avatar}/>
                : <span style={{fontSize: avatarSize*0.55}}>{avatar}</span>
              }
            </div>

            <h2 style={{color:autoTextColor(primary)}}>Alex Johnson</h2>
            <p className="subtitle" style={{color:autoTextColor(primary)}}>
              Senior Software Engineer
            </p>

          </div>

          {/* BODY */}
          <div className="feature1-preview-body" style={{padding:spacing}}>

            <h3>Work Experience</h3>
            <p>Senior Software Engineer @ Tech Giants Inc.</p>
            <p>Led cloud microservice architecture.</p>

            <h3>Skills</h3>
            <div className="feature1-tags">
              {["JavaScript","React","Node.js","AWS"].map(tag=>(
                <span>{tag}</span>
              ))}
            </div>

            <h3>Education</h3>
            <p>M.S. Computer Science — Stanford University</p>

          </div>
        </div>
      </div>

      {/* ---------------- TOAST ---------------- */}
      <div className={`feature1-toast ${toast ? "show" : ""}`}>
        ✔ Profile saved!
      </div>

    </div>
  );
}
