import React, { useEffect, useState } from "react";
import "./Feature3.css";

const VIEW_MODES = [
  {
    id: "my",
    title: "My View",
    subtitle: "จัดการ แก้ไข ปรับแต่ง — มุมมองเจ้าของ",
    accent: "#8E6CFF",
  },
  {
    id: "public",
    title: "Public View",
    subtitle: "มุมมองสาธารณะ — Portfolio / Showcase",
    accent: "#4A90E2",
  },
  {
    id: "dev",
    title: "Developer View",
    subtitle: "Data / JSON / Schema — ข้อมูลดิบสำหรับนักพัฒนา",
    accent: "#00B894",
  },
  {
    id: "recruiter",
    title: "Recruiter View",
    subtitle: "มุมมอง HR — โฟกัสที่สกิลและความเข้ากันกับงาน",
    accent: "#FF7AA2",
  },
];

// ตัวอย่างข้อมูล preview (ถ้าไม่มีใน localStorage)
const SAMPLE_PROFILE = {
  id: "sample1",
  name: "Jirayut Suksa",
  role: "Frontend Developer",
  color: "#6C63FF",
  accent: "#2D1062",
  tag: "Creative Thinker 💡",
  skills: [
    { name: "React", level: 85 },
    { name: "HTML/CSS", level: 95 },
    { name: "UI/UX", level: 78 },
  ],
  bio: "ออกแบบ interface ที่ใช้งานง่ายและสวยงาม — ชอบแก้ปัญหาด้วยดีไซน์",
};

export default function Feature3() {
  const [selected, setSelected] = useState(() => {
    return localStorage.getItem("viewMode") || "my";
  });

  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("profiles");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) return parsed[0];
      }
    } catch {}
    return SAMPLE_PROFILE;
  });

  // เมื่อเปลี่ยนมุมมอง -> บันทึก และ dispatch event ให้ฟีเจอร์อื่น (ถ้ามี) ฟัง
  useEffect(() => {
    localStorage.setItem("viewMode", selected);
    window.dispatchEvent(new CustomEvent("viewModeChanged", { detail: selected }));
  }, [selected]);

  // ฟังก์ชันช่วย render preview ตาม mode
  const renderPreview = () => {
    if (!profile) return <div className="f3-empty">ไม่มีข้อมูลโปรไฟล์สำหรับ preview</div>;

    if (selected === "my") {
      return (
        <div className="preview-card f3-my">
          <div className="pc-head">
            <div className="pc-avatar" style={{ background: profile.color, borderColor: profile.accent }}>
              {profile.name?.charAt(0)}
            </div>
            <div className="pc-meta">
              <div className="pc-name">{profile.name}</div>
              <div className="pc-role">{profile.role}</div>
              <div className="pc-tag">{profile.tag}</div>
            </div>
          </div>

          <div className="pc-bio">{profile.bio}</div>

          <div className="pc-actions">
            <button className="pc-btn edit">✏️ แก้ไข</button>
            <button className="pc-btn theme">🎨 ปรับธีม</button>
            <button className="pc-btn export">📤 แชร์</button>
          </div>
        </div>
      );
    }

    if (selected === "public") {
      return (
        <div className="preview-card f3-public">
          <div className="pc-avatar-lg" style={{ background: profile.color, borderColor: profile.accent }}>
            {profile.name?.charAt(0)}
          </div>
          <h3 className="pc-name" style={{ color: profile.accent }}>{profile.name}</h3>
          <p className="pc-role">{profile.role}</p>
          <p className="pc-bio-short">{profile.bio}</p>

          <div className="pc-skills">
            {(profile.skills || []).slice(0, 4).map((s) => (
              <span key={s.name} className="pc-skill" title={`${s.level}%`}>
                {s.name}
              </span>
            ))}
          </div>

          <div className="pc-cta">
            <button className="pc-btn view">🔗 ดูโปรไฟล์สาธารณะ</button>
          </div>
        </div>
      );
    }

    if (selected === "dev") {
      return (
        <div className="preview-card f3-dev">
          <h4>Raw JSON</h4>
          <pre className="pc-json">{JSON.stringify(profile, null, 2)}</pre>
          <div className="pc-cta">
            <button
              className="pc-btn copy-json"
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(profile, null, 2));
                alert("คัดลอก JSON แล้ว");
              }}
            >
              📋 Copy JSON
            </button>
          </div>
        </div>
      );
    }

    if (selected === "recruiter") {
      const topSkills = (profile.skills || []).slice().sort((a, b) => b.level - a.level).slice(0, 4);
      return (
        <div className="preview-card f3-recruiter">
          <div className="pc-head-small">
            <div className="pc-avatar" style={{ background: profile.color, borderColor: profile.accent }}>
              {profile.name?.charAt(0)}
            </div>
            <div>
              <div className="pc-name">{profile.name}</div>
              <div className="pc-role">{profile.role}</div>
            </div>
          </div>

          <div className="pc-stats">
            <div className="stat">
              <div className="stat-num">{(profile.skills || []).length}</div>
              <div className="stat-label">Skills</div>
            </div>
            <div className="stat">
              <div className="stat-num">★ {(profile.skills || []).reduce((s, x) => s + x.level, 0) / Math.max((profile.skills || []).length, 1) | 0}</div>
              <div className="stat-label">Avg Skill</div>
            </div>
            <div className="stat">
              <div className="stat-num">{profile.tag?.split(" ")[0]}</div>
              <div className="stat-label">Tag</div>
            </div>
          </div>

          <div className="pc-topskills">
            <h5>Top Skills</h5>
            <div className="top-list">
              {topSkills.map((s) => (
                <div key={s.name} className="top-skill">
                  <div className="ts-name">{s.name}</div>
                  <div className="ts-bar"><div className="ts-fill" style={{ width: `${s.level}%`, background: profile.color }} /></div>
                </div>
              ))}
            </div>
          </div>
          <div className="pc-cta">
            <button className="pc-btn contact">✉️ ติดต่อ</button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="f3-root">
      <div className="f3-header">
        <h2 className="f3-title">Choose view mode</h2>
        <p className="f3-sub">เปลี่ยนมุมมองเพื่อดูข้อมูลในรูปแบบที่ต่างกัน — ระบบจะจดจำการเลือกของคุณ</p>
      </div>

      <div className="f3-body">
        <div className="f3-cards">
          {VIEW_MODES.map((m) => (
            <button
              key={m.id}
              className={`f3-card ${selected === m.id ? "selected" : ""}`}
              style={selected === m.id ? { boxShadow: `0 10px 30px ${m.accent}33`, borderColor: m.accent } : {}}
              onClick={() => setSelected(m.id)}
              title={m.subtitle}
            >
              <div className="f3-card-left" style={{ background: m.accent + "22" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={m.accent} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" opacity="0.12" />
                  <path d="M12 8v4l2 2" />
                </svg>
              </div>
              <div className="f3-card-body">
                <div className="f3-card-title">{m.title}</div>
                <div className="f3-card-sub">{m.subtitle}</div>
              </div>
              <div className="f3-card-right">
                <div className="f3-indicator" style={{ background: m.accent }} />
              </div>
            </button>
          ))}
        </div>

        <div className="f3-preview">
          {renderPreview()}
        </div>
      </div>

      <div className="f3-footer">
        <button
          className="f3-btn"
          onClick={() => {
            const nextIndex = (VIEW_MODES.findIndex((v) => v.id === selected) + 1) % VIEW_MODES.length;
            setSelected(VIEW_MODES[nextIndex].id);
          }}
        >
          🔁 เปลี่ยนมุมมองถัดไป
        </button>
        <button
          className="f3-btn subtle"
          onClick={() => {
            localStorage.removeItem("viewMode");
            setSelected("my");
            alert("รีเซ็ตมุมมองเป็นค่าเริ่มต้น (My View)");
          }}
        >
          ♻️ รีเซ็ตมุมมอง
        </button>
      </div>
    </div>
  );
}
