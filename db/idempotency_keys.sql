-- ============================================================================
-- MIGRATION: Tạo bảng idempotency_keys & cơ chế chống Double Charge
-- Ràng buộc: UNIQUE(user_id, key) làm trọng tài chặn race condition cấp Database
-- ============================================================================

-- 1. Bảng lưu trữ Idempotency Key
CREATE TABLE IF NOT EXISTS idempotency_keys (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    key VARCHAR(128) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PROCESSING', -- 'PROCESSING', 'COMPLETED', 'FAILED'
    response_code INT NULL,                          -- HTTP Status Code (ví dụ: 200, 201)
    response_data JSONB NULL,                         -- Dữ liệu phản hồi đã lưu (mã GD, số tiền, chi tiết đơn)
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),

    -- Ràng buộc cốt lõi: Chặn triệt để 2 request trùng lặp hoặc race condition
    CONSTRAINT uq_idempotency_user_key UNIQUE (user_id, key)
);

-- 2. Chỉ mục tối ưu hóa truy vấn tra cứu và cleanup TTL
CREATE INDEX IF NOT EXISTS idx_idempotency_expires_at ON idempotency_keys(expires_at);
CREATE INDEX IF NOT EXISTS idx_idempotency_lookup ON idempotency_keys(user_id, key, status);

-- 3. Cơ chế tự động dọn dẹp các key đã hết hạn sau 24h (TTL Cleanup)
-- Cách A: Stored Procedure dọn dẹp định kỳ
CREATE OR REPLACE FUNCTION cleanup_expired_idempotency_keys()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM idempotency_keys
    WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Cách B: Tích hợp với pg_cron (nếu PostgreSQL bật extension pg_cron)
-- Chạy mỗi giờ một lần để xóa các key đã hết hạn
-- SELECT cron.schedule('cleanup-idempotency-keys', '0 * * * *', 'SELECT cleanup_expired_idempotency_keys()');
