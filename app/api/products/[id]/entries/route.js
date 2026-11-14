import { NextResponse } from "next/server";
import { pool, STAGE_NAMES } from "@/lib/db";
import { guard } from "@/lib/auth";

// POST /api/products/:id/entries  → thêm 1 mốc nhật ký (chỉ thêm, không sửa)
// Admin: mọi sản phẩm. Chủ cơ sở: sản phẩm của mình. Tình nguyện viên: nhập hộ, luôn gắn nhãn 'volunteer'.
export async function POST(request, { params }) {
  const g = await guard(request, ["owner", "volunteer", "admin"]);
  if (g.error) return g.error;
  const { id } = await params;
  const b = await request.json().catch(() => ({}));
  if (!STAGE_NAMES.includes(b.stage) || !b.text?.trim()) {
    return NextResponse.json({ success: false, error: `Cần 'stage' thuộc ${STAGE_NAMES.join(", ")} và 'text'.` }, { status: 400 });
  }
  const prod = await pool.query("SELECT owner_id FROM products WHERE id = $1", [id]);
  if (!prod.rows[0]) return NextResponse.json({ success: false, error: "Sản phẩm không tồn tại." }, { status: 404 });
  if (g.user.role === "owner" && Number(prod.rows[0].owner_id) !== g.user.id) {
    return NextResponse.json({ success: false, error: "Bạn chỉ được ghi nhật ký cho sản phẩm của mình." }, { status: 403 });
  }
  const entryId = String(b.id || Date.now().toString(36) + Math.random().toString(36).slice(2, 6)).slice(0, 64);
  // Giữ giờ ghi ở thiết bị khi nhập ngoại tuyến, nhưng không cho ghi lùi quá 90 ngày hay vào tương lai
  const now = Date.now();
  const ts = Number.isFinite(b.ts) && b.ts <= now + 60000 && b.ts >= now - 90 * 864e5 ? b.ts : now;
  const geo = Array.isArray(b.geo) && b.geo.length === 2 && b.geo.every(Number.isFinite) ? JSON.stringify(b.geo) : null;
  const by = g.user.role === "volunteer" || b.by === "volunteer" ? "volunteer" : "owner";
  try {
    const r = await pool.query(
      `INSERT INTO diary_entries (id, product_id, stage, text, photo, audio, geo, entered_by, user_id, ts)
       VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9, to_timestamp($10::float8 / 1000))
       ON CONFLICT (id) DO NOTHING RETURNING id, ts`,
      [entryId, id, b.stage, b.text.trim(), b.photo ?? null, b.audio ?? null, geo, by, g.user.id, ts],
    );
    if (!r.rows[0]) return NextResponse.json({ success: false, error: "Mốc nhật ký này đã có." }, { status: 409 });
    return NextResponse.json({ success: true, data: { id: r.rows[0].id, ts: new Date(r.rows[0].ts).getTime() } }, { status: 201 });
  } catch (err) {
    console.error("[POST entries]", err);
    return NextResponse.json({ success: false, error: "Không lưu được mốc nhật ký." }, { status: 500 });
  }
}
