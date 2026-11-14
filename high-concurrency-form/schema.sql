-- 1. Bật extension pgcrypto để tạo mật khẩu mã hóa bcrypt tương thích với Node.js
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Đảm bảo bảng users tồn tại (tương thích với schema.sql và api/admin/users)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'customer',
  status TEXT DEFAULT 'active',
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tạo 2 Tài khoản Demo (Mật khẩu chung: Demo@12345)
INSERT INTO users (id, name, email, phone, password_hash, role, address, created_at)
VALUES 
  ('usr-admin-demo', 'Quản Trị Viên OCOP', 'admin@ocop.vn', '0901000001', crypt('Demo@12345', gen_salt('bf', 10)), 'admin', 'Biên Hòa, Đồng Nai', NOW() - INTERVAL '30 days'),
  ('usr-cust-demo', 'Khách Hàng Demo', 'demo@ocop.vn', '0901000002', crypt('Demo@12345', gen_salt('bf', 10)), 'customer', 'Quận 1, TP. Hồ Chí Minh', NOW() - INTERVAL '25 days')
ON CONFLICT (email) DO NOTHING;

-- 4. Thêm 20 Khách hàng mẫu (Mật khẩu chung: Khachhang@123)
INSERT INTO users (id, name, email, phone, password_hash, role, address, created_at)
VALUES
  ('cust-01', 'Nguyễn Văn An', 'nguyenvanan01@gmail.com', '0912345001', crypt('Khachhang@123', gen_salt('bf', 10)), 'customer', 'Phường Trảng Dài, Biên Hòa, Đồng Nai', NOW() - INTERVAL '20 days'),
  ('cust-02', 'Trần Thị Bích Ngọc', 'bichngoc.tran02@gmail.com', '0912345002', crypt('Khachhang@123', gen_salt('bf', 10)), 'customer', 'Phường Thảo Điền, TP. Thủ Đức, TP.HCM', NOW() - INTERVAL '19 days'),
  ('cust-03', 'Lê Hoàng Nam', 'lehoangnam03@gmail.com', '0912345003', crypt('Khachhang@123', gen_salt('bf', 10)), 'customer', 'Quận Hải Châu, Đà Nẵng', NOW() - INTERVAL '18 days'),
  ('cust-04', 'Phạm Minh Tuấn', 'minhtuan.pham04@gmail.com', '0912345004', crypt('Khachhang@123', gen_salt('bf', 10)), 'customer', 'Quận Cầu Giấy, Hà Nội', NOW() - INTERVAL '17 days'),
  ('cust-05', 'Hoàng Thu Trang', 'thutrang.hoang05@gmail.com', '0912345005', crypt('Khachhang@123', gen_salt('bf', 10)), 'customer', 'Huyện Định Quán, Đồng Nai', NOW() - INTERVAL '16 days'),
  ('cust-06', 'Võ Quốc Bảo', 'quocbao.vo06@gmail.com', '0912345006', crypt('Khachhang@123', gen_salt('bf', 10)), 'customer', 'Quận Ninh Kiều, Cần Thơ', NOW() - INTERVAL '15 days'),
  ('cust-07', 'Đặng Ngọc Mai', 'ngocmai.dang07@gmail.com', '0912345007', crypt('Khachhang@123', gen_salt('bf', 10)), 'customer', 'Phường Phước Tân, Biên Hòa, Đồng Nai', NOW() - INTERVAL '14 days'),
  ('cust-08', 'Bùi Đức Duy', 'ducduy.bui08@gmail.com', '0912345008', crypt('Khachhang@123', gen_salt('bf', 10)), 'customer', 'TP. Đà Lạt, Lâm Đồng', NOW() - INTERVAL '13 days'),
  ('cust-09', 'Đỗ Thị Thanh Hà', 'thanhha.do09@gmail.com', '0912345009', crypt('Khachhang@123', gen_salt('bf', 10)), 'customer', 'Quận 7, TP. Hồ Chí Minh', NOW() - INTERVAL '12 days'),
  ('cust-10', 'Hồ Gia Huy', 'giahuy.ho10@gmail.com', '0912345010', crypt('Khachhang@123', gen_salt('bf', 10)), 'customer', 'TP. Vũng Tàu, Bà Rịa - Vũng Tàu', NOW() - INTERVAL '11 days'),
  ('cust-11', 'Ngô Thanh Tùng', 'thanhtung.ngo11@gmail.com', '0912345011', crypt('Khachhang@123', gen_salt('bf', 10)), 'customer', 'Quận Đống Đa, Hà Nội', NOW() - INTERVAL '10 days'),
  ('cust-12', 'Dương Mỹ Linh', 'mylinh.duong12@gmail.com', '0912345012', crypt('Khachhang@123', gen_salt('bf', 10)), 'customer', 'TP. Thủ Dầu Một, Bình Dương', NOW() - INTERVAL '9 days'),
  ('cust-13', 'Lý Kiến Văn', 'kienvan.ly13@gmail.com', '0912345013', crypt('Khachhang@123', gen_salt('bf', 10)), 'customer', 'Quận 5, TP. Hồ Chí Minh', NOW() - INTERVAL '8 days'),
  ('cust-14', 'Vũ Thị Kim Ngân', 'kimngan.vu14@gmail.com', '0912345014', crypt('Khachhang@123', gen_salt('bf', 10)), 'customer', 'TP. Nha Trang, Khánh Hòa', NOW() - INTERVAL '7 days'),
  ('cust-15', 'Trịnh Công Sơn', 'congson.trinh15@gmail.com', '0912345015', crypt('Khachhang@123', gen_salt('bf', 10)), 'customer', 'TP. Huế, Thừa Thiên Huế', NOW() - INTERVAL '6 days'),
  ('cust-16', 'Đinh Phương Thảo', 'phuongthao.dinh16@gmail.com', '0912345016', crypt('Khachhang@123', gen_salt('bf', 10)), 'customer', 'Huyện Long Thành, Đồng Nai', NOW() - INTERVAL '5 days'),
  ('cust-17', 'Lương Thế Vinh', 'thevinh.luong17@gmail.com', '0912345017', crypt('Khachhang@123', gen_salt('bf', 10)), 'customer', 'Quận Bình Thạnh, TP. Hồ Chí Minh', NOW() - INTERVAL '4 days'),
  ('cust-18', 'Mai Tuyết Nhung', 'tuyetnhung.mai18@gmail.com', '0912345018', crypt('Khachhang@123', gen_salt('bf', 10)), 'customer', 'TP. Biên Hòa, Đồng Nai', NOW() - INTERVAL '3 days'),
  ('cust-19', 'Cao Thái Sơn', 'thaison.cao19@gmail.com', '0912345019', crypt('Khachhang@123', gen_salt('bf', 10)), 'customer', 'Quận Tân Bình, TP. Hồ Chí Minh', NOW() - INTERVAL '2 days'),
  ('cust-20', 'Phan Bảo Ngọc', 'baongoc.phan20@gmail.com', '0912345020', crypt('Khachhang@123', gen_salt('bf', 10)), 'customer', 'TP. Long Khánh, Đồng Nai', NOW() - INTERVAL '1 day')
ON CONFLICT (email) DO NOTHING;