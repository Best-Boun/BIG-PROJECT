import React, { useState } from "react";
import "./Feature1.css";

export default function Feature1() {
  const [primary, setPrimary] = useState("#ffadd9");
  const [secondary, setSecondary] = useState("#333333");
  const [font, setFont] = useState("Poppins");
  const [borderStyle, setBorderStyle] = useState("rounded");
  const [density, setDensity] = useState("comfortable");

  // ฟังก์ชันรีเซ็ตค่าเริ่มต้น
  const resetAll = () => {
    setPrimary("#ffadd9");
    setSecondary("#333333");
    setFont("Poppins");
    setBorderStyle("rounded");
    setDensity("comfortable");
  };

  return (
    <div
      className="ui-container"
      style={{
        background: `linear-gradient(135deg, ${primary}10, ${secondary}20)`,
        transition: "all 0.6s ease",
      }}
    >
      <h2 className="ui-title">
        🧩 การปรับแต่ง UI ขั้นสูง (Advanced UI Customization)
      </h2>
      <hr />

      <div className="ui-controls">
        <div className="ui-row">
          <label>สีหลัก (Primary):</label>
          <div className="ui-color">
            <input
              type="color"
              value={primary}
              onChange={(e) => setPrimary(e.target.value)}
            />
            <span>{primary}</span>
          </div>
        </div>

        <div className="ui-row">
          <label>สีรอง (Secondary):</label>
          <div className="ui-color">
            <input
              type="color"
              value={secondary}
              onChange={(e) => setSecondary(e.target.value)}
            />
            <span>{secondary}</span>
          </div>
        </div>

        <div className="ui-row">
          <label>ฟอนต์:</label>
          <select value={font} onChange={(e) => setFont(e.target.value)}>
            <option value="Poppins">Poppins (Modern)</option>
            <option value="Roboto Mono">Roboto Mono (Technical)</option>
            <option value="Prompt">Prompt (เรียบหรู)</option>
            <option value="Kanit">Kanit (ไทยร่วมสมัย)</option>
          </select>
        </div>

        <div className="ui-row">
          <label>ขอบโปรไฟล์:</label>
          <select
            value={borderStyle}
            onChange={(e) => setBorderStyle(e.target.value)}
          >
            <option value="bevel">ขอบเฉียง (Bevel)</option>
            <option value="rounded">โค้งมน (Rounded)</option>
            <option value="flat">แบนเรียบ (Flat)</option>
            <option value="glow">ขอบเรืองแสง (Glow)</option>
          </select>
        </div>

        <div className="ui-row">
          <label>ความหนาแน่น UI:</label>
          <select value={density} onChange={(e) => setDensity(e.target.value)}>
            <option value="comfortable">ผ่อนคลาย (Comfortable)</option>
            <option value="compact">กระชับ (Compact)</option>
          </select>
        </div>
      </div>

      {/* ปุ่มรีเซ็ต */}
      <div className="ui-actions">
        <button className="action-btn reset" onClick={resetAll}>
          ♻️ Reset ค่าเริ่มต้น
        </button>
      </div>

      <hr />

      <h3 className="ui-preview-title">✨ ตัวอย่างการแสดงผล</h3>

      <div
        className={`ui-preview ${density}`}
        style={{
          fontFamily: font,
          borderRadius:
            borderStyle === "rounded"
              ? "20px"
              : borderStyle === "bevel"
              ? "10px 25px 10px 25px"
              : borderStyle === "flat"
              ? "5px"
              : "15px",
          boxShadow:
            borderStyle === "glow"
              ? `0 0 25px ${primary}`
              : "0 4px 10px rgba(0,0,0,0.15)",
          transition: "all 0.5s ease",
        }}
      >
        <div
          className="profile-card"
          style={{
            backgroundColor: primary,
            borderColor: secondary,
            transition: "all 0.5s ease",
          }}
        >
          JS
        </div>
        <h4
          className="username"
          style={{
            color: primary,
            textShadow: `1px 1px ${secondary}`,
          }}
        >
          **Jirayut Suksa**
        </h4>
      </div>
    </div>
  );
}
