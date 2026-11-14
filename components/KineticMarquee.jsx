"use client";

import { useLang } from "@/lib/i18n";

export default function KineticMarquee() {
  const { lang } = useLang();
  const isEn = lang === "en";

  const row1Text = isEn
    ? "★ DONG NAI DIGITAL OCOP PASSPORT ★ 100% FARM ORIGIN TRANSPARENCY ★ DYNAMIC QR VERIFICATION ★ CERTIFIED OCOP STANDARDS ★ DIRECT FROM LOCAL ORCHARDS ★ AUTHENTIC HARVEST JOURNEY ★"
    : "★ HỘ CHIẾU SỐ OCOP ĐỒNG NAI ★ MINH BẠCH VÙNG TRỒNG 100% ★ QUÉT MÃ QR KIỂM CHỨNG ★ CHUẨN OCOP ĐỒNG NAI ★ KẾT NỐI TRỰC TIẾP NHÀ VƯỜN ★ NÔNG SẢN THẬT TỪ VƯỜN ★";

  const row2Text = isEn
    ? "• DINH QUAN CACAO • FIRE-ROASTED CASHEWS • TRI AN BLOSSOM HONEY • ROBUSTA LONG KHANH • TAN TRIEU POMELO • AGRI-TECH DIGITIZATION 2026 •"
    : "• CA CAO ĐỊNH QUÁN • HẠT ĐIỀU RANG CỦI • MẬT ONG HOA TRÀM TRỊ AN • CÀ PHÊ ROBUSTA LONG KHÁNH • BƯỞI DA XANH TÂN TRIỀU • SỐ HÓA NÔNG SẢN 2026 •";

  return (
    <section className="kinetic-marquee-section" id="gian-hang" aria-label="Thanh chạy thông điệp số hóa">
      <div className="kinetic-marquee-container">
        {/* ROW 1: Heavy uppercase scrolling left in Electric Cyber Cyan (#00E5FF) */}
        <div className="marquee-track-wrapper track-row-1">
          <div className="marquee-content-track scroll-left" aria-hidden="true">
            <span className="marquee-text-primary">{row1Text}</span>
            <span className="marquee-text-primary">{row1Text}</span>
          </div>
          <div className="marquee-content-track scroll-left">
            <span className="marquee-text-primary">{row1Text}</span>
            <span className="marquee-text-primary">{row1Text}</span>
          </div>
        </div>

        {/* ROW 2: Space Mono uppercase scrolling in reverse (right) in Pure White (#FFFFFF) */}
        <div className="marquee-track-wrapper track-row-2">
          <div className="marquee-content-track scroll-right" aria-hidden="true">
            <span className="marquee-text-secondary">{row2Text}</span>
            <span className="marquee-text-secondary">{row2Text}</span>
          </div>
          <div className="marquee-content-track scroll-right">
            <span className="marquee-text-secondary">{row2Text}</span>
            <span className="marquee-text-secondary">{row2Text}</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .kinetic-marquee-section {
          width: 100%;
          overflow: hidden;
          background: #060A12;
          padding: 24px 0 26px;
          margin: 16px 0 24px;
          position: relative;
          border-top: 2px solid #00E5FF;
          border-bottom: 2px solid #00E5FF;
          transform: skewY(-2deg);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
          -webkit-user-select: none;
          -moz-user-select: none;
          user-select: none;
        }

        .kinetic-marquee-section :global(::selection) {
          background: transparent !important;
          color: inherit !important;
        }

        .kinetic-marquee-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
          -webkit-user-select: none;
          user-select: none;
          /* Để chữ chạy xéo tự nhiên tăm tắp song song cùng đường viền nghiêng của khung */
        }

        .marquee-track-wrapper {
          display: flex;
          overflow: hidden;
          width: 100%;
          position: relative;
          white-space: nowrap;
          -webkit-user-select: none;
          user-select: none;
        }

        .marquee-content-track {
          display: flex;
          align-items: center;
          flex-shrink: 0;
          white-space: nowrap;
          will-change: transform;
          -webkit-user-select: none;
          user-select: none;
        }

        /* ROW 1: Cyber Neon Cyan (#00E5FF) - Phông chữ chuẩn nét tiếng Việt, đồng nhất chiều cao */
        .marquee-text-primary {
          color: #00E5FF;
          font-family: "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
          font-size: clamp(24px, 3.2vw, 42px);
          font-weight: 900;
          letter-spacing: 0.04em;
          line-height: 1.25;
          padding-right: 56px;
          text-transform: uppercase;
          text-shadow: none;
          display: inline-flex;
          align-items: center;
          -webkit-user-select: none;
          user-select: none;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }

        /* ROW 2: High-contrast Pure White with Space Mono vibe - Rõ nét, đồng đều */
        .marquee-text-secondary {
          color: #E0F2FE;
          font-family: "Space Mono", "Consolas", "Courier New", monospace;
          font-size: clamp(12.5px, 1.5vw, 17px);
          font-weight: 700;
          letter-spacing: 0.08em;
          line-height: 1.25;
          padding-right: 48px;
          text-transform: uppercase;
          text-shadow: none;
          display: inline-flex;
          align-items: center;
          -webkit-user-select: none;
          user-select: none;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }

        /* Continuous linear marquee animations - Tốc độ chậm rãi, êm ái, dễ đọc */
        .scroll-left {
          animation: marqueeScrollLeft 75s linear infinite;
        }

        .scroll-right {
          animation: marqueeScrollRight 90s linear infinite;
        }

        .kinetic-marquee-section:hover .scroll-left,
        .kinetic-marquee-section:hover .scroll-right {
          animation-play-state: paused;
        }

        @keyframes marqueeScrollLeft {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        @keyframes marqueeScrollRight {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(0%);
          }
        }

        @media (max-width: 768px) {
          .kinetic-marquee-section {
            padding: 18px 0 20px;
            margin: 22px 0 18px;
            transform: skewY(-1.8deg);
          }
          .kinetic-marquee-container {
            gap: 8px;
          }
          .scroll-left {
            animation-duration: 55s;
          }
          .scroll-right {
            animation-duration: 65s;
          }
        }
      `}</style>
    </section>
  );
}
