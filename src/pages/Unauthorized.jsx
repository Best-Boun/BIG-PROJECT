export default function Unauthorized() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "calc(100vh - 64px)",
      gap: "16px",
      background: "var(--color-bg)",
      textAlign: "center",
      padding: "32px",
    }}>
      <div style={{ fontSize: "3rem" }}>🚫</div>
      <h1 style={{
        fontSize: "var(--text-2xl)",
        fontWeight: 800,
        color: "var(--color-text-primary)",
        letterSpacing: "var(--tracking-tight)",
        margin: 0,
      }}>
        ไม่มีสิทธิ์เข้าถึง
      </h1>
      <p style={{
        fontSize: "var(--text-sm)",
        color: "var(--color-text-secondary)",
        maxWidth: "360px",
        margin: 0,
        lineHeight: "var(--leading-relaxed)",
      }}>
        คุณไม่มีสิทธิ์เข้าถึงหน้านี้ กรุณาตรวจสอบว่าคุณ login ด้วย account ที่ถูกต้อง
      </p>
      <button
        onClick={() => (window.location.href = "/feed")}
        style={{
          marginTop: "8px",
          padding: "10px 24px",
          background: "var(--color-text-primary)",
          color: "#fff",
          border: "none",
          borderRadius: "var(--radius-md)",
          fontSize: "var(--text-sm)",
          fontWeight: 600,
          fontFamily: "var(--font-sans)",
          cursor: "pointer",
        }}
      >
        กลับหน้าหลัก
      </button>
    </div>
  );
}
