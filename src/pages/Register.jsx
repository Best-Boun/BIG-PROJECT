// src/pages/Register.jsx
import React, { useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import "./Login.css";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("seeker");
  const [message, setMessage] = useState("");

  useEffect(() => {
    document.body.classList.add("login-page");
    return () => document.body.classList.remove("login-page");
  }, []);

  // ตรวจสอบ Gmail เท่านั้น
  const isValidGmail = (email) => {
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    return gmailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !email || !password) {
      setMessage("⚠️ กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    if (!isValidGmail(email)) {
      setMessage("⚠️ กรุณากรอกอีเมลให้ถูกต้อง และต้องเป็น @gmail.com เท่านั้น");
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
    <div className="login-bg-animated">
      <div className="login-card glow-frame">
        <h2 className="login-logo">
          <span>Smart</span>Persona
        </h2>

        <Form onSubmit={handleSubmit} className="login-form">
          <Form.Group className="mb-3">
            <Form.Label>ชื่อผู้ใช้</Form.Label>
            <Form.Control
              className="animated-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              autoFocus
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>อีเมล</Form.Label>
            <Form.Control
              className="animated-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>รหัสผ่าน</Form.Label>
            <Form.Control
              className="animated-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
          </Form.Group>

          {/* Role Selector */}
          <Form.Group className="mb-3">
            <Form.Label style={{ color: "#e3d0ff" }}>ฉันต้องการ</Form.Label>
            <div style={{ display: "flex", gap: "10px" }}>
              {[
                { value: "seeker",   icon: "🔍", label: "Job Seeker",  sub: "ฉันกำลังหางาน" },
                { value: "employer", icon: "🏢", label: "Employer",    sub: "ฉันต้องการรับสมัครงาน" },
              ].map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => setRole(opt.value)}
                  style={{
                    flex: 1,
                    padding: "12px 8px",
                    borderRadius: "12px",
                    border: role === opt.value
                      ? "2px solid #ff4dff"
                      : "2px solid rgba(255,255,255,0.2)",
                    background: role === opt.value
                      ? "rgba(255,77,255,0.18)"
                      : "rgba(255,255,255,0.08)",
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "0.2s ease",
                    color: "#fff",
                  }}
                >
                  <div style={{ fontSize: "22px", marginBottom: "4px" }}>{opt.icon}</div>
                  <div style={{ fontWeight: 600, fontSize: "13px" }}>{opt.label}</div>
                  <div style={{ fontSize: "11px", opacity: 0.75, marginTop: "2px" }}>{opt.sub}</div>
                </div>
              ))}
            </div>
          </Form.Group>

          {message && (
            <p
              style={{
                color: message.includes("✅") ? "#4ef037" : "#ff7070",
                marginTop: "10px",
                fontWeight: "500",
              }}
            >
              {message}
            </p>
          )}

          <Button className="login-btn glow" type="submit">
            สมัครสมาชิก
          </Button>

          <Button
            className="login-btn secondary"
            type="button"
            onClick={() => (window.location.href = "/")}
          >
            🔙 กลับเข้าสู่ระบบ
          </Button>
        </Form>
      </div>
    </div>
  );
}

export default Register;
