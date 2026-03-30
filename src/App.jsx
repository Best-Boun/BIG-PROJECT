import React, { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import Header2 from "./components/Header2";
import Profilepublic from "./pages/ProfilePublic/Profilepublic";
import JobBrowse from "./pages/JobBrowse";
import JobDetail from "./pages/JobDetail";
import JobManage from "./pages/JobManage";
import ResumeEditor from "./pages/ResumeEditor";
import ProfileEdit from "./pages/ProfileEdit";
import Feed from "./pages/Feed/Feed";
import "./App.css";
import Login from "./pages/Login";
import Register from "./Pages/Register";
import ChartPage from "./pages/ChartPage";
import AdsManagement from "./pages/AdsManagement";
import AdminManagement from "./Pages/AdminManagement";
import Landing from "./pages/Landing";
import Feature1 from "./components/Feature1";
import ManageApplicants from "./pages/ManageApplicants";
import ApplicantProfile from "./pages/ApplicantProfile";
import Applications from "./pages/Applications";
import Unauthorized from "./pages/Unauthorized";
import ProtectedRoute from "./components/ProtectedRoute";
import CompanyProfile from "./pages/CompanyProfile/CompanyProfile";
import CompanyPublic from "./pages/CompanyPublic/CompanyPublic";


function ProfilepublicWrapper() {
  const navigate = useNavigate();

  const handleNavigate = (page) => {
    if (page === "edit") navigate("/edit-profile");
    if (page === "resume") navigate("/resume");
  };

  return <Profilepublic onNavigate={handleNavigate} />;
}

function ProfileEditWrapper() {
  const navigate = useNavigate();

  const handleNavigate = (page) => {
    if (page === "profile") navigate("/profile");
    if (page === "resume") navigate("/resume");
  };

  return <ProfileEdit onNavigate={handleNavigate} />;
}

function ResumeEditorWrapper() {
  const userId = localStorage.getItem('userID');

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const res = await fetch(`http://localhost:3000/api/profiles?userId=${userId}`);
      const data = await res.json();
      return Array.isArray(data) ? data[0] : data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) return <div className="p-5 text-center">Loading...</div>;

  const resumeData = profile ? {
    name: profile.name || '',
    title: profile.title || '',
    email: profile.email || '',
    phone: profile.phone || '',
    location: profile.location || '',
    summary: profile.summary || '',
    photo: profile.profileImage || '',
    employment: (profile.experience || []).map(exp => ({
      position: exp.role || exp.title || '',
      company: exp.company || '',
      startDate: exp.startDate || '',
      endDate: exp.endDate || '',
      description: exp.description || '',
    })),
    education: (profile.education || []).map(edu => ({
      degree: edu.degree || '',
      school: edu.institution || edu.school || '',
      startDate: edu.startDate || '',
      endDate: edu.endDate || '',
      grade: edu.grade || '',
    })),
    skills: {
      languages: (profile.skills || []).filter(s => s.category === 'Languages').map(s => s.name).join(', '),
      frontend: (profile.skills || []).filter(s => s.category === 'Frontend').map(s => s.name).join(', '),
      backend: (profile.skills || []).filter(s => s.category === 'Backend').map(s => s.name).join(', '),
      databases: (profile.skills || []).filter(s => s.category === 'Database').map(s => s.name).join(', '),
      devops: (profile.skills || []).filter(s => s.category === 'DevOps & Cloud').map(s => s.name).join(', '),
    },
    languages: (profile.languages || []).map(lang => ({
      name: lang.language || lang.name || '',
      level: lang.level || '',
    })),
    hobbies: [],
    certifications: (profile.certifications || []).map(cert => ({
      name: cert.name || '',
      issuer: cert.issuer || '',
      date: cert.date || '',
    })),
  } : {};

  return <ResumeEditor initialData={resumeData} />;
}

function AppContent() {
  const [token, setToken] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();


  useEffect(() => {
    const savedRole = localStorage.getItem("role");
    const savedToken = localStorage.getItem("token");

    if (savedRole && savedToken) {
      setRole(savedRole);
      setToken(savedToken);
    }

    setLoading(false);
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
    <div className="app user-layout">
        <Header2 role={role} onLogout={handleLogout} />

        <main className="app-main">
          <Routes>
            <Route
              path="/feed"
              element={<Feed onLogout={handleLogout} />}
            />

            <Route path="/profile" element={<ProfilepublicWrapper />} />
            <Route path="/edit-profile" element={<ProfileEditWrapper />} />

            <Route path="/jobs"        element={<JobBrowse mode="apply" />} />
            <Route path="/browse-jobs" element={<JobBrowse mode="view"  />} />

            <Route path="/jobs/manage" element={
              <ProtectedRoute allowedRole="employer">
                <JobManage />
              </ProtectedRoute>
            } />
            <Route path="/jobs/:jobId/applicants" element={
              <ProtectedRoute allowedRole="employer">
                <ManageApplicants />
              </ProtectedRoute>
            } />
            <Route path="/manage-jobs/:jobId/applicants" element={
              <ProtectedRoute allowedRole="employer">
                <ManageApplicants />
              </ProtectedRoute>
            } />
            <Route path="/applicant/:userId" element={
              <ProtectedRoute allowedRole="employer">
                <ApplicantProfile />
              </ProtectedRoute>
            } />

            <Route path="/jobs/:id" element={<JobDetail role={role} />} />

            <Route path="/applications" element={
              <ProtectedRoute allowedRole="seeker">
                <Applications />
              </ProtectedRoute>
            } />

            <Route path="/company-profile" element={
              <ProtectedRoute allowedRole="employer">
                <CompanyProfile />
              </ProtectedRoute>
            } />
            <Route path="/company/:userId" element={<CompanyPublic />} />

            <Route path="/unauthorized" element={<Unauthorized />} />

            <Route path="/resume" element={<ResumeEditorWrapper />} />

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
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      refetchOnMount: 'always',
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
