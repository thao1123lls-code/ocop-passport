import Link from "next/link";
import Hero from "@/components/Hero";
const M = [["/diary", "1. Nhật ký số", "Chọn mốc, chụp ảnh, nói vài câu. Tự gắn giờ và vị trí; chế độ tình nguyện viên nhập hộ; dùng được khi mất mạng."], ["/diary", "2. Hộ chiếu số qua QR", "Mỗi sản phẩm có trang công khai: hành trình, bản đồ, chứng nhận, câu chuyện, nút mua, song ngữ Việt - Anh."], ["/studio", "3. Trợ lý bán hàng AI", "Soạn mô tả, bài đăng, kịch bản livestream, bản tiếng Anh từ dữ liệu thật. Luôn là bản nháp chờ duyệt, có bộ lọc cảnh báo."], ["/dashboard", "4. Bảng điều khiển", "Cho Đoàn xã, phường: tiến độ số hóa, xác minh hộ chiếu, cơ sở cần hỗ trợ."]];
export default function Home() {
  return (<main className="w">
    <Hero />
    <div className="grid" style={{ marginTop: 28 }}>{M.map(([h, t, d]) => <Link key={t} href={h} className="card" data-rv="" style={{ textDecoration: "none", color: "inherit" }}><h3>{t}</h3><p className="mute">{d}</p></Link>)}</div>
    <p className="mute">Dự thi “Vườn ươm ý tưởng số” TP. Đồng Nai 2026, Bảng Sinh viên. Nhóm tác giả: Hoàng Phương Thảo, Trịnh Trần Thảo Nguyên, Bùi Kim Ngân (ĐH Công nghệ Đồng Nai).</p>
  </main>);
}
