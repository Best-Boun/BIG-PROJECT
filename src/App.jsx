import React, { useState, useEffect, useContext } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import Header2 from "./components/Header2";
import Profilepublic from "./pages/ProfilePublic/Profilepublic";
import JobBrowse from "./pages/JobBrowse";
import JobDetail from "./pages/JobDetail";
import ResumeEditor from "./pages/ResumeEditor";
import ProfileEdit from "./pages/ProfileEdit";
import Feed from "./pages/Feed/Feed";
import { ProfileProvider, ProfileContext } from "./ProfileContext";
import "./App.css";
import Login from "./pages/Login";
import Register from "./Pages/Register";
import ChartPage from "./pages/ChartPage";
import AdsManagement from "./pages/AdsManagement";
import AdminManagement from "./Pages/AdminManagement";
import Landing from "./pages/Landing";
import Feature1 from "./components/Feature1";

function ProfilepublicWrapper() {
  const navigate = useNavigate();

  const handleNavigate = (page) => {
    if (page === "edit") navigate("/edit-profile");
    if (page === "resume") navigate("/resume");
  };

  return <Profilepublic onNavigate={handleNavigate} />;
}

function ResumeEditorWrapper({ user, onLogout }) {
  const context = useContext(ProfileContext);
  const profileData = context?.profileData || {};

  const resumeFromProfile = {
    ...profileData,
    name: profileData.name || "",
    title: profileData.title || "",
    email: profileData.email || "",
    phone: profileData.phone || "",
    location: profileData.location || "",
    summary: profileData.summary || "",
    profile: profileData.profile || "",
    employment: profileData.experience || [],
    education: profileData.education || [],
    skills: profileData.skills || [],
    languages: profileData.languages || [],
    hobbies: profileData.hobbies || [],
    certificates: profileData.certificates || [],
    references: profileData.references || "",
    achievements: profileData.achievements || [],
    photo: profileData.photo || "",
  };

  return (
    <ResumeEditor
      initialData={resumeFromProfile}
      user={user}
      onLogout={onLogout}
    />
  );
}

function ProfileEditWrapper() {
  const navigate = useNavigate();

  const handleNavigate = (page) => {
    if (page === "profile") navigate("/profile");
    if (page === "resume") navigate("/resume");
  };

  return <ProfileEdit onNavigate={handleNavigate} />;
}

function AppContent() {
  const [token, setToken] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const [user] = useState({
    name: "Alex Johnson",
    profileImage: "👤",
    email: "alex@example.com",
  });

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
        navigate("/feed", { replace: true });
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

  if (!token) {
    return (
      <Routes>
        <Route
          path="/"
          element={<Login setToken={setToken} setRole={setRole} />}
        />
        <Route path="/register" element={<Register />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <ProfileProvider>
      <div className="app user-layout">
        <Header2 user={user} role={role} onLogout={handleLogout} />

        <main className="app-main">
          <Routes>
            <Route
              path="/feed"
              element={<Feed user={user} onLogout={handleLogout} />}
            />

            <Route path="/profile" element={<ProfilepublicWrapper />} />
            <Route path="/edit-profile" element={<ProfileEditWrapper />} />

            <Route path="/jobs" element={<JobBrowse />} />
            <Route path="/jobs/:id" element={<JobDetail />} />

            <Route
              path="/resume"
              element={
                <ResumeEditorWrapper user={user} onLogout={handleLogout} />
              }
            />

            <Route path="/feature1" element={<Feature1 />} />

            {role === "admin" && (
              <>
                <Route path="/chart" element={<ChartPage />} />
                <Route path="/ads" element={<AdsManagement />} />
                <Route path="/admin" element={<AdminManagement />} />
              </>
            )}

            <Route path="/" element={<Navigate to="/feed" replace />} />
            <Route path="*" element={<Navigate to="/feed" replace />} />
          </Routes>
        </main>
      </div>
    </ProfileProvider>
  );
}

export default function App() {
  return <AppContent />;
}
