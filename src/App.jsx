import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import Header from './components/Header';
import Profilepublic from './pages/ProfilePublic/Profilepublic';
import JobBrowse from './pages/JobBrowse';
import Resumepage from './pages/Resumepage';
import ProfileEdit from './pages/ProfileEdit';
import Feed from "./Pages/Feed/Feed";
import { ProfileProvider } from './ProfileContext';
import './App.css';
import Login from "./pages/Login";
import Register from "./Pages/Register";
import Sidebar from "./components/Sidebar";
import ChartPage from "./pages/ChartPage";
import AdsManagement from "./Pages/AdsManagement";
import AdminManagement from "./Pages/AdminManagement";
import Landing from "./pages/Landing";
import Feature1 from "./components/Feature1";
import Feature2 from "./components/Feature2";
import Feature3 from "./components/Feature3";


// ============ WRAPPER COMPONENTS ============

// Wrapper for Profilepublic with navigation
function ProfilepublicWrapper() {
  const navigate = useNavigate();

  const handleNavigate = (page) => {
    if (page === 'edit') navigate('/edit-profile');
    if (page === 'resume') navigate('/resume');
  };

  return <Profilepublic onNavigate={handleNavigate} />;
}

// Wrapper for Resumepage with navigation
function ResumepageWrapper() {
  const navigate = useNavigate();

  const handleNavigate = (page) => {
    if (page === 'profile') navigate('/profile');
    if (page === 'edit') navigate('/edit-profile');
  };

  return <Resumepage onNavigate={handleNavigate} />;
}

// Wrapper for ProfileEdit with navigation
function ProfileEditWrapper() {
  const navigate = useNavigate();

  const handleNavigate = (page) => {
    if (page === 'profile') navigate('/profile');
    if (page === 'resume') navigate('/resume');
  };

  return <ProfileEdit onNavigate={handleNavigate} />;
}

// ============ APP CONTENT COMPONENT ============

function AppContent() {
  const [token, setToken] = useState("");
  const [role, setRole] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Mock user data
  const [user] = useState({
    name: 'Alex Johnson',
    profileImage: '👤',
    email: 'alex@example.com'
  });

  /* ============ LOAD TOKEN & ROLE FROM STORAGE ============ */
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

  /* ============ CHECK AUTH & REDIRECT ============ */
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
      if (window.location.pathname === "/" || window.location.pathname === "/register") {
        if (savedRole === "admin") navigate("/chart", { replace: true });
        else if (savedRole === "user") navigate("/feed", { replace: true });
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

  /* ============ NOT LOGGED IN - SHOW LOGIN/REGISTER ============ */
  if (!token) {
    return (
      <Routes>
        <Route path="/" element={<Login setToken={setToken} setRole={setRole} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  /* ============ ADMIN ROUTES ============ */
  if (role === "admin") {
    return (
      <div className="app admin-layout">
        <button className="toggle-btn" onClick={() => setIsOpen(!isOpen)}>
          ☰
        </button>
        <Sidebar
          className={isOpen ? "" : "hidden"}
          role={role}
          onLogout={handleLogout}
        />

        <main className="main">
          <Routes>
            <Route path="/chart" element={<ChartPage />} />
            <Route path="/ads" element={<AdsManagement />} />
            <Route path="/admin" element={<AdminManagement />} />
            <Route path="*" element={<Navigate to="/chart" replace />} />
          </Routes>
        </main>
      </div>
    );
  }

  /* ============ USER ROUTES (LOGGED IN) ============ */
  return (
    <ProfileProvider>
      <div className="app user-layout">
        {/* Main Content - No Header here, Feed has its own Header2 */}
        <main className="app-main">
          <Routes>
            {/* 📰 Feed Page - Default for users */}
            <Route path="/feed" element={<Feed user={user} onLogout={handleLogout} />} />

            {/* 👤 Profile Page */}
            <Route path="/profile" element={<ProfilepublicWrapper />} />

            {/* ✏️ Edit Profile Page */}
            <Route path="/edit-profile" element={<ProfileEditWrapper />} />

            {/* 💼 Job Page */}
            <Route path="/jobs" element={<JobBrowse />} />

            {/* 📄 Resume Page */}
            <Route path="/resume" element={<ResumepageWrapper />} />

            <Route path="/feature1" element={<Feature1 />} />
            <Route path="/feature2" element={<Feature2 />} />
            <Route path="/feature3" element={<Feature3 />} />

            {/* Default - Redirect to Feed */}
            <Route path="/" element={<Navigate to="/feed" replace />} />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/feed" replace />} />
          </Routes>
        </main>
      </div>
    </ProfileProvider>
    );
}

 




// ============ MAIN APP COMPONENT ============

export default function App() {
  return <AppContent />;
}

