<<<<<<< HEAD
import React, { useState, useEffect } from "react";
import "./Access.css";

function AdminManagement() {
=======
import React, { useEffect, useMemo, useState } from "react";
import "./Access.css";

const API_USERS = "http://localhost:3001/users";
const API_LOGS = "http://localhost:3003/logs";
const MAIN_ADMIN_ID = "1";
>>>>>>> 8c116ca5b57435ab809605536d78003f1cbcf955

/* ============================================================
   ⭐ LOCAL LOG SYSTEM (fallback)
============================================================ */
const addLocalLog = (entry) => {
  const list = JSON.parse(localStorage.getItem("localLogs") || "[]");
  list.unshift(entry);
  localStorage.setItem("localLogs", JSON.stringify(list));
};

const getLocalLogs = () => {
  return JSON.parse(localStorage.getItem("localLogs") || "[]");
};

/* ============================================================
   ⭐ POPUP
============================================================ */
const showPopup = (text, type = "info") => {
  const el = document.createElement("div");
  el.className = `popup ${type}`;
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => el.classList.add("fade"), 10);
  setTimeout(() => el.remove(), 2000);
};

/* ============================================================
   ⭐ MAIN COMPONENT
============================================================ */
function AdminManagement() {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // modal user
  const [modalType, setModalType] = useState(null);
  const [modalUser, setModalUser] = useState(null);

  // Log Modal
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const openModal = (type, user) => {
    setModalType(type);
    setModalUser(user);
  };

  const closeModal = () => {
    setModalType(null);
    setModalUser(null);
  };

  /* ============================================================
     ⭐ FETCH USERS → 3001
  ============================================================ */
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

  /* ============================================================
     ⭐ SAVE USER → PATCH 3001
  ============================================================ */
  const saveUser = async (user) => {
    try {
      const res = await fetch(`${API_USERS}/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      if (!res.ok) throw new Error("Update failed");

      setAllUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, ...user } : u))
      );
    } catch {
      showPopup("❌ บันทึกไม่สำเร็จ", "error");
    }
  };

  /* ============================================================
     ⭐ CREATE LOG → 3003 + local fallback
  ============================================================ */
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
      console.warn("Log server down → using local only");
    }
  };

  /* ============================================================
     ⭐ RESET PASSWORD
  ============================================================ */
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
        detail: "คืนค่ารหัสผ่านเดิม",
      });

      showPopup("🔄 คืนรหัสผ่านเดิมแล้ว");
      closeModal();
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
    closeModal();
  };

  /* ============================================================
     ⭐ CHANGE ROLE
  ============================================================ */
  const confirmRole = async (id) => {
    const user = allUsers.find((u) => u.id === id);
    if (!user) return;

    if (user.id === MAIN_ADMIN_ID)
      return showPopup("❌ Admin หลักเปลี่ยน Role ไม่ได้", "error");

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
    closeModal();
  };

  /* ============================================================
     ⭐ FETCH LOGS → first Local then 3003
  ============================================================ */
  const fetchLogs = async () => {
    setLogsLoading(true);

    const local = getLocalLogs();
    if (local.length > 0) {
      setLogs(local);
      setLogsLoading(false);
      return;
    }

    try {
      const res = await fetch(API_LOGS + "?_sort=time&_order=desc");
      const data = await res.json();
      setLogs(data);
    } catch {
      showPopup("โหลด Log ไม่สำเร็จ", "error");
    } finally {
      setLogsLoading(false);
    }
  };

  const openLogModal = () => {
    setLogModalOpen(true);
    fetchLogs();
  };

  /* ============================================================
     ⭐ FILTER USERS
  ============================================================ */
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

  /* ============================================================
     ⭐ RENDER UI
  ============================================================ */
  return (
    <div className="page-container admin-page">

      {/* HEADER */}
      <div className="am-header">
        <h2>⚙️ Admin Management</h2>

        <div className="am-controls">

          <button className="btn btn-save" onClick={openLogModal}>
            📜 View Logs
          </button>

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

      {/* LOADING */}
      {loading && (
        <div className="am-loading">
          <div className="spinner"></div>
          <p>กำลังโหลดข้อมูล...</p>
        </div>
      )}

      {!loading && (
        <>
          {/* OVERVIEW */}
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

          {/* Admin Cards */}
          {usersFiltered.filter((u) => u.role === "admin").length > 0 && (
            <>
              <h3 className="section-title">👑 Admin</h3>
              <div className="admin-grid">
                {usersFiltered
                  .filter((u) => u.role === "admin")
                  .map((u) => (
                    <div className="user-card admin-card" key={u.id}>
                      <div className="am-card-header">
                        <div>
                          <div className="role-label admin">ADMIN</div>
                          <h4 className="username">{u.username}</h4>
                          <div className="email">{u.email}</div>
                        </div>

                        <div className="am-btn-group">
                          <button className="btn btn-view" onClick={() => openModal("view", u)}>👁 View</button>
                          <button className="btn reset-btn" onClick={() => openModal("reset", u)}>🔐 Reset</button>
                          <button
                            className="btn role-btn"
                            onClick={() => openModal("role", u)}
                            disabled={u.id === MAIN_ADMIN_ID}
                          >
                            🎫 {u.role}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </>
          )}

          {/* User Cards */}
          {usersFiltered.filter((u) => u.role === "user").length > 0 && (
            <>
              <h3 className="section-title">👤 Users</h3>
              <div className="admin-grid">
                {usersFiltered
                  .filter((u) => u.role === "user")
                  .map((u) => (
                    <div className="user-card user-card-box" key={u.id}>
                      <div className="am-card-header">
                        <div>
                          <div className="role-label user">USER</div>
                          <h4 className="username">{u.username}</h4>
                          <div className="email">{u.email}</div>
                        </div>

                        <div className="am-btn-group">
                          <button className="btn btn-view" onClick={() => openModal("view", u)}>👁 View</button>
                          <button className="btn reset-btn" onClick={() => openModal("reset", u)}>🔐 Reset</button>
                          <button className="btn role-btn" onClick={() => openModal("role", u)}>
                            🎫 {u.role}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </>
          )}
        </>
      )}

      {/* LOG MODAL */}
      {logModalOpen && (
        <div className="am-modal-backdrop" onClick={() => setLogModalOpen(false)}>
          <div className="am-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="am-modal-header">
              <h3>📜 Action Logs</h3>
              <button className="am-close" onClick={() => setLogModalOpen(false)}>✖</button>
            </div>

            <div className="am-modal-body">
              {logsLoading ? (
                <p>⏳ loading...</p>
              ) : logs.length === 0 ? (
                <p>No logs yet.</p>
              ) : (
                <ul className="log-list">
                  {logs.map((log) => (
                    <li key={log.id} className="log-item">
                      <b>{log.action}</b> — {log.target}
                      <br />
                      <small>{new Date(log.time).toLocaleString()}</small>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="am-modal-actions">
              <button className="am-btn-cancel" onClick={() => setLogModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW / RESET / ROLE MODAL */}
      {modalType && modalUser && (
        <div className="am-modal-backdrop" onClick={closeModal}>
          <div className="am-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="am-modal-header">
              <h3>
                {modalType === "view" && "👁 Profile"}
                {modalType === "reset" && "🔐 Reset Password"}
                {modalType === "role" && "🎫 Change Role"}
              </h3>
              <button className="am-close" onClick={closeModal}>✖</button>
            </div>

            <div className="am-modal-body">
              {modalType === "view" && (
                <>
                  <p><b>Username:</b> {modalUser.username}</p>
                  <p><b>Email:</b> {modalUser.email}</p>
                  <p><b>Role:</b> {modalUser.role}</p>
                </>
              )}

              {modalType === "reset" && (
                <p className="am-confirm-text">
                  {modalUser.oldPassword
                    ? <>คืนรหัสผ่านเดิมของ <b>{modalUser.username}</b> ใช่ไหม?</>
                    : <>รีเซ็ตรหัสผ่านของ <b>{modalUser.username}</b> เป็น <b>1234</b> ใช่ไหม?</>}
                </p>
              )}

              {modalType === "role" && (
                <p className="am-confirm-text">
                  เปลี่ยน role ของ <b>{modalUser.username}</b> เป็น{" "}
                  <b>{modalUser.role === "admin" ? "user" : "admin"}</b> ?
                </p>
              )}
            </div>

            <div className="am-modal-actions">
              <button className="am-btn-cancel" onClick={closeModal}>Cancel</button>

              {modalType === "reset" && (
                <button className="am-btn-confirm" onClick={() => confirmReset(modalUser.id)}>
                  Confirm
                </button>
              )}

              {modalType === "role" && (
                <button className="am-btn-confirm" onClick={() => confirmRole(modalUser.id)}>
                  Change
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
