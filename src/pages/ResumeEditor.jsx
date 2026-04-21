import "./ResumeEditor.css";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════════
   ค่าคงที่ & ข้อมูล
═══════════════════════════════════════════════════════════════ */
const DRAFT_KEY       = "resume_editor_v3_draft";
const API_BASE        = import.meta.env.VITE_API_URL || "http://localhost:3000";
const API_URL         = `${API_BASE}/api/resume`;
const REQUEST_TIMEOUT = 10000;
const MAX_RETRIES     = 2;

const LANG_LEVELS    = ["เจ้าของภาษา","คล่องแคล่ว","ขั้นสูง","ระดับกลาง","เบื้องต้น"];
const LANG_LEVEL_PCT = { เจ้าของภาษา:100, คล่องแคล่ว:85, ขั้นสูง:68, ระดับกลาง:50, เบื้องต้น:28 };

const SKILL_SUGGESTIONS = [
  "React","Vue","Angular","Next.js","TypeScript","JavaScript","Python","Node.js",
  "Java","C#","PHP","Laravel","Django","FastAPI","GraphQL","REST API","Docker",
  "Kubernetes","AWS","GCP","Azure","PostgreSQL","MySQL","MongoDB","Redis",
  "Git","CI/CD","Figma","Tailwind CSS","HTML","CSS","Linux","Agile","Scrum",
];

const TEMPLATES = [
  { id:"modern",  label:"Modern",  desc:"Stripe + Avatar Hero — header รูปซ้าย แถบสี",          accent:"#1e3a5f" },
  { id:"minimal", label:"Minimal", desc:"Centered Typography — เรียบสะอาด ตัวหนังสือเป็นหลัก",  accent:"#2d2d2d" },
  { id:"bold",    label:"Bold",    desc:"2-Column Sidebar — sidebar สีเข้มซ้าย + content ขวา",   accent:"#8b1a1a" },
  { id:"forest",  label:"Forest",  desc:"Timeline Style — เส้น timeline + icon bullets สดใส",    accent:"#1a4a2e" },
  { id:"dusk",    label:"Dusk",    desc:"Luxury Gradient — header gradient + 2-column หรูหรา",   accent:"#4a2d6b" },
];

// Backend-supported template names (must match Backend)
const BACKEND_TEMPLATES = ["modern", "minimal", "bold", "forest", "dusk"];

const JOB_ROLES = [
  { id:"",          label:"— เลือกสายงาน —" },
  { id:"frontend",  label:"นักพัฒนา Frontend" },
  { id:"backend",   label:"นักพัฒนา Backend" },
  { id:"fullstack", label:"นักพัฒนา Full Stack" },
  { id:"data",      label:"นักวิเคราะห์ข้อมูล" },
  { id:"uxui",      label:"นักออกแบบ UX/UI" },
];

const ROLE_KEYWORDS = {
  frontend:  ["React","Vue","Next.js","TypeScript","JavaScript","HTML","CSS","Tailwind CSS","Figma","Webpack"],
  backend:   ["Node.js","Express","Python","Django","FastAPI","PostgreSQL","MySQL","MongoDB","Redis","Docker"],
  fullstack: ["React","Node.js","TypeScript","REST API","GraphQL","Docker","PostgreSQL","AWS","CI/CD","Git"],
  data:      ["Python","SQL","Pandas","NumPy","Power BI","Tableau","Machine Learning","Excel","R","Jupyter"],
  uxui:      ["Figma","Adobe XD","Sketch","Prototyping","Wireframing","User Research","Design System","HTML","CSS","Zeplin"],
};

const FORM_SECTIONS = [
  { id:"profile",        label:"โปรไฟล์",        icon:"◈" },
  { id:"contact",        label:"ข้อมูลติดต่อ",    icon:"☎" },
  { id:"summary",        label:"สรุปตัวเอง",      icon:"≡" },
  { id:"skills",         label:"ทักษะ",           icon:"◇" },
  { id:"experience",     label:"ประสบการณ์",      icon:"◉" },
  { id:"education",      label:"การศึกษา",        icon:"▣" },
  { id:"languages",      label:"ภาษา",            icon:"◎" },
  { id:"certifications", label:"ใบรับรอง",        icon:"★" },
  { id:"projects",       label:"โปรเจกต์",        icon:"◆" },
];

const EMPTY_RESUME = {
  fullName:"", jobTitle:"", summary:"",
  email:"", phone:"", location:"",
  linkedin:"", github:"", website:"",
  skills:[], education:[], experience:[], languages:[],
  certifications:[], projects:[],
  profileImage:"",
};

/* ═══════════════════════════════════════════════════════════════
   ฟังก์ชันช่วยเหลือ
═══════════════════════════════════════════════════════════════ */
function uid() { return Math.random().toString(36).slice(2,9); }

function isValidForDraft(resume) {
  return !!(
    resume.fullName?.trim().length > 0 &&
    (resume.jobTitle?.trim().length > 0 || resume.summary?.trim().length > 0 || resume.skills?.length > 0)
  );
}

function saveDraft(data) {
  try {
    if (!isValidForDraft(data)) return;
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ ts:Date.now(), version:1, data }));
  } catch(e) { console.error("บันทึก draft ไม่สำเร็จ:", e); }
}

function loadDraft() {
  try { const r = localStorage.getItem(DRAFT_KEY); return r ? JSON.parse(r) : null; }
  catch(e) { return null; }
}

function clearDraft() {
  try { localStorage.removeItem(DRAFT_KEY); } catch(e) {}
}

// ✅ API Response Validator & Normalizer
function validateApiResponse(response, requiredFields = ['data']) {
  if (!response?.success) {
    throw new Error("API returned non-success status");
  }
  const data = response.data;
  if (!data) {
    throw new Error("API response missing data field");
  }
  for (const field of requiredFields) {
    if (!(field in data)) {
      throw new Error(`API response missing required field: ${field}`);
    }
  }
  return data;
}

// ✅ Normalize resume data from API
function normalizeResumeData(apiData) {
  if (!apiData || typeof apiData !== 'object') {
    throw new Error('Invalid resume data format');
  }
  
  // Validate template
  const template = apiData.template || 'modern';
  if (!BACKEND_TEMPLATES.includes(template)) {
    console.warn(`Invalid template "${template}", using 'modern' instead`);
  }
  
  return {
    fullName:     String(apiData.fullName || "").trim(),
    jobTitle:     String(apiData.jobTitle || "").trim(),
    summary:      String(apiData.summary || "").trim(),
    email:        String(apiData.email || "").trim(),
    phone:        String(apiData.phone || "").trim(),
    location:     String(apiData.location || "").trim(),
    linkedin:     String(apiData.linkedin || "").trim(),
    github:       String(apiData.github || "").trim(),
    website:      String(apiData.website || "").trim(),
    profileImage: String(apiData.profileImage || ""),
    skills:       Array.isArray(apiData.skills) ? apiData.skills.map(s => String(s || "").trim()).filter(Boolean) : [],
    experience:   Array.isArray(apiData.experience) 
      ? apiData.experience.map(e => ({
          _id:         e._id || uid(),
          position:    String(e.position || "").trim(),
          company:     String(e.company || "").trim(),
          startDate:   String(e.startDate || "").trim(),
          endDate:     String(e.endDate || "").trim(),
          description: String(e.description || "").trim(),
        }))
      : [],
    education:    Array.isArray(apiData.education)
      ? apiData.education.map(e => ({
          _id:       e._id || uid(),
          school:    String(e.school || "").trim(),
          degree:    String(e.degree || "").trim(),
          startYear: String(e.startYear || "").trim(),
          endYear:   String(e.endYear || "").trim(),
        }))
      : [],
    languages:    Array.isArray(apiData.languages)
      ? apiData.languages.map(l => ({
          _id:   l._id || uid(),
          name:  String(l.name || "").trim(),
          level: String(l.level || "").trim() || "ระดับกลาง",
        }))
      : [],
    certifications: Array.isArray(apiData.certifications)
      ? apiData.certifications.map(c => ({
          _id:       c._id || uid(),
          name:      String(c.name || "").trim(),
          issuer:    String(c.issuer || "").trim(),
          issueDate: String(c.issueDate || "").trim(),
        }))
      : [],
    projects: Array.isArray(apiData.projects)
      ? apiData.projects.map(p => ({
          _id:       p._id || uid(),
          name:      String(p.name || "").trim(),
          techStack: String(p.techStack || "").trim(),
          link:      String(p.link || "").trim(),
        }))
      : [],
  };
}

async function retryFetch(fn, maxRetries=MAX_RETRIES, delay=300) {
  let last;
  for(let i=0; i<=maxRetries; i++) {
    try { return await fn(); }
    catch(e) {
      last = e;
      if(i < maxRetries) await new Promise(r => setTimeout(r, delay * Math.pow(2,i)));
    }
  }
  throw last;
}

async function fetchWithTimeout(url, opts={}, timeout=REQUEST_TIMEOUT) {
  const ctrl = new AbortController();
  const tid  = setTimeout(() => ctrl.abort(), timeout);
  try { return await fetch(url, { ...opts, signal: ctrl.signal }); }
  finally { clearTimeout(tid); }
}

function calcCompletion(resume) {
  const checks = [
    { key:"fullName",       label:"ชื่อ-นามสกุล",                    done: !!resume.fullName.trim() },
    { key:"jobTitle",       label:"ตำแหน่งงาน",                      done: !!resume.jobTitle.trim() },
    { key:"summary",        label:"สรุปตัวเอง (อย่างน้อย 30 ตัวอักษร)", done: resume.summary.trim().length > 30 },
    { key:"contact",        label:"ข้อมูลติดต่อ (อีเมลหรือเบอร์โทร)", done: !!(resume.email?.trim() || resume.phone?.trim()) },
    { key:"skills",         label:"ทักษะ (อย่างน้อย 3)",             done: resume.skills.length >= 3 },
    { key:"experience",     label:"ประสบการณ์ทำงาน",                 done: resume.experience.length > 0 },
    { key:"education",      label:"ประวัติการศึกษา",                  done: resume.education.length > 0 },
    { key:"languages",      label:"ภาษา",                             done: resume.languages.length > 0 },
    { key:"profileImage",   label:"รูปโปรไฟล์",                       done: !!resume.profileImage },
  ];
  const done = checks.filter(c => c.done).length;
  return { pct: Math.round((done/checks.length)*100), checks };
}

function getAccentColor(templateId) {
  return TEMPLATES.find(t => t.id === templateId)?.accent || "#1e3a5f";
}

function lightenColor(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, ((n>>16)&0xff)+80);
  const g = Math.min(255, ((n>>8)&0xff)+80);
  const b = Math.min(255, (n&0xff)+80);
  return `#${[r,g,b].map(v => v.toString(16).padStart(2,"0")).join("")}`;
}

/* ═══════════════════════════════════════════════════════════════
   Small components
═══════════════════════════════════════════════════════════════ */
function Spinner({ dark }) {
  return <span className={`re-spinner${dark?" re-spinner-dark":""}`} />;
}

function Toast({ toast }) {
  if(!toast) return null;
  const icons = { success:"✓", error:"✕", info:"ℹ" };
  return (
    <div className={`re-toast re-toast--${toast.type}`} role="alert">
      <span className="re-toast__icon">{icons[toast.type]||"ℹ"}</span>
      <span>{toast.message}</span>
    </div>
  );
}

function SLabel({ children, sub }) {
  return (
    <div className="re-section-label-wrap">
      <p className="re-section-label">{children}</p>
      {sub && <span className="re-section-label-sub">{sub}</span>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Top Navigation (replaces sidebar)
═══════════════════════════════════════════════════════════════ */
function TopNav({
  resume, activeSection, onNav,
  autoSavedAt, generating, saving, isDark,
  onGenerate, onSave, onReset, onToggleDark, onTogglePreview,
}) {
  const { pct, checks } = calcCompletion(resume);
  const checkMap = Object.fromEntries(checks.map(c => [c.key, c.done]));

  const sectionDone = {
    profile:        checkMap.fullName && checkMap.jobTitle && checkMap.profileImage,
    contact:        checkMap.contact,
    summary:        checkMap.summary,
    skills:         checkMap.skills,
    experience:     checkMap.experience,
    education:      checkMap.education,
    languages:      checkMap.languages,
    certifications: resume.certifications?.length > 0,
    projects:       resume.projects?.length > 0,
  };

  const barMod = pct >= 80 ? "high" : pct >= 50 ? "mid" : "low";
  const pctMod = barMod;

  return (
    <>
      <nav className="re-topnav">
        {/* Brand */}
        <div className="re-topnav__brand">
          <span className="re-topnav__logo">R</span>
          <span className="re-topnav__name">Resume</span>
        </div>

        {/* Step pills */}
        <div className="re-topnav__steps">
          {FORM_SECTIONS.map(sec => (
            <button
              key={sec.id}
              className={`re-step${activeSection===sec.id?" re-step--active":""}${sectionDone[sec.id]?" re-step--done":""}`}
              onClick={() => onNav(sec.id)}
              title={sec.label}
            >
              <span className="re-step__dot" />
              <span className="re-step__label">{sec.label}</span>
              {/* icon shown on narrow screens via CSS content */}
              <span className="re-step__icon" aria-hidden="true" style={{ display:"none" }}>{sec.icon}</span>
            </button>
          ))}
        </div>

        {/* Right actions */}
        <div className="re-topnav__actions">
          {autoSavedAt && (
            <span className="re-topnav__save-status">
              <span className="re-autosave-dot" />
              บันทึกแล้ว
            </span>
          )}

          {/* Preview toggle — visible only ≤1099px via CSS */}
          <button className="re-preview-toggle" onClick={onTogglePreview} title="ดูตัวอย่าง">
            👁 ดูตัวอย่าง
          </button>

          <button
            className="re-btn re-btn-ghost re-btn-sm"
            onClick={onGenerate}
            disabled={generating}
            title="สร้างจากโปรไฟล์"
          >
            {generating ? <><Spinner dark={!isDark} />กำลังสร้าง…</> : <>✦ <span className="re-btn-generate-label">จากโปรไฟล์</span></>}
          </button>

          <button className="re-btn re-btn-primary re-btn-sm" onClick={onSave} disabled={saving}>
            {saving ? <><Spinner />กำลังบันทึก…</> : "บันทึก"}
          </button>

          <button
            className="re-btn re-btn-ghost re-btn-sm"
            onClick={onReset}
            title="ล้างข้อมูลทั้งหมดและเริ่มใหม่"
          >
            🗑
          </button>

          <button
            className="re-btn re-btn-dark-toggle"
            onClick={onToggleDark}
            title={isDark?"โหมดสว่าง":"โหมดมืด"}
          >
            {isDark ? "☀︎" : "☽"}
          </button>
        </div>
      </nav>

      {/* Progress bar */}
      <div className="re-progress-strip">
        <div
          className={`re-progress-strip__bar re-progress-strip__bar--${barMod}`}
          style={{ width:`${pct}%` }}
        />
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Feedback Panel (shared full-width strip)
═══════════════════════════════════════════════════════════════ */
function FeedbackPanel({ resume, onNav }) {
  const [open, setOpen] = useState(false);

  const feedbacks = useMemo(() => {
    const items = [];
    if(!resume.fullName.trim())        items.push({ level:"error", text:"ยังไม่ได้กรอกชื่อ-นามสกุล", section:"profile" });
    if(!resume.jobTitle.trim())        items.push({ level:"error", text:"ยังไม่ได้กรอกตำแหน่งงาน", section:"profile" });
    if(resume.experience.length===0)   items.push({ level:"error", text:"ยังไม่ได้เพิ่มประสบการณ์ทำงาน", section:"experience" });
    if(resume.education.length===0)    items.push({ level:"error", text:"ยังไม่ได้เพิ่มประวัติการศึกษา", section:"education" });
    if(!resume.email?.trim() && !resume.phone?.trim())
      items.push({ level:"error", text:"ยังไม่ได้กรอกอีเมลหรือเบอร์โทร (ต้องมีอย่างน้อย 1 อย่าง)", section:"contact" });
    if(resume.summary.trim().length>0 && resume.summary.trim().length<50)
      items.push({ level:"warn", text:`สรุปตัวเองสั้นเกินไป (${resume.summary.trim().length}/50 ตัวอักษร)`, section:"summary" });
    if(resume.summary.trim().length===0) items.push({ level:"warn", text:"ยังไม่ได้เขียนสรุปตัวเอง", section:"summary" });
    if(resume.skills.length>0 && resume.skills.length<3)
      items.push({ level:"warn", text:`ทักษะน้อยเกินไป (${resume.skills.length}/3)`, section:"skills" });
    if(resume.skills.length===0)       items.push({ level:"warn", text:"ยังไม่ได้เพิ่มทักษะ", section:"skills" });
    if(!resume.profileImage)           items.push({ level:"warn", text:"ยังไม่มีรูปโปรไฟล์", section:"profile" });
    if(resume.languages.length===0)    items.push({ level:"warn", text:"ยังไม่ได้เพิ่มข้อมูลภาษา", section:"languages" });
    if(!resume.linkedin?.trim() && !resume.github?.trim())
      items.push({ level:"warn", text:"แนะนำเพิ่ม LinkedIn หรือ GitHub เพื่อเพิ่มความน่าเชื่อถือ", section:"contact" });
    if(resume.certifications?.length===0 && resume.projects?.length===0)
      items.push({ level:"warn", text:"แนะนำเพิ่มใบรับรองหรือโปรเจกต์เพื่อให้ Resume โดดเด่นขึ้น", section:"certifications" });
    return items;
  }, [resume]);

  const errors = feedbacks.filter(f => f.level==="error");
  const warns  = feedbacks.filter(f => f.level==="warn");

  if(feedbacks.length===0) {
    return (
      <div className="re-feedback-strip">
        <div className="re-feedback-strip__inner">
          <span className="re-feedback-chip re-feedback-chip--ok">✓ Resume สมบูรณ์ พร้อมสมัครงาน!</span>
        </div>
      </div>
    );
  }

  return (
    <div className="re-feedback-strip">
      <div className="re-feedback-wrap">
        <button className="re-feedback-trigger" onClick={() => setOpen(v => !v)}>
          <div className="re-feedback-trigger__left">
            {errors.length>0 && <span className="re-feedback-badge re-feedback-badge--error">{errors.length} จำเป็น</span>}
            {warns.length>0  && <span className="re-feedback-badge re-feedback-badge--warn">{warns.length} แนะนำ</span>}
            <span className="re-feedback-trigger__text">คำแนะนำสำหรับ Resume</span>
          </div>
          <span className="re-feedback-trigger__chevron">{open?"▲":"▼"}</span>
        </button>
        {open && (
          <div className="re-feedback-list">
            {errors.map((f,i) => (
              <div key={i} className="re-feedback-item re-feedback-item--error re-feedback-item--clickable" onClick={() => onNav?.(f.section)} title="คลิกเพื่อไปที่ส่วนนี้">
                <span className="re-feedback-icon">✕</span><span>{f.text}</span><span className="re-feedback-goto">→</span>
              </div>
            ))}
            {warns.map((f,i) => (
              <div key={i} className="re-feedback-item re-feedback-item--warn re-feedback-item--clickable" onClick={() => onNav?.(f.section)} title="คลิกเพื่อไปที่ส่วนนี้">
                <span className="re-feedback-icon">–</span><span>{f.text}</span><span className="re-feedback-goto">→</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   JobRoleSelector, SkillsSection, ExperienceSection,
   EducationSection, LanguagesSection
   (ไม่มีการเปลี่ยนแปลง logic — เหมือนเดิมทุกประการ)
═══════════════════════════════════════════════════════════════ */
function JobRoleSelector({ jobRole, onRoleChange, skills, onSkillsChange }) {
  const keywords  = useMemo(() => ROLE_KEYWORDS[jobRole]||[], [jobRole]);
  const available = useMemo(() => keywords.filter(kw => !skills.some(s => s.toLowerCase() === kw.toLowerCase())), [keywords,skills]);

  const addKeyword = (kw) => { if(!skills.some(s => s.toLowerCase() === kw.toLowerCase())&&skills.length<10) onSkillsChange([...skills,kw]); };
  const addAll     = () => { const toAdd=available.slice(0,10-skills.length); if(toAdd.length>0) onSkillsChange([...skills,...toAdd]); };

  return (
    <div className="re-card">
      <div className="re-card__header">
        <SLabel>สายงาน &amp; คำสำคัญแนะนำ</SLabel>
        {jobRole && available.length>0 && (
          <button className="re-btn re-btn-ghost re-btn-sm" onClick={addAll} disabled={skills.length>=10}>+ เพิ่มทั้งหมด</button>
        )}
      </div>
      <select className="re-input re-select" value={jobRole} onChange={e => onRoleChange(e.target.value)}>
        {JOB_ROLES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
      </select>
      {jobRole && keywords.length>0 && (
        <div className="re-keywords-block">
          <p className="re-field-label re-keywords-label">คำสำคัญสำหรับสายงานนี้</p>
          <div className="re-keywords-wrap">
            {keywords.map(kw => {
              const already = skills.includes(kw);
              const full    = skills.length>=10 && !already;
              return (
                <button key={kw}
                  className={`re-keyword-chip${already?" re-keyword-chip--added":""}`}
                  onClick={() => !already&&!full&&addKeyword(kw)}
                  disabled={full}
                  title={already?"มีใน ทักษะ แล้ว":full?"ทักษะเต็ม 10":`เพิ่ม ${kw}`}
                >
                  {already?"✓ ":""}{kw}
                </button>
              );
            })}
          </div>
          {available.length===0 && <p className="re-keywords-ok"><span>✓</span><span>เพิ่มคำสำคัญครบแล้ว</span></p>}
        </div>
      )}
      {!jobRole && <p className="re-keywords-hint">เลือกสายงานเพื่อดูคำสำคัญแนะนำ</p>}
    </div>
  );
}

function SkillsSection({ skills, onChange }) {
  const [val, setVal]         = useState("");
  const [hoverId, setHoverId] = useState(-1);

  const suggestions = val.trim().length>0
    ? SKILL_SUGGESTIONS.filter(sk => sk.toLowerCase().includes(val.toLowerCase()) && !skills.some(s => s.toLowerCase() === sk.toLowerCase())).slice(0,6)
    : [];

  const addSkill = (skill) => {
    const t = (skill||val).trim();
    if(t && !skills.some(s => s.toLowerCase() === t.toLowerCase()) && skills.length<10) onChange([...skills,t]);
    setVal(""); setHoverId(-1);
  };

  const remove = (sk) => {
    if(!window.confirm(`ลบทักษะ "${sk}" ใช่หรือไม่?`)) return;
    onChange(skills.filter(x => x!==sk));
  };

  return (
    <div className="re-card">
      <div className="re-card__header">
        <SLabel>ทักษะความสามารถ</SLabel>
        <span className="re-skills-count">{skills.length}/10</span>
      </div>
      <div className="re-tags-wrap">
        {skills.map(sk => (
          <span key={sk} className="re-tag">
            {sk}
            <button className="re-tag__x" onClick={() => remove(sk)} aria-label={`ลบ ${sk}`}>×</button>
          </span>
        ))}
        {skills.length===0 && <span className="re-empty-hint">ยังไม่มีทักษะ — เพิ่มด้านล่างได้เลย</span>}
      </div>
      {skills.length<10 && (
        <div className="re-add-row">
          <div className="re-add-row__inner">
            <input
              className="re-input"
              placeholder="พิมพ์ทักษะแล้วกด Enter…"
              value={val}
              onChange={e => { setVal(e.target.value); setHoverId(-1); }}
              onKeyDown={e => {
                if(e.key==="Enter"||e.key===",") { e.preventDefault(); addSkill(); }
                if(e.key==="ArrowDown") { e.preventDefault(); setHoverId(h => Math.min(h+1,suggestions.length-1)); }
                if(e.key==="ArrowUp")   { e.preventDefault(); setHoverId(h => Math.max(h-1,-1)); }
                if(e.key==="Escape")    { setVal(""); setHoverId(-1); }
              }}
            />
            <button className="re-btn re-btn-ghost" onClick={() => addSkill()} disabled={!val.trim()}>เพิ่ม</button>
          </div>
          {suggestions.length>0 && (
            <div className="re-autocomplete">
              {suggestions.map((sg,i) => (
                <div key={sg}
                  className={`re-autocomplete__item${i===hoverId?" re-autocomplete__item--hover":""}`}
                  onMouseEnter={() => setHoverId(i)}
                  onMouseLeave={() => setHoverId(-1)}
                  onMouseDown={e => { e.preventDefault(); addSkill(sg); }}
                >
                  {sg}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ExperienceSection({ experience, onChange }) {
  const [adding, setAdding]     = useState(false);
  const [expanded, setExpanded] = useState({});
  const [dragIdx, setDragIdx]   = useState(null);
  const [overIdx, setOverIdx]   = useState(null);
  const [form, setForm]         = useState({ company:"", position:"", startDate:"", endDate:"", description:"" });

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]:!prev[id] }));

  const add = () => {
    if(!form.company.trim()) return;
    const item = { _id:uid(), ...form };
    onChange([item, ...experience]);
    setExpanded(prev => ({ ...prev, [item._id]:true }));
    setForm({ company:"", position:"", startDate:"", endDate:"", description:"" });
    setAdding(false);
  };

  const remove = (id) => {
    const exp = experience.find(e => e._id===id);
    if(!window.confirm(`ลบประสบการณ์ที่ "${exp?.company||"ไม่ระบุ"}" ใช่หรือไม่?`)) return;
    onChange(experience.filter(e => e._id!==id));
  };

  const update = (id, field, value) => onChange(experience.map(e => e._id===id ? { ...e, [field]:value } : e));

  const handleDrop = (targetIdx) => {
    if(dragIdx===null||dragIdx===targetIdx) return;
    const arr = [...experience];
    const [moved] = arr.splice(dragIdx, 1);
    arr.splice(targetIdx, 0, moved);
    onChange(arr);
    setDragIdx(null); setOverIdx(null);
  };

  return (
    <div className="re-card">
      <div className="re-card__header">
        <SLabel sub={experience.length>0 ? `${experience.length} รายการ` : null}>ประสบการณ์ทำงาน</SLabel>
        <button className="re-btn re-btn-ghost re-btn-sm" onClick={() => setAdding(v => !v)}>
          {adding?"ยกเลิก":"+ เพิ่ม"}
        </button>
      </div>

      {adding && (
        <div className="re-add-form re-add-form--top">
          <p className="re-add-form__title">เพิ่มประสบการณ์ใหม่</p>
          <div className="re-input-grid">
            <div><label className="re-field-label">บริษัท *</label><input className="re-input" placeholder="Google" value={form.company} onChange={e => setForm({...form,company:e.target.value})} /></div>
            <div><label className="re-field-label">ตำแหน่ง</label><input className="re-input" placeholder="Software Engineer" value={form.position} onChange={e => setForm({...form,position:e.target.value})} /></div>
            <div><label className="re-field-label">วันที่เริ่ม</label><input className="re-input" placeholder="ม.ค. 2564" value={form.startDate} onChange={e => setForm({...form,startDate:e.target.value})} /></div>
            <div><label className="re-field-label">วันที่สิ้นสุด</label><input className="re-input" placeholder="ปัจจุบัน" value={form.endDate} onChange={e => setForm({...form,endDate:e.target.value})} /></div>
            <div className="re-input-full">
              <label className="re-field-label">รายละเอียดงาน</label>
              <textarea className="re-input re-textarea" rows={3} placeholder="หน้าที่รับผิดชอบและความสำเร็จ…" value={form.description} onChange={e => setForm({...form,description:e.target.value})} />
            </div>
          </div>
          <div className="re-add-form__actions">
            <button className="re-btn re-btn-ghost re-btn-sm" onClick={() => setAdding(false)}>ยกเลิก</button>
            <button className="re-btn re-btn-primary re-btn-sm" onClick={add} disabled={!form.company.trim()}>บันทึก</button>
          </div>
        </div>
      )}

      {experience.map((exp, idx) => (
        <div key={exp._id} draggable
          onDragStart={() => setDragIdx(idx)}
          onDragOver={e => { e.preventDefault(); setOverIdx(idx); }}
          onDrop={() => handleDrop(idx)}
          onDragEnd={() => { setDragIdx(null); setOverIdx(null); }}
          className={`re-list-item${dragIdx===idx?" re-list-item--dragging":""}${overIdx===idx?" re-list-item--dragover":""}`}
        >
          <div className="re-list-item__head" onClick={() => toggleExpand(exp._id)} style={{ cursor:"pointer" }}>
            <div className="re-list-item__head-left">
              <span className="re-drag-handle" onMouseDown={e => e.stopPropagation()}>⠿</span>
              <div>
                <div className="re-list-item__title">{exp.position||<em style={{opacity:.4}}>ตำแหน่ง</em>}</div>
                <div className="re-list-item__sub">
                  {exp.company}
                  {(exp.startDate||exp.endDate) && <span className="re-list-item__date"> · {exp.startDate}{exp.endDate?`–${exp.endDate}`:""}</span>}
                </div>
              </div>
            </div>
            <div className="re-list-item__meta">
              <button className="re-btn re-btn-danger re-btn-icon" onClick={e => { e.stopPropagation(); remove(exp._id); }} title="ลบ">×</button>
              <span className="re-list-item__chevron">{expanded[exp._id]?"▲":"▼"}</span>
            </div>
          </div>
          {expanded[exp._id] && (
            <div className="re-list-item__body">
              <div className="re-input-grid">
                <div><label className="re-field-label">บริษัท</label><input className="re-input" value={exp.company} onChange={e => update(exp._id,"company",e.target.value)} /></div>
                <div><label className="re-field-label">ตำแหน่ง</label><input className="re-input" value={exp.position} onChange={e => update(exp._id,"position",e.target.value)} /></div>
                <div><label className="re-field-label">วันที่เริ่ม</label><input className="re-input" value={exp.startDate} placeholder="ม.ค. 2564" onChange={e => update(exp._id,"startDate",e.target.value)} /></div>
                <div><label className="re-field-label">วันที่สิ้นสุด</label><input className="re-input" value={exp.endDate} placeholder="ปัจจุบัน" onChange={e => update(exp._id,"endDate",e.target.value)} /></div>
                <div className="re-input-full">
                  <label className="re-field-label">รายละเอียดงาน</label>
                  <textarea className="re-input re-textarea" rows={3} value={exp.description} placeholder="หน้าที่รับผิดชอบและความสำเร็จ…" onChange={e => update(exp._id,"description",e.target.value)} />
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {experience.length===0 && !adding && (
        <div className="re-empty-state">
          <span className="re-empty-state__icon">◉</span>
          <p>ยังไม่มีประสบการณ์ทำงาน</p>
          <button className="re-btn re-btn-ghost re-btn-sm" onClick={() => setAdding(true)}>+ เพิ่มรายการแรก</button>
        </div>
      )}
    </div>
  );
}

function EducationSection({ education, onChange }) {
  const [adding, setAdding]     = useState(false);
  const [expanded, setExpanded] = useState({});
  const [form, setForm]         = useState({ school:"", degree:"", startYear:"", endYear:"" });

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]:!prev[id] }));

  const add = () => {
    if(!form.school.trim()) return;
    const item = { _id:uid(), ...form };
    onChange([...education, item]);
    setExpanded(prev => ({ ...prev, [item._id]:true }));
    setForm({ school:"", degree:"", startYear:"", endYear:"" });
    setAdding(false);
  };

  const remove = (id) => {
    const edu = education.find(e => e._id===id);
    if(!window.confirm(`ลบประวัติการศึกษาที่ "${edu?.school||"ไม่ระบุ"}" ใช่หรือไม่?`)) return;
    onChange(education.filter(e => e._id!==id));
  };

  const update = (id, field, value) => onChange(education.map(e => e._id===id ? { ...e, [field]:value } : e));

  return (
    <div className="re-card">
      <div className="re-card__header">
        <SLabel sub={education.length>0 ? `${education.length} รายการ` : null}>ประวัติการศึกษา</SLabel>
        <button className="re-btn re-btn-ghost re-btn-sm" onClick={() => setAdding(v => !v)}>
          {adding?"ยกเลิก":"+ เพิ่ม"}
        </button>
      </div>

      {adding && (
        <div className="re-add-form re-add-form--top">
          <p className="re-add-form__title">เพิ่มการศึกษาใหม่</p>
          <div className="re-input-grid">
            <div className="re-input-full"><label className="re-field-label">โรงเรียน / มหาวิทยาลัย *</label><input className="re-input" placeholder="จุฬาลงกรณ์มหาวิทยาลัย" value={form.school} onChange={e => setForm({...form,school:e.target.value})} /></div>
            <div className="re-input-full"><label className="re-field-label">วุฒิการศึกษา / สาขาวิชา</label><input className="re-input" placeholder="วิศวกรรมศาสตร์บัณฑิต สาขาคอมพิวเตอร์" value={form.degree} onChange={e => setForm({...form,degree:e.target.value})} /></div>
            <div><label className="re-field-label">ปีที่เข้าเรียน</label><input className="re-input" placeholder="2559" value={form.startYear} onChange={e => setForm({...form,startYear:e.target.value})} /></div>
            <div><label className="re-field-label">ปีที่สำเร็จการศึกษา</label><input className="re-input" placeholder="2563" value={form.endYear} onChange={e => setForm({...form,endYear:e.target.value})} /></div>
          </div>
          <div className="re-add-form__actions">
            <button className="re-btn re-btn-ghost re-btn-sm" onClick={() => setAdding(false)}>ยกเลิก</button>
            <button className="re-btn re-btn-primary re-btn-sm" onClick={add} disabled={!form.school.trim()}>บันทึก</button>
          </div>
        </div>
      )}

      {education.map(edu => (
        <div key={edu._id} className="re-list-item">
          <div className="re-list-item__head" onClick={() => toggleExpand(edu._id)} style={{ cursor:"pointer" }}>
            <div className="re-list-item__head-left">
              <div>
                <div className="re-list-item__title">{edu.school||<em style={{opacity:.4}}>โรงเรียน</em>}</div>
                <div className="re-list-item__sub">{edu.degree}{edu.startYear?` · ${edu.startYear}–${edu.endYear||"?"}`:""}</div>
              </div>
            </div>
            <div className="re-list-item__meta">
              <button className="re-btn re-btn-danger re-btn-icon" onClick={e => { e.stopPropagation(); remove(edu._id); }} title="ลบ">×</button>
              <span className="re-list-item__chevron">{expanded[edu._id]?"▲":"▼"}</span>
            </div>
          </div>
          {expanded[edu._id] && (
            <div className="re-list-item__body">
              <div className="re-input-grid">
                <div className="re-input-full"><label className="re-field-label">โรงเรียน / มหาวิทยาลัย</label><input className="re-input" value={edu.school} onChange={e => update(edu._id,"school",e.target.value)} /></div>
                <div className="re-input-full"><label className="re-field-label">วุฒิการศึกษา / สาขาวิชา</label><input className="re-input" value={edu.degree} onChange={e => update(edu._id,"degree",e.target.value)} /></div>
                <div><label className="re-field-label">ปีที่เข้าเรียน</label><input className="re-input" placeholder="2559" value={edu.startYear} onChange={e => update(edu._id,"startYear",e.target.value)} /></div>
                <div><label className="re-field-label">ปีที่สำเร็จการศึกษา</label><input className="re-input" placeholder="2563" value={edu.endYear} onChange={e => update(edu._id,"endYear",e.target.value)} /></div>
              </div>
            </div>
          )}
        </div>
      ))}

      {education.length===0 && !adding && (
        <div className="re-empty-state">
          <span className="re-empty-state__icon">▣</span>
          <p>ยังไม่มีข้อมูลการศึกษา</p>
          <button className="re-btn re-btn-ghost re-btn-sm" onClick={() => setAdding(true)}>+ เพิ่มรายการแรก</button>
        </div>
      )}
    </div>
  );
}

function LanguagesSection({ languages, onChange }) {
  const add    = () => onChange([...languages, { _id:uid(), name:"", level:"ระดับกลาง" }]);
  const remove = (id) => {
    const lang = languages.find(l => l._id===id);
    if(!window.confirm(`ลบภาษา "${lang?.name||"ไม่ระบุ"}" ใช่หรือไม่?`)) return;
    onChange(languages.filter(l => l._id!==id));
  };
  const update = (id, field, val) => onChange(languages.map(l => l._id===id ? { ...l, [field]:val } : l));

  return (
    <div className="re-card">
      <div className="re-card__header">
        <SLabel>ภาษาที่ใช้ได้</SLabel>
        <button className="re-btn re-btn-ghost re-btn-sm" onClick={add}>+ เพิ่ม</button>
      </div>
      {languages.map(lang => (
        <div key={lang._id} className="re-lang-row">
          <input className="re-input" style={{ flex:1, minWidth:0 }} placeholder="ชื่อภาษา เช่น ภาษาอังกฤษ" value={lang.name} onChange={e => update(lang._id,"name",e.target.value)} />
          <select className="re-input re-select re-lang-select" value={lang.level} onChange={e => update(lang._id,"level",e.target.value)}>
            {LANG_LEVELS.map(l => <option key={l}>{l}</option>)}
          </select>
          <button className="re-btn re-btn-danger re-btn-icon" onClick={() => remove(lang._id)} title="ลบ">×</button>
        </div>
      ))}
      {languages.length===0 && (
        <div className="re-empty-state">
          <span className="re-empty-state__icon">◎</span>
          <p>ยังไม่มีข้อมูลภาษา</p>
          <button className="re-btn re-btn-ghost re-btn-sm" onClick={add}>+ เพิ่มรายการแรก</button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Resume Preview (paper)
═══════════════════════════════════════════════════════════════ */
const PAPER_RULE = "#e4e7ed";

function PaperSection({ title, accentColor, children }) {
  return (
    <div className="re-sec">
      <div className="re-sec__head" style={{ color:accentColor }}>
        <span className="re-sec__label">{title}</span>
        <div className="re-sec__rule" style={{ background:`${accentColor}30` }} />
      </div>
      {children}
    </div>
  );
}

/* ── Certifications Section ── */
function CertificationsSection({ certifications, onChange }) {
  const add    = () => onChange([...certifications, { _id:uid(), name:"", issuer:"", issueDate:"" }]);
  const remove = (id) => {
    const cert = certifications.find(c => c._id===id);
    if(!window.confirm(`ลบใบรับรอง "${cert?.name||"ไม่ระบุ"}" ใช่หรือไม่?`)) return;
    onChange(certifications.filter(c => c._id!==id));
  };
  const update = (id, field, val) => onChange(certifications.map(c => c._id===id ? { ...c, [field]:val } : c));

  return (
    <div className="re-card">
      <div className="re-card__header">
        <SLabel>ใบรับรอง / Certifications</SLabel>
        <button className="re-btn re-btn-ghost re-btn-sm" onClick={add}>+ เพิ่ม</button>
      </div>
      {certifications.map(cert => (
        <div key={cert._id} className="re-exp-form-row">
          <div className="re-input-grid">
            <div className="re-input-full">
              <label className="re-field-label">ชื่อใบรับรอง</label>
              <input className="re-input" placeholder="เช่น AWS Solutions Architect" value={cert.name} onChange={e => update(cert._id,"name",e.target.value)} />
            </div>
            <div className="re-input-half">
              <label className="re-field-label">ผู้ออกใบรับรอง</label>
              <input className="re-input" placeholder="เช่น Amazon" value={cert.issuer} onChange={e => update(cert._id,"issuer",e.target.value)} />
            </div>
            <div className="re-input-half">
              <label className="re-field-label">วันที่ได้รับ</label>
              <input className="re-input" type="date" value={cert.issueDate} onChange={e => update(cert._id,"issueDate",e.target.value)} />
            </div>
          </div>
          <button className="re-btn re-btn-danger re-btn-icon" onClick={() => remove(cert._id)} title="ลบ" style={{ alignSelf:"flex-start", marginTop:8 }}>×</button>
        </div>
      ))}
      {certifications.length===0 && (
        <div className="re-empty-state">
          <span className="re-empty-state__icon">★</span>
          <p>ยังไม่มีใบรับรอง</p>
          <button className="re-btn re-btn-ghost re-btn-sm" onClick={add}>+ เพิ่มรายการแรก</button>
        </div>
      )}
    </div>
  );
}

/* ── Projects Section ── */
function ProjectsSection({ projects, onChange }) {
  const add    = () => onChange([...projects, { _id:uid(), name:"", techStack:"", link:"" }]);
  const remove = (id) => {
    const proj = projects.find(p => p._id===id);
    if(!window.confirm(`ลบโปรเจกต์ "${proj?.name||"ไม่ระบุ"}" ใช่หรือไม่?`)) return;
    onChange(projects.filter(p => p._id!==id));
  };
  const update = (id, field, val) => onChange(projects.map(p => p._id===id ? { ...p, [field]:val } : p));

  return (
    <div className="re-card">
      <div className="re-card__header">
        <SLabel>โปรเจกต์ / Projects</SLabel>
        <button className="re-btn re-btn-ghost re-btn-sm" onClick={add}>+ เพิ่ม</button>
      </div>
      {projects.map(proj => (
        <div key={proj._id} className="re-exp-form-row">
          <div className="re-input-grid">
            <div className="re-input-full">
              <label className="re-field-label">ชื่อโปรเจกต์</label>
              <input className="re-input" placeholder="เช่น Job Portal Web App" value={proj.name} onChange={e => update(proj._id,"name",e.target.value)} />
            </div>
            <div className="re-input-half">
              <label className="re-field-label">เทคโนโลยีที่ใช้</label>
              <input className="re-input" placeholder="เช่น React, Node.js, MySQL" value={proj.techStack} onChange={e => update(proj._id,"techStack",e.target.value)} />
            </div>
            <div className="re-input-half">
              <label className="re-field-label">ลิงก์โปรเจกต์</label>
              <input className="re-input" placeholder="https://github.com/..." value={proj.link} onChange={e => update(proj._id,"link",e.target.value)} />
            </div>
          </div>
          <button className="re-btn re-btn-danger re-btn-icon" onClick={() => remove(proj._id)} title="ลบ" style={{ alignSelf:"flex-start", marginTop:8 }}>×</button>
        </div>
      ))}
      {projects.length===0 && (
        <div className="re-empty-state">
          <span className="re-empty-state__icon">◆</span>
          <p>ยังไม่มีโปรเจกต์</p>
          <button className="re-btn re-btn-ghost re-btn-sm" onClick={add}>+ เพิ่มรายการแรก</button>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Template: MODERN  — stripe left + avatar hero
───────────────────────────────────────────────────────────── */
function TemplateModern({ resume, accent, textPri, textSec, textTer, ruleBdr, skillBg }) {
  return (
    <div className="re-paper re-paper--modern" id="resume-preview-root">
      <div className="re-paper-stripe" style={{ background: accent }} />
      <div className="re-paper-hero">
        <div className="re-paper-avatar" style={{ background: `${accent}12`, border: `3px solid ${accent}30` }}>
          {resume.profileImage
            ? <img src={resume.profileImage} alt="โปรไฟล์" crossOrigin="anonymous" />
            : <span style={{ opacity: .3, color: accent, fontSize: "2rem" }}>👤</span>}
        </div>
        <div className="re-paper-meta">
          <h1 className="re-paper-name" style={{ color: textPri }}>{resume.fullName || "ชื่อของคุณ"}</h1>
          {resume.jobTitle && <p className="re-paper-title" style={{ color: accent }}>{resume.jobTitle}</p>}
          {(resume.email || resume.phone || resume.location) && (
            <div className="re-paper-contact" style={{ color: textSec }}>
              {resume.email && <span>✉ {resume.email}</span>}
              {resume.phone && <span>☎ {resume.phone}</span>}
              {resume.location && <span>📍 {resume.location}</span>}
            </div>
          )}
          {(resume.linkedin || resume.github || resume.website) && (
            <div className="re-paper-social" style={{ color: textTer }}>
              {resume.linkedin && <span>in {resume.linkedin}</span>}
              {resume.github && <span>⌥ {resume.github}</span>}
              {resume.website && <span>🌐 {resume.website}</span>}
            </div>
          )}
        </div>
      </div>
      <div className="re-paper-rule" style={{ background: `${accent}20` }} />
      <div className="re-paper-content">
        {resume.summary && (
          <PaperSection title="โปรไฟล์" accentColor={accent}>
            <p className="re-paper-summary" style={{ color: textSec }}>{resume.summary}</p>
          </PaperSection>
        )}
        {resume.experience.length > 0 && (
          <PaperSection title="ประสบการณ์ทำงาน" accentColor={accent}>
            {resume.experience.map((exp, i) => (
              <div key={exp._id || i} className="re-exp-item" style={{ borderBottom: `1px solid ${ruleBdr}` }}>
                <div className="re-exp-pos" style={{ color: textPri }}>{exp.position}</div>
                <div className="re-exp-co" style={{ color: accent }}>{exp.company}</div>
                {(exp.startDate || exp.endDate) && <div className="re-exp-date" style={{ color: textTer }}>{exp.startDate}{exp.endDate ? ` – ${exp.endDate}` : ""}</div>}
                {exp.description && <p className="re-exp-desc" style={{ color: textSec }}>{exp.description}</p>}
              </div>
            ))}
          </PaperSection>
        )}
        {resume.education.length > 0 && (
          <PaperSection title="ประวัติการศึกษา" accentColor={accent}>
            {resume.education.map((edu, i) => (
              <div key={edu._id || i} className="re-edu-item">
                <div className="re-edu-school" style={{ color: textPri }}>{edu.school}</div>
                {edu.degree && <div className="re-edu-degree" style={{ color: textSec }}>{edu.degree}</div>}
                {(edu.startYear || edu.endYear) && <div className="re-edu-years" style={{ color: textTer }}>{edu.startYear}{edu.endYear ? ` – ${edu.endYear}` : ""}</div>}
              </div>
            ))}
          </PaperSection>
        )}
        {resume.skills.length > 0 && (
          <PaperSection title="ทักษะความสามารถ" accentColor={accent}>
            <div className="re-paper-skills">
              {resume.skills.map(sk => (
                <span key={sk} className="re-paper-skill" style={{ background: skillBg, color: accent, borderColor: `${accent}30` }}>{sk}</span>
              ))}
            </div>
          </PaperSection>
        )}
        {resume.languages.length > 0 && (
          <PaperSection title="ภาษาที่ใช้ได้" accentColor={accent}>
            <div className="re-lang-grid">
              {resume.languages.map((lang, i) => (
                <div key={lang._id || i} className="re-lang-item">
                  <div className="re-lang-row-p">
                    <span className="re-lang-name" style={{ color: textPri }}>{lang.name}</span>
                    <span className="re-lang-lvl" style={{ color: textTer }}>{lang.level}</span>
                  </div>
                  <div className="re-lang-track" style={{ background: ruleBdr }}>
                    <div className="re-lang-fill" style={{ width: `${LANG_LEVEL_PCT[lang.level] || 50}%`, background: accent }} />
                  </div>
                </div>
              ))}
            </div>
          </PaperSection>
        )}
        {resume.certifications.length > 0 && (
          <PaperSection title="ใบรับรอง" accentColor={accent}>
            {resume.certifications.map((cert, i) => (
              <div key={cert._id || i} className="re-exp-item" style={{ borderBottom: `1px solid ${ruleBdr}` }}>
                <div className="re-exp-pos" style={{ color: textPri }}>{cert.name}</div>
                {cert.issuer && <div className="re-exp-co" style={{ color: accent }}>{cert.issuer}</div>}
                {cert.issueDate && <div className="re-exp-date" style={{ color: textTer }}>{cert.issueDate}</div>}
              </div>
            ))}
          </PaperSection>
        )}
        {resume.projects.length > 0 && (
          <PaperSection title="โปรเจกต์" accentColor={accent}>
            {resume.projects.map((proj, i) => (
              <div key={proj._id || i} className="re-exp-item" style={{ borderBottom: `1px solid ${ruleBdr}` }}>
                <div className="re-exp-pos" style={{ color: textPri }}>{proj.name}</div>
                {proj.techStack && <div className="re-exp-co" style={{ color: accent }}>{proj.techStack}</div>}
                {proj.link && <div className="re-exp-date" style={{ color: textTer }}>{proj.link}</div>}
              </div>
            ))}
          </PaperSection>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Template: MINIMAL  — centered, text-first, no color blocks
───────────────────────────────────────────────────────────── */
function TemplateMinimal({ resume, accent, textPri, textSec, textTer, ruleBdr, skillBg }) {
  return (
    <div className="re-paper re-paper--minimal" id="resume-preview-root" style={{ fontFamily: "'Georgia', serif" }}>
      {/* Centered header */}
      <div style={{ textAlign: "center", padding: "32px 40px 20px", borderBottom: `2px solid ${accent}` }}>
        {resume.profileImage && (
          <img src={resume.profileImage} alt="" crossOrigin="anonymous"
            style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", marginBottom: 10, border: `2px solid ${accent}40` }} />
        )}
        <h1 style={{ fontSize: "1.6rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: textPri, margin: "0 0 4px" }}>
          {resume.fullName || "ชื่อของคุณ"}
        </h1>
        {resume.jobTitle && (
          <p style={{ fontSize: "0.85rem", letterSpacing: 3, textTransform: "uppercase", color: accent, margin: "0 0 10px" }}>
            {resume.jobTitle}
          </p>
        )}
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "4px 20px", fontSize: "0.72rem", color: textSec }}>
          {resume.email && <span>{resume.email}</span>}
          {resume.phone && <span>{resume.phone}</span>}
          {resume.location && <span>{resume.location}</span>}
          {resume.linkedin && <span>LinkedIn: {resume.linkedin}</span>}
          {resume.github && <span>GitHub: {resume.github}</span>}
        </div>
      </div>

      <div style={{ padding: "0 40px 32px" }}>
        {resume.summary && (
          <div style={{ marginTop: 20 }}>
            <p style={{ fontSize: "0.7rem", letterSpacing: 2, textTransform: "uppercase", color: accent, marginBottom: 6, borderBottom: `1px solid ${accent}30`, paddingBottom: 4 }}>Profile</p>
            <p style={{ fontSize: "0.8rem", lineHeight: 1.7, color: textSec, margin: 0 }}>{resume.summary}</p>
          </div>
        )}
        {resume.experience.length > 0 && (
          <div style={{ marginTop: 22 }}>
            <p style={{ fontSize: "0.7rem", letterSpacing: 2, textTransform: "uppercase", color: accent, marginBottom: 8, borderBottom: `1px solid ${accent}30`, paddingBottom: 4 }}>Experience</p>
            {resume.experience.map((exp, i) => (
              <div key={exp._id || i} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <strong style={{ fontSize: "0.8rem", color: textPri }}>{exp.position}</strong>
                  {(exp.startDate || exp.endDate) && <span style={{ fontSize: "0.68rem", color: textTer }}>{exp.startDate}{exp.endDate ? ` – ${exp.endDate}` : ""}</span>}
                </div>
                <div style={{ fontSize: "0.75rem", color: textSec, fontStyle: "italic" }}>{exp.company}</div>
                {exp.description && <p style={{ fontSize: "0.75rem", color: textSec, marginTop: 4, lineHeight: 1.6 }}>{exp.description}</p>}
              </div>
            ))}
          </div>
        )}
        {resume.education.length > 0 && (
          <div style={{ marginTop: 22 }}>
            <p style={{ fontSize: "0.7rem", letterSpacing: 2, textTransform: "uppercase", color: accent, marginBottom: 8, borderBottom: `1px solid ${accent}30`, paddingBottom: 4 }}>Education</p>
            {resume.education.map((edu, i) => (
              <div key={edu._id || i} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <strong style={{ fontSize: "0.8rem", color: textPri }}>{edu.school}</strong>
                  {(edu.startYear || edu.endYear) && <span style={{ fontSize: "0.68rem", color: textTer }}>{edu.startYear}{edu.endYear ? ` – ${edu.endYear}` : ""}</span>}
                </div>
                {edu.degree && <div style={{ fontSize: "0.75rem", color: textSec, fontStyle: "italic" }}>{edu.degree}</div>}
              </div>
            ))}
          </div>
        )}
        {resume.skills.length > 0 && (
          <div style={{ marginTop: 22 }}>
            <p style={{ fontSize: "0.7rem", letterSpacing: 2, textTransform: "uppercase", color: accent, marginBottom: 8, borderBottom: `1px solid ${accent}30`, paddingBottom: 4 }}>Skills</p>
            <p style={{ fontSize: "0.78rem", color: textSec, lineHeight: 1.8 }}>{resume.skills.join(" · ")}</p>
          </div>
        )}
        {resume.languages.length > 0 && (
          <div style={{ marginTop: 22 }}>
            <p style={{ fontSize: "0.7rem", letterSpacing: 2, textTransform: "uppercase", color: accent, marginBottom: 8, borderBottom: `1px solid ${accent}30`, paddingBottom: 4 }}>Languages</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              {resume.languages.map((lang, i) => (
                <span key={lang._id || i} style={{ fontSize: "0.78rem", color: textSec }}>{lang.name} <span style={{ color: textTer }}>({lang.level})</span></span>
              ))}
            </div>
          </div>
        )}
        {resume.certifications.length > 0 && (
          <div style={{ marginTop: 22 }}>
            <p style={{ fontSize: "0.7rem", letterSpacing: 2, textTransform: "uppercase", color: accent, marginBottom: 8, borderBottom: `1px solid ${accent}30`, paddingBottom: 4 }}>Certifications</p>
            {resume.certifications.map((cert, i) => (
              <div key={cert._id || i} style={{ marginBottom: 8 }}>
                <strong style={{ fontSize: "0.78rem", color: textPri }}>{cert.name}</strong>
                {cert.issuer && <span style={{ fontSize: "0.72rem", color: textSec }}> — {cert.issuer}</span>}
                {cert.issueDate && <span style={{ fontSize: "0.68rem", color: textTer }}> ({cert.issueDate})</span>}
              </div>
            ))}
          </div>
        )}
        {resume.projects.length > 0 && (
          <div style={{ marginTop: 22 }}>
            <p style={{ fontSize: "0.7rem", letterSpacing: 2, textTransform: "uppercase", color: accent, marginBottom: 8, borderBottom: `1px solid ${accent}30`, paddingBottom: 4 }}>Projects</p>
            {resume.projects.map((proj, i) => (
              <div key={proj._id || i} style={{ marginBottom: 10 }}>
                <strong style={{ fontSize: "0.8rem", color: textPri }}>{proj.name}</strong>
                {proj.techStack && <div style={{ fontSize: "0.72rem", color: textSec, fontStyle: "italic" }}>{proj.techStack}</div>}
                {proj.link && <div style={{ fontSize: "0.68rem", color: textTer }}>{proj.link}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Template: BOLD  — 2-column: dark sidebar left + content right
───────────────────────────────────────────────────────────── */
function TemplateBold({ resume, accent, textPri, textSec, textTer, ruleBdr, skillBg, isDark }) {
  const sidebarBg = isDark ? "#1a0a0a" : accent;
  const sidebarText = "#ffffff";
  const sidebarMuted = "rgba(255,255,255,0.65)";
  return (
    <div className="re-paper re-paper--bold" id="resume-preview-root"
      style={{ display: "flex", padding: 0, gap: 0, overflow: "hidden" }}>
      {/* Sidebar */}
      <div style={{ width: "36%", background: sidebarBg, padding: "32px 20px", display: "flex", flexDirection: "column", gap: 20, flexShrink: 0 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", margin: "0 auto 12px", overflow: "hidden", border: "3px solid rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {resume.profileImage
              ? <img src={resume.profileImage} alt="" crossOrigin="anonymous" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <span style={{ fontSize: "2rem", opacity: 0.4 }}>👤</span>}
          </div>
          <h1 style={{ fontSize: "1.05rem", fontWeight: 800, color: sidebarText, margin: "0 0 4px", lineHeight: 1.2 }}>{resume.fullName || "ชื่อของคุณ"}</h1>
          {resume.jobTitle && <p style={{ fontSize: "0.72rem", color: sidebarMuted, margin: 0, letterSpacing: 1 }}>{resume.jobTitle}</p>}
        </div>

        {/* Contact */}
        {(resume.email || resume.phone || resume.location) && (
          <div>
            <div style={{ fontSize: "0.62rem", letterSpacing: 2, textTransform: "uppercase", color: sidebarMuted, marginBottom: 8, borderBottom: "1px solid rgba(255,255,255,0.15)", paddingBottom: 4 }}>Contact</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {resume.email && <span style={{ fontSize: "0.7rem", color: sidebarText, wordBreak: "break-all" }}>✉ {resume.email}</span>}
              {resume.phone && <span style={{ fontSize: "0.7rem", color: sidebarText }}>☎ {resume.phone}</span>}
              {resume.location && <span style={{ fontSize: "0.7rem", color: sidebarText }}>📍 {resume.location}</span>}
              {resume.linkedin && <span style={{ fontSize: "0.68rem", color: sidebarMuted }}>in {resume.linkedin}</span>}
              {resume.github && <span style={{ fontSize: "0.68rem", color: sidebarMuted }}>⌥ {resume.github}</span>}
            </div>
          </div>
        )}

        {/* Skills */}
        {resume.skills.length > 0 && (
          <div>
            <div style={{ fontSize: "0.62rem", letterSpacing: 2, textTransform: "uppercase", color: sidebarMuted, marginBottom: 8, borderBottom: "1px solid rgba(255,255,255,0.15)", paddingBottom: 4 }}>Skills</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px 6px" }}>
              {resume.skills.map(sk => (
                <span key={sk} style={{ fontSize: "0.66rem", background: "rgba(255,255,255,0.12)", color: sidebarText, padding: "2px 8px", borderRadius: 20 }}>{sk}</span>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {resume.languages.length > 0 && (
          <div>
            <div style={{ fontSize: "0.62rem", letterSpacing: 2, textTransform: "uppercase", color: sidebarMuted, marginBottom: 8, borderBottom: "1px solid rgba(255,255,255,0.15)", paddingBottom: 4 }}>Languages</div>
            {resume.languages.map((lang, i) => (
              <div key={lang._id || i} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: "0.72rem", color: sidebarText }}>{lang.name}</span>
                  <span style={{ fontSize: "0.64rem", color: sidebarMuted }}>{lang.level}</span>
                </div>
                <div style={{ height: 3, background: "rgba(255,255,255,0.15)", borderRadius: 2 }}>
                  <div style={{ height: "100%", width: `${LANG_LEVEL_PCT[lang.level] || 50}%`, background: "rgba(255,255,255,0.75)", borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: "28px 24px", overflowY: "auto" }}>
        {resume.summary && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: accent, marginBottom: 6, paddingBottom: 4, borderBottom: `2px solid ${accent}` }}>Profile</div>
            <p style={{ fontSize: "0.78rem", lineHeight: 1.7, color: textSec, margin: 0 }}>{resume.summary}</p>
          </div>
        )}
        {resume.experience.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: accent, marginBottom: 10, paddingBottom: 4, borderBottom: `2px solid ${accent}` }}>Experience</div>
            {resume.experience.map((exp, i) => (
              <div key={exp._id || i} style={{ marginBottom: 14, paddingLeft: 10, borderLeft: `3px solid ${accent}30` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <strong style={{ fontSize: "0.8rem", color: textPri }}>{exp.position}</strong>
                  {(exp.startDate || exp.endDate) && <span style={{ fontSize: "0.66rem", color: textTer }}>{exp.startDate}{exp.endDate ? ` – ${exp.endDate}` : ""}</span>}
                </div>
                <div style={{ fontSize: "0.72rem", fontWeight: 600, color: accent, marginBottom: 3 }}>{exp.company}</div>
                {exp.description && <p style={{ fontSize: "0.74rem", color: textSec, margin: 0, lineHeight: 1.6 }}>{exp.description}</p>}
              </div>
            ))}
          </div>
        )}
        {resume.education.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: accent, marginBottom: 10, paddingBottom: 4, borderBottom: `2px solid ${accent}` }}>Education</div>
            {resume.education.map((edu, i) => (
              <div key={edu._id || i} style={{ marginBottom: 10, paddingLeft: 10, borderLeft: `3px solid ${accent}30` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <strong style={{ fontSize: "0.8rem", color: textPri }}>{edu.school}</strong>
                  {(edu.startYear || edu.endYear) && <span style={{ fontSize: "0.66rem", color: textTer }}>{edu.startYear}{edu.endYear ? ` – ${edu.endYear}` : ""}</span>}
                </div>
                {edu.degree && <div style={{ fontSize: "0.74rem", color: textSec }}>{edu.degree}</div>}
              </div>
            ))}
          </div>
        )}
        {resume.certifications.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: accent, marginBottom: 10, paddingBottom: 4, borderBottom: `2px solid ${accent}` }}>Certifications</div>
            {resume.certifications.map((cert, i) => (
              <div key={cert._id || i} style={{ marginBottom: 8, paddingLeft: 10, borderLeft: `3px solid ${accent}30` }}>
                <strong style={{ fontSize: "0.78rem", color: textPri }}>{cert.name}</strong>
                {cert.issuer && <div style={{ fontSize: "0.72rem", color: textSec }}>{cert.issuer}</div>}
                {cert.issueDate && <div style={{ fontSize: "0.66rem", color: textTer }}>{cert.issueDate}</div>}
              </div>
            ))}
          </div>
        )}
        {resume.projects.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: accent, marginBottom: 10, paddingBottom: 4, borderBottom: `2px solid ${accent}` }}>Projects</div>
            {resume.projects.map((proj, i) => (
              <div key={proj._id || i} style={{ marginBottom: 10, paddingLeft: 10, borderLeft: `3px solid ${accent}30` }}>
                <strong style={{ fontSize: "0.8rem", color: textPri }}>{proj.name}</strong>
                {proj.techStack && <div style={{ fontSize: "0.72rem", color: accent }}>{proj.techStack}</div>}
                {proj.link && <div style={{ fontSize: "0.66rem", color: textTer }}>{proj.link}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Template: FOREST  — timeline style with dot markers
───────────────────────────────────────────────────────────── */
function TemplateForest({ resume, accent, textPri, textSec, textTer, ruleBdr, skillBg }) {
  const TimelineDot = () => (
    <div style={{ width: 10, height: 10, borderRadius: "50%", background: accent, flexShrink: 0, marginTop: 4, boxShadow: `0 0 0 3px ${accent}25` }} />
  );
  return (
    <div className="re-paper re-paper--forest" id="resume-preview-root" style={{ padding: 0 }}>
      {/* Top banner */}
      <div style={{ background: `linear-gradient(135deg, ${accent} 0%, ${accent}cc 100%)`, padding: "28px 32px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ position: "absolute", bottom: -30, right: 60, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 18, position: "relative" }}>
          <div style={{ width: 76, height: 76, borderRadius: "50%", border: "3px solid rgba(255,255,255,0.4)", overflow: "hidden", flexShrink: 0, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {resume.profileImage
              ? <img src={resume.profileImage} alt="" crossOrigin="anonymous" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <span style={{ fontSize: "2rem", opacity: 0.5 }}>🌿</span>}
          </div>
          <div>
            <h1 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#fff", margin: "0 0 2px" }}>{resume.fullName || "ชื่อของคุณ"}</h1>
            {resume.jobTitle && <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.8)", margin: "0 0 8px" }}>{resume.jobTitle}</p>}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 14px", fontSize: "0.68rem", color: "rgba(255,255,255,0.7)" }}>
              {resume.email && <span>✉ {resume.email}</span>}
              {resume.phone && <span>☎ {resume.phone}</span>}
              {resume.location && <span>📍 {resume.location}</span>}
              {resume.linkedin && <span>in {resume.linkedin}</span>}
              {resume.github && <span>⌥ {resume.github}</span>}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 32px 28px" }}>
        {resume.summary && (
          <div style={{ marginBottom: 20, background: `${accent}08`, borderRadius: 8, padding: "12px 16px", borderLeft: `4px solid ${accent}` }}>
            <p style={{ fontSize: "0.78rem", lineHeight: 1.7, color: textSec, margin: 0 }}>{resume.summary}</p>
          </div>
        )}
        {resume.skills.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: accent, marginBottom: 10 }}>🔧 ทักษะ</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px 7px" }}>
              {resume.skills.map(sk => (
                <span key={sk} style={{ fontSize: "0.7rem", background: skillBg, color: accent, padding: "3px 10px", borderRadius: 4, border: `1px solid ${accent}30` }}>{sk}</span>
              ))}
            </div>
          </div>
        )}
        {resume.experience.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: accent, marginBottom: 12 }}>💼 ประสบการณ์</div>
            <div style={{ borderLeft: `2px solid ${accent}30`, paddingLeft: 16, display: "flex", flexDirection: "column", gap: 16 }}>
              {resume.experience.map((exp, i) => (
                <div key={exp._id || i} style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: -21, top: 4, width: 10, height: 10, borderRadius: "50%", background: accent, boxShadow: `0 0 0 3px ${accent}25` }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <strong style={{ fontSize: "0.8rem", color: textPri }}>{exp.position}</strong>
                    {(exp.startDate || exp.endDate) && <span style={{ fontSize: "0.66rem", color: textTer }}>{exp.startDate}{exp.endDate ? ` – ${exp.endDate}` : ""}</span>}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: accent, marginBottom: 3 }}>{exp.company}</div>
                  {exp.description && <p style={{ fontSize: "0.74rem", color: textSec, margin: 0, lineHeight: 1.6 }}>{exp.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
        {resume.education.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: accent, marginBottom: 12 }}>🎓 การศึกษา</div>
            <div style={{ borderLeft: `2px solid ${accent}30`, paddingLeft: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              {resume.education.map((edu, i) => (
                <div key={edu._id || i} style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: -21, top: 4, width: 10, height: 10, borderRadius: "50%", background: accent, boxShadow: `0 0 0 3px ${accent}25` }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <strong style={{ fontSize: "0.8rem", color: textPri }}>{edu.school}</strong>
                    {(edu.startYear || edu.endYear) && <span style={{ fontSize: "0.66rem", color: textTer }}>{edu.startYear}{edu.endYear ? ` – ${edu.endYear}` : ""}</span>}
                  </div>
                  {edu.degree && <div style={{ fontSize: "0.74rem", color: textSec }}>{edu.degree}</div>}
                </div>
              ))}
            </div>
          </div>
        )}
        {resume.languages.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: accent, marginBottom: 10 }}>🌏 ภาษา</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {resume.languages.map((lang, i) => (
                <div key={lang._id || i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: "0.75rem", color: textPri, width: 90, flexShrink: 0 }}>{lang.name}</span>
                  <div style={{ flex: 1, height: 5, background: ruleBdr, borderRadius: 3 }}>
                    <div style={{ height: "100%", width: `${LANG_LEVEL_PCT[lang.level] || 50}%`, background: accent, borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: "0.65rem", color: textTer, width: 70, textAlign: "right" }}>{lang.level}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {resume.certifications.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: accent, marginBottom: 10 }}>🏆 ใบรับรอง</div>
            {resume.certifications.map((cert, i) => (
              <div key={cert._id || i} style={{ marginBottom: 8, display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span style={{ color: accent, marginTop: 1 }}>▸</span>
                <div>
                  <strong style={{ fontSize: "0.78rem", color: textPri }}>{cert.name}</strong>
                  {cert.issuer && <span style={{ fontSize: "0.72rem", color: textSec }}> — {cert.issuer}</span>}
                  {cert.issueDate && <div style={{ fontSize: "0.66rem", color: textTer }}>{cert.issueDate}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
        {resume.projects.length > 0 && (
          <div>
            <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: accent, marginBottom: 10 }}>🚀 โปรเจกต์</div>
            {resume.projects.map((proj, i) => (
              <div key={proj._id || i} style={{ marginBottom: 10, display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span style={{ color: accent, marginTop: 1 }}>▸</span>
                <div>
                  <strong style={{ fontSize: "0.78rem", color: textPri }}>{proj.name}</strong>
                  {proj.techStack && <div style={{ fontSize: "0.72rem", color: accent }}>{proj.techStack}</div>}
                  {proj.link && <div style={{ fontSize: "0.66rem", color: textTer }}>{proj.link}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Template: DUSK  — luxury gradient header + elegant layout
───────────────────────────────────────────────────────────── */
function TemplateDusk({ resume, accent, textPri, textSec, textTer, ruleBdr, skillBg, isDark }) {
  const gradEnd = isDark ? "#1a0d2e" : "#f5f0ff";
  return (
    <div className="re-paper re-paper--dusk" id="resume-preview-root" style={{ padding: 0, fontFamily: "'Georgia', serif" }}>
      {/* Luxury header */}
      <div style={{ background: `linear-gradient(160deg, ${accent} 0%, #1a0d2e 100%)`, padding: "36px 40px 28px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundImage: "radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.07) 0%, transparent 60%)" }} />
        <div style={{ position: "relative" }}>
          <div style={{ width: 88, height: 88, borderRadius: "50%", margin: "0 auto 14px", border: "3px solid rgba(255,255,255,0.35)", overflow: "hidden", background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {resume.profileImage
              ? <img src={resume.profileImage} alt="" crossOrigin="anonymous" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <span style={{ fontSize: "2.5rem", opacity: 0.4 }}>✦</span>}
          </div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 400, letterSpacing: 3, color: "#fff", margin: "0 0 6px", textTransform: "uppercase" }}>{resume.fullName || "ชื่อของคุณ"}</h1>
          {resume.jobTitle && (
            <p style={{ fontSize: "0.78rem", letterSpacing: 4, textTransform: "uppercase", color: "rgba(255,255,255,0.65)", margin: "0 0 16px" }}>{resume.jobTitle}</p>
          )}
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "4px 20px", fontSize: "0.68rem", color: "rgba(255,255,255,0.6)" }}>
            {resume.email && <span>✉ {resume.email}</span>}
            {resume.phone && <span>☎ {resume.phone}</span>}
            {resume.location && <span>📍 {resume.location}</span>}
            {resume.linkedin && <span>in {resume.linkedin}</span>}
            {resume.github && <span>⌥ {resume.github}</span>}
          </div>
        </div>
      </div>

      {/* Decorative divider */}
      <div style={{ height: 3, background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />

      <div style={{ padding: "24px 40px 32px", background: isDark ? "#0d0818" : "#faf8ff" }}>
        {resume.summary && (
          <div style={{ marginBottom: 22, textAlign: "center" }}>
            <p style={{ fontSize: "0.8rem", lineHeight: 1.8, color: textSec, margin: 0, fontStyle: "italic", maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}>"{resume.summary}"</p>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 28px" }}>
          {/* Left column */}
          <div>
            {resume.experience.length > 0 && (
              <div style={{ marginBottom: 22 }}>
                <div style={{ fontSize: "0.62rem", letterSpacing: 3, textTransform: "uppercase", color: accent, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  <span>Experience</span><div style={{ flex: 1, height: 1, background: `${accent}30` }} />
                </div>
                {resume.experience.map((exp, i) => (
                  <div key={exp._id || i} style={{ marginBottom: 14 }}>
                    <strong style={{ fontSize: "0.78rem", color: textPri, display: "block" }}>{exp.position}</strong>
                    <span style={{ fontSize: "0.72rem", color: accent }}>{exp.company}</span>
                    {(exp.startDate || exp.endDate) && <div style={{ fontSize: "0.64rem", color: textTer, fontStyle: "italic" }}>{exp.startDate}{exp.endDate ? ` – ${exp.endDate}` : ""}</div>}
                    {exp.description && <p style={{ fontSize: "0.72rem", color: textSec, marginTop: 4, lineHeight: 1.6 }}>{exp.description}</p>}
                  </div>
                ))}
              </div>
            )}
            {resume.education.length > 0 && (
              <div style={{ marginBottom: 22 }}>
                <div style={{ fontSize: "0.62rem", letterSpacing: 3, textTransform: "uppercase", color: accent, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  <span>Education</span><div style={{ flex: 1, height: 1, background: `${accent}30` }} />
                </div>
                {resume.education.map((edu, i) => (
                  <div key={edu._id || i} style={{ marginBottom: 10 }}>
                    <strong style={{ fontSize: "0.78rem", color: textPri, display: "block" }}>{edu.school}</strong>
                    {edu.degree && <div style={{ fontSize: "0.72rem", color: textSec, fontStyle: "italic" }}>{edu.degree}</div>}
                    {(edu.startYear || edu.endYear) && <div style={{ fontSize: "0.64rem", color: textTer }}>{edu.startYear}{edu.endYear ? ` – ${edu.endYear}` : ""}</div>}
                  </div>
                ))}
              </div>
            )}
            {resume.certifications.length > 0 && (
              <div style={{ marginBottom: 22 }}>
                <div style={{ fontSize: "0.62rem", letterSpacing: 3, textTransform: "uppercase", color: accent, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  <span>Certifications</span><div style={{ flex: 1, height: 1, background: `${accent}30` }} />
                </div>
                {resume.certifications.map((cert, i) => (
                  <div key={cert._id || i} style={{ marginBottom: 8 }}>
                    <strong style={{ fontSize: "0.76rem", color: textPri }}>{cert.name}</strong>
                    {cert.issuer && <div style={{ fontSize: "0.7rem", color: textSec }}>{cert.issuer}</div>}
                    {cert.issueDate && <div style={{ fontSize: "0.64rem", color: textTer, fontStyle: "italic" }}>{cert.issueDate}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right column */}
          <div>
            {resume.skills.length > 0 && (
              <div style={{ marginBottom: 22 }}>
                <div style={{ fontSize: "0.62rem", letterSpacing: 3, textTransform: "uppercase", color: accent, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  <span>Skills</span><div style={{ flex: 1, height: 1, background: `${accent}30` }} />
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px 6px" }}>
                  {resume.skills.map(sk => (
                    <span key={sk} style={{ fontSize: "0.68rem", color: accent, border: `1px solid ${accent}40`, padding: "2px 10px", borderRadius: 20, background: skillBg }}>{sk}</span>
                  ))}
                </div>
              </div>
            )}
            {resume.languages.length > 0 && (
              <div style={{ marginBottom: 22 }}>
                <div style={{ fontSize: "0.62rem", letterSpacing: 3, textTransform: "uppercase", color: accent, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  <span>Languages</span><div style={{ flex: 1, height: 1, background: `${accent}30` }} />
                </div>
                {resume.languages.map((lang, i) => (
                  <div key={lang._id || i} style={{ marginBottom: 9 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: "0.74rem", color: textPri }}>{lang.name}</span>
                      <span style={{ fontSize: "0.64rem", color: textTer, fontStyle: "italic" }}>{lang.level}</span>
                    </div>
                    <div style={{ height: 2, background: ruleBdr, borderRadius: 1 }}>
                      <div style={{ height: "100%", width: `${LANG_LEVEL_PCT[lang.level] || 50}%`, background: `linear-gradient(90deg, ${accent}, ${accent}80)`, borderRadius: 1 }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {resume.projects.length > 0 && (
              <div style={{ marginBottom: 22 }}>
                <div style={{ fontSize: "0.62rem", letterSpacing: 3, textTransform: "uppercase", color: accent, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  <span>Projects</span><div style={{ flex: 1, height: 1, background: `${accent}30` }} />
                </div>
                {resume.projects.map((proj, i) => (
                  <div key={proj._id || i} style={{ marginBottom: 10 }}>
                    <strong style={{ fontSize: "0.78rem", color: textPri, display: "block" }}>{proj.name}</strong>
                    {proj.techStack && <div style={{ fontSize: "0.7rem", color: accent }}>{proj.techStack}</div>}
                    {proj.link && <div style={{ fontSize: "0.64rem", color: textTer, fontStyle: "italic" }}>{proj.link}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ResumePreview — dispatcher that routes to each template
───────────────────────────────────────────────────────────── */
const ResumePreview = React.memo(function ResumePreview({ resume, template, isDark, accentOverride }) {
  const baseAccent = accentOverride || getAccentColor(template);
  const accent  = isDark ? lightenColor(baseAccent) : baseAccent;
  const textPri = isDark ? "#e8f0f9" : "#0d1b2a";
  const textSec = isDark ? "#6e8aaa" : "#5e7087";
  const textTer = isDark ? "#334a62" : "#9aaabb";
  const ruleBdr = isDark ? "#1a2e45" : PAPER_RULE;
  const skillBg = isDark ? `${accent}18` : `${accent}0d`;

  const isEmpty = !resume.fullName && !resume.jobTitle && !resume.summary
    && !resume.skills.length && !resume.experience.length;

  if (isEmpty) {
    return (
      <div className="re-paper">
        <div className="re-paper-empty">
          <span className="re-paper-empty__icon">📄</span>
          <p className="re-paper-empty__text">กรอกข้อมูลในฟอร์มด้านซ้าย<br />หรือกด <strong>สร้างจากโปรไฟล์</strong></p>
        </div>
      </div>
    );
  }

  const props = { resume, accent, textPri, textSec, textTer, ruleBdr, skillBg, isDark };

  if (template === "minimal") return <TemplateMinimal {...props} />;
  if (template === "bold")    return <TemplateBold    {...props} />;
  if (template === "forest")  return <TemplateForest  {...props} />;
  if (template === "dusk")    return <TemplateDusk    {...props} />;
  return <TemplateModern {...props} />;
});

/* preview controls shared between panel and drawer */
function PreviewControls({ template, setTemplate, templateColors, setTemplateColors, previewZoom, setPreviewZoom, exporting, onExport }) {
  const currentColor = templateColors[template] || getAccentColor(template);
  return (
    <>
      <div className="re-zoom-ctrl">
        <button className="re-zoom-btn" onClick={() => setPreviewZoom(z => Math.max(0.5,+(z-0.1).toFixed(1)))} title="ย่อ">−</button>
        <span className="re-zoom-label">{Math.round(previewZoom*100)}%</span>
        <button className="re-zoom-btn" onClick={() => setPreviewZoom(z => Math.min(1.5,+(z+0.1).toFixed(1)))} title="ขยาย">+</button>
      </div>
      <div className="re-tmpl-switcher">
        {TEMPLATES.map(t => (
          <button key={t.id}
            className={`re-tmpl-btn${template===t.id?" re-tmpl-btn--active":""}`}
            onClick={() => setTemplate(t.id)}
            title={t.desc}
            style={template===t.id ? { borderColor: templateColors[t.id]||t.accent, color: templateColors[t.id]||t.accent } : {}}
          >
            {t.label}
          </button>
        ))}
      </div>
      {/* Per-template color picker */}
      <div className="re-color-picker-wrap" title={`สีธีม (${TEMPLATES.find(t=>t.id===template)?.label})`}>
        <span className="re-color-picker-label">🎨</span>
        <input
          type="color"
          className="re-color-input"
          value={currentColor}
          onChange={e => setTemplateColors(prev => ({ ...prev, [template]: e.target.value }))}
        />
        <button
          className="re-color-reset-btn"
          title="คืนค่าสีเริ่มต้น"
          onClick={() => setTemplateColors(prev => ({ ...prev, [template]: TEMPLATES.find(t=>t.id===template)?.accent || "#1e3a5f" }))}
        >↺</button>
      </div>
      <button className="re-btn re-btn-export" onClick={onExport} disabled={exporting}>
        {exporting ? <><Spinner />กำลังส่งออก…</> : "↓ PDF"}
      </button>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Main Component
═══════════════════════════════════════════════════════════════ */
export default function ResumeEditor() {
  const [resume, setResume]           = useState(EMPTY_RESUME);
  const [resumeId, setResumeId]       = useState(null);
  const [template, setTemplate]       = useState("modern");
  const [templateColors, setTemplateColors] = useState(() => Object.fromEntries(TEMPLATES.map(t => [t.id, t.accent])));
  const [isDark, setIsDark]           = useState(false);
  const [jobRole, setJobRole]         = useState("");
  const [activeSection, setActiveSection] = useState("profile");
  const [generating, setGenerating]   = useState(false);
  const [saving, setSaving]           = useState(false);
  const [exporting, setExporting]     = useState(false);
  const [toast, setToast]             = useState(null);
  const [draftBanner, setDraftBanner] = useState(false);
  const [autoSavedAt, setAutoSavedAt] = useState(null);
  const [previewZoom, setPreviewZoom] = useState(1);
  const [previewOpen, setPreviewOpen] = useState(false); // mobile drawer

  const fileRef         = useRef(null);
  const toastTimer      = useRef(null);
  const sectionRefs     = useRef({});
  const lastSavedState  = useRef(JSON.stringify(EMPTY_RESUME));

  const showToast = useCallback((message, type="success", duration=4000) => {
    clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), duration);
  }, []);

  /* ── Cleanup toast timer on unmount ── */
  useEffect(() => {
    return () => clearTimeout(toastTimer.current);
  }, []);

  /* ── beforeunload ── */
  useEffect(() => {
    const handler = (e) => {
      if(JSON.stringify(resume) !== lastSavedState.current) {
        e.preventDefault();
        e.returnValue = "คุณมีการเปลี่ยนแปลง Resume ที่ยังไม่บันทึก";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [resume]);

  /* ── Load on mount ── */
  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("token");
      if(token) {
        try {
          const res = await retryFetch(
            () => fetchWithTimeout(`${API_URL}/me`, { headers:{ "Authorization":`Bearer ${token}` } }),
            MAX_RETRIES
          );

          if(res.status===401) {
            localStorage.removeItem("token");
            localStorage.removeItem("userID");
            showToast("เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่","error",5000);
            return;
          }

          if(res.ok) {
            const json = await res.json();
            if(json.success && json.data) {
              // ✅ Normalize and validate resume data
              const normalized = normalizeResumeData(json.data);
              setResume(normalized);
              setResumeId(json.data.id);
              
              // ✅ Validate template is supported
              const template = json.data.template || 'modern';
              if (BACKEND_TEMPLATES.includes(template)) {
                setTemplate(template);
              } else {
                console.warn(`Template "${template}" not supported, using 'modern'`);
                setTemplate('modern');
              }
              
              lastSavedState.current = JSON.stringify(normalized);
              try { clearDraft(); } catch(e2) {}
              return;
            }
          }
        } catch(err) {
          console.error("Resume load failed:", err);
          showToast("โหลดข้อมูลเรซูเม่ไม่สำเร็จ กรุณาลองใหม่", "error", 5000);
        }
      }
      const draft = loadDraft();
      if(draft?.data && isValidForDraft(draft.data)) {
        setResume({ ...EMPTY_RESUME, ...draft.data });
        if(draft.data._resumeId) setResumeId(draft.data._resumeId);
        setDraftBanner(true);
        lastSavedState.current = JSON.stringify(draft.data);
      }
    })();
  }, []);

  /* ── Autosave ── */
  useEffect(() => {
    const t = setTimeout(() => {
      if(isValidForDraft(resume)) { saveDraft({ ...resume, _resumeId:resumeId }); setAutoSavedAt(Date.now()); }
    }, 2000);
    return () => clearTimeout(t);
  }, [resume, resumeId]);

  /* ── IntersectionObserver for active section ── */
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if(e.isIntersecting) setActiveSection(e.target.dataset.section); }),
      { threshold:0.4, rootMargin:"-60px 0px -60px 0px" }
    );
    Object.values(sectionRefs.current).forEach(el => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const scrollToSection = useCallback((id) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior:"smooth", block:"start" });
    setActiveSection(id);
  }, []);

  const setField = useCallback((field, value) => setResume(p => ({ ...p, [field]:value })), []);

  /* ── Generate from profile ── */
  const handleGenerate = async () => {
    const token  = localStorage.getItem("token");
    const userId = localStorage.getItem("userID");
    if(!token||!userId) { showToast("กรุณาเข้าสู่ระบบก่อน","error"); return; }
    setGenerating(true);
    try {
      const res = await fetch(`${API_BASE}/api/profiles?userId=${userId}`, { headers:{ "Authorization":`Bearer ${token}` } });
      if(!res.ok) throw new Error("ดึงข้อมูลโปรไฟล์ไม่สำเร็จ");
      const data = await res.json();
      if(!data||typeof data!=="object") throw new Error("ข้อมูลโปรไฟล์ไม่ถูกต้อง");

      // ── Map skills (dedup + case-insensitive) ──
      const mappedSkills = Array.isArray(data.skills)
        ? [...new Map(
            data.skills
              .map(s => typeof s === "string" ? s : s.skill || s.name || "")
              .filter(Boolean)
              .map(s => [s.toLowerCase(), s])
          ).values()]
        : [];

      // ── Map experience จาก profile → resume format ──
      const mappedExperience = Array.isArray(data.experience)
        ? data.experience.map(e => ({
            _id:         uid(),
            position:    String(e.role || e.title || "").trim(),
            company:     String(e.company || "").trim(),
            startDate:   String(e.startDate || "").trim(),
            endDate:     String(e.endDate || "").trim(),
            description: String(e.description || "").trim(),
          })).filter(e => e.position || e.company)
        : [];

      // ── Map education จาก profile → resume format ──
      const mappedEducation = Array.isArray(data.education)
        ? data.education.map(e => ({
            _id:       uid(),
            school:    String(e.institution || e.school || "").trim(),
            degree:    String(e.degree || "").trim() + (e.field ? ` ${e.field}` : ""),
            startYear: String(e.startDate || e.startYear || "").trim(),
            endYear:   String(e.endDate || e.endYear || "").trim(),
          })).filter(e => e.school || e.degree)
        : [];

      // ── Map languages จาก profile → resume format ──
      const mappedLanguages = Array.isArray(data.languages)
        ? data.languages.map(l => ({
            _id:   uid(),
            name:  String(l.language || l.name || "").trim(),
            level: String(l.level || "ระดับกลาง").trim(),
          })).filter(l => l.name)
        : [];

      // ── Map certifications จาก profile → resume format ──
      const mappedCertifications = Array.isArray(data.certifications)
        ? data.certifications.map(c => ({
            _id:       uid(),
            name:      String(c.name || "").trim(),
            issuer:    String(c.issuer || "").trim(),
            issueDate: String(c.date || c.issueDate || "").trim(),
          })).filter(c => c.name)
        : [];

      // ── Map projects จาก profile → resume format ──
      const mappedProjects = Array.isArray(data.projects)
        ? data.projects.map(p => ({
            _id:       uid(),
            name:      String(p.name || p.title || "").trim(),
            techStack: String(p.techStack || p.category || "").trim(),
            link:      String(p.link || p.url || "").trim(),
          })).filter(p => p.name)
        : [];

      setResume({
        fullName:       data.name || "",
        jobTitle:       data.title || "",
        summary:        data.summary || "",
        email:          data.email || "",
        phone:          data.phone || "",
        location:       data.location || "",
        linkedin:       data.linkedin || "",
        github:         data.github || "",
        website:        data.website || "",
        skills:         mappedSkills.slice(0, 10),
        experience:     mappedExperience,
        education:      mappedEducation,
        languages:      mappedLanguages,
        certifications: mappedCertifications,
        projects:       mappedProjects,
        profileImage:   data.profileImage || "",
      });

      setResumeId(null);
      try { clearDraft(); } catch(e) {}

      // ── แจ้งผลสรุปให้ user เห็น ──
      const parts = [];
      if(mappedSkills.length)         parts.push(`${mappedSkills.length} ทักษะ`);
      if(mappedExperience.length)     parts.push(`${mappedExperience.length} ประสบการณ์`);
      if(mappedEducation.length)      parts.push(`${mappedEducation.length} การศึกษา`);
      if(mappedLanguages.length)      parts.push(`${mappedLanguages.length} ภาษา`);
      if(mappedCertifications.length) parts.push(`${mappedCertifications.length} ใบรับรอง`);
      if(mappedProjects.length)       parts.push(`${mappedProjects.length} โปรเจกต์`);
      const summary = parts.length > 0 ? ` (${parts.join(", ")})` : "";
      showToast(`สร้าง Resume จากโปรไฟล์สำเร็จ ✓${summary}`);
    } catch(err) {
      showToast("ไม่สามารถสร้าง Resume ได้: "+err.message,"error");
    } finally { setGenerating(false); }
  };

  /* ── Save ── */
  const handleSave = useCallback(async () => {
    if(!resume.fullName.trim()) { showToast("กรุณากรอกชื่อ-นามสกุลก่อนบันทึก","error"); return; }
    
    // ✅ Validate email format (if provided)
    if(resume.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resume.email.trim())) {
      showToast("รูปแบบอีเมลไม่ถูกต้อง","error"); return;
    }

    // ✅ Validate phone format (if provided) — Thai format: 0x-xxxx-xxxx or 10 digits
    if(resume.phone?.trim() && !/^0\d{1,2}[-\s]?\d{3,4}[-\s]?\d{3,4}$/.test(resume.phone.trim())) {
      showToast("รูปแบบเบอร์โทรไม่ถูกต้อง (เช่น 081-234-5678)","error"); return;
    }

    // ✅ Validate URL format for social links (if provided)
    const urlFields = [
      { key:"linkedin", label:"LinkedIn" },
      { key:"github",   label:"GitHub" },
      { key:"website",  label:"เว็บไซต์" },
    ];
    for(const { key, label } of urlFields) {
      const val = resume[key]?.trim();
      if(val && !val.startsWith("http://") && !val.startsWith("https://")) {
        showToast(`${label} ต้องเริ่มต้นด้วย https://`,"error"); return;
      }
    }
    
    // ✅ Validate template
    if (!BACKEND_TEMPLATES.includes(template)) {
      showToast(`เทมเพลต "${template}" ไม่รองรับ กรุณาเลือกใหม่`, "error");
      return;
    }
    
    const token = localStorage.getItem("token");
    if(!token) { showToast("กรุณาเข้าสู่ระบบก่อน","error"); return; }
    setSaving(true);
    try {
      const body    = { ...resume, template };
      const headers = { "Content-Type":"application/json", "Authorization":`Bearer ${token}` };

      const fn = resumeId
        ? () => fetchWithTimeout(`${API_URL}/${resumeId}`, { method:"PUT",  headers, body:JSON.stringify(body) }, REQUEST_TIMEOUT)
        : () => fetchWithTimeout(API_URL,                   { method:"POST", headers, body:JSON.stringify(body) }, REQUEST_TIMEOUT);

      const res = await retryFetch(fn, MAX_RETRIES);

      if(res.status===401) { localStorage.removeItem("token"); localStorage.removeItem("userID"); throw new Error("SESSION_EXPIRED"); }
      if(res.status===403) throw new Error("Resume ไม่พบหรือคุณไม่มีสิทธิ์เข้าถึง");
      if(!res.ok) { const err = await res.json().catch(()=>({})); throw new Error(err.message||`HTTP ${res.status}`); }

      const json = await res.json();
      if(!resumeId && json.data?.id) setResumeId(json.data.id);
      clearDraft();
      lastSavedState.current = JSON.stringify(resume);
      showToast(resumeId?"อัปเดต Resume เรียบร้อยแล้ว ✓":"บันทึก Resume เรียบร้อยแล้ว ✓");
    } catch(err) {
      if(err.message==="SESSION_EXPIRED") showToast("เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่","error",5000);
      else if(err.name==="AbortError")    showToast("หมดเวลารอการตอบสนอง กรุณาลองใหม่","error");
      else                                showToast("บันทึกไม่สำเร็จ: "+err.message,"error");
    } finally { setSaving(false); }
  }, [resume, resumeId, template, showToast]);

  /* ── Export PDF ── */
  const exportingRef = useRef(false);
  const handleExportPDF = async () => {
    const el = document.getElementById("resume-preview-root");
    if(!el) { showToast("กรอกข้อมูลก่อนแล้วค่อยส่งออก","error"); return; }
    if(exportingRef.current) return;
    exportingRef.current = true;
    setExporting(true);

    const A4_WIDTH_PX = 794;

    // Wrapper วางนอก viewport ไม่กระทบ layout จริง
    const wrapper = document.createElement("div");
    wrapper.style.cssText = [
      "position:absolute",
      "top:0",
      "left:-9999px",
      `width:${A4_WIDTH_PX}px`,
      "overflow:visible",
      "pointer-events:none",
      "z-index:-1",
    ].join(";");

    const clone = el.cloneNode(true);
    clone.removeAttribute("id");

    // ✅ ตั้งค่าเฉพาะ width — ไม่ override padding/margin ของ template
    // ✅ force ลบ min-height เพื่อป้องกันหน้าว่างส่วนเกิน
    clone.style.setProperty("width",      `${A4_WIDTH_PX}px`, "important");
    clone.style.setProperty("min-width",  `${A4_WIDTH_PX}px`, "important");
    clone.style.setProperty("max-width",  `${A4_WIDTH_PX}px`, "important");
    clone.style.setProperty("min-height", "0",                "important");
    clone.style.setProperty("height",     "auto",             "important");
    clone.style.setProperty("overflow",   "visible",          "important");

    // ลบ transform/scale ที่อาจติดมาจาก preview zoom
    clone.style.setProperty("transform",        "none", "important");
    clone.style.setProperty("transform-origin", "unset","important");

    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    // รอให้ browser layout clone ก่อน capture
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

    try {
      const html2pdf = (await import("html2pdf.js")).default;

      // รอรูปทุกรูปใน clone โหลดเสร็จ
      const imgs = clone.querySelectorAll("img");
      await Promise.all([...imgs].map(img =>
        img.complete ? Promise.resolve() : new Promise(r => { img.onload = r; img.onerror = r; })
      ));

      await html2pdf().set({
        margin:      0,
        filename:    `${resume.fullName || "resume"}.pdf`,
        image:       { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale:           2,
          useCORS:         true,
          allowTaint:      true,
          letterRendering: true,
          scrollX:         0,
          scrollY:         0,
          width:           A4_WIDTH_PX,
          windowWidth:     A4_WIDTH_PX,
        },
        jsPDF:       { unit: "mm", format: "a4", orientation: "portrait" },
        // หลายหน้าอัตโนมัติ — ไม่ตัดกลางกล่อง
        pagebreak:   { mode: ["css", "legacy"] },
      }).from(clone).save();

      showToast("ส่งออก PDF สำเร็จ ✓");
    } catch(err) {
      if(err.name !== "AbortError") showToast("ส่งออกไม่สำเร็จ: " + (err.message || "ข้อผิดพลาดที่ไม่ทราบ"), "error");
    } finally {
      document.body.removeChild(wrapper);
      exportingRef.current = false;
      setExporting(false);
    }
  };

  /* ── Keyboard shortcut: Ctrl/Cmd+S to save ── */
  useEffect(() => {
    const handler = (e) => {
      if((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if(!saving) handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [saving, handleSave]);

  /* ── Image upload ── */
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if(!file) return;
    if(!["image/jpeg","image/png","image/webp"].includes(file.type)) { showToast("รองรับเฉพาะ JPG, PNG, หรือ WebP","error"); return; }
    if(file.size > 5*1024*1024) { showToast("ไฟล์ใหญ่เกิน 5 MB","error"); return; }
    const reader = new FileReader();
    reader.onload  = ev => { if(ev.target?.result) setField("profileImage", ev.target.result); };
    reader.onerror = ()  => showToast("อ่านไฟล์ไม่สำเร็จ","error");
    reader.readAsDataURL(file);
  };

  const keepDraft = () => setDraftBanner(false);
  const discardDraft = () => {
    if(!window.confirm("ต้องการลบข้อมูลร่างหรือไม่?")) return;
    clearDraft();
    setResume(EMPTY_RESUME);
    setResumeId(null);
    setDraftBanner(false);
    lastSavedState.current = JSON.stringify(EMPTY_RESUME);
  };

  const handleResetAll = () => {
    if(!window.confirm("ต้องการล้างข้อมูล Resume ทั้งหมดใช่หรือไม่?\nข้อมูลที่กรอกจะหายทั้งหมด")) return;
    clearDraft();
    setResume(EMPTY_RESUME);
    setResumeId(null);
    setJobRole("");
    setTemplate("modern");
    setTemplateColors(Object.fromEntries(TEMPLATES.map(t => [t.id, t.accent])));
    lastSavedState.current = JSON.stringify(EMPTY_RESUME);
    showToast("ล้างข้อมูลทั้งหมดแล้ว","info");
  };

  const previewContent = (
    <ResumePreview
      key={`${template}-${templateColors[template]}`}
      resume={resume}
      template={template}
      isDark={isDark}
      accentOverride={templateColors[template]}
    />
  );

  /* ═══════════════════ RENDER ═══════════════════ */
  return (
    <>
      <Toast toast={toast} />

      {/* Draft Banner */}
      {draftBanner && (
        <div className="re-draft-banner">
          <span className="re-draft-banner__text">
            <span className="re-draft-banner__dot" />
            โหลดข้อมูลร่างล่าสุดจาก Local Storage แล้ว
          </span>
          <div className="re-draft-banner__actions">
            <button className="re-btn re-btn-ghost re-btn-sm" onClick={keepDraft}>เก็บข้อมูลร่าง</button>
            <button className="re-btn re-btn-danger re-btn-sm" onClick={discardDraft}>ล้างข้อมูล</button>
          </div>
        </div>
      )}

      <div className={`re-page${isDark?" re-dark":""}`}>

        {/* ══════════ TOP NAVIGATION ══════════ */}
        <TopNav
          resume={resume}
          activeSection={activeSection}
          onNav={scrollToSection}
          autoSavedAt={autoSavedAt}
          generating={generating}
          saving={saving}
          isDark={isDark}
          onGenerate={handleGenerate}
          onSave={handleSave}
          onReset={handleResetAll}
          onToggleDark={() => setIsDark(d => !d)}
          onTogglePreview={() => setPreviewOpen(v => !v)}
        />

        {/* Feedback strip — full width under topnav */}
        <FeedbackPanel resume={resume} onNav={scrollToSection} />

        {/* ══════════ BODY (form + preview) ══════════ */}
        <div className="re-body">

          {/* ── Form Panel ── */}
          <div className="re-form-panel">
            <div className="re-form-body">

              {/* Profile */}
              <div ref={el => sectionRefs.current.profile=el} data-section="profile" className="re-form-section">
                <div className="re-form-section__title"><span className="re-form-section__icon">◈</span> โปรไฟล์</div>
                <div className="re-card">
                  <SLabel>รูปโปรไฟล์</SLabel>
                  <div className="re-avatar-wrap">
                    <div className="re-avatar" onClick={() => fileRef.current?.click()} role="button" tabIndex={0} onKeyDown={e => e.key==="Enter" && fileRef.current?.click()}>
                      {resume.profileImage
                        ? <img src={resume.profileImage} alt="โปรไฟล์" />
                        : <div className="re-avatar__placeholder"><span>👤</span><span className="re-avatar__hint">คลิก</span></div>}
                    </div>
                    <div className="re-avatar-meta">
                      <p className="re-avatar-meta__title">รูปภาพโปรไฟล์</p>
                      <span className="re-avatar-meta__hint">JPG, PNG หรือ WebP · ไม่เกิน 5 MB</span>
                      <div className="re-avatar-actions">
                        <button className="re-btn re-btn-ghost re-btn-sm" onClick={() => fileRef.current?.click()}>อัปโหลด</button>
                        {resume.profileImage && (
                          <button className="re-btn re-btn-danger re-btn-sm" onClick={() => { if(window.confirm("ลบรูปโปรไฟล์ใช่หรือไม่?")) setField("profileImage",""); }}>ลบรูป</button>
                        )}
                      </div>
                    </div>
                  </div>
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display:"none" }} onChange={handleImageChange} />
                </div>

                <div className="re-card">
                  <SLabel>ข้อมูลส่วนตัว</SLabel>
                  <div className="re-input-grid">
                    <div className="re-input-full">
                      <label className="re-field-label">ชื่อ-นามสกุล</label>
                      <input className="re-input" placeholder="สมชาย ใจดี" value={resume.fullName} onChange={e => setField("fullName",e.target.value)} />
                    </div>
                    <div className="re-input-full">
                      <label className="re-field-label">ตำแหน่งงานที่ต้องการ</label>
                      <input className="re-input" placeholder="Senior Frontend Developer" value={resume.jobTitle} onChange={e => setField("jobTitle",e.target.value)} />
                    </div>
                  </div>
                </div>

                <JobRoleSelector jobRole={jobRole} onRoleChange={setJobRole} skills={resume.skills} onSkillsChange={v => setField("skills",v)} />
              </div>

              {/* Contact & Social */}
              <div ref={el => sectionRefs.current.contact=el} data-section="contact" className="re-form-section">
                <div className="re-form-section__title"><span className="re-form-section__icon">☎</span> ข้อมูลติดต่อ</div>
                <div className="re-card">
                  <SLabel>ช่องทางติดต่อ</SLabel>
                  <div className="re-input-grid">
                    <div className="re-input-half">
                      <label className="re-field-label">อีเมล</label>
                      <input className="re-input" type="email" placeholder="example@email.com" value={resume.email} onChange={e => setField("email",e.target.value)} />
                    </div>
                    <div className="re-input-half">
                      <label className="re-field-label">เบอร์โทรศัพท์</label>
                      <input className="re-input" type="tel" placeholder="08x-xxx-xxxx" value={resume.phone} onChange={e => setField("phone",e.target.value)} />
                    </div>
                    <div className="re-input-full">
                      <label className="re-field-label">ที่อยู่ / สถานที่</label>
                      <input className="re-input" placeholder="กรุงเทพมหานคร, ประเทศไทย" value={resume.location} onChange={e => setField("location",e.target.value)} />
                    </div>
                  </div>
                </div>
                <div className="re-card">
                  <SLabel>โซเชียลมีเดีย</SLabel>
                  <div className="re-input-grid">
                    <div className="re-input-full">
                      <label className="re-field-label">LinkedIn</label>
                      <input className="re-input" placeholder="https://linkedin.com/in/yourprofile" value={resume.linkedin} onChange={e => setField("linkedin",e.target.value)} />
                    </div>
                    <div className="re-input-half">
                      <label className="re-field-label">GitHub</label>
                      <input className="re-input" placeholder="https://github.com/yourprofile" value={resume.github} onChange={e => setField("github",e.target.value)} />
                    </div>
                    <div className="re-input-half">
                      <label className="re-field-label">เว็บไซต์</label>
                      <input className="re-input" placeholder="https://yourwebsite.com" value={resume.website} onChange={e => setField("website",e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div ref={el => sectionRefs.current.summary=el} data-section="summary" className="re-form-section">
                <div className="re-form-section__title"><span className="re-form-section__icon">≡</span> สรุปตัวเอง</div>
                <div className="re-card">
                  <div className="re-card__header">
                    <SLabel>สรุปตัวเอง (Summary)</SLabel>
                  </div>
                  <textarea
                    className="re-input re-textarea"
                    rows={4}
                    maxLength={500}
                    placeholder="เขียนสรุปเกี่ยวกับตัวคุณ ประสบการณ์ และเป้าหมายในอาชีพ…"
                    value={resume.summary}
                    onChange={e => setField("summary",e.target.value)}
                  />
                  <div className="re-char-count">
                    <span className={resume.summary.length<50&&resume.summary.length>0?"re-char-count--warn":resume.summary.length>=480?"re-char-count--warn":""}>
                      {resume.summary.length}/500 ตัวอักษร
                    </span>
                    {resume.summary.length<50&&resume.summary.length>0 && <span className="re-char-count__hint"> · แนะนำอย่างน้อย 50 ตัวอักษร</span>}
                    {resume.summary.length>=480 && <span className="re-char-count__hint"> · ใกล้ถึงขีดจำกัดแล้ว</span>}
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div ref={el => sectionRefs.current.skills=el} data-section="skills" className="re-form-section">
                <div className="re-form-section__title"><span className="re-form-section__icon">◇</span> ทักษะ</div>
                <SkillsSection skills={resume.skills} onChange={v => setField("skills",v)} />
              </div>

              {/* Experience */}
              <div ref={el => sectionRefs.current.experience=el} data-section="experience" className="re-form-section">
                <div className="re-form-section__title"><span className="re-form-section__icon">◉</span> ประสบการณ์ทำงาน</div>
                <ExperienceSection experience={resume.experience} onChange={v => setField("experience",v)} />
              </div>

              {/* Education */}
              <div ref={el => sectionRefs.current.education=el} data-section="education" className="re-form-section">
                <div className="re-form-section__title"><span className="re-form-section__icon">▣</span> ประวัติการศึกษา</div>
                <EducationSection education={resume.education} onChange={v => setField("education",v)} />
              </div>

              {/* Languages */}
              <div ref={el => sectionRefs.current.languages=el} data-section="languages" className="re-form-section">
                <div className="re-form-section__title"><span className="re-form-section__icon">◎</span> ภาษาที่ใช้ได้</div>
                <LanguagesSection languages={resume.languages} onChange={v => setField("languages",v)} />
              </div>

              {/* Certifications */}
              <div ref={el => sectionRefs.current.certifications=el} data-section="certifications" className="re-form-section">
                <div className="re-form-section__title"><span className="re-form-section__icon">★</span> ใบรับรอง</div>
                <CertificationsSection certifications={resume.certifications} onChange={v => setField("certifications",v)} />
              </div>

              {/* Projects */}
              <div ref={el => sectionRefs.current.projects=el} data-section="projects" className="re-form-section">
                <div className="re-form-section__title"><span className="re-form-section__icon">◆</span> โปรเจกต์</div>
                <ProjectsSection projects={resume.projects} onChange={v => setField("projects",v)} />
              </div>

              <div style={{ height:40 }} />
            </div>
          </div>

          {/* ── Preview Panel (≥1100px) ── */}
          <section className="re-preview-panel">
            <div className="re-preview-topbar">
              <div className="re-topbar-left">
                <span className="re-preview-filename">
                  {resume.fullName
                    ? `${resume.fullName.toLowerCase().replace(/\s+/g,"_")}.pdf`
                    : "ตัวอย่าง_resume.pdf"}
                </span>
              </div>
              <div className="re-topbar-right">
                <PreviewControls
                  template={template} setTemplate={setTemplate}
                  templateColors={templateColors} setTemplateColors={setTemplateColors}
                  previewZoom={previewZoom} setPreviewZoom={setPreviewZoom}
                  exporting={exporting} onExport={handleExportPDF}
                />
              </div>
            </div>
            <div className="re-preview-scroll">
              <div className="re-preview-zoom-wrap" style={{ transform:`scale(${previewZoom})`, transformOrigin:"top center" }}>
                {previewContent}
              </div>
            </div>
          </section>
        </div>

        {/* ══════════ Mobile/Tablet Preview Drawer ══════════ */}
        <div className={`re-preview-drawer${previewOpen?" is-open":""}`} onClick={e => { if(e.target===e.currentTarget) setPreviewOpen(false); }}>
          <div className="re-preview-drawer__panel">
            <div className="re-preview-drawer__header">
              <div className="re-topbar-left">
                <span className="re-preview-filename">
                  {resume.fullName ? `${resume.fullName.toLowerCase().replace(/\s+/g,"_")}.pdf` : "ตัวอย่าง_resume.pdf"}
                </span>
              </div>
              <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
                <PreviewControls
                  template={template} setTemplate={setTemplate}
                  templateColors={templateColors} setTemplateColors={setTemplateColors}
                  previewZoom={previewZoom} setPreviewZoom={setPreviewZoom}
                  exporting={exporting} onExport={handleExportPDF}
                />
                <button className="re-preview-drawer__close" onClick={() => setPreviewOpen(false)}>✕ ปิด</button>
              </div>
            </div>
            <div className="re-preview-drawer__body">
              <div className="re-preview-drawer__inner" style={{ transform:`scale(${previewZoom})`, transformOrigin:"top center" }}>
                {previewContent}
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}