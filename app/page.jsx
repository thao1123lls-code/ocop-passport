"use client";

import Link from "next/link";
import Hero from "@/components/Hero";
import StorefrontHome from "@/components/StorefrontHome";
import TrustFeatures from "@/components/TrustFeatures";
import KineticMarquee from "@/components/KineticMarquee";
import Footer from "@/components/Footer";
import { useLang } from "@/lib/i18n";

export default function Home() {
  const { t } = useLang();
  const portalT = t.portal;
  const footerT = t.footer;

  const PORTAL_LINKS = [
    {
      href: "/diary",
      title: portalT.diaryTitle,
      desc: portalT.diaryDesc,
      action: portalT.diaryAction || "Mở ứng dụng →",
    },
    {
      href: "/studio",
      title: portalT.aiTitle,
      desc: portalT.aiDesc,
      action: portalT.aiAction || "Mở trợ lý →",
    },
    {
      href: "/dashboard",
      title: portalT.dashTitle,
      desc: portalT.dashDesc,
      action: portalT.dashAction || "Mở quản trị →",
    },
  ];

  return (
    <>
      {/* 1. PHẦN Ở TRÊN: HERO BANNER & HIỆU ỨNG TƯƠNG TÁC CYBER OCOP */}
      <Hero />

      {/* 2. DẢI THANH CHẠY KINETIC MARQUEE: Bố cục 2 hàng chữ chuyển động liên tục ngược chiều phong cách Kinetic Orange & Brutalist */}
      <KineticMarquee />

      {/* 3. PHẦN Ở DƯỚI: GIAN HÀNG SẢN PHẨM & CÁC CÔNG CỤ SỐ HÓA */}
      <main style={{ maxWidth: "min(1780px, 97vw)", margin: "0 auto", padding: "12px max(24px, 2.5vw) 0", width: "100%" }}>
        <StorefrontHome />
      </main>

      {/* Khối 'Vì sao người mua tin chọn nông sản có Hộ chiếu số?' - Trải rộng full viền trang, không bị thu hẹp */}
      <TrustFeatures />

      {/* 4. PHẦN CUỐI TRANG: CÔNG CỤ SỐ HÓA & ĐƯA SẢN PHẨM LÊN SÀN (Chuẩn bố cục thiết kế theo ảnh) */}
      <section className="portal-section" aria-labelledby="portal-title">
        <div className="portal-inner">
          <div className="portal-head">
            <span className="portal-badge">{portalT.badge}</span>
            <h2 id="portal-title" className="portal-title">
              {portalT.title}
            </h2>
          </div>

          <div className="portal-grid">
            {PORTAL_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="portal-card"
              >
                <div className="portal-card-top">
                  <h3 className="portal-card-title">{item.title}</h3>
                  <p className="portal-card-desc">{item.desc}</p>
                </div>
                <div className="portal-card-action">
                  <span>{item.action}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CHÂN TRANG ĐẦY ĐỦ THÔNG TIN BẢN QUYỀN, LIÊN HỆ & BẢO MẬT */}
      <Footer />
    </>
  );
}
