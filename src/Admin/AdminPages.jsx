import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Access.css";

const AdminPages = () => {
  const navigate = useNavigate();

  const [adminUsers, setAdminUsers] = useState([]);
  const [normalUsers, setNormalUsers] = useState([]);
  const [popup, setPopup] = useState({ show: false, message: "" });

  // ✅ โหลดข้อมูลจาก localStorage (ครั้งแรก + เมื่อมีการเปลี่ยนแปลง)
  useEffect(() => {
    const updateData = () => {
      const savedAdmins = JSON.parse(localStorage.getItem("adminUsers")) || [];
      const savedUsers = JSON.parse(localStorage.getItem("normalUsers")) || [];
      setAdminUsers(savedAdmins);
      setNormalUsers(savedUsers);
    };

    // โหลดข้อมูลครั้งแรก
    updateData();

    // ✅ Event Listener: อัปเดตอัตโนมัติเมื่อ localStorage เปลี่ยน
    window.addEventListener("storage", updateData);

    // ✅ Cleanup เมื่อออกจากหน้า
    return () => window.removeEventListener("storage", updateData);
  }, []);

  // ✅ ลบแอดมิน
  const deleteAdmin = (email) => {
    const updated = adminUsers.filter((u) => u.email !== email);
    setAdminUsers(updated);
    localStorage.setItem("adminUsers", JSON.stringify(updated));
    showPopup(`❌ ลบแอดมิน: ${email}`);
  };

  // ✅ ลบ user
  const deleteNormal = (email) => {
    const updated = normalUsers.filter((u) => u.email !== email);
    setNormalUsers(updated);
    localStorage.setItem("normalUsers", JSON.stringify(updated));
    showPopup(`❌ ลบผู้ใช้: ${email}`);
  };

  // ✅ popup แจ้งเตือน
  const showPopup = (message) => {
    setPopup({ show: true, message });
    setTimeout(() => setPopup({ show: false, message: "" }), 2000);
  };

  // ✅ logout
  const logout = () => {
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <div className="page-container">
      {/* ปุ่มย้อนกลับ */}
      <button
        className="btn btn-back"
        onClick={() => navigate(-1)}
        style={{ marginBottom: "10px" }}
      >
        ◀ ย้อนกลับ
      </button>

      <h2>⚙️ การจัดการระบบ (Admin Setting)</h2>

      {/* ✅ รายชื่อแอดมิน */}
      <h3>🧑‍💼 รายชื่อแอดมิน</h3>
      {adminUsers.length === 0 ? (
        <p>ยังไม่มีแอดมิน</p>
      ) : (
        <ul>
          {adminUsers.map((u) => (
            <li key={u.email}>
              {u.email}
              <button
                className="btn btn-delete"
                onClick={() => deleteAdmin(u.email)}
                style={{ marginLeft: "10px" }}
              >
                ลบ
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* ✅ รายชื่อผู้ใช้ทั่วไป */}
      <h3 style={{ marginTop: "20px" }}>👤 ผู้ใช้ทั่วไป</h3>
      {normalUsers.length === 0 ? (
        <p>ยังไม่มีผู้ใช้ทั่วไป</p>
      ) : (
        <ul>
          {normalUsers.map((u) => (
            <li key={u.email}>
              {u.email}
              <button
                className="btn btn-delete"
                onClick={() => deleteNormal(u.email)}
                style={{ marginLeft: "10px" }}
              >
                ลบ
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* ปุ่มออกจากระบบ */}
      <button
        onClick={logout}
        className="btn btn-logout"
        style={{ marginTop: "30px" }}
      >
        ออกจากระบบ
      </button>

      {/* Popup */}
      {popup.show && <div className="popup-message">{popup.message}</div>}
    </div>
  );
};

export default AdminPages;
