// Lucian UX/UI Prompt #043 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#043
"use client";

import { useState, useRef, useEffect, useCallback } from "react";

export default function StretchingPagination({
  current = 0,
  totalPages = 7,
  totalItems = 0,
  label = "Danh sách đặc sản OCOP",
  subLabel,
  onChange,
}) {
  const [cur, setCur] = useState(current);
  const [displayNum, setDisplayNum] = useState((current < 9 ? "0" : "") + (current + 1));
  const [isRolling, setIsRolling] = useState(false);
  const [rollDir, setRollDir] = useState(1);

  const pgsRef = useRef([]);

  // Sync internal page if controlled from parent
  useEffect(() => {
    if (typeof current === "number" && current !== cur && current >= 0 && current < totalPages) {
      const dir = current > cur ? 1 : -1;
      setRollDir(dir);
      setDisplayNum((current < 9 ? "0" : "") + (current + 1));
      setIsRolling(true);
      setCur(current);
      setTimeout(() => setIsRolling(false), 500);
    }
  }, [current, totalPages, cur]);

  const goTo = useCallback(
    (p, focus = false) => {
      if (p < 0 || p >= totalPages || p === cur) return;
      const dir = p > cur ? 1 : -1;
      setRollDir(dir);
      setDisplayNum((p < 9 ? "0" : "") + (p + 1));
      setIsRolling(true);
      setCur(p);
      onChange?.(p, dir);
      setTimeout(() => setIsRolling(false), 500);

      if (focus && pgsRef.current[p]) {
        pgsRef.current[p].focus();
      }
    },
    [cur, totalPages, onChange]
  );

  const handleKeyDown = (e) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (d) {
      e.preventDefault();
      goTo(cur + d, true);
    }
  };

  const pagesArray = Array.from({ length: totalPages }, (_, i) => i);
  const formattedTotalPages = (totalPages < 10 ? "0" : "") + totalPages;

  return (
    <div className="ux u043" aria-label="Phân trang danh mục sản phẩm">
      <style jsx>{`
        .u043 {
          --ux-page: #0F172A;
          --ux-surface: #1E293B;
          --ux-surface-2: #131D2E;
          --ux-surface-3: rgba(255, 255, 255, 0.08);
          --ux-ink: #38BDF8;
          --ux-ink-2: #F8FAFC;
          --ux-ink-3: #94A3B8;
          --ux-line: rgba(255, 255, 255, 0.08);
          --ux-accent: #38BDF8;
          --ux-shadow-strong: rgba(0, 0, 0, 0.5);
          --ux-ease: cubic-bezier(0.2, 0.8, 0.2, 1);
          --ux-spring: cubic-bezier(0.34, 1.45, 0.64, 1);

          position: relative;
          width: 100%;
          max-width: 440px;
          margin: 18px auto 10px;
          display: flex;
          justify-content: center;
          user-select: none;
          box-sizing: border-box;
        }

        /* Pager bar không có thanh kéo dãn thừa dính ở mép */
        .u043-pager {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 6px 10px;
          border-radius: 999px;
          background: #1E293B;
          border: 1.5px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
          width: fit-content;
          margin: 0 auto;
        }

        /* Nút từng trang: Số hiển thị rõ nét */
        .u043-pg {
          position: relative;
          z-index: 2;
          width: 36px;
          height: 36px;
          flex: none;
          border: 0;
          padding: 0;
          border-radius: 50%;
          background: transparent;
          font-size: 14.5px;
          font-weight: 750;
          color: #CBD5E1;
          font-variant-numeric: tabular-nums;
          transition: background-color 0.2s, color 0.2s, transform 0.15s;
          cursor: pointer;
          display: grid;
          place-items: center;
        }

        .u043-pg:hover:not([aria-current="page"]) {
          background: rgba(56, 189, 248, 0.15);
          color: #38BDF8;
          transform: scale(1.08);
        }

        /* Khi chọn: Có hình tròn màu xanh bao quanh số, số màu xanh đen đậm siêu rõ */
        .u043-pg[aria-current="page"] {
          background: #38BDF8 !important;
          color: #0F172A !important;
          font-weight: 900;
          border-radius: 50%;
          box-shadow: 0 0 14px rgba(56, 189, 248, 0.6);
          transform: scale(1.06);
        }

        .u043-ar {
          position: relative;
          z-index: 2;
          width: 36px;
          height: 36px;
          flex: none;
          border: 0;
          padding: 0;
          border-radius: 50%;
          background: #131D2E;
          color: #38BDF8;
          border: 1px solid rgba(255, 255, 255, 0.08);
          display: grid;
          place-items: center;
          transition: transform 0.2s, background-color 0.15s, opacity 0.2s;
          cursor: pointer;
        }

        .u043-ar:hover:not([aria-disabled="true"]) {
          background: rgba(56, 189, 248, 0.2);
          transform: scale(1.08);
          color: #7DD3FC;
        }

        .u043-ar:active {
          transform: scale(0.92);
        }

        .u043-ar[aria-disabled="true"] {
          opacity: 0.35;
          cursor: not-allowed;
          transform: none;
        }

        .u043-ar svg {
          width: 17px;
          height: 17px;
          fill: none;
          stroke: currentColor;
          stroke-width: 2.5;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .u043-pg:focus-visible,
        .u043-ar:focus-visible {
          outline: 2px solid #0284C7;
          outline-offset: 2px;
        }

        @media (prefers-reduced-motion: reduce) {
          .u043,
          .u043 *,
          .u043 *::before,
          .u043 *::after {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.001ms !important;
          }
        }
      `}</style>

      {/* Đã bỏ dòng tiêu đề và số trang to u043-head theo yêu cầu */}

      <nav
        className="u043-pager"
        aria-label="Điều hướng phân trang"
        onKeyDown={handleKeyDown}
      >
        <button
          className="u043-ar"
          type="button"
          aria-label="Trang trước"
          aria-disabled={cur === 0}
          onClick={() => goTo(cur - 1, true)}
        >
          <svg viewBox="0 0 16 16">
            <path d="M10 3.5L5.5 8l4.5 4.5" />
          </svg>
        </button>

        {pagesArray.map((p) => (
          <button
            key={p}
            ref={(el) => (pgsRef.current[p] = el)}
            className="u043-pg"
            type="button"
            aria-current={p === cur ? "page" : undefined}
            aria-label={`Trang ${p + 1}`}
            onClick={() => goTo(p)}
          >
            {p + 1}
          </button>
        ))}

        <button
          className="u043-ar"
          type="button"
          aria-label="Trang kế tiếp"
          aria-disabled={cur >= totalPages - 1}
          onClick={() => goTo(cur + 1, true)}
        >
          <svg viewBox="0 0 16 16">
            <path d="M6 3.5L10.5 8 6 12.5" />
          </svg>
        </button>
      </nav>
    </div>
  );
}
