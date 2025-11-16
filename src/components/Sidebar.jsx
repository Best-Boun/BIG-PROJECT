import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

import FaqBot from "../components/FaqBot";

import BrowserLLMBot from "../components/BrowserLlmBot";


const bots = {
  
  faqbot: FaqBot,
  
  browserllmbot: BrowserLLMBot,
};

function Sidebar({ role, onLogout }) {
  const [selected, setSelected] = useState("browserllmbot");
  const Bot = selected ? bots[selected] : BrowserLLMBot;

  // แสดงเฉพาะ admin เท่านั้น
  if (role !== "admin") return null;

  return (
    <aside className="sidebar">
      <div className="logo">SMART PERSONA</div>

      <nav>
        <ul>
          <li>
            <NavLink
              to="/chart"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              📊 Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/ads"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              📢 Ads Management
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              👤 Admin Management
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* 🔹 ส่วนเลือก Bot */}
      <div style={{ padding: 16, fontFamily: "Arial, sans-serif" }}>
        <label
          htmlFor="bot-select"
          style={{ marginRight: 8, fontWeight: "bold" }}
          className="AI"
        >
          Choose an AI:
        </label>
        <select
          id="bot-select"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          style={{
            padding: "8px 12px",
            fontSize: "16px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            backgroundColor: "#f8f8f8",
            cursor: "pointer",
          }}
        >
          <option value="helloworldbot">Hello World Bot</option>
          <option value="faqbot">FAQ Bot</option>
          <option value="openaibot">OpenAI Bot</option>
          <option value="geminibot">Gemini Bot</option>
          <option value="browserllmbot">Browser LLM Bot</option>
        </select>
        {Bot ? <Bot /> : null}
      </div>

      {/* 🔹 ปุ่มออกจากระบบ */}
      <button
        onClick={onLogout}
        className="btn btn-logout"
        style={{
          marginTop: "30px",
          backgroundColor: "#e53e3e",
          color: "white",
          border: "none",
          borderRadius: "8px",
          padding: "10px 20px",
          cursor: "pointer",
          fontWeight: "bold",
          transition: "0.2s ease-in-out",
        }}
        onMouseOver={(e) => (e.target.style.opacity = 0.8)}
        onMouseOut={(e) => (e.target.style.opacity = 1)}
      >
        🚪 ออกจากระบบ
      </button>
    </aside>
  );
}

export default Sidebar;
