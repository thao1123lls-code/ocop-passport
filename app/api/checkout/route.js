// app/api/checkout/route.js
import { NextResponse } from "next/server";
import { executeIdempotentTransaction } from "@/lib/idempotency";

/**
 * Endpoint POST /api/checkout
 * Xử lý thanh toán và tạo đơn hàng với cơ chế Idempotency Key chống Double Charge.
 */
export async function POST(request) {
  try {
    // 1. Đọc Idempotency-Key từ Request Headers
    const idempotencyKey =
      request.headers.get("idempotency-key") ||
      request.headers.get("Idempotency-Key");

    if (!idempotencyKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Thiếu header 'Idempotency-Key'. Yêu cầu cung cấp UUID v4 duy nhất cho mỗi giao dịch.",
        },
        { status: 400 }
      );
    }

    // 2. Xác định người dùng / tài khoản (từ Session / JWT / Auth Token)
    const userId =
      request.headers.get("x-user-id") ||
      request.headers.get("authorization")?.slice(0, 32) ||
      "user_dongnai_customer";

    // 3. Đọc dữ liệu đơn hàng từ Request Body
    const body = await request.json().catch(() => ({}));
    const { items = [], orderInfo = {}, total = 0 } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Giỏ hàng rỗng, không thể thực hiện thanh toán." },
        { status: 400 }
      );
    }

    // 4. Thực thi thông qua Idempotency Service (Atomic Transaction)
    const result = await executeIdempotentTransaction({
      userId,
      idempotencyKey,
      operation: async (/* sqlClient */) => {
        // --- BƯỚC NGHIỆP VỤ TRỪ TIỀN & TẠO ĐƠN ---
        // Tại đây nếu dùng PostgreSQL, bạn gọi:
        // await sqlClient.query("UPDATE wallets SET balance = balance - $1 WHERE user_id = $2 AND balance >= $1;", [total, userId]);
        // await sqlClient.query("INSERT INTO orders (id, user_id, amount, ...) VALUES ($1, $2, $3, ...);");

        const orderCode = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(
          1000 + Math.random() * 9000
        )}`;

        // Mô phỏng độ trễ xử lý ngân hàng / cổng thanh toán (300ms)
        await new Promise((resolve) => setTimeout(resolve, 300));

        return {
          orderCode,
          userId,
          amountPaid: total,
          itemCount: items.reduce((s, x) => s + (x.qty || 1), 0),
          customerName: orderInfo.name || "Khách hàng OCOP",
          phone: orderInfo.phone || "",
          address: orderInfo.address || "",
          paymentStatus: "PAID_SUCCESS",
          paidAt: new Date().toISOString(),
          message: "Thanh toán thành công và đã tạo đơn hàng an toàn.",
        };
      },
    });

    // 5. Trả về kết quả cho Client
    const responseHeaders = new Headers();
    if (result.isReplay) {
      responseHeaders.set("Idempotent-Replayed", "true");
    }

    return NextResponse.json(
      {
        success: true,
        isDuplicatePrevented: result.isReplay,
        data: result.data,
      },
      {
        status: result.statusCode || 200,
        headers: responseHeaders,
      }
    );
  } catch (err) {
    console.error("[Checkout API Error]", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Lỗi xử lý thanh toán.",
      },
      { status: err.statusCode || 500 }
    );
  }
}
