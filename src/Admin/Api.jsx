// import React, { useEffect, useState, useCallback } from "react";
// import "./Access.css";
// import { mockProfiles } from "../mockData";

// const Api = () => {
//   const [data, setData] = useState([]);
//   const [title, setTitle] = useState("");
//   const [editingId, setEditingId] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [popup, setPopup] = useState({ show: false, message: "" });

//   // ✅ popup แจ้งเตือน
//   const showPopup = useCallback((message) => {
//     setPopup({ show: true, message });
//     setTimeout(() => setPopup({ show: false, message: "" }), 1500);
//   }, []);

//   // ✅ โหลดข้อมูลจาก mockData
//   const fetchData = useCallback(async () => {
//     try {
//       // จำลอง delay เหมือน fetch จริง
//       setLoading(true);
//       await new Promise((res) => setTimeout(res, 300));
//       setData(mockProfiles);
//     } catch {
//       showPopup("❌ โหลดข้อมูลไม่สำเร็จ");
//     } finally {
//       setLoading(false);
//     }
//   }, [showPopup]);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   // ✅ เพิ่มข้อมูล
//   const addPost = () => {
//     if (!title.trim()) return showPopup("⚠️ กรุณากรอกชื่อเรื่อง");
//     const newItem = { id: Date.now(), title };
//     setData([...data, newItem]);
//     setTitle("");
//     showPopup("✅ เพิ่มข้อมูลสำเร็จ!");
//   };

//   // ✅ ลบข้อมูล
//   const deletePost = (id) => {
//     setData(data.filter((item) => item.id !== id));
//     showPopup("🗑️ ลบข้อมูลเรียบร้อย");
//   };

//   // ✅ เริ่มแก้ไข
//   const startEdit = (item) => {
//     setEditingId(item.id);
//     setTitle(item.title);
//   };

//   // ✅ บันทึกการแก้ไข
//   const saveEdit = () => {
//     if (!title.trim()) return showPopup("⚠️ กรุณากรอกชื่อเรื่อง");
//     setData(
//       data.map((item) => (item.id === editingId ? { ...item, title } : item))
//     );
//     setEditingId(null);
//     setTitle("");
//     showPopup("💾 บันทึกเรียบร้อย!");
//   };

//   return (
//     <>
//       <div className="page-container">
//         <h2>📡 SmartPersona Data Management</h2>
//         <p style={{ color: "#888", marginBottom: "20px" }}>
//           ระบบจัดการข้อมูลจำลอง (ไม่ต้องเชื่อม API จริง)
//         </p>

//         {/* 🔹 ส่วนเพิ่ม/แก้ไขข้อมูล */}
//         <div className="input-section">
//           <input
//             type="text"
//             placeholder="กรอกชื่อเรื่องใหม่..."
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//             className="input-field"
//           />
//           {editingId ? (
//             <button className="btn btn-add" onClick={saveEdit}>
//               💾 บันทึก
//             </button>
//           ) : (
//             <button className="btn btn-add" onClick={addPost}>
//               ➕ เพิ่มข้อมูล
//             </button>
//           )}
//         </div>

//         {/* 🔹 ตารางข้อมูล */}
//         <div className="table-container">
//           {loading ? (
//             <p>⏳ กำลังโหลดข้อมูล...</p>
//           ) : data.length === 0 ? (
//             <p>📭 ไม่มีข้อมูลในระบบ</p>
//           ) : (
//             <table>
//               <thead>
//                 <tr>
//                   <th>ID</th>
//                   <th>ชื่อเรื่อง</th>
//                   <th>การจัดการ</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {data.map((item) => (
//                   <tr key={item.id}>
//                     <td>{item.id}</td>
//                     <td>{item.title}</td>
//                     <td>
//                       <button
//                         className="btn btn-manage"
//                         onClick={() => startEdit(item)}
//                       >
//                         ✏️ แก้ไข
//                       </button>
//                       <button
//                         className="btn btn-delete"
//                         onClick={() => deletePost(item.id)}
//                       >
//                         🗑️ ลบ
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           )}
//         </div>
//       </div>

//       {/* ✅ popup */}
//       {popup.show && <div className="popup-message-api">{popup.message}</div>}
//     </>
//   );
// };

// export default Api;
