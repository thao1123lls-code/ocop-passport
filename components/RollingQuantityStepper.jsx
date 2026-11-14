// Lucian UX/UI Prompt #018 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#018
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { fmtVND } from "@/lib/store";

export default function RollingQuantityStepper({
  value = 1,
  min = 1,
  max = 12,
  price = 0,
  compact = false,
  onChange,
  onAdd,
  product = null,
}) {
  const [q, setQ] = useState(value);
  const [isShake, setIsShake] = useState(false);
  const [shownPrice, setShownPrice] = useState(value * price);
  const stepRef = useRef(null);
  const shakeTimeoutRef = useRef(null);
  const rafRef = useRef(null);

  // Sync with external value if controlled
  useEffect(() => {
    setQ(value);
  }, [value]);

  // Smooth total price odometer counting animation
  useEffect(() => {
    if (!price) return;
    const target = q * price;
    const from = shownPrice;
    const t0 = performance.now();
    const rm = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = rm ? 1 : 520;

    cancelAnimationFrame(rafRef.current);

    const animate = (now) => {
      const progress = Math.min(1, (now - t0) / duration);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(from + (target - from) * eased);
      setShownPrice(current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafRef.current);
  }, [q, price]);

  const bump = useCallback(
    (delta) => {
      const next = q + delta;
      if (next < min || next > max) {
        setIsShake(false);
        clearTimeout(shakeTimeoutRef.current);
        // Force reflow for shake re-trigger
        requestAnimationFrame(() => {
          setIsShake(true);
          shakeTimeoutRef.current = setTimeout(() => setIsShake(false), 450);
        });
        return;
      }
      setQ(next);
      if (onChange) onChange(next);
    },
    [q, min, max, onChange]
  );

  const handleKeyDown = (e) => {
    if (e.key === "ArrowUp" || e.key === "ArrowRight") {
      e.preventDefault();
      bump(1);
    } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
      e.preventDefault();
      bump(-1);
    }
  };

  const tens = Math.floor(q / 10);
  const ones = q % 10;
  const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className={`ux u018 ${compact ? "u018-compact" : ""}`}>
      <style jsx>{`
        .u018 {
          --ux-page: var(--bg, #F8FAFC);
          --ux-surface: var(--panel, #FFFFFF);
          --ux-surface-2: var(--blue-soft, #F0F9FF);
          --ux-surface-3: var(--blue-subtle, #E0F2FE);
          --ux-ink: var(--ink, #0F172A);
          --ux-ink-2: var(--ink-2, #334155);
          --ux-ink-3: var(--mute, #64748B);
          --ux-line: var(--line, #E2E8F0);
          --ux-line-2: var(--line-strong, #CBD5E1);
          --ux-accent: var(--blue, #0284C7);
          --ux-accent-2: var(--blue-dark, #0369A1);
          --ux-accent-soft: rgba(2, 132, 199, 0.12);
          --ux-accent-ink: #FFFFFF;
          --ux-shadow: rgba(15, 23, 42, 0.08);
          --ux-shadow-strong: rgba(15, 23, 42, 0.2);
          --ux-ease: cubic-bezier(0.2, 0.8, 0.2, 1);
          --ux-spring: cubic-bezier(0.34, 1.45, 0.64, 1);
          display: flex;
          align-items: center;
          gap: 12px;
          user-select: none;
        }

        .u018-step {
          display: inline-flex;
          align-items: center;
          height: 44px;
          padding: 4px;
          border-radius: 999px;
          background: var(--ux-surface);
          box-shadow: 0 0 0 1.5px var(--ux-line), 0 8px 20px -8px var(--ux-shadow);
          transition: box-shadow 0.2s var(--ux-ease);
        }

        .u018-compact .u018-step {
          height: 36px;
          padding: 3px;
          box-shadow: 0 0 0 1px var(--ux-line);
        }

        .u018-step:focus-within {
          box-shadow: 0 0 0 2px var(--ux-accent), 0 8px 24px -8px rgba(2, 132, 199, 0.25);
        }

        .u018-step.is-shake {
          animation: u018-no 0.42s var(--ux-ease);
        }

        @keyframes u018-no {
          20% { transform: translateX(-5px); }
          40% { transform: translateX(5px); }
          60% { transform: translateX(-3px); }
          80% { transform: translateX(2px); }
        }

        .u018-b {
          width: 36px;
          height: 36px;
          border: 0;
          padding: 0;
          border-radius: 50%;
          background: var(--ux-surface-2);
          color: var(--ux-accent-2);
          display: grid;
          place-items: center;
          cursor: pointer;
          transition: transform 0.35s var(--ux-spring), background-color 0.2s var(--ux-ease), opacity 0.2s;
        }

        .u018-compact .u018-b {
          width: 30px;
          height: 30px;
        }

        .u018-b:hover:not([aria-disabled="true"]) {
          background: var(--ux-surface-3);
          transform: scale(1.05);
        }

        .u018-b:active:not([aria-disabled="true"]) {
          transform: scale(0.88);
        }

        .u018-b:focus-visible {
          outline: 2px solid var(--ux-accent);
          outline-offset: 2px;
        }

        .u018-b[aria-disabled="true"] {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .u018-b svg {
          width: 16px;
          height: 16px;
          fill: none;
          stroke: currentColor;
          stroke-width: 2.4;
          stroke-linecap: round;
        }

        .u018-b.pl {
          background: var(--ux-accent);
          color: #ffffff;
        }

        .u018-b.pl:hover:not([aria-disabled="true"]) {
          background: var(--ux-accent-2);
        }

        /* Rolling Odometer Number */
        .u018-num {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 44px;
          height: 34px;
          overflow: hidden;
          font-size: 19px;
          font-weight: 800;
          line-height: 34px;
          font-variant-numeric: tabular-nums;
          letter-spacing: -0.02em;
          color: var(--ux-ink);
        }

        .u018-compact .u018-num {
          width: 38px;
          font-size: 16px;
        }

        .u018-col {
          display: flex;
          flex-direction: column;
          width: 13px;
          transition: transform 0.55s var(--ux-spring), width 0.35s var(--ux-ease), opacity 0.25s var(--ux-ease);
        }

        .u018-col span {
          height: 34px;
          text-align: center;
          display: block;
        }

        .u018-col.is-hide {
          width: 0 !important;
          opacity: 0;
          overflow: hidden;
        }

        .u018-sum {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .u018-sum small {
          display: block;
          font-size: 11px;
          color: var(--ux-ink-3);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .u018-sum b {
          display: block;
          margin-top: 1px;
          font-size: 16px;
          font-weight: 800;
          color: var(--ux-accent-2);
          font-variant-numeric: tabular-nums;
        }

        .u018-sr {
          position: absolute;
          width: 1px;
          height: 1px;
          overflow: hidden;
          clip-path: inset(50%);
          white-space: nowrap;
        }

        @media (prefers-reduced-motion: reduce) {
          .u018,
          .u018 *,
          .u018 *::before,
          .u018 *::after {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.001ms !important;
          }
        }
      `}</style>

      {/* Stepper Group */}
      <div
        ref={stepRef}
        className={`u018-step ${isShake ? "is-shake" : ""}`}
        role="group"
        aria-label="Chọn số lượng"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <button
          className="u018-b mi"
          type="button"
          aria-label="Giảm một"
          aria-disabled={q <= min}
          onClick={() => bump(-1)}
        >
          <svg viewBox="0 0 20 20">
            <path d="M5 10h10" />
          </svg>
        </button>

        <span className="u018-num" aria-live="polite" aria-atomic="true">
          <span className="u018-sr">{q} sản phẩm</span>

          {/* Tens Digit Odometer */}
          <span
            className={`u018-col ${tens === 0 ? "is-hide" : ""}`}
            style={{ transform: `translateY(${-tens * 34}px)` }}
            aria-hidden="true"
          >
            {digits.map((d) => (
              <span key={`t-${d}`}>{d}</span>
            ))}
          </span>

          {/* Ones Digit Odometer */}
          <span
            className="u018-col"
            style={{ transform: `translateY(${-ones * 34}px)` }}
            aria-hidden="true"
          >
            {digits.map((d) => (
              <span key={`o-${d}`}>{d}</span>
            ))}
          </span>
        </span>

        <button
          className="u018-b pl"
          type="button"
          aria-label="Tăng một"
          aria-disabled={q >= max}
          onClick={() => bump(1)}
        >
          <svg viewBox="0 0 20 20">
            <path d="M10 5v10M5 10h10" />
          </svg>
        </button>
      </div>

      {/* Total Odometer Counter (if price provided and not compact) */}
      {price > 0 && !compact && (
        <div className="u018-sum">
          <small>Tổng tiền</small>
          <b className="u018-total">{fmtVND(shownPrice)}</b>
        </div>
      )}
    </div>
  );
}
