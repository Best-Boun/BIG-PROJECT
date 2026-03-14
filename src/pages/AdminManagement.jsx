import React, { useEffect, useMemo, useState } from "react";
import "./Access.css";


const API_USERS = "http://localhost:3001/users";
const API_LOGS = "http://localhost:3003/logs";
const MAIN_ADMIN_ID = "1";

const addLocalLog = (entry) => {
  const prev = JSON.parse(localStorage.getItem("localLogs") || "[]");
  prev.unshift(entry);
  localStorage.setItem("localLogs", JSON.stringify(prev));
};

const showPopup = (text, type = "info") => {
  const el = document.createElement("div");
  el.className = `popup ${type}`;
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => el.classList.add("fade"), 10);
  setTimeout(() => el.remove(), 2000);
};

function AdminManagement() {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [modalType, setModalType] = useState(null);
  const [modalUser, setModalUser] = useState(null);

  // ---------------------------
  // ⭐ Toggle Dark Mode
  // ---------------------------
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("darkMode") === "true";
    setIsDark(saved);

    if (saved) document.body.classList.add("dark");
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDark;
    setIsDark(newMode);

    if (newMode) document.body.classList.add("dark");
    else document.body.classList.remove("dark");

    localStorage.setItem("darkMode", newMode);
  };

  // ---------------------------

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(API_USERS);
      const data = await res.json();
      setAllUsers(Array.isArray(data) ? data : []);
    } catch {
      showPopup("โหลดข้อมูลผู้ใช้ไม่สำเร็จ", "error");
    } finally {
      setLoading(false);
    }
  };

  const saveUser = async (user) => {
    try {
      const res = await fetch(`${API_USERS}/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      if (!res.ok) throw new Error();

      setAllUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, ...user } : u))
      );
    } catch {
      showPopup("❌ บันทึกไม่สำเร็จ", "error");
    }
  };

  const createLog = async ({ action, target, detail, actor = "admin" }) => {
    const entry = {
      id: crypto.randomUUID(),
      action,
      actor,
      target,
      detail,
      time: new Date().toISOString(),
    };

    addLocalLog(entry);

    try {
      await fetch(API_LOGS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });
    } catch {
      // fail silently
    }
  };

  const confirmReset = async (id) => {
    const user = allUsers.find((u) => u.id === id);
    if (!user) return;

    if (user.oldPassword) {
      await saveUser({
        ...user,
        password: user.oldPassword,
        oldPassword: null,
      });

      createLog({
        action: "restore_password",
        target: user.username,
        detail: "คืนรหัสผ่านเดิม",
      });

      showPopup("🔄 คืนรหัสผ่านเดิมแล้ว");
      setModalType(null);
      return;
    }

    await saveUser({
      ...user,
      oldPassword: user.password,
      password: "1234",
    });

    createLog({
      action: "reset_password",
      target: user.username,
      detail: "ตั้งเป็น 1234",
    });

    showPopup("🔐 รีเซ็ตรหัสผ่านแล้ว");
    setModalType(null);
  };

  const confirmRole = async (id) => {
    const user = allUsers.find((u) => u.id === id);
    if (!user) return;

    if (id === MAIN_ADMIN_ID)
      return showPopup("❌ Admin หลักเปลี่ยน role ไม่ได้", "error");

    const updated = {
      ...user,
      role: user.role === "admin" ? "user" : "admin",
    };

    await saveUser(updated);

    createLog({
      action: "change_role",
      target: user.username,
      detail: `เป็น ${updated.role}`,
    });

    showPopup("🎫 เปลี่ยน Role สำเร็จ");
    setModalType(null);
  };

  const deleteUser = async (id) => {
    const user = allUsers.find((u) => u.id === id);
    if (!user) return;

    if (id === MAIN_ADMIN_ID)
      return showPopup("❌ Admin หลักลบไม่ได้", "error");

    try {
      await fetch(`${API_USERS}/${id}`, { method: "DELETE" });

      setAllUsers((prev) => prev.filter((u) => u.id !== id));

      createLog({
        action: "delete_user",
        target: user.username,
        detail: "ลบบัญชีผู้ใช้",
      });

      showPopup("🗑️ ลบผู้ใช้สำเร็จ", "success");
      setModalType(null);
    } catch {
      showPopup("❌ ลบผู้ใช้ไม่สำเร็จ", "error");
    }
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

    if (roleFilter === "admin") list = list.filter((u) => u.role === "admin");
    if (roleFilter === "user") list = list.filter((u) => u.role === "user");

    return list;
  }, [allUsers, search, roleFilter]);

  return (
    <div className="page-container admin-page">
      <div className="am-header">
        <h2>⚙️ Admin Management</h2>

        <div className="am-controls">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 10,
            }}
          >
            {/* ---- DARK MODE TOGGLE ---- */}
            <div className="dark-toggle-wrapper" onClick={toggleDarkMode}>
              <div className={`dark-toggle-switch ${isDark ? "on" : ""}`}>
                <div className="dark-toggle-ball">{isDark ? "🌙" : "🌞"}</div>
              </div>
              <span className="dark-toggle-text">Dark Mode</span>
            </div>

            {/* SEARCH */}
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div className="am-search-wrapper">
                <span className="search-icon">🔍</span>
                <input
                  className="am-search-input"
                  placeholder="Search username or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="am-select"
              >
                <option value="all">All</option>
                <option value="admin">Admins</option>
                <option value="user">Users</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <p>กำลังโหลด...</p>
      ) : (
        <>
          {/* overview */}
          <div className="am-overview">
            <div className="am-stat">
              <div className="am-stat-number">{allUsers.length}</div>
              <div className="am-stat-label">Total Users</div>
            </div>
            <div className="am-stat">
              <div className="am-stat-number">
                {allUsers.filter((u) => u.role === "admin").length}
              </div>
              <div className="am-stat-label">Admins</div>
            </div>
            <div className="am-stat">
              <div className="am-stat-number">
                {allUsers.filter((u) => u.role === "user").length}
              </div>
              <div className="am-stat-label">Users</div>
            </div>
          </div>

          {/* ADMIN LIST */}
          {usersFiltered.filter((u) => u.role === "admin").length > 0 && (
            <>
              <h3 className="section-title">👑 Admin</h3>
              <div className="admin-grid">
                {usersFiltered
                  .filter((u) => u.role === "admin")
                  .map((u) => (
                    <div className="user-card admin-card" key={u.id}>
                      <div className="user-info">
                        <div className={`role-label ${u.role}`}>ADMIN</div>
                        <h4 className="user-name">{u.username}</h4>
                      </div>

                      {/* ACTION BUTTONS */}
                      <div className="user-actions">
                        <button
                          className="btn action-btn view"
                          onClick={() => (
                            setModalType("view"), setModalUser(u)
                          )}
                        >
                          👁 View
                        </button>

                        <button
                          className="btn action-btn reset"
                          onClick={() => (
                            setModalType("reset"), setModalUser(u)
                          )}
                        >
                          🔐 Reset Password
                        </button>

                        <button
                          className="btn action-btn role"
                          disabled={u.id === MAIN_ADMIN_ID}
                          onClick={() => (
                            setModalType("role"), setModalUser(u)
                          )}
                        >
                          🎫 Change Role
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </>
          )}

          {/* USER LIST */}
          {usersFiltered.filter((u) => u.role === "user").length > 0 && (
            <>
              <h3 className="section-title">👤 Users</h3>
              <div className="admin-grid">
                {usersFiltered
                  .filter((u) => u.role === "user")
                  .map((u) => (
                    <div className="user-card user-card-box" key={u.id}>
                      <div className="user-info">
                        <div className={`role-label ${u.role}`}>USER</div>
                        <h4 className="user-name">{u.username}</h4>
                      </div>

                      {/* ACTION BUTTONS */}
                      <div className="user-actions">
                        <button
                          className="btn action-btn view"
                          onClick={() => (
                            setModalType("view"), setModalUser(u)
                          )}
                        >
                          👁 View
                        </button>

                        <button
                          className="btn action-btn reset"
                          onClick={() => (
                            setModalType("reset"), setModalUser(u)
                          )}
                        >
                          🔐 Reset Password
                        </button>

                        <button
                          className="btn action-btn role"
                          onClick={() => (
                            setModalType("role"), setModalUser(u)
                          )}
                        >
                          🎫 Change Role
                        </button>

                        <button
                          className="btn action-btn delete"
                          onClick={() => (
                            setModalType("delete"), setModalUser(u)
                          )}
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </>
          )}
        </>
      )}

      {/* modal */}
      {modalType && modalUser && (
        <div className="am-modal-backdrop" onClick={() => setModalType(null)}>
          <div className="am-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="am-modal-header">
              <h3>
                {modalType === "view" && "👁 Profile"}
                {modalType === "reset" && "🔐 Reset Password"}
                {modalType === "role" && "🎫 Change Role"}
                {modalType === "delete" && "🗑 Delete User"}
              </h3>

              
            </div>

            <div className="am-modal-body">
              {modalType === "view" && (
                <>
                  <p>
                    <b>Username:</b> {modalUser.username}
                  </p>
                  <p>
                    <b>Email:</b> {modalUser.email}
                  </p>
                  <p>
                    <b>Role:</b> {modalUser.role}
                  </p>
                </>
              )}

              {modalType === "reset" && (
                <p className="am-confirm-text">
                  {modalUser.oldPassword ? (
                    <>
                      คืนรหัสผ่านเดิมของ <b>{modalUser.username}</b> ใช่ไหม?
                    </>
                  ) : (
                    <>
                      รีเซ็ตรหัสผ่านของ <b>{modalUser.username}</b> เป็น{" "}
                      <b>1234</b> ใช่ไหม?
                    </>
                  )}
                </p>
              )}

              {modalType === "role" && (
                <p className="am-confirm-text">
                  เปลี่ยน role ของ <b>{modalUser.username}</b> เป็น{" "}
                  <b>{modalUser.role === "admin" ? "user" : "admin"}</b> ?
                </p>
              )}

              {modalType === "delete" && (
                <p className="am-confirm-text">
                  ต้องการลบผู้ใช้ <b>{modalUser.username}</b> ใช่ไหม?
                </p>
              )}
            </div>

            <div className="am-modal-actions">
              <button
                className="am-btn-cancel"
                onClick={() => setModalType(null)}
              >
                Cancel
              </button>

              {modalType === "reset" && (
                <button
                  className="am-btn-confirm"
                  onClick={() => confirmReset(modalUser.id)}
                >
                  Confirm
                </button>
              )}
              {modalType === "role" && (
                <button
                  className="am-btn-confirm"
                  onClick={() => confirmRole(modalUser.id)}
                >
                  Change
                </button>
              )}
              {modalType === "delete" && (
                <button
                  className="am-btn-confirm delete"
                  onClick={() => deleteUser(modalUser.id)}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminManagement;
