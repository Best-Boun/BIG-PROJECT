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