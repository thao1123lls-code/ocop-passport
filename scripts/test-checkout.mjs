// Kiểm thử logic đặt hàng + chống trùng KHÔNG cần PostgreSQL (dùng DB giả trong bộ nhớ).
// Chạy: npm run test:checkout
import assert from "node:assert/strict";
import { parseOrder, canonicalOrder, createOrder } from "../lib/checkout.mjs";
import { executeIdempotentTransaction, hashRequest } from "../lib/idempotency.mjs";

const PRODUCTS = [
  { id: "cacao", name: "Bột ca cao", price: 145000 },
  { id: "dieu", name: "Hạt điều", price: 185000 },
  { id: "free", name: "Chưa có giá", price: 0 },
];

function fakeDb({ failItems = false } = {}) {
  const st = { keys: {}, orders: [], items: [] };
  let snap = null;
  const client = {
    async query(sql, p = []) {
      const q = sql.replace(/\s+/g, " ").trim();
      if (q === "BEGIN") { snap = structuredClone(st); return {}; }
      if (q === "COMMIT") { snap = null; return {}; }
      if (q === "ROLLBACK") { if (snap) { st.keys = snap.keys; st.orders = snap.orders; st.items = snap.items; } return {}; }
      const k = `${p[0]}:${p[1]}`;
      if (q.startsWith("INSERT INTO idempotency_keys")) {
        if (st.keys[k]) return { rowCount: 0, rows: [] };
        st.keys[k] = { status: "PROCESSING", request_hash: p[2], expires_at: new Date(Date.now() + 864e5) };
        return { rowCount: 1, rows: [{ id: 1 }] };
      }
      if (q.startsWith("SELECT status, request_hash")) return { rows: st.keys[k] ? [st.keys[k]] : [] };
      if (q.includes("SET status = 'PROCESSING'")) { Object.assign(st.keys[k], { status: "PROCESSING", request_hash: p[2] }); return {}; }
      if (q.includes("SET status = 'COMPLETED'")) { Object.assign(st.keys[k], { status: "COMPLETED", response_code: 200, response_data: JSON.parse(p[2]) }); return {}; }
      if (q.startsWith("SELECT id, name, price FROM products")) return { rows: PRODUCTS.filter((x) => p[0].includes(x.id)) };
      if (q.startsWith("INSERT INTO orders")) { st.orders.push(p); return { rows: [{ id: st.orders.length, created_at: new Date() }] }; }
      if (q.startsWith("INSERT INTO order_items")) { if (failItems) throw new Error("DB lỗi giữa chừng"); st.items.push(p); return {}; }
      throw new Error("Câu SQL chưa được giả lập: " + q.slice(0, 60));
    },
  };
  return { st, client };
}

const KEY = "11111111-2222-4333-8444-555555555555";
const base = { name: "Nguyễn Văn A", phone: "0901234567", address: "Biên Hòa, Đồng Nai" };
const place = (db, body, key = KEY, user = null) => {
  const order = parseOrder(body);
  return executeIdempotentTransaction({
    dbClient: db.client, userId: user ? `u:${user}` : "guest", idempotencyKey: key,
    requestHash: hashRequest(canonicalOrder(order)), operation: (c) => createOrder(c, order, user ? { id: user } : null),
  });
};
const status = async (p) => { try { await p; return 200; } catch (e) { return e.statusCode || 500; } };

let n = 0;
const t = async (name, fn) => { await fn(); console.log("✓", name); n++; };

await t("tính tiền ở server, bỏ qua giá client gửi", async () => {
  const db = fakeDb();
  const r = await place(db, { ...base, items: [{ id: "cacao", qty: 2, price: 1 }, { id: "dieu", qty: 1, price: 1 }], total: 475000 });
  assert.equal(r.data.total, 2 * 145000 + 185000);
  assert.equal(db.st.orders.length, 1);
  assert.equal(db.st.items.length, 2);
  assert.equal(db.st.items[0][3], 145000); // unit_price lấy từ DB
});

await t("hỗ trợ cả dạng { orderInfo: {...} } của StorefrontHome", async () => {
  const db = fakeDb();
  const r = await place(db, { orderInfo: base, items: [{ id: "cacao", qty: 1 }], total: 145000 });
  assert.equal(r.data.customerName, "Nguyễn Văn A");
});

await t("sửa giá phía client -> 409 và KHÔNG tạo đơn", async () => {
  const db = fakeDb();
  const body = { ...base, items: [{ id: "cacao", qty: 1, price: 1000 }], total: 1000 };
  assert.equal(await status(place(db, body)), 409);
  assert.equal(db.st.orders.length, 0);
  assert.equal(Object.keys(db.st.keys).length, 0); // key không bị giữ, sửa giỏ rồi gửi lại được
});

await t("gửi lại cùng key + cùng đơn -> trả đơn cũ, không tạo đơn thứ 2", async () => {
  const db = fakeDb();
  const body = { ...base, items: [{ id: "cacao", qty: 1 }], total: 145000, createdAt: "2026-11-14T00:00:00Z" };
  const a = await place(db, body);
  const b = await place(db, { ...body, createdAt: "2026-11-14T00:00:09Z" });
  assert.equal(a.isReplay, false);
  assert.equal(b.isReplay, true);
  assert.equal(b.data.orderCode, a.data.orderCode);
  assert.equal(db.st.orders.length, 1);
});

await t("cùng key nhưng giỏ khác -> 422", async () => {
  const db = fakeDb();
  await place(db, { ...base, items: [{ id: "cacao", qty: 1 }], total: 145000 });
  assert.equal(await status(place(db, { ...base, items: [{ id: "cacao", qty: 5 }], total: 725000 })), 422);
  assert.equal(db.st.orders.length, 1);
});

await t("hộp quà: giá = tổng giá thành phần × số lượng", async () => {
  const db = fakeDb();
  const r = await place(db, { ...base, items: [{ id: "gift-abc", name: "Hộp quà", qty: 2, contents: ["cacao", "dieu", "cacao"] }] });
  assert.equal(r.data.total, 2 * (145000 * 2 + 185000));
  assert.equal(db.st.items[0][1], null); // product_id rỗng với hộp quà
});

await t("sản phẩm không tồn tại hoặc chưa có giá -> 409", async () => {
  assert.equal(await status(place(fakeDb(), { ...base, items: [{ id: "ma-gia", qty: 1 }] })), 409);
  assert.equal(await status(place(fakeDb(), { ...base, items: [{ id: "free", qty: 1 }] })), 409);
});

await t("lỗi giữa chừng -> ROLLBACK sạch, gửi lại cùng key vẫn được", async () => {
  const bad = fakeDb({ failItems: true });
  assert.equal(await status(place(bad, { ...base, items: [{ id: "cacao", qty: 1 }] })), 500);
  assert.equal(bad.st.orders.length, 0);
  assert.equal(Object.keys(bad.st.keys).length, 0);
});

await t("dữ liệu sai bị từ chối (400)", async () => {
  const items = [{ id: "cacao", qty: 1 }];
  const bad = (b) => assert.throws(() => parseOrder(b), (e) => e.statusCode === 400);
  bad({ ...base, items: [] });
  bad({ ...base, phone: "abc", items });
  bad({ ...base, name: "  ", items });
  bad({ ...base, address: "", items });
  bad({ ...base, items: [{ id: "cacao", qty: 0 }] });
  bad({ ...base, items: [{ id: "cacao", qty: 1.5 }] });
  bad({ ...base, items: [{ id: "cacao", qty: 100 }] });
  bad({ ...base, items: [{ id: "x", qty: 1, contents: [] }] });
  bad({ ...base, items: [{ id: "x", qty: 1, contents: Array(8).fill("cacao") }] });
  bad({ ...base, items: Array(31).fill({ id: "cacao", qty: 1 }) });
});

await t("key sai định dạng -> 400", async () => {
  assert.equal(await status(place(fakeDb(), { ...base, items: [{ id: "cacao", qty: 1 }] }, "abc")), 400);
});

console.log(`\nOK: ${n} nhóm kiểm thử đạt.`);
