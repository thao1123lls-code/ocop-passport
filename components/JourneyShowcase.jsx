"use client";
import { useState, useEffect } from "react";
import { STAGES, fmt } from "@/lib/store";

function StageArt({ stage }) {
  // Custom clean geometric SVG illustrations for each of the 6 OCOP stages (cyber dark palette)
  const common = { width: 140, height: 140, viewBox: "0 0 120 120", fill: "none" };
  switch (stage) {
    case 0: // Gieo trồng
      return (
        <svg {...common} aria-hidden="true">
          <path d="M22 92C40 84 80 84 98 92" stroke="#64748B" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
          <path d="M60 88V52" stroke="#00E5FF" strokeWidth="5" strokeLinecap="round" />
          <path d="M60 62C46 58 38 46 42 36C52 38 60 48 60 62Z" fill="#00E5FF" />
          <path d="M60 56C74 52 82 40 78 30C68 32 60 42 60 56Z" fill="#38BDF8" />
        </svg>
      );
    case 1: // Chăm sóc
      return (
        <svg {...common} aria-hidden="true">
          <circle cx="60" cy="36" r="14" fill="#38BDF8" opacity="0.9" />
          <path d="M40 76C40 62 50 54 60 54C70 54 80 62 80 76" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />
          <path d="M36 86C52 80 68 80 84 86" stroke="#00E5FF" strokeWidth="5" strokeLinecap="round" />
          <circle cx="44" cy="48" r="3.5" fill="#00E5FF" />
          <circle cx="76" cy="48" r="3.5" fill="#00E5FF" />
        </svg>
      );
    case 2: // Thu hoạch
      return (
        <svg {...common} aria-hidden="true">
          <path d="M24 42C48 30 74 30 96 42" stroke="#64748B" strokeWidth="4" strokeLinecap="round" opacity="0.75" />
          <path d="M60 35V46" stroke="#64748B" strokeWidth="3.5" strokeLinecap="round" opacity="0.75" />
          <ellipse cx="60" cy="70" rx="18" ry="26" fill="#F59E0B" />
          <path d="M60 46V94M50 51C48 68 48 76 50 90M70 51C72 68 72 76 70 90" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" opacity="0.9" />
          <path d="M74 44C84 42 92 48 92 58C82 60 74 54 74 44Z" fill="#10B981" />
        </svg>
      );
    case 3: // Sơ chế
      return (
        <svg {...common} aria-hidden="true">
          <circle cx="60" cy="36" r="12" fill="#00E5FF" />
          <path d="M60 18V22M60 50V54M42 36H46M74 36H78M47 23L50 26M70 46L73 49M73 23L70 26M50 46L47 49" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />
          <rect x="28" y="64" width="64" height="24" rx="8" fill="#1E293B" stroke="#00E5FF" strokeWidth="3" />
          <circle cx="44" cy="76" r="5" fill="#38BDF8" />
          <circle cx="60" cy="76" r="5" fill="#00E5FF" />
          <circle cx="76" cy="76" r="5" fill="#38BDF8" />
        </svg>
      );
    case 4: // Đóng gói
      return (
        <svg {...common} aria-hidden="true">
          <rect x="34" y="34" width="52" height="54" rx="10" fill="#1E293B" stroke="#00E5FF" strokeWidth="3.5" />
          <path d="M34 50H86" stroke="#38BDF8" strokeWidth="3" opacity="0.7" />
          <rect x="48" y="60" width="24" height="18" rx="4" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.5" />
          <rect x="52" y="64" width="6" height="6" fill="#F8FAFC" />
          <rect x="62" y="64" width="6" height="6" fill="#00E5FF" />
          <rect x="52" y="72" width="16" height="3" fill="#38BDF8" />
        </svg>
      );
    default: // Xuất bán
      return (
        <svg {...common} aria-hidden="true">
          <path d="M30 44H86L80 84H36L30 44Z" fill="#1E293B" stroke="#00E5FF" strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M46 44V36C46 28 52 24 58 24C64 24 70 28 70 36V44" stroke="#38BDF8" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M50 64L57 71L70 57" stroke="#10B981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}

const toStageIndex = (stage) => {
  if (typeof stage === "number" && stage >= 0 && stage < STAGES.length) return stage;
  if (typeof stage === "string") {
    const trimmed = stage.trim().toLowerCase();
    const idx = STAGES.findIndex(
      ([vi, en]) => vi.toLowerCase() === trimmed || en.toLowerCase() === trimmed
    );
    if (idx !== -1) return idx;
    const num = parseInt(trimmed, 10);
    if (!isNaN(num) && num >= 0 && num < STAGES.length) return num;
  }
  return 0;
};

export default function JourneyShowcase({ entries = [], lang = "vi" }) {
  const safeEntries = Array.isArray(entries) ? entries : [];
  const firstRecorded = safeEntries.length ? toStageIndex(safeEntries[0]?.stage) : 2;
  const [active, setActive] = useState(firstRecorded);

  useEffect(() => {
    if (safeEntries.length) {
      setActive((prev) => {
        const prevIdx = toStageIndex(prev);
        const hasPrev = safeEntries.some((e) => toStageIndex(e?.stage) === prevIdx);
        return hasPrev ? prevIdx : toStageIndex(safeEntries[0]?.stage);
      });
    }
  }, [entries]);

  const currentIdx = toStageIndex(active);
  const currentStage = STAGES[currentIdx] || STAGES[0];
  const stageName = currentStage ? currentStage[lang === "vi" ? 0 : 1] : "Công đoạn";
  const pct = ((currentIdx + 1) / STAGES.length) * 100;

  const stageEntries = safeEntries
    .filter((e) => e && toStageIndex(e.stage) === currentIdx)
    .sort((a, b) => (a?.ts || 0) - (b?.ts || 0));
  const latestPhoto = [...stageEntries].reverse().find((e) => e?.photo)?.photo;

  return (
    <section
      aria-label={lang === "vi" ? "Quy trình nhật ký sản xuất" : "Production Journey"}
      style={{
        borderRadius: 18,
        padding: "32px 28px",
        background: "#0B1320",
        border: "1.5px solid rgba(0, 229, 255, 0.25)",
        color: "#FFFFFF",
        margin: "24px 0",
        boxShadow: "0 16px 40px rgba(0, 0, 0, 0.5), 0 0 24px rgba(0, 229, 255, 0.12)",
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <span
          style={{
            display: "inline-block",
            padding: "4px 12px",
            borderRadius: 99,
            background: "rgba(0, 229, 255, 0.12)",
            color: "#00E5FF",
            border: "1px solid rgba(0, 229, 255, 0.35)",
            fontSize: 11.5,
            fontWeight: 800,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          — {lang === "vi" ? "QUY TRÌNH NHẬT KÝ SỐ" : "DIGITAL DIARY JOURNEY"}
        </span>
        <h2 style={{ margin: "10px 0 6px", fontSize: "clamp(24px, 3.4vw, 32px)", fontWeight: 850, color: "#FFFFFF" }}>
          {lang === "vi" ? "Hành trình từ hạt đến quà" : "From Farm to Gift"}
        </h2>
        <p style={{ margin: 0, maxWidth: "60ch", color: "#94A3B8", fontSize: 14.5, lineHeight: 1.5 }}>
          {lang === "vi"
            ? "Bấm chọn từng chặng 01 – 06 để theo dõi nhật ký thực tế mà nông hộ đã ghi lại."
            : "Step through stages 01 – 06 to inspect the real production log."}
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 32,
          alignItems: "start",
        }}
      >
        {/* Left: Hexagon Emblem + Progress Bar */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          <div style={{ position: "relative", width: 224, height: 244, display: "grid", placeItems: "center" }}>
            <svg viewBox="0 0 220 240" width="224" height="244" style={{ position: "absolute", inset: 0 }} aria-hidden="true">
              <defs>
                <linearGradient id="hexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00E5FF" />
                  <stop offset="100%" stopColor="#0284C7" />
                </linearGradient>
              </defs>
              <polygon
                points="110,8 206,62 206,178 110,232 14,178 14,62"
                fill="#111C2E"
                stroke="url(#hexGrad)"
                strokeWidth="3.5"
              />
            </svg>
            <div style={{ position: "relative", zIndex: 1, display: "grid", placeItems: "center" }}>
              {latestPhoto ? (
                <img
                  src={latestPhoto}
                  alt={stageName}
                  style={{
                    width: 140,
                    height: 140,
                    objectFit: "cover",
                    borderRadius: 14,
                    border: "2px solid rgba(0, 229, 255, 0.35)",
                    boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
                  }}
                />
              ) : (
                <StageArt stage={currentIdx} />
              )}
            </div>
          </div>

          {/* 01 ─── 06 Progress Bar */}
          <div style={{ width: "100%", maxWidth: 300 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, fontWeight: 800, color: "#00E5FF" }}>
              <span>0{currentIdx + 1}</span>
              <div style={{ flex: 1, height: 6, borderRadius: 99, background: "#1E293B", border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden" }}>
                <div
                  style={{
                    width: `${pct}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #00E5FF, #38BDF8)",
                    boxShadow: "0 0 8px rgba(0, 229, 255, 0.6)",
                    transition: "width 0.25s ease",
                  }}
                />
              </div>
              <span style={{ color: "#94A3B8" }}>0{STAGES.length}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 6, marginTop: 12 }}>
              {STAGES.map(([vi, en], i) => {
                const hasData = safeEntries.some((e) => toStageIndex(e?.stage) === i);
                const isCur = i === currentIdx;
                return (
                  <button
                    key={vi}
                    type="button"
                    onClick={() => setActive(i)}
                    title={lang === "vi" ? vi : en}
                    style={{
                      flex: 1,
                      padding: "7px 0",
                      fontSize: 12.5,
                      fontWeight: 800,
                      borderRadius: 8,
                      background: isCur
                        ? "#00E5FF"
                        : hasData
                          ? "rgba(0, 229, 255, 0.15)"
                          : "rgba(255,255,255,0.06)",
                      color: isCur ? "#070B14" : hasData ? "#38BDF8" : "#64748B",
                      border: isCur
                        ? "1px solid #00E5FF"
                        : hasData
                          ? "1px solid rgba(0, 229, 255, 0.35)"
                          : "1px solid rgba(255,255,255,0.1)",
                      boxShadow: isCur ? "0 0 12px rgba(0, 229, 255, 0.5)" : "none",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    0{i + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Editorial Number + Stage Title + Recorded Entries */}
        <div style={{ paddingTop: 4 }}>
          <div
            style={{
              fontSize: "clamp(56px, 6vw, 72px)",
              fontWeight: 950,
              lineHeight: 0.92,
              letterSpacing: "-0.03em",
              color: "#00E5FF",
              textShadow: "0 0 24px rgba(0, 229, 255, 0.5)",
              marginBottom: 8,
            }}
          >
            0{currentIdx + 1}
          </div>
          <h3
            style={{
              fontSize: "clamp(24px, 2.6vw, 30px)",
              fontWeight: 900,
              letterSpacing: "-0.01em",
              color: "#FFFFFF",
              margin: "0 0 16px",
              textShadow: "0 2px 12px rgba(0,0,0,0.6)",
            }}
          >
            {stageName}
          </h3>

          {stageEntries.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {stageEntries.map((e) => (
                <div
                  key={e.id}
                  style={{
                    background: "#111C2E",
                    border: "1.5px solid rgba(0, 229, 255, 0.28)",
                    borderRadius: 14,
                    padding: "16px 20px",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 10px",
                      color: "#FFFFFF",
                      fontSize: "clamp(16.5px, 1.35vw, 19px)",
                      lineHeight: 1.65,
                      fontWeight: 550,
                    }}
                  >
                    {e.text}
                  </p>
                  <div style={{ fontSize: 13.5, color: "#38BDF8", fontWeight: 700, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ color: "#7DD3FC" }}>📅 {fmt(e.ts)}</span>
                    {e.geo && <span style={{ color: "#34D399" }}>· 📍 Có tọa độ GPS</span>}
                    {e.by === "volunteer" && <span style={{ color: "#FCD34D" }}>· 🤝 Đoàn viên nhập hộ</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: "clamp(15.5px, 1.25vw, 17.5px)", color: "#CBD5E1", lineHeight: 1.6 }}>
              {lang === "vi"
                ? "Công đoạn này chưa có bản ghi nhật ký. Cơ sở có thể bổ sung bằng giọng nói và ảnh trong mục Nhật ký số."
                : "No diary entry recorded for this stage yet."}
            </p>
          )}

          <div className="row" style={{ marginTop: 22, display: "flex", gap: 10 }}>
            <button
              type="button"
              className="alt"
              style={{
                padding: "9px 18px",
                borderRadius: 10,
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.18)",
                color: "#FFFFFF",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: 13.5,
              }}
              onClick={() => setActive((currentIdx - 1 + STAGES.length) % STAGES.length)}
            >
              ← Chặng trước
            </button>
            <button
              type="button"
              style={{
                padding: "9px 20px",
                borderRadius: 10,
                background: "#00E5FF",
                color: "#070B14",
                fontWeight: 800,
                border: "none",
                cursor: "pointer",
                fontSize: 13.5,
                boxShadow: "0 0 16px rgba(0, 229, 255, 0.4)",
              }}
              onClick={() => setActive((currentIdx + 1) % STAGES.length)}
            >
              Chặng tiếp theo →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
