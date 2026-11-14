// high-concurrency-form/load-test/k6-load-test.js
/**
 * KỊCH BẢN KIỂM THỬ TẢI CAO (K6 LOAD TEST)
 * Giả lập hàng nghìn người dùng truy cập đồng thời và gửi form liên tục.
 * 
 * Cách chạy:
 * k6 run high-concurrency-form/load-test/k6-load-test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  // Giai đoạn tăng tải (Ramping up VUs)
  stages: [
    { duration: '15s', target: 200 },  // Tăng lên 200 users đồng thời trong 15s
    { duration: '30s', target: 1000 }, // Đỉnh điểm 1,000 users đồng thời trong 30s
    { duration: '15s', target: 0 },    // Hạ nhiệt về 0
  ],
  thresholds: {
    // 99% request phải phản hồi dưới 50ms (Nhờ kiến trúc Redis Queue)
    http_req_duration: ['p(99)<50'],
    // Tỷ lệ lỗi cho phép dưới 0.1%
    http_req_failed: ['rate<0.001'],
  },
};

export default function () {
  const url = 'http://localhost:5000/api/submit-form';
  const vuId = __VU;
  const iterId = __ITER;
  const uniqueKey = `K6-${vuId}-${iterId}-${Date.now()}`;

  const payload = JSON.stringify({
    fullName: `Tester Virtual User ${vuId}`,
    email: `vu_${vuId}_${iterId}@benchmark.com`,
    phone: `098${Math.floor(1000000 + Math.random() * 9000000)}`,
    category: 'OCOP_EXPO_VIP',
    idempotencyKey: uniqueKey,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': uniqueKey,
    },
  };

  const res = http.post(url, payload, params);

  // Kiểm tra hệ thống phải trả về đúng HTTP 202 Accepted
  check(res, {
    'Status là 202 Accepted': (r) => r.status === 202,
    'Có chứa trackingId': (r) => r.json('trackingId') !== undefined,
  });

  sleep(0.1); // Giãn cách nhẹ giữa các lần bắn
}
