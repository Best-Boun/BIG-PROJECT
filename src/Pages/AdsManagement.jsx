import React, { useEffect, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import "./AdsManagement.css";

const API_URL = "http://localhost:3002/adsList";
const API_UPLOAD = "http://localhost:4000/upload";


/* ---------- LOCAL IMAGE STORE ---------- */
const loadLocal = () => {
  try {
    return JSON.parse(localStorage.getItem("localUploads") || "{}");
  } catch {
    return {};
  }
};

const saveLocal = (m) =>
  localStorage.setItem("localUploads", JSON.stringify(m));
// eslint-disable-next-line no-unused-vars
const addLocal = (filename, dataUrl) => {
  const m = loadLocal();
  m[filename] = dataUrl;
  saveLocal(m);
};

const removeLocal = (filename) => {
  const m = loadLocal();
  if (m[filename]) delete m[filename];
  saveLocal(m);
};
// eslint-disable-next-line no-unused-vars
const getLocal = (filename) => loadLocal()[filename];
// eslint-disable-next-line no-unused-vars
const genFilename = (name) => {
  const ext = name.split(".").pop();
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${ext}`;
};
// eslint-disable-next-line no-unused-vars
const resizeImage = (file, maxWidth = 1200, quality = 0.75) =>
  new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const ratio = Math.min(1, maxWidth / img.width);
        const w = img.width * ratio;
        const h = img.height * ratio;
        const can = document.createElement("canvas");
        can.width = w;
        can.height = h;
        const ctx = can.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        res(can.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.onerror = () => rej("err");
    reader.readAsDataURL(file);
  });

/* ---------- TOAST ALERT ---------- */
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

/* ============================================================= */

function AdsManagement() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState(null);
  const [previewAd, setPreviewAd] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [unsavedChanges, setUnsavedChanges] = useState(false);

  /* ---------- FETCH ADS ----------ดึงโฆษณา */ 
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
          customWidth: a.customWidth ?? "",
          customHeight: a.customHeight ?? "",
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

  /* ---------- SAVE ALL ---------- */
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

  /* ---------- ADD ----------เพิ่ม ads */
  const addAd = async () => {
    const newAd = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: "New Ad",
      description: "คำอธิบาย...",
      image: "",
      position: "feed",
      sizePreset: "medium",
      customWidth: "",
      customHeight: "",
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

  /* ---------- DELETE ---------- */
  const doDelete = async (id) => {
    const target = ads.find((a) => a.id === id);

    try {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("❌ Delete API failed:", err);
      showToast("ลบที่ Server ไม่สำเร็จ แต่จะลบในเครื่องให้ก่อน", "error");
      // ถ้าต้องการให้หยุดลบ UI → return;
    }

    // ลบ local storage image
    if (target && target.image && target.image.startsWith("local_")) {
      removeLocal(target.image);
    }

    // ลบออกจากหน้า UI
    setAds((s) => s.filter((a) => a.id !== id));
    setConfirmDelete(null);
    setUnsavedChanges(true);

    showToast("ลบโฆษณาสำเร็จ!", "success");
  };

  /* ---------- ACTIVE ---------- */
  const toggleActive = async (id) => {
    const t = ads.find((a) => a.id === id);
    const updated = { ...t, active: !t.active };

    try {
      await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });

      showToast(
        updated.active ? "เปิดใช้งานแล้ว" : "ปิดใช้งานแล้ว",
        updated.active ? "success" : "error"
      );
    } catch {
      showToast("อัปเดตสถานะล้มเหลว", "error");
    }

    setAds((s) => s.map((a) => (a.id === id ? updated : a)));
    setUnsavedChanges(true);
  };

  /* ---------- EDIT ---------- แก้ไข ads*/
  const startEdit = (ad) => {
    setEditingId(ad.id);
    setEditData({
      ...ad,
      sizePreset: ad.sizePreset ?? "medium",
      customWidth: ad.customWidth ?? "",
      customHeight: ad.customHeight ?? "",
    });
  };

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

  /* ---------- IMAGE UPLOAD ---------- */
  const resolveImageSrc = (img) => {
    if (!img) return null;

    // ถ้าเป็น URL อยู่แล้ว
    if (img.startsWith("http")) return img;

    // ถ้าเป็นไฟล์ที่ upload จริง
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
        setUnsavedChanges(true);
        showToast("อัปโหลดรูปสำเร็จ!");
      }
    } catch {
      showToast("อัปโหลดรูปไม่สำเร็จ", "error");
    }
  };

  const removeImage = () => {
    setEditData((s) => ({ ...s, image: "" }));
    showToast("ลบรูปภาพแล้ว", "error");
  };

  /* ---------- IMG STYLE ---------- */
  const imgClassFor = (item) => {
    const pos = item.position;
    const preset = item.sizePreset;
    return `sp-img ${pos} ${preset}`;
  };

  const imgStyleFor = (item) => {
    if (item.sizePreset === "custom") {
      return {
        width: item.customWidth + "px",
        height: item.customHeight + "px",
        objectFit: "cover",
      };
    }
    return {};
  };

  /* ---------- FILTER ---------- */
  const filtered = ads.filter((a) => {
    const q = search.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q)
    );
  });

  /* ============================================================= */

  return (
    <motion.div
      className="sp-page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
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

      {/* SEARCH */}
      <input
        className="sp-search"
        placeholder="🔎 ค้นหาโฆษณา..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* LIST */}
      {loading ? (
        <div style={{ padding: 20 }}>Loading...</div>
      ) : (
        filtered.map((ad) => (
          <div className="sp-ad-card" key={ad.id}>
            {/* LEFT */}
            <div className="sp-left">
              {ad.image ? (
                <img
                  className={imgClassFor(ad)}
                  style={imgStyleFor(ad)}
                  src={resolveImageSrc(ad.image)}
                  alt={ad.name}
                />
              ) : (
                <div className="sp-no-image">No Image</div>
              )}
            </div>

            {/* MIDDLE */}
            <div className="sp-middle">
              <h3>{ad.name}</h3>
              <div className="sp-desc">{ad.description}</div>
              <div className="sp-date">สร้าง: {ad.date}</div>

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
                    {/* Position */}
                    <select
                      className="sp-input small"
                      value={editData.position}
                      onChange={(e) =>
                        setEditData((s) => ({ ...s, position: e.target.value }))
                      }
                    >
                      <option value="feed">Feed</option>
                      <option value="banner">Banner</option>
                    </select>

                    {/* Size preset */}
                    <select
                      className="sp-input small"
                      value={editData.sizePreset}
                      onChange={(e) =>
                        setEditData((s) => ({
                          ...s,
                          sizePreset: e.target.value,
                        }))
                      }
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                      <option value="custom">Custom</option>
                    </select>

                    {/* Custom size */}
                    {editData.sizePreset === "custom" && (
                      <>
                        <input
                          className="sp-input small"
                          type="number"
                          placeholder="Width"
                          value={editData.customWidth}
                          onChange={(e) =>
                            setEditData((s) => ({
                              ...s,
                              customWidth: e.target.value,
                            }))
                          }
                        />
                        <input
                          className="sp-input small"
                          type="number"
                          placeholder="Height"
                          value={editData.customHeight}
                          onChange={(e) =>
                            setEditData((s) => ({
                              ...s,
                              customHeight: e.target.value,
                            }))
                          }
                        />
                      </>
                    )}

                    {/* Upload */}
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

            {/* RIGHT */}
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
                  style={imgStyleFor(previewAd)}
                />
              ) : (
                <div className="sp-no-image big">No Image</div>
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

      {/* DELETE MODAL */}
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
