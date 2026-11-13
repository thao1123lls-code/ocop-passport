// high-concurrency-form/src/queue.js
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

/**
 * CẤU HÌNH KẾT NỐI REDIS CHỊU TẢI CAO
 * - maxRetriesPerRequest: null là bắt buộc đối với BullMQ
 * - enableReadyCheck: false để giảm độ trễ khi khởi tạo
 */
export const redisConnection = new IORedis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  keepAlive: 10000,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redisConnection.on('connect', () => {
  console.log('✓ Kết nối Redis thành công.');
});

redisConnection.on('error', (err) => {
  console.warn('⚠️ Cảnh báo kết nối Redis:', err.message);
});

export const QUEUE_NAME = 'form-submissions-queue';

/**
 * HÀNG ĐỢI BULLMQ ĐỂ TIẾP NHẬN REQUEST GHI FORM
 * Đảm bảo thời gian nhận và phản hồi cho client chỉ mất 1-3ms.
 */
export const formQueue = new Queue(QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3, // Tự động retry 3 lần nếu worker ghi DB bị lỗi
    backoff: {
      type: 'exponential',
      delay: 1000, // 1s, 2s, 4s
    },
    removeOnComplete: {
      count: 2000, // Chỉ giữ lại 2000 job hoàn tất gần nhất để giải phóng RAM Redis
      age: 3600,   // hoặc quá 1 giờ
    },
    removeOnFail: {
      count: 5000,
    },
  },
});
