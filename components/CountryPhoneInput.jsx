// Lucian UX/UI Prompt #209 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#209
"use client";

import { useState, useRef, useEffect, useId } from "react";

const COUNTRIES = [
  ["VN", "🇻🇳", "Việt Nam", "+84", [3, 3, 4], "091-234-5678"],
  ["KR", "🇰🇷", "South Korea", "+82", [3, 4, 4], "010-1234-5678"],
  ["US", "🇺🇸", "United States", "+1", [3, 3, 4], "(415) 555-0132"],
  ["JP", "🇯🇵", "Japan", "+81", [3, 4, 4], "090-1234-5678"],
  ["GB", "🇬🇧", "United Kingdom", "+44", [5, 6], "07700 900123"],
  ["SG", "🇸🇬", "Singapore", "+65", [4, 4], "8123-4567"],
  ["AU", "🇦🇺", "Australia", "+61", [4, 3, 3], "0412-345-678"],
];

function formatDigits(digits, country) {
  const groups = country[4];
  const out = [];
  let k = 0;
  groups.forEach((n) => {
    if (k < digits.length) out.push(digits.slice(k, k + n));
    k += n;
  });
  if (k < digits.length) {
    out[out.length - 1] += digits.slice(k);
  }
  if (country[0] === "US" && digits.length > 3) {
    return "(" + out[0] + ") " + out.slice(1).join("-");
  }
  return out.join(country[0] === "GB" ? " " : "-");
}

export default function CountryPhoneInput({
  id = "ord-phone",
  name = "phone",
  label = "Số điện thoại *",
  value = "",
  onChange,
  required = false,
  className = "",
  fullCard = false,
  onSendCode,
}) {
  const [cur, setCur] = useState(0);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isSpin, setIsSpin] = useState(false);
  const [hasBlurred, setHasBlurred] = useState(false);

  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const searchRef = useRef(null);
  const listboxId = useId();

  const country = COUNTRIES[cur];
  const neededDigits = country[4].reduce((a, b) => a + b, 0);

  // Clean raw digits
  const rawDigits = (value || "").replace(/\D/g, "");
  const isOk = rawDigits.length === neededDigits;
  const isBad = rawDigits.length > 0 && !isOk && (rawDigits.length > neededDigits || hasBlurred);

  // Sync formatted value when country changes
  const pickCountry = (index) => {
    if (index === cur) {
      setOpen(false);
      inputRef.current?.focus({ preventScroll: true });
      return;
    }
    setCur(index);
    setOpen(false);
    setIsSpin(true);
    setTimeout(() => setIsSpin(false), 460);

    const formatted = formatDigits(rawDigits, COUNTRIES[index]);
    if (onChange) onChange(formatted);
    inputRef.current?.focus({ preventScroll: true });
  };

  const handleInputChange = (e) => {
    setHasBlurred(false);
    const cleaned = e.target.value.replace(/\D/g, "");
    const formatted = formatDigits(cleaned, country);
    if (onChange) onChange(formatted);
  };

  const handleBlur = () => {
    setHasBlurred(true);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  // Close dropdown on click outside or Escape
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        rootRef.current?.querySelector(".u209-cc")?.focus();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setSearch("");
      setTimeout(() => searchRef.current?.focus({ preventScroll: true }), 50);
    }
  }, [open]);

  const filtered = COUNTRIES.map((c, i) => ({ c, i })).filter(({ c }) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (c[2] + " " + c[0] + " " + c[3]).toLowerCase().includes(q);
  });

  const hintText = `${country[2]}: số điện thoại chuẩn gồm ${neededDigits} chữ số`;

  return (
    <div
      ref={rootRef}
      className={`ux u209 ${fullCard ? "u209-card" : "u209-inline"} ${open ? "is-open" : ""} ${isOk ? "is-ok" : ""} ${isBad ? "is-bad" : ""} ${className}`}
    >
      <style jsx>{`
        .u209 {
          position: relative;
          color: var(--ux-ink, #0F172A);
          --ux-page: var(--bg, #F0F7FC);
          --ux-surface: var(--panel, #FFFFFF);
          --ux-surface-2: var(--blue-soft, #E6F5FD);
          --ux-surface-3: #E0F2FE;
          --ux-ink: var(--ink, #0F172A);
          --ux-ink-2: var(--ink-2, #334155);
          --ux-ink-3: var(--mute, #64748B);
          --ux-line: var(--line, #E2E8F0);
          --ux-line-2: var(--line-strong, #CBD5E1);
          --ux-accent: var(--blue, #0297DE);
          --ux-accent-2: var(--blue, #0284C7);
          --ux-accent-soft: rgba(2, 151, 222, 0.12);
          --ux-accent-ink: #FFFFFF;
          --ux-mint: var(--ok, #0D9488);
          --ux-warn: #D97706;
          --ux-danger: #EF4444;
          --ux-glass: rgba(255, 255, 255, 0.85);
          --ux-glass-line: rgba(255, 255, 255, 0.95);
          --ux-shadow: rgba(15, 23, 42, 0.08);
          --ux-shadow-strong: rgba(2, 120, 179, 0.22);
        }

        @media (prefers-color-scheme: dark) {
          :global(:root:not([data-theme="light"])) .u209 {
            --ux-page: #0B1120;
            --ux-surface: #1E293B;
            --ux-surface-2: #0F172A;
            --ux-surface-3: #334155;
            --ux-ink: #F8FAFC;
            --ux-ink-2: #CBD5E1;
            --ux-ink-3: #94A3B8;
            --ux-line: rgba(255, 255, 255, 0.1);
            --ux-line-2: rgba(255, 255, 255, 0.18);
            --ux-accent: #38BDF8;
            --ux-accent-2: #60A5FA;
            --ux-accent-soft: rgba(56, 189, 248, 0.15);
            --ux-accent-ink: #0F172A;
            --ux-mint: #34D399;
            --ux-warn: #FBBF24;
            --ux-danger: #F87171;
            --ux-shadow: rgba(0, 0, 0, 0.4);
            --ux-shadow-strong: rgba(0, 0, 0, 0.7);
          }
        }

        :global(:root[data-theme="dark"]) .u209 {
          --ux-page: #0B1120;
          --ux-surface: #1E293B;
          --ux-surface-2: #0F172A;
          --ux-surface-3: #334155;
          --ux-ink: #F8FAFC;
          --ux-ink-2: #CBD5E1;
          --ux-ink-3: #94A3B8;
          --ux-line: rgba(255, 255, 255, 0.1);
          --ux-line-2: rgba(255, 255, 255, 0.18);
          --ux-accent: #38BDF8;
          --ux-accent-2: #60A5FA;
          --ux-accent-soft: rgba(56, 189, 248, 0.15);
          --ux-accent-ink: #0F172A;
          --ux-mint: #34D399;
          --ux-warn: #FBBF24;
          --ux-danger: #F87171;
          --ux-shadow: rgba(0, 0, 0, 0.4);
          --ux-shadow-strong: rgba(0, 0, 0, 0.7);
        }

        /* Standalone gallery card mode */
        .u209-card {
          width: 340px;
          height: 340px;
          border-radius: 30px;
          overflow: hidden;
          background: var(--ux-surface);
          box-shadow: 0 0 0 1px var(--ux-line), 0 30px 60px -36px var(--ux-shadow-strong);
        }
        .u209-card .u209-wr {
          position: absolute;
          left: 22px;
          right: 22px;
          top: 30px;
        }

        /* Inline form input mode */
        .u209-inline {
          width: 100%;
          overflow: visible;
        }
        .u209-inline .u209-wr {
          position: relative;
          width: 100%;
        }

        .u209 h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 900;
          letter-spacing: -0.035em;
        }

        .u209 label {
          display: block;
          margin-top: 4px;
          font-size: 13px;
          font-weight: 700;
          color: var(--ux-ink-2);
        }

        .u209-fd {
          position: relative;
          display: flex;
          margin-top: 6px;
          height: 48px;
          border-radius: 14px;
          background: var(--ux-surface-2);
          box-shadow: inset 0 0 0 1.5px var(--ux-line);
          transition: box-shadow 0.2s;
        }

        .u209-fd:focus-within {
          box-shadow: inset 0 0 0 2px var(--ux-accent);
        }

        .u209.is-ok .u209-fd {
          box-shadow: inset 0 0 0 2px #10B981;
        }

        .u209.is-bad .u209-fd {
          box-shadow: inset 0 0 0 2px #F59E0B;
        }

        .u209-cc {
          flex: none;
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 0 9px 0 12px;
          border: 0;
          border-right: 1px solid var(--ux-line);
          background: none;
          color: var(--ux-ink);
          font: inherit;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          border-radius: 14px 0 0 14px;
        }

        .u209-cc:focus-visible {
          outline: 2px solid var(--ux-accent);
          outline-offset: -2px;
        }

        .u209-cc em {
          display: inline-block;
          font-style: normal;
          font-size: 18px;
          line-height: 1;
          transition: transform 0.45s cubic-bezier(0.3, 1.5, 0.5, 1);
        }

        .u209-cc em.is-spin {
          transform: rotateY(360deg) scale(1.15);
        }

        .u209-cc b {
          font-weight: 850;
          font-variant-numeric: tabular-nums;
        }

        .u209-cc svg {
          width: 9px;
          height: 9px;
          color: var(--ux-ink-3);
          transition: transform 0.25s;
        }

        .u209.is-open .u209-cc svg {
          transform: rotate(180deg);
        }

        .u209-in {
          flex: 1;
          min-width: 0;
          padding: 0 38px 0 12px;
          border: 0;
          background: none;
          color: var(--ux-ink);
          font: inherit;
          font-size: 14px;
          font-weight: 750;
          letter-spacing: 0.02em;
          outline: none;
          font-variant-numeric: tabular-nums;
        }

        .u209-in::placeholder {
          color: var(--ux-ink-3);
          font-weight: 500;
          opacity: 0.75;
        }

        .u209-ck {
          position: absolute;
          right: 13px;
          top: 14px;
          width: 20px;
          height: 20px;
          pointer-events: none;
        }

        .u209-ck circle {
          fill: #10B981;
          transform: scale(0);
          transform-origin: center;
          transform-box: fill-box;
          transition: transform 0.35s cubic-bezier(0.3, 1.7, 0.5, 1);
        }

        .u209-ck path {
          fill: none;
          stroke: #fff;
          stroke-width: 2.2;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 14;
          stroke-dashoffset: 14;
          transition: stroke-dashoffset 0.3s ease 0.2s;
        }

        .u209.is-ok .u209-ck circle {
          transform: none;
        }

        .u209.is-ok .u209-ck path {
          stroke-dashoffset: 0;
        }

        .u209-ht {
          height: 0;
          overflow: hidden;
          font-size: 11px;
          font-weight: 700;
          color: #B45309;
          transition: height 0.25s, margin 0.25s;
        }

        .u209.is-bad .u209-ht {
          height: 18px;
          margin-top: 6px;
        }

        .u209-dd {
          position: absolute;
          left: 0;
          top: calc(100% + 6px);
          z-index: 100;
          width: 240px;
          max-height: 260px;
          overflow-y: auto;
          padding: 6px;
          border-radius: 15px;
          background: var(--ux-surface);
          box-shadow: 0 0 0 1px var(--ux-line), 0 18px 36px -14px var(--ux-shadow-strong);
          transform-origin: 20% 0;
          transform: scale(0.94) translateY(-4px);
          opacity: 0;
          pointer-events: none;
          transition: transform 0.22s cubic-bezier(0.3, 1.5, 0.5, 1), opacity 0.15s;
        }

        .u209.is-open .u209-dd {
          transform: none;
          opacity: 1;
          pointer-events: auto;
        }

        .u209-sr {
          width: 100%;
          height: 32px;
          margin-bottom: 4px;
          padding: 0 10px;
          border: 0;
          border-radius: 9px;
          background: var(--ux-surface-2);
          color: var(--ux-ink);
          font: inherit;
          font-size: 11.5px;
          font-weight: 700;
          outline: none;
          box-sizing: border-box;
        }

        .u209-sr:focus-visible {
          outline: 2px solid var(--ux-accent);
        }

        .u209-op {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          height: 32px;
          padding: 0 9px;
          border: 0;
          border-radius: 8px;
          background: none;
          color: var(--ux-ink);
          font: inherit;
          font-size: 12px;
          font-weight: 750;
          cursor: pointer;
          text-align: left;
          transition: background 0.12s;
        }

        .u209-op:hover,
        .u209-op[aria-selected="true"] {
          background: var(--ux-surface-2);
        }

        .u209-op em {
          font-style: normal;
          font-size: 16px;
        }

        .u209-op span {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .u209-op small {
          font-size: 11px;
          font-weight: 800;
          color: var(--ux-ink-3);
          font-variant-numeric: tabular-nums;
        }

        .u209-go {
          position: absolute;
          left: 22px;
          right: 22px;
          bottom: 24px;
          height: 46px;
          border: 0;
          border-radius: 13px;
          background: var(--ux-accent);
          color: #fff;
          font: inherit;
          font-size: 13.5px;
          font-weight: 850;
          cursor: pointer;
          transition: opacity 0.25s, transform 0.15s;
        }

        .u209-go:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        @media (prefers-reduced-motion: reduce) {
          .u209-cc em,
          .u209-dd,
          .u209-ht,
          .u209-ck circle,
          .u209-ck path {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>

      <div className="u209-wr">
        {fullCard && <h3>Xác nhận số điện thoại</h3>}
        {label && <label htmlFor={id}>{label}</label>}

        <div className="u209-fd">
          <button
            type="button"
            className="u209-cc"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={listboxId}
            aria-label="Chọn quốc gia / Choose country"
            onClick={() => setOpen(!open)}
          >
            <em className={isSpin ? "is-spin" : ""} aria-hidden="true">
              {country[1]}
            </em>
            <b>{country[3]}</b>
            <svg viewBox="0 0 9 9" aria-hidden="true">
              <path
                d="M1.5 3l3 3 3-3"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <input
            ref={inputRef}
            id={id}
            name={name}
            className="u209-in"
            type="tel"
            inputMode="numeric"
            required={required}
            aria-label={label || "Số điện thoại"}
            placeholder={country[5]}
            value={value}
            onChange={handleInputChange}
            onBlur={handleBlur}
            autoComplete="tel"
          />

          <svg className="u209-ck" viewBox="0 0 20 20" aria-hidden="true">
            <circle cx="10" cy="10" r="10" />
            <path d="M6 10.3l2.6 2.6L14 7.5" />
          </svg>
        </div>

        <div className="u209-ht" aria-live="polite">
          {hintText}
        </div>

        <div className="u209-dd">
          <input
            ref={searchRef}
            className="u209-sr"
            type="search"
            placeholder="Tìm quốc gia..."
            aria-label="Tìm quốc gia / Search countries"
            value={search}
            onChange={handleSearchChange}
          />
          <div className="u209-ls" id={listboxId} role="listbox">
            {filtered.map(({ c, i }) => (
              <button
                key={c[0]}
                type="button"
                className="u209-op"
                role="option"
                aria-selected={cur === i}
                onClick={() => pickCountry(i)}
              >
                <em aria-hidden="true">{c[1]}</em>
                <span>{c[2]}</span>
                <small>{c[3]}</small>
              </button>
            ))}
          </div>
        </div>
      </div>

      {fullCard && (
        <button
          type="button"
          className="u209-go"
          disabled={!isOk}
          onClick={onSendCode}
        >
          Gửi mã xác thực
        </button>
      )}
    </div>
  );
}
