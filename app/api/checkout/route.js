// POST /api/checkout  → tạo đơn hàng (chống tạo trùng bằng Idempotency-Key, tính tiền ở server)
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { badOrigin, currentUser, tooMany, clientIp } from "@/lib/auth";
import { executeIdempotentTransaction, hashRequest, isValidKey } from "@/lib/idempotency.mjs";
import { parseOrder, canonicalOrder, createOrder } from "@/lib/checkout.mjs";

export const dynamic = "force-dynamic";

const reply = (error, status, extra = {}) => NextResponse.json({ success: false, error, ...extra }, { status });

export async function POST(request) {
  if (badOrigin(request)) return reply("Yêu cầu không hợp lệ (sai nguồn).", 403);

  const key = (request.headers.get("idempotency-key") || "").trim();
  if (!isValidKey(key)) return reply("Thiếu hoặc sai header 'Idempotency-Key' (cần mã ngẫu nhiên duy nhất cho mỗi đơn).", 400);
  if (!process.env.DATABASE_URL) return reply("Hệ thống chưa kết nối cơ sở dữ liệu nên chưa nhận được đơn hàng.", 503);

  // Danh tính chỉ lấy từ phiên đăng nhập (cookie ký HMAC), KHÔNG tin header do client gửi.
  let user = null;
  try { user = await currentUser(); } catch {}
  if (!user && process.env.CHECKOUT_REQUIRE_LOGIN === "true") return reply("Bạn cần đăng nhập để đặt hàng.", 401);

  if (tooMany(`checkout:${user ? "u" + user.id : clientIp(request)}`, 15)) {
    return reply("Bạn thao tác quá nhiều lần, vui lòng đợi ít phút.", 429);
  }

  let order;
  try {
    order = parseOrder(await request.json().catch(() => ({})));
  } catch (e) {
    return reply(e.message, e.statusCode || 400);
  }

  let client;
  try {
    client = await pool.connect();
  } catch (e) {
    console.error("[checkout] db connect", e.message);
    return reply("Không kết nối được cơ sở dữ liệu, vui lòng thử lại.", 503);
  }

  try {
    const result = await executeIdempotentTransaction({
      dbClient: client,
      userId: user ? `u:${user.id}` : "guest",
      idempotencyKey: key,
      requestHash: hashRequest(canonicalOrder(order)),
      operation: (c) => createOrder(c, order, user),
    });
    return NextResponse.json(
      // orderCode/orderId đặt ở cấp ngoài vì CartDrawer đọc ở đó; `data` giữ lại cho StorefrontHome
      { success: true, isDuplicatePrevented: result.isReplay, orderCode: result.data.orderCode, orderId: result.data.orderCode, data: result.data },
      { status: result.isReplay ? 200 : 201, headers: result.isReplay ? { "Idempotent-Replayed": "true" } : {} },
    );
  } catch (e) {
    const status = e.statusCode || 500;
    if (status >= 500) console.error("[checkout]", e);
    return reply(status >= 500 ? "Không tạo được đơn hàng. Vui lòng thử lại." : e.message, status, e.extra || {});
  } finally {
    client.release();
  }
}
