// Tạo/đặt lại tài khoản quản trị:  npm run db:create-admin -- email@vd.com "MatKhauDai" "Tên hiển thị"
// hoặc dùng biến môi trường ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { hashPassword } from "../lib/password.mjs";

const dir = path.dirname(fileURLToPath(import.meta.url));
for (const f of [".env.local", ".env"]) {
  const p = path.join(dir, "..", f);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
const [, , a1, a2, a3] = process.argv;
const email = (a1 || process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const password = a2 || process.env.ADMIN_PASSWORD || "";
const name = a3 || process.env.ADMIN_NAME || "Quản trị viên";
if (!process.env.DATABASE_URL || !email || password.length < 8) {
  console.error('Cần DATABASE_URL, email và mật khẩu >= 8 ký tự.\nVí dụ: npm run db:create-admin -- admin@ocop.vn "MatKhauDai123" "Quản trị"');
  process.exit(1);
}
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined });
try {
  await pool.query(
    `INSERT INTO users (email, name, password_hash, role) VALUES ($1,$2,$3,'admin')
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = 'admin', name = EXCLUDED.name`,
    [email, name, await hashPassword(password)],
  );
  console.log(`Đã tạo/cập nhật quản trị viên ${email}`);
} catch (e) {
  console.error("Lỗi:", e.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
