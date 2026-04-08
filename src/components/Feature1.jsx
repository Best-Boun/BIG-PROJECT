/**
 * Feature1.jsx  —  Profile Design Controller
 * Full UI Builder: layout · theme · sections · animation · dark mode
 * Sends ONLY style object to backend. ProfilePublic reads & renders it.
 */
import React, { useState, useRef, useCallback, useEffect } from "react";
import "./Feature1.css";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/* ═══════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════ */
const LS_STYLE = "pe_v3_style";

const THEMES = [
  { name: "Indigo",   accent: "#4f46e5" },
  { name: "Ocean",    accent: "#0284c7" },
  { name: "Slate",    accent: "#475569" },
  { name: "Emerald",  accent: "#059669" },
  { name: "Rose",     accent: "#e11d48" },
  { name: "Amber",    accent: "#d97706" },
  { name: "Violet",   accent: "#7c3aed" },
  { name: "Teal",     accent: "#0d9488" },
];

const FONTS = [
  { id: "geist",    label: "Geist",       stack: "'Geist', 'Inter', system-ui, sans-serif" },
  { id: "lora",     label: "Lora",        stack: "'Lora', Georgia, serif" },
  { id: "mono",     label: "JB Mono",     stack: "'JetBrains Mono', monospace" },
  { id: "fraunces", label: "Fraunces",    stack: "'Fraunces', Georgia, serif" },
  { id: "syne",     label: "Syne",        stack: "'Syne', system-ui, sans-serif" },
];

const COVERS = [
  "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1400&q=80",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=80",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&q=80",
  "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1400&q=80",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1400&q=80",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1400&q=80",
];

const LAYOUTS = [
  { id: "sidebar",  label: "Sidebar",  icon: "⊟", desc: "Left info · Right content" },
  { id: "minimal",  label: "Minimal",  icon: "▭",  desc: "Clean single column" },
  { id: "grid",     label: "Grid",     icon: "⊞",  desc: "Card-based grid" },
  { id: "split",    label: "Split",    icon: "⊠",  desc: "Two equal columns" },
  { id: "card",     label: "Card",     icon: "◫",  desc: "Sections as cards" },
];

const SECTION_KEYS = [
  { id: "summary",       label: "Summary",        icon: "≡" },
  { id: "experience",    label: "Experience",      icon: "◉" },
  { id: "projects",      label: "Projects",        icon: "◈" },
  { id: "skills",        label: "Skills",          icon: "◇" },
  { id: "education",     label: "Education",       icon: "▣" },
  { id: "languages",     label: "Languages",       icon: "◎" },
  { id: "certifications",label: "Certifications",  icon: "✦" },
];

const ANIMATIONS = [
  { id: "none",  label: "None" },
  { id: "fade",  label: "Fade" },
  { id: "slide", label: "Slide up" },
];

const CONTAINER_WIDTHS = [
  { id: "sm",   label: "Narrow",  px: "680px" },
  { id: "md",   label: "Medium",  px: "860px" },
  { id: "lg",   label: "Wide",    px: "1060px" },
  { id: "full", label: "Full",    px: "100%" },
];

const DEFAULT_STYLE = {
  // existing
  themeIdx:     0,
  accent:       "#4f46e5",
  fontId:       "geist",
  cover:        COVERS[0],
  coverBlur:    0,
  showCover:    true,
  avatarSrc:    "",
  avatarSize:   88,
  fontSize:     15,
  lineSpacing:  28,
  cardRadius:   10,
  shadowPx:     16,
  // new
  layout:           "sidebar",
  darkMode:         false,
  sectionOrder:     ["summary","experience","projects","skills","education","languages","certifications"],
  visibleSections:  { summary: true, experience: true, projects: true, skills: true, education: true, languages: true, certifications: true },
  alignment:        "left",
  containerWidth:   "md",
  animation:        "fade",
  headerStyle:      "classic",   // "classic" | "banner" | "compact"
  skillStyle:       "pill",      // "pill" | "badge" | "bar" | "dot"
  timelineStyle:    "line",      // "line" | "compact" | "card"
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
   ATOMS
═══════════════════════════════════════════ */
function SectionHead({ title }) {
  return <p className="pe-section-head">{title}</p>;
}

function Slider({ label, value, min, max, unit = "", onChange }) {
  return (
    <div className="pe-slider">
      <div className="pe-slider-header">
        <span>{label}</span>
        <span className="pe-slider-val">{value}{unit}</span>
      </div>
      <input type="range" className="pe-range" min={min} max={max} value={value}
        onChange={e => onChange(+e.target.value)} />
    </div>
  );
}

function Toggle({ label, on, onChange, sub }) {
  return (
    <label className="pe-toggle-wrap">
      <div className="pe-toggle-text">
        <span className="pe-toggle-label">{label}</span>
        {sub && <span className="pe-toggle-sub">{sub}</span>}
      </div>
      <button type="button" role="switch" aria-checked={on ? "true" : "false"}
        className={`pe-toggle${on ? " pe-toggle--on" : ""}`}
        onClick={() => onChange(!on)} />
    </label>
  );
}

function Toast({ msg, visible }) {
  return (
    <div role="status" aria-live="polite" className={`pe-toast${visible ? " pe-toast--on" : ""}`}>
      {msg}
    </div>
  );
}

/* Draggable section row */
function SectionRow({ sec, visible, onToggle, onDragStart, onDragOver, onDrop, isDragging, isOver }) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={e => { e.preventDefault(); onDragOver(); }}
      onDrop={onDrop}
      className={`pe-section-row${isDragging ? " pe-section-row--drag" : ""}${isOver ? " pe-section-row--over" : ""}`}
    >
      <span className="pe-section-row__handle">⠿</span>
      <span className="pe-section-row__icon">{sec.icon}</span>
      <span className="pe-section-row__label">{sec.label}</span>
      <button
        type="button"
        className={`pe-section-row__toggle${visible ? " pe-section-row__toggle--on" : ""}`}
        onClick={onToggle}
        title={visible ? "Hide section" : "Show section"}
      >
        {visible ? "●" : "○"}
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
export default function ProfileEditor() {
  const [style,      setStyle]      = useState(() => ({ ...DEFAULT_STYLE, ...loadJSON(LS_STYLE, {}) }));
  const [tab,        setTab]        = useState("layout");
  const [toast,      setToast]      = useState({ msg: "", on: false });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [dragIdx,    setDragIdx]    = useState(null);
  const [overIdx,    setOverIdx]    = useState(null);

  const avatarRef = useRef(null);
  const coverRef  = useRef(null);

  const setSt = useCallback((k, v) => setStyle(s => ({ ...s, [k]: v })), []);

  const ping = useCallback((msg) => {
    setToast({ msg, on: true });
    setTimeout(() => setToast(t => ({ ...t, on: false })), 2800);
  }, []);

  /* ── Load existing style from backend ── */
  useEffect(() => {
    (async () => {
      const token  = localStorage.getItem("token");
      const userId = localStorage.getItem("userID") || localStorage.getItem("userId");
      if (!token || !userId) return;
      try {
        const res = await fetch(`${BASE_URL}/api/profiles?userId=${userId}`, {
          headers: { "Authorization": `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data?.style && typeof data.style === "object") {
          // Merge loaded style with defaults to ensure no missing fields
          setStyle(s => ({
            ...DEFAULT_STYLE,
            ...s,
            ...data.style
          }));
        }
      } catch (err) {
        console.debug("style load failed:", err);
      }
    })();
  }, []);

  /* ── Save ONLY style to backend ── */
  const save = useCallback(async () => {
    const token  = localStorage.getItem("token");
    const userId = localStorage.getItem("userID") || localStorage.getItem("userId");
    if (!token || !userId) { ping("กรุณา login ก่อน"); return; }

    // Validate style before sending
    const validLayout = ["sidebar","minimal","grid","split","card"].includes(style.layout) ? style.layout : "sidebar";
    const validSectionOrder = (style.sectionOrder || []).filter(key => 
      ["summary","experience","projects","skills","education","languages","certifications"].includes(key)
    );
    if (validSectionOrder.length === 0) {
      validSectionOrder.push(...["summary","experience","projects","skills","education","languages","certifications"]);
    }
    
    const validVisibleSections = typeof style.visibleSections === "object" ? style.visibleSections : {};
    const validFontId = FONTS.some(f => f.id === style.fontId) ? style.fontId : "geist";
    
    // Build validated style payload
    const validatedStyle = {
      themeIdx: Number.isInteger(style.themeIdx) ? style.themeIdx : 0,
      accent: typeof style.accent === "string" ? style.accent : "#4f46e5",
      fontId: validFontId,
      cover: typeof style.cover === "string" ? style.cover : COVERS[0],
      coverBlur: Number.isInteger(style.coverBlur) ? Math.max(0, Math.min(16, style.coverBlur)) : 0,
      showCover: !!style.showCover,
      avatarSrc: typeof style.avatarSrc === "string" ? style.avatarSrc : "",
      avatarSize: Number.isInteger(style.avatarSize) ? Math.max(56, Math.min(120, style.avatarSize)) : 88,
      fontSize: Number.isInteger(style.fontSize) ? Math.max(12, Math.min(20, style.fontSize)) : 15,
      lineSpacing: Number.isInteger(style.lineSpacing) ? Math.max(16, Math.min(48, style.lineSpacing)) : 28,
      cardRadius: Number.isInteger(style.cardRadius) ? Math.max(0, Math.min(24, style.cardRadius)) : 10,
      shadowPx: Number.isInteger(style.shadowPx) ? Math.max(0, Math.min(48, style.shadowPx)) : 16,
      layout: validLayout,
      darkMode: !!style.darkMode,
      sectionOrder: validSectionOrder,
      visibleSections: validVisibleSections,
      alignment: ["left","center"].includes(style.alignment) ? style.alignment : "left",
      containerWidth: ["sm","md","lg","full"].includes(style.containerWidth) ? style.containerWidth : "md",
      animation: ["none","fade","slide"].includes(style.animation) ? style.animation : "fade",
      headerStyle: ["classic","banner","compact"].includes(style.headerStyle) ? style.headerStyle : "classic",
      skillStyle: ["pill","badge","bar","dot"].includes(style.skillStyle) ? style.skillStyle : "pill",
      timelineStyle: ["line","compact","card"].includes(style.timelineStyle) ? style.timelineStyle : "line",
    };

    setSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/api/profiles/${userId}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body:    JSON.stringify({ style: validatedStyle }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "บันทึกไม่สำเร็จ");
      }
      saveJSON(LS_STYLE, validatedStyle);
      // Update local state with validated values to ensure consistency
      setStyle(s => ({ ...s, ...validatedStyle }));
      ping("บันทึก Design เรียบร้อยแล้ว ✓");
    } catch (err) {
      console.error("save style failed:", err);
      ping("บันทึกไม่สำเร็จ: " + err.message);
    } finally {
      setSaving(false);
    }
  }, [style, ping]);

  /* ── File uploads ── */
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

  /* ── Section ordering drag ── */
  const handleDrop = useCallback((toIdx) => {
    if (dragIdx === null || dragIdx === toIdx) return;
    const arr = [...style.sectionOrder];
    const [moved] = arr.splice(dragIdx, 1);
    arr.splice(toIdx, 0, moved);
    setSt("sectionOrder", arr);
    setDragIdx(null); setOverIdx(null);
  }, [dragIdx, style.sectionOrder, setSt]);

  const toggleSection = useCallback((key) => {
    setSt("visibleSections", { ...style.visibleSections, [key]: !style.visibleSections[key] });
  }, [style.visibleSections, setSt]);

  /* ── Preview mini component ── */
  const PreviewMini = () => {
    const accent = style.accent;
    const dark   = style.darkMode;
    const bg     = dark ? "#0f172a" : "#f8fafc";
    const surf   = dark ? "#1e293b" : "#ffffff";
    const ink    = dark ? "#e2e8f0" : "#0f172a";
    const muted  = dark ? "#64748b" : "#94a3b8";

    const layouts = {
      sidebar: (
        <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, height: "100%" }}>
          <div style={{ background: dark ? "#1a2744" : `${accent}10`, borderRadius: 6, padding: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: accent, margin: "0 auto 6px" }} />
            <div style={{ height: 5, background: ink, borderRadius: 2, opacity: .7, marginBottom: 4 }} />
            <div style={{ height: 3, background: muted, borderRadius: 2, opacity: .5, marginBottom: 8 }} />
            {[1,2,3].map(i => <div key={i} style={{ height: 3, background: muted, borderRadius: 2, opacity: .3, marginBottom: 3 }} />)}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {style.sectionOrder.filter(k => style.visibleSections[k] !== false).slice(0,4).map(k => (
              <div key={k} style={{ background: surf, borderRadius: 5, padding: "6px 8px", border: `1px solid ${dark?"#334155":"#e2e8f0"}` }}>
                <div style={{ height: 3, width: "40%", background: accent, borderRadius: 2, marginBottom: 4 }} />
                <div style={{ height: 3, background: muted, borderRadius: 2, opacity: .4 }} />
              </div>
            ))}
          </div>
        </div>
      ),
      minimal: (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: accent }} />
          <div style={{ height: 5, width: "60%", background: ink, borderRadius: 2, opacity: .7 }} />
          <div style={{ height: 3, width: "40%", background: accent, borderRadius: 2 }} />
          {style.sectionOrder.filter(k => style.visibleSections[k] !== false).slice(0,3).map(k => (
            <div key={k} style={{ width: "100%", background: surf, borderRadius: 5, padding: "6px 8px", border: `1px solid ${dark?"#334155":"#e2e8f0"}` }}>
              <div style={{ height: 3, width: "35%", background: accent, borderRadius: 2, marginBottom: 4 }} />
              <div style={{ height: 3, background: muted, borderRadius: 2, opacity: .4 }} />
            </div>
          ))}
        </div>
      ),
      grid: (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ height: 40, background: style.showCover ? `url(${style.cover}) center/cover` : `${accent}20`, borderRadius: 6, display: "flex", alignItems: "flex-end", padding: "0 8px 6px" }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: accent, border: "2px solid white" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
            {style.sectionOrder.filter(k => style.visibleSections[k] !== false).slice(0,4).map(k => (
              <div key={k} style={{ background: surf, borderRadius: 5, padding: 7, border: `1px solid ${dark?"#334155":"#e2e8f0"}` }}>
                <div style={{ height: 3, width: "50%", background: accent, borderRadius: 2, marginBottom: 4 }} />
                <div style={{ height: 3, background: muted, borderRadius: 2, opacity: .4 }} />
              </div>
            ))}
          </div>
        </div>
      ),
      split: (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, height: "100%" }}>
          {[0,1].map(col => (
            <div key={col} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {col === 0 && <div style={{ width: 36, height: 36, borderRadius: "50%", background: accent, marginBottom: 4 }} />}
              {col === 0 && <div style={{ height: 4, background: ink, borderRadius: 2, opacity: .7 }} />}
              {style.sectionOrder.filter(k => style.visibleSections[k] !== false).slice(col*2, col*2+3).map(k => (
                <div key={k} style={{ background: surf, borderRadius: 5, padding: 6, border: `1px solid ${dark?"#334155":"#e2e8f0"}` }}>
                  <div style={{ height: 3, width: "40%", background: accent, borderRadius: 2, marginBottom: 4 }} />
                  <div style={{ height: 3, background: muted, borderRadius: 2, opacity: .4 }} />
                </div>
              ))}
            </div>
          ))}
        </div>
      ),
      card: (
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{ background: surf, borderRadius: 6, padding: 8, display: "flex", alignItems: "center", gap: 8, border: `1px solid ${dark?"#334155":"#e2e8f0"}` }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: accent, flexShrink: 0 }} />
            <div>
              <div style={{ height: 4, width: 80, background: ink, borderRadius: 2, opacity: .7, marginBottom: 3 }} />
              <div style={{ height: 3, width: 50, background: accent, borderRadius: 2 }} />
            </div>
          </div>
          {style.sectionOrder.filter(k => style.visibleSections[k] !== false).slice(0,3).map(k => (
            <div key={k} style={{ background: surf, borderRadius: 6, padding: 8, border: `1px solid ${dark?"#334155":"#e2e8f0"}`, boxShadow: `0 ${style.shadowPx/4}px ${style.shadowPx/2}px rgba(0,0,0,.06)` }}>
              <div style={{ height: 3, width: "35%", background: accent, borderRadius: 2, marginBottom: 5 }} />
              <div style={{ height: 3, background: muted, borderRadius: 2, opacity: .4 }} />
            </div>
          ))}
        </div>
      ),
    };

    return (
      <div style={{ background: bg, borderRadius: 8, padding: 12, height: "100%", minHeight: 200, transition: "all .3s ease" }}>
        {layouts[style.layout] || layouts.sidebar}
      </div>
    );
  };

  /* ════════════════════════════════════════
     RENDER
  ════════════════════════════════════════ */
  return (
    <div className="pe-shell" style={{ "--accent": style.accent }}>

      {/* ── Topbar ── */}
      <header className="pe-topbar">
        <button type="button" className="pe-topbar-back" onClick={() => window.history.back()}>
          ← Back
        </button>
        <h1 className="pe-topbar-title">
          <span className="pe-topbar-pill">Design</span> Profile Builder
        </h1>
        <div className="pe-topbar-actions">
          <button type="button" className="pe-btn pe-btn--ghost pe-btn--mobile-icon"
            onClick={() => setMobileOpen(v => !v)} title="Toggle panel">
            {mobileOpen ? "✕" : "☰"}
          </button>
          <button type="button" className="pe-btn pe-btn--solid" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save Design"}
          </button>
        </div>
      </header>

      {/* ── Main grid ── */}
      <div className="pe-grid">

        {/* ══ Sidebar ══ */}
        <aside className={`pe-sidebar${mobileOpen ? " pe-sidebar--open" : ""}`}>

          <nav className="pe-tabs" role="tablist">
            {[
              { id: "layout",  label: "Layout" },
              { id: "design",  label: "Design" },
              { id: "content", label: "Sections" },
            ].map(t => (
              <button key={t.id} type="button" role="tab"
                aria-selected={tab === t.id ? "true" : "false"}
                className={`pe-tab${tab === t.id ? " pe-tab--active" : ""}`}
                onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </nav>

          <div className="pe-sidebar-body">

            {/* ════ LAYOUT TAB ════ */}
            {tab === "layout" && (
              <>
                {/* Layout picker */}
                <section className="pe-section">
                  <SectionHead title="PROFILE LAYOUT" />
                  <div className="pe-layout-grid">
                    {LAYOUTS.map(l => (
                      <button key={l.id} type="button"
                        className={`pe-layout-btn${style.layout === l.id ? " pe-layout-btn--on" : ""}`}
                        onClick={() => setSt("layout", l.id)}
                        title={l.desc}>
                        <span className="pe-layout-btn__icon">{l.icon}</span>
                        <span className="pe-layout-btn__label">{l.label}</span>
                      </button>
                    ))}
                  </div>
                  <p className="pe-hint">{LAYOUTS.find(l => l.id === style.layout)?.desc}</p>
                </section>

                {/* Container width */}
                <section className="pe-section">
                  <SectionHead title="CONTAINER WIDTH" />
                  <div className="pe-width-btns">
                    {CONTAINER_WIDTHS.map(w => (
                      <button key={w.id} type="button"
                        className={`pe-width-btn${style.containerWidth === w.id ? " pe-width-btn--on" : ""}`}
                        onClick={() => setSt("containerWidth", w.id)}>
                        {w.label}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Alignment */}
                <section className="pe-section">
                  <SectionHead title="HEADER ALIGNMENT" />
                  <div className="pe-align-btns">
                    {["left","center"].map(a => (
                      <button key={a} type="button"
                        className={`pe-align-btn${style.alignment === a ? " pe-align-btn--on" : ""}`}
                        onClick={() => setSt("alignment", a)}>
                        {a === "left" ? "⬛ Left" : "⬜ Center"}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Header style */}
                <section className="pe-section">
                  <SectionHead title="HEADER STYLE" />
                  <div className="pe-radio-group">
                    {[
                      { id: "classic", label: "Classic",  sub: "Avatar + name stacked" },
                      { id: "banner",  label: "Banner",   sub: "Cover photo + overlap avatar" },
                      { id: "compact", label: "Compact",  sub: "Inline name + minimal" },
                    ].map(h => (
                      <label key={h.id} className={`pe-radio-row${style.headerStyle === h.id ? " pe-radio-row--on" : ""}`}>
                        <input type="radio" name="headerStyle" value={h.id}
                          checked={style.headerStyle === h.id}
                          onChange={() => setSt("headerStyle", h.id)} />
                        <div>
                          <span className="pe-radio-label">{h.label}</span>
                          <span className="pe-radio-sub">{h.sub}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </section>

                {/* Animation */}
                <section className="pe-section">
                  <SectionHead title="PAGE ANIMATION" />
                  <div className="pe-width-btns">
                    {ANIMATIONS.map(a => (
                      <button key={a.id} type="button"
                        className={`pe-width-btn${style.animation === a.id ? " pe-width-btn--on" : ""}`}
                        onClick={() => setSt("animation", a.id)}>
                        {a.label}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Dark mode */}
                <section className="pe-section">
                  <SectionHead title="THEME MODE" />
                  <Toggle label="Dark Mode" sub="Dark background, light text"
                    on={style.darkMode} onChange={v => setSt("darkMode", v)} />
                </section>
              </>
            )}

            {/* ════ DESIGN TAB ════ */}
            {tab === "design" && (
              <>
                {/* Cover */}
                <section className="pe-section">
                  <SectionHead title="COVER PHOTO" />
                  <Toggle label="Show cover" on={style.showCover} onChange={v => setSt("showCover", v)} />
                  {style.showCover && (
                    <>
                      {style.cover && (
                        <div className="pe-cover-preview" style={{ backgroundImage: `url("${style.cover}")` }} />
                      )}
                      <div className="pe-btn-group">
                        <button type="button" className="pe-btn pe-btn--outline"
                          onClick={() => setSt("cover", COVERS[Math.floor(Math.random() * COVERS.length)])}>
                          Random
                        </button>
                        <button type="button" className="pe-btn pe-btn--outline"
                          onClick={() => coverRef.current?.click()}>
                          Upload
                        </button>
                        {style.cover && (
                          <button type="button" className="pe-btn pe-btn--ghost"
                            onClick={() => setSt("cover", "")}>
                            Remove
                          </button>
                        )}
                      </div>
                      <Slider label="Blur" value={style.coverBlur} min={0} max={16} unit="px"
                        onChange={v => setSt("coverBlur", v)} />
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
                        : <span className="pe-avatar-fallback">👤</span>}
                    </div>
                    <div className="pe-btn-group pe-btn-group--col">
                      <button type="button" className="pe-btn pe-btn--outline"
                        onClick={() => avatarRef.current?.click()}>
                        Upload Photo
                      </button>
                      {style.avatarSrc && (
                        <button type="button" className="pe-btn pe-btn--ghost"
                          onClick={() => setSt("avatarSrc", "")}>
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                  <Slider label="Avatar size" value={style.avatarSize} min={56} max={120} unit="px"
                    onChange={v => setSt("avatarSize", v)} />
                  <input ref={avatarRef} type="file" accept="image/*" className="pe-hidden" onChange={onAvatar} />
                </section>

                {/* Accent color */}
                <section className="pe-section">
                  <SectionHead title="ACCENT COLOR" />
                  <div className="pe-theme-dots">
                    {THEMES.map((t, i) => (
                      <button key={t.name} type="button" aria-label={t.name} title={t.name}
                        className={`pe-theme-dot${style.themeIdx === i ? " pe-theme-dot--on" : ""}`}
                        style={{ background: t.accent }}
                        onClick={() => setStyle(s => ({ ...s, themeIdx: i, accent: t.accent }))}>
                        {style.themeIdx === i && <span className="pe-theme-tick">✓</span>}
                      </button>
                    ))}
                    <div className="pe-theme-custom">
                      <label className="pe-field-label" htmlFor="custom-accent">Custom</label>
                      <input id="custom-accent" type="color" className="pe-color-picker"
                        value={style.accent}
                        onChange={e => setStyle(s => ({ ...s, themeIdx: -1, accent: e.target.value }))} />
                    </div>
                  </div>
                </section>

                {/* Typography */}
                <section className="pe-section">
                  <SectionHead title="TYPOGRAPHY" />
                  <div className="pe-font-btns">
                    {FONTS.map(f => (
                      <button key={f.id} type="button"
                        className={`pe-font-btn${style.fontId === f.id ? " pe-font-btn--on" : ""}`}
                        onClick={() => setSt("fontId", f.id)}>
                        {f.label}
                      </button>
                    ))}
                  </div>
                  <Slider label="Font size"     value={style.fontSize}     min={12} max={20} unit="px" onChange={v => setSt("fontSize",     v)} />
                  <Slider label="Line spacing"  value={style.lineSpacing}  min={16} max={48} unit="px" onChange={v => setSt("lineSpacing",  v)} />
                </section>

                {/* Cards */}
                <section className="pe-section">
                  <SectionHead title="CARD STYLE" />
                  <Slider label="Corner radius" value={style.cardRadius} min={0} max={24} unit="px" onChange={v => setSt("cardRadius", v)} />
                  <Slider label="Shadow depth"  value={style.shadowPx}   min={0} max={48} unit="px" onChange={v => setSt("shadowPx",   v)} />
                </section>

                {/* Component styles */}
                <section className="pe-section">
                  <SectionHead title="SKILL STYLE" />
                  <div className="pe-width-btns">
                    {[
                      { id: "pill",  label: "Pills" },
                      { id: "badge", label: "Badges" },
                      { id: "dot",   label: "Dots" },
                    ].map(s => (
                      <button key={s.id} type="button"
                        className={`pe-width-btn${style.skillStyle === s.id ? " pe-width-btn--on" : ""}`}
                        onClick={() => setSt("skillStyle", s.id)}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="pe-section">
                  <SectionHead title="TIMELINE STYLE" />
                  <div className="pe-radio-group">
                    {[
                      { id: "line",    label: "Timeline line",  sub: "Classic vertical line" },
                      { id: "compact", label: "Compact",        sub: "No line, tight spacing" },
                      { id: "card",    label: "Card blocks",    sub: "Each entry in a card" },
                    ].map(t => (
                      <label key={t.id} className={`pe-radio-row${style.timelineStyle === t.id ? " pe-radio-row--on" : ""}`}>
                        <input type="radio" name="timelineStyle" value={t.id}
                          checked={style.timelineStyle === t.id}
                          onChange={() => setSt("timelineStyle", t.id)} />
                        <div>
                          <span className="pe-radio-label">{t.label}</span>
                          <span className="pe-radio-sub">{t.sub}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </section>

                <section className="pe-section">
                  <button type="button" className="pe-btn pe-btn--solid pe-btn--full" onClick={save} disabled={saving}>
                    {saving ? "Saving…" : "Save Design"}
                  </button>
                </section>
              </>
            )}

            {/* ════ SECTIONS TAB ════ */}
            {tab === "content" && (
              <>
                <section className="pe-section">
                  <SectionHead title="SECTION ORDER & VISIBILITY" />
                  <p className="pe-hint">Drag to reorder · Click ● to toggle visibility</p>
                  <div className="pe-section-list">
                    {style.sectionOrder.map((key, idx) => {
                      const sec = SECTION_KEYS.find(s => s.id === key);
                      if (!sec) return null;
                      return (
                        <SectionRow
                          key={key}
                          sec={sec}
                          visible={style.visibleSections[key] !== false}
                          onToggle={() => toggleSection(key)}
                          onDragStart={() => setDragIdx(idx)}
                          onDragOver={() => setOverIdx(idx)}
                          onDrop={() => handleDrop(idx)}
                          isDragging={dragIdx === idx}
                          isOver={overIdx === idx && dragIdx !== idx}
                        />
                      );
                    })}
                  </div>
                </section>

                <section className="pe-section">
                  <SectionHead title="QUICK TOGGLES" />
                  {SECTION_KEYS.map(sec => (
                    <Toggle key={sec.id}
                      label={`${sec.icon} ${sec.label}`}
                      on={style.visibleSections[sec.id] !== false}
                      onChange={() => toggleSection(sec.id)} />
                  ))}
                </section>

                <section className="pe-section">
                  <button type="button" className="pe-btn pe-btn--solid pe-btn--full" onClick={save} disabled={saving}>
                    {saving ? "Saving…" : "Save Layout"}
                  </button>
                </section>
              </>
            )}

          </div>
        </aside>

        {/* ══ Preview ══ */}
        <main className="pe-preview">
          <div className="pe-preview-meta">
            <span className="pe-preview-label">LIVE PREVIEW</span>
            <span className="pe-preview-badge">{style.layout} · {style.darkMode ? "dark" : "light"}</span>
          </div>

          <div className="pe-preview-canvas">
            <PreviewMini />
          </div>

          <div className="pe-preview-info">
            <div className="pe-preview-info__grid">
              <div className="pe-preview-stat">
                <span className="pe-preview-stat__label">Layout</span>
                <span className="pe-preview-stat__value">{style.layout}</span>
              </div>
              <div className="pe-preview-stat">
                <span className="pe-preview-stat__label">Theme</span>
                <span className="pe-preview-stat__value" style={{ color: style.accent }}>●  {style.darkMode ? "Dark" : "Light"}</span>
              </div>
              <div className="pe-preview-stat">
                <span className="pe-preview-stat__label">Sections</span>
                <span className="pe-preview-stat__value">
                  {Object.values(style.visibleSections).filter(Boolean).length}/{SECTION_KEYS.length} visible
                </span>
              </div>
              <div className="pe-preview-stat">
                <span className="pe-preview-stat__label">Animation</span>
                <span className="pe-preview-stat__value">{style.animation}</span>
              </div>
              <div className="pe-preview-stat">
                <span className="pe-preview-stat__label">Font</span>
                <span className="pe-preview-stat__value">{FONTS.find(f => f.id === style.fontId)?.label}</span>
              </div>
              <div className="pe-preview-stat">
                <span className="pe-preview-stat__label">Width</span>
                <span className="pe-preview-stat__value">{CONTAINER_WIDTHS.find(w => w.id === style.containerWidth)?.label}</span>
              </div>
            </div>
          </div>

          <div className="pe-preview-note">
            <span>💡</span>
            <span>Changes reflect immediately on your public profile after saving.</span>
          </div>
        </main>

      </div>

      <Toast msg={toast.msg} visible={toast.on} />
    </div>
  );
}