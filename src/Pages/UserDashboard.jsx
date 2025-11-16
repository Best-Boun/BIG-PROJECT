import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Access.css";

function UserDashboard({ handleLogout }) {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ⭐ ตั้งค่า Theme Dashboard
  useEffect(() => {
    document.body.classList.add("dashboard-page");
    return () => document.body.classList.remove("dashboard-page");
  }, []);

  // ⭐ โหลดข้อมูลผู้ใช้ (เร็วขึ้นแบบทันที)
  useEffect(() => {
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    // ❌ redirect ถ้าไม่มีสิทธิ์
    if (!role || !token || role !== "user") {
      navigate("/");
      return;
    }

    if (!currentUser?.username) {
      navigate("/");
      return;
    }

    // ---------------------------------------------------
    // ⭐ 1) ใช้ข้อมูล localStorage ก่อน → แสดงหน้าได้ทันที
    // ---------------------------------------------------
    setUserData(currentUser);
    setLoading(false);

    // ---------------------------------------------------
    // ⭐ 2) Fetch ข้อมูลจริงจาก Server ทีหลังแบบลับ ๆ
    // ---------------------------------------------------
    const fetchServerData = async () => {
      try {
        const res = await fetch(
          `http://localhost:4000/users?username=${currentUser.username}`
        );

        if (!res.ok) return;

        const data = await res.json();

        if (data.length > 0) {
          setUserData(data[0]); // อัปเดตข้อมูลใหม่ให้ user
        }
      } catch (err) {
        console.warn("Cannot fetch user data:", err);
      }
    };

    fetchServerData();
  }, [navigate]);

  // ⭐ Loading UI (จะเห็นแค่ครั้งเดียวตอนเปิดเว็บ)
  if (loading) {
    return (
      <div className="page-container center-content">
        <h3>⏳ กำลังโหลดข้อมูล...</h3>
      </div>
    );
  }

  return (
    <div className="user-dashboard-container">
      {/* ⭐ Sidebar */}
      <aside className="user-sidebar">
        <h2 className="sidebar-title">👤 User Panel</h2>
        <ul className="sidebar-menu">
          <li>🏠 Dashboard</li>
          <li>🧾 My Resume</li>
          <li>⚙️ Settings</li>
          <li className="logout" onClick={handleLogout}>
            🚪 Logout
          </li>
        </ul>
      </aside>

      {/* ⭐ Main */}
      <main className="user-main">
        <div className="header-box">
          <h2>📌 Welcome back, {userData.username} 👋</h2>
        </div>

        <div className="user-content-grid">

          {/* ⭐ Card 1 */}
          <div className="user-card profile-card">
            <h3>🧑‍💼 ข้อมูลส่วนตัว</h3>
            <p><b>ชื่อผู้ใช้:</b> {userData.username}</p>
            <p><b>อีเมล:</b> {userData.email || "—"}</p>
            <p><b>สิทธิ์:</b> {userData.role}</p>
          </div>

          {/* ⭐ Card 2 */}
          <div className="user-card">
            <h3>📅 กิจกรรมล่าสุด</h3>
            <ul>
              <li>เข้าสู่ระบบเมื่อ {new Date().toLocaleDateString()}</li>
              <li>อัปเดตข้อมูลล่าสุด —</li>
            </ul>
          </div>

          {/* ⭐ Card 3 */}
          <div className="user-card">
            <h3>💡 เคล็ดลับ SmartPersona</h3>
            <p>อัปโหลดเรซูเม่เพื่อรับคำแนะนำอัตโนมัติจาก AI!</p>
            <button className="btn btn-primary">📄 อัปโหลดเรซูเม่</button>
          </div>

        </div>
      </main>
    </div>
  );
}

export default UserDashboard;
