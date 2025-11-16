<<<<<<< HEAD
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
=======
// ✅ src/App.js
import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

>>>>>>> 8c116ca5b57435ab809605536d78003f1cbcf955
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Sidebar from "./components/Sidebar";
import ChartPage from "./Pages/ChartPage";
import AdsManagement from "./Pages/AdsManagement";
import AdminManagement from "./Pages/AdminManagement";
import UserDashboard from "./Pages/UserDashboard";

import "./App.css";

function App() {
  const [token, setToken] = useState("");
  const [role, setRole] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ โหลดข้อมูลจาก localStorage ครั้งแรก
  useEffect(() => {
    const savedRole = localStorage.getItem("role");
    const savedToken = localStorage.getItem("token");

    if (savedRole && savedToken) {
      setRole(savedRole);
      setToken(savedToken);
    }

    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  // ✅ Redirect หลังจากโหลดเสร็จ (แก้หน้าเปล่า)
  useEffect(() => {
    if (loading) return;

    const savedRole = localStorage.getItem("role");
    const savedToken = localStorage.getItem("token");

    if (!savedRole || !savedToken) {
      // ไม่มี token → กลับหน้า login
      setToken("");
      setRole("");
      return;
    }

    setRole(savedRole);
    setToken(savedToken);

    // ✅ ดีเลย์นิดให้ router mount ก่อน navigate
    setTimeout(() => {
      if (
        window.location.pathname === "/" ||
        window.location.pathname === "/register"
      ) {
        if (savedRole === "admin") navigate("/chart", { replace: true });
        else if (savedRole === "user") navigate("/user-dashboard", { replace: true });
      }
    }, 50);
  }, [loading]);

  // ✅ Logout
  const handleLogout = () => {
    localStorage.clear();
    setToken("");
    setRole("");
    setTimeout(() => {
      navigate("/", { replace: true });
      window.location.reload();
    }, 100);
  };

  // ✅ Loading screen
  if (loading) return <div className="loading-screen">Loading...</div>;

  // ✅ ถ้าไม่มี token → แสดงหน้า Login/Register
  if (!token) {
    return (
      <Routes>
        <Route
          path="/"
          element={<Login setToken={setToken} setRole={setRole} />}
        />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // ✅ ถ้ามี token แล้ว
  return (
    <div className="app">
      {/* ✅ Sidebar แสดงเฉพาะ admin */}
      {role === "admin" && (
        <>
          <button className="toggle-btn" onClick={() => setIsOpen(!isOpen)}>
            ☰
          </button>
          <Sidebar
            className={isOpen ? "" : "hidden"}
            role={role}
            onLogout={handleLogout}
          />
        </>
      )}

      <main className="main">
        <Routes>
          {/* 🔹 ADMIN ROUTES */}
          {role === "admin" && (
            <>
              <Route path="/chart" element={<ChartPage />} />
              <Route path="/ads" element={<AdsManagement />} />
              <Route path="/admin" element={<AdminManagement />} />
            </>
          )}

          {/* 🔹 USER ROUTES */}
          {role === "user" && (
            <Route
              path="/user-dashboard"
              element={<UserDashboard handleLogout={handleLogout} />}
            />
          )}

          {/* 🔹 LOGOUT */}
          <Route
            path="/logout"
            element={<LogoutButton handleLogout={handleLogout} />}
          />

          {/* 🔹 FALLBACK */}
          <Route
            path="*"
            element={
              <Navigate
                to={role === "admin" ? "/chart" : "/user-dashboard"}
                replace
              />
            }
          />
        </Routes>
      </main>
    </div>
  );
}

// ✅ ปุ่ม Logout
function LogoutButton({ handleLogout }) {
  return (
    <div style={{ textAlign: "center", marginTop: "30px" }}>
      <button onClick={handleLogout} className="btn btn-logout">
        🚪 Logout
      </button>
    </div>
  );
}

export default App;
