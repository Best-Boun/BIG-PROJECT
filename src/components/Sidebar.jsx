import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";
import FaqBot from '../components/FaqBot';
import GeminiBot from '../components/GeminiBot';
import OpenAiBot from '../components/OpenAiBot';
import BrowserLLMBot from '../components/BrowserLlmBot';
import HelloWorldBot from '../components/HelloWorldBot';

const bots = {
  helloworldbot: HelloWorldBot,
  faqbot: FaqBot,
  openaibot: OpenAiBot,
  geminibot: GeminiBot,
  browserllmbot: BrowserLLMBot,
};

function Sidebar() {

    const [selected, setSelected] = useState('browserllmbot');
    const Bot = selected ? bots[selected] : BrowserLLMBot;

  return (
    <aside className="sidebar">
      <div className="logo">SMART PERSONA</div>

      <nav>
        <ul>
          <li>
            <NavLink to="/chart" className={({ isActive }) => (isActive ? "active" : "")}>
              📊 Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/ads" className={({ isActive }) => (isActive ? "active" : "")}>
              📢 Ads Management
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin" className={({ isActive }) => (isActive ? "active" : "")}>
              👤 Admin Management
            </NavLink>
          </li>
        </ul>
      </nav>
       <div style={{ padding: 16, fontFamily: 'Arial, sans-serif' }}>
      <label htmlFor="bot-select" style={{ marginRight: 8, fontWeight: 'bold' }} className="AI">
        Choose an AI:
      </label>
      <select
        id="bot-select"
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        style={{
          padding: '8px 12px',
          fontSize: '16px',
          borderRadius: '4px',
          border: '1px solid #ccc',
          backgroundColor: '#f8f8f8',
          cursor: 'pointer',
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
    </aside>

    
  );
}

export default Sidebar;
