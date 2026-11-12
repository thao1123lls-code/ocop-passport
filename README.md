# OCOP Passport (Next.js)
```bash
npm install
cp .env.example .env.local   # điền ANTHROPIC_API_KEY để dùng AI thật (bỏ trống = dùng mẫu câu)
npm run dev                  # http://localhost:3000
npm run build && npm start   # bản tối ưu, bật PWA/ngoại tuyến
```
Dữ liệu hiện lưu trên trình duyệt (localStorage). Giọng nói và định vị cần HTTPS hoặc localhost.
Bước tiếp theo để lên bản thật: thay `lib/store.js` bằng Supabase (đăng nhập, phân quyền, lưu ảnh, đếm lượt quét).
