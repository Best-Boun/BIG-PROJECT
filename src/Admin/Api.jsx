import React, { useEffect, useState } from "react";


// หน้าที่: เชื่อม API ภายนอก ดึงข้อมูลและแสดงในตาราง
// ตัวอย่างนี้ใช้ jsonplaceholder.typicode.com

const Api = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/posts?_limit=5")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={{ textAlign: "center" }}>
      <h2>ข้อมูลจาก API ภายนอก</h2>
      <table border="1" style={{ margin: "20px auto" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>ชื่อเรื่อง</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.title}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Api;
