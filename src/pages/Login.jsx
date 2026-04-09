import React, { useRef, useState, useEffect } from "react";
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
  const [_showUsers, setShowUsers] = useState(false);
  const [_savedUsers, setSavedUsers] = useState([]);

  useEffect(() => {
    document.body.classList.add("login-page");
    return () => document.body.classList.remove("login-page");
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
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
        email,
        password,
      });

      const user = res.data.user;
      const token = res.data.token;

      const existingUsers =
        JSON.parse(localStorage.getItem("loginUsers")) || [];
      const alreadyExists = existingUsers.find((u) => u.id === user.id);
      const updatedUsers = alreadyExists
        ? [user, ...existingUsers.filter((u) => u.id !== user.id)]
        : [user, ...existingUsers];
      localStorage.setItem(
        "loginUsers",
        JSON.stringify(updatedUsers.slice(0, 5)),
      );

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

      setTimeout(() => {
        localStorage.setItem("token", token);
        localStorage.setItem("role", user.role || "user");
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
        window.location.href = "/feed";
      }, 900);
    } catch (err) {
      const data = err.response?.data;
      if (data?.banned) {
        setIsBannedError(true);
        setError("🚫 บัญชีของคุณถูกแบนโดยผู้ดูแลระบบ กรุณาติดต่อผู้ดูแลระบบ");
      } else {
        setIsBannedError(false);
        setError("❌ ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      }

      animateError(); // ✅ ต้องอยู่ใน catch
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
    typingTimerRef.current = setTimeout(() => setTypingUser(false), 700);
  };

  const togglePassword = () => {
    setShowPassword((s) => !s);
    setRotateEye(true);
    setTimeout(() => setRotateEye(false), 350);
  };

  return (
    <div className="auth-bg">
      {/* Toggle */}
      <div className="auth-toggle-wrap">
        <span className="auth-toggle-label active">LOG IN</span>
        <div
          className="auth-toggle-track"
          onClick={() => {
            window.location.href = "/register";
          }}
        >
          <div className="auth-toggle-thumb login">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
        </div>
        <span
          className="auth-toggle-label"
          style={{ cursor: "pointer" }}
          onClick={() => {
            window.location.href = "/register";
          }}
        >
          SIGN UP
        </span>
      </div>

      {/* Card */}
      <div
        className={`auth-card ${shake ? "shake" : ""} ${success ? "success" : ""}`}
      >
        {/* RobotCoder */}
        <div className="auth-robot-wrap">
          <RobotCoder
            isUsernameTyping={typingUser}
            isPasswordFocused={blinkEye}
            isPasswordVisible={showPassword}
            isError={shake}
            isSuccess={success}
          />
        </div>

        <h2 className="auth-card-title">Log In</h2>

        <form onSubmit={handleLogin}>
          {/* Email */}
          <div
            className="auth-input-group"
            onClick={() => {
              const users =
                JSON.parse(localStorage.getItem("loginUsers")) || [];
              setSavedUsers(users);
              setShowUsers(true);
            }}
          >
            <i className="bi bi-envelope auth-icon" />
            <input
              type="text"
              placeholder="Your Email"
              ref={userRef}
              onChange={onUserChange}
              onBlur={() => setTimeout(() => setShowUsers(false), 200)}
            />
          </div>

          {/* Password */}
          <div className="auth-input-group">
            <i className="bi bi-lock auth-icon" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Your Password"
              ref={passRef}
              onFocus={() => setBlinkEye(true)}
              onBlur={() => setBlinkEye(false)}
            />
            <button
              type="button"
              className="auth-eye-btn"
              onClick={togglePassword}
            >
              <i
                className={`bi ${showPassword ? "bi-eye" : "bi-eye-slash"} ${rotateEye ? "rotate" : ""}`}
              />
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className={`auth-error ${isBannedError ? "banned" : ""}`}>
              {error}
            </div>
          )}

          <button type="submit" className="auth-submit-btn">
            SUBMIT
          </button>
        </form>

        <p className="auth-extra" style={{ marginTop: 16 }}>
          Forgot your password?
        </p>
      </div>
    </div>
  );
}

export default Login;