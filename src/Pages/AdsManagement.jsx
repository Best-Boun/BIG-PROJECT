import React from "react";
import { useState, useEffect, useCallback} from "react";
import { useNavigate } from "react-router-dom";
import "./Access.css";

function AdsManagement() {
  const navigate = useNavigate();
  const API_URL = "http://localhost:3001/adsList";

  const platforms = [
    "Facebook", "Instagram", "Twitter(X)", "YouTube", "TikTok", "LinkedIn",
    "Pinterest", "Threads", "JobThai", "Indeed", "GitHub", "Medium"
  ];

  const [ads, setAds] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPlatform, setEditPlatform] = useState("");
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });

  // ✅ ฟังก์ชัน popup แจ้งเตือน
  const showPopup = (message, type = "info") => {
    setPopup({ show: true, message, type });
    setTimeout(() => setPopup({ show: false, message: "", type: "" }), 2000);
  };

  // ✅ โหลดข้อมูลจาก json-server (แก้ warning เหลือง)
  const loadAds = useCallback(async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setAds(data);
    } catch (err) {
      console.error("❌ โหลดข้อมูลไม่สำเร็จ:", err);
      showPopup("❌ โหลดข้อมูลไม่สำเร็จ", "error");
    }
  }, [API_URL]);

  useEffect(() => {
    loadAds();
  }, [loadAds]); // ✅ ไม่มี warning อีกต่อไป

  // ✅ เพิ่ม Ad ใหม่
  const addAd = async () => {
    const newAd = {
      name: "New Ad Campaign",
      platform: platforms[Math.floor(Math.random() * platforms.length)],
      date: new Date().toISOString().split("T")[0],
      active: true,
    };

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAd),
      });

      const addedAd = await res.json();
      setAds((prev) => [...prev, addedAd]);
      showPopup("📝 เพิ่ม Ad สำเร็จ!", "success");
    } catch (err) {
      console.error("❌ เพิ่มข้อมูลไม่สำเร็จ:", err);
      showPopup("❌ เพิ่มไม่สำเร็จ", "error");
    }
  };

  // ✅ ลบ Ad
  const deleteAd = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      setAds((prev) => prev.filter((ad) => ad.id !== id));
      showPopup("🗑️ ลบข้อมูลสำเร็จ", "success");
    } catch (err) {
      console.error("❌ ลบไม่สำเร็จ:", err);
      showPopup("❌ ลบไม่สำเร็จ", "error");
    }
  };

  // ✅ เริ่มแก้ไข
  const startEdit = (ad) => {
    setEditingId(ad.id);
    setEditName(ad.name);
    setEditPlatform(ad.platform);
  };

  // ✅ บันทึกการแก้ไข
  const saveEdit = async (id) => {
    try {
      const updatedAd = { name: editName, platform: editPlatform };
      await fetch(`${API_URL}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedAd),
      });

      setAds((prev) =>
        prev.map((ad) => (ad.id === id ? { ...ad, ...updatedAd } : ad))
      );
      setEditingId(null);
      showPopup("💾 แก้ไขสำเร็จ!", "success");
    } catch (err) {
      console.error("❌ แก้ไขไม่สำเร็จ:", err);
      showPopup("❌ แก้ไขไม่สำเร็จ", "error");
    }
  };

  // ✅ สลับสถานะ Active/Paused
  const toggleActive = async (id) => {
    const ad = ads.find((a) => a.id === id);
    if (!ad) return;

    try {
      const updated = { active: !ad.active };
      await fetch(`${API_URL}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });

      setAds((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...updated } : a))
      );
      showPopup(ad.active ? "🚫 ปิดการทำงานแล้ว" : "✅ เปิดใช้งานแล้ว", "info");
    } catch (err) {
      console.error("❌ เปลี่ยนสถานะไม่สำเร็จ:", err);
      showPopup("❌ เปลี่ยนสถานะไม่สำเร็จ", "error");
    }
  };

  // ✅ Save All
  const saveAllToServer = async () => {
    if (!window.confirm("แน่ใจมั้ยว่าจะบันทึกข้อมูลทั้งหมดอีกครั้ง?")) return;

    setLoading(true);
    try {
      const existing = await fetch(API_URL).then((r) => r.json());
      const existingMap = new Map(existing.map((ad) => [ad.id, ad]));

      for (const ad of ads) {
        const { id, ...rest } = ad;
        if (existingMap.has(id)) {
          await fetch(`${API_URL}/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(rest),
          });
        } else {
          await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(rest),
          });
        }
      }

      await loadAds();
      showPopup("💾 บันทึกทั้งหมดเรียบร้อย!", "success");
    } catch (err) {
      console.error("❌ Save All ไม่สำเร็จ:", err);
      showPopup("❌ Save All ไม่สำเร็จ", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredAds = ads.filter((ad) =>
    ad.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="header">
        <h2>📢 SmartPersona Ad Management</h2>
        <div>
          <button onClick={addAd} className="btn btn-add">+ Add Ad</button>
          <button
            onClick={saveAllToServer}
            className="btn btn-add"
            disabled={loading}
          >
            {loading ? "⏳ Saving..." : "💾 Save All"}
          </button>
          <button
            onClick={() => navigate("/admin")}
            className="btn btn-manage"
          >
            ⚙️ Admin Setting
          </button>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search ads..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "8px",
          marginBottom: "15px",
          border: "1px solid #ccc",
        }}
      />

      <div className="table-container">
        {filteredAds.length === 0 ? (
          <p>📭 No Ads Found</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Platform</th>
                <th>Date</th>
                <th>Status</th>
                <th>Manage</th>
              </tr>
            </thead>
            <tbody>
              {filteredAds.map((ad) => (
                <tr key={ad.id}>
                  <td>
                    {editingId === ad.id ? (
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    ) : (
                      ad.name
                    )}
                  </td>
                  <td>
                    {editingId === ad.id ? (
                      <select
                        value={editPlatform}
                        onChange={(e) => setEditPlatform(e.target.value)}
                      >
                        {platforms.map((p) => (
                          <option key={p}>{p}</option>
                        ))}
                      </select>
                    ) : (
                      ad.platform
                    )}
                  </td>
                  <td>{ad.date}</td>
                  <td>
                    <button
                      onClick={() => toggleActive(ad.id)}
                      className={`btn ${ad.active ? "btn-add" : "btn-delete"}`}
                    >
                      {ad.active ? "✅ Active" : "🚫 Paused"}
                    </button>
                  </td>
                  <td>
                    {editingId === ad.id ? (
                      <button onClick={() => saveEdit(ad.id)} className="btn btn-add">
                        💾 Save
                      </button>
                    ) : (
                      <button onClick={() => startEdit(ad)} className="btn btn-manage">
                        ✏️ Edit
                      </button>
                    )}
                    <button
                      onClick={() => deleteAd(ad.id)}
                      className="btn btn-delete"
                      style={{ marginLeft: "10px" }}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ✅ Popup แจ้งเตือนล่างขวา */}
      {popup.show && (
        <div className={`popup ${popup.type}`}>
          {popup.message}
        </div>
      )}
    </div>
  );
};

export default AdsManagement;
