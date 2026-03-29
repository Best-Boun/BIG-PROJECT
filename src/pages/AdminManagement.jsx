import React, { useEffect, useMemo, useState } from "react";
import "./Access.css";

const API_BASE = "http://localhost:3000/api";
const MAIN_ADMIN_ID = 1;

const getToken = () => localStorage.getItem("token");

const showPopup = (text, type = "info") => {
  const el = document.createElement("div");
  el.className = `popup ${type}`;
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => el.classList.add("fade"), 10);
  setTimeout(() => el.remove(), 2500);
};

function Avatar({ name, image }) {
  if (image) {
    return (
      <img
        src={image.startsWith("http") ? image : `${API_BASE.replace("/api", "")}/${image}`}
        alt={name}
        className="am-avatar-img"
        onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
      />
    );
  }
  const initials = (name || "?").charAt(0).toUpperCase();
  return <div className="am-avatar-fallback">{initials}</div>;
}

function AdminManagement() {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  // Modal
  const [modalType, setModalType] = useState(null); // "ban" | "unban" | "delete" | "profile"
  const [modalUser, setModalUser] = useState(null);

  // Profile modal state
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Dark mode
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("darkMode") === "true";
    setIsDark(saved);
    if (saved) document.body.classList.add("dark");
  }, []);

  const toggleDarkMode = () => {
    const next = !isDark;
    setIsDark(next);
    document.body.classList.toggle("dark", next);
    localStorage.setItem("darkMode", next);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setAllUsers(Array.isArray(data) ? data : []);
    } catch {
      showPopup("โหลดข้อมูลผู้ใช้ไม่สำเร็จ", "error");
    } finally {
      setLoading(false);
    }
  };

  const patchUser = async (id, fields) => {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(fields),
    });
    if (!res.ok) throw new Error("Update failed");
  };

  // ---- BAN / UNBAN ----
  const handleToggleBan = async (user) => {
    const willBan = !user.isBanned;
    try {
      await patchUser(user.id, { isBanned: willBan });
      setAllUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isBanned: willBan ? 1 : 0 } : u))
      );
      showPopup(willBan ? `🚫 แบน ${user.username} แล้ว` : `✅ ปลดแบน ${user.username} แล้ว`, "success");
    } catch {
      showPopup("❌ ดำเนินการไม่สำเร็จ", "error");
    }
    closeModal();
  };

  // ---- DELETE ----
  const handleDelete = async (user) => {
    if (user.id === MAIN_ADMIN_ID) {
      showPopup("❌ Admin หลักลบไม่ได้", "error");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/users/${user.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error();
      setAllUsers((prev) => prev.filter((u) => u.id !== user.id));
      showPopup("🗑️ ลบผู้ใช้สำเร็จ", "success");
    } catch {
      showPopup("❌ ลบผู้ใช้ไม่สำเร็จ", "error");
    }
    closeModal();
  };

  // ---- VIEW PROFILE ----
  const openProfile = async (user) => {
    setModalUser(user);
    setModalType("profile");
    setProfileData(null);
    setProfileLoading(true);
    try {
      const res = await fetch(`${API_BASE}/profiles?userId=${user.id}`);
      const data = await res.json();
      setProfileData(Array.isArray(data) && data.length > 0 ? data[0] : null);
    } catch {
      setProfileData(null);
    } finally {
      setProfileLoading(false);
    }
  };

  const closeModal = () => {
    setModalType(null);
    setModalUser(null);
    setProfileData(null);
  };

  const usersFiltered = useMemo(() => {
    let list = [...allUsers];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) =>
          u.username?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q)
      );
    }
    if (roleFilter !== "all") list = list.filter((u) => u.role === roleFilter);
    if (statusFilter === "active") list = list.filter((u) => !u.isBanned);
    if (statusFilter === "banned") list = list.filter((u) => u.isBanned);
    return list;
  }, [allUsers, search, roleFilter, statusFilter]);

  const totalBanned = allUsers.filter((u) => u.isBanned).length;
  const totalAdmins = allUsers.filter((u) => u.role === "admin").length;

  return (
    <div className="page-container admin-page">
      {/* ===== HEADER ===== */}
      <div className="am-header">
        <h2>👥 User Management</h2>
        <div className="am-controls">
          <div className="am-controls-inner">
            <div className="dark-toggle-wrapper" onClick={toggleDarkMode}>
              <div className={`dark-toggle-switch ${isDark ? "on" : ""}`}>
                <div className="dark-toggle-ball">{isDark ? "🌙" : "🌞"}</div>
              </div>
              <span className="dark-toggle-text">Dark Mode</span>
            </div>

            <div className="am-filter-row">
              <div className="am-search-wrapper">
                <span className="search-icon">🔍</span>
                <input
                  className="am-search-input"
                  placeholder="Search username or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="am-select">
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="banned">Banned</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ===== STATS ===== */}
      <div className="am-overview">
        <div className="am-stat">
          <div className="am-stat-number">{allUsers.length}</div>
          <div className="am-stat-label">Total Users</div>
        </div>
        <div className="am-stat">
          <div className="am-stat-number">{totalAdmins}</div>
          <div className="am-stat-label">Admins</div>
        </div>
        <div className="am-stat">
          <div className="am-stat-number">{allUsers.length - totalAdmins}</div>
          <div className="am-stat-label">Users</div>
        </div>
        <div className="am-stat">
          <div className="am-stat-number am-stat-banned">{totalBanned}</div>
          <div className="am-stat-label">Banned</div>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      {loading ? (
        <div className="am-loading">
          <div className="am-spinner" />
          <p>กำลังโหลดข้อมูล...</p>
        </div>
      ) : usersFiltered.length === 0 ? (
        <div className="am-empty">ไม่พบผู้ใช้ที่ตรงกับเงื่อนไข</div>
      ) : (
        <div className="admin-grid">
          {usersFiltered.map((u) => (
            <div
              className={`user-card ${u.role === "admin" ? "admin-card" : "user-card-box"} ${u.isBanned ? "banned-card" : ""}`}
              key={u.id}
            >
              {/* Avatar + Info */}
              <div className="am-card-top">
                <div className="am-avatar-wrap">
                  <Avatar name={u.username} image={u.profileImage} />
                  <div className="am-avatar-fallback" style={{ display: "none" }}>
                    {(u.username || "?").charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="user-info">
                  <div className="am-badges">
                    <span className={`role-label ${u.role}`}>
                      {u.role === "admin" ? "👑 ADMIN" : "👤 USER"}
                    </span>
                    <span className={`user-status ${u.isBanned ? "banned" : "active"}`}>
                      {u.isBanned ? "🚫 Banned" : "✅ Active"}
                    </span>
                  </div>
                  <h4 className="user-name">{u.username}</h4>
                  <p className="am-user-email">{u.email}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="user-actions">
                <button
                  className="btn action-btn view"
                  onClick={() => openProfile(u)}
                >
                  🪪 ดูโปรไฟล์
                </button>

                {u.isBanned ? (
                  <button
                    className="btn action-btn unban"
                    onClick={() => { setModalUser(u); setModalType("unban"); }}
                  >
                    ✅ ปลดแบน
                  </button>
                ) : (
                  <button
                    className="btn action-btn ban"
                    disabled={u.id === MAIN_ADMIN_ID}
                    onClick={() => { setModalUser(u); setModalType("ban"); }}
                  >
                    🚫 แบน
                  </button>
                )}

                {u.role !== "admin" && (
                  <button
                    className="btn action-btn delete"
                    onClick={() => { setModalUser(u); setModalType("delete"); }}
                  >
                    🗑 ลบ
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== MODALS ===== */}
      {modalType && modalUser && (
        <div className="am-modal-backdrop" onClick={closeModal}>
          <div className={`am-modal-card ${modalType === "profile" ? "am-wide" : ""}`} onClick={(e) => e.stopPropagation()}>

            {/* ---- PROFILE MODAL ---- */}
            {modalType === "profile" && (
              <div style={{ width: "100%" }}>
                <div className="am-modal-header">
                  <h3>🪪 โปรไฟล์ของ {modalUser.username}</h3>
                  <button className="am-modal-close" onClick={closeModal}>✕</button>
                </div>
                <div className="am-modal-body am-profile-body">
                  {profileLoading ? (
                    <div className="am-loading"><div className="am-spinner" /><p>กำลังโหลดโปรไฟล์...</p></div>
                  ) : !profileData ? (
                    <div className="am-profile-empty">
                      <span className="am-profile-empty-icon">📭</span>
                      <p>ผู้ใช้นี้ยังไม่มีโปรไฟล์</p>
                    </div>
                  ) : (
                    <div className="am-profile-view">
                      {profileData.profileImage && (
                        <div className="am-profile-avatar-wrap">
                          <img
                            src={profileData.profileImage.startsWith("http") ? profileData.profileImage : `http://localhost:3000/${profileData.profileImage}`}
                            alt="avatar"
                            className="am-profile-avatar"
                          />
                        </div>
                      )}
                      <div className="am-profile-grid">
                        <ProfileRow label="ชื่อ" value={profileData.name} />
                        <ProfileRow label="ตำแหน่ง" value={profileData.title} />
                        <ProfileRow label="อีเมล" value={profileData.email || modalUser.email} />
                        <ProfileRow label="เบอร์โทร" value={profileData.phone} />
                        <ProfileRow label="ที่อยู่" value={profileData.location} />
                        <ProfileRow label="เว็บไซต์" value={profileData.website} />
                        <ProfileRow label="เพศ" value={profileData.gender} />
                        <ProfileRow label="สัญชาติ" value={profileData.nationality} />
                        <ProfileRow label="วันเกิด" value={profileData.dateOfBirth} />
                        <ProfileRow label="เงินเดือน" value={profileData.salaryRange} />
                        <ProfileRow label="พร้อมทำงาน" value={profileData.openToWork ? "✅ ใช่" : "❌ ไม่"} />
                        <ProfileRow label="สถานะ" value={profileData.availability} />
                      </div>

                      {profileData.bio && (
                        <div className="am-profile-section">
                          <h4>📝 Bio</h4>
                          <p>{profileData.bio}</p>
                        </div>
                      )}

                      {profileData.skills?.length > 0 && (
                        <div className="am-profile-section">
                          <h4>🛠 Skills</h4>
                          <div className="am-skill-tags">
                            {profileData.skills.map((s, i) => (
                              <span key={i} className="am-skill-tag">{s}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {profileData.experience?.length > 0 && (
                        <div className="am-profile-section">
                          <h4>💼 Experience</h4>
                          {profileData.experience.map((e, i) => (
                            <div key={i} className="am-profile-item">
                              <b>{e.role}</b> @ {e.company}
                              <span className="am-item-date">{e.startDate} – {e.endDate || "ปัจจุบัน"}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {profileData.education?.length > 0 && (
                        <div className="am-profile-section">
                          <h4>🎓 Education</h4>
                          {profileData.education.map((e, i) => (
                            <div key={i} className="am-profile-item">
                              <b>{e.degree}</b> – {e.institution}
                              <span className="am-item-date">{e.startDate} – {e.endDate || "ปัจจุบัน"}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {profileData.certifications?.length > 0 && (
                        <div className="am-profile-section">
                          <h4>📜 Certifications</h4>
                          {profileData.certifications.map((c, i) => (
                            <div key={i} className="am-profile-item">
                              <b>{c.name}</b> – {c.issuer}
                            </div>
                          ))}
                        </div>
                      )}

                      {profileData.projects?.length > 0 && (
                        <div className="am-profile-section">
                          <h4>🚀 Projects</h4>
                          {profileData.projects.map((p, i) => (
                            <div key={i} className="am-profile-item">
                              {p.description}
                              {p.url && <a href={p.url} target="_blank" rel="noreferrer" className="am-project-link"> 🔗 ดูโปรเจค</a>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="am-modal-actions">
                  <button className="am-btn-cancel" onClick={closeModal}>ปิด</button>
                </div>
              </div>
            )}

            {/* ---- BAN MODAL ---- */}
            {modalType === "ban" && (
              <>
                <div className="am-modal-header">
                  <h3>🚫 แบนผู้ใช้</h3>
                  <button className="am-modal-close" onClick={closeModal}>✕</button>
                </div>
                <div className="am-modal-body">
                  <p className="am-confirm-text">
                    ต้องการแบน <b>{modalUser.username}</b>?<br />
                    <small>ผู้ใช้จะไม่สามารถเข้าสู่ระบบได้จนกว่าจะปลดแบน</small>
                  </p>
                </div>
                <div className="am-modal-actions">
                  <button className="am-btn-cancel" onClick={closeModal}>ยกเลิก</button>
                  <button className="am-btn-confirm am-btn-ban" onClick={() => handleToggleBan(modalUser)}>
                    🚫 แบน
                  </button>
                </div>
              </>
            )}

            {/* ---- UNBAN MODAL ---- */}
            {modalType === "unban" && (
              <>
                <div className="am-modal-header">
                  <h3>✅ ปลดแบนผู้ใช้</h3>
                  <button className="am-modal-close" onClick={closeModal}>✕</button>
                </div>
                <div className="am-modal-body">
                  <p className="am-confirm-text">
                    ต้องการปลดแบน <b>{modalUser.username}</b>?
                  </p>
                </div>
                <div className="am-modal-actions">
                  <button className="am-btn-cancel" onClick={closeModal}>ยกเลิก</button>
                  <button className="am-btn-confirm" onClick={() => handleToggleBan(modalUser)}>
                    ✅ ปลดแบน
                  </button>
                </div>
              </>
            )}

            {/* ---- DELETE MODAL ---- */}
            {modalType === "delete" && (
              <>
                <div className="am-modal-header">
                  <h3>🗑 ลบผู้ใช้</h3>
                  <button className="am-modal-close" onClick={closeModal}>✕</button>
                </div>
                <div className="am-modal-body">
                  <p className="am-confirm-text">
                    ต้องการลบบัญชี <b>{modalUser.username}</b> อย่างถาวรใช่ไหม?<br />
                    <small style={{ color: "#e23232" }}>ไม่สามารถกู้คืนได้</small>
                  </p>
                </div>
                <div className="am-modal-actions">
                  <button className="am-btn-cancel" onClick={closeModal}>ยกเลิก</button>
                  <button className="am-btn-confirm delete" onClick={() => handleDelete(modalUser)}>
                    🗑 ลบ
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

function ProfileRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="am-profile-row">
      <span className="am-profile-label">{label}</span>
      <span className="am-profile-value">{value}</span>
    </div>
  );
}

export default AdminManagement;
