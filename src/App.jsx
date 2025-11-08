import React from "react";

// ===== import ฟีเจอร์ทั้งหมดที่มึงมี =====
import Feature1 from "./components/Feature1.jsx";
import Feature2 from "./components/Feature2.jsx";
import Feature3 from "./components/Feature3.jsx";

// ===== import CSS หลักของโปรเจกต์ =====
import "./App.css";

// ======= ฟังก์ชันหลัก =======
function App() {
  return (
    <div className="app-container">
      {/* ===== ศูนย์รวมฟีเจอร์ทั้งหมด ===== */}
      {/* อยาก run ฟีเจอร์ไหน ก็เปิดอันนั้นไว้ แล้วคอมเมนต์อันอื่นออก */}
      
      {/* ----- ฟีเจอร์ที่ 1: ปรับแต่ง UI ขั้นสูง ----- */}
      {/* <Feature1 /> */}

      {/* ----- ฟีเจอร์ที่ 2: สร้างโปรไฟล์หลายแบบ ----- */}
      <Feature2 />

      {/* ----- ฟีเจอร์ที่ 3 (อนาคต) ----- */}
      {/* <Feature3 /> */}
    </div>
  );
}

export default App;
