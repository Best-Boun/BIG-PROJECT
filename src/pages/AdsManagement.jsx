// src/Pages/AdsManagement/AdsManagement.jsx
import React, { useEffect, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import "./AdsManagement.css";

const API_URL = "http://localhost:3002/adsList";
const API_UPLOAD = "http://localhost:4000/upload";

// ---------------- LOCAL STORAGE (สำหรับเก็บไฟล์รูป) ----------------
const loadLocal = () => {
  try {
    return JSON.parse(localStorage.getItem("localUploads") || "{}");
  } catch {
    return {};
  }
};
const saveLocal = (m) =>
  localStorage.setItem("localUploads", JSON.stringify(m));
const removeLocal = (filename) => {
  const m = loadLocal();
  if (m[filename]) delete m[filename];
  saveLocal(m);
};

// ---------------- TOAST แจ้งเตือน ----------------
const showToast = (msg, type = "success") => {
  const div = document.createElement("div");
  div.className = `sp-toast ${type}`;
  div.innerText = msg;
  document.body.appendChild(div);
  setTimeout(() => div.classList.add("show"), 10);
  setTimeout(() => {
    div.classList.remove("show");
    setTimeout(() => div.remove(), 300);
  }, 1600);
};

// ===================================================================

function AdsManagement() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState(null);
  const [previewAd, setPreviewAd] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();

        const normalized = data.map((a) => ({
          id: a.id,
          name: a.name ?? "Untitled",
          description: a.description ?? "",
          image: a.image ?? "",
          position: a.position ?? "feed",
          sizePreset: a.sizePreset ?? "medium",
          date: a.date ?? new Date().toISOString().split("T")[0],
          active: a.active ?? false,
        }));

        setAds(normalized);
      } catch (err) {
        console.error("fetch fail", err);
      }
      setLoading(false);
    })();
  }, []);

  // ---------------- บันทึกทั้งหมด ----------------
  const saveAll = async () => {
    try {
      await Promise.all(
        ads.map((a) =>
          fetch(`${API_URL}/${a.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(a),
          })
        )
      );
      setUnsavedChanges(false);
      showToast("บันทึกทั้งหมดสำเร็จ!", "success");
    } catch {
      showToast("บันทึกไม่สำเร็จ", "error");
    }
  };

  // ---------------- เพิ่มโฆษณาใหม่ ----------------
  const addAd = async () => {
    const newAd = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: "New Ad",
      description: "คำอธิบาย...",
      image: "",
      position: "feed",
      sizePreset: "medium",
      date: new Date().toISOString().split("T")[0],
      active: false,
    };

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAd),
      });

      const created = await res.json();
      setAds((s) => [...s, created]);
    } catch {
      setAds((s) => [...s, newAd]);
    }

    setUnsavedChanges(true);
    showToast("สร้างโฆษณาใหม่สำเร็จ!");
  };

  // ---------------- ลบโฆษณา ----------------
  const doDelete = async (id) => {
    const target = ads.find((a) => a.id === id);

    try {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      showToast("ลบที่ Server ไม่สำเร็จ แต่จะลบในเครื่องก่อน", "error");
    }

    if (target && target.image && target.image.startsWith("local_")) {
      removeLocal(target.image);
    }

    setAds((s) => s.filter((a) => a.id !== id));
    setConfirmDelete(null);
    setUnsavedChanges(true);
    showToast("ลบโฆษณาสำเร็จ!", "success");
  };

  // ---------------- เปิด/ปิด Active ----------------
  const toggleActive = async (id) => {
    const t = ads.find((a) => a.id === id);
    const updated = { ...t, active: !t.active };

    try {
      await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
    } catch {
      showToast("อัปเดตสถานะล้มเหลว", "error");
    }

    setAds((s) => s.map((a) => (a.id === id ? updated : a)));
    setUnsavedChanges(true);
  };

  // ---------------- เริ่มแก้ไข ----------------
  const startEdit = (ad) => {
    setEditingId(ad.id);
    setEditData({ ...ad });
  };

  // ---------------- บันทึกการแก้ไข ----------------
  const saveEdit = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      showToast("บันทึกสำเร็จ!");
    } catch {
      showToast("บันทึกไม่สำเร็จ!", "error");
    }

    setAds((s) => s.map((a) => (a.id === id ? { ...editData } : a)));
    setEditingId(null);
    setEditData(null);
    setUnsavedChanges(true);
  };

  // ---------------- อัปโหลดรูป ----------------
  const resolveImageSrc = (img) => {
    if (!img) return null;
    if (img.startsWith("http")) return img;
    return `http://localhost:4000/upload/${img}`;
  };

  const handleImageFile = async (file) => {
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch(API_UPLOAD, { method: "POST", body: fd });
      const json = await res.json();

      if (json.filename) {
        setEditData((s) => ({ ...s, image: json.filename }));
        showToast("อัปโหลดรูปสำเร็จ!");
      }
    } catch {
      showToast("อัปโหลดรูปไม่สำเร็จ", "error");
    }
  };

  const removeImage = () => {
    setEditData((s) => ({ ...s, image: "" }));
    showToast("ลบรูปแล้ว", "error");
    setUnsavedChanges(true);
  };

  // ---------------- Filter Search ----------------
  const filtered = ads.filter((a) => {
    const q = search.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q)
    );
  });

  return (
    <motion.div
      className="sp-page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* HEADER */}
      <div className="sp-header">
        <h2>📢 SmartPersona — Ads (Feed)</h2>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="sp-btn sp-btn-add" onClick={addAd}>
            + Create Ad
          </button>
          <button
            className="sp-btn sp-btn-save"
            disabled={!unsavedChanges}
            onClick={saveAll}
          >
            💾 Save All
          </button>
        </div>
      </div>

      <input
        className="sp-search"
        placeholder="🔎 ค้นหาโฆษณา..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* ADS LIST */}
      {loading ? (
        <div style={{ padding: 20 }}>Loading...</div>
      ) : (
        filtered.map((ad) => (
          <div className="sp-ad-card" key={ad.id}>
            {/* LEFT IMAGE */}
            <div className="sp-left">
              {ad.image ? (
                <img
                  className="sp-img medium"
                  src={resolveImageSrc(ad.image)}
                  alt={ad.name}
                />
              ) : (
                <div className="sp-no-image">พื้นที่โฆษณา</div>
              )}
            </div>

            {/* MAIN CONTENT */}
            <div className="sp-middle">
              <h3>{ad.name}</h3>
              <div className="sp-desc">{ad.description}</div>
              <div className="sp-date">สร้าง: {ad.date}</div>

              {/* EDIT MODE */}
              {editingId === ad.id && editData && (
                <div className="sp-edit-box">
                  <input
                    className="sp-input"
                    value={editData.name}
                    onChange={(e) =>
                      setEditData((s) => ({ ...s, name: e.target.value }))
                    }
                  />

                  <textarea
                    rows={3}
                    className="sp-input"
                    value={editData.description}
                    onChange={(e) =>
                      setEditData((s) => ({
                        ...s,
                        description: e.target.value,
                      }))
                    }
                  />

                  <div className="sp-edit-actions">
                    <label className="sp-file-label">
                      Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageFile(e.target.files?.[0])}
                      />
                    </label>

                    <button
                      className="sp-btn sp-btn-save-small"
                      onClick={() => saveEdit(ad.id)}
                    >
                      Save
                    </button>

                    <button
                      className="sp-btn sp-btn-cancel-small"
                      onClick={() => {
                        setEditingId(null);
                        setEditData(null);
                      }}
                    >
                      Cancel
                    </button>

                    <button
                      className="sp-btn sp-btn-remove-img"
                      onClick={removeImage}
                    >
                      Remove Img
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT BUTTONS */}
            <div className="sp-right">
              <button
                className={`sp-status ${ad.active ? "active" : "inactive"}`}
                onClick={() => toggleActive(ad.id)}
              >
                {ad.active ? "Active ✔" : "Inactive ✖"}
              </button>

              <div className="sp-row">
                <button
                  className="sp-btn sp-btn-view"
                  onClick={() => setPreviewAd(ad)}
                >
                  Preview
                </button>

                <button
                  className="sp-btn sp-btn-edit"
                  onClick={() => startEdit(ad)}
                >
                  Edit
                </button>

                <button
                  className="sp-btn sp-btn-delete"
                  onClick={() => setConfirmDelete(ad)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      {/* PREVIEW MODAL */}
      <AnimatePresence>
        {previewAd && (
          <motion.div
            className="sp-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewAd(null)}
          >
            <motion.div
              className="sp-modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              {previewAd.image ? (
                <img
                  src={resolveImageSrc(previewAd.image)}
                  alt={previewAd.name}
                  className="preview-img"
                />
              ) : (
                <div className="sp-no-image big">พื้นที่โฆษณา</div>
              )}

              <h3>{previewAd.name}</h3>
              <p>{previewAd.description}</p>

              <button
                className="sp-btn sp-btn-cancel-small"
                onClick={() => setPreviewAd(null)}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRM */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            className="sp-modal-backdrop"
            onClick={() => setConfirmDelete(null)}
          >
            <motion.div
              className="sp-modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <h3>🗑 Delete Ad</h3>
              <p>
                ต้องการลบ <b>{confirmDelete.name}</b> ใช่ไหม?
              </p>

              <div style={{ textAlign: "right" }}>
                <button
                  className="sp-btn sp-btn-cancel-small"
                  onClick={() => setConfirmDelete(null)}
                >
                  Cancel
                </button>

                <button
                  className="sp-btn sp-btn-delete"
                  onClick={() => doDelete(confirmDelete.id)}
                  style={{ marginLeft: 10 }}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default AdsManagement;
