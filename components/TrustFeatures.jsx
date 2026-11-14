"use client";
import { useLang } from "@/lib/i18n";

function Sparkle({ size = 16, style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="#FDE047"
      style={{
        filter: "drop-shadow(0 0 6px rgba(253, 224, 71, 0.85))",
        pointerEvents: "none",
        ...style,
      }}
      aria-hidden="true"
    >
      <path d="M12 0L14.2 9.8L24 12L14.2 14.2L12 24L9.8 14.2L0 12L9.8 9.8L12 0Z" />
    </svg>
  );
}

export default function TrustFeatures() {
  const { t } = useLang();
  const trustT = t.trust;

  return (
    <section className="trust-block" aria-labelledby="trust-heading">
      <div className="trust-inner">
        <div className="trust-head">
          <span className="trust-badge">
            <span className="trust-badge-dot" />
            {trustT.badge}
          </span>
          <h2 id="trust-heading" className="trust-main-title">
            {trustT.title}
          </h2>
          <p className="trust-sub-desc">
            {trustT.subDesc}
          </p>
        </div>

        <div className="trust-3col-grid">
          {/* CỘT 1: THU ÂM BẰNG GIỌNG NÓI & ẢNH (Microphone) */}
          <div className="trust-col-item">
            <div className="trust-circle-outer">
              {/* Chùm sao lấp lánh nối sang cột 2 */}
              <Sparkle size={11} style={{ position: "absolute", top: 4, right: 8, transform: "rotate(20deg)" }} />
              <Sparkle size={9} style={{ position: "absolute", top: 12, right: 20, transform: "rotate(-10deg)" }} />
              <Sparkle size={12} style={{ position: "absolute", top: 18, right: -22, transform: "rotate(15deg)" }} />
              <Sparkle size={10} style={{ position: "absolute", top: 32, right: -42, transform: "rotate(35deg)" }} />

              <div className="trust-circle-media">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="9" y="2" width="6" height="12" rx="3" />
                  <path d="M5 10a7 7 0 0 0 14 0" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              </div>
            </div>
            <h3 className="trust-col-title">{trustT.col1Title}</h3>
            <p className="trust-col-desc">
              {trustT.col1Desc}
            </p>
          </div>

          {/* CỘT 2: QUÉT QR CODE KỂ TRỌN CÂU CHUYỆN */}
          <div className="trust-col-item">
            <div className="trust-circle-outer">
              {/* Sao lấp lánh xung quanh cột 2 & nối sang cột 3 */}
              <Sparkle size={11} style={{ position: "absolute", top: 22, left: -24, transform: "rotate(45deg)" }} />
              <Sparkle size={9} style={{ position: "absolute", bottom: -2, right: -12, transform: "rotate(10deg)" }} />
              <span style={{ position: "absolute", bottom: -8, right: -28, width: 4, height: 4, borderRadius: "50%", background: "#FDE047", boxShadow: "0 0 6px #FACC15" }} />
              <Sparkle size={10} style={{ position: "absolute", bottom: 8, right: -48, transform: "rotate(25deg)" }} />

              <div className="trust-circle-media">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="7" height="7" rx="2" />
                  <circle cx="6.5" cy="6.5" r="1.2" fill="#38BDF8" stroke="none" />
                  <rect x="14" y="3" width="7" height="7" rx="2" />
                  <circle cx="17.5" cy="6.5" r="1.2" fill="#38BDF8" stroke="none" />
                  <rect x="3" y="14" width="7" height="7" rx="2" />
                  <circle cx="6.5" cy="17.5" r="1.2" fill="#38BDF8" stroke="none" />
                  <circle cx="15" cy="15" r="1.2" fill="#38BDF8" stroke="none" />
                  <circle cx="19" cy="15" r="1.2" fill="#38BDF8" stroke="none" />
                  <circle cx="15" cy="19" r="1.2" fill="#38BDF8" stroke="none" />
                  <circle cx="19" cy="19" r="1.2" fill="#38BDF8" stroke="none" />
                </svg>
              </div>
            </div>
            <h3 className="trust-col-title">{trustT.col2Title}</h3>
            <p className="trust-col-desc">
              {trustT.col2Desc}
            </p>
          </div>

          {/* CỘT 3: ĐẶT MUA TRỰC TIẾP (Shopping Cart) */}
          <div className="trust-col-item">
            <div className="trust-circle-outer">
              {/* Sao lấp lánh góc dưới cột 3 */}
              <Sparkle size={10} style={{ position: "absolute", bottom: 10, left: -16, transform: "rotate(15deg)" }} />

              <div className="trust-circle-media">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="9" cy="20" r="1.6" fill="#38BDF8" />
                  <circle cx="18" cy="20" r="1.6" fill="#38BDF8" />
                  <path d="M1 1h4l2.68 12.39a2 2 0 0 0 2 1.61h8.72a2 2 0 0 0 2-1.61L22 6H6" />
                </svg>
              </div>
            </div>
            <h3 className="trust-col-title">{trustT.col3Title}</h3>
            <p className="trust-col-desc">
              {trustT.col3Desc}
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .trust-block {
          width: 100%;
          background: linear-gradient(180deg, #131E31 0%, #0F172A 100%);
          border-top: 1.5px solid rgba(56, 189, 248, 0.28);
          border-bottom: 1.5px solid rgba(56, 189, 248, 0.28);
          border-left: none;
          border-right: none;
          border-radius: 0;
          padding: 24px 24px 26px;
          margin: 24px 0 0;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08);
          position: relative;
          overflow: hidden;
        }

        .trust-block::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #38BDF8, #C084FC, #2DD4BF, transparent);
        }

        .trust-inner {
          max-width: min(1780px, 97vw);
          width: 100%;
          margin: 0 auto;
        }

        .trust-head {
          text-align: center;
          max-width: min(1120px, 96vw);
          margin: 0 auto 18px;
        }

        .trust-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(56, 189, 248, 0.12);
          border: 1px solid rgba(56, 189, 248, 0.35);
          color: #38BDF8;
          padding: 3px 12px;
          border-radius: 99px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.04em;
          margin-bottom: 6px;
        }

        .trust-badge-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #2DD4BF;
          box-shadow: 0 0 6px #2DD4BF;
        }

        .trust-main-title {
          font-size: clamp(20px, 2.2vw, 28px);
          font-weight: 850;
          color: #F8FAFC;
          line-height: 1.25;
          margin: 0 0 6px;
          letter-spacing: -0.01em;
        }

        @media (min-width: 820px) {
          .trust-main-title {
            white-space: nowrap;
          }
        }

        .trust-sub-desc {
          font-size: 13.5px;
          color: #94A3B8;
          line-height: 1.5;
          margin: 0 auto;
          max-width: 640px;
        }

        /* Bố cục 3 cột căn giữa */
        .trust-3col-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
        }

        .trust-col-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          transition: transform 0.25s ease;
        }

        .trust-col-item:hover {
          transform: translateY(-4px);
        }

        /* Vòng tròn biểu tượng nhỏ gọn, thanh thoát */
        .trust-circle-outer {
          width: 92px;
          height: 92px;
          border-radius: 50%;
          border: 2px solid rgba(56, 189, 248, 0.45);
          padding: 4px;
          display: grid;
          place-items: center;
          margin-bottom: 14px;
          box-shadow: 0 0 20px rgba(56, 189, 248, 0.2), inset 0 0 0 3px #0F172A;
          background: linear-gradient(145deg, #131D2E 0%, #0F172A 100%);
          transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
          position: relative;
          overflow: visible;
        }

        .trust-col-item:hover .trust-circle-outer {
          transform: scale(1.06);
          border-color: #38BDF8;
          box-shadow: 0 0 28px rgba(56, 189, 248, 0.45), inset 0 0 0 3px #0F172A;
        }

        .trust-circle-media {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          overflow: hidden;
          display: grid;
          place-items: center;
          background: radial-gradient(circle at 45% 40%, #1E293B 0%, #0B1120 100%);
          border: 1px solid rgba(56, 189, 248, 0.25);
        }

        /* Tiêu đề & mô tả căn giữa nhỏ gọn */
        .trust-col-title {
          font-size: 16.5px;
          font-weight: 800;
          color: #F8FAFC;
          margin: 0 0 6px;
          line-height: 1.35;
          transition: color 0.2s ease;
        }

        .trust-col-item:hover .trust-col-title {
          color: #38BDF8;
        }

        .trust-col-desc {
          font-size: 13px;
          color: #94A3B8;
          line-height: 1.55;
          margin: 0 auto;
          max-width: 340px;
        }

        @media (max-width: 860px) {
          .trust-block {
            padding: 22px 16px 22px;
          }
          .trust-3col-grid {
            grid-template-columns: 1fr;
            gap: 28px;
          }
          .trust-circle-outer {
            width: 84px;
            height: 84px;
            margin-bottom: 12px;
          }
        }
      `}</style>
    </section>
  );
}
