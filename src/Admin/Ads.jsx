import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Access.css";

// หน้าที่: แสดงและจัดการโฆษณา (เพิ่ม/ลบ)
// Prototype จำลอง ไม่มี database จริง ใช้ state เก็บ

const Ads = () => {
  const navigate = useNavigate();
  const [ads, setAds] = useState([
    { id: 1, name: "Smart Persona Promotion", platform: "Facebook" },
    { id: 2, name: "AI Profile Boost", platform: "Instagram" },
  ]);

  // เพิ่มโฆษณาใหม่
  const addAd = () => {
    const newAd = {
      id: Date.now(),
      name: "New Ad Campaign",
      platform: "Twitter",
    };
    setAds([...ads, newAd]);
  };

  // ลบโฆษณา
  const deleteAd = (id) => {
    setAds(ads.filter((ad) => ad.id !== id));
  };

  // ออกจากระบบ
  const logout = () => {
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <div  className="button-ads" >
      <h2>จัดการโฆษณา</h2>
      <button onClick={addAd} className="btn-plus">+ เพิ่มโฆษณา</button>
      
      <button onClick={logout} className="btn-logout" style={{ marginLeft: "10px" }}>  ออกจากระบบ  </button>
    
      
      <table border="1" style={{ margin: "20px auto" }}>
        <thead>
          <tr>
            <th>ชื่อโฆษณา</th>
            <th>แพลตฟอร์ม</th>
            <th>ลบ</th>
          </tr>
        </thead>
        <tbody>
          {ads.map((ad) => (
            <tr key={ad.id}>
              <td>{ad.name}</td>
              <td>{ad.platform}</td>
              <td>
                <button onClick={() => deleteAd(ad.id)} className="btn-delete" >ลบ</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Ads;
