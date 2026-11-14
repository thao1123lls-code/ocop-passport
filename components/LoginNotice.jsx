"use client";
import Link from "next/link";
import { useAuth, ROLE_LABEL } from "@/lib/auth-client";

// Dải nhắc đăng nhập đặt đầu các trang ghi dữ liệu (nhật ký, trợ lý AI)
export default function LoginNotice() {
  const { user, loading } = useAuth();
  if (loading) return null;
  const box = { padding: "10px 14px", borderRadius: 10, fontSize: 14, margin: "0 0 16px", border: "1px solid rgba(56,189,248,.35)", background: "rgba(56,189,248,.08)" };
  if (!user) {
    return (
      <div style={box} role="status">
        Bạn chưa đăng nhập, thay đổi sẽ <b>không được lưu lên hệ thống</b>. <Link href="/login" style={{ fontWeight: 700 }}>Đăng nhập hoặc đăng ký →</Link>
      </div>
    );
  }
  if (user.status === "pending") {
    return <div style={{ ...box, borderColor: "rgba(251,191,36,.5)", background: "rgba(251,191,36,.08)" }} role="status">Tài khoản <b>{user.name}</b> đang <b>chờ quản trị viên duyệt</b>. Trong lúc chờ, bạn chưa thể ghi nhật ký.</div>;
  }
  return <div style={box}>Đang đăng nhập: <b>{user.name}</b> ({ROLE_LABEL[user.role]}) · <Link href="/login">Tài khoản</Link></div>;
}
