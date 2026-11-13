// Lucian UX/UI Prompt #017 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#017
"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { fmtVND } from "@/lib/store";

export default function TiltingValueBubbleSlider({
  value = 150000,
  min = 10000,
  max = 1000000,
  step = 5000,
  label = "Giá bán sản phẩm",
  subLabel,
  onChange,
}) {
  const [val, setVal] = useState(value);
  const [isDrag, setIsDrag] = useState(false);
  const [tilt, setTilt] = useState(0);

  const rootRef = useRef(null);
  const trackRef = useRef(null);
  const thumbRef = useRef(null);
  const stillRef = useRef(null);
  const dragInfoRef = useRef({ lastX: 0, lastT: 0 });

  // Sync internal state when external value changes
  useEffect(() => {
    if (typeof value === "number" && !isNaN(value)) {
      setVal(Math.max(min, Math.min(max, value)));
    }
  }, [value, min, max]);

  const p = useMemo(() => {
    if (max <= min) return 0;
    return Math.max(0, Math.min(1, (val - min) / (max - min)));
  }, [val, min, max]);

  const ticks = useMemo(() => {
    return [
      min,
      Math.round((min + (max - min) * 0.25) / step) * step,
      Math.round((min + (max - min) * 0.5) / step) * step,
      Math.round((min + (max - min) * 0.75) / step) * step,
      max,
    ];
  }, [min, max, step]);

  const formatTick = (n) => {
    if (n >= 1000000) return n % 1000000 === 0 ? `${n / 1000000}tr` : `${(n / 1000000).toFixed(1)}tr`;
    if (n >= 1000) return `${Math.round(n / 1000)}k`;
    return `${n}đ`;
  };

  const applyTilt = useCallback((deg) => {
    if (typeof window !== "undefined") {
      const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (rm) return;
    }
    const clamped = Math.max(-22, Math.min(22, deg));
    setTilt(clamped);
    clearTimeout(stillRef.current);
    stillRef.current = setTimeout(() => {
      setTilt(0);
    }, 90);
  }, []);

  const updateFromX = useCallback(
    (clientX) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const raw = min + ratio * (max - min);
      const rounded = Math.round(raw / step) * step;
      const nextVal = Math.max(min, Math.min(max, rounded));
      setVal(nextVal);
      onChange?.(nextVal);
    },
    [min, max, step, onChange]
  );

  const handlePointerDown = (e) => {
    if (e.button !== 0 || !trackRef.current) return;
    trackRef.current.setPointerCapture(e.pointerId);
    setIsDrag(true);
    dragInfoRef.current = { lastX: e.clientX, lastT: performance.now() };
    updateFromX(e.clientX);
    thumbRef.current?.focus({ preventScroll: true });
  };

  const handlePointerMove = (e) => {
    if (!trackRef.current || !trackRef.current.hasPointerCapture(e.pointerId)) return;
    const now = performance.now();
    const dt = Math.max(8, now - dragInfoRef.current.lastT);
    const dx = e.clientX - dragInfoRef.current.lastX;
    const vel = dx / dt;
    dragInfoRef.current = { lastX: e.clientX, lastT: now };

    applyTilt(-vel * 14);
    updateFromX(e.clientX);
  };

  const handlePointerUp = () => {
    setIsDrag(false);
    setTilt(0);
  };

  const handleKeyDown = (e) => {
    let delta = 0;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") delta = step;
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") delta = -step;
    else if (e.key === "PageUp") delta = step * 10;
    else if (e.key === "PageDown") delta = -step * 10;
    else if (e.key === "Home") delta = -(val - min);
    else if (e.key === "End") delta = max - val;

    if (!delta) return;
    e.preventDefault();

    const nextVal = Math.max(min, Math.min(max, val + delta));
    setVal(nextVal);
    onChange?.(nextVal);
    applyTilt(delta > 0 ? -9 : 9);
  };

  return (
    <div
      ref={rootRef}
      className={`ux u017 ${isDrag ? "is-drag" : ""}`}
      style={{
        "--v": p.toFixed(4),
        "--tilt": `${tilt.toFixed(1)}deg`,
      }}
    >
      <style jsx>{`
        .u017 {
          --ux-page: var(--bg, #F8FAFC);
          --ux-surface: var(--panel, #FFFFFF);
          --ux-surface-2: var(--blue-soft, #F0F9FF);
          --ux-surface-3: var(--line, #E2E8F0);
          --ux-ink: var(--ink, #0F172A);
          --ux-ink-2: var(--ink-2, #334155);
          --ux-ink-3: var(--mute, #64748B);
          --ux-line: var(--line, #E2E8F0);
          --ux-line-2: var(--line-strong, #CBD5E1);
          --ux-accent: var(--blue, #0284C7);
          --ux-accent-2: #0297DE;
          --ux-accent-soft: rgba(2, 132, 199, 0.12);
          --ux-accent-ink: #FFFFFF;
          --ux-shadow-strong: rgba(15, 23, 42, 0.28);
          --ux-ease: cubic-bezier(0.2, 0.8, 0.2, 1);
          --ux-spring: cubic-bezier(0.34, 1.45, 0.64, 1);

          position: relative;
          width: 100%;
          max-width: 420px;
          display: flex;
          flex-direction: column;
          justifyContent: center;
          padding: 10px 14px 18px;
          user-select: none;
          box-sizing: border-box;
        }

        .u017-head {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 54px;
        }

        .u017-head b {
          font-size: 15px;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--ux-ink);
        }

        .u017-head span {
          font-size: 12.5px;
          color: var(--ux-ink-3);
          font-variant-numeric: tabular-nums;
        }

        .u017-track {
          position: relative;
          height: 12px;
          border-radius: 999px;
          background: var(--ux-surface-3);
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
          cursor: pointer;
          touch-action: none;
        }

        .u017-fill {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: calc(var(--v) * 100%);
          border-radius: inherit;
          background: linear-gradient(90deg, #0284C7, #0297DE 60%, #38BDF8);
        }

        .u017-fill::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.35), transparent 60%);
        }

        .u017-thumb {
          position: absolute;
          left: calc(var(--v) * 100%);
          top: 50%;
          width: 32px;
          height: 32px;
          margin: -16px 0 0 -16px;
          border-radius: 50%;
          background: #ffffff;
          cursor: grab;
          box-shadow: 0 0 0 3px #0284C7, 0 8px 18px -6px rgba(2, 132, 199, 0.5);
          transition: transform 0.35s var(--ux-spring), box-shadow 0.3s var(--ux-ease);
        }

        .u017-thumb:hover {
          transform: scale(1.08);
        }

        .u017.is-drag .u017-thumb {
          cursor: grabbing;
          transform: scale(1.15);
          box-shadow: 0 0 0 3px #0284C7, 0 0 0 10px rgba(2, 132, 199, 0.18), 0 8px 18px -6px rgba(2, 132, 199, 0.5);
        }

        .u017-thumb:focus-visible {
          outline: none;
          box-shadow: 0 0 0 3px #0284C7, 0 0 0 8px rgba(2, 132, 199, 0.35);
        }

        .u017-bub {
          position: absolute;
          left: calc(var(--v) * 100%);
          bottom: 28px;
          transform-origin: 50% 100%;
          transform: translateX(-50%) rotate(var(--tilt, 0deg)) scale(var(--bs, 1));
          transition: transform 0.55s var(--ux-spring);
          pointer-events: none;
        }

        .u017.is-drag .u017-bub {
          --bs: 1.1;
          transition: transform 0.12s linear;
        }

        .u017-bub span {
          display: block;
          padding: 8px 14px;
          border-radius: 14px;
          background: var(--ux-ink);
          color: #ffffff;
          font-size: 15px;
          font-weight: 750;
          letter-spacing: -0.02em;
          white-space: nowrap;
          font-variant-numeric: tabular-nums;
          box-shadow: 0 12px 24px -12px var(--ux-shadow-strong);
        }

        .u017-bub::after {
          content: "";
          position: absolute;
          left: 50%;
          bottom: -5px;
          width: 12px;
          height: 12px;
          margin-left: -6px;
          border-radius: 2px;
          background: var(--ux-ink);
          transform: rotate(45deg);
        }

        .u017-ticks {
          display: flex;
          justify-content: space-between;
          margin-top: 18px;
          font-size: 12px;
          font-weight: 600;
          color: var(--ux-ink-3);
          font-variant-numeric: tabular-nums;
        }

        .u017-ticks span {
          position: relative;
          transition: color 0.3s var(--ux-ease);
        }

        .u017-ticks span.on {
          color: var(--ux-ink);
          font-weight: 700;
        }

        .u017-ticks span::before {
          content: "";
          position: absolute;
          left: 50%;
          top: -10px;
          width: 2px;
          height: 5px;
          margin-left: -1px;
          border-radius: 1px;
          background: currentColor;
          opacity: 0.6;
        }

        @media (prefers-reduced-motion: reduce) {
          .u017,
          .u017 *,
          .u017 *::before,
          .u017 *::after {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.001ms !important;
          }
          .u017-bub {
            transform: translateX(-50%) !important;
          }
        }
      `}</style>

      <div className="u017-head">
        <b>{label}</b>
        <span>{subLabel || `Từ ${formatTick(min)} · Tối đa ${formatTick(max)}`}</span>
      </div>

      <div
        ref={trackRef}
        className="u017-track"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <span className="u017-fill" aria-hidden="true" />
        <span className="u017-bub" aria-hidden="true">
          <span className="u017-val">{fmtVND(val)}</span>
        </span>
        <span
          ref={thumbRef}
          className="u017-thumb"
          role="slider"
          tabIndex={0}
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={val}
          aria-valuetext={fmtVND(val)}
          onKeyDown={handleKeyDown}
        />
      </div>

      <div className="u017-ticks" aria-hidden="true">
        {ticks.map((t, i) => (
          <span key={t} className={p >= i / (ticks.length - 1) - 0.001 ? "on" : ""}>
            {formatTick(t)}
          </span>
        ))}
      </div>
    </div>
  );
}
