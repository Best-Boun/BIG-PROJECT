import React, { useEffect, useMemo, useState } from "react";
import "./Feature3.css";

export default function Feature3() {
  const [profiles, setProfiles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState("hr"); // hr | ats | detailed
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [themePreview, setThemePreview] = useState(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("profiles")) || [];
      setProfiles(saved);
      if (saved.length) setSelected(saved[0]);
    } catch (e) {
      setProfiles([]);
    }
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = profiles.slice();
    if (q) {
      list = list.filter((p) => {
        return (
          p.name.toLowerCase().includes(q) ||
          (p.role || "").toLowerCase().includes(q) ||
          (p.tag || "").toLowerCase().includes(q) ||
          (p.skills || []).some((s) => s.name.toLowerCase().includes(q))
        );
      });
    }
    if (sortBy === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    else list.sort((a, b) => (a.role || "").localeCompare(b.role || ""));
    return list;
  }, [profiles, query, sortBy]);

  useEffect(() => {
    if (filtered.length && !filtered.find((x) => x.id === (selected && selected.id))) {
      setSelected(filtered[0]);
    }
  }, [filtered]);

  const computeAtsScore = (p) => {
    if (!p || !p.skills) return 0;
    const unique = new Set(p.skills.map((s) => s.name.toLowerCase()));
    return Math.min(100, unique.size * 15 + Math.round((p.experienceYears || 0) * 3));
  };

  if (!profiles || profiles.length === 0) {
    return (
      <div className="f3-empty-root">
        <div className="empty-card">
          <h3>ยังไม่มีโปรไฟล์ที่สร้างในฟีเจอร์ 2</h3>
          <p>กดปุ่มด้านล่างเพื่อสร้างตัวอย่างและดู UI ใหม่</p>
          <div className="empty-actions">
            <button
              className="btn primary"
              onClick={() => {
                const sample = [
                  {
                    id: "p1",
                    name: "Wichai",
                    role: "Frontend Engineer",
                    tag: "Creative Thinker",
                    color: "linear-gradient(135deg,#7a5cff,#00c6ff)",
                    accent: "#7a5cff",
                    avatarIcon: "W",
                    experienceYears: 4,
                    skills: [
                      { name: "React", level: 92 },
                      { name: "TypeScript", level: 80 },
                      { name: "CSS", level: 76 },
                      { name: "Accessibility", level: 64 },
                    ],
                  },
                  {
                    id: "p2",
                    name: "Nok",
                    role: "UI/UX Designer",
                    tag: "User-first",
                    color: "linear-gradient(135deg,#ff6ec7,#7a5cff)",
                    accent: "#ff6ec7",
                    avatarIcon: "N",
                    experienceYears: 6,
                    skills: [
                      { name: "Figma", level: 88 },
                      { name: "Prototyping", level: 81 },
                    ],
                  },
                ];
                localStorage.setItem("profiles", JSON.stringify(sample));
                setProfiles(sample);
                setSelected(sample[0]);
              }}
            >
              สร้างตัวอย่าง
            </button>

            <button
              className="btn"
              onClick={() => {
                alert("ไปที่ฟีเจอร์ 2 เพื่อสร้างโปรไฟล์จริง ๆ นะ");
              }}
            >
              ไปฟีเจอร์ 2
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-root">
      <aside className="sidebar2">
        <div className="sb-top">
          <h3>เลือกโปรไฟล์</h3>
          <div className="sb-controls">
            <input
              className="sb-search"
              placeholder="ค้นหา ชื่อ / ตำแหน่ง / สกิล"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select className="sb-sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="name">เรียง: ชื่อ</option>
              <option value="role">เรียง: ตำแหน่ง</option>
            </select>
          </div>
        </div>

        <div className="sb-list" role="list">
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => { setSelected(p); setThemePreview(null); }}
              className={`sb-item ${selected?.id === p.id ? "active" : ""}`}
              role="listitem"
            >
              <div className="sb-left">
                <div className="sb-avatar" style={{ background: p.color, boxShadow: selected?.id === p.id ? `0 8px 30px ${p.accent}33` : undefined }}>
                  {p.avatarIcon || p.name.charAt(0)}
                </div>
                <div className="sb-meta">
                  <div className="sb-name">{p.name}</div>
                  <div className="sb-role">{p.role}</div>
                </div>
              </div>

              <div className="sb-right">
                <div className="sb-mini">{(p.skills || []).slice(0,2).map(s=>s.name).join(", ")}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="sb-footer">
          <div className="swatches">
            <button className={`sw ${themePreview===null? 'on':''}`} onClick={()=>setThemePreview(null)} title="โปรไฟล์">
              P
            </button>
            <button className={`sw ${themePreview==='g1' ? 'on':''}`} style={{background:'linear-gradient(135deg,#7a5cff,#00c6ff)'}} onClick={()=>setThemePreview('g1')}></button>
            <button className={`sw ${themePreview==='g2' ? 'on':''}`} style={{background:'linear-gradient(135deg,#ff6ec7,#7a5cff)'}} onClick={()=>setThemePreview('g2')}></button>
          </div>
        </div>
      </aside>

      <main className="center">
        <div className="center-top">
          <div className="ct-left">
            <div className="quick-avatar" style={{ background: selected.color, boxShadow:`0 12px 40px ${selected.accent}33` }}>{selected.avatarIcon || selected.name.charAt(0)}</div>
            <div className="quick-meta">
              <div className="quick-name">{selected.name}</div>
              <div className="quick-sub">{selected.role} • {selected.experienceYears || 0} yrs</div>
            </div>
          </div>

          <div className="ct-right">
            <div className="mode-switch">
              <button className={`ms ${mode==='hr'?'active':''}`} onClick={()=>setMode('hr')}>👁 HR</button>
              <button className={`ms ${mode==='ats'?'active':''}`} onClick={()=>setMode('ats')}>⚙️ ATS</button>
              <button className={`ms ${mode==='detailed'?'active':''}`} onClick={()=>setMode('detailed')}>🔍 Detailed</button>
            </div>
          </div>
        </div>

        <section className="card2" aria-live="polite">
          <div className={`card-bg ${themePreview==='g1' ? 'g1' : themePreview==='g2' ? 'g2' : ''}`} />
          <div className="card-body">
            {/* HR */}
            {mode==='hr' && (
              <div className="view-hr">
                <div className="hr-head">
                  <div className="hr-left">
                    <div className="avatar-large" style={{ background: selected.color, boxShadow:`0 12px 40px ${selected.accent}33` }}>{selected.name.charAt(0)}</div>
                    <div>
                      <h2 className="name-main">{selected.name}</h2>
                      <div className="role-main">{selected.role}</div>
                      <div className="tag-pill">{selected.tag}</div>
                    </div>
                  </div>

                  <div className="hr-right">
                    <div className="summary">
                      <div className="sum-item"><div className="sum-num">{selected.experienceYears||0}y</div><div className="sum-label">Exp</div></div>
                      <div className="sum-item"><div className="sum-num">{(selected.skills||[]).length}</div><div className="sum-label">Skills
              <div className="dt-empty" style={{color:'rgba(255,255,255,0.55)', marginTop:'8px'}}>ยังไม่มีสกิลที่เพิ่มในโปรไฟล์นี้ — ไปเพิ่มในฟีเจอร์ 2 ก่อนนะ</div></div></div>
                      <div className="sum-item"><div className="sum-num">{computeAtsScore(selected)}</div><div className="sum-label">Score</div></div>
                    </div>
                  </div>
                </div>

                <div className="skills-compact">
                  {(selected.skills||[]).slice(0,5).map((s,i)=> (
                    <div className="skill-pill" key={i}>
                      <div className="pill-left">{s.name}</div>
                      <div className="pill-right"><div className="pill-bar"><div style={{width:`${s.level}%`, background:selected.accent}}/></div></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ATS */}
            {mode==='ats' && (
              <div className="view-ats">
                <div className="ats-left">
                  <div className="circle-score">
                    <div className="score-num">{computeAtsScore(selected)}</div>
                  </div>
                </div>
                <div className="ats-right">
                  <h4>Keywords</h4>
                  <div className="kw-grid">
                    {(selected.skills||[]).map((s,i)=> <span className="kw-pill" key={i}>{s.name}</span>)}
                  </div>
                </div>
              </div>
            )}

            {/* DETAILED */}
            {mode==='detailed' && (
              <div className="view-dt">
                <h4>Skills — Detailed</h4>
                <div className="dt-list">
                  {(selected.skills||[]).map((s,i)=> (
                    <div className="dt-row" key={i}>
                      <div className="dt-name">{s.name}</div>
                      <div className="dt-bar"><div style={{width:`${s.level}%`, background:selected.accent}}/></div>
                      <div className="dt-val">{s.level}%</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <aside className="panel">
        <div className="panel-inner">
          <h4>Preview Mode</h4>
          <div className="panel-modes">
            <button className={`pm ${mode==='hr'?'on':''}`} onClick={()=>setMode('hr')}>👁 HR Glance</button>
            <button className={`pm ${mode==='ats'?'on':''}`} onClick={()=>setMode('ats')}>⚙️ ATS Scan</button>
            <button className={`pm ${mode==='detailed'?'on':''}`} onClick={()=>setMode('detailed')}>🔍 Detailed</button>
          </div>

          <div className="panel-actions">
            <button className="btn" onClick={()=>{ navigator.clipboard?.writeText(JSON.stringify(selected,null,2)); alert('คัดลอกโปรไฟล์ไปยังคลิปบอร์ดแล้ว') }}>Export JSON</button>
            <button className="btn danger" onClick={()=>{ if(!selected) return; if(!confirm(`ลบโปรไฟล์ ${selected.name}?`)) return; const remaining = profiles.filter(p=>p.id!==selected.id); setProfiles(remaining); localStorage.setItem('profiles', JSON.stringify(remaining)); setSelected(remaining[0]||null); }}>Delete</button>
          </div>

          <div className="panel-theme">
            <small>Theme</small>
            <div className="theme-row">
              <div className="tm sw-large" style={{background:selected.color}} onClick={()=>setThemePreview(null)} />
              <div className="tm sw-large" style={{background:'linear-gradient(135deg,#7a5cff,#00c6ff)'}} onClick={()=>setThemePreview('g1')} />
              <div className="tm sw-large" style={{background:'linear-gradient(135deg,#ff6ec7,#7a5cff)'}} onClick={()=>setThemePreview('g2')} />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
