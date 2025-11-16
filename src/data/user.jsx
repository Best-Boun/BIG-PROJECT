// src/data/user.jsx
const API_URL = "http://localhost:3001/users"; // ❗ อย่าใช้ 3002 นะ

export async function verifyUser(username, password) {
  try {
    console.log("🟣 ตรวจสอบผู้ใช้:", username, password);

    const res = await fetch(`${API_URL}?username=${username}&password=${password}`);
    const data = await res.json();

    if (Array.isArray(data) && data.length > 0) {
      const found = data[0];
      console.log("✅ พบผู้ใช้:", found);

      // ✅ เก็บค่าทั้งหมดใน localStorage ให้ครบ
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          username: found.username,
          role: found.role,
          createdAt: new Date().toISOString(),
        })
      );
      localStorage.setItem("role", found.role); // ❗ fixed ตรงนี้
      localStorage.setItem("token", "valid-token");

      return { role: found.role, token: "valid-token" };
    } else {
      console.warn("❌ ไม่พบผู้ใช้");
      return null;
    }
  } catch (error) {
    console.error("🚨 verifyUser ERROR:", error);
    return null;
  }
}

/* ✅ ฟังก์ชันสมัครสมาชิก (Register) */
export async function registerUser(username, email, password) {
  try {
    console.log("🟢 กำลังตรวจสอบชื่อซ้ำ:", username);

    // ตรวจชื่อซ้ำก่อน
    const resCheck = await fetch(`${API_URL}?username=${username}`);
    const exist = await resCheck.json();
    if (exist.length > 0) {
      console.warn("⚠️ Username already exists:", username);
      return { success: false, message: "⚠️ Username already exists!" };
    }

    // เตรียมข้อมูล user ใหม่
    const newUser = {
      username,
      email,
      password,
      name: username,
      role: "user",
      createdAt: new Date().toISOString(),
    };

    console.log("🟢 เพิ่มผู้ใช้ใหม่:", newUser);

    // ส่งไปบันทึกใน db.json
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });

    if (res.ok) {
      console.log("✅ สมัครสมาชิกสำเร็จ!");
      return { success: true, message: "✅ Register successful!" };
    } else {
      console.error("❌ เกิดข้อผิดพลาดขณะสมัคร:", res.status);
      return { success: false, message: "❌ Failed to register!" };
    }
  } catch (error) {
    console.error("🚨 registerUser ERROR:", error);
    return { success: false, message: "❌ Failed to register!" };
  }
}
