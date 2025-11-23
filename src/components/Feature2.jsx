
import React, { useEffect, useRef, useState } from "react";
import "./Feature2.css";
import html2canvas from "html2canvas";
import { useNavigate } from "react-router-dom";

// presets / personality
const personalityTags = [
  "Creative Thinker 💡",
  "Analytical Developer 🧠",
  "Empathetic Designer 💖",
  "Innovative Strategist 🚀",
  "Visionary Creator 🌈",
  "Detail-Oriented Architect 🧩",
  "Dynamic Problem Solver ⚡",
];

const TEMPLATES = {
  Business: {
    name: "Business Profile",
    role: "Business Manager",
    color: "#1f6feb",
    accent: "#0f4f9a",
    tag: "Strategic Leader 💼",
    skills: [{ name: "Leadership", level: 85 }, { name: "Strategy", level: 80 }],
  },
  Developer: {
    name: "Dev Profile",
    role: "Frontend Developer",
    color: "#8E6CFF",
    accent: "#5B2EE6",
    tag: "Analytical Developer 🧠",
    skills: [{ name: "JavaScript", level: 88 }, { name: "React", level: 82 }],
  },
  Student: {
    name: "Study Profile",
    role: "Computer Science Student",
    color: "#2DD4BF",
    accent: "#0f766e",
    tag: "Curious Learner 📘",
    skills: [{ name: "Algorithms", level: 72 }, { name: "Data Structures", level: 70 }],
  },
  Creator: {
    name: "Creator Profile",
    role: "Product Designer",
    color: "#FF7AB6",
    accent: "#b43b85",
    tag: "Empathetic Designer 💖",
    skills: [{ name: "UI/UX", level: 86 }, { name: "Prototyping", level: 78 }],
  },
  Gamer: {
    name: "Gamer Profile",
    role: "Streamer / Pro Gamer",
    color: "#FFB86B",
    accent: "#b36b14",
    tag: "Competitive Gamer 🎮",
    skills: [{ name: "Tactics", level: 90 }, { name: "Reflex", level: 88 }],
  },
};

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function randomTag() {
  return personalityTags[Math.floor(Math.random() * personalityTags.length)];
}

const safeParse = (s) => {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
};

export default function Feature2() {
  const navigate = useNavigate();

  // state
  const [profiles, setProfiles] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    role: "",
    color: "#8E6CFF",
    accent: "#2D1062",
    avatarType: "letter",
    avatarIcon: "👨‍💻",
  });
  const [newSkill, setNewSkill] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState(70);
  const [step, setStep] = useState(1); // step UI
  const previewRef = useRef(null);
  const tiltRef = useRef(null);

  // load
  useEffect(() => {
    const saved = safeParse(localStorage.getItem("profiles"));
    if (saved && Array.isArray(saved)) {
      setProfiles(saved);
      if (saved.length > 0) setActiveId(saved[0].id);
    }
  }, []);

  // persist
  useEffect(() => {
    localStorage.setItem("profiles", JSON.stringify(profiles));
  }, [profiles]);

  const handleChange = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const applyTemplate = (tplKey) => {
    const t = TEMPLATES[tplKey];
    if (!t) return;
    setForm((s) => ({
      ...s,
      name: t.name,
      role: t.role,
      color: t.color,
      accent: t.accent,
      avatarType: "icon",
      avatarIcon: "⭐",
    }));
  };

  const createProfile = (e) => {
    e && e.preventDefault();
    if (!form.name.trim()) return alert("กรุณากรอกชื่อโปรไฟล์ก่อน");
    const p = {
      ...form,
      id: uid(),
      skills: form._skills ? [...form._skills] : [],
      tag: randomTag(),
      createdAt: new Date().toISOString(),
    };
    setProfiles((s) => [p, ...s]);
    setActiveId(p.id);
    setForm((s) => ({ ...s, name: "", role: "", _skills: [] }));
    setStep(1);
  };

  const removeProfile = (id) => {
    if (!window.confirm("ต้องการลบโปรไฟล์นี้จริงหรือไม่?")) return;
    setProfiles((s) => s.filter((x) => x.id !== id));
    if (activeId === id) setActiveId(null);
  };

  const duplicateProfile = (id) => {
    const src = profiles.find((p) => p.id === id);
    if (!src) return;
    const copy = { ...src, id: uid(), name: src.name + " (copy)", createdAt: new Date().toISOString() };
    setProfiles((s) => [copy, ...s]);
    setActiveId(copy.id);
  };

  const activeProfile = profiles.find((p) => p.id === activeId);

  // add skill (works for active profile)
  const addSkill = () => {
    if (!newSkill.trim()) return;
    const updated = profiles.map((p) =>
      p.id === activeId ? { ...p, skills: [...(p.skills || []), { name: newSkill, level: Number(newSkillLevel) }] } : p
    );
    setProfiles(updated);
    setNewSkill("");
    setNewSkillLevel(70);
  };

  const removeSkill = (skillName) => {
    const updated = profiles.map((p) =>
      p.id === activeId ? { ...p, skills: (p.skills || []).filter((s) => s.name !== skillName) } : p
    );
    setProfiles(updated);
  };

  // export card image
  const exportCard = async () => {
    const card = previewRef.current;
    if (!card || !activeProfile) return;
    const canvas = await html2canvas(card, { scale: 2 });
    const link = document.createElement("a");
    link.download = `${(activeProfile.name || "profile").replace(/\s+/g, "_")}-profile.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  // avatar quick presets
  const AVATARS = ["👨‍💻", "🎨", "🎮", "📚", "💼", "🤖", "🌟"];

  const pickAvatar = (icon) => setForm((s) => ({ ...s, avatarType: "icon", avatarIcon: icon }));

  // random avatar / colors
  const randomizeColors = () => {
    const hues = ["#8E6CFF", "#2DD4BF", "#FF7AB6", "#FFB86B", "#6CEBFF", "#8B5CF6"];
    const c = hues[Math.floor(Math.random() * hues.length)];
    setForm((s) => ({ ...s, color: c, accent: shadeColor(c, -20) }));
  };

  function shadeColor(hex, percent) {
    try {
      const num = parseInt(hex.replace("#", ""), 16);
      const r = (num >> 16) + percent;
      const g = ((num >> 8) & 0x00ff) + percent;
      const b = (num & 0x0000ff) + percent;
      return (
        "#" +
        (0x1000000 + (clamp(r, 0, 255) << 16) + (clamp(g, 0, 255) << 8) + clamp(b, 0, 255))
          .toString(16)
          .slice(1)
      );
    } catch {
      return hex;
    }
  }

  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }

  // tilt 3D effect
  useEffect(() => {
    const el = tiltRef.current;
    if (!el) return;
    const handleMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rx = (y - 0.5) * 8; // rotateX
      const ry = (x - 0.5) * -14; // rotateY
      el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.01)`;
    };
    const handleLeave = () => {
      el.style.transform = "";
    };
    el.addEventListener("mousemove", handleMove);
    el.addEventListener("mouseleave", handleLeave);
    return () => {
      el.removeEventListener("mousemove", handleMove);
      el.removeEventListener("mouseleave", handleLeave);
    };
  }, [activeProfile]);

  // AI suggestion: simple heuristics
  const suggestionFor = (p) => {
    if (!p) return "เลือกโปรไฟล์เพื่อแสดงคำแนะนำ";
    const countSkills = (p.skills || []).length;
    if (countSkills === 0) return "แนะนำ: เพิ่ม 3 สกิลหลัก เช่น JavaScript, React, AWS เพื่อความน่าเชื่อถือ";
    const avg = Math.round(((p.skills || []).reduce((a, b) => a + (b.level || 0), 0) / Math.max(1, countSkills)));
    if (avg > 80) return "โปรไฟล์ดูแข็งแกร่ง — ลองเพิ่มโครงการตัวอย่างสั้น ๆ เพื่อแสดงผลลัพธ์";
    if (avg > 60) return "ระดับสกิลใช้ได้ — ให้เพิ่มรายละเอียดบทบาทและผลงาน";
    return "ระดับสกิลต่ำ — แนะนำฝึก/คอร์ส และอัปเดตสกิลที่เกี่ยวข้อง";
  };

  // small ripple for buttons (delegated)
  useEffect(() => {
    const selector = ".btn-primary, .btn-create, .profile-card-pro, .action-pro button, .template-pill";
    const onDown = (e) => {
      const t = e.currentTarget;
      const rect = t.getBoundingClientRect();
      const r = document.createElement("span");
      r.className = "ripple";
      const size = Math.max(rect.width, rect.height) * 0.18;
      r.style.width = r.style.height = `${size}px`;
      r.style.left = `${e.clientX - rect.left - size / 2}px`;
      r.style.top = `${e.clientY - rect.top - size / 2}px`;
      t.style.position = t.style.position || "relative";
      t.appendChild(r);
      requestAnimationFrame(() => r.classList.add("play"));
      r.addEventListener("animationend", () => r.remove(), { once: true });
    };
    const nodes = Array.from(document.querySelectorAll(selector));
    nodes.forEach((n) => n.addEventListener("pointerdown", onDown));
    const obs = new MutationObserver(() => {
      const updated = Array.from(document.querySelectorAll(selector));
      updated.forEach((n) => {
        if (!n._rippleBound) {
          n.addEventListener("pointerdown", onDown);
          n._rippleBound = true;
        }
      });
    });
    obs.observe(document.body, { childList: true, subtree: true });
    return () => {
      nodes.forEach((n) => n.removeEventListener("pointerdown", onDown));
      obs.disconnect();
    };
  }, []);

  // edit profile: load into form
  const editProfile = (p) => {
    if (!p) return;
    setForm({
      name: p.name,
      role: p.role,
      color: p.color,
      accent: p.accent,
      avatarType: p.avatarType || "letter",
      avatarIcon: p.avatarIcon || (p.name ? p.name.charAt(0) : "👤"),
      _skills: p.skills ? [...p.skills] : [],
    });
    setStep(1);
  };

  // save edit to active profile
  const saveEditToProfile = () => {
    if (!activeId) return alert("เลือกโปรไฟล์ที่ต้องการแก้ไขก่อน");
    setProfiles((s) => s.map((p) => (p.id === activeId ? { ...p, ...form, skills: form._skills || p.skills } : p)));
    setForm((f) => ({ ...f, name: "", role: "", _skills: [] }));
  };

  return (
    <div>
      {/* Particles */}
      <div className="particles" aria-hidden>
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
              animationDuration: 18 + Math.random() * 22 + "s",
              animationDelay: -Math.random() * 20 + "s",
              background: `rgba( ${50 + Math.random() * 120}, ${30 + Math.random() * 120}, ${120 + Math.random() * 100}, ${0.08 + Math.random() * 0.25})`,
            }}
          />
        ))}
      </div>

      <div className="multi-pro-wrapper upgraded">
        <div className="header-glass">
          <div className="header-inner">
            <div className="header-left">
              <h1 className="project-title">Smart Persona</h1>
              <p className="subtitle">Multi-Profile Creator — สร้างตัวตนหลายแบบในบัญชีเดียวอย่างมือโปร</p>
            </div>
            <div className="header-cta">
              <div className="template-pills">
                {Object.keys(TEMPLATES).map((k) => (
                  <button key={k} className="template-pill" onClick={() => applyTemplate(k)}>{k}</button>
                ))}
              </div>

              <button
                className="btn-primary"
                style={{ marginLeft: "12px", padding: "10px 16px" }}
                onClick={() => navigate("/feature3")}
              >
                ไปหน้าเลือกโปรไฟล์ →
              </button>
            </div>
          </div>
        </div>

        <div className="mp-grid-pro">
          {/* LEFT: Steps + Form + List */}
          <aside className="panel-pro left-panel">
            <div className="stepper">
              <div className={`step ${step >= 1 ? "active" : ""}`} onClick={() => setStep(1)}>1. ข้อมูลหลัก</div>
              <div className={`step ${step >= 2 ? "active" : ""}`} onClick={() => setStep(2)}>2. สี & Avatar</div>
              <div className={`step ${step >= 3 ? "active" : ""}`} onClick={() => setStep(3)}>3. เพิ่มสกิล</div>
              <div className={`step ${step >= 4 ? "active" : ""}`} onClick={() => setStep(4)}>4. สรุป & สร้าง</div>
            </div>

            <form className="pro-form" onSubmit={createProfile}>
              {step === 1 && (
                <>
                  <label className="label">ชื่อโปรไฟล์</label>
                  <input placeholder="ชื่อโปรไฟล์ (เช่น Work, Study)" value={form.name} onChange={(e) => handleChange("name", e.target.value)} />
                  <label className="label">คำอธิบาย / บทบาท</label>
                  <input placeholder="คำอธิบาย เช่น Frontend Developer" value={form.role} onChange={(e) => handleChange("role", e.target.value)} />
                </>
              )}

              {step === 2 && (
                <>
                  <div className="color-pick">
                    <div>
                      <label className="label">สีหลัก</label>
                      <input type="color" value={form.color} onChange={(e) => handleChange("color", e.target.value)} />
                    </div>
                    <div>
                      <label className="label">สี Accent</label>
                      <input type="color" value={form.accent} onChange={(e) => handleChange("accent", e.target.value)} />
                    </div>
                  </div>

                  <div className="avatar-presets">
                    <label className="label">Avatar</label>
                    <div className="avatars-grid">
                      <button type="button" className={`avatar-preset ${form.avatarType === "letter" ? "active" : ""}`}
                        onClick={() => handleChange("avatarType", "letter")}>{form.name?.charAt(0) || "A"}</button>
                      {AVATARS.map((a) => (
                        <button key={a} type="button" className={`avatar-preset ${form.avatarIcon === a ? "active" : ""}`} onClick={() => pickAvatar(a)}>{a}</button>
                      ))}
                      <button type="button" className="avatar-random" onClick={randomizeColors}>🎲 Randomize</button>
                    </div>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <label className="label">เพิ่มสกิล</label>
                  <div className="skill-add">
                    <input placeholder="เพิ่มสกิล เช่น React" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} />
                    <input type="range" min="20" max="100" value={newSkillLevel} onChange={(e) => setNewSkillLevel(e.target.value)} />
                    <button type="button" className="btn-create" onClick={() => {
                      if (activeId) {
                        const updated = profiles.map((p) =>
                          p.id === activeId ? { ...p, skills: [...(p.skills || []), { name: newSkill, level: Number(newSkillLevel) }] } : p
                        );
                        setProfiles(updated);
                      } else {
                        const tempSkills = form._skills ? [...form._skills] : [];
                        tempSkills.push({ name: newSkill, level: Number(newSkillLevel) });
                        setForm((f) => ({ ...f, _skills: tempSkills }));
                      }
                      setNewSkill("");
                      setNewSkillLevel(70);
                    }}>➕</button>
                  </div>
                  {(form._skills || []).length > 0 && (
                    <div className="temp-skills">
                      {(form._skills || []).map((s, idx) => (
                        <div key={idx} className="temp-skill">{s.name} <span>{s.level}%</span></div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {step === 4 && (
                <>
                  <div className="summary">
                    <h4>สรุป</h4>
                    <div className="summary-row"><strong>ชื่อ:</strong> {form.name || "—"}</div>
                    <div className="summary-row"><strong>บทบาท:</strong> {form.role || "—"}</div>
                    <div className="summary-row"><strong>สี:</strong> <span className="color-swatch" style={{ background: form.color }} /></div>
                    <div className="summary-row"><strong>avatar:</strong> {form.avatarType === "icon" ? form.avatarIcon : (form.name?.charAt(0) || "A")}</div>
                    <div style={{ marginTop: 12 }}>
                      <button type="submit" className="btn-create">➕ สร้างโปรไฟล์</button>
                      {activeId && <button type="button" className="btn-secondary" onClick={saveEditToProfile} style={{ marginLeft: 10 }}>💾 บันทึกการแก้ไข</button>}
                    </div>
                  </div>
                </>
              )}

              <div className="form-nav">
                {step > 1 && <button type="button" className="btn-secondary" onClick={() => setStep((s) => s - 1)}>◀ ย้อน</button>}
                {step < 4 && <button type="button" className="btn-primary arrow" onClick={() => setStep((s) => s + 1)}>ถัดไป</button>}
              </div>
            </form>

            <div className="list-section">
              <h4>โปรไฟล์ทั้งหมด ({profiles.length})</h4>
              <div className="profile-list-pro">
                {profiles.map((p) => (
                  <div
                    key={p.id}
                    className={`profile-card-pro ${p.id === activeId ? "active" : ""}`}
                    style={{ borderColor: p.accent }}
                    onClick={() => setActiveId(p.id)}
                  >
                    <div className="avatar-pro" style={{ background: p.color, borderColor: p.accent }}>{p.avatarIcon || p.name?.charAt(0)?.toUpperCase()}</div>
                    <div className="meta-pro">
                      <strong>{p.name}</strong>
                      <small>{p.role}</small>
                      <div className="profile-tag">{p.tag}</div>
                    </div>
                    <div className="action-pro">
                      <button onClick={(e) => { e.stopPropagation(); duplicateProfile(p.id); }} title="Duplicate">⧉</button>
                      <button className="del" onClick={(e) => { e.stopPropagation(); removeProfile(p.id); }} title="Delete">✕</button>
                      <button onClick={(e) => { e.stopPropagation(); editProfile(p); }} title="Edit">✎</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* RIGHT: Preview + Suggestion */}
          <section className="panel-pro preview">
            <h3>Preview — โปรไฟล์ปัจจุบัน</h3>

            {activeProfile && (
              <div className="stats-pill">
                <span>Profiles: {profiles.length}</span>
                <span>Skills: {(activeProfile.skills || []).length}</span>
                <span>Avg: {calcAvg(activeProfile)}</span>
              </div>
            )}

            {activeProfile ? (
              <div className="preview-area">
                <div
                  className="preview-card"
                  ref={(el) => { previewRef.current = el; tiltRef.current = el; }}
                  style={{
                    borderColor: activeProfile.accent,
                    "--ambient-color": hexToRgba(activeProfile.color, 0.22),
                    boxShadow: `0 18px 60px ${hexToRgba(activeProfile.color, 0.15)}`,
                    background: `linear-gradient(135deg, ${hexToRgba(activeProfile.color, 0.07)}, rgba(255,255,255,0.03))`,
                  }}
                >
                  <div className="preview-avatar" style={{ background: activeProfile.color, borderColor: activeProfile.accent }}>
                    {activeProfile.avatarIcon || activeProfile.name?.charAt(0)}
                  </div>
                  <h2 style={{ color: activeProfile.accent }}>{activeProfile.name}</h2>
                  <p className="role-text">{activeProfile.role}</p>

                  <div className="tag-pro">{activeProfile.tag}</div>

                  <div className="skills-section">
                    <h4>Skills</h4>
                    {(activeProfile.skills || []).length === 0 && <p className="no-skill">ยังไม่มีสกิล</p>}
                    {activeProfile.skills?.map((s, i) => (
                      <div key={i} className="skill-bar">
                        <span className="skill-name">{s.name}</span>
                        <div className="bar-track">
                          <div className="bar-fill" style={{ width: `${s.level}%`, background: activeProfile.color }} />
                        </div>
                        <button className="action-remove" onClick={() => removeSkill(s.name)} title="Remove">✕</button>
                      </div>
                    ))}
                  </div>

                  <div className="preview-buttons">
                    <button className="btn-primary" onClick={exportCard}>📸 บันทึกเป็นรูปภาพ</button>
                    <button className="btn-secondary" onClick={() => {
                      setForm({ ...activeProfile, _skills: activeProfile.skills || [] });
                      setStep(1);
                    }}>✏️ แก้ไขโปรไฟล์</button>
                  </div>
                </div>

                <aside className="side-info">
                  <div className="ai-suggestion">
                    <h4>💡 Smart Suggestion</h4>
                    <p>{suggestionFor(activeProfile)}</p>
                  </div>

                  <div className="stats-card">
                    <h4>Profile Stats</h4>
                    <div className="stat-row"><span>Skills</span><strong>{(activeProfile.skills || []).length}</strong></div>
                    <div className="stat-row"><span>Avg Skill</span><strong>{calcAvg(activeProfile)}</strong></div>
                    <div className="stat-row"><span>Created</span><strong>{new Date(activeProfile.createdAt).toLocaleDateString()}</strong></div>
                  </div>
                </aside>
              </div>
            ) : (
              <div className="preview-card placeholder">
                <div className="placeholder-illustration">🗂️</div>
                <h3>ยังไม่ได้เลือกโปรไฟล์</h3>
                <p>เลือกโปรไฟล์จากรายการด้านซ้าย หรือกดสร้างโปรไฟล์ใหม่ได้เลย</p>
                <div className="placeholder-actions">
                  <button className="btn-primary" onClick={() => setStep(4)}>สร้างโปรไฟล์ใหม่</button>
                </div>
              </div>
            )}
          </section>
        </div>

        <footer className="fp-footer">
          <div>Smart Persona © {new Date().getFullYear()}</div>
          <div>Designed to manage multiple professional identities</div>
        </footer>
      </div>
    </div>
  );
}

/* helpers */
function hexToRgba(hex = "#000000", alpha = 0.1) {
  try {
    const r = parseInt(hex.substr(1, 2), 16);
    const g = parseInt(hex.substr(3, 2), 16);
    const b = parseInt(hex.substr(5, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  } catch {
    return `rgba(0,0,0,${alpha})`;
  }
}

function calcAvg(p) {
  if (!p || !p.skills || p.skills.length === 0) return "—";
  const avg = Math.round(p.skills.reduce((a, b) => a + (b.level || 0), 0) / p.skills.length);
  return `${avg}%`;
}
