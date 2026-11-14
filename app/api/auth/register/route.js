import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { hashPassword } from "@/lib/password.mjs";
import { startSession, publicUser, tooMany, clientIp } from "@/lib/auth";

// Tự đăng ký chỉ tạo được vai trò 'owner' (chủ cơ sở) hoặc 'volunteer' (tình nguyện viên).
// Tài khoản 'admin' chỉ tạo bằng: npm run db:create-admin
export async function POST(request) {
  if (tooMany("reg:" + clientIp(request), 10)) return NextResponse.json({ success: false, error: "Thử quá nhiều lần, vui lòng đợi ít phút." }, { status: 429 });
  const b = await request.json().catch(() => ({}));
  const email = String(b.email || "").trim().toLowerCase();
  const name = String(b.name || "").trim();
  const password = String(b.password || "");
  const role = b.role === "volunteer" ? "volunteer" : "owner";
  const status = role === "volunteer" ? "pending" : "active"; // tình nguyện viên cần admin duyệt
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) return NextResponse.json({ success: false, error: "Email không hợp lệ." }, { status: 400 });
  if (!name || name.length > 128) return NextResponse.json({ success: false, error: "Vui lòng nhập họ tên." }, { status: 400 });
  if (password.length < 8 || password.length > 200) return NextResponse.json({ success: false, error: "Mật khẩu phải từ 8 ký tự." }, { status: 400 });
  try {
    const r = await pool.query(
      "INSERT INTO users (email, name, password_hash, role, status) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (email) DO NOTHING RETURNING id, email, name, role, status",
      [email, name, await hashPassword(password), role, status],
    );
    if (!r.rows[0]) return NextResponse.json({ success: false, error: "Email này đã được đăng ký." }, { status: 409 });
    await startSession(r.rows[0].id);
    return NextResponse.json({ success: true, user: publicUser(r.rows[0]) }, { status: 201 });
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json({ success: false, error: "Không tạo được tài khoản." }, { status: 500 });
  }
}
