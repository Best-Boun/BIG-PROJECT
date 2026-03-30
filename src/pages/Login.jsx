import React, { useRef, useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import axios from "axios";
import "./Login.css";

import RobotCoder from "../components/RobotCoder";

function Login({ setToken, setRole }) {
  const userRef = useRef();
  const passRef = useRef();

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);

  const [blinkEye, setBlinkEye] = useState(false);
  const [rotateEye, setRotateEye] = useState(false);
  const [typingUser, setTypingUser] = useState(false);

  const typingTimerRef = useRef(null);

  useEffect(() => {
    document.body.classList.add("login-page");
    return () => document.body.classList.remove("login-page");
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const email = userRef.current.value.trim();
    const password = passRef.current.value.trim();

    if (!email || !password) {
      setError("⚠️ กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
      animateError();
      return;
    }

    try {
      const res = await axios.post("http://localhost:3000/api/auth/login", {
        email: email,
        password: password,
      });

      const user = res.data.user;
      const token = res.data.token;

      animateSuccess();

      setTimeout(() => {
        // save token
        localStorage.setItem("token", token);

        // save role
        localStorage.setItem("role", user.role || "user");

        // save user object
        localStorage.setItem("currentUser", JSON.stringify(user));

        // save user สำหรับ feed (สำคัญ)
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: user.id,
            name: user.name,
            role: user.role || "user",
            profileImage: "/default-avatar.png",
          }),
        );

        // save user id
        localStorage.setItem("userID", user.id.toString());

        // save user name
        localStorage.setItem("userName", user.name);

        if (setToken) setToken(token);
        if (setRole) setRole(user.role || "user");

        // redirect by role
        window.location.href = "/feed";
      }, 900);
    } catch (err) {
      setError("❌ ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      animateError();
    }
  };

  const animateError = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const animateSuccess = () => {
    setSuccess(true);
    setTimeout(() => setSuccess(false), 900);
  };

  const onUserChange = () => {
    setTypingUser(true);

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);

    typingTimerRef.current = setTimeout(() => {
      setTypingUser(false);
    }, 700);
  };

  const onPasswordFocus = () => setBlinkEye(true);
  const onPasswordBlur = () => setBlinkEye(false);

  const togglePassword = () => {
    setShowPassword((s) => !s);
    setRotateEye(true);
    setTimeout(() => setRotateEye(false), 350);
  };

  return (
    <div className="login-bg-animated">
      <div className="bubble b1" />
      <div className="bubble b2" />
      <div className="bubble b3" />
      <div className="bubble b4" />
      <div className="bubble b5" />
      <div className="bubble b6" />

      <div
        className={`login-card glow-frame ${shake ? "shake" : ""} ${
          success ? "success" : ""
        }`}
      >
        <RobotCoder
          isUsernameTyping={typingUser}
          isPasswordFocused={blinkEye}
          isPasswordVisible={showPassword}
          isError={shake}
          isSuccess={success}
        />

        <h2 className="login-logo">
          <span className="sp-blue">Smart</span>
          <span className="sp-black">Persona</span>
        </h2>

        <p className="subtitle">Sign in to your account</p>

        <Form onSubmit={handleLogin} className="login-form">
          <Form.Group className="mb-3">
            <div className="input-with-icon">
              <i className="bi bi-envelope" />
              <Form.Control
                type="text"
                placeholder="Email"
                ref={userRef}
                className="animated-input"
                onChange={onUserChange}
              />
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <div className={`password-wrapper ${blinkEye ? "blink" : ""}`}>
              <i className="bi bi-lock password-icon-left" />

              <Form.Control
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                ref={passRef}
                className="password-input animated-input"
                onFocus={onPasswordFocus}
                onBlur={onPasswordBlur}
              />

              <i
                className={`bi ${
                  showPassword ? "bi-eye" : "bi-eye-slash"
                } password-icon-right ${rotateEye ? "rotate" : ""}`}
                onClick={togglePassword}
              />
            </div>
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
