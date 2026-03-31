import React, { useEffect, useState } from "react";
/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from "framer-motion";
import "./AdsManagement.css";

const API_URL = "http://localhost:3000/api/ads";
const API_UPLOAD = "http://localhost:3000/api/ads/upload";
const IMAGE_BASE = "http://localhost:3000/upload/";

// ---------------- TOAST ----------------
const showToast = (msg, type = "success") => {
  const div = document.createElement("div");
  div.className = `sp-toast ${type}`;
  div.innerText = msg;
  document.body.appendChild(div);

  setTimeout(() => div.classList.add("show"), 10);

  setTimeout(() => {
    div.classList.remove("show");
    setTimeout(() => div.remove(), 300);
  }, 1800);
};

function AdsManagement() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState(null);

  const [previewAd, setPreviewAd] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [clickingId, setClickingId] = useState(null);

  const MAX_FEED_ADS = 3;

  // ================= LOAD ADS =================
  const loadAds = async () => {
    try {
      const res = await fetch(`${API_URL}?t=${Date.now()}`, {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();
      const list = data.adsList || data;

      const normalized = list.map((a) => ({
        id: a.id,
        name: a.name ?? "Untitled",
        description: a.description ?? "",
        image: a.image ?? "",
        position: a.position ?? "feed",
        sizePreset: a.sizePreset ?? "medium",
        date: (a.date || "").split("T")[0],
        active: a.active === 1 || a.active === true,
      }));

      setAds(normalized);
    } catch (err) {
      console.error(err);
      showToast("โหลดโฆษณาไม่สำเร็จ", "error");
    }

    setLoading(false);
  };

  useEffect(() => {
    loadAds();
  }, []);

  // ================= CREATE =================
  const addAd = () => {
    setPreviewAd(null);
    setConfirmDelete(null);
    setEditingId("new");
    setEditData({
      name: "",
      description: "",
      image: "",
      position: "feed",
      sizePreset: "medium",
      date: new Date().toISOString().split("T")[0],
      active: false,
    });
  };

  // ================= DELETE =================
  const doDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error();

      showToast("ลบโฆษณาสำเร็จ");
      await loadAds();
    } catch {
      showToast("ลบไม่สำเร็จ", "error");
    }

    setConfirmDelete(null);
  };

  // ================= TOGGLE ACTIVE =================
  const toggleActive = async (id) => {
    const target = ads.find((a) => a.id === id);
    const newStatus = target.active ? 0 : 1;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...target,
          active: newStatus,
        }),
      });

      if (!res.ok) throw new Error();

      await loadAds();
    } catch (err) {
      console.error(err);
      showToast("อัปเดตสถานะไม่สำเร็จ", "error");
    }
  };

  // ================= EDIT =================
  const startEdit = (ad) => {
    setPreviewAd(null);
    setConfirmDelete(null);
    setEditData(null); 

    setEditingId(ad.id);
    setEditData({ ...ad });
  };

  const saveEdit = async () => {
    const isNew = editingId === "new";
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(isNew ? API_URL : `${API_URL}/${editingId}`, {
        method: isNew ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...editData,
          date: editData.date.split("T")[0],
        }),
      });

      if (!res.ok) throw new Error();

      showToast(isNew ? "สร้างสำเร็จ!" : "บันทึกสำเร็จ");
      await loadAds();
    } catch {
      showToast("บันทึกไม่สำเร็จ", "error");
    }

    setEditingId(null);
    setEditData(null);
  };

  // ================= UPLOAD IMAGE =================
  const uploadImage = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(API_UPLOAD, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      setEditData((prev) => ({
        ...prev,
        image: data.filename,
      }));

      showToast("อัปโหลดรูปสำเร็จ");
    } catch (err) {
      console.error(err);
      showToast("อัปโหลดรูปไม่สำเร็จ", "error");
    }
  };

  // ================= SEARCH =================
  const filtered = ads.filter((a) => {
    const q = search.toLowerCase();

    return (
      a.name.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q)
    );
  });

  // ================= UI =================
  return (
    <motion.div className="sp-page-container">
      <div className="sp-header">
        <h2>📢 SmartPersona — Ads Manager</h2>

        <button className="sp-btn sp-btn-add" onClick={addAd}>
          + Create Ad
        </button>
      </div>

      <input
        className="sp-search"
        placeholder="🔎 ค้นหาโฆษณา..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <div style={{ padding: 20 }}>Loading...</div>
      ) : (
        filtered
          .sort((a, b) => b.active - a.active)
          .map((ad, index) => {
            const activeAds = filtered.filter((a) => a.active);

            let status = "inactive";

            if (ad.active) {
              const activeIndex = activeAds.findIndex((a) => a.id === ad.id);

              if (activeIndex < MAX_FEED_ADS) {
                status = "showing";
              } else {
                status = "hidden";
              }
            }

            return (
              <div className="sp-ad-card" key={ad.id}>
                <div className="sp-middle">
                  <h3>{ad.name}</h3>

                  {ad.image && (
                    <img
                      src={`${IMAGE_BASE}${ad.image}`}
                      alt=""
                      style={{
                        width: 120,
                        borderRadius: 8,
                      }}
                    />
                  )}

                  <div className="sp-desc">{ad.description}</div>

                  <div className="sp-date">{ad.date}</div>
                </div>

                <div className="sp-right">
                  <button
                    className={`sp-status ${
                      status === "showing"
                        ? "active"
                        : status === "hidden"
                          ? "warning"
                          : "inactive"
                    }`}
                    onClick={() => toggleActive(ad.id)}
                  >
                    {status === "showing" && "Active ✔"}
                    {status === "hidden" && "⚠ Active but hidden"}
                    {status === "inactive" && "Inactive ✖"}
                  </button>

                  <div className="sp-row">
                    <motion.button
                      className="sp-btn sp-btn-view"
                      whileTap={{ scale: 0.92 }} // 🔥 กดแล้วจม
                      whileHover={{ scale: 1.05 }} // 🔥 hover ขยาย
                      transition={{ type: "spring", stiffness: 300 }}
                      onClick={() => {
                        setEditData(null);
                        setEditingId(null);
                        setConfirmDelete(null);

                        setTimeout(() => {
                          setPreviewAd(ad);
                        }, 0);
                      }}
                    >
                      Preview
                    </motion.button>

                    <button
                      className="sp-btn sp-btn-edit"
                      onClick={() => startEdit(ad)}
                    >
                      Edit
                    </button>

                    <button
                      className="sp-btn sp-btn-delete"
                      onClick={() => {
                        setPreviewAd(null);
                        setEditingId(null);
                        setEditData(null);
                        setConfirmDelete(ad);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })
      )}

      {/* ================= PREVIEW POPUP ================= */}
      <AnimatePresence>
        {previewAd && !confirmDelete && !editingId && (
          <motion.div
            className="sp-preview-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewAd(null)}
          >
            <motion.div
              className="sp-preview-card"
              initial={{ scale: 0.85, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 220,
                damping: 18,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {previewAd.image ? (
                <img
                  src={`${IMAGE_BASE}${previewAd.image}`}
                  className="sp-preview-img"
                  alt=""
                />
              ) : (
                <div className="sp-no-image big">NO IMAGE</div>
              )}

              <div className="sp-preview-content">
                <h2 className="sp-preview-title">{previewAd.name}</h2>

                <p className="sp-preview-desc">{previewAd.description}</p>
              </div>

              <button
                className="sp-preview-action"
                onClick={() => setPreviewAd(null)}
              >
                ปิด
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= DELETE ================= */}

      {/* ================= DELETE ================= */}

      <AnimatePresence>
        {confirmDelete && (
          <motion.div className="sp-modal-bg">
            <motion.div className="sp-modal">
              <h3>ลบโฆษณา ?</h3>

              <p>{confirmDelete.name}</p>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  className="sp-btn sp-btn-delete"
                  onClick={() => doDelete(confirmDelete.id)}
                >
                  Delete
                </button>

                <button
                  className="sp-btn sp-btn-cancel"
                  onClick={() => setConfirmDelete(null)}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= EDIT ================= */}

      <AnimatePresence>
        {editingId && editData && (
          <motion.div className="sp-modal-bg">
            <motion.div className="sp-modal">
              <h3>Edit Ad</h3>

              <input
                value={editData.name}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    name: e.target.value,
                  })
                }
              />

              <textarea
                value={editData.description}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    description: e.target.value,
                  })
                }
              />

              <input
                type="file"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) uploadImage(file);
                }}
              />

              {editData.image && (
                <>
                  <img
                    src={`${IMAGE_BASE}${editData.image}`}
                    alt=""
                    style={{
                      width: 150,
                      marginTop: 10,
                      borderRadius: 8,
                    }}
                  />

                  <button
                    className="sp-btn sp-btn-remove-img"
                    onClick={() =>
                      setEditData({
                        ...editData,
                        image: "",
                      })
                    }
                    style={{ marginTop: 8 }}
                  >
                    Delete Image
                  </button>
                </>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <button className="sp-btn sp-btn-save" onClick={saveEdit}>
                  Save
                </button>

                <button
                  className="sp-btn sp-btn-cancel"
                  onClick={() => {
                    setEditingId(null);
                    setEditData(null);
                  }}
                >
                  Cancel
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