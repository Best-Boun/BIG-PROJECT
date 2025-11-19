<<<<<<< HEAD
// ==========================================
// 🎯 APP.JSX - Main Application with Routing
// ==========================================
// ใช้: Entry point + Routing สำหรับทั้ง app
// ความเข้าใจ: Header + 3 pages (Profile, Job, Resume)

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import Header from './components/Header';
import Profilepublic from './pages/ProfilePublic/Profilepublic';
import JobBrowse from './pages/JobBrowse';
import Resumepage from './pages/Resumepage';
import ProfileEdit from './pages/ProfileEdit';
import Feed from './pages/Feed/Feed';
import { ProfileProvider } from './ProfileContext';
import './App.css';

// Wrapper component สำหรับ Profilepublic ที่มี navigation
function ProfilepublicWrapper() {
  const navigate = useNavigate();

  const handleNavigate = (page) => {
    if (page === 'edit') navigate('/edit-profile');
    if (page === 'resume') navigate('/resume');
  };

  return <Profilepublic onNavigate={handleNavigate} />;
}

// Wrapper component สำหรับ Resumepage ที่มี navigation
function ResumepageWrapper() {
  const navigate = useNavigate();

  const handleNavigate = (page) => {
    if (page === 'profile') navigate('/profile');
    if (page === 'edit') navigate('/edit-profile');
  };

  return <Resumepage onNavigate={handleNavigate} />;
}

// Wrapper component สำหรับ ProfileEdit ที่มี navigation
function ProfileEditWrapper() {
  const navigate = useNavigate();

  const handleNavigate = (page) => {
    if (page === 'profile') navigate('/profile');
    if (page === 'resume') navigate('/resume');
  };

  return <ProfileEdit onNavigate={handleNavigate} />;
}

export default function App() {
  // Mock user data
  const [user] = useState({
    name: 'Alex Johnson',
    profileImage: '👤',
    email: 'alex@example.com'
  });

  const handleLogout = () => {
    console.log('User logged out');
    // TODO: Add logout logic
  };

  const [currentPath, setCurrentPath] = useState('/profile');

  return (
    <ProfileProvider>
      <Router>
        <div className="app">
          {/* Header Navigation */}
          <Header
            user={user}
            onLogout={handleLogout}
            currentPath={currentPath}
          />

          {/* Main Content */}
          <main className="app-main">
            <Routes>
              {/* Default page: Profile */}
              <Route
                path="/"
                element={<Navigate to="/profile" />}
              />

              {/* 👤 Profile Page */}
              <Route
                path="/profile"
                element={<ProfilepublicWrapper />}
              />

              {/* ✏️ Edit Profile Page */}
              <Route
                path="/edit-profile"
                element={<ProfileEditWrapper />}
              />

              {/* 💼 Job Page */}
              <Route
                path="/jobs"
                element={<JobBrowse />}
              />

              {/* 📄 Resume Page */}
              <Route
                path="/resume"
                element={<ResumepageWrapper />}
              />

              {/* 📰 Feed Page */}
              <Route
                path="/feed"
                element={<Feed />}
              />

              {/* Catch all - redirect to profile */}
              <Route
                path="*"
                element={<Navigate to="/profile" />}
              />
            </Routes>
          </main>
        </div>
      </Router>
    </ProfileProvider>
=======
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
>>>>>>> bcb5ada63ec90dd9f35c8900216e5b80edc2b02c
  );
}

/*
📖 อธิบาย App Component:

1. **Routing Setup:**
   - ใช้ React Router v6
   - 4 main pages: Profile, Edit Profile, Job, Resume
   - Default: Profile

2. **Wrapper Components:**
   - ProfilepublicWrapper = ให้ onNavigate prop
   - ProfileEditWrapper = ให้ onNavigate prop
   - ResumepageWrapper = ให้ onNavigate prop

3. **Navigation Flow:**
   - Profile → "Create Your Profile" → /edit-profile
   - Profile → "Download Resume" → /resume
   - Edit Profile → buttons → Profile/Resume
   - Resume → buttons → Profile/Edit

4. **Header Navigation:**
   - แสดง Header ด้านบน
   - Navigation ระหว่าง 3 sections
   - User menu ด้านขวา

5. **Pages:**
   - / → Profile (default)
   - /profile → Profilepublic
   - /edit-profile → ProfileEdit
   - /jobs → JobBrowse
   - /resume → Resumepage
*/