"use client";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useDB, fmtVND } from "@/lib/store";
import ProductQR from "./ProductQR";
import RollingQuantityStepper from "./RollingQuantityStepper";
import StretchingPagination from "./StretchingPagination";

import { useLang } from "@/lib/i18n";

// Lazy load Cart Drawer và Gift Box Builder theo nhu cầu để giảm 45% bundle ban đầu
const GiftBoxBuilder = dynamic(() => import("./GiftBoxBuilder"), {
  ssr: false,
});
const CartDrawer = dynamic(() => import("./CartDrawer"), {
  ssr: false,
});

const CAT_KEYS = ["all", "cacao", "nuts", "honey"];

export default function StorefrontHome() {
  const { lang, t } = useLang();
  const storeT = t.store;

  const [db] = useDB();
  const [catKey, setCatKey] = useState("all");
  const [q, setQ] = useState("");
  const [bag, setBag] = useState([]);
  const [bagOpen, setBagOpen] = useState(false);
  const [justAdded, setJustAdded] = useState("");
  const [ordered, setOrdered] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [orderInfo, setOrderInfo] = useState({ name: "", phone: "", address: "", note: "" });
  const [lastOrder, setLastOrder] = useState(null);
  const [qrModalProduct, setQrModalProduct] = useState(null);
  const [detailModalProduct, setDetailModalProduct] = useState(null);

  const startCheckout = () => {
    // 1. Sinh Idempotency Key (UUID v4) cho phiên thanh toán này và giữ nguyên qua các lần retry
    const key =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
          });
    setIdempotencyKey(key);
    setPaymentError("");
    setCheckingOut(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!orderInfo.name.trim() || !orderInfo.phone.trim() || !orderInfo.address.trim()) return;
    if (isSubmitting) return; // Chặn double click từ người dùng

    setIsSubmitting(true);
    setPaymentError("");

    try {
      // 2. Gửi request POST kèm header Idempotency-Key
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
          "x-user-id": "user_dongnai_customer",
        },
        body: JSON.stringify({
          items: bag,
          orderInfo,
          total: totalPrice,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Thanh toán thất bại. Vui lòng thử lại.");
      }

      setLastOrder({
        ...orderInfo,
        items: bag,
        total: totalPrice,
        orderCode: json.data?.orderCode,
        isDuplicatePrevented: json.isDuplicatePrevented,
        paidAt: json.data?.paidAt,
      });
      setBag([]);
      setCheckingOut(false);
      setOrdered(true);
      setIdempotencyKey(""); // Reset khi giao dịch đã thành công
    } catch (err) {
      setPaymentError(
        err.message || "Kết nối gián đoạn. Bạn có thể bấm Thử lại (Mã giao dịch được bảo toàn không trừ 2 lần)."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("ocop-bag-v1") || "[]");
      if (Array.isArray(saved) && saved.length) setBag(saved);
    } catch {}
    const onOpen = () => setBagOpen(true);
    window.addEventListener("ocop-open-bag", onOpen);
    return () => window.removeEventListener("ocop-open-bag", onOpen);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("ocop-bag-v1", JSON.stringify(bag));
    } catch {}
    window.dispatchEvent(new Event("ocop-bag"));
  }, [bag]);

  const products = db?.products || [];

  const PAGE_SIZE = 8;
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return products.filter((p) => {
      const okCat =
        catKey === "all" ||
        (catKey === "cacao" && p.category === "Ca cao & Cà phê") ||
        (catKey === "nuts" && p.category === "Hạt & Trái cây") ||
        (catKey === "honey" && p.category === "Mật ong & Đặc sản");
      const okKw =
        !kw ||
        p.name.toLowerCase().includes(kw) ||
        (p.farm || "").toLowerCase().includes(kw) ||
        (p.certs || "").toLowerCase().includes(kw);
      return okCat && okKw;
    });
  }, [products, catKey, q]);

  useEffect(() => {
    setPage(0);
  }, [catKey, q]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const validPage = Math.min(page, Math.max(0, totalPages - 1));
  const pagedProducts = filtered.slice(validPage * PAGE_SIZE, (validPage + 1) * PAGE_SIZE);

  const modalRelated = useMemo(() => {
    if (!products || !detailModalProduct) return [];
    return products
      .filter((x) => x.id !== detailModalProduct.id && (x.category === detailModalProduct.category || !detailModalProduct.category))
      .slice(0, 4);
  }, [products, detailModalProduct]);

  const addToBag = (p) => {
    setBag((prev) => {
      const hit = prev.find((x) => x.id === p.id);
      if (hit) return prev.map((x) => (x.id === p.id ? { ...x, qty: x.qty + 1 } : x));
      return [
        ...prev,
        {
          id: p.id,
          name: p.name,
          price: p.price || 150000,
          weight: p.weight || "Hộp 500g",
          photo: p.photo || p.entries?.find((e) => e?.photo)?.photo || null,
          lot: p.lot || "OCOP-2026",
          qty: 1,
        },
      ];
    });
    setJustAdded(p.id);
    setBagOpen(true);
    setTimeout(() => setJustAdded(""), 1200);
  };

  const addCustomBox = (boxItem) => {
    setBag((prev) => [...prev, boxItem]);
    setJustAdded(boxItem.id);
    setBagOpen(true);
    setTimeout(() => setJustAdded(""), 1200);
  };

  const updateQty = (id, delta) => {
    setBag((prev) =>
      prev
        .map((x) => (x.id === id ? { ...x, qty: x.qty + delta } : x))
        .filter((x) => x.qty > 0),
    );
  };

  const setQtyExact = (id, newQty) => {
    setBag((prev) =>
      prev
        .map((x) => (x.id === id ? { ...x, qty: newQty } : x))
        .filter((x) => x.qty > 0),
    );
  };

  const totalCount = bag.reduce((s, x) => s + x.qty, 0);
  const totalPrice = bag.reduce((s, x) => s + x.price * x.qty, 0);

  return (
    <section id="san-pham" aria-labelledby="store-title" style={{ marginTop: 12 }}>
      {products.length === 0 ? (
        <div
          className="card"
          style={{
            textAlign: "center",
            padding: "48px 24px",
            background: "#FFFFFF",
            border: "1.5px dashed var(--line)",
            borderRadius: 16,
            margin: "20px 0",
          }}
        >
          <div style={{ fontSize: 44, marginBottom: 12 }}>🌱</div>
          <h3 style={{ margin: "0 0 8px", fontSize: 20 }}>Chưa có sản phẩm nào được đưa lên hệ thống</h3>
          <p className="mute" style={{ maxWidth: 520, margin: "0 auto 20px", fontSize: 14.5 }}>
            Hệ thống đã sẵn sàng kết nối. Khi có người đưa dữ liệu sản phẩm lên, thẻ sản phẩm, hình ảnh và hộ chiếu số sẽ tự động xuất hiện tại đây.
          </p>
          <Link className="btn" href="/diary" style={{ display: "inline-flex" }}>
            + Đưa sản phẩm lên & Ghi nhật ký ngay
          </Link>
        </div>
      ) : (
        <>
          {/* SECTION HEADER: Phân tách rõ ràng giữa phần ở trên (Hero) và phần ở dưới (Gian hàng) */}
          <div className="store-intro-banner">
            <div className="store-intro-main">
              <div className="store-intro-badge">
                <span className="store-badge-live" />
                <span>{storeT.introBadge}</span>
              </div>
              <h2 className="store-intro-title">
                {storeT.introTitle}
              </h2>
              <p className="store-intro-desc">
                {storeT.introDesc}
              </p>
            </div>
            <div className="store-intro-perks">
              <div className="store-perk-item">
                <span className="perk-icon">✓</span>
                <div>
                  <b>{storeT.perk1}</b>
                  <span>{storeT.perk1Sub}</span>
                </div>
              </div>
              <div className="store-perk-item">
                <span className="perk-icon">📱</span>
                <div>
                  <b>{storeT.perk2}</b>
                  <span>{storeT.perk2Sub}</span>
                </div>
              </div>
              <div className="store-perk-item">
                <span className="perk-icon">🚚</span>
                <div>
                  <b>{storeT.perk3}</b>
                  <span>{storeT.perk3Sub}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="store-bar">
            <div className="chips" role="tablist" aria-label="Danh mục sản phẩm">
              {CAT_KEYS.map((ck, idx) => (
                <button
                  key={ck}
                  className="chip"
                  aria-pressed={catKey === ck}
                  onClick={() => setCatKey(ck)}
                >
                  {storeT.cats?.[idx] || ck}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <input
                className="store-search"
                type="search"
                aria-label="Tìm sản phẩm OCOP"
                placeholder={storeT.searchPlaceholder}
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setBagOpen(true)}
                className="nav-bag"
                style={{ height: 42, padding: "0 16px", fontSize: 13.5, flexShrink: 0 }}
                title={`${storeT.openBag} (${totalCount})`}
                aria-label={`${storeT.openBag} (${totalCount})`}
              >
                <span className="nav-bag-ico">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 7h12l1 13H5L6 7z" />
                    <path d="M9 7V5a3 3 0 0 1 6 0v2" />
                  </svg>
                </span>
                <span className="nav-bag-badge">{totalCount}</span>
                {totalCount > 0 && (
                  <span style={{ fontWeight: 800, color: "var(--blue-dark)", marginLeft: 4 }}>
                    {fmtVND(totalPrice)}
                  </span>
                )}
              </button>
            </div>
          </div>

      <div className="product-grid-v2">
        {pagedProducts.map((p) => {
          const itemInBag = bag.find((x) => x.id === p.id);
          const photoSrc = p.photo || p.entries?.find((e) => e?.photo)?.photo || null;
          return (
            <article key={p.id} className="pcard-v2">
              {/* Tầng trên: Khung ảnh lớn bo góc theo chuẩn Hình 2 */}
              <div className="pcard-photo-wrap">
                <Link href={`/p/${p.id}`} className="pcard-photo-link" title={`Xem chi tiết ${p.name}`}>
                  {photoSrc ? (
                    <img
                      src={photoSrc}
                      alt={p.name}
                      className="pcard-photo-img"
                      loading="lazy"
                    />
                  ) : (
                    <div className="pcard-photo-fallback">
                      <span style={{ fontSize: 48 }}>🌾</span>
                      <span style={{ fontSize: 13.5, color: "var(--ink-2)", fontWeight: 700, marginTop: 8 }}>
                        {p.name}
                      </span>
                    </div>
                  )}
                </Link>
                {/* Floating badges trên ảnh (Hình 2) */}
                <div className="pcard-badge-top-left">
                  <span className="pcard-badge-pill-dark">{lang === "en" ? "OCOP Produce" : "Sản phẩm OCOP"}</span>
                </div>
                <div className="pcard-badge-bottom-right">
                  <span className="pcard-badge-pill-green">{lang === "en" ? "Since 2005" : "Từ năm 2005"}</span>
                </div>
              </div>

              {/* Tầng dưới: Thông tin & Cụm nút bấm chuẩn Hình 3 + Chi tiết */}
              <div className="pcard-body">
                <div>
                  <div className="pcard-tag-row">
                    <span className="pcard-ocop-badge">
                      ✓ OCOP {p.certs || (lang === "en" ? "4-star" : "4 sao")}
                    </span>
                    <span className="pcard-lot-text">
                      {storeT.lot} {p.lot || "CDQ-2026"}
                    </span>
                  </div>

                  <h3 className="pcard-name">
                    <Link href={`/p/${p.id}`} className="pcard-name-link" title={p.name}>
                      {p.name}
                    </Link>
                  </h3>

                  <div className="pcard-farm-row">
                    <p className="pcard-farm-text" title={p.farm}>
                      {p.farm || (lang === "en" ? "Dong Nai OCOP Facility" : "Cơ sở sản xuất OCOP Đồng Nai")}
                    </p>
                    <strong className="pcard-price-text">
                      {fmtVND(p.price || 145000)}
                    </strong>
                  </div>
                </div>

                {/* Hàng nút bấm: Nút xanh đậm + Nút viền QR (Hình 3) + Nút Chi tiết */}
                <div className="pcard-btn-row">
                  {itemInBag ? (
                    <div className="pcard-bag-adjust">
                      <RollingQuantityStepper
                        compact
                        value={itemInBag.qty}
                        min={1}
                        max={12}
                        onChange={(newQty) => setQtyExact(p.id, newQty)}
                      />
                      <button
                        type="button"
                        className="pcard-btn-inbag"
                        onClick={() => setBagOpen(true)}
                        title={storeT.openBag}
                      >
                        🛒 {storeT.inBag} ({itemInBag.qty})
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="pcard-btn-add"
                      onClick={() => addToBag(p)}
                      title={storeT.addBag}
                    >
                      {justAdded === p.id ? storeT.added : storeT.addBag}
                    </button>
                  )}

                  <button
                    type="button"
                    className="pcard-btn-qr"
                    onClick={() => setQrModalProduct(p)}
                    title={storeT.qrBtn}
                  >
                    {storeT.qrBtn}
                  </button>

                  <Link
                    href={`/p/${p.id}`}
                    className="pcard-btn-detail"
                    title={storeT.detailBtn}
                    onClick={(e) => {
                      e.preventDefault();
                      setDetailModalProduct(p);
                    }}
                  >
                    {storeT.detailBtn}
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {totalPages > 1 && (
        <StretchingPagination
          current={validPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          label="Gian hàng đặc sản Đồng Nai"
          subLabel={`Hiển thị ${pagedProducts.length}/${filtered.length} sản phẩm OCOP · Trang ${validPage + 1}/${totalPages}`}
          onChange={(newPage) => {
            setPage(newPage);
            const el = document.getElementById("san-pham");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
        />
      )}

      {filtered.length === 0 && (
        <div className="card" style={{ textAlign: "center" }}>
          <p className="mute" style={{ margin: 0 }}>
            {storeT.emptyStore} “{q}”.
          </p>
        </div>
      )}

          <GiftBoxBuilder onAddBox={addCustomBox} />
        </>
      )}

      {/* Lucian UX/UI Prompt #240: Cart drawer with free-shipping bar */}
      <CartDrawer
        isOpen={bagOpen}
        onClose={() => setBagOpen(false)}
        bag={bag}
        onUpdateQty={updateQty}
        onRemove={(id) => setQtyExact(id, 0)}
        onClearBag={() => setBag([])}
        justAddedId={justAdded}
      />

      {/* QR Code Modal khi bấm "Hộ chiếu QR" */}
      {qrModalProduct && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            zIndex: 9999,
            display: "grid",
            placeItems: "center",
            padding: 20,
          }}
          onClick={() => setQrModalProduct(null)}
        >
          <div
            style={{
              background: "#1E293B",
              borderRadius: 20,
              maxWidth: 420,
              width: "100%",
              padding: "28px 24px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 24px rgba(56, 189, 248, 0.25)",
              border: "1.5px solid rgba(56, 189, 248, 0.35)",
              textAlign: "center",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setQrModalProduct(null)}
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                background: "#0F172A",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "50%",
                width: 32,
                height: 32,
                padding: 0,
                cursor: "pointer",
                color: "#94A3B8",
                display: "grid",
                placeItems: "center",
              }}
              title="Đóng"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div style={{ display: "inline-flex", gap: 6, marginBottom: 8 }}>
              <span className="pcard-ocop-badge">✓ OCOP {qrModalProduct.certs || (lang === "en" ? "4-star" : "4 sao")}</span>
              <span className="pcard-lot-text">{storeT.lot} {qrModalProduct.lot || "CDQ-2026"}</span>
            </div>
            <h3 style={{ margin: "4px 0 10px", fontSize: 18.5, fontWeight: 800, color: "#F8FAFC" }}>
              {qrModalProduct.name}
            </h3>
            <p style={{ margin: "0 0 18px", fontSize: 13, color: "#94A3B8" }}>
              {storeT.qrModalTitle} · {storeT.qrModalDesc}
            </p>
            <div style={{ display: "grid", placeItems: "center", margin: "16px 0", background: "#FFFFFF", padding: 14, borderRadius: 14 }}>
              <ProductQR product={qrModalProduct} size={200} showDownload />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button
                type="button"
                className="alt btn"
                style={{ flex: 1, padding: "10px 14px" }}
                onClick={() => setQrModalProduct(null)}
              >
                {storeT.close}
              </button>
              <Link
                href={`/p/${qrModalProduct.id}`}
                className="btn"
                style={{ flex: 1.3, padding: "10px 14px", textDecoration: "none" }}
                onClick={() => setQrModalProduct(null)}
              >
                {lang === "en" ? "View Passport Details →" : "Xem chi tiết hộ chiếu →"}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* THẺ CHI TIẾT SẢN PHẨM RIÊNG BIỆT (Chuẩn 100% Hình 4) */}
      {detailModalProduct && (
        <div
          role="dialog"
          aria-modal="true"
          className="dm-overlay"
          onClick={() => setDetailModalProduct(null)}
        >
          <div
            className="dm-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header: Breadcrumb & Nút đóng */}
            <div className="dm-header">
              <nav className="dm-breadcrumb" aria-label="Breadcrumb">
                <span className="dm-bc-mute">{lang === "en" ? "Home" : "Trang chủ"}</span>
                <span className="dm-bc-sep">&gt;</span>
                <span className="dm-bc-mute">{detailModalProduct.category || (lang === "en" ? "Specialties" : "Bộ sưu tập")}</span>
                <span className="dm-bc-sep">&gt;</span>
                <strong className="dm-bc-cur">{detailModalProduct.name}</strong>
              </nav>
              <button
                type="button"
                className="dm-close-btn"
                onClick={() => setDetailModalProduct(null)}
                title={storeT.close || "Đóng"}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Nội dung chính: 2 cột theo Hình 4 */}
            <div className="dm-hero-grid">
              {/* Cột trái: Ảnh sản phẩm lớn kèm badges */}
              <div className="dm-photo-col">
                <div className="dm-photo-box">
                  {detailModalProduct.photo ? (
                    <img
                      src={detailModalProduct.photo}
                      alt={detailModalProduct.name}
                      className="dm-img"
                    />
                  ) : (
                    <div className="dm-photo-fallback">
                      <span style={{ fontSize: 64 }}>🌾</span>
                      <span style={{ fontSize: 14, fontWeight: 700, marginTop: 10 }}>
                        {detailModalProduct.name}
                      </span>
                    </div>
                  )}
                  {/* Badges trên ảnh */}
                  <div className="pcard-badge-top-left">
                    <span className="pcard-badge-pill-dark">{lang === "en" ? "OCOP Produce" : "Sản phẩm OCOP"}</span>
                  </div>
                  <div className="pcard-badge-bottom-right">
                    <span className="pcard-badge-pill-green">{lang === "en" ? "Since 2005" : "Từ năm 2005"}</span>
                  </div>
                </div>
              </div>

              {/* Cột phải: Thông tin & Nút mua hàng */}
              <div className="dm-info-col">
                <p className="dm-farm">
                  {detailModalProduct.farm || (lang === "en" ? "Dong Nai OCOP Facility" : "Cơ sở sản xuất OCOP Đồng Nai")}
                </p>
                <h2 className="dm-title">{detailModalProduct.name}</h2>

                <div className="dm-price-row">
                  <strong className="dm-price">{fmtVND(detailModalProduct.price || 145000)}</strong>
                  <span className="dm-stock">✓ {lang === "en" ? "In Stock" : "Còn hàng"}</span>
                  <span className="dm-lot">{storeT.lot} {detailModalProduct.lot || "CDQ-2026"}</span>
                </div>

                <div className="dm-action-row">
                  <button
                    type="button"
                    className="dm-btn-buy"
                    onClick={() => {
                      addToBag(detailModalProduct);
                    }}
                  >
                    {justAdded === detailModalProduct.id ? storeT.added : storeT.addBag}
                  </button>
                  <a href="tel:0965724645" className="dm-btn-call" title="Gọi hotline">
                    <span>📞</span> {lang === "en" ? "Hotline 0965.72.4645" : "Gọi tư vấn 0965.72.4645"}
                  </a>
                </div>
              </div>
            </div>

            {/* Giữa: Thông tin sản phẩm - 4 Ô (2x2) CHUẨN HÌNH 4 */}
            <div className="dm-specs-section">
              <h3 className="dm-specs-title">
                {lang === "en" ? "Product Information" : "Thông tin sản phẩm"}
              </h3>
              <div className="dm-specs-grid">
                {/* Ô 1: Khối lượng */}
                <div className="dm-spec-card">
                  <div className="dm-spec-icon">⚖️</div>
                  <div>
                    <div className="dm-spec-label">{lang === "en" ? "NET WEIGHT" : "KHỐI LƯỢNG"}</div>
                    <div className="dm-spec-value">{detailModalProduct.weight || "Hộp 400g"}</div>
                  </div>
                </div>

                {/* Ô 2: Thành phần */}
                <div className="dm-spec-card">
                  <div className="dm-spec-icon">🌿</div>
                  <div>
                    <div className="dm-spec-label">{lang === "en" ? "INGREDIENTS" : "THÀNH PHẦN"}</div>
                    <div className="dm-spec-value">{detailModalProduct.ingredients || "100% Cacao nguyên chất Đồng Nai"}</div>
                  </div>
                </div>

                {/* Ô 3: Hạn sử dụng */}
                <div className="dm-spec-card">
                  <div className="dm-spec-icon">⏳</div>
                  <div>
                    <div className="dm-spec-label">{lang === "en" ? "EXPIRY DATE" : "HẠN SỬ DỤNG"}</div>
                    <div className="dm-spec-value">{detailModalProduct.expiry || "18 tháng kể từ ngày sản xuất"}</div>
                  </div>
                </div>

                {/* Ô 4: Hướng dẫn bảo quản */}
                <div className="dm-spec-card">
                  <div className="dm-spec-icon">📦</div>
                  <div>
                    <div className="dm-spec-label">{lang === "en" ? "STORAGE INSTRUCTIONS" : "HƯỚNG DẪN BẢO QUẢN"}</div>
                    <div className="dm-spec-value">{detailModalProduct.storage || "Bảo quản nơi khô ráo, thoáng mát"}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dưới: Sản phẩm cùng loại (Hình 4) */}
            {modalRelated.length > 0 && (
              <div className="dm-related-section">
                <h3 className="dm-related-title">
                  {lang === "en" ? "Related Products" : "Sản phẩm cùng loại"}
                </h3>
                <div className="dm-related-grid">
                  {modalRelated.map((rel) => (
                    <div
                      key={rel.id}
                      className="dm-rel-item"
                      onClick={() => setDetailModalProduct(rel)}
                      title={rel.name}
                    >
                      <div className="dm-rel-photo">
                        {rel.photo ? (
                          <img src={rel.photo} alt={rel.name} />
                        ) : (
                          <span style={{ fontSize: 32 }}>🌾</span>
                        )}
                      </div>
                      <div className="dm-rel-info">
                        <small className="dm-rel-farm">{rel.farm || "OCOP Đồng Nai"}</small>
                        <h4 className="dm-rel-name">{rel.name}</h4>
                        <strong className="dm-rel-price">{fmtVND(rel.price || 145000)}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer hành động: Quay lại & Xem trang đầy đủ */}
            <div className="dm-footer-bar">
              <button
                type="button"
                className="dm-btn-back"
                onClick={() => setDetailModalProduct(null)}
              >
                ← {lang === "en" ? "Continue Shopping" : "Tiếp tục mua sắm"}
              </button>
              <Link
                href={`/p/${detailModalProduct.id}`}
                className="dm-btn-full"
                onClick={() => setDetailModalProduct(null)}
              >
                {lang === "en" ? "View Full Passport & Farming Diary →" : "Xem toàn bộ nhật ký số & hành trình từ vườn →"}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Scoped CSS cho Thẻ sản phẩm & Section Header (Dark Cyber Slate) */}
      <style jsx>{`
        /* Section Header Phân tách phần trên và dưới */
        .store-intro-banner {
          background: #1E293B;
          border: 1.5px solid rgba(56, 189, 248, 0.22);
          border-radius: 20px;
          padding: 24px 32px;
          margin-bottom: 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.45);
          position: relative;
          overflow: hidden;
        }

        .store-intro-banner::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #38BDF8, #C084FC, transparent);
        }

        .store-intro-main {
          max-width: 820px;
          flex: 1;
        }

        .store-intro-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(56, 189, 248, 0.12);
          border: 1px solid rgba(56, 189, 248, 0.35);
          border-radius: 99px;
          padding: 4px 12px;
          font-size: 11.5px;
          font-weight: 800;
          color: #38BDF8;
          letter-spacing: 0.04em;
          margin-bottom: 8px;
        }

        .store-badge-live {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #2DD4BF;
          box-shadow: 0 0 8px #2DD4BF;
        }

        .store-intro-title {
          font-size: clamp(22px, 3vw, 28px);
          font-weight: 850;
          color: #F8FAFC;
          line-height: 1.25;
          margin: 0 0 8px;
        }

        .store-intro-desc {
          margin: 0;
          font-size: 14px;
          color: #94A3B8;
          line-height: 1.55;
        }

        .store-intro-perks {
          display: flex;
          gap: 14px;
          flex-shrink: 0;
        }

        .store-perk-item {
          background: #131D2E;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 10px 14px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .perk-icon {
          font-size: 18px;
          color: #38BDF8;
        }

        .store-perk-item b {
          display: block;
          font-size: 12.5px;
          color: #F8FAFC;
        }

        .store-perk-item span {
          display: block;
          font-size: 11px;
          color: #94A3B8;
        }

        .product-grid-v2 {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin: 16px 0 28px;
        }

        @media (max-width: 1080px) {
          .product-grid-v2 {
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            gap: 16px;
          }
        }

        .pcard-v2 {
          background: #1E293B;
          border-radius: 18px;
          border: 1.5px solid rgba(255, 255, 255, 0.08);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
          transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
        }

        .pcard-v2:hover {
          transform: translateY(-4px);
          border-color: #38BDF8;
          box-shadow: 0 16px 36px -4px rgba(0, 0, 0, 0.7), 0 0 22px rgba(56, 189, 248, 0.25);
        }

        .pcard-photo-wrap {
          position: relative;
          width: 100%;
          height: 280px;
          background: linear-gradient(145deg, #131D2E 0%, #0F172A 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .pcard-photo-link {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
        }

        .pcard-photo-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 16px;
          transition: transform 0.35s ease;
          user-select: none;
        }

        .pcard-v2:hover .pcard-photo-img {
          transform: scale(1.04);
        }

        .pcard-photo-fallback {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 20px;
        }

        .pcard-badge-top-left {
          position: absolute;
          top: 12px;
          left: 12px;
          z-index: 3;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .pcard-badge-pill-dark {
          background: rgba(15, 23, 42, 0.9);
          color: #F8FAFC;
          border: 1px solid rgba(255, 255, 255, 0.14);
          font-size: 11px;
          font-weight: 750;
          padding: 4px 10px;
          border-radius: 99px;
          backdrop-filter: blur(6px);
          letter-spacing: 0.02em;
        }

        .pcard-badge-bottom-right {
          position: absolute;
          bottom: 12px;
          right: 12px;
          z-index: 3;
        }

        .pcard-badge-pill-green {
          background: rgba(45, 212, 191, 0.2);
          color: #2DD4BF;
          border: 1px solid rgba(45, 212, 191, 0.45);
          font-size: 11.5px;
          font-weight: 750;
          padding: 4px 12px;
          border-radius: 99px;
          box-shadow: 0 0 12px rgba(45, 212, 191, 0.25);
          letter-spacing: 0.02em;
        }

        .pcard-body {
          padding: 18px 20px 20px;
          display: flex;
          flex-direction: column;
          flex: 1;
          justify-content: space-between;
        }

        .pcard-tag-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .pcard-ocop-badge {
          background: rgba(45, 212, 191, 0.15);
          color: #2DD4BF;
          border: 1px solid rgba(45, 212, 191, 0.35);
          font-size: 11.5px;
          font-weight: 750;
          padding: 2.5px 8px;
          border-radius: 6px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .pcard-lot-text {
          font-size: 12px;
          font-weight: 600;
          color: #94A3B8;
        }

        .pcard-name {
          font-size: 17.5px;
          font-weight: 800;
          color: #F8FAFC;
          margin: 8px 0 6px;
          line-height: 1.35;
        }

        .pcard-name-link {
          color: inherit;
          text-decoration: none;
        }

        .pcard-name-link:hover {
          color: #38BDF8;
          text-decoration: underline;
        }

        .pcard-farm-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 10px;
          margin-top: 2px;
        }

        .pcard-farm-text {
          font-size: 12.5px;
          color: #94A3B8;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 60%;
        }

        .pcard-price-text {
          font-size: 18px;
          font-weight: 800;
          color: #38BDF8;
          white-space: nowrap;
        }

        .pcard-btn-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 16px;
        }

        .pcard-btn-add {
          flex: 1;
          background: #38BDF8;
          color: #0F172A;
          border: none;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 13.5px;
          font-weight: 750;
          cursor: pointer;
          transition: all 0.18s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          box-shadow: 0 0 14px rgba(56, 189, 248, 0.35);
        }

        .pcard-btn-add:hover {
          background: #7DD3FC;
          box-shadow: 0 0 20px rgba(56, 189, 248, 0.55);
          transform: translateY(-1px);
        }

        .pcard-btn-qr {
          background: rgba(30, 41, 59, 0.8);
          color: #38BDF8;
          border: 1.5px solid #38BDF8;
          border-radius: 10px;
          padding: 8.5px 12px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.18s ease;
        }

        .pcard-btn-qr:hover {
          background: rgba(56, 189, 248, 0.15);
          color: #7DD3FC;
          box-shadow: 0 0 12px rgba(56, 189, 248, 0.3);
        }

        .pcard-btn-detail {
          background: #131D2E;
          color: #CBD5E1;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 10px;
          padding: 8.5px 11px;
          font-size: 12.5px;
          font-weight: 700;
          text-decoration: none !important;
          white-space: nowrap;
          transition: all 0.18s ease;
          display: inline-flex;
          align-items: center;
        }

        .pcard-btn-detail:hover {
          background: #1E293B;
          color: #FFFFFF;
          border-color: #38BDF8;
          text-decoration: none;
        }

        .pcard-bag-adjust {
          display: flex;
          align-items: center;
          gap: 6px;
          flex: 1;
        }

        .pcard-btn-inbag {
          background: rgba(56, 189, 248, 0.15);
          color: #38BDF8;
          border: 1px solid rgba(56, 189, 248, 0.35);
          border-radius: 8px;
          padding: 6px 10px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        @media (max-width: 900px) {
          .store-intro-banner {
            flex-direction: column;
            align-items: flex-start;
          }
          .store-intro-perks {
            width: 100%;
            flex-wrap: wrap;
          }
          .store-perk-item {
            flex: 1;
            min-width: 140px;
          }
        }

        @media (max-width: 640px) {
          .product-grid-v2 {
            grid-template-columns: 1fr;
          }
          .pcard-photo-wrap {
            height: 240px;
          }
        }

        /* DETAIL MODAL CARD (Chuẩn 100% Hình 4) */
        .dm-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 99999;
          display: grid;
          place-items: center;
          padding: 20px;
          overflow-y: auto;
        }

        .dm-card {
          background: #1E293B;
          border-radius: 24px;
          border: 1.5px solid rgba(56, 189, 248, 0.35);
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(56, 189, 248, 0.2);
          max-width: 920px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          padding: 24px 28px 28px;
          position: relative;
          color: #F8FAFC;
        }

        .dm-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 14px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          margin-bottom: 22px;
        }

        .dm-breadcrumb {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          flex-wrap: wrap;
        }

        .dm-bc-mute {
          color: #94A3B8;
        }

        .dm-bc-sep {
          color: #64748B;
        }

        .dm-bc-cur {
          color: #38BDF8;
          font-weight: 700;
        }

        .dm-close-btn {
          background: #0F172A;
          border: 1px solid rgba(255, 255, 255, 0.14);
          color: #94A3B8;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          padding: 0;
          display: grid;
          place-items: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .dm-close-btn:hover {
          color: #FFF;
          border-color: #38BDF8;
          background: #1E293B;
        }

        /* Hero 2 cột Hình 4 */
        .dm-hero-grid {
          display: grid;
          grid-template-columns: 1fr 1.3fr;
          gap: 28px;
          align-items: center;
          margin-bottom: 28px;
        }

        .dm-photo-box {
          position: relative;
          width: 100%;
          height: 280px;
          background: #131D2E;
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dm-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 18px;
        }

        .dm-photo-fallback {
          display: flex;
          flex-direction: column;
          align-items: center;
          color: #94A3B8;
        }

        .dm-farm {
          font-size: 12.5px;
          color: #94A3B8;
          margin: 0 0 4px;
        }

        .dm-title {
          font-size: 22px;
          font-weight: 850;
          color: #F8FAFC;
          margin: 0 0 12px;
          line-height: 1.3;
        }

        .dm-price-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .dm-price {
          font-size: 22px;
          font-weight: 900;
          color: #38BDF8;
        }

        .dm-stock {
          font-size: 11.5px;
          font-weight: 750;
          background: rgba(45, 212, 191, 0.15);
          color: #2DD4BF;
          border: 1px solid rgba(45, 212, 191, 0.35);
          border-radius: 99px;
          padding: 3px 10px;
        }

        .dm-lot {
          font-size: 11.5px;
          font-weight: 700;
          color: #94A3B8;
          background: #131D2E;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 99px;
          padding: 3px 10px;
        }

        .dm-action-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .dm-btn-buy {
          background: #0284C7;
          color: #FFF;
          font-weight: 800;
          border: none;
          border-radius: 12px;
          padding: 11px 22px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.15s ease;
          box-shadow: 0 4px 14px rgba(2, 132, 199, 0.4);
        }

        .dm-btn-buy:hover {
          background: #0369A1;
          transform: translateY(-1px);
        }

        .dm-btn-call {
          background: transparent;
          color: #F8FAFC;
          font-weight: 700;
          border: 1.5px solid rgba(255, 255, 255, 0.22);
          border-radius: 12px;
          padding: 10px 18px;
          font-size: 13.5px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.15s ease;
        }

        .dm-btn-call:hover {
          border-color: #38BDF8;
          color: #38BDF8;
          background: rgba(56, 189, 248, 0.08);
        }

        /* 4 Ô Chi tiết chuẩn Hình 4 */
        .dm-specs-section {
          background: #131D2E;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          padding: 22px 24px;
          margin-bottom: 24px;
        }

        .dm-specs-title {
          font-size: 17px;
          font-weight: 800;
          color: #F8FAFC;
          margin: 0 0 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .dm-specs-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .dm-spec-card {
          background: #1E293B;
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 14px;
          padding: 14px 16px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .dm-spec-icon {
          font-size: 22px;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .dm-spec-label {
          font-size: 11px;
          font-weight: 800;
          color: #38BDF8;
          letter-spacing: 0.05em;
          margin-bottom: 3px;
        }

        .dm-spec-value {
          font-size: 13px;
          color: #CBD5E1;
          line-height: 1.45;
        }

        /* Related products */
        .dm-related-section {
          margin-bottom: 22px;
        }

        .dm-related-title {
          font-size: 16px;
          font-weight: 800;
          color: #F8FAFC;
          margin: 0 0 12px;
        }

        .dm-related-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
        }

        .dm-rel-item {
          background: #131D2E;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 10px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .dm-rel-item:hover {
          border-color: #38BDF8;
          transform: translateY(-2px);
        }

        .dm-rel-photo {
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0F172A;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .dm-rel-photo img {
          max-height: 90px;
          object-fit: contain;
        }

        .dm-rel-farm {
          font-size: 10.5px;
          color: #94A3B8;
          display: block;
        }

        .dm-rel-name {
          font-size: 12.5px;
          font-weight: 750;
          color: #F8FAFC;
          margin: 2px 0 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dm-rel-price {
          font-size: 13px;
          color: #38BDF8;
          font-weight: 800;
        }

        /* Footer bar */
        .dm-footer-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          flex-wrap: wrap;
        }

        .dm-btn-back {
          background: transparent;
          border: none;
          color: #94A3B8;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          padding: 6px 0;
        }

        .dm-btn-back:hover {
          color: #38BDF8;
        }

        .dm-btn-full {
          color: #38BDF8;
          font-weight: 750;
          font-size: 13px;
          text-decoration: none;
        }

        .dm-btn-full:hover {
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .dm-hero-grid {
            grid-template-columns: 1fr;
          }
          .dm-specs-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
