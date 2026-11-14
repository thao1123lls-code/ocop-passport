"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

// Thông báo nổi khi không lưu được thay đổi lên máy chủ (chưa đăng nhập, không đủ quyền, dữ liệu sai…)
export default function SyncToast() {
  const [t, setT] = useState(null);
  useEffect(() => {
    let timer;
    const on = (e) => {
      setT(e.detail);
      clearTimeout(timer);
      timer = setTimeout(() => setT(null), 7000);
    };
    window.addEventListener("ocop-sync", on);
    return () => {
      window.removeEventListener("ocop-sync", on);
      clearTimeout(timer);
    };
  }, []);
  if (!t) return null;
  return (
    <div
      role="alert"
      style={{
        position: "fixed", left: "50%", bottom: 24, transform: "translateX(-50%)", zIndex: 200, maxWidth: "min(92vw, 520px)",
        background: "#1E293B", color: "#F8FAFC", border: "1px solid rgba(248,113,113,.5)", borderRadius: 12,
        padding: "12px 16px", fontSize: 14, boxShadow: "0 10px 30px rgba(0,0,0,.4)", display: "flex", gap: 12, alignItems: "center",
      }}
    >
      <span>{t.status === 401 ? "Bạn cần đăng nhập để lưu thay đổi lên hệ thống." : t.msg}</span>
      {t.status === 401 && <Link href="/login" style={{ color: "#38BDF8", fontWeight: 700, whiteSpace: "nowrap" }}>Đăng nhập</Link>}
      <button type="button" onClick={() => setT(null)} aria-label="Đóng" style={{ background: "none", border: 0, color: "#94A3B8", cursor: "pointer", fontSize: 16 }}>✕</button>
    </div>
  );
}
