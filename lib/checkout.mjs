// lib/checkout.mjs
// Logic đặt hàng thuần (không phụ thuộc Next.js) để dễ kiểm thử: kiểm tra dữ liệu, tính tiền ở SERVER, ghi đơn vào DB.
import crypto from "node:crypto";

export const LIMITS = { lines: 30, qty: 99, boxSlots: 7 };

const fail = (message, statusCode = 400, extra) => Object.assign(new Error(message), { statusCode, extra });
const s = (v, max) => String(v ?? "").trim().slice(0, max);

/**
 * Chuẩn hóa và kiểm tra body. Hỗ trợ cả 2 dạng client:
 *  - { orderInfo: {name, phone, address, note}, items, total }   (StorefrontHome)
 *  - { name, phone, address, note, items, total }                (CartDrawer)
 * Mỗi dòng hàng: sản phẩm { id, qty } hoặc hộp quà { id, qty, name, contents: [id sản phẩm...] }.
 * Giá và tên do client gửi bị BỎ QUA, chỉ lấy id + số lượng.
 */
export function parseOrder(body) {
  const b = body && typeof body === "object" ? body : {};
  const info = b.orderInfo && typeof b.orderInfo === "object" ? b.orderInfo : b;

  const customer = { name: s(info.name, 128), phone: s(info.phone, 32), address: s(info.address, 500), note: s(info.note, 500) };
  if (!customer.name) throw fail("Vui lòng nhập họ tên người nhận.");
  if (!/^\+?[0-9\s().-]{8,20}$/.test(customer.phone)) throw fail("Số điện thoại không hợp lệ.");
  if (!customer.address) throw fail("Vui lòng nhập địa chỉ giao hàng.");

  const raw = Array.isArray(b.items) ? b.items : [];
  if (!raw.length) throw fail("Giỏ hàng rỗng, không thể đặt hàng.");
  if (raw.length > LIMITS.lines) throw fail(`Giỏ hàng tối đa ${LIMITS.lines} dòng.`);

  const lines = raw.map((it) => {
    const id = s(it?.id, 128);
    const qty = Number(it?.qty);
    if (!id) throw fail("Có sản phẩm trong giỏ thiếu mã.");
    if (!Number.isInteger(qty) || qty < 1 || qty > LIMITS.qty) throw fail(`Số lượng mỗi dòng phải từ 1 đến ${LIMITS.qty}.`);
    if (Array.isArray(it.contents)) {
      const contents = it.contents.map((x) => s(x, 128));
      if (!contents.length || contents.length > LIMITS.boxSlots || contents.some((x) => !x)) {
        throw fail(`Hộp quà phải có từ 1 đến ${LIMITS.boxSlots} sản phẩm hợp lệ.`);
      }
      return { kind: "gift", qty, label: s(it.name, 200) || "Hộp quà OCOP tự chọn", contents };
    }
    return { kind: "product", id, qty };
  });

  const clientTotal = b.total === undefined || b.total === null ? null : Number(b.total);
  return { customer, lines, clientTotal };
}

/** Chuỗi chuẩn hóa để băm: thứ tự dòng không ảnh hưởng, bỏ qua giá/thời gian do client gửi. */
export function canonicalOrder({ customer, lines }) {
  const ls = lines
    .map((l) => (l.kind === "gift" ? { g: [...l.contents].sort(), q: l.qty } : { p: l.id, q: l.qty }))
    .map((x) => JSON.stringify(x))
    .sort();
  return { c: [customer.name, customer.phone, customer.address, customer.note], l: ls };
}

/** Tính tiền từ bảng products và ghi đơn. Phải chạy bên trong transaction (client đã BEGIN). */
export async function createOrder(client, order, user) {
  const ids = [...new Set(order.lines.flatMap((l) => (l.kind === "gift" ? l.contents : [l.id])))];
  const { rows } = await client.query("SELECT id, name, price FROM products WHERE id = ANY($1::text[])", [ids]);
  const byId = new Map(rows.map((r) => [r.id, r]));
  const priceOf = (id) => {
    const p = byId.get(id);
    if (!p || !(p.price > 0)) throw fail(`Sản phẩm "${id}" không còn bán hoặc chưa có giá. Vui lòng xóa khỏi giỏ.`, 409);
    return p;
  };

  const priced = order.lines.map((l) => {
    if (l.kind === "gift") {
      const unit = l.contents.reduce((sum, id) => sum + priceOf(id).price, 0);
      return { product_id: null, name: l.label, unit, qty: l.qty, contents: l.contents };
    }
    const p = priceOf(l.id);
    return { product_id: p.id, name: p.name, unit: p.price, qty: l.qty, contents: null };
  });
  const total = priced.reduce((sum, x) => sum + x.unit * x.qty, 0);

  if (order.clientTotal !== null && order.clientTotal !== total) {
    throw fail("Giá trong giỏ khác với giá hiện tại của hệ thống. Vui lòng tải lại trang và kiểm tra lại giỏ hàng.", 409, { serverTotal: total });
  }

  const code = `OP-${Date.now().toString(36)}-${crypto.randomBytes(3).toString("hex")}`.toUpperCase();
  const o = await client.query(
    `INSERT INTO orders (code, user_id, customer_name, phone, address, note, total)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id, created_at`,
    [code, user ? user.id : null, order.customer.name, order.customer.phone, order.customer.address, order.customer.note || null, total],
  );
  const orderId = o.rows[0].id;
  for (const x of priced) {
    await client.query(
      `INSERT INTO order_items (order_id, product_id, name, unit_price, qty, contents)
       VALUES ($1,$2,$3,$4,$5,$6::jsonb)`,
      [orderId, x.product_id, x.name, x.unit, x.qty, x.contents ? JSON.stringify(x.contents) : null],
    );
  }

  return {
    orderCode: code,
    total,
    itemCount: priced.reduce((sum, x) => sum + x.qty, 0),
    customerName: order.customer.name,
    phone: order.customer.phone,
    address: order.customer.address,
    status: "pending",
    paymentStatus: "COD_PENDING",
    createdAt: new Date(o.rows[0].created_at).toISOString(),
    message: "Đã tiếp nhận đơn hàng. Cửa hàng sẽ liên hệ xác nhận và thu tiền khi giao hàng (COD).",
  };
}
