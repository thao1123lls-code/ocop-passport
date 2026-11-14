import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { guard } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/admin/users → danh sách tài khoản (chỉ admin)
export async function GET(request) {
  const g = await guard(request, ["admin"]);
  if (g.error) return g.error;
  const r = await pool.query(
    `SELECT u.id, u.email, u.name, u.role, u.status, u.created_at,
            (SELECT count(*) FROM products p WHERE p.owner_id = u.id)::int AS products,
            (SELECT count(*) FROM diary_entries e WHERE e.user_id = u.id)::int AS entries
     FROM users u ORDER BY (u.status = 'pending') DESC, u.created_at DESC`,
  );
  return NextResponse.json({
    success: true,
    data: r.rows.map((u, idx) => ({
      ...u,
      id: u.id != null && !Number.isNaN(Number(u.id)) ? Number(u.id) : (u.id || u.email || idx + 1),
    })),
  });
}