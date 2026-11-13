-- ============================================================================
-- SCHEMA: TỐI ƯU HÓA CHO HỆ THỐNG GHI FORM CHỊU TẢI CAO (POSTGRESQL)
-- ============================================================================

-- Bật extension mở rộng nếu cần
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Bảng lưu dữ liệu form chính
CREATE TABLE IF NOT EXISTS form_submissions (
    id BIGSERIAL PRIMARY KEY,
    job_id VARCHAR(64) NOT NULL,                    -- ID nhiệm vụ từ BullMQ để tra cứu
    idempotency_key VARCHAR(128) NOT NULL,          -- Khóa chống ghi trùng lặp
    full_name VARCHAR(128) NOT NULL,
    email VARCHAR(128) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    category VARCHAR(64) DEFAULT 'OCOP_REGISTER',
    payload JSONB NULL,                             -- Lưu các trường thông tin mở rộng
    status VARCHAR(20) NOT NULL DEFAULT 'PROCESSED', -- 'QUEUED', 'PROCESSED', 'FAILED'
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    -- Ràng buộc chống ghi trùng lặp tuyệt đối
    CONSTRAINT uq_form_idempotency UNIQUE (idempotency_key)
);

-- 2. Chỉ mục tối ưu hóa tốc độ truy vấn
CREATE INDEX IF NOT EXISTS idx_submissions_job_id ON form_submissions(job_id);
CREATE INDEX IF NOT EXISTS idx_submissions_email ON form_submissions(email);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON form_submissions(created_at DESC);
