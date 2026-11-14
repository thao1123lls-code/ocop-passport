# Hệ Thống Web Form Chịu Tải Cao (High-Concurrency Form System)

Hệ thống được thiết kế theo kiến trúc **Asynchronous Event-Driven & Queue Buffering** nhằm giải quyết bài toán hàng triệu người dùng truy cập và gửi form cùng thời điểm mà không làm sập Database hoặc treo máy chủ.

---

## 1. Kiến Trúc Hệ Thống (Architecture Flow)

```
[1,000,000 Users] 
       │ (Gửi Form)
       ▼
[Frontend Client] ──(Instant Disable + UUID Idempotency-Key)
       │ (HTTP POST)
       ▼
[Express Server]  ──(Phản hồi < 5ms: 202 Accepted + Job ID)
       │ (Đẩy vào RAM Queue)
       ▼
[Redis (BullMQ)]  ──(Buffer hàng đợi an toàn, chống Deadlock)
       │ (Lấy job theo concurrency = 20)
       ▼
[Background Worker]
       │ (Ghi ngầm theo tốc độ an toàn)
       ▼
[PostgreSQL Database] ──(Connection Pool + Indexing + ON CONFLICT)
```

---

## 2. Hướng Dẫn Cài Đặt & Chạy Trên VS Code

### Bước 1: Khởi động Redis & PostgreSQL (Docker hoặc Cài cục bộ)
Nếu dùng Docker:
```bash
docker run -d --name redis-queue -p 6379:6379 redis:alpine
docker run -d --name postgres-db -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=high_concurrency_db postgres:15
```

### Bước 2: Tạo Bảng Database
Chạy file SQL `schema.sql` trong PostgreSQL:
```bash
psql -U postgres -d high_concurrency_db -f schema.sql
```

### Bước 3: Cài đặt Dependencies
```bash
cd high-concurrency-form
npm install
```

### Bước 4: Khởi động Server & Worker
- Chạy Web Server:
  ```bash
  npm run dev
  # Server lắng nghe tại: http://localhost:5000
  ```
- Mở terminal thứ 2 để chạy Background Worker:
  ```bash
  npm run worker
  ```

---

## 3. Kiểm Thử Tải (Load Testing)

### Bằng K6:
```bash
k6 run load-test/k6-load-test.js
```

### Bằng Artillery:
```bash
npx artillery run load-test/artillery-test.yml
```
