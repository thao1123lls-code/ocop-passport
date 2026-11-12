import "./globals.css";
import Link from "next/link";
import { Be_Vietnam_Pro } from "next/font/google";
import PWA from "@/components/PWA";
const font = Be_Vietnam_Pro({ subsets: ["vietnamese", "latin"], weight: ["400", "700", "800"], display: "swap", variable: "--font" });
export const metadata = { title: { default: "OCOP Passport: Hộ chiếu số cho nông sản Đồng Nai", template: "%s · OCOP Passport" }, description: "Ghi nhật ký sản xuất bằng ảnh và giọng nói, tạo hộ chiếu số qua mã QR, soạn nội dung bán hàng bằng AI cho sản phẩm OCOP Đồng Nai.", manifest: "/manifest.webmanifest", icons: { icon: "/icon.svg" }, openGraph: { title: "OCOP Passport", description: "Hộ chiếu số cho nông sản Đồng Nai", locale: "vi_VN", type: "website" } };
export const viewport = { themeColor: "#1f4d3a", width: "device-width", initialScale: 1 };
export default function Root({ children }) {
  return (<html lang="vi" className={font.variable}><body>
    <nav aria-label="Chính"><b>OCOP Passport</b><Link href="/">Giới thiệu</Link><Link href="/diary">Nhật ký số</Link><Link href="/studio">Trợ lý bán hàng</Link><Link href="/dashboard">Bảng điều khiển</Link></nav>
    {children}<PWA /></body></html>);
}
