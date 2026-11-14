import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { guard } from "@/lib/auth";

const ROLES = ["admin", "owner", "volunteer"];
const STATUSES = ["active", "pending", "disabled"];
const bad = (error, status = 400) => NextResponse.json({ success: false, error }, { status });

// PATCH /api/admin/users/:id  { role?, status? }  → duyệt, khóa, đổi vai trò (chỉ admin)
export async function PATCH(request, { params }) {
  const g = await guard(request, ["admin"]);
  if (g.error) return g.error;
  const id = parseInt((await params).id);
  const b = await request.json().catch(() => ({}));
  if (b.role !== undefined && !ROLES.includes(b.role)) return bad("Vai trò không hợp lệ.");
  if (b.status !== undefined && !STATUSES.includes(b.status)) return bad("Trạng thái không hợp lệ.");
  if (b.role === undefined && b.status === undefined) return bad("Không có gì để cập nhật.");

  const cur = (await pool.query("SELECT id, role, status FROM users WHERE id = $1", [id])).rows[0];
  if (!cur) return bad("Không tìm thấy tài khoản.", 404);

  const role = b.role ?? cur.role;
  const status = b.status ?? cur.status;
  const losesAdmin = cur.role === "admin" && cur.status === "active" && (role !== "admin" || status !== "active");
  if (losesAdmin) {
    if (id === g.user.id) return bad("Bạn không thể tự hạ quyền hoặc tự khóa tài khoản quản trị của mình.");
    const n = await pool.query("SELECT count(*)::int AS n FROM users WHERE role = 'admin' AND status = 'active'");
    if (n.rows[0].n <= 1) return bad("Hệ thống phải còn ít nhất một quản trị viên đang hoạt động.");
  }
  const r = await pool.query(
    "UPDATE users SET role = $1, status = $2 WHERE id = $3 RETURNING id, email, name, role, status",
    [role, status, id],
  );
  return NextResponse.json({ success: true, data: { ...r.rows[0], id: Number(r.rows[0].id) } });
}
