// high-concurrency-form/src/worker.js
import { Worker } from 'bullmq';
import { redisConnection, QUEUE_NAME } from './queue.js';
import { pool } from './db.js';

/**
 * WORKER TIÊU THỤ HÀNG ĐỢI VÀ GHI XUỐNG DATABASE
 * - concurrency: 25 -> Worker chạy tối đa 25 tác vụ song song, khớp với DB Connection Pool.
 * - Tuyệt đối không để số lượng concurrency vượt quá pool size của Database.
 */
export const formWorker = new Worker(
  QUEUE_NAME,
  async (job) => {
    const { idempotencyKey, fullName, email, phone, category, payload } = job.data;

    // Câu lệnh SQL có ON CONFLICT để chống ghi trùng lặp tuyệt đối ở tầng DB
    const insertQuery = `
      INSERT INTO form_submissions (
        job_id, idempotency_key, full_name, email, phone, category, payload, status, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'PROCESSED', NOW())
      ON CONFLICT (idempotency_key) DO NOTHING
      RETURNING id, created_at;
    `;

    const values = [
      job.id,
      idempotencyKey,
      fullName,
      email,
      phone,
      category || 'GENERAL',
      JSON.stringify(payload || {}),
    ];

    try {
      const res = await pool.query(insertQuery, values);

      if (res.rowCount === 0) {
        console.log(`[Worker] Job ${job.id} bỏ qua do trùng lặp Idempotency Key: ${idempotencyKey}`);
        return { status: 'DUPLICATE_IGNORED', jobId: job.id };
      }

      console.log(`[Worker] ✓ Đã lưu vào DB thành công | JobId: ${job.id} | RecordId: ${res.rows[0].id}`);
      return { status: 'SUCCESS', recordId: res.rows[0].id, jobId: job.id };
    } catch (err) {
      console.error(`[Worker] ❌ Lỗi ghi DB cho Job ${job.id}:`, err.message);
      // Ném lỗi để BullMQ kích hoạt cơ chế retry tự động theo backoff
      throw err;
    }
  },
  {
    connection: redisConnection,
    concurrency: 20, // Giới hạn số luồng xử lý song song để bảo vệ Database
  }
);

formWorker.on('completed', (job) => {
  // Job hoàn thành
});

formWorker.on('failed', (job, err) => {
  console.error(`[Worker] ⚠️ Job ${job?.id} thất bại sau các lần retry:`, err.message);
});

console.log('⚡ Worker BullMQ đã khởi động và sẵn sàng xử lý hàng đợi ngầm...');
