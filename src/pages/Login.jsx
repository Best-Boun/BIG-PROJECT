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
  const [isBannedError, setIsBannedError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);

  const [blinkEye, setBlinkEye] = useState(false);
  const [rotateEye, setRotateEye] = useState(false);
  const [typingUser, setTypingUser] = useState(false);

  const typingTimerRef = useRef(null);

  // 🔥 dropdown
const [_showUsers, setShowUsers] = useState(false);
const [_savedUsers, setSavedUsers] = useState([]);

  useEffect(() => {
    document.body.classList.add("login-page");

    return () => document.body.classList.remove("login-page");
  }, []);

const handleLogin = async (e) => {
  e.preventDefault();
  console.log("AXIOS:", axios); // 🔥 ใส่ตรงนี้
  setError("");
  setIsBannedError(false);

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

    // 🔥 save login history
    const existingUsers = JSON.parse(localStorage.getItem("loginUsers")) || [];

    const alreadyExists = existingUsers.find((u) => u.id === user.id);

    let updatedUsers;

    if (alreadyExists) {
      updatedUsers = [user, ...existingUsers.filter((u) => u.id !== user.id)];
    } else {
      updatedUsers = [user, ...existingUsers];
    }

    localStorage.setItem(
      "loginUsers",
      JSON.stringify(updatedUsers.slice(0, 5)),
    );

    animateSuccess();

    setTimeout(() => {
      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role || "user");

      localStorage.setItem(
        "user",
        JSON.stringify({
          id: user.id,
          name: user.name,
          role: user.role,
          profileImage: user.profileImage || null,
        }),
      );

      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage || null,
        }),
      );

      localStorage.setItem("userID", user.id.toString());
      localStorage.setItem("userId", user.id.toString());
      localStorage.setItem("userName", user.name);

      if (setToken) setToken(token);
      if (setRole) setRole(user.role || "user");

      // redirect by role
      window.location.href = "/feed";
    }, 900);
  } catch (err) {
    const data = err.response?.data;
    if (data?.banned) {
      setIsBannedError(true);
      setError(
        "🚫 บัญชีของคุณถูกแบนโดยผู้ดูแลระบบ ไม่สามารถเข้าใช้งานได้ กรุณาติดต่อผู้ดูแลระบบ",
      );
    } else {
      setIsBannedError(false);
      setError("❌ ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
    }
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

        <form className="login-form" onSubmit={handleLogin}>
          {/* EMAIL */}
          <div className="mb-3" style={{ position: "relative" }}>
            <div className="input-with-icon">
              <i className="bi bi-envelope" />
              <input
                type="text"
                placeholder="Email หรือ Username"
                ref={userRef}
                className="form-control animated-input"
                onChange={onUserChange}
                onFocus={() => {
                  const users =
                    JSON.parse(localStorage.getItem("loginUsers")) || [];
                  console.log("🔥 โหลดใหม่:", users);

                  setSavedUsers(users);
                  setShowUsers(true);
                }}
                onBlur={() => {
                  setTimeout(() => setShowUsers(false), 200);
                }}
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div className="mb-3" style={{ position: "relative" }}>
            <div className={`password-wrapper ${blinkEye ? "blink" : ""}`}>
              <i className="bi bi-lock password-icon-left" />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                ref={passRef}
                className="form-control password-input animated-input"
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
          </div>

          {/* ERROR */}
          {error && (
            <div
              className={`login-error-box ${isBannedError ? "banned-error" : ""}`}
            >
              <p className="login-error">{error}</p>
            </div>
          )}

          {/* LOGIN BUTTON */}
          <button className="login-btn glow" type="submit">
            เข้าสู่ระบบ
          </button>
        </form>

        <div className="divider">หรือ</div>

        <Button
          className="login-btn secondary"
          type="button"
          onClick={() => (window.location.href = "/register")}
        >
          สมัครสมาชิกใหม่
        </Button>
      </div>
    </div>
  );
}

export default Login;
