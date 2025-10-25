import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Access.css";

const AccessControl = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // จำลองระบบ login
    if (email === "san@admin.com" && password === "san") {
      localStorage.setItem("role", "admin");
      alert("เข้าสู่ระบบสำเร็จ!");
      navigate("/ads");
    } else {
      alert("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>เข้าสู่ระบบผู้ดูแลระบบ</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="อีเมล"
          onChange={(e) => setEmail(e.target.value)}
        />
        <br />
        <input
          type="password"
          placeholder="รหัสผ่าน"
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <button type="submit">เข้าสู่ระบบ</button>
      </form>
    </div>
  );
};

export default AccessControl;
