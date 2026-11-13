"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useDB, fmtVND } from "@/lib/store";
import { useLang } from "@/lib/i18n";

const PALETTE = ["#0297DE", "#0284C7", "#0278B3", "#0369A1", "#0EA5E9", "#38BDF8"];

function HexSlot({ item, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={item ? `Bấm để bỏ ${item.name}` : "Ô trống"}
      style={{
        width: 82,
        height: 92,
        padding: 6,
        border: 0,
        background: item
          ? `linear-gradient(135deg, ${item.color}, #0297DE)`
          : "rgba(2, 151, 222, 0.08)",
        color: item ? "#FFFFFF" : "var(--blue)",
        clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        fontSize: 11,
        fontWeight: 700,
        lineHeight: 1.2,
        cursor: item ? "pointer" : "default",
        boxShadow: item ? "0 8px 20px rgba(2, 151, 222, 0.25)" : "none",
        transition: "transform 0.15s ease",
      }}
    >
      {item ? (
        <>
          <span style={{ fontSize: 13, fontWeight: 800, marginBottom: 2 }}>{item.tag}</span>
          <span style={{ fontSize: 10, opacity: 0.95, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {item.name}
          </span>
        </>
      ) : (
        <span style={{ fontSize: 20, fontWeight: 400, opacity: 0.65 }}>+</span>
      )}
    </button>
  );
}

export default function GiftBoxBuilder({ onAddBox }) {
  const { lang } = useLang();
  const isEn = lang === "en";
  const [db] = useDB();
  const [q, setQ] = useState("");
  const [slots, setSlots] = useState(Array(7).fill(null));
  const [note, setNote] = useState(isEn ? "Wishing you joy with Dong Nai authentic specialties." : "Chúc bạn nhiều niềm vui và trọn vị đặc sản Đồng Nai.");
  const [added, setAdded] = useState(false);

  const products = db?.products || [];

  const items = useMemo(() => {
    return products.map((p, i) => {
      const name = (p.name || "").trim() || "Sản phẩm OCOP";
      const words = name.split(/\s+/);
      const tag =
        words.length > 1
          ? (words[0][0] + words[1][0]).toUpperCase()
          : name.slice(0, 2).toUpperCase();
      return {
        id: p.id,
        name,
        price: p.price || 150000,
        tag,
        color: PALETTE[i % PALETTE.length],
      };
    });
  }, [products]);

  const filteredItems = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return items;
    return items.filter((it) => it.name.toLowerCase().includes(kw));
  }, [items, q]);

  const count = slots.filter(Boolean).length;
  const total = slots.reduce((s, x) => s + (x ? x.price : 0), 0);

  const pickItem = (item) => {
    const idx = slots.findIndex((s) => s === null);
    if (idx === -1) return;
    const next = [...slots];
    next[idx] = item;
    setSlots(next);
  };

  const removeSlot = (idx) => {
    if (!slots[idx]) return;
    const next = [...slots];
    next[idx] = null;
    setSlots(next);
  };

  const autoFill = () => {
    if (items.length === 0) return;
    setSlots(Array.from({ length: 7 }, (_, i) => items[i % items.length]));
  };

  const reset = () => {
    setSlots(Array(7).fill(null));
  };

  const addGiftBox = () => {
    if (count === 0) return;
    onAddBox?.({
      id: "gift-" + Date.now().toString(36),
      name: isEn ? `Custom OCOP Gift Box (${count}/7 items)` : `Hộp quà OCOP tự chọn (${count}/7 món)`,
      price: total,
      weight: note.trim()
        ? `${isEn ? "Card" : "Thiệp"}: "${note.trim().slice(0, 36)}…"`
        : (isEn ? "Includes greeting card" : "Kèm thiệp chúc mừng"),
      qty: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <section aria-labelledby="gift-title" style={{ marginTop: 32 }}>
      <div className="sec-head">
        <div>
          <span className="badge">{isEn ? "— Dong Nai OCOP Gift Box" : "— Quà tặng OCOP Đồng Nai"}</span>
          <h2 id="gift-title" style={{ marginTop: 6 }}>
            {isEn ? "Build Your Own Gift Box" : "Tự tay đóng hộp quà"}
          </h2>
          <p className="mute" style={{ margin: 0 }}>
            {isEn
              ? "Select up to 7 Dong Nai specialties, write your greeting on the card, and we will pack it with a Digital Passport QR code."
              : "Chọn tối đa 7 đặc sản Đồng Nai, viết lời chúc lên thiệp, hệ thống sẽ gói thành hộp quà kèm mã QR Hộ chiếu số."}
          </p>
        </div>
      </div>

      <div
        className="card"
        style={{
          padding: "26px 24px",
          background: "linear-gradient(135deg, rgba(2, 151, 222, 0.05), rgba(56, 189, 248, 0.08))",
          borderColor: "rgba(2, 151, 222, 0.22)",
        }}
      >
        <div className="grid-2" style={{ gap: 28, alignItems: "center" }}>
          {/* Left: 7-Slot Honeycomb + Greeting Card */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 8 }}>
              <HexSlot item={slots[0]} onClick={() => removeSlot(0)} />
              <HexSlot item={slots[1]} onClick={() => removeSlot(1)} />
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: -16 }}>
              <HexSlot item={slots[2]} onClick={() => removeSlot(2)} />
              <HexSlot item={slots[3]} onClick={() => removeSlot(3)} />
              <HexSlot item={slots[4]} onClick={() => removeSlot(4)} />
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: -16 }}>
              <HexSlot item={slots[5]} onClick={() => removeSlot(5)} />
              <HexSlot item={slots[6]} onClick={() => removeSlot(6)} />
            </div>

            <p className="mute" style={{ margin: "14px 0 12px", fontSize: 12.5 }}>
              {isEn ? "Click on any slot to remove the item." : "Bấm vào một ô trong hộp để bỏ sản phẩm ra."}
            </p>

            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid rgba(226, 232, 240, 0.8)",
                borderRadius: 12,
                padding: "14px 18px",
                maxWidth: 290,
                width: "100%",
                boxShadow: "0 12px 28px rgba(0, 0, 0, 0.25)",
                transform: "rotate(-1.5deg)",
              }}
            >
              <p style={{ margin: "0 0 6px", fontStyle: "italic", color: "#0F172A", fontWeight: 600, fontSize: 14, lineHeight: 1.5, opacity: 1 }}>
                {note || (isEn ? "Wishing you joy with Dong Nai specialties." : "Chúc bạn nhiều niềm vui và trọn vị đặc sản Đồng Nai.")}
              </p>
              <strong style={{ fontSize: 12, color: "#0284C7" }}>OCOP Passport Đồng Nai</strong>
            </div>
          </div>

          {/* Right: Flavor / Specialty Picker + Note + Actions */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
              <h3 style={{ margin: 0 }}>{isEn ? "Select Specialties & Flavors" : "Chọn đặc sản / hương vị"}</h3>
              {items.length > 0 && (
                <span className="mute" style={{ fontSize: 12 }}>
                  {filteredItems.length}/{items.length} {isEn ? "products" : "sản phẩm"}
                </span>
              )}
            </div>

            {/* Khung nhỏ tìm kiếm sản phẩm */}
            <div style={{ position: "relative", marginBottom: 10 }}>
              <span
                style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 13,
                  opacity: 0.55,
                  pointerEvents: "none",
                }}
              >
                🔍
              </span>
              <input
                type="search"
                placeholder={isEn ? "Search products to add to box…" : "Tìm sản phẩm đưa vào hộp…"}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                style={{
                  width: "100%",
                  padding: "7px 30px 7px 30px",
                  fontSize: 13,
                  borderRadius: 10,
                  border: "1px solid var(--line-strong)",
                  background: "var(--panel-subtle)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                }}
              />
              {q && (
                <button
                  type="button"
                  onClick={() => setQ("")}
                  style={{
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    border: 0,
                    background: "none",
                    color: "var(--mute)",
                    padding: 4,
                    fontSize: 13,
                    cursor: "pointer",
                    lineHeight: 1,
                  }}
                  title="Xóa tìm kiếm"
                >
                  ✕
                </button>
              )}
            </div>

            {items.length === 0 ? (
              <div
                style={{
                  background: "var(--panel-subtle)",
                  border: "1px dashed var(--line-strong)",
                  borderRadius: 12,
                  padding: "20px 16px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 6 }}>📦</div>
                <strong style={{ display: "block", fontSize: 14, color: "var(--ink)", marginBottom: 4 }}>
                  Chưa có sản phẩm trên hệ thống
                </strong>
                <p className="mute" style={{ margin: "0 auto 10px", fontSize: 12.5, maxWidth: 320 }}>
                  Dữ liệu sản phẩm sẽ tự động hiển thị tại đây khi bạn nhập sản phẩm từ Nhật ký số.
                </p>
                <Link
                  href="/diary"
                  className="btn alt"
                  style={{ fontSize: 12.5, padding: "6px 14px", display: "inline-block" }}
                >
                  + Đến Nhật ký số tạo sản phẩm
                </Link>
              </div>
            ) : filteredItems.length === 0 ? (
              <div
                style={{
                  background: "#FFFFFF",
                  border: "1px dashed var(--line-strong)",
                  borderRadius: 12,
                  padding: "18px 14px",
                  textAlign: "center",
                }}
              >
                <p className="mute" style={{ margin: 0, fontSize: 13 }}>
                  Không tìm thấy sản phẩm nào khớp với “<strong>{q}</strong>”.
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(195px, 1fr))",
                  gap: 8,
                  maxHeight: 240,
                  overflowY: "auto",
                  paddingRight: 4,
                }}
              >
                {filteredItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    disabled={count >= 7}
                    onClick={() => pickItem(item)}
                    style={{
                      background: "#131D2E",
                      color: "var(--ink)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      borderRadius: 12,
                      padding: "9px 12px",
                      justifyContent: "flex-start",
                      textAlign: "left",
                      fontWeight: 600,
                      fontSize: 13,
                    }}
                  >
                    <span
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        background: item.color,
                        color: "#fff",
                        display: "grid",
                        placeItems: "center",
                        fontSize: 11,
                        fontWeight: 800,
                        flexShrink: 0,
                      }}
                    >
                      {item.tag}
                    </span>
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.name}
                      </span>
                      <span className="mute" style={{ fontSize: 12 }}>
                        {fmtVND(item.price)}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            )}

            <label htmlFor="gift-note" style={{ marginTop: 14 }}>
              {isEn ? "Card Greeting Message" : "Lời chúc trên thiệp"}
            </label>
            <input
              id="gift-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={isEn ? "Enter your warm wishes for the recipient…" : "Nhập lời chúc gửi người nhận…"}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginTop: 16,
                paddingTop: 12,
                borderTop: "1px solid var(--line)",
              }}
            >
              <span className="mute" style={{ fontWeight: 600 }}>
                {isEn ? `Subtotal · ${count}/7 items` : `Tạm tính · ${count}/7 món`}
              </span>
              <strong style={{ fontSize: 22, color: "var(--blue-dark)" }}>{fmtVND(total)}</strong>
            </div>

            <div className="row" style={{ marginTop: 12 }}>
              <button disabled={count === 0} onClick={addGiftBox}>
                {added
                  ? (isEn ? "✓ Added Gift Box to Cart" : "✓ Đã thêm hộp quà vào giỏ")
                  : (isEn ? "Add Gift Box to Cart" : "Thêm hộp quà vào giỏ")}
              </button>
              <button className="alt" type="button" disabled={items.length === 0} onClick={autoFill}>
                {isEn ? "Pick for Me" : "Chọn giúp tôi"}
              </button>
              <button
                type="button"
                onClick={reset}
                style={{ background: "none", color: "var(--mute)", padding: "8px 10px" }}
              >
                {isEn ? "Reset" : "Làm lại"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
