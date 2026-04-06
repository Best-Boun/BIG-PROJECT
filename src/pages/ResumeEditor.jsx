import "./ResumeEditor.css";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS & DATA
═══════════════════════════════════════════════════════════════ */
const DRAFT_KEY = "resume_editor_v3_draft";
const API_URL   = "http://localhost:3000/api/resume";

const LANG_LEVELS    = ["เจ้าของภาษา", "คล่องแคล่ว", "ขั้นสูง", "ระดับกลาง", "เบื้องต้น"];
const LANG_LEVEL_PCT = { เจ้าของภาษา: 100, คล่องแคล่ว: 85, ขั้นสูง: 68, ระดับกลาง: 50, เบื้องต้น: 28 };

const SKILL_SUGGESTIONS = [
  "React","Vue","Angular","Next.js","TypeScript","JavaScript","Python","Node.js",
  "Java","C#","PHP","Laravel","Django","FastAPI","GraphQL","REST API","Docker",
  "Kubernetes","AWS","GCP","Azure","PostgreSQL","MySQL","MongoDB","Redis",
  "Git","CI/CD","Figma","Tailwind CSS","HTML","CSS","Linux","Agile","Scrum",
];

const SUMMARY_REWRITES = [
  (s) => (s.includes("ทำเว็บ") || s.includes("web"))
    ? "พัฒนาเว็บแอปพลิเคชันที่มีประสิทธิภาพสูงด้วย React, Node.js และเทคโนโลยีสมัยใหม่ พร้อมมุ่งเน้นการยกระดับประสบการณ์ผู้ใช้และคุณภาพโค้ดให้ดียิ่งขึ้นอยู่เสมอ"
    : null,
  (s) => (s.includes("ดูแล") || s.includes("manage"))
    ? "ขับเคลื่อนและบริหารจัดการโปรเจคด้านเทคโนโลยีให้บรรลุเป้าหมาย พร้อมนำทีมพัฒนาให้ทำงานได้อย่างมีประสิทธิภาพสูงสุดในทุกสถานการณ์"
    : null,
  (s) => (s.includes("วิเคราะห์") || s.includes("data") || s.includes("ข้อมูล"))
    ? "วิเคราะห์และประมวลผลข้อมูลขนาดใหญ่เพื่อสร้าง insight เชิงธุรกิจ ด้วย Python และเครื่องมือ Data Science ชั้นนำระดับอุตสาหกรรม"
    : null,
];

const TEMPLATES = [
  { id: "modern",  label: "Modern",  desc: "สีสันทันสมัย" },
  { id: "minimal", label: "Minimal", desc: "สะอาดเรียบร้อย" },
  { id: "bold",    label: "Bold",    desc: "เข้มแข็งโดดเด่น" },
];

const JOB_ROLES = [
  { id: "",          label: "— เลือกสายงาน —" },
  { id: "frontend",  label: "Frontend Developer" },
  { id: "backend",   label: "Backend Developer" },
  { id: "fullstack", label: "Full Stack Developer" },
  { id: "data",      label: "Data Analyst" },
  { id: "uxui",      label: "UX/UI Designer" },
];

const ROLE_KEYWORDS = {
  frontend:  ["React","Vue","Next.js","TypeScript","JavaScript","HTML","CSS","Tailwind CSS","Figma","Webpack"],
  backend:   ["Node.js","Express","Python","Django","FastAPI","PostgreSQL","MySQL","MongoDB","Redis","Docker"],
  fullstack: ["React","Node.js","TypeScript","REST API","GraphQL","Docker","PostgreSQL","AWS","CI/CD","Git"],
  data:      ["Python","SQL","Pandas","NumPy","Power BI","Tableau","Machine Learning","Excel","R","Jupyter"],
  uxui:      ["Figma","Adobe XD","Sketch","Prototyping","Wireframing","User Research","Design System","HTML","CSS","Zeplin"],
};

const EMPTY_RESUME = {
  fullName: "", jobTitle: "", summary: "",
  skills: [], education: [], experience: [], languages: [],
  profileImage: "",
};

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */
function uid() { return Math.random().toString(36).slice(2, 9); }

function withIds(arr) {
  return (arr || []).map((item) => (item._id ? item : { _id: uid(), ...item }));
}

function saveDraft(data) {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ ts: Date.now(), data })); }
  catch (err) { console.error("บันทึก draft ไม่สำเร็จ:", err); }
}

function loadDraft() {
  try { const raw = localStorage.getItem(DRAFT_KEY); return raw ? JSON.parse(raw) : null; }
  catch (err) { console.error("โหลด draft ไม่สำเร็จ:", err); return null; }
}

function clearDraft() {
  try { localStorage.removeItem(DRAFT_KEY); }
  catch (err) { console.error("ลบ draft ไม่สำเร็จ:", err); }
}

function calcCompletion(resume) {
  const checks = [
    { key: "fullName",     label: "ชื่อ-นามสกุล",        done: !!resume.fullName.trim() },
    { key: "jobTitle",     label: "ตำแหน่งงาน",           done: !!resume.jobTitle.trim() },
    { key: "summary",      label: "สรุปตัวเอง (Summary)", done: resume.summary.trim().length > 30 },
    { key: "skills",       label: "ทักษะ (อย่างน้อย 3)",  done: resume.skills.length >= 3 },
    { key: "experience",   label: "ประสบการณ์ทำงาน",      done: resume.experience.length > 0 },
    { key: "education",    label: "ประวัติการศึกษา",       done: resume.education.length > 0 },
    { key: "languages",    label: "ภาษา",                  done: resume.languages.length > 0 },
    { key: "profileImage", label: "รูปโปรไฟล์",            done: !!resume.profileImage },
  ];
  const done = checks.filter((c) => c.done).length;
  return { pct: Math.round((done / checks.length) * 100), checks };
}

function rewriteSummary(summary) {
  const lower = summary.toLowerCase();
  for (const fn of SUMMARY_REWRITES) { const r = fn(lower); if (r) return r; }
  const trimmed = summary.trim();
  if (!trimmed)            return "นักพัฒนาซอฟต์แวร์ที่มีทักษะหลากหลาย มุ่งมั่นสร้างสรรค์ผลงานคุณภาพสูง และพร้อมเรียนรู้เทคโนโลยีใหม่อยู่เสมอ";
  if (trimmed.length < 30) return `${trimmed} พร้อมนำความเชี่ยวชาญมาสร้างคุณค่าให้กับองค์กร และมุ่งพัฒนาตนเองอย่างต่อเนื่อง`;
  return trimmed;
}

/* ═══════════════════════════════════════════════════════════════
   MICRO COMPONENTS
═══════════════════════════════════════════════════════════════ */
function Spinner({ dark }) {
  return <span className={`re-spinner${dark ? " re-spinner-dark" : ""}`} />;
}

function Toast({ toast }) {
  if (!toast) return null;
  const icon = toast.type === "success" ? "✓" : toast.type === "error" ? "!" : "i";
  return (
    <div className={`re-toast re-toast--${toast.type}`}>
      <span>{icon}</span>
      {toast.message}
    </div>
  );
}

function SLabel({ children }) {
  return <p className="re-section-label">{children}</p>;
}

/* ═══════════════════════════════════════════════════════════════
   COMPLETION PANEL
═══════════════════════════════════════════════════════════════ */
function CompletionPanel({ resume }) {
  const { pct, checks } = calcCompletion(resume);
  const missing = checks.filter((c) => !c.done);
  const barMod  = pct >= 80 ? "high" : pct >= 50 ? "mid" : "low";
  const pctMod  = pct >= 80 ? "high" : pct >= 50 ? "mid" : "low";

  return (
    <div className="re-card">
      <div className="re-completion-row">
        <SLabel>ความสมบูรณ์ของ Resume</SLabel>
        <span className={`re-completion-pct re-completion-pct--${pctMod}`}>{pct}%</span>
      </div>
      <div className="re-progress-wrap">
        <div className={`re-progress-bar re-progress-bar--${barMod}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="re-completion-hints">
        {missing.slice(0, 3).map((c) => (
          <div key={c.key} className="re-completion-hint">
            <span>—</span><span>ยังไม่ได้เพิ่ม{c.label}</span>
          </div>
        ))}
        {pct >= 80 && (
          <div className="re-completion-hint re-completion-hint--ok">
            <span>✓</span><span>โปรไฟล์ครบ {pct}% แล้ว — พร้อมส่งสมัครงาน</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FEEDBACK PANEL
═══════════════════════════════════════════════════════════════ */
function FeedbackPanel({ resume }) {
  const feedbacks = useMemo(() => {
    const items = [];
    if (!resume.fullName.trim())        items.push({ level: "error", text: "ยังไม่ได้กรอกชื่อ-นามสกุล" });
    if (!resume.jobTitle.trim())        items.push({ level: "error", text: "ยังไม่ได้กรอกตำแหน่งงาน" });
    if (resume.experience.length === 0) items.push({ level: "error", text: "ยังไม่ได้เพิ่มประสบการณ์ทำงาน" });
    if (resume.education.length === 0)  items.push({ level: "error", text: "ยังไม่ได้เพิ่มประวัติการศึกษา" });
    if (resume.summary.trim().length > 0 && resume.summary.trim().length < 50)
      items.push({ level: "warn", text: `Summary สั้นเกินไป (${resume.summary.trim().length}/50 ตัวอักษร)` });
    if (resume.summary.trim().length === 0) items.push({ level: "warn", text: "ยังไม่ได้เขียน Summary" });
    if (resume.skills.length > 0 && resume.skills.length < 3)
      items.push({ level: "warn", text: `ทักษะน้อยเกินไป (${resume.skills.length}/3 รายการขั้นต่ำ)` });
    if (resume.skills.length === 0)     items.push({ level: "warn", text: "ยังไม่ได้เพิ่มทักษะ" });
    if (!resume.profileImage)           items.push({ level: "warn", text: "ยังไม่มีรูปโปรไฟล์" });
    if (resume.languages.length === 0)  items.push({ level: "warn", text: "ยังไม่ได้เพิ่มข้อมูลภาษา" });
    return items;
  }, [resume]);

  const errors = feedbacks.filter((f) => f.level === "error");
  const warns  = feedbacks.filter((f) => f.level === "warn");

  if (feedbacks.length === 0) {
    return (
      <div className="re-card">
        <div className="re-feedback-list">
          <div className="re-feedback-item re-feedback-item--ok">
            <span className="re-feedback-icon">✓</span>
            <span>Resume สมบูรณ์แล้ว — พร้อมสำหรับการสมัครงาน</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="re-card">
      <div className="re-feedback-header">
        <SLabel>คำแนะนำ Resume</SLabel>
        <div className="re-feedback-badges">
          {errors.length > 0 && <span className="re-feedback-badge re-feedback-badge--error">{errors.length} สำคัญ</span>}
          {warns.length  > 0 && <span className="re-feedback-badge re-feedback-badge--warn">{warns.length} แนะนำ</span>}
        </div>
      </div>
      <div className="re-feedback-list">
        {errors.map((f, i) => (
          <div key={i} className="re-feedback-item re-feedback-item--error">
            <span className="re-feedback-icon">✕</span><span>{f.text}</span>
          </div>
        ))}
        {warns.map((f, i) => (
          <div key={i} className="re-feedback-item re-feedback-item--warn">
            <span className="re-feedback-icon">–</span><span>{f.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   JOB ROLE SELECTOR
═══════════════════════════════════════════════════════════════ */
function JobRoleSelector({ jobRole, onRoleChange, skills, onSkillsChange }) {
  const keywords  = useMemo(() => ROLE_KEYWORDS[jobRole] || [], [jobRole]);
  const available = useMemo(() => keywords.filter((kw) => !skills.includes(kw)), [keywords, skills]);

  const addKeyword = (kw) => {
    if (!skills.includes(kw) && skills.length < 10) onSkillsChange([...skills, kw]);
  };

  const addAll = () => {
    const toAdd = available.slice(0, 10 - skills.length);
    if (toAdd.length > 0) onSkillsChange([...skills, ...toAdd]);
  };

  return (
    <div className="re-card">
      <div className="re-card__header">
        <SLabel>สายงาน &amp; Keyword แนะนำ</SLabel>
        {jobRole && available.length > 0 && (
          <button className="re-btn re-btn-ghost re-btn-sm" onClick={addAll} disabled={skills.length >= 10}>
            + เพิ่มทั้งหมด
          </button>
        )}
      </div>
      <select
        className="re-input re-select"
        value={jobRole}
        onChange={(e) => onRoleChange(e.target.value)}
        style={{ marginBottom: keywords.length > 0 ? 12 : 0 }}
      >
        {JOB_ROLES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
      </select>
      {jobRole && keywords.length > 0 && (
        <>
          <p className="re-field-label re-keywords-label">Keyword สำหรับสายงานนี้</p>
          <div className="re-keywords-wrap">
            {keywords.map((kw) => {
              const already = skills.includes(kw);
              const full    = skills.length >= 10 && !already;
              return (
                <button
                  key={kw}
                  className={`re-keyword-chip${already ? " re-keyword-chip--added" : ""}`}
                  onClick={() => !already && !full && addKeyword(kw)}
                  disabled={full}
                  title={already ? "มีใน Skills แล้ว" : full ? "Skills เต็ม 10" : `เพิ่ม ${kw}`}
                >
                  {already ? "✓ " : ""}{kw}
                </button>
              );
            })}
          </div>
          {available.length === 0 && (
            <p className="re-keywords-ok"><span>✓</span><span>เพิ่ม keyword ของสายงานนี้ครบแล้ว</span></p>
          )}
        </>
      )}
      {!jobRole && <p className="re-keywords-hint">เลือกสายงานเพื่อดู keyword แนะนำ</p>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SKILLS SECTION
═══════════════════════════════════════════════════════════════ */
function SkillsSection({ skills, onChange }) {
  const [val, setVal]         = useState("");
  const [hoverId, setHoverId] = useState(-1);

  const suggestions = val.trim().length > 0
    ? SKILL_SUGGESTIONS.filter((sk) => sk.toLowerCase().includes(val.toLowerCase()) && !skills.includes(sk)).slice(0, 6)
    : [];

  const addSkill = (skill) => {
    const t = (skill || val).trim();
    if (t && !skills.includes(t) && skills.length < 10) onChange([...skills, t]);
    setVal(""); setHoverId(-1);
  };

  const remove = (sk) => onChange(skills.filter((x) => x !== sk));

  return (
    <div className="re-card">
      <div className="re-card__header">
        <SLabel>ทักษะ</SLabel>
        <span className="re-skills-count">{skills.length}/10</span>
      </div>
      <div className="re-tags-wrap">
        {skills.map((sk) => (
          <span key={sk} className="re-tag">
            {sk}
            <button className="re-tag__x" onClick={() => remove(sk)}>×</button>
          </span>
        ))}
        {skills.length === 0 && <span className="re-empty-hint">ยังไม่มีทักษะ</span>}
      </div>
      {skills.length < 10 && (
        <div className="re-add-row">
          <input
            className="re-input"
            style={{ flex: 1 }}
            placeholder="พิมพ์ทักษะแล้วกด Enter…"
            value={val}
            onChange={(e) => { setVal(e.target.value); setHoverId(-1); }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addSkill(); }
              if (e.key === "ArrowDown") { e.preventDefault(); setHoverId((h) => Math.min(h + 1, suggestions.length - 1)); }
              if (e.key === "ArrowUp")   { e.preventDefault(); setHoverId((h) => Math.max(h - 1, -1)); }
              if (e.key === "Escape")    { setVal(""); setHoverId(-1); }
            }}
          />
          <button className="re-btn re-btn-ghost" onClick={() => addSkill()} disabled={!val.trim()}>เพิ่ม</button>
          {suggestions.length > 0 && (
            <div className="re-autocomplete">
              {suggestions.map((sg, i) => (
                <div
                  key={sg}
                  className={`re-autocomplete__item${i === hoverId ? " re-autocomplete__item--hover" : ""}`}
                  onMouseEnter={() => setHoverId(i)}
                  onMouseLeave={() => setHoverId(-1)}
                  onMouseDown={(e) => { e.preventDefault(); addSkill(sg); }}
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

/* ═══════════════════════════════════════════════════════════════
   EXPERIENCE SECTION
═══════════════════════════════════════════════════════════════ */
function ExperienceSection({ experience, onChange }) {
  const [adding, setAdding]   = useState(false);
  const [dragIdx, setDragIdx] = useState(null);
  const [overIdx, setOverIdx] = useState(null);
  const [form, setForm]       = useState({ company: "", position: "", startDate: "", endDate: "", description: "" });

  const add = () => {
    if (!form.company.trim()) return;
    onChange([{ _id: uid(), ...form }, ...experience]);
    setForm({ company: "", position: "", startDate: "", endDate: "", description: "" });
    setAdding(false);
  };

  const remove = (id) => onChange(experience.filter((e) => e._id !== id));
  const update = (id, field, value) => onChange(experience.map((e) => e._id === id ? { ...e, [field]: value } : e));

  const handleDrop = (targetIdx) => {
    if (dragIdx === null || dragIdx === targetIdx) return;
    const arr = [...experience];
    const [moved] = arr.splice(dragIdx, 1);
    arr.splice(targetIdx, 0, moved);
    onChange(arr);
    setDragIdx(null); setOverIdx(null);
  };

  return (
    <div className="re-card">
      <div className="re-card__header">
        <SLabel>ประสบการณ์ทำงาน</SLabel>
        <button className="re-btn re-btn-ghost re-btn-sm" onClick={() => setAdding((v) => !v)}>
          {adding ? "ยกเลิก" : "+ เพิ่ม"}
        </button>
      </div>
      {experience.map((exp, idx) => (
        <div
          key={exp._id}
          draggable
          onDragStart={() => setDragIdx(idx)}
          onDragOver={(e) => { e.preventDefault(); setOverIdx(idx); }}
          onDrop={() => handleDrop(idx)}
          onDragEnd={() => { setDragIdx(null); setOverIdx(null); }}
          className={`re-list-item${dragIdx === idx ? " re-list-item--dragging" : ""}${overIdx === idx ? " re-list-item--dragover" : ""}`}
        >
          <div className="re-list-item__head">
            <div>
              <div className="re-list-item__title">{exp.position || <em style={{ opacity: .4 }}>ตำแหน่ง</em>}</div>
              <div className="re-list-item__sub">{exp.company}</div>
            </div>
            <div className="re-list-item__meta">
              <span className="re-drag-handle">⠿</span>
              <button className="re-btn re-btn-danger" onClick={() => remove(exp._id)}>ลบ</button>
            </div>
          </div>
          <div className="re-input-grid">
            <div><label className="re-field-label">บริษัท</label><input className="re-input" value={exp.company} onChange={(e) => update(exp._id, "company", e.target.value)} /></div>
            <div><label className="re-field-label">ตำแหน่ง</label><input className="re-input" value={exp.position} onChange={(e) => update(exp._id, "position", e.target.value)} /></div>
            <div><label className="re-field-label">วันที่เริ่ม</label><input className="re-input" value={exp.startDate} placeholder="ม.ค. 2564" onChange={(e) => update(exp._id, "startDate", e.target.value)} /></div>
            <div><label className="re-field-label">วันที่สิ้นสุด</label><input className="re-input" value={exp.endDate} placeholder="ปัจจุบัน" onChange={(e) => update(exp._id, "endDate", e.target.value)} /></div>
            <div className="re-input-full">
              <label className="re-field-label">รายละเอียด</label>
              <textarea className="re-input re-textarea" rows={3} value={exp.description} placeholder="รายละเอียดงานและความสำเร็จ…" onChange={(e) => update(exp._id, "description", e.target.value)} />
            </div>
          </div>
        </div>
      ))}
      {adding && (
        <div className="re-add-form">
          <p className="re-section-label" style={{ marginBottom: 12 }}>เพิ่มประสบการณ์ใหม่</p>
          <div className="re-input-grid">
            <div><label className="re-field-label">บริษัท</label><input className="re-input" placeholder="Google" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
            <div><label className="re-field-label">ตำแหน่ง</label><input className="re-input" placeholder="Software Engineer" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} /></div>
            <div><label className="re-field-label">วันที่เริ่ม</label><input className="re-input" placeholder="ม.ค. 2564" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
            <div><label className="re-field-label">วันที่สิ้นสุด</label><input className="re-input" placeholder="ปัจจุบัน" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
            <div className="re-input-full">
              <label className="re-field-label">รายละเอียด</label>
              <textarea className="re-input re-textarea" rows={3} placeholder="รายละเอียดหน้าที่และความสำเร็จ…" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          <button className="re-btn re-btn-primary re-btn-sm" style={{ marginTop: 10 }} onClick={add} disabled={!form.company.trim()}>บันทึก</button>
        </div>
      )}
      {experience.length === 0 && !adding && <p className="re-empty-hint">ยังไม่มีประสบการณ์ทำงาน</p>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   EDUCATION SECTION
═══════════════════════════════════════════════════════════════ */
function EducationSection({ education, onChange }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm]     = useState({ school: "", degree: "", startYear: "", endYear: "" });

  const add = () => {
    if (!form.school.trim()) return;
    onChange([...education, { _id: uid(), ...form }]);
    setForm({ school: "", degree: "", startYear: "", endYear: "" });
    setAdding(false);
  };

  const remove = (id) => onChange(education.filter((e) => e._id !== id));
  const update = (id, field, value) => onChange(education.map((e) => e._id === id ? { ...e, [field]: value } : e));

  return (
    <div className="re-card">
      <div className="re-card__header">
        <SLabel>ประวัติการศึกษา</SLabel>
        <button className="re-btn re-btn-ghost re-btn-sm" onClick={() => setAdding((v) => !v)}>
          {adding ? "ยกเลิก" : "+ เพิ่ม"}
        </button>
      </div>
      {education.map((edu) => (
        <div key={edu._id} className="re-list-item">
          <div className="re-list-item__head">
            <div>
              <div className="re-list-item__title">{edu.school || <em style={{ opacity: .4 }}>โรงเรียน</em>}</div>
              <div className="re-list-item__sub">{edu.degree}{edu.startYear ? ` · ${edu.startYear}–${edu.endYear || "?"}` : ""}</div>
            </div>
            <button className="re-btn re-btn-danger" onClick={() => remove(edu._id)}>ลบ</button>
          </div>
          <div className="re-input-grid">
            <div className="re-input-full"><label className="re-field-label">โรงเรียน / มหาวิทยาลัย</label><input className="re-input" value={edu.school} onChange={(e) => update(edu._id, "school", e.target.value)} /></div>
            <div className="re-input-full"><label className="re-field-label">วุฒิ / สาขา</label><input className="re-input" value={edu.degree} onChange={(e) => update(edu._id, "degree", e.target.value)} /></div>
            <div><label className="re-field-label">ปีที่เข้า</label><input className="re-input" placeholder="2559" value={edu.startYear} onChange={(e) => update(edu._id, "startYear", e.target.value)} /></div>
            <div><label className="re-field-label">ปีที่จบ</label><input className="re-input" placeholder="2563" value={edu.endYear} onChange={(e) => update(edu._id, "endYear", e.target.value)} /></div>
          </div>
        </div>
      ))}
      {adding && (
        <div className="re-add-form">
          <p className="re-section-label" style={{ marginBottom: 12 }}>เพิ่มการศึกษาใหม่</p>
          <div className="re-input-grid">
            <div className="re-input-full"><label className="re-field-label">โรงเรียน / มหาวิทยาลัย</label><input className="re-input" placeholder="จุฬาลงกรณ์มหาวิทยาลัย" value={form.school} onChange={(e) => setForm({ ...form, school: e.target.value })} /></div>
            <div className="re-input-full"><label className="re-field-label">วุฒิ / สาขา</label><input className="re-input" placeholder="วิศวกรรมศาสตร์" value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })} /></div>
            <div><label className="re-field-label">ปีที่เข้า</label><input className="re-input" placeholder="2559" value={form.startYear} onChange={(e) => setForm({ ...form, startYear: e.target.value })} /></div>
            <div><label className="re-field-label">ปีที่จบ</label><input className="re-input" placeholder="2563" value={form.endYear} onChange={(e) => setForm({ ...form, endYear: e.target.value })} /></div>
          </div>
          <button className="re-btn re-btn-primary re-btn-sm" style={{ marginTop: 10 }} onClick={add} disabled={!form.school.trim()}>บันทึก</button>
        </div>
      )}
      {education.length === 0 && !adding && <p className="re-empty-hint">ยังไม่มีข้อมูลการศึกษา</p>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LANGUAGE SECTION
═══════════════════════════════════════════════════════════════ */
function LanguagesSection({ languages, onChange }) {
  const add    = () => onChange([...languages, { _id: uid(), name: "", level: "ระดับกลาง" }]);
  const remove = (id) => onChange(languages.filter((l) => l._id !== id));
  const update = (id, field, val) => onChange(languages.map((l) => l._id === id ? { ...l, [field]: val } : l));

  return (
    <div className="re-card">
      <div className="re-card__header">
        <SLabel>ภาษา</SLabel>
        <button className="re-btn re-btn-ghost re-btn-sm" onClick={add}>+ เพิ่ม</button>
      </div>
      {languages.map((lang) => (
        <div key={lang._id} className="re-lang-row">
          <input className="re-input" style={{ flex: 1 }} placeholder="ชื่อภาษา" value={lang.name} onChange={(e) => update(lang._id, "name", e.target.value)} />
          <select className="re-input re-select re-lang-select" value={lang.level} onChange={(e) => update(lang._id, "level", e.target.value)}>
            {LANG_LEVELS.map((l) => <option key={l}>{l}</option>)}
          </select>
          <button className="re-btn re-btn-danger" onClick={() => remove(lang._id)}>×</button>
        </div>
      ))}
      {languages.length === 0 && <p className="re-empty-hint">ยังไม่มีข้อมูลภาษา</p>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   RESUME PAPER PREVIEW
═══════════════════════════════════════════════════════════════ */
const NAVY       = "#1e3a5f";
const PAPER_RULE = "#e4e7ed";

function PaperSection({ title, accentColor, children }) {
  return (
    <div className="re-sec">
      <div className="re-sec__head" style={{ color: accentColor }}>
        <span className="re-sec__label">{title}</span>
        <div className="re-sec__rule" />
      </div>
      {children}
    </div>
  );
}

function ResumePreview({ resume, isDark }) {
  const accent  = isDark ? "#4a7fb5" : NAVY;
  const textPri = isDark ? "#e8f0f9" : "#0d1b2a";
  const textSec = isDark ? "#6e8aaa" : "#5e7087";
  const textTer = isDark ? "#334a62" : "#9aaabb";
  const ruleBdr = isDark ? "#1a2e45" : PAPER_RULE;
  const skillBg = isDark ? "#0f1e3022" : `${NAVY}0d`;

  const isEmpty = !resume.fullName && !resume.jobTitle && !resume.summary
    && !resume.skills.length && !resume.experience.length;

  if (isEmpty) {
    return (
      <div className="re-paper">
        <div className="re-paper-empty">
          <span className="re-paper-empty__icon">📄</span>
          <p className="re-paper-empty__text">
            กรอกข้อมูลในฟอร์มด้านซ้าย<br />
            หรือกด <strong>สร้างจากโปรไฟล์</strong>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="re-paper" id="resume-preview-root">
      <div className="re-paper-stripe" style={{ background: accent }} />
      <div className="re-paper-hero">
        <div className="re-paper-avatar" style={{ background: `${accent}12`, border: `3px solid ${accent}20` }}>
          {resume.profileImage
            ? <img src={resume.profileImage} alt="โปรไฟล์" crossOrigin="anonymous" />
            : <span style={{ opacity: .3, color: accent }}>👤</span>}
        </div>
        <div className="re-paper-meta">
          <h1 className="re-paper-name" style={{ color: textPri }}>{resume.fullName || "ชื่อของคุณ"}</h1>
          {resume.jobTitle && <p className="re-paper-title" style={{ color: accent }}>{resume.jobTitle}</p>}
        </div>
      </div>
      <div className="re-paper-rule" style={{ background: ruleBdr }} />
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
                {(exp.startDate || exp.endDate) && (
                  <div className="re-exp-date" style={{ color: textTer }}>
                    {exp.startDate}{exp.endDate ? ` – ${exp.endDate}` : ""}
                  </div>
                )}
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
                {(edu.startYear || edu.endYear) && (
                  <div className="re-edu-years" style={{ color: textTer }}>
                    {edu.startYear}{edu.endYear ? ` – ${edu.endYear}` : ""}
                  </div>
                )}
              </div>
            ))}
          </PaperSection>
        )}
        {resume.skills.length > 0 && (
          <PaperSection title="ทักษะ" accentColor={accent}>
            <div className="re-paper-skills">
              {resume.skills.map((sk) => (
                <span key={sk} className="re-paper-skill"
                  style={{ background: skillBg, color: accent, borderColor: `${accent}28` }}>
                  {sk}
                </span>
              ))}
            </div>
          </PaperSection>
        )}
        {resume.languages.length > 0 && (
          <PaperSection title="ภาษา" accentColor={accent}>
            <div className="re-lang-grid">
              {resume.languages.map((lang, i) => (
                <div key={lang._id || i} className="re-lang-item">
                  <div className="re-lang-row-p">
                    <span className="re-lang-name" style={{ color: textPri }}>{lang.name}</span>
                    <span className="re-lang-lvl" style={{ color: textTer }}>{lang.level}</span>
                  </div>
                  <div className="re-lang-track" style={{ background: ruleBdr }}>
                    <div className="re-lang-fill"
                      style={{ width: `${LANG_LEVEL_PCT[lang.level] || 50}%`, background: accent }} />
                  </div>
                </div>
              ))}
            </div>
          </PaperSection>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function ResumeEditor() {
  const [resume, setResume]           = useState(EMPTY_RESUME);
  const [resumeId, setResumeId]       = useState(null);
  const [template, setTemplate]       = useState("modern");
  const [isDark, setIsDark]           = useState(false);
  const [jobRole, setJobRole]         = useState("");
  const [generating, setGenerating]   = useState(false);
  const [saving, setSaving]           = useState(false);
  const [exporting, setExporting]     = useState(false);
  const [rewriting, setRewriting]     = useState(false);
  const [toast, setToast]             = useState(null);
  const [draftBanner, setDraftBanner] = useState(false);
  const [autoSavedAt, setAutoSavedAt] = useState(null);

  const fileRef    = useRef(null);
  const toastTimer = useRef(null);

  /* ── Toast helper ── */
  const showToast = useCallback((message, type = "success") => {
    clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  /* ── โหลดข้อมูลเมื่อเปิดหน้า: พยายามดึง Profile ก่อน ถ้าไม่มีค่อยโหลด Draft ── */
  useEffect(() => {
    (async () => {
      // try to fetch profile data first (if user is logged in)
      const userId = localStorage.getItem("userID");
      if (userId) {
        try {
          const res = await fetch(`http://localhost:3000/api/profiles?userId=${userId}`);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              const p = data[0];
              const mapped = {
                fullName:     p.name || "",
                jobTitle:     p.title || "",
                summary:      p.summary || "",
                profileImage: p.profileImage || "",
                skills:       Array.isArray(p.skills) ? p.skills.map((s) => (typeof s === "string" ? s : s.skill)) : [],
                experience:   Array.isArray(p.experience) ? p.experience.map((e) => ({ _id: uid(), position: e.role || "", company: e.company || "", startDate: e.startDate || "", endDate: e.endDate || "", description: e.description || "" })) : [],
                education:    Array.isArray(p.education)  ? p.education.map((e) => ({ _id: uid(), school: e.institution || "", degree: e.degree || "", startYear: e.startDate ? String(e.startDate).slice(0,4) : "", endYear: e.endDate ? String(e.endDate).slice(0,4) : "" })) : [],
                languages:    Array.isArray(p.languages)  ? p.languages.map((l) => ({ _id: uid(), name: l.language || "", level: l.level || "" })) : [],
              };

              // don't let stale draft override a freshly loaded profile
              try { clearDraft(); } catch (e) { /* ignore */ }

              setResume(mapped);
              setResumeId(null);
              return; // profile found — done
            }
          }
        } catch (err) {
          // ignore profile fetch errors — fallback to draft
          // console.debug("profile fetch failed:", err);
        }
      }

      // fallback: apply saved draft only if present
      const draft = loadDraft();
      if (draft?.data) {
        setResume({ ...EMPTY_RESUME, ...draft.data });
        if (draft.data._resumeId) setResumeId(draft.data._resumeId);
        setDraftBanner(true);
      }
    })();
  }, []);

  /* ── Auto-save draft ทุก 1.5 วินาที ── */
  useEffect(() => {
    const t = setTimeout(() => {
      saveDraft({ ...resume, _resumeId: resumeId });
      setAutoSavedAt(Date.now());
    }, 1500);
    return () => clearTimeout(t);
  }, [resume, resumeId]);

  const setField = (field, value) => setResume((p) => ({ ...p, [field]: value }));

  /* ── สร้างจากโปรไฟล์ → เรียก POST /api/resume/generate ── */
  const handleGenerate = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("กรุณา login ก่อน", "error");
      return;
    }

    setGenerating(true);
    try {
      const res  = await fetch(`${API_URL}/generate`, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt: "นักศึกษาคอม ทำ React Node อยากเป็น Full Stack Developer",
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "generate ไม่สำเร็จ");

      // clear any saved draft so it won't override freshly generated resume
      try { clearDraft(); } catch (e) { /* ignore */ }

      setResume({
        fullName:     json.fullName     || "",
        jobTitle:     json.jobTitle     || "",
        summary:      json.summary      || "",
        skills:       json.skills       || [],
        education:    withIds(json.education   || []),
        experience:   withIds(json.experience  || []),
        languages:    withIds(json.languages   || []),
        profileImage: json.profileImage || "",
      });
      setResumeId(null);
      showToast("สร้าง Resume สำเร็จ", "success");

    } catch (err) {
      console.error("สร้าง resume ไม่สำเร็จ:", err);
      showToast("ไม่สามารถสร้าง Resume ได้", "error");
    } finally {
      setGenerating(false);
    }
  };

  /* ── บันทึก / อัปเดต Resume → API ── */
  const handleSave = async () => {
    if (!resume.fullName.trim()) {
      showToast("กรุณากรอกชื่อ-นามสกุลก่อนบันทึก", "error");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      showToast("กรุณา login ก่อน", "error");
      return;
    }

    setSaving(true);
    try {
      const body = {
        fullName:     resume.fullName,
        jobTitle:     resume.jobTitle,
        summary:      resume.summary,
        skills:       resume.skills,
        education:    resume.education,
        experience:   resume.experience,
        languages:    resume.languages,
        profileImage: resume.profileImage,
        template,
      };

      const headers = {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${token}`,
      };

      let res;

      if (resumeId) {
        // ── มี id แล้ว → PUT (update) ──
        res = await fetch(`${API_URL}/${resumeId}`, {
          method:  "PUT",
          headers,
          body:    JSON.stringify(body),
        });
      } else {
        // ── ยังไม่มี id → POST (create) ──
        res = await fetch(API_URL, {
          method:  "POST",
          headers,
          body:    JSON.stringify(body),
        });
      }

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "บันทึกไม่สำเร็จ");

      // POST จะได้ id ใหม่, PUT จะมี id เดิมอยู่แล้ว
      if (!resumeId) {
        const newId = json.data?.id || json.data?._id || json.id;
        if (newId) setResumeId(newId);
      }

      clearDraft();
      showToast(resumeId ? "อัปเดต Resume เรียบร้อยแล้ว ✓" : "บันทึก Resume เรียบร้อยแล้ว ✓", "success");

    } catch (err) {
      console.error("บันทึก resume ไม่สำเร็จ:", err);
      showToast("บันทึกไม่สำเร็จ: " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  /* ── ปรับ Summary ── */
  const handleRewrite = async () => {
    setRewriting(true);
    try {
      await new Promise((r) => setTimeout(r, 900));
      setField("summary", rewriteSummary(resume.summary));
      showToast("ปรับ Summary เรียบร้อยแล้ว", "success");
    } catch (err) {
      console.error("ปรับ summary ไม่สำเร็จ:", err);
      showToast("ปรับ Summary ไม่สำเร็จ", "error");
    } finally {
      setRewriting(false);
    }
  };

  /* ── Export PDF ── */
  const handleExportPDF = async () => {
    const el = document.getElementById("resume-preview-root");
    if (!el) { showToast("กรอกข้อมูลก่อนแล้วค่อย Export", "error"); return; }
    setExporting(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const images   = el.querySelectorAll("img");
      await Promise.all([...images].map((img) =>
        img.complete ? Promise.resolve() : new Promise((res) => { img.onload = res; img.onerror = res; })
      ));
      await html2pdf().set({
        margin:      0,
        filename:    `${resume.fullName || "resume"}.pdf`,
        image:       { type: "jpeg", quality: 0.97 },
        html2canvas: { scale: 2, useCORS: true, allowTaint: true, letterRendering: true, scrollX: 0, scrollY: 0 },
        jsPDF:       { unit: "mm", format: "a4", orientation: "portrait" },
      }).from(el).save();
      showToast("Export PDF สำเร็จ", "success");
    } catch (err) {
      console.error("Export PDF ไม่สำเร็จ:", err);
      showToast("Export ไม่สำเร็จ: " + err.message, "error");
    } finally {
      setExporting(false);
    }
  };

  /* ── อัปโหลดรูปภาพ ── */
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setField("profileImage", ev.target.result);
    reader.readAsDataURL(file);
  };

  const keepDraft    = () => setDraftBanner(false);
  const discardDraft = () => { clearDraft(); setResume(EMPTY_RESUME); setResumeId(null); setDraftBanner(false); };

  /* ════════════════════════════ RENDER ════════════════════════════ */
  return (
    <>
      <Toast toast={toast} />

      <div className={`re-page${isDark ? " re-dark" : ""}`}>

        {/* แบนเนอร์ Draft */}
        {draftBanner && (
          <div className="re-draft-banner">
            <span>โหลด Draft ล่าสุดจาก Local Storage แล้ว</span>
            <div className="re-draft-banner__actions">
              <button className="re-btn re-btn-ghost re-btn-sm" onClick={keepDraft}>เก็บ Draft</button>
              <button className="re-btn re-btn-danger re-btn-sm" onClick={discardDraft}>ยกเลิก</button>
            </div>
          </div>
        )}

        {/* ════════ แผงซ้าย (ฟอร์ม) ════════ */}
        <div className="re-form-panel">
          <div className="re-form-header">
            <div className="re-form-header__info">
              <h1>Resume Editor</h1>
              {autoSavedAt ? (
                <div className="re-form-header__sub re-form-header__sub--saved">
                  <span className="re-autosave-dot" />
                  บันทึกอัตโนมัติแล้ว
                  {resumeId && <span style={{ marginLeft: 6, opacity: .6 }}>(#ID: {resumeId})</span>}
                </div>
              ) : (
                <div className="re-form-header__sub">Live preview ทางด้านขวา</div>
              )}
            </div>
            <div className="re-form-header__actions">
              <button
                className="re-btn re-btn-ghost"
                style={{ padding: "7px 10px", fontSize: ".85rem" }}
                onClick={() => setIsDark((d) => !d)}
                title={isDark ? "โหมดสว่าง" : "โหมดมืด"}
              >
                {isDark ? "☀︎" : "☽"}
              </button>
              <button className="re-btn re-btn-ghost" onClick={handleGenerate} disabled={generating}>
                {generating ? <><Spinner dark={!isDark} />กำลังสร้าง…</> : "สร้างจากโปรไฟล์"}
              </button>
              <button className="re-btn re-btn-primary" onClick={handleSave} disabled={saving}>
                {saving
                  ? <><Spinner />กำลังบันทึก…</>
                  : resumeId ? "อัปเดต" : "บันทึก"}
              </button>
            </div>
          </div>

          <div className="re-form-body">
            <FeedbackPanel resume={resume} />
            <CompletionPanel resume={resume} />
            <JobRoleSelector
              jobRole={jobRole}
              onRoleChange={setJobRole}
              skills={resume.skills}
              onSkillsChange={(v) => setField("skills", v)}
            />

            {/* รูปโปรไฟล์ */}
            <div className="re-card">
              <SLabel>รูปโปรไฟล์</SLabel>
              <div className="re-avatar-wrap">
                <div className="re-avatar" onClick={() => fileRef.current?.click()}>
                  {resume.profileImage
                    ? <img src={resume.profileImage} alt="โปรไฟล์" />
                    : <span style={{ fontSize: "1.8rem", opacity: .35 }}>👤</span>}
                </div>
                <div className="re-avatar-meta">
                  <p>รูปภาพโปรไฟล์</p>
                  <span>JPG, PNG หรือ WebP · ไม่เกิน 5 MB</span>
                  <div className="re-avatar-actions">
                    <button className="re-btn re-btn-ghost re-btn-sm" onClick={() => fileRef.current?.click()}>อัปโหลด</button>
                    {resume.profileImage && (
                      <button className="re-btn re-btn-danger re-btn-sm" onClick={() => setField("profileImage", "")}>ลบ</button>
                    )}
                  </div>
                </div>
              </div>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={handleImageChange} />
            </div>

            {/* ข้อมูลส่วนตัว */}
            <div className="re-card">
              <SLabel>ข้อมูลส่วนตัว</SLabel>
              <div className="re-input-grid">
                <div className="re-input-full">
                  <label className="re-field-label">ชื่อ-นามสกุล</label>
                  <input className="re-input" placeholder="สมชาย ใจดี" value={resume.fullName} onChange={(e) => setField("fullName", e.target.value)} />
                </div>
                <div className="re-input-full">
                  <label className="re-field-label">ตำแหน่งงาน</label>
                  <input className="re-input" placeholder="Senior Frontend Developer" value={resume.jobTitle} onChange={(e) => setField("jobTitle", e.target.value)} />
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="re-card">
              <div className="re-card__header">
                <SLabel>สรุปตัวเอง (Summary)</SLabel>
                <button className="re-btn re-btn-ai" onClick={handleRewrite} disabled={rewriting}>
                  {rewriting ? <><Spinner dark={!isDark} />กำลังปรับ…</> : "ปรับให้เป็นมืออาชีพ"}
                </button>
              </div>
              <textarea
                className="re-input re-textarea"
                rows={4}
                placeholder="เขียนสรุปเกี่ยวกับตัวคุณ ประสบการณ์ และเป้าหมายในอาชีพ…"
                value={resume.summary}
                onChange={(e) => setField("summary", e.target.value)}
              />
              <div className="re-char-count">{resume.summary.length} ตัวอักษร</div>
            </div>

            <SkillsSection    skills={resume.skills}       onChange={(v) => setField("skills",    v)} />
            <LanguagesSection languages={resume.languages} onChange={(v) => setField("languages", v)} />
            <EducationSection education={resume.education} onChange={(v) => setField("education", v)} />
            <ExperienceSection experience={resume.experience} onChange={(v) => setField("experience", v)} />
            <div style={{ height: 12 }} />
          </div>
        </div>

        {/* ════════ แผงขวา (Preview) ════════ */}
        <div className="re-preview-panel">
          <div className="re-preview-topbar">
            <div className="re-topbar-left">
              <div className="re-traffic-lights">
                <span className="re-dot re-dot--red" />
                <span className="re-dot re-dot--amber" />
                <span className="re-dot re-dot--green" />
              </div>
              <span className="re-preview-filename">
                {resume.fullName
                  ? `${resume.fullName.toLowerCase().replace(/\s+/g, "_")}.pdf`
                  : "resume_preview.pdf"}
              </span>
            </div>
            <div className="re-topbar-right">
              <div className="re-tmpl-switcher">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    className={`re-tmpl-btn${template === t.id ? " re-tmpl-btn--active" : ""}`}
                    onClick={() => setTemplate(t.id)}
                    title={t.desc}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <button className="re-btn re-btn-export" onClick={handleExportPDF} disabled={exporting}>
                {exporting ? <><Spinner />กำลัง Export…</> : "Export PDF"}
              </button>
            </div>
          </div>

          <div className="re-preview-scroll">
            <ResumePreview resume={resume} template={template} isDark={isDark} />
          </div>
        </div>

      </div>
    </>
  );
}