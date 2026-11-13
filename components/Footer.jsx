"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n";

export default function Footer() {
  const { lang } = useLang();
  const isEn = lang === "en";

  return (
    <footer className="site-custom-footer" aria-label="Thông tin chân trang">
      {/* Sparkles floating subtly in the background */}
      <div className="footer-sparkle sparkle-1" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4L12 0Z"
            fill="#FBBF24"
            opacity="0.85"
          />
        </svg>
      </div>
      <div className="footer-sparkle sparkle-2" aria-hidden="true">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4L12 0Z"
            fill="#FDE68A"
            opacity="0.75"
          />
        </svg>
      </div>

      <div className="footer-inner">
        {/* TOP: 4 Columns Layout */}
        <div className="footer-grid">
          {/* Column 1: Brand & Socials */}
          <div className="footer-col col-brand">
            <Link href="/" className="footer-logo">
              <div className="logo-icon-box">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#070B14"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" />
                  <path d="M14 14h3v3h-3z" fill="#070B14" />
                  <path d="M17 17h4v4h-4z" fill="#070B14" />
                  <path d="M14 20h3v1h-3z" fill="#070B14" />
                </svg>
              </div>
              <span className="logo-text">
                OCOP <span className="logo-accent">Passport</span>
              </span>
            </Link>

            <p className="footer-desc">
              {isEn
                ? "Dong Nai OCOP Specialties & Digital Passport platform. Promoting digital transformation for transparent and sustainable agriculture."
                : "Gian hàng & Hộ chiếu số đặc sản Đồng Nai. Thúc đẩy chuyển đổi số vì nền nông nghiệp minh bạch và bền vững."}
            </p>

            <div className="footer-socials">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="social-btn"
                aria-label="Facebook"
              >
                <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="social-btn"
                aria-label="Twitter"
              >
                <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: SẢN PHẨM */}
          <div className="footer-col">
            <h3 className="col-title">{isEn ? "PRODUCTS" : "SẢN PHẨM"}</h3>
            <ul className="col-links">
              <li>
                <Link href="/#san-pham">{isEn ? "All Specialties" : "Tất cả đặc sản"}</Link>
              </li>
              <li>
                <Link href="/?cat=cacao#san-pham">{isEn ? "Cacao & Coffee" : "Ca-cao & Cà phê"}</Link>
              </li>
              <li>
                <Link href="/?cat=nuts#san-pham">{isEn ? "Dong Nai Cashews" : "Hạt điều Đồng Nai"}</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: HỖ TRỢ */}
          <div className="footer-col">
            <h3 className="col-title">{isEn ? "SUPPORT" : "HỖ TRỢ"}</h3>
            <ul className="col-links">
              <li>
                <Link href="/diary">{isEn ? "Digitization Guide" : "Hướng dẫn số hóa"}</Link>
              </li>
              <li>
                <Link href="/diary">{isEn ? "Passport Lookup" : "Tra cứu hộ chiếu"}</Link>
              </li>
              <li>
                <a
                  href="#faq"
                  onClick={(e) => {
                    e.preventDefault();
                    if (typeof window !== "undefined") {
                      const chatBtn = document.querySelector(".u215-ln");
                      if (chatBtn) chatBtn.click();
                    }
                  }}
                >
                  {isEn ? "Frequently Asked Questions" : "Câu hỏi thường gặp"}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: VĂN PHÒNG QUẢN LÝ */}
          <div className="footer-col col-contact">
            <h3 className="col-title">{isEn ? "MANAGEMENT OFFICE" : "VĂN PHÒNG QUẢN LÝ"}</h3>
            <ul className="contact-list">
              <li className="contact-item">
                <span className="contact-icon" aria-hidden="true">
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#00E5FF"
                    strokeWidth="2.1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </span>
                <span className="contact-text">
                  34 Cách Mạng Tháng Tám, Quyết Thắng, TP. Biên Hòa, Đồng Nai.
                </span>
              </li>
              <li className="contact-item">
                <span className="contact-icon" aria-hidden="true">
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#00E5FF"
                    strokeWidth="2.1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </span>
                <span className="contact-text">Hot-line: 0251 3822 557</span>
              </li>
            </ul>
          </div>
        </div>

        {/* BOTTOM: Copyright & Policies */}
        <div className="footer-bottom">
          <p className="footer-copy">
            © 2024 Hệ thống Hộ chiếu số OCOP Đồng Nai. Designed by Volunteers.
          </p>

          <div className="footer-policies">
            <Link href="/dashboard" className="policy-link">
              {isEn ? "PRIVACY POLICY" : "CHÍNH SÁCH BẢO MẬT"}
            </Link>
            <Link href="/dashboard" className="policy-link">
              {isEn ? "TERMS OF SERVICE" : "ĐIỀU KHOẢN DỊCH VỤ"}
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .site-custom-footer {
          position: relative;
          width: 100%;
          background-color: #070B14;
          background-image: radial-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px);
          background-size: 28px 28px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding: 38px 36px 24px;
          color: #94A3B8;
          font-size: 14px;
          overflow: hidden;
        }

        /* Sparkles */
        .footer-sparkle {
          position: absolute;
          pointer-events: none;
          z-index: 1;
        }

        .sparkle-1 {
          top: 26px;
          left: 62%;
          animation: sparkleTwinkle 4s ease-in-out infinite;
        }

        .sparkle-2 {
          top: 16px;
          right: 12%;
          animation: sparkleTwinkle 3.5s ease-in-out infinite 1.5s;
        }

        @keyframes sparkleTwinkle {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.85);
          }
          50% {
            opacity: 1;
            transform: scale(1.15) rotate(8deg);
          }
        }

        .footer-inner {
          max-width: min(1680px, 95vw);
          width: 100%;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }

        /* 4-Column Grid */
        .footer-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr 1.4fr;
          gap: 48px;
          align-items: start;
        }

        /* Column 1: Brand */
        .col-brand {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .footer-logo {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .logo-icon-box {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #00E5FF;
          display: grid;
          place-items: center;
          box-shadow: 0 0 14px rgba(0, 229, 255, 0.5);
          flex-shrink: 0;
        }

        .logo-text {
          font-size: 17px;
          font-weight: 850;
          color: #FFFFFF;
          letter-spacing: -0.01em;
        }

        .logo-accent {
          color: #00E5FF;
        }

        .footer-desc {
          margin: 0;
          line-height: 1.6;
          color: #94A3B8;
          font-size: 13.5px;
          max-width: 440px;
        }

        .footer-socials {
          display: flex;
          gap: 10px;
          margin-top: 4px;
        }

        .social-btn {
          width: 36px;
          height: 36px;
          border-radius: 9px;
          background: #101726;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94A3B8;
          display: grid;
          place-items: center;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .social-btn:hover {
          background: #162033;
          border-color: rgba(0, 229, 255, 0.4);
          color: #00E5FF;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 229, 255, 0.2);
        }

        /* Column Titles */
        .col-title {
          font-size: 13.5px;
          font-weight: 850;
          color: #FFFFFF;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin: 0 0 18px;
        }

        .col-links {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .col-links li a {
          color: #94A3B8;
          text-decoration: none;
          font-size: 13.5px;
          transition: color 0.2s ease;
          line-height: 1.4;
        }

        .col-links li a:hover {
          color: #00E5FF;
        }

        /* Column 4: Contact */
        .contact-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .contact-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .contact-icon {
          flex-shrink: 0;
          margin-top: 2px;
          display: flex;
          align-items: center;
        }

        .contact-text {
          color: #94A3B8;
          font-size: 13.5px;
          line-height: 1.55;
        }

        /* BOTTOM: Separator & Copyright */
        .footer-bottom {
          margin-top: 30px;
          padding-top: 18px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 18px;
        }

        .footer-copy {
          margin: 0;
          font-size: 12.5px;
          color: #64748B;
        }

        .footer-policies {
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
        }

        .policy-link {
          font-size: 12px;
          font-weight: 750;
          letter-spacing: 0.06em;
          color: #64748B;
          text-decoration: none;
          text-transform: uppercase;
          transition: color 0.2s ease;
        }

        .policy-link:hover {
          color: #00E5FF;
        }

        /* Responsive Breakpoints */
        @media (max-width: 980px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 36px;
          }
          .sparkle-1 {
            left: 80%;
          }
        }

        @media (max-width: 640px) {
          .site-custom-footer {
            padding: 48px 18px 28px;
          }
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .footer-bottom {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          .footer-policies {
            gap: 16px;
          }
        }
      `}</style>
    </footer>
  );
}
