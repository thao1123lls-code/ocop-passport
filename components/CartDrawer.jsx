// Lucian UX/UI Prompt #240 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#240
"use client";

import { useState, useEffect, useRef } from "react";
import CountryPhoneInput from "./CountryPhoneInput";
import { fmtVND } from "@/lib/store";
import { useLang } from "@/lib/i18n";

const FREE_SHIPPING_THRESHOLD = 300000; // 300.000đ freeship

// Rolling Digits for Subtotal
function RollingPrice({ value }) {
  const str = fmtVND(value);
  const chars = str.split("");

  return (
    <span className="u240-tt" aria-label={str}>
      {chars.map((ch, idx) => {
        const isDigit = /\d/.test(ch);
        if (!isDigit) {
          return (
            <span key={idx} className="u240-dg-char">
              {ch}
            </span>
          );
        }
        const digitNum = parseInt(ch, 10);
        return (
          <span key={idx} className="u240-dg" aria-hidden="true">
            <span style={{ transform: `translateY(-${digitNum * 1.2}em)` }}>
              {"0\n1\n2\n3\n4\n5\n6\n7\n8\n9".split("\n").map((d) => (
                <span key={d} className="u240-dg-num">
                  {d}
                </span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}

export default function CartDrawer({
  isOpen,
  onClose,
  bag,
  onUpdateQty,
  onRemove,
  onClearBag,
  justAddedId,
}) {
  const { lang, t } = useLang();
  const cartT = t.cart;

  const [removingIds, setRemovingIds] = useState(new Set());
  const [checkingOut, setCheckingOut] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [lastOrder, setLastOrder] = useState(null);
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const idempotencyKeyRef = useRef("");
  const drawerRef = useRef(null);
  const closeBtnRef = useRef(null);

  const [orderInfo, setOrderInfo] = useState({
    name: "",
    phone: "",
    address: "",
    note: "",
  });

  const totalCount = bag.reduce((s, x) => s + x.qty, 0);
  const totalPrice = bag.reduce((s, x) => s + x.price * x.qty, 0);
  const isFreeShip = totalPrice >= FREE_SHIPPING_THRESHOLD;
  const progressPct = Math.min(100, Math.round((totalPrice / FREE_SHIPPING_THRESHOLD) * 100));

  // Sinh Idempotency-Key mới mỗi khi mở phiên thanh toán mới
  useEffect(() => {
    if (isOpen) {
      if (!idempotencyKeyRef.current) {
        const key = typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : "idemp-" + Date.now() + "-" + Math.random().toString(36).slice(2, 9);
        idempotencyKeyRef.current = key;
        setIdempotencyKey(key);
      }
      setTimeout(() => {
        closeBtnRef.current?.focus?.({ preventScroll: true });
      }, 300);
    } else {
      idempotencyKeyRef.current = "";
      setIdempotencyKey("");
      setCheckingOut(false);
      setPaymentError("");
    }
  }, [isOpen]);

  // Handle keyboard Escape
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  // Remove item with slide & fold animation
  const handleRemoveClick = (id) => {
    setRemovingIds((prev) => new Set([...prev, id]));
    const isReduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTimeout(() => {
      onRemove(id);
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, isReduced ? 0 : 450);
  };

  // Submit payment / checkout with Idempotency Key protection
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!orderInfo.name.trim() || !orderInfo.phone.trim() || !orderInfo.address.trim()) {
      setPaymentError("Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ giao hàng.");
      return;
    }

    setIsSubmitting(true);
    setPaymentError("");

    const currentKey = idempotencyKeyRef.current || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "key-" + Date.now());

    try {
      const orderPayload = {
        name: orderInfo.name.trim(),
        phone: orderInfo.phone.trim(),
        address: orderInfo.address.trim(),
        note: orderInfo.note.trim(),
        items: bag.map((it) => ({
          id: it.id,
          name: it.name,
          price: it.price,
          qty: it.qty,
          lot: it.lot || "OCOP-2026",
        })),
        total: totalPrice,
        currency: "VND",
        createdAt: new Date().toISOString(),
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": currentKey,
        },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || "Giao dịch không thành công. Vui lòng thử lại.");
      }

      setLastOrder({
        orderCode: data.orderId || data.orderCode || "OP-" + Date.now().toString(36).toUpperCase(),
        isDuplicatePrevented: !!data.isDuplicatePrevented,
        name: orderInfo.name,
        phone: orderInfo.phone,
        address: orderInfo.address,
        note: orderInfo.note,
        total: totalPrice,
      });

      onClearBag();
      setCheckingOut(false);
      idempotencyKeyRef.current = "";
      setIdempotencyKey("");
    } catch (err) {
      console.error("Lỗi đặt hàng:", err);
      setPaymentError(err.message || "Không thể hoàn tất thanh toán. Vui lòng kiểm tra lại kết nối mạng.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`ux u240 ${isOpen ? "is-open" : ""}`}>
      <style jsx>{`
        :global(:root), .u240 {
          color-scheme: dark;
          --ux-page: #0F172A;
          --ux-surface: #1E293B;
          --ux-surface-2: #131D2E;
          --ux-surface-3: #0B1120;
          --ux-ink: #F8FAFC;
          --ux-ink-2: #CBD5E1;
          --ux-ink-3: #94A3B8;
          --ux-line: rgba(255, 255, 255, 0.08);
          --ux-line-2: rgba(255, 255, 255, 0.16);
          --ux-accent: #38BDF8;
          --ux-accent-2: #7DD3FC;
          --ux-accent-soft: rgba(56, 189, 248, 0.16);
          --ux-mint: #2DD4BF;
          --ux-warn: #F59E0B;
          --ux-danger: #F43F5E;
          --ux-shadow-strong: rgba(0, 0, 0, 0.85);
          --ux-ease: cubic-bezier(0.2, 0.8, 0.2, 1);
          --ux-spring: cubic-bezier(0.34, 1.45, 0.64, 1);
        }

        .ux, .ux * {
          box-sizing: border-box;
        }

        .u240 {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 100;
        }

        .u240.is-open {
          pointer-events: auto;
        }

        /* Backdrop overlay */
        .u240-ov {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.75) !important;
          backdrop-filter: blur(8px) !important;
          -webkit-backdrop-filter: blur(8px) !important;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.35s ease;
          z-index: 101;
        }

        .u240.is-open .u240-ov {
          opacity: 1;
          pointer-events: auto;
        }

        /* Drawer container sliding from right - Nền xám đen vững chắc #1E293B */
        .u240-dr {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: min(450px, 100vw);
          height: 100%;
          display: flex;
          flex-direction: column;
          background: #1E293B !important;
          border-left: 1.5px solid rgba(56, 189, 248, 0.35);
          box-shadow: -20px 0 60px rgba(0, 0, 0, 0.85);
          transform: translateX(105%);
          transition: transform 0.45s cubic-bezier(0.3, 1, 0.3, 1);
          border-top-left-radius: 20px;
          border-bottom-left-radius: 20px;
          z-index: 102;
          overflow: hidden;
          color: #F8FAFC !important;
        }

        .u240.is-open .u240-dr {
          transform: none;
        }

        /* Header */
        .u240-dh {
          display: flex;
          align-items: center;
          padding: 20px 18px 14px 22px;
          background: #1E293B !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
          flex-shrink: 0;
        }

        .u240-dh b {
          margin-right: auto;
          font-size: 18px;
          font-weight: 850;
          color: #F8FAFC !important;
          display: inline-flex;
          align-items: center;
        }

        .u240-ct {
          display: inline-grid;
          place-items: center;
          min-width: 22px;
          height: 22px;
          margin-left: 8px;
          padding: 0 6px;
          border-radius: 11px;
          background: #38BDF8 !important;
          color: #0F172A !important;
          font-style: normal;
          font-size: 11.5px;
          font-weight: 900;
          vertical-align: middle;
          box-shadow: 0 0 10px rgba(56, 189, 248, 0.45);
        }

        .u240-x {
          width: 32px;
          height: 32px;
          border: 0;
          border-radius: 50%;
          background: #131D2E !important;
          color: #94A3B8 !important;
          display: grid;
          place-items: center;
          cursor: pointer;
          transition: background 0.15s, transform 0.1s, color 0.15s;
        }

        .u240-x:hover {
          background: #0F172A !important;
          color: #F8FAFC !important;
          transform: scale(1.05);
        }

        .u240-x:active {
          transform: scale(0.95);
        }

        /* Free Shipping Bar */
        .u240-fs {
          margin: 14px 18px 10px;
          padding: 12px 16px;
          border-radius: 14px;
          background: #131D2E !important;
          font-size: 12.5px;
          font-weight: 700;
          color: #CBD5E1 !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          transition: background 0.3s, color 0.3s, border-color 0.3s;
          flex-shrink: 0;
        }

        .u240-fs b {
          color: #F8FAFC !important;
          font-weight: 850;
        }

        .u240-fs.is-ok {
          background: rgba(45, 212, 191, 0.16) !important;
          color: #2DD4BF !important;
          border-color: rgba(45, 212, 191, 0.4) !important;
        }

        .u240-fs.is-ok b {
          color: #4ADE80 !important;
        }

        .u240-bar {
          height: 7px;
          margin-top: 8px;
          border-radius: 4px;
          background: #0F172A !important;
          overflow: hidden;
        }

        .u240-bar i {
          display: block;
          height: 100%;
          border-radius: 4px;
          background: #38BDF8 !important;
          box-shadow: 0 0 10px #38BDF8 !important;
          transition: width 0.6s cubic-bezier(0.3, 1.2, 0.5, 1), background 0.3s;
        }

        .u240-fs.is-ok .u240-bar i {
          background: #2DD4BF !important;
          box-shadow: 0 0 10px #2DD4BF !important;
        }

        /* List */
        .u240-ls {
          flex: 1;
          overflow-y: auto;
          scrollbar-width: thin;
          padding: 4px 18px;
        }

        /* Item Row Animation */
        .u240-it {
          display: grid;
          grid-template-rows: 1fr;
          transition: grid-template-rows 0.4s cubic-bezier(0.3, 0.8, 0.3, 1) 0.15s, opacity 0.25s;
        }

        .u240-it > div {
          min-height: 0;
          overflow: hidden;
        }

        .u240-it.is-gone {
          grid-template-rows: 0fr;
          opacity: 0;
        }

        .u240-in {
          display: flex;
          gap: 12px;
          align-items: center;
          padding: 12px 6px;
          border-bottom: 1px solid var(--ux-line);
          transition: transform 0.3s cubic-bezier(0.5, 0, 0.75, 0);
          border-radius: 8px;
        }

        .u240-it.is-gone .u240-in {
          transform: translateX(110%);
        }

        .u240-it.is-fl .u240-in {
          animation: u240-fl 1.2s ease;
        }

        @keyframes u240-fl {
          0% {
            background: transparent;
          }
          20% {
            background: rgba(2, 132, 199, 0.18);
          }
          100% {
            background: transparent;
          }
        }

        .u240-th {
          flex: none;
          width: 54px;
          height: 60px;
          border-radius: 10px;
          overflow: hidden;
          background: #131D2E !important;
          display: grid;
          place-items: center;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }

        .u240-th img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .u240-th-emoji {
          font-size: 24px;
        }

        .u240-tx {
          flex: 1;
          min-width: 0;
        }

        .u240-tx b {
          display: block;
          font-size: 13.5px;
          font-weight: 850;
          color: #F8FAFC !important;
          line-height: 1.3;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .u240-tx small {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: #94A3B8 !important;
          margin-top: 2px;
        }

        .u240-qt {
          display: inline-flex;
          align-items: center;
          margin-top: 8px;
          border-radius: 8px;
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1) !important;
          background: #131D2E !important;
          overflow: hidden;
        }

        .u240-qt button {
          width: 26px;
          height: 26px;
          border: 0;
          background: none;
          color: #CBD5E1 !important;
          font: inherit;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          line-height: 1;
          display: grid;
          place-items: center;
          transition: background 0.15s, color 0.15s;
        }

        .u240-qt button:hover {
          background: #0B1120 !important;
          color: #F8FAFC !important;
        }

        .u240-qt span {
          min-width: 22px;
          text-align: center;
          font-size: 12px;
          font-weight: 850;
          color: #F8FAFC !important;
          font-variant-numeric: tabular-nums;
        }

        .u240-pr {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 12px;
          font-size: 13px;
          font-weight: 850;
          color: #F8FAFC !important;
          font-variant-numeric: tabular-nums;
        }

        .u240-rm {
          width: 26px;
          height: 26px;
          border: 0;
          border-radius: 6px;
          background: none;
          color: #94A3B8 !important;
          display: grid;
          place-items: center;
          cursor: pointer;
          transition: all 0.15s;
        }

        .u240-rm:hover {
          background: rgba(244, 63, 94, 0.2) !important;
          color: #FB7185 !important;
        }

        /* Footer */
        .u240-ft {
          padding: 16px 20px 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
          background: #1E293B !important;
          flex-shrink: 0;
        }

        .u240-sm {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          font-size: 13px;
          font-weight: 750;
          color: #CBD5E1 !important;
        }

        .u240-sm b {
          font-size: 20px;
          font-weight: 900;
          color: #38BDF8 !important;
          font-variant-numeric: tabular-nums;
        }

        .u240-ck {
          width: 100%;
          height: 48px;
          margin-top: 12px;
          border: 0;
          border-radius: 12px;
          background: var(--ux-accent);
          color: #0F172A;
          font: inherit;
          font-size: 14.5px;
          font-weight: 850;
          cursor: pointer;
          transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 0 16px rgba(56, 189, 248, 0.35);
        }

        .u240-ck:hover {
          background: var(--ux-accent-2);
          box-shadow: 0 0 22px rgba(56, 189, 248, 0.55);
          transform: translateY(-1px);
        }

        .u240-ck:active {
          transform: scale(0.98);
        }

        /* Digit rolling */
        :global(.u240-tt) {
          display: inline-flex;
          align-items: baseline;
          overflow: hidden;
        }

        :global(.u240-dg) {
          display: inline-block;
          height: 1.2em;
          overflow: hidden;
          line-height: 1.2;
          vertical-align: bottom;
        }

        :global(.u240-dg > span) {
          display: block;
          transition: transform 0.45s cubic-bezier(0.3, 1.25, 0.5, 1);
        }

        :global(.u240-dg-num) {
          display: block;
          height: 1.2em;
          line-height: 1.2;
          text-align: center;
        }

        :global(.u240-dg-char) {
          display: inline-block;
        }

        /* Empty state */
        .u240-empty {
          text-align: center;
          padding: 60px 20px;
          color: #94A3B8 !important;
        }

        .u240-empty-icon {
          font-size: 42px;
          margin-bottom: 12px;
        }

        /* Checkout form styles */
        .u240-checkout-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 10px 4px;
        }

        .u240-field label {
          display: block;
          font-size: 12px;
          font-weight: 750;
          color: #94A3B8 !important;
          margin-bottom: 4px;
        }

        .u240-field input,
        .u240-field textarea {
          width: 100%;
          padding: 9px 12px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.14) !important;
          background: #131D2E !important;
          color: #F8FAFC !important;
          font: inherit;
          font-size: 13.5px;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }

        .u240-field input:focus,
        .u240-field textarea:focus {
          border-color: #38BDF8 !important;
          box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.25) !important;
        }

        .u240-idemp-badge {
          font-size: 11.5px;
          background: rgba(56, 189, 248, 0.12) !important;
          color: #38BDF8 !important;
          border: 1px solid rgba(56, 189, 248, 0.35) !important;
          padding: 6px 10px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .u240-order-success {
          padding: 18px;
          background: rgba(45, 212, 191, 0.15) !important;
          border: 1px solid rgba(45, 212, 191, 0.4) !important;
          border-radius: 12px;
          margin-bottom: 14px;
          color: #2DD4BF !important;
        }

        @media (prefers-reduced-motion: reduce) {
          .u240-dr, .u240-ov, .u240-it, .u240-in, .u240-bar i, :global(.u240-dg > span) {
            transition: none !important;
          }
          .u240-it.is-fl .u240-in {
            animation: none !important;
          }
        }
      `}</style>

      {/* Backdrop */}
      <div
        className="u240-ov"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        ref={drawerRef}
        className="u240-dr"
        role="dialog"
        aria-modal="true"
        aria-hidden={!isOpen}
        aria-label={cartT.title}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="u240-dh">
          <b>
            {cartT.title}
            <i className="u240-ct">{totalCount}</i>
          </b>
          <button
            ref={closeBtnRef}
            type="button"
            className="u240-x"
            aria-label={cartT.close}
            onClick={onClose}
          >
            <svg viewBox="0 0 11 11" width="12" height="12" aria-hidden="true">
              <path
                d="M2 2l7 7M9 2L2 9"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Free Shipping Progress Bar (Element #240) */}
        <div className={`u240-fs ${isFreeShip ? "is-ok" : ""}`} aria-live="polite">
          <span className="u240-fm">
            {isFreeShip ? (
              <>{cartT.freeShipDone}</>
            ) : (
              <>
                {cartT.freeShipNeed?.replace("{amount}", fmtVND(FREE_SHIPPING_THRESHOLD - totalPrice))}
              </>
            )}
          </span>
          <div className="u240-bar">
            <i style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        {/* List of items or Checkout view */}
        <div className="u240-ls">
          {lastOrder && (
            <div className="u240-order-success">
              <b style={{ display: "block", fontSize: 14.5, marginBottom: 4 }}>
                ✓ {cartT.orderSuccess}
              </b>
              <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>
                {cartT.orderCode}: #{lastOrder.orderCode}
              </div>
              {lastOrder.isDuplicatePrevented && (
                <div style={{ fontSize: 11.5, background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE", padding: "4px 8px", borderRadius: 6, margin: "6px 0" }}>
                  🛡️ <b>{cartT.safeBadge}:</b> {lang === "en" ? "Safe retry, zero double charge guarantee." : "Thao tác gửi lại an toàn, tuyệt đối không trừ tiền hay tạo đơn 2 lần."}
                </div>
              )}
              <div style={{ fontSize: 12, lineHeight: 1.5 }}>
                <div><b>{lang === "en" ? "Recipient:" : "Người nhận:"}</b> {lastOrder.name} ({lastOrder.phone})</div>
                <div><b>{lang === "en" ? "Address:" : "Địa chỉ:"}</b> {lastOrder.address}</div>
                <div><b>{cartT.subtotal}:</b> {fmtVND(lastOrder.total)}</div>
              </div>
            </div>
          )}

          {checkingOut ? (
            <form onSubmit={handlePaymentSubmit} className="u240-checkout-form">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <b style={{ fontSize: 14 }}>{cartT.formTitle}</b>
                <button
                  type="button"
                  onClick={() => setCheckingOut(false)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--ux-accent)",
                    fontWeight: 700,
                    fontSize: 12.5,
                    cursor: "pointer",
                  }}
                >
                  {cartT.backToCart}
                </button>
              </div>

              {/* Idempotency Key badge */}
              <div className="u240-idemp-badge" title="Mã định danh duy nhất chống Double Charge">
                <span>🔒</span>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  Idempotency-Key: <code>{idempotencyKey || (lang === "en" ? "Generating key…" : "Đang tạo mã…")}</code>
                </span>
              </div>

              {paymentError && (
                <div style={{ background: "#FEF2F2", color: "#B91C1C", border: "1px solid #FCA5A5", padding: "8px 12px", borderRadius: 8, fontSize: 12 }}>
                  ⚠️ {paymentError}
                </div>
              )}

              <div className="u240-field">
                <label htmlFor="u240-name">{cartT.name}</label>
                <input
                  id="u240-name"
                  required
                  disabled={isSubmitting}
                  value={orderInfo.name}
                  onChange={(e) => setOrderInfo({ ...orderInfo, name: e.target.value })}
                  placeholder={lang === "en" ? "e.g. Alex Johnson" : "Ví dụ: Nguyễn Văn A"}
                />
              </div>

              <CountryPhoneInput
                id="u240-phone"
                required
                disabled={isSubmitting}
                label={cartT.phone}
                value={orderInfo.phone}
                onChange={(e) => setOrderInfo({ ...orderInfo, phone: e.target.value })}
                placeholder={lang === "en" ? "Enter phone number" : "Nhập số điện thoại"}
              />

              <div className="u240-field">
                <label htmlFor="u240-addr">{cartT.addr}</label>
                <textarea
                  id="u240-addr"
                  required
                  rows={2}
                  disabled={isSubmitting}
                  value={orderInfo.address}
                  onChange={(e) => setOrderInfo({ ...orderInfo, address: e.target.value })}
                  placeholder={lang === "en" ? "House no, street, ward, district, city…" : "Số nhà, đường, xã/phường, quận/huyện, tỉnh thành…"}
                />
              </div>

              <div className="u240-field">
                <label htmlFor="u240-note">{cartT.note}</label>
                <input
                  id="u240-note"
                  disabled={isSubmitting}
                  value={orderInfo.note}
                  onChange={(e) => setOrderInfo({ ...orderInfo, note: e.target.value })}
                  placeholder={lang === "en" ? "Office hours delivery, call beforehand…" : "Giao giờ hành chính, gọi trước khi giao…"}
                />
              </div>
            </form>
          ) : bag.length === 0 ? (
            <div className="u240-empty">
              <div className="u240-empty-icon">🌱</div>
              <b style={{ display: "block", fontSize: 15, marginBottom: 4 }}>
                {cartT.emptyTitle}
              </b>
              <p style={{ fontSize: 12.5, margin: 0 }}>
                {cartT.emptyDesc}
              </p>
            </div>
          ) : (
            bag.map((item) => {
              const isRemoving = removingIds.has(item.id);
              const isFlashing = justAddedId === item.id;
              return (
                <div
                  key={item.id}
                  className={`u240-it ${isRemoving ? "is-gone" : ""} ${isFlashing ? "is-fl" : ""}`}
                >
                  <div>
                    <div className="u240-in">
                      {/* Thumbnail */}
                      <span className="u240-th">
                        {item.photo ? (
                          <img src={item.photo} alt={item.name} />
                        ) : (
                          <span className="u240-th-emoji">📦</span>
                        )}
                      </span>

                      {/* Info */}
                      <div className="u240-tx">
                        <b title={item.name}>{item.name}</b>
                        <small>
                          {item.weight || "Quy cách chuẩn"} · Lô {item.lot || "OCOP"}
                        </small>
                        <div className="u240-qt">
                          <button
                            type="button"
                            className="u240-mn"
                            aria-label={`Giảm số lượng ${item.name}`}
                            onClick={() => onUpdateQty(item.id, -1)}
                          >
                            −
                          </button>
                          <span>{item.qty}</span>
                          <button
                            type="button"
                            className="u240-pl"
                            aria-label={`Tăng số lượng ${item.name}`}
                            onClick={() => onUpdateQty(item.id, 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Price & Remove */}
                      <div className="u240-pr">
                        <span className="u240-lp">{fmtVND(item.price * item.qty)}</span>
                        <button
                          type="button"
                          className="u240-rm"
                          aria-label={`Xóa ${item.name} khỏi giỏ`}
                          onClick={() => handleRemoveClick(item.id)}
                        >
                          <svg viewBox="0 0 12 12" width="13" height="13" aria-hidden="true">
                            <path
                              d="M2.5 3.5h7M4.8 3.5V2.3h2.4v1.2M3.5 3.5l.5 6.2h4l.5-6.2"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.3"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {bag.length > 0 && (
          <div className="u240-ft">
            <div className="u240-sm">
              <span>{checkingOut ? cartT.subtotal : (lang === "en" ? "Subtotal" : "Tạm tính")}</span>
              <RollingPrice value={totalPrice} />
            </div>

            {checkingOut ? (
              <button
                type="button"
                className="u240-ck"
                disabled={isSubmitting}
                onClick={handlePaymentSubmit}
              >
                {isSubmitting ? (lang === "en" ? "Processing order…" : "Đang xử lý đơn hàng…") : `${cartT.confirmOrder} · ${fmtVND(totalPrice)}`}
              </button>
            ) : (
              <button
                type="button"
                className="u240-ck"
                onClick={() => setCheckingOut(true)}
              >
                {cartT.checkout}
              </button>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}
