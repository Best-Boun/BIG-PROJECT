import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./Access.css";

const API_URL = "http://localhost:3002/adsList";

const PLATFORMS = [
  "Facebook", "Twitter (X)", "LinkedIn", "YouTube", "GitHub",
  "Medium", "Pinterest", "Indeed"
];

/* 🎨 ไอคอน + สีสำหรับ platform */
const platformMeta = {
  "Facebook": { color: "#1877f2", icon: "📘" },
  "Twitter (X)": { color: "#000000", icon: "🐦" },
  "LinkedIn": { color: "#0a66c2", icon: "💼" },
  "YouTube": { color: "#ff0000", icon: "▶️" },
  "GitHub": { color: "#333", icon: "🐙" },
  "Medium": { color: "#00ab6c", icon: "✍️" },
  "Pinterest": { color: "#bd081c", icon: "📌" },
  "Indeed": { color: "#2164f3", icon: "💼" },
};

function AdsManagement() {
  const [ads, setAds] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: "", platform: "" });
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  /* ============================
        LOAD DATA
  ============================ */
  const fetchAds = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setAds(data);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAds();
  }, []);

  /* ============================
        POPUP
  ============================ */
  const showPopup = (text, type = "info") => {
    const el = document.createElement("div");
    el.className = `popup ${type}`;
    el.textContent = text;
    document.body.appendChild(el);
    setTimeout(() => el.classList.add("fade"), 10);
    setTimeout(() => el.remove(), 2000);
  };

  /* ============================
        SAVE ALL
  ============================ */
  const saveAll = async () => {
    try {
      await Promise.all(
        ads.map((item) =>
          fetch(`${API_URL}/${item.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item),
          })
        )
      );
      setUnsavedChanges(false);
      showPopup("💾 เซฟข้อมูลเรียบร้อย!", "success");
    } catch {
      showPopup("❌ เซฟไม่สำเร็จ!", "error");
    }
  };

  /* ============================
        ADD NEW
  ============================ */
  const addAd = async () => {
    const newAd = {
      id: crypto.randomUUID(),
      name: "New Ad Campaign",
      platform: PLATFORMS[Math.floor(Math.random() * PLATFORMS.length)],
      date: new Date().toISOString().split("T")[0],
      active: true,
    };

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAd),
    });

    const created = await res.json();
    setAds([...ads, created]);
    setUnsavedChanges(true);
    showPopup("เพิ่มโฆษณาแล้ว!", "success");
  };

  /* ============================
        DELETE
  ============================ */
  const deleteAd = async (id) => {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    setAds(ads.filter((a) => a.id !== id));
    setUnsavedChanges(true);
    showPopup("ลบรายการแล้ว!", "info");
  };

  /* ============================
        TOGGLE ACTIVE
  ============================ */
  const toggleActive = async (id) => {
    const target = ads.find((a) => a.id === id);
    const updated = { ...target, active: !target.active };

    await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });

    setAds(ads.map((a) => (a.id === id ? updated : a)));
    setUnsavedChanges(true);
  };

  /* ============================
        EDIT MODE
  ============================ */
  const startEdit = (ad) => {
    setEditingId(ad.id);
    setEditData(ad);
  };

  const saveEdit = async (id) => {
    await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editData),
    });

    setAds(ads.map((a) => (a.id === id ? { ...editData } : a)));
    setEditingId(null);
    setUnsavedChanges(true);
    showPopup("แก้ไขแล้ว!", "success");
  };

  const filteredAds = ads.filter(
    (ad) =>
      ad.name.toLowerCase().includes(search.toLowerCase()) ||
      ad.platform.toLowerCase().includes(search.toLowerCase())
  );

  /* ============================
        RENDER
  ============================ */
  return (
    <motion.div className="page-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

      {/* HEADER */}
      <div className="header-box">
        <h2>📢 SmartPersona Ad Management</h2>
        <div className="actions">
          <button className="btn btn-add" onClick={addAd}>+ Add Ad</button>
          <button className="btn btn-save" disabled={!unsavedChanges} onClick={saveAll}>💾 Save All</button>
        </div>
      </div>

      {/* SEARCH */}
      <input
        className="search-box"
        placeholder="🔎 ค้นหาโฆษณา..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* LIST */}
      <div className="list-header">
        <div>ชื่อโฆษณา</div>
        <div>แพลตฟอร์ม</div>
        <div>สถานะ</div>
        <div>จัดการ</div>
      </div>

      <ul className="ads-list-vertical">
        <AnimatePresence>
          {filteredAds.map((ad) => (
            <motion.li key={ad.id} className="ad-row" layout>

              {/* NAME */}
              <div>
                {editingId === ad.id ? (
                  <input
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  />
                ) : (
                  <b>{ad.name}</b>
                )}
              </div>

              {/* PLATFORM (with icon & color) */}
              <div>
                {editingId === ad.id ? (
                  <select
                    value={editData.platform}
                    onChange={(e) =>
                      setEditData({ ...editData, platform: e.target.value })
                    }
                  >
                    {PLATFORMS.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                ) : (
                  <span
                    className="platform-badge"
                    style={{
                      background: platformMeta[ad.platform]?.color + "22",
                      color: platformMeta[ad.platform]?.color || "#000",
                      borderColor: platformMeta[ad.platform]?.color,
                    }}
                  >
                    {platformMeta[ad.platform]?.icon} {ad.platform}
                  </span>
                )}
              </div>

              {/* ACTIVE */}
              <div>
                <button
                  className={`status-btn ${ad.active ? "active" : "inactive"}`}
                  onClick={() => toggleActive(ad.id)}
                >
                  {ad.active ? "Active ✔" : "Inactive ✖"}
                </button>
              </div>

              {/* ACTIONS */}
              <div className="col col-actions">
                {editingId === ad.id ? (
                  <button className="btn btn-save" onClick={() => saveEdit(ad.id)}>
                    Save
                  </button>
                ) : (
                  <button className="btn btn-manage" onClick={() => startEdit(ad)}>
                    Edit
                  </button>
                )}
                <button className="btn btn-delete" onClick={() => deleteAd(ad.id)}>
                  Delete
                </button>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </motion.div>
  );
}

export default AdsManagement;
