/**
 * ProfileEditor.jsx
 * Production-grade Resume / Profile Editor
 * Notion / Stripe aesthetic — grid layout — zero transform scale — zero warnings
 */
import React, { useState, useRef, useCallback, useEffect } from "react";
import "./Feature1.css";

/* ═══════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════ */
const LS_PROFILE = "pe_v3_profile";
const LS_STYLE   = "pe_v3_style";

const THEMES = [
  { name: "Indigo", accent: "#4f46e5" },
  { name: "Ocean",  accent: "#0284c7" },
  { name: "Slate",  accent: "#475569" },
  { name: "Emerald",accent: "#059669" },
  { name: "Rose",   accent: "#e11d48" },
];

const FONTS = [
  { id: "geist",  label: "Geist",          stack: "'Geist', 'Inter', system-ui, sans-serif" },
  { id: "lora",   label: "Lora",           stack: "'Lora', Georgia, serif" },
  { id: "mono",   label: "JetBrains Mono", stack: "'JetBrains Mono', monospace" },
];

const COVERS = [
  "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1400&q=80",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=80",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&q=80",
  "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1400&q=80",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1400&q=80",
];

// โหลดจาก backend /api/profiles - ห้าม hardcode
const DEFAULT_PROFILE = {
  name:       "",
  title:      "",
  email:      "",
  phone:      "",
  location:   "",
  linkedin:   "",
  github:     "",
  summary:    "",
  skills:     [],
};

const DEFAULT_STYLE = {
  themeIdx:   0,
  accent:     "#4f46e5",
  fontId:     "geist",
  cover:      COVERS[0],
  coverBlur:  0,
  showCover:  true,
  avatarSrc:  "",
  avatarSize: 88,
  fontSize:   15,
  lineSpacing:28,
  cardRadius: 10,
  shadowPx:   16,
};

/* ═══════════════════════════════════════════
   UTILS
═══════════════════════════════════════════ */
const loadJSON = (key, fb) => {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fb; }
  catch { return fb; }
};
const saveJSON = (key, v) => {
  try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* quota */ }
};
const fileToURL = (f) => new Promise((res, rej) => {
  const r = new FileReader();
  r.onload  = () => res(r.result);
  r.onerror = rej;
  r.readAsDataURL(f);
});

/* ═══════════════════════════════════════════
   ATOMS  (defined OUTSIDE main component)
═══════════════════════════════════════════ */

/** Compact form field */
function Field({ label, value, onChange, placeholder, type = "text", mono }) {
  return (
    <div className="pe-field">
      <label className="pe-field-label">{label}</label>
      <input
        className={`pe-input${mono ? " pe-input--mono" : ""}`}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        autoComplete="off"
      />
    </div>
  );
}

/** Two-column field grid */
function FieldRow({ children }) {
  return <div className="pe-field-row">{children}</div>;
}

/** Section heading in sidebar */
function SectionHead({ title }) {
  return <p className="pe-section-head">{title}</p>;
}

/** Slider with value label */
function Slider({ label, value, min, max, unit = "", onChange }) {
  return (
    <div className="pe-slider">
      <div className="pe-slider-header">
        <span>{label}</span>
        <span className="pe-slider-val">{value}{unit}</span>
      </div>
      <input
        type="range"
        className="pe-range"
        min={min} max={max} value={value}
        onChange={e => onChange(+e.target.value)}
      />
    </div>
  );
}

/** Toggle switch */
function Toggle({ label, on, onChange }) {
  return (
    <label className="pe-toggle-wrap">
      <span className="pe-toggle-label">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={on ? "true" : "false"}
        className={`pe-toggle${on ? " pe-toggle--on" : ""}`}
        onClick={() => onChange(!on)}
      />
    </label>
  );
}

/** Removable tag chip */
function Chip({ label, onRemove }) {
  return (
    <span className="pe-chip">
      {label}
      <button
        type="button"
        className="pe-chip-x"
        aria-label={`Remove ${label}`}
        onClick={onRemove}
      >×</button>
    </span>
  );
}

/** Toast */
function Toast({ msg, visible }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`pe-toast${visible ? " pe-toast--on" : ""}`}
    >
      {msg}
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
export default function ProfileEditor() {
  /* ── state ── */
  const [profile, setProfile] = useState(() => loadJSON(LS_PROFILE, DEFAULT_PROFILE));
  const [style,   setStyle]   = useState(() => loadJSON(LS_STYLE,   DEFAULT_STYLE));
  const [tab,     setTab]     = useState("design");       // "design" | "content"
  const [toast,   setToast]   = useState({ msg: "", on: false });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  /* draft states for add-forms */
  const [skillInput, setSkillInput] = useState("");

  /* refs */
  const avatarRef = useRef(null);
  const coverRef  = useRef(null);

  /* ── updaters ── */
  const setP = useCallback((k, v) => setProfile(p => ({ ...p, [k]: v })), []);
  const setSt = useCallback((k, v) => setStyle(s => ({ ...s, [k]: v })), []);

  const ping = useCallback((msg) => {
    setToast({ msg, on: true });
    setTimeout(() => setToast(t => ({ ...t, on: false })), 2500);
  }, []);

  /* ── โหลดโปรไฟล์จาก backend เมื่อเปิดหน้า ── */
  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userID");

      if (!token || !userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`http://localhost:3000/api/profiles?userId=${userId}`, {
          headers: { "Authorization": `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();

          // แมปข้อมูลจาก backend → state
          const mappedProfile = {
            name: data.name || "",
            title: data.title || "",
            email: data.email || "",
            phone: data.phone || "",
            location: data.location || "",
            linkedin: data.linkedin || "",
            github: data.github || "",
            summary: data.summary || "",
            skills: Array.isArray(data.skills) 
              ? data.skills.map(s => typeof s === "string" ? s : s.name || s.skill || "")
              : [],
          };

          const mappedStyle = { ...DEFAULT_STYLE, avatarSrc: data.profileImage || "" };

          setProfile(mappedProfile);
          setStyle(mappedStyle);
        }
      } catch (err) {
        console.error("โหลด profile ไม่สำเร็จ:", err);
        ping("โหลด profile ไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    })();
  }, [ping]);

  /* ── save / reset ── */
  const save = useCallback(async () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userID");

    if (!token || !userId) {
      ping("กรุณา login ก่อน");
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/api/profiles/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profile.name,
          title: profile.title,
          email: profile.email,
          phone: profile.phone,
          location: profile.location,
          linkedin: profile.linkedin,
          github: profile.github,
          summary: profile.summary,
          skills: profile.skills,
          profileImage: style.avatarSrc,
          privacy: JSON.stringify({
            themeIdx: style.themeIdx,
            accent: style.accent,
            fontId: style.fontId,
            cover: style.cover,
            coverBlur: style.coverBlur,
            showCover: style.showCover,
            avatarSize: style.avatarSize,
            fontSize: style.fontSize,
            lineSpacing: style.lineSpacing,
            cardRadius: style.cardRadius,
            shadowPx: style.shadowPx,
          }),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "บันทึกไม่สำเร็จ");
      }

      // บันทึก localStorage เพื่อ offline access
      saveJSON(LS_PROFILE, profile);
      saveJSON(LS_STYLE, style);
      ping("บันทึก Profile เรียบร้อยแล้ว ✓");
    } catch (err) {
      console.error("บันทึก profile ไม่สำเร็จ:", err);
      ping("บันทึกไม่สำเร็จ: " + err.message);
    }
  }, [profile, style, ping]);

  const reset = useCallback(() => {
    if (!window.confirm("Reset all data?")) return;
    setProfile(DEFAULT_PROFILE);
    setStyle(DEFAULT_STYLE);
    localStorage.removeItem(LS_PROFILE);
    localStorage.removeItem(LS_STYLE);
    ping("Reset complete");
  }, [ping]);

  /* ── file uploads ── */
  const onAvatar = useCallback(async (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    try { setSt("avatarSrc", await fileToURL(f)); } catch { /* silent */ }
    e.target.value = "";
  }, [setSt]);

  const onCover = useCallback(async (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    try { setSt("cover", await fileToURL(f)); } catch { /* silent */ }
    e.target.value = "";
  }, [setSt]);

  /* ── skills ── */
  const addSkill = useCallback(() => {
    const t = skillInput.trim(); if (!t) return;
    setP("skills", [...profile.skills, t]);
    setSkillInput("");
  }, [skillInput, profile.skills, setP]);

  /* ── derived ── */
  const font = FONTS.find(f => f.id === style.fontId) ?? FONTS[0];

  /* ════════════════════════════════════════
     RENDER
  ════════════════════════════════════════ */
  return (
    <div className="pe-shell" style={{ "--accent": style.accent }}>

      {/* ─────── TOPBAR ─────── */}
      <header className="pe-topbar">
        <button
          type="button"
          className="pe-topbar-back"
          onClick={() => window.history.back()}
        >
          ← Back
        </button>

        <h1 className="pe-topbar-title">Profile Editor</h1>

        <div className="pe-topbar-actions">
          <button type="button" className="pe-btn pe-btn--ghost" onClick={reset}>
            Reset
          </button>
          <button type="button" className="pe-btn pe-btn--ghost" onClick={() => setMobileOpen(v => !v)}>
            ☰
          </button>
          <button type="button" className="pe-btn pe-btn--solid" onClick={save}>
            Save
          </button>
        </div>
      </header>

      {/* ─────── MAIN GRID ─────── */}
      <div className="pe-grid">

        {/* ══════ SIDEBAR ══════ */}
        <aside className={`pe-sidebar${mobileOpen ? " pe-sidebar--open" : ""}`}>

          {/* Tabs */}
          <nav className="pe-tabs" role="tablist">
            {["design", "content"].map(t => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t ? "true" : "false"}
                className={`pe-tab${tab === t ? " pe-tab--active" : ""}`}
                onClick={() => setTab(t)}
              >
                {t === "design" ? "Design" : "Content"}
              </button>
            ))}
          </nav>

          <div className="pe-sidebar-body">

            {/* ══ DESIGN TAB ══ */}
            {tab === "design" && (
              <>
                {/* Cover */}
                <section className="pe-section">
                  <SectionHead title="COVER PHOTO" />
                  <Toggle
                    label="Show cover"
                    on={style.showCover}
                    onChange={v => setSt("showCover", v)}
                  />
                  {style.showCover && (
                    <>
                      {style.cover && (
                        <div
                          className="pe-cover-preview"
                          style={{ backgroundImage: `url("${style.cover}")` }}
                        />
                      )}
                      <div className="pe-btn-group">
                        <button
                          type="button"
                          className="pe-btn pe-btn--outline"
                          onClick={() => setSt("cover", COVERS[Math.floor(Math.random() * COVERS.length)])}
                        >
                          Random Photo
                        </button>
                        <button
                          type="button"
                          className="pe-btn pe-btn--outline"
                          onClick={() => coverRef.current?.click()}
                        >
                          Upload
                        </button>
                        {style.cover && (
                          <button
                            type="button"
                            className="pe-btn pe-btn--ghost"
                            onClick={() => setSt("cover", "")}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <Slider
                        label="Blur" value={style.coverBlur}
                        min={0} max={16} unit="px"
                        onChange={v => setSt("coverBlur", v)}
                      />
                    </>
                  )}
                  <input ref={coverRef} type="file" accept="image/*" className="pe-hidden" onChange={onCover} />
                </section>

                {/* Avatar */}
                <section className="pe-section">
                  <SectionHead title="PROFILE PHOTO" />
                  <div className="pe-avatar-row">
                    <div className="pe-avatar-thumb">
                      {style.avatarSrc
                        ? <img src={style.avatarSrc} alt="avatar" className="pe-avatar-img" />
                        : <span className="pe-avatar-fallback">👤</span>
                      }
                    </div>
                    <div className="pe-btn-group pe-btn-group--col">
                      <button
                        type="button"
                        className="pe-btn pe-btn--outline"
                        onClick={() => avatarRef.current?.click()}
                      >
                        Upload Photo
                      </button>
                      {style.avatarSrc && (
                        <button
                          type="button"
                          className="pe-btn pe-btn--ghost"
                          onClick={() => setSt("avatarSrc", "")}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                  <Slider
                    label="Avatar size" value={style.avatarSize}
                    min={56} max={104} unit="px"
                    onChange={v => setSt("avatarSize", v)}
                  />
                  <input ref={avatarRef} type="file" accept="image/*" className="pe-hidden" onChange={onAvatar} />
                </section>

                {/* Theme */}
                <section className="pe-section">
                  <SectionHead title="ACCENT COLOR" />
                  <div className="pe-theme-dots">
                    {THEMES.map((t, i) => (
                      <button
                        key={t.name}
                        type="button"
                        aria-label={t.name}
                        title={t.name}
                        className={`pe-theme-dot${style.themeIdx === i ? " pe-theme-dot--on" : ""}`}
                        style={{ background: t.accent }}
                        onClick={() => setStyle(s => ({ ...s, themeIdx: i, accent: t.accent }))}
                      >
                        {style.themeIdx === i && <span className="pe-theme-tick">✓</span>}
                      </button>
                    ))}
                    <div className="pe-theme-custom">
                      <label className="pe-field-label" htmlFor="custom-accent">Custom</label>
                      <input
                        id="custom-accent"
                        type="color"
                        className="pe-color-picker"
                        value={style.accent}
                        onChange={e => setStyle(s => ({ ...s, themeIdx: -1, accent: e.target.value }))}
                      />
                    </div>
                  </div>
                </section>

                {/* Font */}
                <section className="pe-section">
                  <SectionHead title="TYPOGRAPHY" />
                  <div className="pe-font-btns">
                    {FONTS.map(f => (
                      <button
                        key={f.id}
                        type="button"
                        className={`pe-font-btn${style.fontId === f.id ? " pe-font-btn--on" : ""}`}
                        onClick={() => setSt("fontId", f.id)}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                  <Slider label="Font size" value={style.fontSize} min={13} max={19} unit="px" onChange={v => setSt("fontSize", v)} />
                  <Slider label="Line spacing" value={style.lineSpacing} min={16} max={48} unit="px" onChange={v => setSt("lineSpacing", v)} />
                </section>

                {/* Card */}
                <section className="pe-section">
                  <SectionHead title="CARD STYLE" />
                  <Slider label="Corner radius" value={style.cardRadius} min={0} max={20} unit="px" onChange={v => setSt("cardRadius", v)} />
                  <Slider label="Shadow depth"  value={style.shadowPx}   min={0} max={48} unit="px" onChange={v => setSt("shadowPx", v)} />
                </section>

                <section className="pe-section">
                  <button type="button" className="pe-btn pe-btn--solid pe-btn--full" onClick={save}>
                    Save Profile
                  </button>
                </section>
              </>
            )}

            {/* ══ CONTENT TAB ══ */}
            {tab === "content" && (
              <>
                {/* Basic */}
                <section className="pe-section">
                  <SectionHead title="BASIC INFO" />
                  <Field label="Full Name"    value={profile.name}     onChange={v => setP("name", v)}     placeholder="Alex Johnson" />
                  <Field label="Job Title"    value={profile.title}    onChange={v => setP("title", v)}    placeholder="Senior Software Engineer" />
                  <FieldRow>
                    <Field label="Email"    value={profile.email}    onChange={v => setP("email", v)}    placeholder="alex@email.com" />
                    <Field label="Phone"    value={profile.phone}    onChange={v => setP("phone", v)}    placeholder="+1 234 567 8900" />
                  </FieldRow>
                  <FieldRow>
                    <Field label="Location" value={profile.location} onChange={v => setP("location", v)} placeholder="City, Country" />
                  </FieldRow>
                  <FieldRow>
                    <Field label="LinkedIn" value={profile.linkedin} onChange={v => setP("linkedin", v)} placeholder="linkedin.com/in/..." mono />
                    <Field label="GitHub"   value={profile.github}   onChange={v => setP("github", v)}   placeholder="github.com/..." mono />
                  </FieldRow>
                </section>

                {/* Summary */}
                <section className="pe-section">
                  <SectionHead title="SUMMARY" />
                  <textarea
                    className="pe-input pe-textarea"
                    rows={4}
                    value={profile.summary}
                    onChange={e => setP("summary", e.target.value)}
                    placeholder="Professional bio..."
                  />
                </section>

                {/* Skills */}
                <section className="pe-section">
                  <SectionHead title="SKILLS" />
                  <div className="pe-add-row">
                    <input
                      type="text"
                      className="pe-input"
                      placeholder="Skill name + Enter"
                      value={skillInput}
                      onChange={e => setSkillInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                    />
                    <button type="button" className="pe-btn pe-btn--sm" onClick={addSkill}>Add</button>
                  </div>
                  <div className="pe-chips">
                    {profile.skills.map((s, i) => (
                      <Chip
                        key={`skill-${s}-${i}`}
                        label={s}
                        onRemove={() => setP("skills", profile.skills.filter((_, j) => j !== i))}
                      />
                    ))}
                  </div>
                </section>

                {/* Note: Experience & Education are managed in ResumeEditor */}
                <section className="pe-section">
                  <p className="pe-field-label" style={{ color: "#999", fontSize: "12px" }}>
                    💡 Experience & Education management moved to ResumeEditor
                  </p>
                </section>
              </>
            )}

          </div>{/* /sidebar-body */}
        </aside>

        {/* ══════ PREVIEW ══════ */}
        <main className="pe-preview">
          <div className="pe-preview-meta">
            <span className="pe-preview-label">LIVE PREVIEW</span>
            <span className="pe-preview-badge">A4 · 800px</span>
          </div>

          {/* Resume Card — NO transform:scale, uses width:100% max-width */}
          <div
            className="pe-card"
            style={{
              borderRadius:  style.cardRadius,
              boxShadow:     `0 ${style.shadowPx}px ${style.shadowPx * 2}px rgba(0,0,0,0.07)`,
              fontFamily:    font.stack,
              fontSize:      style.fontSize,
              lineHeight:    `${style.lineSpacing}px`,
            }}
          >
            {/* ── Cover ── */}
            {style.showCover && (
              <div
                className="pe-card-cover"
                style={{
                  backgroundImage:  style.cover ? `url("${style.cover}")` : "none",
                  backgroundColor:  style.cover ? undefined : style.accent,
                  filter:           style.coverBlur ? `blur(${style.coverBlur}px)` : undefined,
                  borderRadius:     `${style.cardRadius}px ${style.cardRadius}px 0 0`,
                }}
                aria-hidden="true"
              />
            )}

            {/* ── Header ── */}
            <div className="pe-card-header">
              {/* Avatar */}
              <div
                className="pe-card-avatar"
                style={{
                  width:       style.avatarSize,
                  height:      style.avatarSize,
                  borderColor: style.accent,
                  marginTop:   style.showCover ? -(style.avatarSize / 2) : 0,
                }}
              >
                {style.avatarSrc
                  ? <img src={style.avatarSrc} alt="Profile" className="pe-card-avatar-img" />
                  : <span className="pe-card-avatar-emoji" style={{ fontSize: Math.round(style.avatarSize * 0.44) }}>👤</span>
                }
              </div>

              <h1 className="pe-card-name">
                {profile.name || <span className="pe-muted">Your Name</span>}
              </h1>
              <p className="pe-card-title" style={{ color: style.accent }}>
                {profile.title || <span className="pe-muted">Your Title</span>}
              </p>
              {profile.summary && (
                <p className="pe-card-summary">{profile.summary}</p>
              )}
              <div className="pe-card-contacts">
                {profile.email    && <span><span className="pe-ci">✉</span>{profile.email}</span>}
                {profile.phone    && <span><span className="pe-ci">☏</span>{profile.phone}</span>}
                {profile.location && <span><span className="pe-ci">◎</span>{profile.location}</span>}
                {profile.linkedin && <span><span className="pe-ci">in</span>{profile.linkedin}</span>}
                {profile.github   && <span><span className="pe-ci">⌥</span>{profile.github}</span>}
              </div>
            </div>

            <hr className="pe-card-rule" />

            {/* ── Body ── */}
            <div className="pe-card-body">

              {/* Skills only - no experience/education */}
              {profile.skills.length > 0 && (
                <section className="pr-section">
                  <h3 className="pr-heading">
                    <span className="pr-heading-icon">⚡</span> SKILLS
                  </h3>
                  <div className="pr-skills">
                    {profile.skills.map((s, i) => (
                      <span
                        key={`sk-${i}-${s}`}
                        className="pr-skill-tag"
                        style={{ borderColor: style.accent, color: style.accent }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </section>
              )}

            </div>{/* /card-body */}
          </div>{/* /pe-card */}
        </main>
      </div>{/* /pe-grid */}

      <Toast msg={toast.msg} visible={toast.on} />
    </div>
  );
}