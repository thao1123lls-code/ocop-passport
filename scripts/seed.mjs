// Chạy: npm run db:seed   (cần DATABASE_URL trong .env.local hoặc biến môi trường)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { products } from "../db/seed-data.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Đọc .env.local thủ công (không thêm thư viện dotenv)
for (const f of [".env.local", ".env"]) {
  const p = path.join(__dirname, "..", f);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

if (!process.env.DATABASE_URL) {
  console.error("Thiếu DATABASE_URL. Ví dụ: postgres://postgres:postgres@localhost:5432/ocop_passport");
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
});

const client = await pool.connect();
try {
  await client.query("BEGIN");
  await client.query(fs.readFileSync(path.join(__dirname, "../db/schema.sql"), "utf8"));

  for (const p of products) {
    await client.query(
      `INSERT INTO products
        (id,name,category,price,promo,farm,lot,weight,ingredients,expiry,storage,certs,story,shop,photo,verified)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       ON CONFLICT (id) DO UPDATE SET
        name=EXCLUDED.name, category=EXCLUDED.category, price=EXCLUDED.price, promo=EXCLUDED.promo,
        farm=EXCLUDED.farm, lot=EXCLUDED.lot, weight=EXCLUDED.weight, ingredients=EXCLUDED.ingredients,
        expiry=EXCLUDED.expiry, storage=EXCLUDED.storage, certs=EXCLUDED.certs, story=EXCLUDED.story,
        shop=EXCLUDED.shop, photo=EXCLUDED.photo, verified=EXCLUDED.verified, updated_at=NOW()`,
      [p.id, p.name, p.category, p.price, p.promo, p.farm, p.lot, p.weight, p.ingredients,
       p.expiry, p.storage, p.certs, p.story, p.shop || null, p.photo, p.verified],
    );
    for (const e of p.entries) {
      await client.query(
        `INSERT INTO diary_entries (id, product_id, stage, text, photo, ts)
         VALUES ($1,$2,$3,$4,$5, NOW() - ($6 || ' days')::interval)
         ON CONFLICT (id) DO NOTHING`,
        [e.id, p.id, e.stage, e.text, e.photo || null, String(e.daysAgo)],
      );
    }
  }
  await client.query("COMMIT");
  const n = await client.query("SELECT (SELECT count(*) FROM products) p, (SELECT count(*) FROM diary_entries) e");
  console.log(`Xong. DB hiện có ${n.rows[0].p} sản phẩm, ${n.rows[0].e} mốc nhật ký.`);
} catch (err) {
  await client.query("ROLLBACK");
  console.error("Lỗi khi nạp dữ liệu:", err.message);
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}
