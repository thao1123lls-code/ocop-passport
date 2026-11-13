// lib/idempotency.js
/**
 * Idempotency Service & Transaction Handler
 * Đảm bảo tính nguyên tử (Atomic) chống Double Charge và Race Condition.
 */

/**
 * Kiểm tra định dạng UUID v4 hợp lệ của Idempotency Key
 */
export function isValidUUID(str) {
  if (typeof str !== "string") return false;
  const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidV4Regex.test(str.trim());
}

/**
 * In-Memory Database Fallback (cho môi trường dev / local demo khi chưa kết nối PostgreSQL)
 */
const inMemoryKeys = new Map();

/**
 * Thực thi một tác vụ nghiệp vụ có bảo vệ Idempotency và Transaction
 * 
 * @param {Object} options
 * @param {Object} [options.dbClient] - Database Client (pg client/pool) nếu dùng DB thật
 * @param {string} options.userId - ID người dùng giao dịch
 * @param {string} options.idempotencyKey - Key gửi từ header
 * @param {Function} options.operation - Hàm nghiệp vụ (trừ tiền, lưu đơn hàng)
 * @returns {Promise<{ isReplay: boolean, statusCode: number, data: any }>}
 */
export async function executeIdempotentTransaction({
  dbClient = null,
  userId,
  idempotencyKey,
  operation,
}) {
  if (!idempotencyKey || typeof idempotencyKey !== "string") {
    const error = new Error("Header 'Idempotency-Key' là bắt buộc.");
    error.statusCode = 400;
    throw error;
  }

  const cleanKey = idempotencyKey.trim();
  if (!isValidUUID(cleanKey)) {
    const error = new Error("Header 'Idempotency-Key' không đúng chuẩn UUID v4.");
    error.statusCode = 400;
    throw error;
  }

  if (!userId) {
    const error = new Error("Không tìm thấy thông tin định danh tài khoản người dùng (user_id).");
    error.statusCode = 401;
    throw error;
  }

  // NẾU CÓ DATABASE THẬT (PostgreSQL client với transaction)
  if (dbClient && typeof dbClient.query === "function") {
    return await executeWithSqlTransaction(dbClient, userId, cleanKey, operation);
  }

  // FALLBACK ATOMIC IN-MEMORY (Hỗ trợ môi trường Next.js dev khi không có PG)
  return await executeWithInMemoryStore(userId, cleanKey, operation);
}

/**
 * Xử lý Transaction thực tế với PostgreSQL / SQL Server
 */
async function executeWithSqlTransaction(client, userId, key, operation) {
  // BẮT ĐẦU TRANSACTION
  await client.query("BEGIN;");

  try {
    // Bước 1: Thử chèn bản ghi PROCESSING (Tận dụng UNIQUE constraint làm trọng tài)
    const insertQuery = `
      INSERT INTO idempotency_keys (user_id, key, status, created_at, expires_at)
      VALUES ($1, $2, 'PROCESSING', NOW(), NOW() + INTERVAL '24 hours')
      ON CONFLICT (user_id, key) DO NOTHING
      RETURNING id;
    `;
    const insertRes = await client.query(insertQuery, [userId, key]);

    // Bước 2: Xử lý khi xảy ra xung đột key (Key đã tồn tại)
    if (insertRes.rowCount === 0) {
      // Đọc bản ghi hiện tại và khóa dòng (FOR UPDATE) để tránh race condition
      const checkQuery = `
        SELECT status, response_code, response_data, expires_at
        FROM idempotency_keys
        WHERE user_id = $1 AND key = $2
        FOR UPDATE;
      `;
      const existing = await client.query(checkQuery, [userId, key]);
      const record = existing.rows[0];

      // Nếu key đã hoàn thành: Trả về kết quả cũ đã lưu, KHÔNG trừ tiền lần 2
      if (record && record.status === "COMPLETED") {
        await client.query("COMMIT;");
        return {
          isReplay: true,
          statusCode: record.response_code || 200,
          data: record.response_data,
        };
      }

      // Nếu key đang được xử lý (2 request bay vào cùng lúc)
      if (record && record.status === "PROCESSING") {
        await client.query("ROLLBACK;");
        const error = new Error("Yêu cầu thanh toán đang được xử lý. Vui lòng không gửi lặp lại.");
        error.statusCode = 409; // 409 Conflict
        throw error;
      }

      // Nếu key bị thất bại trước đó
      if (record && record.status === "FAILED") {
        await client.query("ROLLBACK;");
        const error = new Error("Giao dịch trước đó với mã này đã thất bại. Vui lòng tạo phiên thanh toán mới.");
        error.statusCode = 422;
        throw error;
      }
    }

    // Bước 3: Nghiệp vụ trừ tiền & lưu đơn hàng trong cùng Transaction
    const result = await operation(client);

    // Bước 4: Lưu kết quả thành công vào idempotency_keys
    const updateSuccessQuery = `
      UPDATE idempotency_keys
      SET status = 'COMPLETED',
          response_code = $1,
          response_data = $2
      WHERE user_id = $3 AND key = $4;
    `;
    await client.query(updateSuccessQuery, [200, JSON.stringify(result), userId, key]);

    // Bước 5: COMMIT toàn bộ Transaction
    await client.query("COMMIT;");

    return {
      isReplay: false,
      statusCode: 200,
      data: result,
    };
  } catch (err) {
    // Nếu có bất kỳ lỗi nào: ROLLBACK toàn bộ thay đổi
    try {
      await client.query("ROLLBACK;");
    } catch {}

    // Ghi nhận trạng thái FAILED ra ngoài transaction
    try {
      await client.query(
        "UPDATE idempotency_keys SET status = 'FAILED', response_data = $1 WHERE user_id = $2 AND key = $3;",
        [JSON.stringify({ error: err.message }), userId, key]
      );
    } catch {}

    throw err;
  }
}

/**
 * Xử lý mô phỏng Atomic In-Memory (Dùng cho Next.js dev server)
 */
async function executeWithInMemoryStore(userId, key, operation) {
  const storeKey = `${userId}:${key}`;
  const now = Date.now();

  const existing = inMemoryKeys.get(storeKey);
  if (existing) {
    if (existing.expiresAt < now) {
      inMemoryKeys.delete(storeKey);
    } else if (existing.status === "COMPLETED") {
      return {
        isReplay: true,
        statusCode: existing.responseCode || 200,
        data: existing.responseData,
      };
    } else if (existing.status === "PROCESSING") {
      const error = new Error("Yêu cầu thanh toán đang được xử lý. Vui lòng chờ.");
      error.statusCode = 409;
      throw error;
    }
  }

  // Đặt trạng thái PROCESSING
  inMemoryKeys.set(storeKey, {
    userId,
    key,
    status: "PROCESSING",
    createdAt: now,
    expiresAt: now + 24 * 60 * 60 * 1000,
  });

  try {
    // Thực thi nghiệp vụ trừ tiền / tạo đơn
    const result = await operation();

    // Cập nhật COMPLETED
    inMemoryKeys.set(storeKey, {
      userId,
      key,
      status: "COMPLETED",
      responseCode: 200,
      responseData: result,
      createdAt: now,
      expiresAt: now + 24 * 60 * 60 * 1000,
    });

    return {
      isReplay: false,
      statusCode: 200,
      data: result,
    };
  } catch (err) {
    inMemoryKeys.set(storeKey, {
      userId,
      key,
      status: "FAILED",
      responseCode: err.statusCode || 500,
      responseData: { error: err.message },
      createdAt: now,
      expiresAt: now + 24 * 60 * 60 * 1000,
    });
    throw err;
  }
}
