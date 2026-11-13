import "./globals.css";
import PWA from "@/components/PWA";
import NavBar from "@/components/NavBar";
import ScrollReveal from "@/components/ScrollReveal";
import ClientWidgets from "@/components/ClientWidgets";
import LanguageTextSync from "@/components/LanguageTextSync";

export const metadata = {
  title: {
    default: "OCOP Passport · Hộ chiếu số cho nông sản Đồng Nai",
    template: "%s · OCOP Passport",
  },
  description:
    "Ghi nhật ký sản xuất bằng ảnh và giọng nói, tạo hộ chiếu số qua mã QR động, tự động soạn nội dung bán hàng bằng AI cho sản phẩm OCOP Đồng Nai.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg" },
  openGraph: {
    title: "OCOP Passport",
    description: "Hộ chiếu số giúp nông sản Đồng Nai minh bạch nguồn gốc và bán trên sàn TMĐT",
    locale: "vi_VN",
    type: "website",
  },
};

export const viewport = {
  themeColor: "#0297DE",
  width: "device-width",
  initialScale: 1,
};

export default function Root({ children }) {
  return (
    <html lang="vi">
      <body>
        <NavBar />
        {children}
        <LanguageTextSync />
        <ScrollReveal />
        <ClientWidgets />
        <PWA />
      </body>
    </html>
  );
}
