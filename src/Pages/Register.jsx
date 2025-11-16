import React, { useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { registerUser } from "../data/user";
import "./Login.css";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  // 🟣 เพิ่มคลาสเฉพาะหน้านี้เพื่อ theme เดียวกับ login
  useEffect(() => {
    document.body.classList.add("login-page");
    return () => document.body.classList.remove("login-page");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !email || !password) {
      setMessage("⚠️ กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    const result = await registerUser(username, email, password);
    setMessage(result.message);

    if (result.success) {
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    }
  };

  return (
    <div className="login-bg-animated">
      <div className="login-card luxury">
        <h2 className="login-logo">
          <span>Smart</span>Persona
        </h2>

        <Form onSubmit={handleSubmit} className="login-form">
          <Form.Group className="mb-3">
            <Form.Label>ชื่อผู้ใช้</Form.Label>
            <Form.Control
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
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>รหัสผ่าน</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
          </Form.Group>

          {message && (
            <p
              style={{
                color: message.includes("✅") ? "#4ef037" : "#ff7070",
                marginTop: "10px",
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
