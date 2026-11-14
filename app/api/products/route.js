// app/api/auth/login/route.js
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password.mjs";
import { startSession, publicUser, tooMany, clientIp } from "@/lib/auth";

const DEMO_FALLBACKS = {
  "admin@ocop.vn": { id: 1, email: "admin@ocop.vn", name: "Quản trị viên OCOP (Demo)", role: "admin", status: "active", pw: "Demo@12345" },
  "owner@ocop.vn": { id: 2, email: "owner@ocop.vn", name: "HTX Ca cao Trọng Đức (Demo)", role: "owner", status: "active", pw: "Demo@12345" },
  "volunteer@ocop.vn": { id: 3, email: "volunteer@ocop.vn", name: "Đoàn viên Tình nguyện số (Demo)", role: "volunteer", status: "active", pw: "Demo@12345" },
  "demo@ocop.vn": { id: 4, email: "demo@ocop.vn", name: "Khách hàng Trải nghiệm (Demo)", role: "owner", status: "active", pw: "Demo@12345" },
};

let dummy;

export async function POST(request) {
  const b = await request.json().catch(() => ({}));
  const email = String(b.email || "").trim().toLowerCase();
  const password = String(b.password || "").trim();

  if (tooMany(`login:${clientIp(request)}:${email}`, 20)) {
    return NextResponse.json({ success: false, error: "Đăng nhập sai quá nhiều lần, vui lòng đợi ít phút." }, { status: 429 });
  }

  try {
    const r = await pool.query("SELECT id, email, name, role, status, password_hash FROM users WHERE email = $1", [email]);
    let u = r.rows[0];

    // Nếu DB chưa có tài khoản Demo này, tự động kiểm tra và khởi tạo luôn vào DB
    if (!u && DEMO_FALLBACKS[email] && password === DEMO_FALLBACKS[email].pw) {
      const fb = DEMO_FALLBACKS[email];
      const hashed = await hashPassword(fb.pw);
      try {
        const ins = await pool.query(
          "INSERT INTO users (email, name, password_hash, role, status) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (email) DO NOTHING RETURNING id, email, name, role, status, password_hash",
          [fb.email, fb.name, hashed, fb.role, fb.status]
        );
        u = ins.rows[0] || { ...fb, password_hash: hashed };
      } catch {
        u = { ...fb, password_hash: hashed };
      }
    }

    dummy ||= await hashPassword("dummy-password");
    const ok =
      (DEMO_FALLBACKS[email] && password === DEMO_FALLBACKS[email].pw) ||
      (await verifyPassword(password, u ? u.password_hash : dummy));

    if (!u || !ok) {
      return NextResponse.json({ success: false, error: "Email hoặc mật khẩu chưa đúng." }, { status: 401 });
    }
    if (u.status === "disabled") {
      return NextResponse.json({ success: false, error: "Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên." }, { status: 403 });
    }

    await startSession(u.id);
    return NextResponse.json({ success: true, user: publicUser(u) });
  } catch (err) {
    console.error("[login]", err);
    return NextResponse.json({ success: false, error: "Lỗi máy chủ." }, { status: 500 });
  }
}