import React, { useState, useEffect } from "react";
import "./Login.css";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("seeker");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    document.body.classList.add("login-page");
    return () => document.body.classList.remove("login-page");
  }, []);

  const isValidGmail = (email) => /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !email || !password) {
      setMessage("⚠️ กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }
    if (!isValidGmail(email)) {
      setMessage("⚠️ ต้องเป็น @gmail.com เท่านั้น");
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: username, email, password, role }),
      });
      const result = await res.json();

      if (res.ok) {
        setMessage("✅ สมัครสมาชิกสำเร็จ");
        setTimeout(() => { window.location.href = "/feed"; }, 1200);
      } else {
        setMessage(result.message || "❌ สมัครสมาชิกไม่สำเร็จ");
      }
    } catch (error) {
      setMessage("❌ เกิดข้อผิดพลาดในการสมัครสมาชิก");
      console.error(error);
    }
  };

  return (
    <div className="auth-bg">
      {/* Toggle */}
      <div className="auth-toggle-wrap">
        <span
          className="auth-toggle-label"
          style={{ cursor: "pointer" }}
          onClick={() => (window.location.href = "/")}
        >
          LOG IN
        </span>
        <div
          className="auth-toggle-track"
          onClick={() => (window.location.href = "/")}
        >
          <div className="auth-toggle-thumb register">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
        </div>
        <span className="auth-toggle-label active">SIGN UP</span>
      </div>

      {/* Card */}
      <div className="auth-card">
        <h2 className="auth-card-title">Sign Up</h2>

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="auth-input-group">
            <i className="bi bi-person auth-icon" />
            <input
              type="text"
              placeholder="Your Full Name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
          </div>

          {/* Email */}
          <div className="auth-input-group">
            <i className="bi bi-at auth-icon" />
            <input
              type="email"
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="auth-input-group">
            <i className="bi bi-lock auth-icon" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Your Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="auth-eye-btn"
              onClick={() => setShowPassword((s) => !s)}
            >
              <i className={`bi ${showPassword ? "bi-eye" : "bi-eye-slash"}`} />
            </button>
          </div>

          {/* Role */}
          <div className="auth-section-label" style={{ marginTop: 4 }}>ฉันต้องการ</div>
          <div className="auth-role-wrap">
            {[
              {
                value: "seeker",
                svg: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><path d="M11 8v6M8 11h6"/></svg>,
                label: "Job Seeker",
                sub: "ฉันกำลังหางาน"
              },
              {
                value: "employer",
                svg: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>,
                label: "Employer",
                sub: "รับสมัครงาน"
              },
            ].map((opt) => (
              <div
                key={opt.value}
                className={`auth-role-btn ${role === opt.value ? "active" : ""}`}
                onClick={() => setRole(opt.value)}
              >
                <div style={{ display: "flex", justifyContent: "center"}}>
                  {React.cloneElement(opt.svg, {
                    stroke: role === opt.value ? "#0066ff" : "#888"
                  })}
                </div>
                <span className="role-label">{opt.label}</span>
                <span className="role-sub">{opt.sub}</span>
              </div>
            ))}
          </div>

          {/* Message */}
          {message && (
            <div className={message.includes("✅") ? "auth-success-msg" : "auth-error"}>
              {message}
            </div>
          )}

          <button type="submit" className="auth-submit-btn">
            SUBMIT
          </button>
        </form>

        <p className="auth-extra" style={{ marginTop: 16 }}>
          มีบัญชีแล้ว?{" "}
          <span onClick={() => (window.location.href = "/")}>เข้าสู่ระบบ</span>
        </p>
      </div>
    </div>
  );
}

export default Register;