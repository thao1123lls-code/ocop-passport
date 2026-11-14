// high-concurrency-form/src/server.js
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { formQueue } from './queue.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware cơ bản
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Phục vụ thư mục Frontend tĩnh
app.use(express.static(path.join(__dirname, '../public')));

/**
 * HEALTH CHECK ENDPOINT (Dành cho Nginx / AWS ALB / Kubernetes liveness probe)
 */
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: Date.now() });
});

/**
 * ENDPOINT CHÍNH: TIẾP NHẬN FORM CHỊU TẢI CAO (POST /api/submit-form)
 * - Tốc độ phản hồi cực nhanh: < 5ms
 * - Không chọc thẳng vào Database, chỉ nạp dữ liệu vào Redis Queue
 * - Trả về HTTP 202 Accepted kèm Job ID để client tra cứu
 */
app.post('/api/submit-form', async (req, res) => {
  try {
    const { fullName, email, phone, category, payload } = req.body;

    // 1. Validation nhanh ở tầng RAM
    if (!fullName || !email || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng điền đầy đủ Họ tên, Email và Số điện thoại.',
      });
    }

    // 2. Lấy hoặc sinh Idempotency Key
    const idempotencyKey =
      req.headers['idempotency-key'] ||
      req.body.idempotencyKey ||
      `KEY-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    // 3. Đẩy vào Redis Queue qua BullMQ
    // Dùng idempotencyKey làm jobId của BullMQ để Redis tự loại trừ job trùng
    const job = await formQueue.add(
      'form-process',
      {
        idempotencyKey,
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        category: category || 'GENERAL',
        payload: payload || {},
        receivedAt: new Date().toISOString(),
      },
      {
        jobId: idempotencyKey, // Ngăn tạo 2 job trùng key cùng lúc trong Redis
      }
    );

    // 4. Trả về ngay lập tức mã 202 Accepted (Đã tiếp nhận)
    return res.status(202).json({
      success: true,
      message: 'Hệ thống đã tiếp nhận dữ liệu và đang xử lý an toàn.',
      trackingId: job.id,
      queueStatus: 'QUEUED',
    });
  } catch (err) {
    console.error('[API Submit Error]', err.message);
    return res.status(500).json({
      success: false,
      error: 'Hệ thống đang quá tải tạm thời. Vui lòng thử lại sau vài giây.',
    });
  }
});

/**
 * ENDPOINT TRA CỨU TRẠNG THÁI XỬ LÝ (GET /api/form-status/:jobId)
 * Client có thể polling kiểm tra trạng thái job
 */
app.get('/api/form-status/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await formQueue.getJob(jobId);

    if (!job) {
      return res.status(404).json({ success: false, status: 'NOT_FOUND' });
    }

    const state = await job.getState(); // 'waiting' | 'active' | 'completed' | 'failed'
    const progress = job.progress;
    const returnValue = job.returnvalue;

    return res.status(200).json({
      success: true,
      jobId,
      state,
      progress,
      result: returnValue,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Khởi chạy server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 High-Concurrency Web Form Server chạy tại: http://localhost:${PORT}`);
  console.log(`⚡ Kiến trúc: Express (Async) -> Redis (BullMQ) -> PostgreSQL Pool`);
  console.log(`=======================================================`);
});
