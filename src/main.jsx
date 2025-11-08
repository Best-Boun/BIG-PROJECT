// src/main.jsx

import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// 1. นำเข้าสไตล์รวม (ใช้ index.css ตามชื่อไฟล์ปัจจุบัน)
import './index.css'; 

// 2. นำเข้าคอมโพเนนต์หลัก (ใช้ App.jsx ตามชื่อไฟล์ปัจจุบัน)
import App from './App.jsx'; 

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

// 3. เรนเดอร์คอมโพเนนต์ (ห้ามคอมเมนต์ส่วนนี้เด็ดขาด)
root.render(
  <StrictMode>
    <App /> 
  </StrictMode>
);