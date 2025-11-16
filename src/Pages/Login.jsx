import React, { useRef, useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { verifyUser } from "../data/user";
import "./Login.css";

function Login({ setToken, setRole }) {
  const userRef = useRef();
  const passRef = useRef();
  const [error, setError] = useState("");

  // 🟣 Theme login page
  useEffect(() => {
    document.body.classList.add("login-page");
    return () => document.body.classList.remove("login-page");
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    const username = userRef.current.value.trim();
    const password = passRef.current.value.trim();

    if (!username || !password) {
      setError("⚠️ กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
      return;
    }

    const user = await verifyUser(username, password);

    if (user) {
      // เก็บค่า
      localStorage.setItem("token", user.token);
      localStorage.setItem("role", user.role);
      localStorage.setItem(
        "currentUser",
        JSON.stringify({ username, role: user.role })
      );

      setToken(user.token);
      setRole(user.role);

      // เด้งตาม role
      if (user.role === "admin") {
        window.location.href = "/chart";
      } else {
        window.location.href = "/user-dashboard";
      }
    } else {
      setError("❌ ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
    }
  };

  return (
    <div className="login-bg-animated">
      <div className="login-card luxury fade-in">
        <h2 className="login-logo">
          <span className="sp-blue">Smart</span>
          <span className="sp-black">Persona</span>
        </h2>

        <p className="login-subtitle">เข้าสู่ระบบเพื่อใช้งานแพลตฟอร์ม</p>

        <Form onSubmit={handleLogin} className="login-form">
          <Form.Group className="mb-3">
            <Form.Label>ชื่อผู้ใช้</Form.Label>
            <Form.Control
              type="text"
              placeholder="Username"
              ref={userRef}
              autoFocus
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>รหัสผ่าน</Form.Label>
            <Form.Control type="password" placeholder="Password" ref={passRef} />
          </Form.Group>

          {error && <p className="login-error">{error}</p>}

          <Button className="login-btn glow" type="submit">
            เข้าสู่ระบบ
          </Button>

          <div className="divider">หรือ</div>

          <Button
            className="login-btn secondary"
            type="button"
            onClick={() => (window.location.href = "/register")}
          >
            สมัครสมาชิกใหม่
          </Button>
        </Form>
      </div>
    </div>
  );
}

export default Login;
