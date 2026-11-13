"use client";
import { useState, useMemo } from "react";

const PROFILES = {
  "ca-cao": {
    axes: [
      ["Đắng", "Bitter"],
      ["Ngọt", "Sweet"],
      ["Béo", "Rich"],
      ["Thơm", "Aroma"],
      ["Giòn / Mịn", "Texture"],
      ["Cay ấm", "Warmth"],
    ],
    variants: [
      { name: "Nguyên chất 100%", vals: [92, 18, 52, 88, 70, 28] },
      { name: "Sô-cô-la 72%", vals: [74, 42, 66, 85, 82, 20] },
      { name: "Ca cao sữa hạt điều", vals: [32, 78, 86, 80, 68, 15] },
    ],
  },
  "hat-dieu": {
    axes: [
      ["Giòn rụm", "Crunch"],
      ["Béo bùi", "Nutty"],
      ["Mặn vừa", "Savory"],
      ["Thơm rang", "Roasted"],
      ["Ngọt tự nhiên", "Sweetness"],
      ["Chắc hạt", "Firmness"],
    ],
    variants: [
      { name: "Rang muối vỏ lụa", vals: [94, 88, 55, 90, 48, 92] },
      { name: "Điều tỏi ớt", vals: [90, 80, 68, 86, 36, 88] },
      { name: "Điều mật ong", vals: [85, 84, 22, 82, 86, 85] },
    ],
  },
  "ca-phe": {
    axes: [
      ["Đậm đà", "Strength"],
      ["Ngọt hậu", "Aftertaste"],
      ["Béo sánh", "Body"],
      ["Thơm nồng", "Aroma"],
      ["Chua thanh", "Acidity"],
      ["Đắng dịu", "Bitter"],
    ],
    variants: [
      { name: "Robusta rang mộc vừa", vals: [86, 68, 78, 92, 34, 72] },
      { name: "Robusta rang đậm phin", vals: [96, 52, 88, 84, 18, 90] },
      { name: "Sơ chế Honey", vals: [76, 88, 74, 90, 48, 54] },
    ],
  },
  "mat-ong": {
    axes: [
      ["Ngọt thanh", "Sweetness"],
      ["Độ sánh", "Viscosity"],
      ["Hương hoa", "Floral"],
      ["Dịu cổ", "Smoothness"],
      ["Sắc vàng", "Clarity"],
      ["Hậu vị", "Finish"],
    ],
    variants: [
      { name: "Mật hoa cà phê", vals: [82, 90, 94, 88, 86, 84] },
      { name: "Mật rừng nguyên chất", vals: [76, 86, 88, 80, 74, 90] },
    ],
  },
};

function resolveProfile(product) {
  const id = (product?.id || "").toLowerCase();
  const name = (product?.name || "").toLowerCase();
  if (id.includes("ca-cao") || name.includes("ca cao")) return PROFILES["ca-cao"];
  if (id.includes("hat-dieu") || name.includes("điều")) return PROFILES["hat-dieu"];
  if (id.includes("ca-phe") || name.includes("cà phê")) return PROFILES["ca-phe"];
  if (id.includes("mat-ong") || name.includes("mật ong")) return PROFILES["mat-ong"];

  // Fallback for newly added products
  return {
    axes: [
      ["Hương thơm", "Aroma"],
      ["Độ ngọt", "Sweet"],
      ["Đậm vị", "Richness"],
      ["Tự nhiên", "Natural"],
      ["Độ tươi", "Freshness"],
      ["Hậu vị", "Finish"],
    ],
    variants: [
      { name: product?.name || "Đặc sản chuẩn OCOP", vals: [84, 62, 78, 92, 88, 76] },
    ],
  };
}

export default function FlavorRadar({ product, lang = "vi" }) {
  const profile = useMemo(() => resolveProfile(product), [product]);
  const [idx, setIdx] = useState(0);
  const current = profile.variants[idx] || profile.variants[0];

  const cx = 150;
  const cy = 145;
  const maxR = 92;
  const levels = [0.25, 0.5, 0.75, 1];

  const pt = (i, r) => {
    const ang = -Math.PI / 2 + (i * 2 * Math.PI) / 6;
    return [cx + r * Math.cos(ang), cy + r * Math.sin(ang)];
  };

  const polyPoints = current.vals
    .map((v, i) => pt(i, (Math.max(10, Math.min(100, v)) / 100) * maxR).join(","))
    .join(" ");

  const topIdx = current.vals.reduce((best, v, i, arr) => (v > arr[best] ? i : best), 0);
  const topLabel = profile.axes[topIdx][lang === "vi" ? 0 : 1];

  return (
    <section className="card" aria-labelledby="radar-title">
      <div className="grid-2" style={{ alignItems: "center", gap: 20 }}>
        {/* Left: 6-axis Hexagon Radar SVG */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <svg viewBox="0 0 300 290" width="290" height="280" role="img" aria-label="Biểu đồ 6 chiều hương vị">
            <defs>
              <linearGradient id="radarFill" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0297DE" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.25" />
              </linearGradient>
              <linearGradient id="radarStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0297DE" />
                <stop offset="100%" stopColor="#0284C7" />
              </linearGradient>
            </defs>

            {levels.map((lv) => (
              <polygon
                key={lv}
                points={Array.from({ length: 6 }, (_, i) => pt(i, maxR * lv).join(",")).join(" ")}
                fill="none"
                stroke="#CBD5E1"
                strokeWidth="1"
              />
            ))}

            {Array.from({ length: 6 }, (_, i) => {
              const [x, y] = pt(i, maxR);
              return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#E2E8F0" strokeWidth="1" />;
            })}

            <polygon
              points={polyPoints}
              fill="url(#radarFill)"
              stroke="url(#radarStroke)"
              strokeWidth="2.8"
              strokeLinejoin="round"
            />

            {current.vals.map((v, i) => {
              const [x, y] = pt(i, (Math.max(10, Math.min(100, v)) / 100) * maxR);
              return <circle key={i} cx={x} cy={y} r="4" fill="#0284C7" stroke="#FFFFFF" strokeWidth="1.5" />;
            })}

            {profile.axes.map(([vi, en], i) => {
              const [x, y] = pt(i, maxR + 24);
              const anchor = i === 0 || i === 3 ? "middle" : i < 3 ? "start" : "end";
              return (
                <text
                  key={vi}
                  x={x}
                  y={y + 4}
                  textAnchor={anchor}
                  fontSize="12.5"
                  fontWeight="700"
                  fill="#334155"
                >
                  {lang === "vi" ? vi : en}
                </text>
              );
            })}
          </svg>
        </div>

        {/* Right: Title + Variant Selector + Highlight */}
        <div>
          <span className="badge">— {lang === "vi" ? "HƯƠNG VỊ ĐẶC TRƯNG" : "FLAVOR PROFILE"}</span>
          <h2 id="radar-title" style={{ margin: "8px 0 8px" }}>
            {lang === "vi" ? "Bản đồ hương vị" : "Flavor Map"}
          </h2>
          <p className="mute" style={{ margin: "0 0 14px" }}>
            {lang === "vi"
              ? "Sáu chiều đặc trưng riêng của sản phẩm này. Chọn phiên bản bên dưới để xem hình dạng hương vị tương ứng."
              : "Six characteristic dimensions tailored to this product."}
          </p>

          <div className="chips" style={{ marginBottom: 14 }}>
            {profile.variants.map((v, i) => (
              <button
                key={v.name}
                type="button"
                className="chip"
                aria-pressed={i === idx}
                onClick={() => setIdx(i)}
              >
                {v.name}
              </button>
            ))}
          </div>

          <p style={{ margin: 0, fontSize: 14.5, color: "var(--ink-2)" }}>
            <strong style={{ color: "var(--blue-dark)" }}>{lang === "vi" ? "Nổi bật:" : "Highlight:"}</strong>{" "}
            {topLabel} · {current.name}
          </p>
        </div>
      </div>
    </section>
  );
}
