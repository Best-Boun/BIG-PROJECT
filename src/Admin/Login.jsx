import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [popup, setPopup] = useState({ show: false, message: "" });

  const ADMIN_ACCOUNT = useMemo(() => ({ email: "admin@spu", password: "1" }), []);
  const FIX_USER = useMemo(() => ({ email: "user@spu", password: "1" }), []);

  useEffect(() => {
    const admins = JSON.parse(localStorage.getItem("adminUsers")) || [];
    if (!admins.find((a) => a.email === ADMIN_ACCOUNT.email)) {
      admins.push(ADMIN_ACCOUNT);
      localStorage.setItem("adminUsers", JSON.stringify(admins));
    }

    const users = JSON.parse(localStorage.getItem("normalUsers")) || [];
    if (!users.find((u) => u.email === FIX_USER.email)) {
      users.push(FIX_USER);
      localStorage.setItem("normalUsers", JSON.stringify(users));
    }
  }, [ADMIN_ACCOUNT, FIX_USER]);

  const showPopup = (msg) => {
    setPopup({ show: true, message: msg });
    setTimeout(() => setPopup({ show: false, message: "" }), 2000);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword)
      return showPopup("⚠️ Please fill in all fields.");
    if (password !== confirmPassword)
      return showPopup("❌ Passwords do not match.");

    const users = JSON.parse(localStorage.getItem("normalUsers")) || [];
    if (users.find((u) => u.email === email))
      return showPopup("⚠️ This email is already registered.");

    users.push({ email, password });
    localStorage.setItem("normalUsers", JSON.stringify(users));
    showPopup("✅ Registration successful!");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setTimeout(() => setIsLogin(true), 1200);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) return showPopup("⚠️ Please fill in all fields.");

    if (email === ADMIN_ACCOUNT.email && password === ADMIN_ACCOUNT.password) {
      localStorage.setItem("role", "admin");
      showPopup("👑 Welcome Admin!");
      return setTimeout(() => navigate("/ads"), 1000);
    }

    const users = JSON.parse(localStorage.getItem("normalUsers")) || [];
    const found = users.find((u) => u.email === email && u.password === password);
    if (!found) return showPopup("❌ Incorrect email or password.");

    localStorage.setItem("role", "user");
    showPopup("✨ Login successful!");
    setTimeout(() => navigate("/user-dashboard"), 1000);
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <h1 className="login-logo">
          Smart<span>Persona</span>
        </h1>

        <div className="login-wrapper">
          <form
            onSubmit={handleLogin}
            className={`login-form ${isLogin ? "active" : ""}`}
          >
            <h2>Sign In</h2>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
            />
            <button type="submit" className="login-btn">
              Sign In
            </button>
            <p>
              Don't have an account?{" "}
              <span onClick={() => setIsLogin(false)} className="login-link">
                Sign Up
              </span>
            </p>
          </form>

          <form
            onSubmit={handleRegister}
            className={`login-form ${!isLogin ? "active" : ""}`}
          >
            <h2>Sign Up</h2>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
            />
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="login-input"
            />
            <button type="submit" className="login-btn">
              Sign Up
            </button>
            <p>
              Already have an account?{" "}
              <span onClick={() => setIsLogin(true)} className="login-link">
                Sign In
              </span>
            </p>
          </form>
        </div>

        {popup.show && <div className="login-popup">{popup.message}</div>}
      </div>
    </div>
  );
};

export default Login;
