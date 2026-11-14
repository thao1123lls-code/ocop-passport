// lib/auth.js — Quản lý phiên đăng nhập ổn định với cả DB và tài khoản Demo
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { pool, BUILTIN_USERS } from "@/lib/db";

const COOKIE = "ocop_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 ngày

function secret() {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 16) return s;
  return "dev-only-secret-do-not-use-in-production";
}
const sign = (payload) => crypto.createHmac("sha256", secret()).update(payload).digest("base64url");

export function makeToken(userId, email = "") {
  const payload = Buffer.from(JSON.stringify({ uid: Number(userId), email, exp: Date.now() + MAX_AGE * 1000 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function readToken(token) {
  if (!token || !token.includes(".")) return null;
  const [payload, sig] = token.split(".");
  const good = sign(payload);
  if (sig.length !== good.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(good))) return null;
  try {
    const d = JSON.parse(Buffer.from(payload, "base64url").toString());
    return d.exp > Date.now() ? d : null;
  } catch {
    return null;
  }
}

export const publicUser = (u) => ({
  id: u.id != null && !Number.isNaN(Number(u.id)) ? Number(u.id) : (u.id || u.email),
  email: u.email,
  name: u.name,
  role: u.role,
  status: u.status || "active",
});
export async function currentUser() {
  const jar = await cookies();
  const t = readToken(jar.get(COOKIE)?.value);
  if (!t) return null;

  try {
    const r = await pool.query("SELECT id, email, name, role, status FROM users WHERE id = $1", [t.uid]);
    if (r.rows[0]) {
      const u = r.rows[0];
      return u.status !== "disabled" ? publicUser(u) : null;
    }
  } catch {}

  // Fallback tìm trong BUILTIN_USERS theo uid hoặc email nếu DB chưa trả về
  const fb = BUILTIN_USERS.find((x) => Number(x.id) === Number(t.uid) || (t.email && x.email === t.email));
  return fb && fb.status !== "disabled" ? publicUser(fb) : null;
}

export async function startSession(userId, email = "") {
  const jar = await cookies();
  jar.set(COOKIE, makeToken(userId, email), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function endSession() {
  (await cookies()).set(COOKIE, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
}

const fail = (error, status) => ({ error: NextResponse.json({ success: false, error }, { status }) });

export function badOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin || request.method === "GET") return false;
  try {
    return new URL(origin).host !== request.headers.get("host");
  } catch {
    return true;
  }
}

export async function guard(request, roles = null, { allowPending = false } = {}) {
  if (badOrigin(request)) return fail("Yêu cầu không hợp lệ (sai nguồn).", 403);
  const user = await currentUser();
  if (!user) return fail("Bạn cần đăng nhập.", 401);
  if (user.status !== "active" && !allowPending) return fail("Tài khoản đang chờ quản trị viên duyệt, chưa thể ghi dữ liệu.", 403);
  if (roles && !roles.includes(user.role)) return fail("Tài khoản của bạn không có quyền thực hiện thao tác này.", 403);
  return { user };
}

const attempts = new Map();
export function tooMany(key, limit = 30, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const a = (attempts.get(key) || []).filter((t) => now - t < windowMs);
  a.push(now);
  attempts.set(key, a);
  if (attempts.size > 5000) attempts.clear();
  return a.length > limit;
}
export const clientIp = (req) => req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";