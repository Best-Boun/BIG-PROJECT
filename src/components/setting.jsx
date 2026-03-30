import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { SettingsContext } from "./SettingContext";
import "./setting.css";


export default function Settings() {
  const navigate = useNavigate();

  // ⭐ ดึงค่าต่าง ๆ จาก SettingsContext (เหมือน global state)
  const { settings, setSettings } = useContext(SettingsContext);

  // ⭐ ใช้สำหรับอัปเดตค่า settings และบันทึกลง localStorage
  const updateSetting = (key, value) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem("settings", JSON.stringify(updated)); // เก็บค่าลงเครื่อง
      return updated;
    });
  };

  

  return (
    <div className="settings-container">

      {/* กล่องตั้งค่าหลัก */}
      <div className="settings-card">

        {/* หัวข้อหน้า Settings */}
        <h1 className="text-2xl font-bold mb-4">⚙️ Settings</h1>

        {/* ================================
             ⚫ DARK MODE (โหมดกลางคืน)
           ================================ */}
        <div className="setting-section">
          <div>
            <h2 className="font-semibold text-lg">โหมดความมืด</h2>
            <p className="text-gray-500 text-sm">สลับโหมดสว่าง / มืด</p>
          </div>

          {/* Toggle Switch */}
          <label className="toggle-wrapper">
            <input
              type="checkbox"
              checked={settings.darkMode}        // อ่านค่าสถานะ
              onChange={() => updateSetting("darkMode", !settings.darkMode)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        {/* ================================
             🔤 FONT SIZE (ขนาดตัวอักษร)
           ================================ */}
        <div className="setting-section">
          <h2 className="font-semibold text-lg">ขนาดตัวอักษร</h2>

          <select
            value={settings.fontSize}
            onChange={(e) => updateSetting("fontSize", e.target.value)}
          >
            <option value="small">เล็ก</option>
            <option value="medium">ปานกลาง</option>
            <option value="large">ใหญ่</option>
          </select>
        </div>


        {/* ================================
             🔔 NOTIFICATIONS (แจ้งเตือน)
           ================================ */}
        <div className="setting-section">
          <h2 className="font-semibold text-lg">🔔 การแจ้งเตือน</h2>

          <label className="toggle-wrapper">
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={() =>
                updateSetting("notifications", !settings.notifications)
              }
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        {/*
        =====================
        🔳 LAYOUT STYLE
        =====================
        <div className="setting-section">
          <h2 className="font-semibold text-lg">📏 Layout</h2>
          <select
            value={settings.layout}
            onChange={(e) => updateSetting("layout", e.target.value)}
          >
            <option value="wide">กว้าง</option>
            <option value="compact">กระชับ</option>
          </select>
        </div>
        */}

        {/* ================================
             ปุ่มต่าง ๆ
           ================================ */}
        <div className="flex gap-3">

          {/* ย้อนกลับไปหน้าก่อนหน้า */}
          <button className="btn-save" onClick={() => navigate(-1)}>
            ย้อนกลับ
          </button>

          {/* ปุ่มบันทึก (ตอนนี้แค่แสดง alert) */}
          <button className="btn-save" onClick={() => alert("Settings saved!")}>
            บันทึก
          </button>
        </div>
      </div>
    </div>
  );
}