import { NextResponse } from "next/server";
import { pool, toProduct, safeUrl } from "@/lib/db";
import { guard } from "@/lib/auth";

export const dynamic = "force-dynamic";

const TEXT_FIELDS = ["name", "category", "promo", "farm", "lot", "weight", "ingredients", "expiry", "storage", "certs", "story", "shop", "photo"];

// GET /api/products/:id  → công khai (trang /p/[id], mã QR)
export async function GET(_req, { params }) {
  const { id } = await params;
  try {
    const p = await pool.query("SELECT * FROM products WHERE id = $1", [id]);
    if (!p.rows[0]) return NextResponse.json({ success: false, error: "Không tìm thấy sản phẩm." }, { status: 404 });
    const e = await pool.query("SELECT * FROM diary_entries WHERE product_id = $1 ORDER BY ts", [id]);
    return NextResponse.json({ success: true, data: toProduct(p.rows[0], e.rows) });
  } catch (err) {
    console.error("[GET /api/products/:id]", err);
    return NextResponse.json({ success: false, error: "Lỗi máy chủ." }, { status: 500 });
  }
}

async function loadForWrite(request, id) {
  const g = await guard(request, ["owner", "admin"]);
  if (g.error) return g;
  const r = await pool.query("SELECT id, owner_id FROM products WHERE id = $1", [id]);
  if (!r.rows[0]) return { error: NextResponse.json({ success: false, error: "Không tìm thấy sản phẩm." }, { status: 404 }) };
  const mine = r.rows[0].owner_id != null && Number(r.rows[0].owner_id) === g.user.id;
  if (g.user.role !== "admin" && !mine) {
    return { error: NextResponse.json({ success: false, error: "Bạn chỉ được sửa sản phẩm của chính mình." }, { status: 403 }) };
  }
  return g;
}

// PATCH /api/products/:id  → chủ sản phẩm hoặc admin; riêng 'verified' chỉ admin
export async function PATCH(request, { params }) {
  const { id } = await params;
  const g = await loadForWrite(request, id);
  if (g.error) return g.error;
  const b = await request.json().catch(() => ({}));
  const sets = [], vals = [];
  const add = (col, v, cast = "") => { vals.push(v); sets.push(`${col} = $${vals.length}${cast}`); };

  for (const k of TEXT_FIELDS) if (k in b) add(k, b[k] === "" || b[k] == null ? null : String(b[k]));
  if ("shop" in b && !safeUrl(b.shop)) return NextResponse.json({ success: false, error: "Link shop phải bắt đầu bằng http(s)://" }, { status: 400 });
  if ("price" in b) add("price", Math.max(0, parseInt(b.price) || 0));
  if ("content" in b) add("content", b.content == null ? null : JSON.stringify(b.content), "::jsonb");
  if ("ownerId" in b) {
    if (g.user.role !== "admin") return NextResponse.json({ success: false, error: "Chỉ quản trị viên mới được đổi chủ sở hữu." }, { status: 403 });
    if (b.ownerId !== null) {
      const o = await pool.query("SELECT 1 FROM users WHERE id = $1 AND role IN ('owner','admin') AND status = 'active'", [parseInt(b.ownerId) || 0]);
      if (!o.rows[0]) return NextResponse.json({ success: false, error: "Chủ sở hữu phải là tài khoản chủ cơ sở đang hoạt động." }, { status: 400 });
    }
    add("owner_id", b.ownerId === null ? null : parseInt(b.ownerId));
  }
  if ("verified" in b) {
    if (g.user.role !== "admin") return NextResponse.json({ success: false, error: "Chỉ quản trị viên mới được xác minh hộ chiếu." }, { status: 403 });
    add("verified", !!b.verified);
  }
  if (!sets.length) return NextResponse.json({ success: false, error: "Không có trường nào để cập nhật." }, { status: 400 });
  try {
    vals.push(id);
    const r = await pool.query(`UPDATE products SET ${sets.join(", ")}, updated_at = NOW() WHERE id = $${vals.length} RETURNING *`, vals);
    return NextResponse.json({ success: true, data: toProduct(r.rows[0]) });
  } catch (err) {
    console.error("[PATCH /api/products/:id]", err);
    return NextResponse.json({ success: false, error: "Không cập nhật được." }, { status: 500 });
  }
}

// DELETE /api/products/:id  → chủ sản phẩm hoặc admin
export async function DELETE(request, { params }) {
  const { id } = await params;
  const g = await loadForWrite(request, id);
  if (g.error) return g.error;
  await pool.query("DELETE FROM products WHERE id = $1", [id]);
  return NextResponse.json({ success: true });
}
