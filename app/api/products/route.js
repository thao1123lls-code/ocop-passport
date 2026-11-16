import { NextResponse } from "next/server";
import { pool, toProduct, safeUrl } from "@/lib/db";
import { guard } from "@/lib/auth";
import { products as seedProducts } from "@/db/seed-data.mjs";

export const dynamic = "force-dynamic";

function getSeedProducts() {
  const now = Date.now();
  return seedProducts.map((product) => ({
    ...product,
    ownerId: null,
    entries: (product.entries || []).map((entry) => ({
      id: entry.id,
      stage: entry.stage,
      text: entry.text,
      photo: entry.photo || undefined,
      audio: entry.audio || undefined,
      geo: entry.geo || undefined,
      by: "owner",
      ts: now - (Number(entry.daysAgo) || 0) * 864e5,
    })),
  }));
}

function mergeSeedProducts(databaseProducts) {
  const seeds = getSeedProducts();
  const databaseById = new Map(databaseProducts.map((product) => [String(product.id), product]));
  const seedIds = new Set(seeds.map((product) => String(product.id)));

  return [
    ...seeds.map((product) => databaseById.get(String(product.id)) || product),
    ...databaseProducts.filter((product) => !seedIds.has(String(product.id))),
  ];
}

export async function GET() {
  try {
    const result = await pool.query("SELECT * FROM products ORDER BY created_at ASC");
    if (result.rows.length) {
      const entries = await pool.query("SELECT * FROM diary_entries ORDER BY ts ASC");
      const byProduct = new Map();
      for (const entry of entries.rows) {
        const list = byProduct.get(entry.product_id) || [];
        list.push(entry);
        byProduct.set(entry.product_id, list);
      }
      const databaseProducts = result.rows.map((product) =>
        toProduct(product, byProduct.get(product.id) || []),
      );
      return NextResponse.json({
        success: true,
        data: mergeSeedProducts(databaseProducts),
      });
    }
  } catch (error) {
    console.error("[GET /api/products] Database unavailable; serving seed data:", error.message);
  }

  return NextResponse.json({ success: true, data: getSeedProducts(), source: "seed" });
}

export async function POST(request) {
  const auth = await guard(request, ["owner", "admin"]);
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => ({}));
  const id = String(body.id || "").trim().slice(0, 128);
  const name = String(body.name || "").trim().slice(0, 255);
  if (!id || !name) {
    return NextResponse.json({ success: false, error: "Cần có mã và tên sản phẩm." }, { status: 400 });
  }
  if (body.shop && !safeUrl(body.shop)) {
    return NextResponse.json({ success: false, error: "Link gian hàng phải bắt đầu bằng http(s)://" }, { status: 400 });
  }

  try {
    const result = await pool.query(
      `INSERT INTO products
        (id, name, category, price, promo, farm, lot, weight, ingredients, expiry, storage, certs, story, shop, photo, verified, content, owner_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17::jsonb,$18)
       ON CONFLICT (id) DO NOTHING
       RETURNING *`,
      [
        id, name, body.category || null, Math.max(0, parseInt(body.price, 10) || 0), body.promo || null,
        body.farm || null, body.lot || null, body.weight || null, body.ingredients || null,
        body.expiry || null, body.storage || null, body.certs || null, body.story || null,
        body.shop || null, body.photo || null, auth.user.role === "admin" && !!body.verified,
        body.content == null ? null : JSON.stringify(body.content), auth.user.id,
      ],
    );

    if (!result.rows[0]) {
      return NextResponse.json({ success: false, error: "Mã sản phẩm đã tồn tại hoặc database chưa được kết nối." }, { status: 409 });
    }
    return NextResponse.json({ success: true, data: toProduct(result.rows[0]) }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/products]", error);
    return NextResponse.json({ success: false, error: "Không lưu được sản phẩm. Kiểm tra kết nối database." }, { status: 503 });
  }
}
