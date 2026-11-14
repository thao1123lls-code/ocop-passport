import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password.mjs";
import { guard } from "@/lib/auth";

export async function POST(request) {
  const g = await guard(request, null, { allowPending: true });
  if (g.error) return g.error;
  const b = await request.json().catch(() => ({}));
  const next = String(b.next || "");
  if (next.length < 8 || next.length > 200) return NextResponse.json({ success: false, error: "Mật khẩu mới phải từ 8 ký tự." }, { status: 400 });
  const r = await pool.query("SELECT password_hash FROM users WHERE id = $1", [g.user.id]);
  if (!(await verifyPassword(String(b.current || ""), r.rows[0]?.password_hash))) {
    return NextResponse.json({ success: false, error: "Mật khẩu hiện tại không đúng." }, { status: 400 });
  }
  await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [await hashPassword(next), g.user.id]);
  return NextResponse.json({ success: true });
}
