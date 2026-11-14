// app/api/auth/login/route.js
import { NextResponse } from "next/server";
import { pool, BUILTIN_USERS } from "@/lib/db";
import { verifyPassword } from "@/lib/password.mjs";
import { startSession, publicUser } from "@/lib/auth";

export async function POST(request) {
  try {
    const b = await request.json().catch(() => ({}));
    const email = String(b.email || "").trim().toLowerCase();
    const password = String(b.password || "").trim();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Vui lòng nhập đầy đủ email và mật khẩu." }, { status: 400 });
    }

    // 1. Tìm trong DB / Supabase trước
    let u = null;
    try {
      const r = await pool.query("SELECT id, email, name, role, status, password_hash FROM users WHERE email = $1", [email]);
      u = r.rows[0] || null;
    } catch {}

    // 2. Tìm trong danh sách 24 tài khoản tích hợp sẵn nếu DB chưa có
    const builtin = BUILTIN_USERS.find((x) => x.email.toLowerCase() === email);
    if (!u && builtin) {
      u = builtin;
    }

    if (!u) {
      return NextResponse.json({ success: false, error: "Email hoặc mật khẩu chưa đúng." }, { status: 401 });
    }

    // 3. Kiểm tra mật khẩu (hỗ trợ cả mật khẩu gốc Demo@12345 / Khachhang@123 lẫn hash scrypt)
    const isDemoPw =
      (["admin@ocop.vn", "owner@ocop.vn", "volunteer@ocop.vn", "demo@ocop.vn"].includes(email) && password === "Demo@12345") ||
      (builtin && !["admin@ocop.vn", "owner@ocop.vn", "volunteer@ocop.vn", "demo@ocop.vn"].includes(email) && password === "Khachhang@123");

    const ok = isDemoPw || (await verifyPassword(password, u.password_hash));

    if (!ok) {
      return NextResponse.json({ success: false, error: "Email hoặc mật khẩu chưa đúng." }, { status: 401 });
    }

    if (u.status === "disabled") {
      return NextResponse.json({ success: false, error: "Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên." }, { status: 403 });
    }

    await startSession(u.id, u.email);
    return NextResponse.json({ success: true, user: publicUser(u) });
  } catch (err) {
    console.error("[login]", err);
    return NextResponse.json({ success: false, error: "Lỗi máy chủ: " + err.message }, { status: 500 });
  }
}