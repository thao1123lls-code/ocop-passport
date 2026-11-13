// Lucian UX/UI Prompt #240 & #363 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#240
"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useDB, STAGES, fmt, dec, fmtVND } from "@/lib/store";
import ProductQR, { getPassportUrl } from "@/components/ProductQR";
import JourneyShowcase from "@/components/JourneyShowcase";
import FlavorRadar from "@/components/FlavorRadar";

// Dynamic load CartDrawer để đảm bảo trải nghiệm mua sắm đồng bộ
const CartDrawer = dynamic(() => import("@/components/CartDrawer"), { ssr: false });

export default function ProductDetailPage() {
  const { id } = useParams();
  const [db, save] = useDB();
  const [q, setQ] = useState();
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [bag, setBag] = useState([]);
  const [bagOpen, setBagOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [editingPrice, setEditingPrice] = useState(false);
  const [priceInput, setPriceInput] = useState("");
  const [priceSaved, setPriceSaved] = useState(false);

  // Khởi tạo giỏ hàng từ LocalStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("ocop-bag-v1") || "[]");
      if (Array.isArray(saved) && saved.length) setBag(saved);
    } catch {}
    const onOpen = () => setBagOpen(true);
    window.addEventListener("ocop-open-bag", onOpen);
    return () => window.removeEventListener("ocop-open-bag", onOpen);
  }, []);

  // Lưu giỏ hàng & phát event
  useEffect(() => {
    try {
      localStorage.setItem("ocop-bag-v1", JSON.stringify(bag));
    } catch {}
    window.dispatchEvent(new Event("ocop-bag"));
  }, [bag]);

  // Decode QR query nếu có
  useEffect(() => {
    if (typeof window !== "undefined") {
      const d = new URLSearchParams(window.location.search).get("d");
      setQ(d ? dec(d) : null);
    }
  }, []);

  const p = db && q !== undefined ? db.products?.find((x) => x.id === id) || q : null;

  useEffect(() => {
    if (!p) return;
    setUrl(getPassportUrl(p));
  }, [p]);

  // Danh sách sản phẩm cùng loại
  const relatedProducts = useMemo(() => {
    if (!db?.products || !p) return [];
    return db.products
      .filter((x) => x.id !== p.id && (x.category === p.category || !p.category))
      .slice(0, 3);
  }, [db, p]);

  const addToBag = (product) => {
    setBag((prev) => {
      const hit = prev.find((x) => x.id === product.id);
      if (hit) return prev.map((x) => (x.id === product.id ? { ...x, qty: x.qty + 1 } : x));
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price || 145000,
          weight: product.weight || "Hộp 500g",
          photo: product.photo || product.entries?.find((e) => e?.photo)?.photo || null,
          lot: product.lot || "CDQ-2026",
          qty: 1,
        },
      ];
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
    setBagOpen(true);
  };

  const updateQty = (productId, delta) => {
    setBag((prev) =>
      prev
        .map((it) => (it.id === productId ? { ...it, qty: Math.max(0, it.qty + delta) } : it))
        .filter((it) => it.qty > 0)
    );
  };

  const shareLink = () => {
    if (navigator.share) {
      navigator.share({ title: p?.name, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  if (!db || q === undefined) {
    return (
      <main className="w" style={{ textAlign: "center", padding: "120px 20px" }}>
        <p style={{ fontSize: 16, color: "var(--mute)" }}>Đang tải thông tin sản phẩm OCOP…</p>
      </main>
    );
  }

  if (!p) {
    return (
      <main className="w" style={{ textAlign: "center", padding: "120px 20px" }}>
        <h2>Không tìm thấy sản phẩm</h2>
        <p className="mute">Sản phẩm này có thể đã được cập nhật hoặc không còn tồn tại.</p>
        <Link href="/" className="btn" style={{ marginTop: 14 }}>
          ← Quay lại gian hàng chính
        </Link>
      </main>
    );
  }

  const photoSrc = p.photo || p.entries?.find((e) => e?.photo)?.photo || null;
  const geo = p.entries?.find((e) => e?.geo)?.geo;

  return (
    <main className="detail-page-wrap">
      {/* 1. BREADCRUMB & QUAY LẠI (Chuẩn Hình 4) */}
      <div className="detail-breadcrumb-bar">
        <nav className="detail-breadcrumb" aria-label="Breadcrumb">
          <Link href="/" className="bc-link">
            Trang chủ
          </Link>
          <span className="bc-sep">/</span>
          <span className="bc-cat">{p.category || "Đặc sản Đồng Nai"}</span>
          <span className="bc-sep">/</span>
          <span className="bc-current">{p.name}</span>
        </nav>
        <Link href="/" className="bc-back-btn">
          ← Tiếp tục mua sắm
        </Link>
      </div>

      {/* 2. KHUNG CHI TIẾT SẢN PHẨM 2 CỘT (Chuẩn Hình 4) */}
      <section className="detail-hero-grid">
        {/* CỘT TRÁI: KHUNG ẢNH LỚN + FLOATING BADGES */}
        <div className="detail-photo-col">
          <div className="detail-photo-card">
            {photoSrc ? (
              <img
                src={photoSrc}
                alt={p.name}
                className="detail-main-img"
                loading="eager"
              />
            ) : (
              <div className="detail-photo-fallback">
                <span style={{ fontSize: 72 }}>🌾</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: "var(--ink-2)", marginTop: 12 }}>
                  {p.name}
                </span>
                <span style={{ fontSize: 13, color: "var(--mute)" }}>Ảnh mẫu OCOP Đồng Nai</span>
              </div>
            )}

            {/* Badges góc ảnh */}
            <div className="detail-badge-top-left">
              <span className="detail-badge-icon" title="Hệ thống OCOP Passport">🧠</span>
              <span className="detail-badge-pill-dark">Sản phẩm OCOP</span>
            </div>
            <div className="detail-badge-bottom-right">
              <span className="detail-badge-pill-green">Từ năm 2005</span>
            </div>
          </div>

          {/* Mini QR Passport Bar dưới ảnh */}
          <div className="detail-mini-qr-box">
            <ProductQR product={p} size={76} />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                <b style={{ fontSize: 13.5, color: "var(--ink)" }}>Mã Hộ chiếu số OCOP</b>
                <span className="badge ok" style={{ padding: "1px 6px", fontSize: 10.5 }}>✓ Đã cấp</span>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: "var(--mute)", lineHeight: 1.4 }}>
                Tem QR động chống giả mạo, liên kết trực tiếp với nhật ký số từ vườn.
              </p>
              <button
                type="button"
                onClick={shareLink}
                style={{
                  background: "transparent",
                  border: "none",
                  padding: "4px 0 0",
                  color: "var(--blue)",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {copied ? "✓ Đã sao chép link hộ chiếu" : "🔗 Sao chép link hộ chiếu"}
              </button>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: THÔNG TIN MUA HÀNG & 4 Ô THÔNG SỐ (Chuẩn 100% Hình 4) */}
        <div className="detail-info-col">
          {/* Tên cơ sở sản xuất */}
          <p className="detail-producer-name">
            {p.farm || "Cơ sở sản xuất OCOP Đồng Nai"}
          </p>

          {/* Tên sản phẩm to đậm */}
          <h1 className="detail-product-title">{p.name}</h1>

          {/* Hàng Giá & Tình trạng kho - Cho phép ấn vào để sửa giá */}
          <div className="detail-price-status-row" style={{ flexWrap: "wrap", gap: 10, alignItems: "center" }}>
            {!editingPrice ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setPriceInput(String(p.price || 145000));
                    setEditingPrice(true);
                  }}
                  title="Bấm để chỉnh sửa giá bán sản phẩm"
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    textAlign: "left",
                  }}
                >
                  <span className="detail-price-val">
                    {fmtVND(p.price || 145000)}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 750,
                      color: "var(--blue)",
                      background: "rgba(56, 189, 248, 0.12)",
                      border: "1px solid rgba(56, 189, 248, 0.3)",
                      padding: "3px 8px",
                      borderRadius: 6,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    ✏️ Sửa giá
                  </span>
                </button>
                {priceSaved && (
                  <span style={{ fontSize: 12.5, color: "#34D399", fontWeight: 700 }}>
                    ✓ Đã lưu giá mới!
                  </span>
                )}
              </>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const num = parseInt(String(priceInput).replace(/\D/g, ""), 10);
                  if (!isNaN(num) && num > 0) {
                    save((d) => {
                      const item = d.products?.find((x) => x.id === p.id);
                      if (item) item.price = num;
                    });
                    setPriceSaved(true);
                    setEditingPrice(false);
                    setTimeout(() => setPriceSaved(false), 2500);
                  }
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#070B14",
                  padding: "6px 12px",
                  borderRadius: 10,
                  border: "1px solid rgba(0, 229, 255, 0.4)",
                  boxShadow: "0 0 14px rgba(0, 229, 255, 0.25)",
                }}
              >
                <span style={{ fontSize: 13, color: "#94A3B8", fontWeight: 700 }}>Giá:</span>
                <input
                  type="number"
                  step="5000"
                  min="1000"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  autoFocus
                  style={{
                    width: 130,
                    padding: "5px 8px",
                    background: "#1E293B",
                    border: "1px solid var(--line-cyber)",
                    borderRadius: 6,
                    color: "#FFFFFF",
                    fontSize: 15,
                    fontWeight: 800,
                  }}
                />
                <span style={{ fontSize: 12, color: "#94A3B8" }}>đ</span>
                <button
                  type="submit"
                  style={{
                    padding: "5px 12px",
                    background: "#00E5FF",
                    color: "#070B14",
                    border: "none",
                    borderRadius: 6,
                    fontWeight: 800,
                    fontSize: 12.5,
                    cursor: "pointer",
                  }}
                >
                  Lưu
                </button>
                <button
                  type="button"
                  onClick={() => setEditingPrice(false)}
                  style={{
                    padding: "5px 10px",
                    background: "rgba(255,255,255,0.08)",
                    color: "#CBD5E1",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 6,
                    fontWeight: 700,
                    fontSize: 12.5,
                    cursor: "pointer",
                  }}
                >
                  Hủy
                </button>
              </form>
            )}
            <span className="detail-stock-badge">
              ✓ Còn hàng
            </span>
            <span className="detail-lot-badge">
              Lô {p.lot || "CDQ-2026"}
            </span>
          </div>

          {/* Bộ nút bấm hành động (Nút xanh + Nút gọi tư vấn) */}
          <div className="detail-action-buttons">
            <button
              type="button"
              className="detail-btn-buy"
              onClick={() => addToBag(p)}
            >
              {justAdded ? "✓ Đã thêm vào giỏ hàng" : "+ Thêm vào giỏ"}
            </button>
            <a
              href="tel:0965724645"
              className="detail-btn-call"
              title="Gọi hotline tư vấn trực tiếp"
            >
              <span style={{ fontSize: 16 }}>📞</span> Gọi tư vấn 0965.72.4645
            </a>
          </div>

          {/* KHUNG THÔNG TIN SẢN PHẨM: 4 Ô (2x2) CHUẨN HÌNH 4 */}
          <div className="detail-specs-box">
            <h3 className="detail-specs-heading">THÔNG TIN SẢN PHẨM</h3>
            <div className="detail-specs-grid">
              {/* Ô 1: Khối lượng */}
              <div className="detail-spec-item">
                <div className="detail-spec-icon-wrap">⚖️</div>
                <div>
                  <div className="detail-spec-label">KHỐI LƯỢNG</div>
                  <div className="detail-spec-value">{p.weight || "Hộp 500g"}</div>
                </div>
              </div>

              {/* Ô 2: Thành phần */}
              <div className="detail-spec-item">
                <div className="detail-spec-icon-wrap">🌿</div>
                <div>
                  <div className="detail-spec-label">THÀNH PHẦN</div>
                  <div className="detail-spec-value">{p.ingredients || "100% Cacao nguyên chất Đồng Nai"}</div>
                </div>
              </div>

              {/* Ô 3: Hạn sử dụng */}
              <div className="detail-spec-item">
                <div className="detail-spec-icon-wrap">⏳</div>
                <div>
                  <div className="detail-spec-label">HẠN SỬ DỤNG</div>
                  <div className="detail-spec-value">{p.expiry || "18 tháng kể từ ngày sản xuất"}</div>
                </div>
              </div>

              {/* Ô 4: Hướng dẫn bảo quản */}
              <div className="detail-spec-item">
                <div className="detail-spec-icon-wrap">📦</div>
                <div>
                  <div className="detail-spec-label">HƯỚNG DẪN BẢO QUẢN</div>
                  <div className="detail-spec-value">{p.storage || "Bảo quản nơi khô ráo, thoáng mát"}</div>
                </div>
              </div>
            </div>

            {/* Ghi chú chính sách dưới khung */}
            <div className="detail-policy-notes">
              <div className="policy-note-line">
                <span className="policy-check">✓</span> Đổi trả miễn phí trong 7 ngày nếu sản phẩm lỗi từ cơ sở.
              </div>
              <div className="policy-note-line">
                <span className="policy-check">✓</span> Miễn phí vận chuyển toàn quốc cho đơn hàng từ 300.000đ.
              </div>
            </div>
          </div>

          {/* Câu chuyện người làm ra sản phẩm */}
          {p.story && (
            <div className="detail-story-box">
              <h4 style={{ margin: "0 0 6px", fontSize: 14.5, fontWeight: 750, color: "var(--ink)" }}>
                📖 Câu chuyện nông sản Đồng Nai
              </h4>
              <p style={{ margin: 0, fontSize: 13.5, color: "var(--ink-2)", lineHeight: 1.6 }}>
                {p.story}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 3. PHÂN HỆ HÀNH TRÌNH TỪ VƯỜN ĐẾN TAY BẠN (CORE PASSPORT) */}
      <section style={{ marginTop: 36 }}>
        <JourneyShowcase entries={p.entries || []} lang="vi" />
        <FlavorRadar product={p} lang="vi" />

        {/* Timeline nhật ký chi tiết */}
        <div className="card" style={{ marginTop: 24, padding: "24px 28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>
              🌾 Nhật ký canh tác & sản xuất thực tế từ nông hộ
            </h3>
            <span className="badge ok">✓ Minh bạch từng lô hàng</span>
          </div>

          <ol className="tl" style={{ marginTop: 14 }}>
            {[...(p.entries || [])]
              .sort((a, b) => {
                const getOrder = (st) => {
                  if (typeof st === "number") return st;
                  const idx = STAGES.findIndex(s => s[0] === st || s[1] === st);
                  return idx !== -1 ? idx : 999;
                };
                return getOrder(a.stage) - getOrder(b.stage) || (a.ts || 0) - (b.ts || 0);
              })
              .map((e) => (
                <li key={e.id}>
                  <b>{typeof e.stage === "number" ? STAGES[e.stage]?.[0] : e.stage}</b>{" "}
                  <span className="mute" style={{ fontSize: 12 }}>{fmt(e.ts)}</span>
                  <br />
                  <span style={{ fontSize: 14, color: "var(--ink)", display: "block", marginTop: 3 }}>
                    {e.text}
                  </span>
                  {e.photo && (
                    <img
                      src={e.photo}
                      alt="Ảnh nhật ký thực địa"
                      style={{ maxWidth: 280, borderRadius: 12, marginTop: 8 }}
                      loading="lazy"
                    />
                  )}
                </li>
              ))}
          </ol>
        </div>

        {/* Bản đồ vùng trồng nếu có tọa độ */}
        {geo && (
          <div className="card" style={{ marginTop: 20 }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 18 }}>📍 Bản đồ vùng trồng & Cơ sở sản xuất</h3>
            <iframe
              loading="lazy"
              title="Vùng trồng OCOP"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${geo[1] - 0.01},${geo[0] - 0.01},${geo[1] + 0.01},${geo[0] + 0.01}&layer=mapnik&marker=${geo[0]},${geo[1]}`}
              style={{ width: "100%", height: 280, border: 0, borderRadius: 12 }}
            />
          </div>
        )}
      </section>

      {/* 4. KHỐI SẢN PHẨM CÙNG LOẠI (Chuẩn cấu trúc Thẻ sản phẩm Hình 2 & 3) */}
      {relatedProducts.length > 0 && (
        <section className="detail-related-section">
          <div className="related-head">
            <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "var(--ink)" }}>
              Sản phẩm cùng loại
            </h3>
            <Link href="/" className="related-all-link">
              Xem tất cả đặc sản Đồng Nai →
            </Link>
          </div>

          <div className="related-grid">
            {relatedProducts.map((rel) => {
              const relPhoto = rel.photo || rel.entries?.find((e) => e?.photo)?.photo || null;
              return (
                <article key={rel.id} className="rel-card">
                  <div className="rel-photo-box">
                    <Link href={`/p/${rel.id}`} className="rel-photo-link">
                      {relPhoto ? (
                        <img src={relPhoto} alt={rel.name} className="rel-photo-img" loading="lazy" />
                      ) : (
                        <span style={{ fontSize: 44 }}>🌾</span>
                      )}
                    </Link>
                    <div className="pcard-badge-top-left">
                      <span className="pcard-badge-icon">🧠</span>
                      <span className="pcard-badge-pill-dark">Sản phẩm OCOP</span>
                    </div>
                  </div>

                  <div className="rel-body">
                    <div>
                      <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
                        <span className="pcard-ocop-badge">✓ OCOP {rel.certs || "4 sao"}</span>
                        <span className="pcard-lot-text">Lô {rel.lot || "CDQ-2026"}</span>
                      </div>
                      <h4 className="rel-title">
                        <Link href={`/p/${rel.id}`}>{rel.name}</Link>
                      </h4>
                      <p className="rel-price">{fmtVND(rel.price || 145000)}</p>
                    </div>

                    <div className="rel-actions">
                      <button
                        type="button"
                        className="pcard-btn-add"
                        onClick={() => addToBag(rel)}
                      >
                        + Thêm vào giỏ
                      </button>
                      <Link href={`/p/${rel.id}`} className="pcard-btn-detail">
                        Chi tiết →
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={bagOpen}
        onClose={() => setBagOpen(false)}
        bag={bag}
        onUpdateQty={updateQty}
        onRemove={(remId) => setBag((prev) => prev.filter((x) => x.id !== remId))}
        onClearBag={() => setBag([])}
        justAddedId={justAdded ? p.id : ""}
      />

      {/* Scoped CSS cho toàn bộ Trang chi tiết chuẩn Hình 4 */}
      <style jsx>{`
        .detail-page-wrap {
          max-width: min(1200px, 94vw);
          margin: 0 auto;
          padding: 88px 16px 64px;
        }

        .detail-breadcrumb-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          padding: 10px 0 18px;
          font-size: 13.5px;
          border-bottom: 1px solid var(--line);
          margin-bottom: 24px;
        }

        .detail-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--mute);
        }

        .bc-link {
          color: var(--blue);
          text-decoration: none;
          font-weight: 600;
        }

        .bc-link:hover {
          text-decoration: underline;
        }

        .bc-sep {
          color: #94A3B8;
        }

        .bc-cat {
          color: var(--ink-2);
          font-weight: 600;
        }

        .bc-current {
          color: var(--ink);
          font-weight: 700;
        }

        .bc-back-btn {
          color: var(--mute);
          text-decoration: none;
          font-weight: 700;
          font-size: 13px;
          padding: 6px 14px;
          background: #1E293B;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 8px;
          transition: all 0.15s ease;
        }

        .bc-back-btn:hover {
          background: #243447;
          color: var(--blue);
          border-color: var(--blue);
        }

        .detail-hero-grid {
          display: grid;
          grid-template-columns: 1fr 1.25fr;
          gap: 36px;
          align-items: start;
        }

        .detail-photo-col {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .detail-photo-card {
          position: relative;
          width: 100%;
          min-height: 420px;
          background: linear-gradient(145deg, #131D2E 0%, #0F172A 100%);
          border-radius: 20px;
          border: 1.5px solid rgba(255, 255, 255, 0.08);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.55);
        }

        .detail-main-img {
          width: 100%;
          height: auto;
          max-height: 400px;
          object-fit: contain;
          padding: 24px;
          user-select: none;
        }

        .detail-photo-fallback {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          text-align: center;
        }

        .detail-badge-top-left {
          position: absolute;
          top: 14px;
          left: 14px;
          z-index: 3;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .detail-badge-icon {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: #0F172A;
          color: #38BDF8;
          border: 1px solid rgba(56, 189, 248, 0.4);
          display: grid;
          place-items: center;
          font-size: 14px;
          box-shadow: 0 0 10px rgba(56, 189, 248, 0.3);
        }

        .detail-badge-pill-dark {
          background: rgba(15, 23, 42, 0.9);
          color: #F8FAFC;
          border: 1px solid rgba(255, 255, 255, 0.15);
          font-size: 11px;
          font-weight: 750;
          padding: 4px 10px;
          border-radius: 99px;
          backdrop-filter: blur(6px);
        }

        .detail-badge-bottom-right {
          position: absolute;
          bottom: 14px;
          right: 14px;
          z-index: 3;
        }

        .detail-badge-pill-green {
          background: rgba(45, 212, 191, 0.2);
          color: #2DD4BF;
          border: 1px solid rgba(45, 212, 191, 0.45);
          font-size: 11.5px;
          font-weight: 750;
          padding: 4px 12px;
          border-radius: 99px;
          box-shadow: 0 0 12px rgba(45, 212, 191, 0.25);
        }

        .detail-mini-qr-box {
          background: #1E293B;
          border: 1.5px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          gap: 14px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
        }

        .detail-info-col {
          display: flex;
          flex-direction: column;
        }

        .detail-producer-name {
          font-size: 13px;
          font-weight: 750;
          color: #94A3B8;
          margin: 0 0 6px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .detail-product-title {
          font-size: clamp(22px, 3vw, 32px);
          font-weight: 850;
          color: #F8FAFC;
          line-height: 1.25;
          margin: 0 0 12px;
        }

        .detail-price-status-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 22px;
        }

        .detail-price-val {
          font-size: 28px;
          font-weight: 850;
          color: #38BDF8;
        }

        .detail-stock-badge {
          background: rgba(45, 212, 191, 0.15);
          color: #2DD4BF;
          border: 1px solid rgba(45, 212, 191, 0.35);
          font-size: 12px;
          font-weight: 750;
          padding: 3px 10px;
          border-radius: 99px;
        }

        .detail-lot-badge {
          font-size: 12px;
          font-weight: 600;
          color: #94A3B8;
          background: #131D2E;
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 3px 10px;
          border-radius: 99px;
        }

        .detail-action-buttons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 24px;
        }

        .detail-btn-buy {
          flex: 1.2;
          min-width: 180px;
          background: #38BDF8;
          color: #0F172A;
          border: none;
          border-radius: 12px;
          padding: 13px 22px;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.18s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 0 18px rgba(56, 189, 248, 0.4);
        }

        .detail-btn-buy:hover {
          background: #7DD3FC;
          box-shadow: 0 0 24px rgba(56, 189, 248, 0.6);
          transform: translateY(-1px);
        }

        .detail-btn-call {
          flex: 1;
          min-width: 180px;
          background: rgba(30, 41, 59, 0.8);
          color: #38BDF8;
          border: 1.5px solid #38BDF8;
          border-radius: 12px;
          padding: 12px 18px;
          font-size: 14.5px;
          font-weight: 750;
          text-decoration: none !important;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.18s ease;
        }

        .detail-btn-call:hover {
          background: rgba(56, 189, 248, 0.15);
          color: #7DD3FC;
          box-shadow: 0 0 14px rgba(56, 189, 248, 0.3);
          transform: translateY(-1px);
        }

        .detail-specs-box {
          background: #1E293B;
          border: 1.5px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          padding: 22px 24px;
          margin-bottom: 20px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }

        .detail-specs-heading {
          margin: 0 0 16px;
          font-size: 13.5px;
          font-weight: 850;
          color: #F8FAFC;
          letter-spacing: 0.04em;
        }

        .detail-specs-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .detail-spec-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .detail-spec-icon-wrap {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: #131D2E;
          border: 1px solid rgba(56, 189, 248, 0.25);
          color: #38BDF8;
          display: grid;
          place-items: center;
          font-size: 17px;
          flex-shrink: 0;
        }

        .detail-spec-label {
          font-size: 11px;
          font-weight: 750;
          color: #94A3B8;
          letter-spacing: 0.03em;
        }

        .detail-spec-value {
          font-size: 13.5px;
          font-weight: 700;
          color: #F8FAFC;
          margin-top: 2px;
          line-height: 1.35;
        }

        .detail-policy-notes {
          padding-top: 14px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 12.5px;
          color: #94A3B8;
        }

        .policy-note-line {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .policy-check {
          color: #2DD4BF;
          font-weight: 800;
        }

        .detail-story-box {
          background: #131D2E;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          padding: 16px 18px;
        }

        .detail-related-section {
          margin-top: 48px;
          padding-top: 28px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .related-head {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 20px;
        }

        .related-all-link {
          color: var(--blue);
          font-size: 13.5px;
          font-weight: 700;
          text-decoration: none;
        }

        .related-all-link:hover {
          text-decoration: underline;
        }

        .related-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }

        .rel-card {
          background: #1E293B;
          border: 1.5px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .rel-card:hover {
          transform: translateY(-3px);
          border-color: #38BDF8;
          box-shadow: 0 12px 28px -4px rgba(0, 0, 0, 0.7), 0 0 16px rgba(56, 189, 248, 0.25);
        }

        .rel-photo-box {
          position: relative;
          width: 100%;
          height: 220px;
          background: linear-gradient(145deg, #131D2E, #0F172A);
          display: flex;
          align-items: center;
          justify-content: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .rel-photo-link {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .rel-photo-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 14px;
        }

        .rel-body {
          padding: 16px 18px 18px;
          display: flex;
          flex-direction: column;
          flex: 1;
          justify-content: space-between;
        }

        .rel-title {
          font-size: 15.5px;
          font-weight: 800;
          color: #F8FAFC;
          margin: 4px 0 2px;
          line-height: 1.35;
        }

        .rel-title a {
          color: inherit;
          text-decoration: none;
        }

        .rel-title a:hover {
          color: var(--blue);
        }

        .rel-price {
          font-size: 16.5px;
          font-weight: 800;
          color: #38BDF8;
          margin: 4px 0 12px;
        }

        .rel-actions {
          display: flex;
          gap: 8px;
        }

        @media (max-width: 860px) {
          .detail-hero-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .detail-specs-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}
