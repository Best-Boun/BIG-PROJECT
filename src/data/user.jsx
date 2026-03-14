// src/data/user.jsx

const API_URL = "http://localhost:3000/api/auth";

// ============================
// LOGIN
// ============================
export async function verifyUser(username, password) {
  try {
    console.log("🟣 LOGIN:", username);

    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: username,
        password,
      }),
    });

    const data = await res.json();
    console.log("SERVER RESPONSE:", data);

    if (data.success) {
      const user = data.user;

      // save token
      localStorage.setItem("token", data.token || "valid-token");

      // save role
      localStorage.setItem("role", user.role);

      // save current user (แก้ตรงนี้)
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          id: user.id,
          username: user.username,
          name: user.username,
          email: user.email,
          role: user.role,
          createdAt: new Date().toISOString(),
        }),
      );

      return {
        role: user.role,
        token: data.token || "valid-token",
      };
    }

    return null;
  } catch (error) {
    console.error("🚨 LOGIN ERROR:", error);
    return null;
  }
}

// ============================
// REGISTER
// ============================
export async function registerUser(username, email, password) {
  try {
    console.log("🟢 REGISTER:", username);

    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: username, // 🔥 แก้ตรงนี้
        email,
        password,
      }),
    });

    const data = await res.json();
    console.log("REGISTER RESPONSE:", data);

    if (data.message) {
      return {
        success: true,
        message: "✅ สมัครสมาชิกสำเร็จ",
      };
    }

    return {
      success: false,
      message: data.message || "❌ สมัครไม่สำเร็จ",
    };
  } catch (error) {
    console.error("🚨 REGISTER ERROR:", error);

    return {
      success: false,
      message: "❌ ไม่สามารถเชื่อมต่อ server ได้",
    };
  }
}