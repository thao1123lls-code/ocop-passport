import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { guard } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/admin/orders?limit=50  → đơn hàng mới nhất kèm chi tiết (chỉ admin)
export async function GET(request) {
  const g = await guard(request, ["admin"]);
  if (g.error) return g.error;
  const limit = Math.min(200, Math.max(1, parseInt(new URL(request.url).searchParams.get("limit")) || 50));
  try {
    const r = await pool.query(
      `SELECT o.id, o.code, o.user_id, o.customer_name, o.phone, o.address, o.note, o.total::bigint AS total,
              o.status, o.payment_method, o.created_at,
              COALESCE(json_agg(json_build_object('productId', i.product_id, 'name', i.name, 'unitPrice', i.unit_price,
                       'qty', i.qty, 'contents', i.contents) ORDER BY i.id) FILTER (WHERE i.id IS NOT NULL), '[]') AS items
       FROM orders o LEFT JOIN order_items i ON i.order_id = o.id
       GROUP BY o.id ORDER BY o.created_at DESC LIMIT $1`,
      [limit],
    );
    return NextResponse.json({ success: true, data: r.rows.map((o) => ({ ...o, id: Number(o.id), total: Number(o.total) })) });
  } catch (err) {
    console.error("[GET /api/admin/orders]", err);
    return NextResponse.json({ success: false, error: "Không đọc được đơn hàng." }, { status: 500 });
  }
}
