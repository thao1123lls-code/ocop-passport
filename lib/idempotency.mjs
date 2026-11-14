// lib/idempotency.mjs
/**
 * Idempotency Service: chống tạo đơn / trừ tiền 2 lần khi người dùng bấm lặp hoặc mạng chập chờn.
 *
 * Cách hoạt động (nhánh PostgreSQL, dùng cho production):
 *  - Bảng idempotency_keys có UNIQUE (user_id, key) làm "trọng tài" ở tầng DB.
 *  - Cùng key + cùng nội dung đơn  -> trả lại kết quả cũ (isReplay = true), KHÔNG tạo đơn mới.
 *  - Cùng key + nội dung KHÁC      -> 422 (key bị dùng sai), tránh trả nhầm đơn của giỏ hàng khác.
 *  - Lỗi giữa chừng                -> ROLLBACK toàn bộ, không lưu gì, nên có thể gửi lại cùng key.
 *  - Hai request song song cùng key -> request sau tự chờ request trước COMMIT rồi nhận kết quả cũ.
 *
 * Nhánh in-memory chỉ để chạy thử khi không có DB (không an toàn khi nhiều instance / serverless).
 */
import crypto from "node:crypto";

const TTL_MS = 24 * 60 * 60 * 1000;

/** Băm nội dung yêu cầu đã chuẩn hóa để phát hiện "cùng key nhưng khác nội dung". */
export const hashRequest = (obj) => crypto.createHash("sha256").update(JSON.stringify(obj)).digest("hex");

/** Key do client sinh (UUID v4 hoặc chuỗi ngẫu nhiên 16-128 ký tự gồm chữ, số, . _ : -). */
export const isValidKey = (s) => typeof s === "string" && /^[A-Za-z0-9._:-]{16,128}$/.test(s.trim());

/** Giữ lại để tương thích code cũ. */
export function isValidUUID(str) {
  if (typeof str !== "string") return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str.trim());
}

const httpError = (message, statusCode) => Object.assign(new Error(message), { statusCode });

const inMemoryKeys = new Map();

/**
 * @param {Object} o
 * @param {Object} [o.dbClient]   pg client đã pool.connect() (chưa BEGIN). Không truyền = chạy in-memory.
 * @param {string} o.userId       phạm vi của key: "u:<id>" hoặc "guest"
 * @param {string} o.idempotencyKey
 * @param {string} [o.requestHash] kết quả của hashRequest(...)
 * @param {Function} o.operation  async (client) => dữ liệu trả về (được lưu lại để replay)
 * @returns {Promise<{ isReplay: boolean, statusCode: number, data: any }>}
 */
export async function executeIdempotentTransaction({ dbClient = null, userId, idempotencyKey, requestHash = null, operation }) {
  if (!idempotencyKey || typeof idempotencyKey !== "string") throw httpError("Header 'Idempotency-Key' là bắt buộc.", 400);
  const key = idempotencyKey.trim();
  if (!isValidKey(key)) throw httpError("Header 'Idempotency-Key' không hợp lệ (16-128 ký tự chữ, số, . _ : -).", 400);
  if (!userId) throw httpError("Thiếu phạm vi định danh cho Idempotency-Key.", 401);

  if (dbClient && typeof dbClient.query === "function") return executeWithSql(dbClient, userId, key, requestHash, operation);
  return executeInMemory(userId, key, requestHash, operation);
}

async function executeWithSql(client, scope, key, hash, operation) {
  await client.query("BEGIN");
  try {
    const ins = await client.query(
      `INSERT INTO idempotency_keys (user_id, key, status, request_hash, expires_at)
       VALUES ($1, $2, 'PROCESSING', $3, NOW() + INTERVAL '24 hours')
       ON CONFLICT (user_id, key) DO NOTHING
       RETURNING id`,
      [scope, key, hash],
    );

    if (ins.rowCount === 0) {
      // Key đã tồn tại: khóa dòng rồi xem trạng thái
      const { rows } = await client.query(
        `SELECT status, request_hash, response_code, response_data, expires_at
         FROM idempotency_keys WHERE user_id = $1 AND key = $2 FOR UPDATE`,
        [scope, key],
      );
      const rec = rows[0];
      const reusable = !rec || rec.status === "FAILED" || new Date(rec.expires_at) < new Date();

      if (!reusable) {
        if (rec.request_hash && hash && rec.request_hash !== hash) {
          throw httpError("Idempotency-Key này đã được dùng cho một đơn hàng khác. Vui lòng tải lại trang để tạo mã mới.", 422);
        }
        if (rec.status === "COMPLETED") {
          await client.query("COMMIT");
          return { isReplay: true, statusCode: rec.response_code || 200, data: rec.response_data };
        }
        throw httpError("Yêu cầu đang được xử lý. Vui lòng không gửi lặp lại.", 409);
      }

      // Key hết hạn hoặc bản ghi cũ thất bại: cho chạy lại với cùng dòng
      await client.query(
        `UPDATE idempotency_keys
         SET status = 'PROCESSING', request_hash = $3, response_code = NULL, response_data = NULL,
             created_at = NOW(), expires_at = NOW() + INTERVAL '24 hours'
         WHERE user_id = $1 AND key = $2`,
        [scope, key, hash],
      );
    }

    const result = await operation(client);

    await client.query(
      `UPDATE idempotency_keys SET status = 'COMPLETED', response_code = 200, response_data = $3
       WHERE user_id = $1 AND key = $2`,
      [scope, key, JSON.stringify(result)],
    );
    await client.query("COMMIT");
    return { isReplay: false, statusCode: 200, data: result };
  } catch (err) {
    // ROLLBACK xóa luôn dòng PROCESSING, nên người dùng sửa giỏ hàng rồi gửi lại cùng key vẫn được.
    try { await client.query("ROLLBACK"); } catch {}
    throw err;
  }
}

async function executeInMemory(scope, key, hash, operation) {
  const k = `${scope}:${key}`;
  const now = Date.now();
  const ex = inMemoryKeys.get(k);
  if (ex && ex.expiresAt > now) {
    if (ex.hash && hash && ex.hash !== hash) throw httpError("Idempotency-Key này đã được dùng cho một đơn hàng khác.", 422);
    if (ex.status === "COMPLETED") return { isReplay: true, statusCode: 200, data: ex.data };
    throw httpError("Yêu cầu đang được xử lý. Vui lòng chờ.", 409);
  }
  inMemoryKeys.set(k, { status: "PROCESSING", hash, expiresAt: now + TTL_MS });
  try {
    const data = await operation(null);
    inMemoryKeys.set(k, { status: "COMPLETED", hash, data, expiresAt: now + TTL_MS });
    return { isReplay: false, statusCode: 200, data };
  } catch (err) {
    inMemoryKeys.delete(k); // lỗi: cho phép thử lại cùng key
    throw err;
  }
}
