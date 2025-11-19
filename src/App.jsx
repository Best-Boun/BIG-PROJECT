// src/App.jsx
import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Sidebar from "./components/Sidebar";
import ChartPage from "./pages/ChartPage";
import AdsManagement from "./Pages/AdsManagement";
import AdminManagement from "./Pages/AdminManagement";
import UserDashboard from "./Pages/UserDashboard";

// ⭐⭐⭐ เพิ่มตรงนี้ ⭐⭐⭐
import UserFeed from "./Pages/UserFeed";

import "./App.css";

function App() {
  const [token, setToken] = useState("");
  const [role, setRole] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  /* LOAD TOKEN */
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

  useEffect(() => {
    if (loading) return;

    const savedRole = localStorage.getItem("role");
    const savedToken = localStorage.getItem("token");

    if (!savedRole || !savedToken) {
      setToken("");
      setRole("");
      return;
    }

    setRole(savedRole);
    setToken(savedToken);

    setTimeout(() => {
      if (
        window.location.pathname === "/" ||
        window.location.pathname === "/register"
      ) {
        if (savedRole === "admin") navigate("/chart", { replace: true });
        else if (savedRole === "user")
          navigate("/user-dashboard", { replace: true });
      }
    }, 50);
  }, [loading, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    setToken("");
    setRole("");

    setTimeout(() => {
      navigate("/", { replace: true });
      window.location.reload();
    }, 100);
  };

  if (loading) return <div className="loading-screen">Loading...</div>;

  /* NOT LOGGED IN */
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

  /* LOGGED IN */
  return (
    <div className="app">
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
          {/* ADMIN ROUTES */}
          {role === "admin" && (
            <>
              <Route path="/chart" element={<ChartPage />} />
              <Route path="/ads" element={<AdsManagement />} />
              <Route path="/admin" element={<AdminManagement />} />
            </>
          )}

          {/* ⭐ USER ROUTES ⭐ */}
          {role === "user" && (
            <>
              <Route
                path="/user-dashboard"
                element={<UserDashboard handleLogout={handleLogout} />}
              />

              {/* ⭐⭐ หน้าที่จะไว้โชว์โฆษณาจริงของ user ⭐⭐ */}
              <Route path="/user-feed" element={<UserFeed />} />
            </>
          )}

          {/* LOGOUT */}
          <Route
            path="/logout"
            element={<LogoutButton handleLogout={handleLogout} />}
          />

          {/* DEFAULT */}
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
