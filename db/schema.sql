-- ============================================================================
-- OCOP Passport: bảng sản phẩm & nhật ký sản xuất (PostgreSQL / Supabase)
-- Chạy được nhiều lần (IF NOT EXISTS)
-- ============================================================================

-- ---------- Người dùng & phân quyền ----------
CREATE TABLE IF NOT EXISTS users (
    id            BIGSERIAL PRIMARY KEY,
    email         VARCHAR(255) NOT NULL UNIQUE,      -- luôn lưu chữ thường
    name          VARCHAR(128) NOT NULL,
    password_hash TEXT NOT NULL,                     -- scrypt, không bao giờ lưu mật khẩu gốc
    role          VARCHAR(16) NOT NULL DEFAULT 'owner' CHECK (role IN ('admin','owner','volunteer')),
    status        VARCHAR(16) NOT NULL DEFAULT 'active' CHECK (status IN ('active','pending','disabled')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
    id          VARCHAR(128) PRIMARY KEY,           -- slug, dùng trong link /p/[id] và mã QR
    name        VARCHAR(255) NOT NULL,
    category    VARCHAR(100),
    price       INTEGER NOT NULL DEFAULT 0 CHECK (price >= 0),  -- VND
    promo       VARCHAR(255),
    farm        VARCHAR(255),
    lot         VARCHAR(64),
    weight      VARCHAR(128),
    ingredients TEXT,
    expiry      VARCHAR(128),
    storage     TEXT,
    certs       VARCHAR(255),
    story       TEXT,
    shop        TEXT,                               -- link gian hàng (http/https)
    photo       TEXT,
    verified    BOOLEAN NOT NULL DEFAULT FALSE,
    content     JSONB,                              -- nội dung bán hàng AI đã duyệt
    owner_id    BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS diary_entries (
    id          VARCHAR(64) PRIMARY KEY,
    product_id  VARCHAR(128) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    stage       VARCHAR(32) NOT NULL
                CHECK (stage IN ('Gieo trồng','Chăm sóc','Thu hoạch','Sơ chế','Đóng gói','Xuất bán')),
    text        TEXT NOT NULL,
    photo       TEXT,
    audio       TEXT,
    geo         JSONB,                              -- [lat, lng]
    user_id     BIGINT REFERENCES users(id) ON DELETE SET NULL,
    entered_by  VARCHAR(20) NOT NULL DEFAULT 'owner',   -- 'owner' | 'volunteer'
    ts          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_entries_product_ts ON diary_entries(product_id, ts);
-- Nâng cấp DB đã tạo từ phiên bản trước
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(16) NOT NULL DEFAULT 'active' CHECK (status IN ('active','pending','disabled'));
ALTER TABLE products      ADD COLUMN IF NOT EXISTS content  JSONB;
ALTER TABLE products      ADD COLUMN IF NOT EXISTS owner_id BIGINT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE diary_entries ADD COLUMN IF NOT EXISTS audio    TEXT;
ALTER TABLE diary_entries ADD COLUMN IF NOT EXISTS geo      JSONB;
ALTER TABLE diary_entries ADD COLUMN IF NOT EXISTS user_id  BIGINT REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_products_category  ON products(category);

-- ---------- Đơn hàng & chống gửi trùng (checkout) ----------
CREATE TABLE IF NOT EXISTS idempotency_keys (
    id            BIGSERIAL PRIMARY KEY,
    user_id       VARCHAR(64) NOT NULL,              -- phạm vi key: 'u:<id>' hoặc 'guest'
    key           VARCHAR(128) NOT NULL,
    status        VARCHAR(20) NOT NULL DEFAULT 'PROCESSING',
    request_hash  VARCHAR(64),                       -- băm nội dung đơn, phát hiện cùng key khác nội dung
    response_code INT,
    response_data JSONB,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at    TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
    CONSTRAINT uq_idempotency_user_key UNIQUE (user_id, key)
);
ALTER TABLE idempotency_keys ADD COLUMN IF NOT EXISTS request_hash VARCHAR(64);
CREATE INDEX IF NOT EXISTS idx_idempotency_expires_at ON idempotency_keys(expires_at);

CREATE TABLE IF NOT EXISTS orders (
    id             BIGSERIAL PRIMARY KEY,
    code           VARCHAR(40) NOT NULL UNIQUE,      -- mã đơn hiển thị cho khách
    user_id        BIGINT REFERENCES users(id) ON DELETE SET NULL,   -- NULL = khách vãng lai
    customer_name  VARCHAR(128) NOT NULL,
    phone          VARCHAR(32) NOT NULL,
    address        TEXT NOT NULL,
    note           TEXT,
    total          BIGINT NOT NULL CHECK (total >= 0),               -- VND, do SERVER tính
    status         VARCHAR(16) NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','confirmed','shipped','completed','cancelled')),
    payment_method VARCHAR(16) NOT NULL DEFAULT 'cod',               -- chưa tích hợp cổng thanh toán
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

CREATE TABLE IF NOT EXISTS order_items (
    id          BIGSERIAL PRIMARY KEY,
    order_id    BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id  VARCHAR(128) REFERENCES products(id) ON DELETE SET NULL,  -- NULL với hộp quà
    name        VARCHAR(255) NOT NULL,               -- chụp lại tên lúc đặt
    unit_price  INTEGER NOT NULL CHECK (unit_price >= 0),                 -- chụp lại giá lúc đặt
    qty         INTEGER NOT NULL CHECK (qty > 0),
    contents    JSONB                                -- hộp quà: danh sách id sản phẩm bên trong
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- Bản ghi nhật ký chỉ thêm, không sửa (đúng nguyên tắc của dự án)
CREATE OR REPLACE FUNCTION forbid_entry_update() RETURNS trigger AS $$
BEGIN
    RAISE EXCEPTION 'diary_entries là bản ghi chỉ thêm, không được sửa';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_entries_no_update ON diary_entries;
CREATE TRIGGER trg_entries_no_update
    BEFORE UPDATE OF id, product_id, stage, text, photo, audio, geo, ts, entered_by ON diary_entries
    FOR EACH ROW EXECUTE FUNCTION forbid_entry_update();
