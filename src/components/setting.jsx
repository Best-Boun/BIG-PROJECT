import React, { useState } from "react";
import "./setting.css";

export default function Settings({ onNavigate }) {
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState("medium");
  const [language, setLanguage] = useState("th");
  const [themeColor, setThemeColor] = useState("purple");
  const [notifications, setNotifications] = useState(true);
  const [layout, setLayout] = useState("wide");

  // เพิ่มตัวเลือกใหม่
  const [animationSpeed, setAnimationSpeed] = useState("normal");
  const [autoSave, setAutoSave] = useState(true);
  const [roundedUI, setRoundedUI] = useState("medium");
  const [defaultPage, setDefaultPage] = useState("public");

  const handleSave = () => {
    const settings = {
      darkMode,
      fontSize,
      language,
      themeColor,
      notifications,
      layout,
      animationSpeed,
      autoSave,
      roundedUI,
      defaultPage
    };
    localStorage.setItem("settings", JSON.stringify(settings));
    alert("Settings saved!");
  };

  return (
    <div className="settings-container">
      <div className="settings-card">
        <h1 className="text-2xl font-bold mb-4">⚙️ Settings</h1>

        {/* Dark Mode */}
        <div className="setting-section">
          <div>
            <h2 className="font-semibold text-lg">Dark Mode</h2>
            <p className="text-gray-500 text-sm">สลับโหมดสว่าง / มืด</p>
          </div>
          <label className="toggle-wrapper">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        {/* Font Size */}
        <div className="setting-section">
          <h2 className="font-semibold text-lg">ขนาดตัวอักษร</h2>
          <select value={fontSize} onChange={(e) => setFontSize(e.target.value)}>
            <option value="small">เล็ก</option>
            <option value="medium">ปานกลาง</option>
            <option value="large">ใหญ่</option>
          </select>
        </div>

        {/* Language */}
        <div className="setting-section">
          <h2 className="font-semibold text-lg">ภาษา</h2>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="th">ไทย</option>
            <option value="en">English</option>
            <option value="jp">日本語</option>
          </select>
        </div>

        {/* Theme Color */}
        <div className="setting-section">
          <h2 className="font-semibold text-lg">🎨 ธีมสี</h2>
          <select value={themeColor} onChange={(e) => setThemeColor(e.target.value)}>
            <option value="purple">ม่วง</option>
            <option value="blue">น้ำเงิน</option>
            <option value="red">แดง</option>
            <option value="green">เขียว</option>
          </select>
        </div>

        {/* Notifications */}
        <div className="setting-section">
          <h2 className="font-semibold text-lg">🔔 การแจ้งเตือน</h2>
          <label className="toggle-wrapper">
            <input
              type="checkbox"
              checked={notifications}
              onChange={() => setNotifications(!notifications)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        {/* Layout */}
        <div className="setting-section">
          <h2 className="font-semibold text-lg">📱 Layout Style</h2>
          <select value={layout} onChange={(e) => setLayout(e.target.value)}>
            <option value="wide">แบบกว้าง</option>
            <option value="compact">แบบบีบ</option>
          </select>
        </div>


        {/* Default Page */}
        <div className="setting-section">
          <h2 className="font-semibold text-lg">📍 หน้าเริ่มต้น</h2>
          <select value={defaultPage} onChange={(e) => setDefaultPage(e.target.value)}>
            <option value="public">หน้าโปรไฟล์</option>
            <option value="edit">หน้าแก้ไขโปรไฟล์</option>
            <option value="social">หน้าฟีด</option>
            <option value="settings">หน้า Settings</option>
          </select>
        </div>

        {/* Back & Save */}
        <div className="flex gap-3">
          <button className="btn-save" onClick={() => onNavigate("public")}>
            ย้อนกลับ
          </button>
          <button className="btn-save" onClick={handleSave}>
            บันทึก
          </button>
        </div>

      </div>
    </div>
  );
}