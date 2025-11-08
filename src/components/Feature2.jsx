import React, { useState, useEffect } from "react";
import "./Feature2.css";
import html2canvas from "html2canvas";

// สุ่ม personality tag
const personalityTags = [
  "Creative Thinker 💡",
  "Analytical Developer 🧠",
  "Empathetic Designer 💖",
  "Innovative Strategist 🚀",
  "Visionary Creator 🌈",
  "Detail-Oriented Architect 🧩",
  "Dynamic Problem Solver ⚡",
];

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export default function Feature2() {
  const [profiles, setProfiles] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [form, setForm] = useState({ name: "", role: "", color: "#8E6CFF", accent: "#2D1062" });
  const [newSkill, setNewSkill] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState(70);

  // โหลดข้อมูลจาก LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem("profiles");
    if (saved) {
      const parsed = JSON.parse(saved);
      setProfiles(parsed);
      if (parsed.length > 0) setActiveId(parsed[0].id);
    }
  }, []);

  // บันทึกข้อมูลอัตโนมัติ
  useEffect(() => {
    localStorage.setItem("profiles", JSON.stringify(profiles));
  }, [profiles]);

  const handleChange = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const createProfile = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return alert("กรุณากรอกชื่อโปรไฟล์ก่อน");
    const tag = personalityTags[Math.floor(Math.random() * personalityTags.length)];
    const newP = { ...form, id: uid(), skills: [], tag };
    setProfiles((p) => [newP, ...p]);
    setActiveId(newP.id);
    setForm((s) => ({ ...s, name: "", role: "" }));
  };

  const removeProfile = (id) => {
    if (!window.confirm("ต้องการลบโปรไฟล์นี้จริงหรือไม่?")) return;
    setProfiles((p) => p.filter((x) => x.id !== id));
    if (activeId === id) setActiveId(null);
  };

  const duplicateProfile = (id) => {
    const src = profiles.find((p) => p.id === id);
    if (!src) return;
    const copy = { ...src, id: uid(), name: src.name + " (copy)" };
    setProfiles((p) => [copy, ...p]);
    setActiveId(copy.id);
  };

  const activeProfile = profiles.find((x) => x.id === activeId);

  // เพิ่ม / ลบ skill
  const addSkill = () => {
    if (!newSkill.trim()) return;
    const updated = profiles.map((p) =>
      p.id === activeId
        ? { ...p, skills: [...(p.skills || []), { name: newSkill, level: newSkillLevel }] }
        : p
    );
    setProfiles(updated);
    setNewSkill("");
    setNewSkillLevel(70);
  };

  const removeSkill = (skillName) => {
    const updated = profiles.map((p) =>
      p.id === activeId
        ? { ...p, skills: p.skills.filter((s) => s.name !== skillName) }
        : p
    );
    setProfiles(updated);
  };

  // export card เป็นรูป
  const exportCard = async () => {
    const card = document.querySelector(".preview-card");
    const canvas = await html2canvas(card, { scale: 2 });
    const link = document.createElement("a");
    link.download = `${activeProfile.name}-profile.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="multi-pro-wrapper">
      {/* Header */}
      <div className="header-glass">
       <center><h1 className="project-title">Smart Persona | Multi-Profile Creator</h1></center>
        <p className="subtitle">
          สร้างโปรไฟล์หลายแบบในบัญชีเดียว — อัตลักษณ์เหนือระดับมืออาชีพ
        </p>
      </div>

      {/* Layout */}
      <div className="mp-grid-pro">
        {/* LEFT */}
        <div className="panel-pro">
          <h3>สร้างโปรไฟล์ใหม่</h3>
          <form onSubmit={createProfile} className="pro-form">
            <input
              placeholder="ชื่อโปรไฟล์ (เช่น Work, Study)"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
            <input
              placeholder="คำอธิบาย เช่น Frontend Developer"
              value={form.role}
              onChange={(e) => handleChange("role", e.target.value)}
            />
            <div className="color-pick">
              <label>สีหลัก</label>
              <input type="color" value={form.color} onChange={(e) => handleChange("color", e.target.value)} />
              <label>สี Accent</label>
              <input type="color" value={form.accent} onChange={(e) => handleChange("accent", e.target.value)} />
            </div>
            <button type="submit" className="btn-create">➕ สร้างโปรไฟล์</button>
          </form>

          <div className="list-section">
            <h4>โปรไฟล์ทั้งหมด ({profiles.length})</h4>
            <div className="profile-list-pro">
              {profiles.map((p) => (
                <div
                  key={p.id}
                  className={`profile-card-pro ${p.id === activeId ? "active" : ""}`}
                  style={{
                    borderColor: p.accent,
                    boxShadow: p.id === activeId ? `0 0 15px ${p.color}55` : "0 3px 10px rgba(0,0,0,0.08)",
                  }}
                  onClick={() => setActiveId(p.id)}
                >
                  <div className="avatar-pro" style={{ background: p.color, borderColor: p.accent }}>
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="meta-pro">
                    <strong>{p.name}</strong>
                    <small>{p.role}</small>
                  </div>
                  <div className="action-pro">
                    <button onClick={(e) => { e.stopPropagation(); duplicateProfile(p.id); }}>⧉</button>
                    <button className="del" onClick={(e) => { e.stopPropagation(); removeProfile(p.id); }}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="panel-pro preview">
          <h3>Preview — โปรไฟล์ปัจจุบัน</h3>
          {activeProfile ? (
            <div
              className="preview-card"
              style={{
                borderColor: activeProfile.accent,
                boxShadow: `0 10px 40px ${activeProfile.color}55`,
                background: `linear-gradient(135deg, ${activeProfile.color}15, #fff8ff)`,
              }}
            >
              <div className="preview-avatar" style={{ background: activeProfile.color, borderColor: activeProfile.accent }}>
                {activeProfile.name.charAt(0)}
              </div>
              <h2 style={{ color: activeProfile.accent }}>{activeProfile.name}</h2>
              <p>{activeProfile.role}</p>

              <div className="tag-pro">{activeProfile.tag}</div>

              {/* Skill Section */}
              <div className="skills-section">
                <h4>Skills</h4>
                {(activeProfile.skills || []).length === 0 && <p className="no-skill">ยังไม่มีสกิล</p>}
                {activeProfile.skills?.map((s, i) => (
                  <div key={i} className="skill-bar">
                    <span>{s.name}</span>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{ width: `${s.level}%`, background: activeProfile.color }}
                      />
                    </div>
                    <button onClick={() => removeSkill(s.name)}>✕</button>
                  </div>
                ))}
                <div className="skill-add">
                  <input
                    placeholder="เพิ่มสกิล เช่น React"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                  />
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={newSkillLevel}
                    onChange={(e) => setNewSkillLevel(e.target.value)}
                  />
                  <button onClick={addSkill}>➕</button>
                </div>
              </div>

              <div className="preview-buttons">
                <button className="btn-primary" onClick={exportCard}>📸 บันทึกเป็นรูปภาพ</button>
                <button className="btn-secondary" onClick={() => setForm(activeProfile)}>✏️ แก้ไขโปรไฟล์</button>
              </div>
            </div>
          ) : (
            <div className="empty-pro">ยังไม่ได้เลือกโปรไฟล์</div>
          )}
        </div>
      </div>
    </div>
  );
}
