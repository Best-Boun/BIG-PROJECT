import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Login from "./Admin/Login";
import Ads from "./Admin/Ads";
// import Api from "./Admin/Api";
import AdminPages from "./Admin/AdminPages";

function App() {
  // ✅ สร้าง admin หลักไว้ตั้งต้นอัตโนมัติ (ถ้ายังไม่มี)
  useEffect(() => {
    const existingAdmins = JSON.parse(localStorage.getItem("adminUsers")) || [];
    if (existingAdmins.length === 0) {
      const defaultAdmin = [
        { email: "test@admin", password: "1" },
      ];
      localStorage.setItem("adminUsers", JSON.stringify(defaultAdmin));
      console.log("✅ Default admin created: admin@system.com / 1234");
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/ads" element={<Ads />} />
        {/* <Route path="/api" element={<Api />} /> */}
        <Route path="/admin-setting" element={<AdminPages />} />
        <Route
          path="/user-dashboard"
          element={
            <div style={{ textAlign: "center", marginTop: "100px" }}>
              <h2>ยินดีต้อนรับเข้าสู่ระบบผู้ใช้ 🎉</h2>
              <p>นี่คือตัวอย่างหน้า User Dashboard</p>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
