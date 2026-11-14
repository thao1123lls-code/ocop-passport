// Sinh db/seed.sql từ db/seed-data.mjs (để dán vào Supabase SQL Editor / psql)
// Chạy: npm run db:gen-sql
import fs from "node:fs";
import { products } from "../db/seed-data.mjs";

const q = (v) => (v === null || v === undefined || v === "" ? "NULL" : `'${String(v).replace(/'/g, "''")}'`);
let out = "-- Sinh tự động bởi scripts/gen-seed-sql.mjs. Chạy db/schema.sql trước.\nBEGIN;\n\n";
for (const p of products) {
  out += `INSERT INTO products (id,name,category,price,promo,farm,lot,weight,ingredients,expiry,storage,certs,story,shop,photo,verified) VALUES (${[
    q(p.id), q(p.name), q(p.category), p.price, q(p.promo), q(p.farm), q(p.lot), q(p.weight),
    q(p.ingredients), q(p.expiry), q(p.storage), q(p.certs), q(p.story), q(p.shop), q(p.photo), p.verified ? "TRUE" : "FALSE",
  ].join(", ")})\nON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, price=EXCLUDED.price, promo=EXCLUDED.promo, story=EXCLUDED.story, verified=EXCLUDED.verified, updated_at=NOW();\n`;
  for (const e of p.entries) {
    out += `INSERT INTO diary_entries (id,product_id,stage,text,photo,ts) VALUES (${q(e.id)}, ${q(p.id)}, ${q(e.stage)}, ${q(e.text)}, ${q(e.photo)}, NOW() - INTERVAL '${e.daysAgo} days') ON CONFLICT (id) DO NOTHING;\n`;
  }
  out += "\n";
}
out += "COMMIT;\n";
fs.writeFileSync(new URL("../db/seed.sql", import.meta.url), out);
console.log("Đã tạo db/seed.sql");
