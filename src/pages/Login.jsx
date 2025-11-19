import React, { useRef, useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { verifyUser } from "../data/user";
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
    const username = userRef.current.value.trim();
    const password = passRef.current.value.trim();

    if (!username || !password) {
      setError("⚠️ กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
      animateError();
      return;
    }

    const user = await verifyUser(username, password);

    if (user) {
      animateSuccess();

      setTimeout(() => {
        localStorage.setItem("token", user.token);
        localStorage.setItem("role", user.role);
        localStorage.setItem(
          "currentUser",
          JSON.stringify({ username, role: user.role })
        );

        setToken(user.token);
        setRole(user.role);

        window.location.href =
          user.role === "admin" ? "/chart" : "/user-dashboard";
      }, 900);
    } else {
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

  /* Username typing animation */
  const onUserChange = () => {
    setTypingUser(true);

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);

    typingTimerRef.current = setTimeout(() => {
      setTypingUser(false);
    }, 700);
  };

  /* Password */
  const onPasswordFocus = () => setBlinkEye(true);
  const onPasswordBlur = () => setBlinkEye(false);

  const togglePassword = () => {
    setShowPassword((s) => !s);
    setRotateEye(true);
    setTimeout(() => setRotateEye(false), 350);
  };

  return (
    <div className="login-bg-animated">
      
      {/* Floating bubbles */}
      <div className="bubble b1" />
      <div className="bubble b2" />
      <div className="bubble b3" />
      <div className="bubble b4" />
      <div className="bubble b5" />
      <div className="bubble b6" />

      <div className={`login-card glow-frame ${shake ? "shake" : ""} ${success ? "success" : ""}`}>
        
        {/* Robot */}
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
                placeholder="Username"
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
                className={`bi ${showPassword ? "bi-eye" : "bi-eye-slash"} password-icon-right ${rotateEye ? "rotate" : ""}`}
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
