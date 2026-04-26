/**
 * ProfilePublic.jsx — Dynamic Profile Renderer
 * Reads `profileData.style` and renders EVERYTHING dynamically:
 * layout · theme · sections · animation · dark mode · skill style · timeline style
 */
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  FaMapMarkerAlt, FaEnvelope, FaPhone, FaGlobe,
  FaLinkedin, FaGithub, FaEye, FaExternalLinkAlt,
  FaImage, FaTimes, FaUserAstronaut, FaCog,
} from "react-icons/fa";
import { MdPublic } from "react-icons/md";
import "./Profilepublic.css";

const BASE_URL = import.meta.env.VITE_API_URL;

/* ═══════════════════════════════════════════
   DEFAULTS & CONSTANTS
═══════════════════════════════════════════ */
const DEFAULT_STYLE = {
  // Theme & Color
  themeIdx:        0,
  accent:          "#4f46e5",
  fontId:          "geist",
  
  // Typography
  fontSize:        15,
  lineSpacing:     28,
  
  // Cards & Spacing
  cardRadius:      10,
  shadowPx:        16,
  
  // Layout & Display
  layout:          "sidebar",
  darkMode:        false,
  sectionOrder:    ["basicInfo","quickInfo","contact","summary","experience","projects","skills","education","languages","certifications"],
  visibleSections: { basicInfo:true, quickInfo:true, contact:true, summary:true, experience:true, projects:true, skills:true, education:true, languages:true, certifications:true },
  
  // Header & Alignment
  alignment:       "left",
  containerWidth:  "md",
  headerStyle:     "classic",
  
  // Component Styles
  skillStyle:      "pill",
  timelineStyle:   "line",
  
  // Cover image
  coverImage:      "",

  // Legacy/computed
  avatarSize:      88,
  animation:       "fade",
};

const FONT_STACKS = {
  geist:    "'Geist','Inter',system-ui,sans-serif",
  lora:     "'Lora',Georgia,serif",
  mono:     "'JetBrains Mono',monospace",
  fraunces: "'Fraunces',Georgia,serif",
  syne:     "'Syne',system-ui,sans-serif",
};

const CONTAINER_PX = { sm:"680px", md:"860px", lg:"1060px", full:"100%" };

const SECTION_RENDERERS_ORDER = ["basicInfo","quickInfo","contact","summary","experience","projects","skills","education","languages","certifications"];

/* ═══════════════════════════════════════════
   UTILS
═══════════════════════════════════════════ */
const calculateAge = (dob) => {
  if (!dob) return "";
  const today = new Date(), birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

const calculateDuration = (startDate, endDate) => {
  if (!startDate) return "";
  const start = new Date(startDate);
  const end = endDate && endDate.toLowerCase() !== "present" ? new Date(endDate) : new Date();
  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  if (months < 0) { years--; months += 12; }
  let d = "";
  if (years  > 0) d += `${years} yr${years  > 1 ? "s" : ""}`;
  if (months > 0) d += (d ? " " : "") + `${months} mo${months > 1 ? "s" : ""}`;
  return d || "< 1 mo";
};

const calculateTotalExperience = (experience = []) => {
  let total = 0;
  experience.forEach(exp => {
    if (!exp.startDate) return;
    const start = new Date(exp.startDate);
    const end   = exp.endDate && exp.endDate.toLowerCase() !== "present" ? new Date(exp.endDate) : new Date();
    let yr = end.getFullYear() - start.getFullYear();
    let mo = end.getMonth()    - start.getMonth();
    if (mo < 0) { yr--; mo += 12; }
    total += yr * 12 + mo;
  });
  return Math.floor(total / 12);
};

/* ═══════════════════════════════════════════
   ANIMATION WRAPPER
═══════════════════════════════════════════ */
function Animated({ animation, delay = 0, children }) {
  const [show, setShow] = useState(animation === "none");
  useEffect(() => {
    if (animation === "none") { setShow(true); return; }
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [animation, delay]);

  if (animation === "none") return children;

  return (
    <div className={`pp-anim pp-anim--${animation}${show ? " pp-anim--in" : ""}`}>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════
   CSS VARIABLE INJECTOR
═══════════════════════════════════════════ */
function StyleInjector({ st }) {
  const font = FONT_STACKS[st.fontId] || FONT_STACKS.geist;
  const dark  = st.darkMode;

  return (
    <style>{`
      .pp-root {
        --pp-accent:       ${st.accent};
        --pp-accent-lite:  ${st.accent}18;
        --pp-accent-mid:   ${st.accent}cc;
        --pp-radius:       ${st.cardRadius}px;
        --pp-shadow:       0 ${st.shadowPx}px ${st.shadowPx * 2}px rgba(0,0,0,${dark ? ".35" : ".07"});
        --pp-font:         ${font};
        --pp-font-size:    ${st.fontSize}px;
        --pp-line:         ${st.lineSpacing}px;
        --pp-container:    ${CONTAINER_PX[st.containerWidth] || CONTAINER_PX.md};

        --pp-bg:        ${dark ? "#0f172a" : "#f1f5f9"};
        --pp-surface:   ${dark ? "#1e293b" : "#ffffff"};
        --pp-surface-2: ${dark ? "#253348" : "#f8fafc"};
        --pp-border:    ${dark ? "#334155" : "#e2e8f0"};
        --pp-ink:       ${dark ? "#f1f5f9" : "#0f172a"};
        --pp-ink-2:     ${dark ? "#cbd5e1" : "#1e293b"};
        --pp-muted:     ${dark ? "#64748b" : "#64748b"};
        --pp-faint:     ${dark ? "#334155" : "#94a3b8"};

        font-family: var(--pp-font);
        font-size:   var(--pp-font-size);
        line-height: var(--pp-line);
        background:  var(--pp-bg);
        color:       var(--pp-ink);
      }
      
      /* Apply theme index styling if needed */
      .pp-root[data-theme-idx="${st.themeIdx}"] {
        /* Theme customization can be added here based on themeIdx */
      }
    `}</style>
  );
}

/* ═══════════════════════════════════════════
   HEADER VARIANTS
═══════════════════════════════════════════ */
function HeaderClassic({ p, st }) {
  const center = st.alignment === "center";
  const avatarSize = st.avatarSize || 88;
  
  return (
    <div className={`pp-header-classic${center ? " pp-header-classic--center" : ""}${st.coverImage ? " pp-has-cover" : ""}`}>
      <div className="pp-header-body" style={{ textAlign: center ? "center" : "left" }}>
        <div className={`pp-avatar-wrap${center ? " pp-avatar-wrap--center" : ""}`}>
          <div className="pp-avatar"
            style={{ width: avatarSize, height: avatarSize, borderColor: st.accent }}>
            {p.profileImage
              ? <img src={p.profileImage?.startsWith("http") || p.profileImage?.startsWith("data:") ? p.profileImage : `http://localhost:3000${p.profileImage}`} alt="Profile" />
              : <span style={{ fontSize: avatarSize * .4, opacity: .3 }}>👤</span>}
          </div>
        </div>
        <div className="pp-header-info">
          <h1 className="pp-name">{p.name || "Your Name"}</h1>
          <p  className="pp-title" style={{ color: st.accent }}>{p.title || "Your Title"}</p>
          {p.bio && <p className="pp-bio">{p.bio}</p>}
          <ContactRow p={p} accent={st.accent} />
        </div>
      </div>
    </div>
  );
}

function HeaderBanner({ p, st }) {
  const avatarSize = st.avatarSize || 88;
  
  return (
    <div className={`pp-header-banner${st.coverImage ? " pp-has-cover" : ""}`}>
      <div className="pp-banner-cover"
        style={{
          backgroundColor: st.accent,
          ...(st.coverImage
            ? { backgroundImage: `url(${st.coverImage})` }
            : {}),
        }}
      />
      <div className="pp-banner-body">
        <div className="pp-banner-avatar"
          style={{ width: avatarSize, height: avatarSize, borderColor: "var(--pp-surface)" }}>
          {p.profileImage
            ? <img src={p.profileImage?.startsWith("http") || p.profileImage?.startsWith("data:") ? p.profileImage : `http://localhost:3000${p.profileImage}`} alt="Profile" />
            : <span style={{ fontSize: avatarSize * .4, opacity: .3 }}>👤</span>}
        </div>
        <div className="pp-banner-info">
          <h1 className="pp-name">{p.name || "Your Name"}</h1>
          <p  className="pp-title" style={{ color: st.accent }}>{p.title}</p>
          {p.bio && <p className="pp-bio">{p.bio}</p>}
          <ContactRow p={p} accent={st.accent} />
        </div>
      </div>
    </div>
  );
}

function HeaderCompact({ p, st }) {
  const avatarSize = st.avatarSize || 88;
  
  return (
    <div className={`pp-header-compact${st.coverImage ? " pp-has-cover" : ""}`}>
      <div className="pp-compact-avatar"
        style={{ width: avatarSize * .7, height: avatarSize * .7, borderColor: st.accent }}>
        {p.profileImage
          ? <img src={p.profileImage?.startsWith("http") || p.profileImage?.startsWith("data:") ? p.profileImage : `http://localhost:3000${p.profileImage}`} alt="Profile" />
          : <span style={{ fontSize: avatarSize * .25, opacity: .3 }}>👤</span>}
      </div>
      <div className="pp-compact-info">
        <div className="pp-compact-top">
          <h1 className="pp-name pp-name--compact">{p.name || "Your Name"}</h1>
          <p  className="pp-title pp-title--compact" style={{ color: st.accent }}>{p.title}</p>
        </div>
        <ContactRow p={p} accent={st.accent} inline />
      </div>
    </div>
  );
}

function ContactRow({ p, accent, inline }) {
  if (p.privacy?.contact === false) return null;
  return (
    <div className={`pp-contacts${inline ? " pp-contacts--inline" : ""}`}>
      {p.location && <span className="pp-contact-item"><FaMapMarkerAlt />{p.location}</span>}
      {p.email    && <span className="pp-contact-item"><FaEnvelope />{p.email}</span>}
      {p.phone    && <span className="pp-contact-item"><FaPhone />{p.phone}</span>}
      {p.website  && <a href={p.website}  target="_blank" rel="noopener noreferrer" className="pp-social-btn" style={{ color: accent }}><FaGlobe /></a>}
      {p.linkedin && <a href={p.linkedin} target="_blank" rel="noopener noreferrer" className="pp-social-btn" style={{ color: accent }}><FaLinkedin /></a>}
      {p.github   && <a href={p.github}   target="_blank" rel="noopener noreferrer" className="pp-social-btn" style={{ color: accent }}><FaGithub /></a>}
    </div>
  );
}

/* ═══════════════════════════════════════════
   SECTION COMPONENTS
═══════════════════════════════════════════ */
function SectionTitle({ children }) {
  return (
    <div className="pp-sec-head">
      <h2 className="pp-sec-title">{children}</h2>
      <div className="pp-sec-rule" />
    </div>
  );
}

function SectionSummary({ p }) {
  if (p.privacy?.summary === false) return null;
  const text = p.summary || p.bio;
  if (!text) return null;
  return (
    <section className="pp-section">
      <SectionTitle>Professional Summary</SectionTitle>
      <p className="pp-summary-text">{text}</p>
      {p.expertise && typeof p.expertise === "string" && (
        <ul className="pp-expertise-list">
          {p.expertise.split(",").map((item, i) => <li key={i}>{item.trim()}</li>)}
        </ul>
      )}
    </section>
  );
}

function SectionExperience({ p, st }) {
  if (p.privacy?.experience === false) return null;
  if (!p.experience?.length) return null;

  const timelineStyle = st.timelineStyle || "line";

  return (
    <section className="pp-section">
      <SectionTitle>Work Experience</SectionTitle>
      <div className={`pp-timeline pp-timeline--${timelineStyle}`}>
        {p.experience.map((exp) => (
          <div key={exp.id} className={`pp-exp-item pp-exp-item--${timelineStyle}`}>
            {timelineStyle === "line" && <div className="pp-exp-dot" style={{ background: st.accent }} />}
            <div className={`pp-exp-body${timelineStyle === "card" ? " pp-exp-card" : ""}`}
              style={timelineStyle === "card" ? { borderRadius: st.cardRadius, boxShadow: `0 ${st.shadowPx/3}px ${st.shadowPx/1.5}px rgba(0,0,0,.07)` } : {}}>
              <div className="pp-exp-period" style={{ color: st.accent }}>
                {exp.startDate} — {exp.endDate || "Present"}
                <span className="pp-exp-duration"> · {calculateDuration(exp.startDate, exp.endDate)}</span>
              </div>
              <div className="pp-exp-role">{exp.title || exp.role}</div>
              <div className="pp-exp-company">{exp.company}{exp.location ? ` · ${exp.location}` : ""}</div>
              {exp.description && <p className="pp-exp-desc">{exp.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionProjects({ p, st, onPreview }) {
  if (p.privacy?.projects === false) return null;
  if (!p.projects?.length) return null;
  return (
    <section className="pp-section">
      <SectionTitle>Featured Projects</SectionTitle>
      <div className="pp-projects-grid">
        {p.projects.map((proj) => (
          <div key={proj.id} className="pp-project-card"
            style={{ borderRadius: st.cardRadius, boxShadow: `0 ${st.shadowPx/3}px ${st.shadowPx}px rgba(0,0,0,.08)` }}>
            {proj.category && (
              <span className="pp-project-cat" style={{ background: st.accent }}>
                {proj.category}
              </span>
            )}
            <div className="pp-project-img"
              style={{
                backgroundImage: proj.image ? `url(${proj.image})` : "none",
                background: proj.image ? undefined : `linear-gradient(135deg, ${st.accent}40, ${st.accent}80)`,
                borderRadius: `${st.cardRadius}px ${st.cardRadius}px 0 0`,
              }}>
              {!proj.image && <FaImage style={{ color: "rgba(255,255,255,.4)", fontSize: 28 }} />}
              <div className="pp-project-overlay">
                {proj.image && (
                  <button onClick={() => onPreview(proj.image)} className="pp-proj-btn pp-proj-btn--primary"
                    style={{ background: st.accent }}>
                    <FaEye /> Preview
                  </button>
                )}
                {proj.url && (
                  <button onClick={() => window.open(proj.url, "_blank")} className="pp-proj-btn pp-proj-btn--ghost">
                    <FaExternalLinkAlt /> Visit
                  </button>
                )}
              </div>
            </div>
            <div className="pp-project-info">
              <div className="pp-project-name">{proj.name || proj.title}</div>
              {proj.description && <p className="pp-project-desc">{proj.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionSkills({ p, st }) {
  if (p.privacy?.skills === false) return null;
  if (!p.skills?.length) return null;

  const skillStyle = st.skillStyle || "pill";
  const categories = ["Languages","Frontend","Backend","Database","DevOps & Cloud"];
  const hasCats    = p.skills.some(s => s.category);

  if (hasCats) {
    return (
      <section className="pp-section">
        <SectionTitle>Technical Stack</SectionTitle>
        {categories.map(cat => {
          const catSkills = p.skills.filter(s => s.category === cat);
          if (!catSkills.length) return null;
          return (
            <div key={cat} className="pp-skill-group">
              <div className="pp-skill-group__label">{cat}</div>
              <SkillList skills={catSkills} style={skillStyle} accent={st.accent} />
            </div>
          );
        })}
        {/* uncategorized */}
        {(() => {
          const uncatted = p.skills.filter(s => !s.category);
          if (!uncatted.length) return null;
          return <SkillList skills={uncatted} style={skillStyle} accent={st.accent} />;
        })()}
      </section>
    );
  }

  return (
    <section className="pp-section">
      <SectionTitle>Skills</SectionTitle>
      <SkillList skills={p.skills} style={skillStyle} accent={st.accent} />
    </section>
  );
}

function SkillList({ skills, style: skillStyle, accent }) {
  if (skillStyle === "bar") {
    return (
      <div className="pp-skills-bars">
        {skills.map((s, i) => {
          const pct = s.level === "Expert" ? 95 : s.level === "Advanced" ? 78 : s.level === "Intermediate" ? 58 : s.level ? 40 : 70;
          return (
            <div key={s.id || i} className="pp-skill-bar-row">
              <div className="pp-skill-bar-label">{s.name}</div>
              <div className="pp-skill-bar-track">
                <div className="pp-skill-bar-fill" style={{ width: `${pct}%`, background: accent }} />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (skillStyle === "dot") {
    return (
      <div className="pp-skills-dots">
        {skills.map((s, i) => (
          <div key={s.id || i} className="pp-skill-dot-item">
            <span className="pp-skill-dot-circle" style={{ background: accent }} />
            <span className="pp-skill-dot-name">{s.name}</span>
          </div>
        ))}
      </div>
    );
  }

  if (skillStyle === "badge") {
    return (
      <div className="pp-skills-tags">
        {skills.map((s, i) => (
          <span key={s.id || i} className="pp-skill-badge"
            style={{ background: accent, color: "#fff" }}>
            {s.name}
          </span>
        ))}
      </div>
    );
  }

  // default: pill
  return (
    <div className="pp-skills-tags">
      {skills.map((s, i) => (
        <span key={s.id || i} className="pp-skill-pill"
          style={{ borderColor: `${accent}40`, color: accent, background: `${accent}0d` }}>
          {s.name}
        </span>
      ))}
    </div>
  );
}

function SectionEducation({ p, st }) {
  if (p.privacy?.education === false) return null;
  if (!p.education?.length) return null;
  return (
    <section className="pp-section">
      <SectionTitle>Education</SectionTitle>
      <div className="pp-edu-list">
        {p.education.map((edu) => (
          <div key={edu.id} className="pp-edu-item"
            style={{ borderRadius: st.cardRadius / 2 }}>
            <div className="pp-edu-degree">{edu.degree}</div>
            <div className="pp-edu-school">{edu.school || edu.institution}</div>
            {(edu.endDate || edu.startDate) && (
              <div className="pp-edu-year">{edu.endDate || edu.startDate}</div>
            )}
            {edu.grade && <div className="pp-edu-grade">GPA: {edu.grade}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionLanguages({ p }) {
  if (p.privacy?.languages === false) return null;
  if (!p.languages?.length) return null;
  const LEVELS = { "เจ้าของภาษา": 100, Native: 100, "คล่องแคล่ว": 85, Fluent: 85, "ขั้นสูง": 68, Advanced: 68, "ระดับกลาง": 50, Intermediate: 50, "เบื้องต้น": 28, Basic: 28 };
  return (
    <section className="pp-section">
      <SectionTitle>Languages</SectionTitle>
      <div className="pp-lang-list">
        {p.languages.map((lang) => (
          <div key={lang.id} className="pp-lang-item">
            <div className="pp-lang-row">
              <span className="pp-lang-name">{lang.language || lang.name}</span>
              <span className="pp-lang-level">{lang.level}</span>
            </div>
            <div className="pp-lang-track">
              <div className="pp-lang-fill"
                style={{ width: `${LEVELS[lang.level] || 60}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionCertifications({ p }) {
  if (p.privacy?.certifications === false) return null;
  if (!p.certifications?.length) return null;
  return (
    <section className="pp-section">
      <SectionTitle>Certifications</SectionTitle>
      <div className="pp-cert-list">
        {p.certifications.map((cert) => (
          <div key={cert.id} className="pp-cert-item">
            <div className="pp-cert-name">{cert.name}</div>
            <div className="pp-cert-issuer">{cert.issuer}</div>
            <div className="pp-cert-date">
              Issued: {cert.issueDate || cert.date}
              {cert.expiryDate && ` · Expires: ${cert.expiryDate}`}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   SECTION DISPATCHER
═══════════════════════════════════════════ */
function RenderSection({ sectionKey, p, st, onPreview, delay }) {
  const isVisible = st.visibleSections?.[sectionKey] !== false;
  if (!isVisible) return null;

  const map = {
    summary:        <SectionSummary       key={sectionKey} p={p} />,
    experience:     <SectionExperience    key={sectionKey} p={p} st={st} />,
    projects:       <SectionProjects      key={sectionKey} p={p} st={st} onPreview={onPreview} />,
    skills:         <SectionSkills        key={sectionKey} p={p} st={st} />,
    education:      <SectionEducation     key={sectionKey} p={p} st={st} />,
    languages:      <SectionLanguages     key={sectionKey} p={p} />,
    certifications: <SectionCertifications key={sectionKey} p={p} />,
  };

  const content = map[sectionKey];
  if (!content) return null;

  return (
    <Animated key={sectionKey} animation={st.animation} delay={delay}>
      {content}
    </Animated>
  );
}

/* ═══════════════════════════════════════════
   STATS BAR
═══════════════════════════════════════════ */
function StatsBar({ p, st }) {
  return (
    <div className="pp-stats">
      <div className="pp-stat">
        <div className="pp-stat__num" style={{ color: st.accent }}>{calculateTotalExperience(p.experience)}+</div>
        <div className="pp-stat__label">Years Exp</div>
      </div>
      <div className="pp-stat">
        <div className="pp-stat__num" style={{ color: st.accent }}>{p.projects?.length || 0}+</div>
        <div className="pp-stat__label">Projects</div>
      </div>
      <div className="pp-stat">
        <div className="pp-stat__num" style={{ color: st.accent }}>{p.certifications?.length || 0}</div>
        <div className="pp-stat__label">Certs</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SIDEBAR CARD (for sidebar layout)
═══════════════════════════════════════════ */
function SidebarPanel({ p, st, onShare, onNavigate }) {
  const LEVELS = { "เจ้าของภาษา": 100, Native: 100, "คล่องแคล่ว": 85, Fluent: 85, "ขั้นสูง": 68, Advanced: 68, "ระดับกลาง": 50, Intermediate: 50, "เบื้องต้น": 28, Basic: 28 };
  return (
    <div className="pp-sidebar-col">
      {/* Status */}
      {p.privacy?.currentStatus !== false && p.employmentStatus && (
        <div className="pp-sidebar-card">
          <h3 className="pp-sidebar-title">Current Status</h3>
          <div className="pp-status-badges">
            {p.employmentStatus === "employed"   && <span className="pp-status-badge pp-status-employed">Employed{p.currentCompany ? ` at ${p.currentCompany}` : ""}</span>}
            {p.employmentStatus === "unemployed" && <span className="pp-status-badge pp-status-unemployed">Unemployed</span>}
            {p.employmentStatus === "freelance"  && <span className="pp-status-badge pp-status-freelance">Freelancer</span>}
            {p.employmentStatus === "student"    && <span className="pp-status-badge pp-status-student">Student</span>}
            {p.openToWork && <span className="pp-status-badge pp-status-open">Open to Work</span>}
          </div>
          {p.currentRole && <p className="pp-status-role">{p.currentRole}</p>}
          {p.openToWork && p.availableFrom && (
            <p className="pp-status-available">Available from {new Date(p.availableFrom).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</p>
          )}
        </div>
      )}

      {/* Quick info */}
      {p.privacy?.quickInfo !== false && (
        <div className="pp-sidebar-card">
          <h3 className="pp-sidebar-title">Quick Info</h3>
          <div className="pp-quick-info">
            {(p.dateOfBirth || p.age) && (
              <div className="pp-qi-item"><FaUserAstronaut /><div><div className="pp-qi-label">AGE</div><div className="pp-qi-val">{p.dateOfBirth ? calculateAge(p.dateOfBirth) : p.age}</div></div></div>
            )}
            {p.nationality && (
              <div className="pp-qi-item"><MdPublic /><div><div className="pp-qi-label">NATIONALITY</div><div className="pp-qi-val">{p.nationality}</div></div></div>
            )}
            {p.workTypePreference && (
              <div className="pp-qi-item"><FaCog /><div><div className="pp-qi-label">WORK TYPE</div><div className="pp-qi-val">{p.workTypePreference}</div></div></div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="pp-sidebar-card">
        <button onClick={onShare} className="pp-action-btn pp-action-btn--ghost">Share Profile</button>
        <button onClick={() => onNavigate("edit")} className="pp-action-btn pp-action-btn--primary" style={{ background: st.accent }}>Edit Profile</button>
      </div>

      {/* Skills */}
      {p.privacy?.skills !== false && p.skills?.length > 0 && (
        <div className="pp-sidebar-card">
          <h3 className="pp-sidebar-title">Skills</h3>
          <SectionSkills p={p} st={st} />
        </div>
      )}

      {/* Education */}
      {p.privacy?.education !== false && p.education?.length > 0 && (
        <div className="pp-sidebar-card">
          <h3 className="pp-sidebar-title">Education</h3>
          <SectionEducation p={p} st={st} />
        </div>
      )}

      {/* Languages */}
      {p.privacy?.languages !== false && p.languages?.length > 0 && (
        <div className="pp-sidebar-card">
          <h3 className="pp-sidebar-title">Languages</h3>
          <SectionLanguages p={p} />
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   LAYOUT RENDERERS — MATCHING PreviewMini
═══════════════════════════════════════════ */

function LayoutSidebar({ p, st, onPreview, onShare, onNavigate }) {
  // Filter sections by visibleSections, respecting sectionOrder
  const visibleOrder = (st.sectionOrder || SECTION_RENDERERS_ORDER).filter(
    key => st.visibleSections[key] !== false
  );

  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 24 }}>
      {/* Left: Sidebar Panel */}
      <SidebarPanel p={p} st={st} onShare={onShare} onNavigate={onNavigate} />
      
      {/* Right: Main Content */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {visibleOrder.map((key, i) => (
          <RenderSection key={key} sectionKey={key} p={p} st={st} onPreview={onPreview} delay={i * 80} />
        ))}
      </div>
    </div>
  );
}

function LayoutMinimal({ p, st, onPreview, onShare, onNavigate }) {
  // Filter sections by visibleSections, respecting sectionOrder
  const visibleOrder = (st.sectionOrder || SECTION_RENDERERS_ORDER).filter(
    key => st.visibleSections[key] !== false
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, maxWidth: "100%", margin: "0 auto" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, width: "100%" }}>
        <div style={{ textAlign: "center" }}>
          <button onClick={onShare} className="pp-action-btn pp-action-btn--ghost" style={{ marginRight: 8 }}>Share</button>
          <button onClick={() => onNavigate("edit")} className="pp-action-btn pp-action-btn--primary" style={{ background: st.accent }}>Edit</button>
        </div>
      </div>
      
      {visibleOrder.map((key, i) => (
        <div key={key} style={{ width: "100%" }}>
          <RenderSection sectionKey={key} p={p} st={st} onPreview={onPreview} delay={i * 80} />
        </div>
      ))}
    </div>
  );
}

function LayoutGrid({ p, st, onPreview, onShare, onNavigate }) {
  // Filter sections by visibleSections, respecting sectionOrder
  const visibleOrder = (st.sectionOrder || SECTION_RENDERERS_ORDER).filter(
    key => st.visibleSections[key] !== false
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header actions */}
      <div style={{ textAlign: "center" }}>
        <button onClick={onShare} className="pp-action-btn pp-action-btn--ghost" style={{ marginRight: 8 }}>Share</button>
        <button onClick={() => onNavigate("edit")} className="pp-action-btn pp-action-btn--primary" style={{ background: st.accent }}>Edit</button>
      </div>

      {/* Sections in 2-column grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {visibleOrder.map((key, i) => (
          <div key={key}>
            <RenderSection sectionKey={key} p={p} st={st} onPreview={onPreview} delay={i * 80} />
          </div>
        ))}
      </div>
    </div>
  );
}

function LayoutSplit({ p, st, onPreview, onShare, onNavigate }) {
  // Filter sections by visibleSections, respecting sectionOrder
  const visibleOrder = (st.sectionOrder || SECTION_RENDERERS_ORDER).filter(
    key => st.visibleSections[key] !== false
  );
  
  const half = Math.ceil(visibleOrder.length / 2);
  const leftK = visibleOrder.slice(0, half);
  const rightK = visibleOrder.slice(half);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
      {/* Left Column */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {leftK.map((key, i) => (
          <RenderSection key={key} sectionKey={key} p={p} st={st} onPreview={onPreview} delay={i * 80} />
        ))}
      </div>

      {/* Right Column */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ textAlign: "center" }}>
          <button onClick={onShare} className="pp-action-btn pp-action-btn--ghost" style={{ marginRight: 8 }}>Share</button>
          <button onClick={() => onNavigate("edit")} className="pp-action-btn pp-action-btn--primary" style={{ background: st.accent }}>Edit</button>
        </div>
        {rightK.map((key, i) => (
          <RenderSection key={key} sectionKey={key} p={p} st={st} onPreview={onPreview} delay={i * 80 + 35} />
        ))}
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
const ProfilePublic = ({ onNavigate }) => {
  const userId = localStorage.getItem("userId");
  const [previewImage, setPreviewImage] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const res  = await fetch(`${BASE_URL}/api/profiles?userId=${userId}`);
      const json = await res.json();
      const p    = Array.isArray(json) ? json[0] : json;
      if (!p) return {};
      return {
        ...p,
        skills:         (p.skills || []).map((s, i) => typeof s === "string" ? { id: i + 1, name: s, level: "" } : { ...s, id: i + 1 }),
        experience:     (p.experience || []).map((e, i) => ({ ...e, id: i + 1, title: e.role || e.title || "" })),
        education:      (p.education  || []).map((e, i) => ({ ...e, id: i + 1, school: e.institution || e.school || "" })),
        languages:      (p.languages  || []).map((l, i) => ({ ...l, id: i + 1, name: l.language || l.name || "" })),
        certifications: (p.certifications || []).map((c, i) => ({ ...c, id: i + 1, issueDate: c.date || c.issueDate || "" })),
        projects:       (p.projects || []).map((proj, i) => ({ ...proj, id: i + 1 })),
      };
    },
    enabled: !!userId,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const profileData = data || {};

  /* Merge style: backend style → defaults with validation */
  const st = useMemo(() => {
    const backendStyle = profileData.style && typeof profileData.style === "object" ? profileData.style : {};
    
    // Validate individual fields with proper type checking
    return {
      // Theme & Color
      themeIdx:        Number.isInteger(backendStyle.themeIdx) ? Math.max(0, Math.min(7, backendStyle.themeIdx)) : DEFAULT_STYLE.themeIdx,
      accent:          typeof backendStyle.accent === "string" ? backendStyle.accent : DEFAULT_STYLE.accent,
      fontId:          FONT_STACKS.hasOwnProperty(backendStyle.fontId) ? backendStyle.fontId : DEFAULT_STYLE.fontId,
      
      // Typography
      fontSize:        Number.isInteger(backendStyle.fontSize) ? Math.max(12, Math.min(20, backendStyle.fontSize)) : DEFAULT_STYLE.fontSize,
      lineSpacing:     Number.isInteger(backendStyle.lineSpacing) ? Math.max(16, Math.min(48, backendStyle.lineSpacing)) : DEFAULT_STYLE.lineSpacing,
      
      // Cards & Spacing
      cardRadius:      Number.isInteger(backendStyle.cardRadius) ? Math.max(0, Math.min(24, backendStyle.cardRadius)) : DEFAULT_STYLE.cardRadius,
      shadowPx:        Number.isInteger(backendStyle.shadowPx) ? Math.max(0, Math.min(48, backendStyle.shadowPx)) : DEFAULT_STYLE.shadowPx,
      
      // Layout & Display
      layout:          ["sidebar","minimal","grid","split"].includes(backendStyle.layout) ? backendStyle.layout : DEFAULT_STYLE.layout,
      darkMode:        typeof backendStyle.darkMode === "boolean" ? backendStyle.darkMode : DEFAULT_STYLE.darkMode,
      sectionOrder:    Array.isArray(backendStyle.sectionOrder) ? backendStyle.sectionOrder : DEFAULT_STYLE.sectionOrder,
      visibleSections: typeof backendStyle.visibleSections === "object" ? backendStyle.visibleSections : DEFAULT_STYLE.visibleSections,
      
      // Header & Alignment
      alignment:       ["left","center"].includes(backendStyle.alignment) ? backendStyle.alignment : DEFAULT_STYLE.alignment,
      containerWidth:  ["sm","md","lg","full"].includes(backendStyle.containerWidth) ? backendStyle.containerWidth : DEFAULT_STYLE.containerWidth,
      headerStyle:     ["classic","banner","compact"].includes(backendStyle.headerStyle) ? backendStyle.headerStyle : DEFAULT_STYLE.headerStyle,
      
      // Component Styles
      skillStyle:      ["pill","badge","bar","dot"].includes(backendStyle.skillStyle) ? backendStyle.skillStyle : DEFAULT_STYLE.skillStyle,
      timelineStyle:   ["line","compact","card"].includes(backendStyle.timelineStyle) ? backendStyle.timelineStyle : DEFAULT_STYLE.timelineStyle,
      
      // Cover image
      coverImage:      typeof backendStyle.coverImage === "string" ? backendStyle.coverImage : DEFAULT_STYLE.coverImage,

      // Legacy/computed
      avatarSize:      Number.isInteger(backendStyle.avatarSize) ? Math.max(48, Math.min(140, backendStyle.avatarSize)) : DEFAULT_STYLE.avatarSize,
      animation:       ["fade","slide","pop","none"].includes(backendStyle.animation) ? backendStyle.animation : DEFAULT_STYLE.animation,
    };
  }, [profileData.style]);

  const handleShareProfile = useCallback(() => {
    const url = window.location.href;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url)
        .then(() => alert("Profile link copied!"))
        .catch(() => { prompt("Copy this link:", url); });
    } else {
      prompt("Copy this link:", url);
    }
  }, []);

  const hasProfileData = !!profileData?.userId;

  /* Loading */
  if (isLoading) {
    return (
      <div className="pp-loading">
        <div className="pp-loading-spinner" />
        <h2 className="pp-loading-title">Loading Profile…</h2>
        <p className="pp-loading-sub">Fetching your information</p>
      </div>
    );
  }

  /* Empty */
  if (!hasProfileData) {
    return (
      <div className="pp-empty">
        <div className="pp-empty-icon"><FaUserAstronaut /></div>
        <h1 className="pp-empty-title">No Profile Yet</h1>
        <p className="pp-empty-desc">Build your professional profile to showcase your skills and experience.</p>
        <button onClick={() => onNavigate("edit")} className="pp-empty-btn">Create Your Profile</button>
      </div>
    );
  }

  /* Header */
  const headerMap = {
    classic: <HeaderClassic p={profileData} st={st} />,
    banner:  <HeaderBanner  p={profileData} st={st} />,
    compact: <HeaderCompact p={profileData} st={st} />,
  };
  const headerEl = headerMap[st.headerStyle] || headerMap.classic;

  /* Layout */
  const layoutProps = { p: profileData, st, onPreview: setPreviewImage, onShare: handleShareProfile, onNavigate };
  const layoutMap = {
    sidebar: <LayoutSidebar {...layoutProps} />,
    minimal: <LayoutMinimal {...layoutProps} />,
    grid:    <LayoutGrid    {...layoutProps} />,
    split:   <LayoutSplit   {...layoutProps} />,
  };
  const layoutEl = layoutMap[st.layout] || layoutMap.sidebar;

  return (
    <div className="pp-root" data-layout={st.layout} data-dark={st.darkMode} data-theme-idx={st.themeIdx}>
      <StyleInjector st={st} />

      {/* Header */}
      <Animated animation={st.animation} delay={0}>
        <div style={{ marginBottom: 20 }}>
          {headerEl}
        </div>
      </Animated>

      {/* Stats */}
      <div style={{ maxWidth: "var(--pp-container)", margin: "0 auto", padding: "0 12px" }}>
        <Animated animation={st.animation} delay={100}>
          <StatsBar p={profileData} st={st} />
        </Animated>
      </div>

      {/* Main content — apply containerWidth and padding */}
      <div style={{ maxWidth: "var(--pp-container)", margin: "0 auto", padding: "0 12px" }}>
        {layoutEl}
      </div>

      {/* Image preview modal */}
      {previewImage && (
        <div className="pp-modal-overlay" onClick={() => setPreviewImage(null)}>
          <div className="pp-modal-inner" onClick={e => e.stopPropagation()}>
            <img src={previewImage} alt="Preview" className="pp-modal-img" />
            <button className="pp-modal-close" onClick={() => setPreviewImage(null)}>
              <FaTimes />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePublic;