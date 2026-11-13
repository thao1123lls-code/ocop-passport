"use client";
import { useState, useRef } from "react";
import { STAGES, fmtVND } from "@/lib/store";

const IDEAS = [
  "Khuyến mãi chốt đơn hôm nay",
  "Nguồn gốc vườn trồng sạch Đồng Nai",
  "Quy trình thu hoạch & sơ chế thủ công",
  "Quét mã QR Hộ chiếu số kiểm chứng",
];

function wrapText(ctx, text, x, y, maxW, lineH) {
  const words = (text || "").split(/\s+/);
  let line = "";
  let cy = y;
  for (let i = 0; i < words.length; i++) {
    const test = line ? line + " " + words[i] : words[i];
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, cy);
      line = words[i];
      cy += lineH;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, cy);
}

function buildScenes(product, idea, customNote) {
  const e0 = product.entries?.[0];
  const e1 = product.entries?.[1] || e0;
  const photos = (product.entries || []).map((e) => e.photo).filter(Boolean);

  return [
    {
      badge: "ĐẶC SẢN CHÍNH HIỆU",
      headline: product.name,
      sub: `${product.farm || "Đặc sản OCOP Đồng Nai"} · ${product.certs || "Chuẩn chất lượng"}`,
      hook: "CHỈ CÓ TẠI VƯỜN ĐỒNG NAI",
      photo: photos[0] || null,
      type: "intro",
    },
    {
      badge: "NHẬT KÝ TẬN VƯỜN",
      headline: e0 ? (typeof e0.stage === "number" ? STAGES[e0.stage]?.[0] : e0.stage) : "Thu hoạch tại vườn",
      sub: e0?.text || "Từng trái chín được hái tay, ghi nhật ký bằng giọng nói và GPS tại vườn.",
      hook: "100% NGUYÊN CHẤT TỰ NHIÊN",
      photo: photos[1] || photos[0] || null,
      type: "farm",
    },
    {
      badge: "QUY TRÌNH CHUẨN SẠCH",
      headline: e1 ? (typeof e1.stage === "number" ? STAGES[e1.stage]?.[0] : e1.stage) : "Chế biến sạch",
      sub: customNote.trim() || e1?.text || "Sơ chế & đóng gói đạt tiêu chuẩn an toàn thực phẩm.",
      hook: "AN TÂM CHO CẢ GIA ĐÌNH",
      photo: photos[2] || photos[0] || null,
      type: "process",
    },
    {
      badge: "ƯU ĐÃI ĐẶT HÀNG HÔM NAY",
      headline: product.price ? `ƯU ĐÃI: ${fmtVND(product.price)}` : "ĐẶT MUA TẬN VƯỜN",
      sub: product.oldPrice ? `Giá cũ: ${fmtVND(product.oldPrice)} · Giảm ngay trong hôm nay!` : "Miễn phí giao hàng khi đặt qua gian hàng OCOP!",
      hook: `QUÉT QR LÔ ${product.lot || "OCOP"} ĐỂ MUA NGAY`,
      photo: null,
      type: "cta",
    },
  ];
}

export default function VideoCreator({ product }) {
  const [idea, setIdea] = useState(IDEAS[0]);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState("");
  const [err, setErr] = useState("");
  const canvasRef = useRef(null);

  if (!product) return null;
  const scenes = buildScenes(product, idea, note);

  const speakPreview = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const script = scenes
      .map((s) => `${s.hook}. ${s.headline}. ${s.sub}`)
      .join(" ... ");
    const u = new SpeechSynthesisUtterance(script);
    u.lang = "vi-VN";
    u.rate = 1.05;
    window.speechSynthesis.speak(u);
  };

  const generateVideo = async () => {
    setErr("");
    if (typeof MediaRecorder === "undefined") {
      setErr("Trình duyệt chưa hỗ trợ tạo file video (hãy dùng Chrome hoặc Edge).");
      return;
    }

    setBusy(true);
    setProgress(0);
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl("");
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const W = 540;
    const H = 960;
    canvas.width = W;
    canvas.height = H;

    // Load QR code as image for the CTA scene
    let qrImg = null;
    try {
      const QR = await import("qrcode");
      const qrData = await QR.toDataURL(`${window.location.origin}/p/${product.id}`, {
        margin: 2,
        width: 260,
        color: { dark: "#0F172A", light: "#FFFFFF" },
      });
      qrImg = await new Promise((res) => {
        const im = new Image();
        im.onload = () => res(im);
        im.onerror = () => res(null);
        im.src = qrData;
      });
    } catch {}

    // Preload any real photos from diary entries
    const loadedImgs = await Promise.all(
      scenes.map(
        (s) =>
          new Promise((res) => {
            if (!s.photo) return res(null);
            const im = new Image();
            im.onload = () => res(im);
            im.onerror = () => res(null);
            im.src = s.photo;
          }),
      ),
    );

    const stream = canvas.captureStream(30);
    const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : "video/webm";
    const rec = new MediaRecorder(stream, { mimeType: mime });
    const chunks = [];
    rec.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    const done = new Promise((resolve) => {
      rec.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        resolve(URL.createObjectURL(blob));
      };
    });

    rec.start();

    const totalMs = 8000; // 4 scenes x 2s
    const sceneMs = totalMs / scenes.length;
    const start = performance.now();

    const renderFrame = (now) => {
      const elapsed = now - start;
      const sIdx = Math.min(scenes.length - 1, Math.floor(elapsed / sceneMs));
      const localT = Math.min(1, (elapsed % sceneMs) / sceneMs);
      const sc = scenes[sIdx];
      const img = loadedImgs[sIdx];

      // Dynamic Ad Background with commercial gradient (light & deep blue aesthetic)
      const grad = ctx.createLinearGradient(0, 0, W, H);
      if (sc.type === "cta") {
        grad.addColorStop(0, "#0284C7");
        grad.addColorStop(0.5, "#026AA2");
        grad.addColorStop(1, "#075985");
      } else {
        grad.addColorStop(0, "#026AA2");
        grad.addColorStop(0.55, "#0284C7");
        grad.addColorStop(1, "#38BDF8");
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Pulsing glow circle in background
      const pulse = 1 + 0.08 * Math.sin(localT * Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.beginPath();
      ctx.arc(W / 2, 420, 220 * pulse, 0, Math.PI * 2);
      ctx.fill();

      // Top Ad Header: Brand + Flash badge
      ctx.fillStyle = "rgba(15, 23, 42, 0.4)";
      ctx.fillRect(24, 36, W - 48, 54);

      ctx.fillStyle = "#FFDD00";
      ctx.font = "bold 15px system-ui, sans-serif";
      ctx.fillText("★ OCOP PASSPORT ĐỒNG NAI", 42, 70);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 13px system-ui, sans-serif";
      ctx.fillText(`LÔ ${product.lot || "0926"}`, W - 120, 70);

      // Hook Banner (Tiktok / Reels style headline)
      ctx.fillStyle = "#FFDD00";
      ctx.fillRect(36, 114, W - 72, 48);
      ctx.fillStyle = "#0F172A";
      ctx.font = "bold 18px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(sc.hook, W / 2, 145);
      ctx.textAlign = "left";

      // Center Visual Area
      const boxY = 186;
      const boxH = 430;

      if (sc.type === "cta" && qrImg) {
        // Scene 4: Big QR Code + Scan to Buy CTA
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(36, boxY, W - 72, boxH);

        ctx.drawImage(qrImg, W / 2 - 110, boxY + 28, 220, 220);

        ctx.fillStyle = "#0284C7";
        ctx.font = "bold 26px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(sc.headline, W / 2, boxY + 290);

        ctx.fillStyle = "#0278B3";
        ctx.font = "bold 18px system-ui, sans-serif";
        ctx.fillText("QUÉT QR ĐỂ XEM HỘ CHIẾU & MUA", W / 2, boxY + 335);

        ctx.fillStyle = "#0F172A";
        ctx.font = "14px system-ui, sans-serif";
        ctx.fillText("Giao hàng tận nơi · Kiểm tra nguồn gốc", W / 2, boxY + 375);
        ctx.textAlign = "left";
      } else if (img) {
        // Product / Diary photo
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(36, boxY, W - 72, boxH);

        const scale = Math.max((W - 72) / img.width, boxH / img.height);
        const dw = img.width * scale;
        const dh = img.height * scale;
        ctx.save();
        ctx.beginPath();
        ctx.rect(36, boxY, W - 72, boxH);
        ctx.clip();
        ctx.drawImage(img, 36 + (W - 72 - dw) / 2, boxY + (boxH - dh) / 2, dw, dh);
        ctx.restore();

        // Overlay sticker on photo
        ctx.fillStyle = "rgba(2, 132, 199, 0.95)";
        ctx.fillRect(52, boxY + 20, 180, 34);
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 13px system-ui, sans-serif";
        ctx.fillText("✓ ẢNH THẬT TẠI VƯỜN", 66, boxY + 42);
      } else {
        // Clean typographic product card
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(36, boxY, W - 72, boxH);

        ctx.fillStyle = "#0297DE";
        ctx.font = "bold 18px system-ui, sans-serif";
        ctx.fillText(sc.badge, 64, boxY + 60);

        ctx.fillStyle = "#0F172A";
        ctx.font = "bold 32px system-ui, sans-serif";
        wrapText(ctx, product.name, 64, boxY + 115, W - 128, 42);

        if (product.price) {
          ctx.fillStyle = "#0284C7";
          ctx.font = "bold 36px system-ui, sans-serif";
          ctx.fillText(fmtVND(product.price), 64, boxY + 260);
          if (product.oldPrice) {
            ctx.fillStyle = "#64748B";
            ctx.font = "20px system-ui, sans-serif";
            ctx.fillText(fmtVND(product.oldPrice), 64, boxY + 300);
          }
        }

        ctx.fillStyle = "#0278B3";
        ctx.font = "bold 16px system-ui, sans-serif";
        ctx.fillText(`Cơ sở: ${product.farm || "Đồng Nai"}`, 64, boxY + 370);
      }

      // Bottom Commercial Caption Bar
      ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
      ctx.fillRect(36, 640, W - 72, 230);

      ctx.fillStyle = "#7DD3FC";
      ctx.font = "bold 14px system-ui, sans-serif";
      ctx.fillText(sc.badge, 58, 678);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 26px system-ui, sans-serif";
      wrapText(ctx, sc.headline, 58, 718, W - 116, 34);

      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.font = "18px system-ui, sans-serif";
      wrapText(ctx, sc.sub, 58, 792, W - 116, 26);

      // Flashing Call-To-Action Button at bottom
      ctx.fillStyle = "#FFDD00";
      ctx.fillRect(48, 888, W - 96, 44);
      ctx.fillStyle = "#0F172A";
      ctx.font = "bold 16px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("👉 BẤM ĐẶT HÀNG / QUÉT QR NGAY", W / 2, 916);
      ctx.textAlign = "left";

      setProgress(Math.min(100, Math.round((elapsed / totalMs) * 100)));

      if (elapsed < totalMs) {
        requestAnimationFrame(renderFrame);
      } else {
        rec.stop();
      }
    };

    requestAnimationFrame(renderFrame);
    const url = await done;
    setVideoUrl(url);
    setBusy(false);
  };

  return (
    <section className="card" aria-labelledby="video-ai-title" style={{ marginTop: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
        <div>
          <span className="badge">AI Dựng Video Quảng Cáo Bán Hàng (9:16)</span>
          <h2 id="video-ai-title" style={{ margin: "6px 0 4px" }}>
            Tạo video quảng cáo chốt đơn cho nông dân
          </h2>
          <p className="mute" style={{ margin: 0 }}>
            Tự động ghép ảnh thật tại vườn, giá bán, cam kết chất lượng OCOP và mã QR Hộ chiếu số thành video quảng cáo TikTok Ads, Reels, Shopee Video.
          </p>
        </div>
      </div>

      <label style={{ marginTop: 14 }}>1. Chọn phong cách video quảng cáo</label>
      <div className="chips">
        {IDEAS.map((item) => (
          <button
            key={item}
            type="button"
            className="chip"
            aria-pressed={idea === item}
            onClick={() => setIdea(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <label htmlFor="vid-note">2. Chương trình ưu đãi / Điểm nhấn quảng cáo muốn chèn</label>
      <input
        id="vid-note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Ví dụ: Mua 2 tặng 1 tuần này, Freeship đơn từ 200k, Hái chín 100%…"
      />

      <div className="grid-2" style={{ marginTop: 16, alignItems: "start" }}>
        <div>
          <h3 style={{ marginBottom: 8 }}>4 phân cảnh video quảng cáo (8 giây)</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {scenes.map((s, idx) => (
              <div
                key={s.badge}
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--line)",
                  borderRadius: 10,
                  padding: "10px 12px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, fontWeight: 800, color: "var(--blue-dark)" }}>
                  <span>CẢNH {idx + 1} · {s.badge}</span>
                  <span style={{ color: "var(--blue)" }}>{s.hook}</span>
                </div>
                <b style={{ fontSize: 14.5 }}>{s.headline}</b>
                <p className="mute" style={{ margin: "2px 0 0", fontSize: 13 }}>
                  {s.sub}
                </p>
              </div>
            ))}
          </div>

          <div className="row" style={{ marginTop: 14 }}>
            <button type="button" disabled={busy} onClick={generateVideo}>
              {busy ? `Đang dựng video quảng cáo (${progress}%)…` : "Tạo video quảng cáo ngay (.webm)"}
            </button>
            <button type="button" className="alt" onClick={speakPreview}>
              Nghe giọng đọc quảng cáo
            </button>
          </div>
          {err && <p className="warn">{err}</p>}
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <canvas ref={canvasRef} style={{ display: "none" }} />
          {videoUrl ? (
            <>
              <video
                src={videoUrl}
                controls
                autoPlay
                loop
                playsInline
                style={{
                  width: "100%",
                  maxWidth: 270,
                  aspectRatio: "9 / 16",
                  borderRadius: 12,
                  border: "1px solid var(--line-strong)",
                  background: "#0F172A",
                  boxShadow: "var(--shadow-md)",
                }}
              />
              <a
                className="btn"
                href={videoUrl}
                download={`video-quang-cao-${product.id}.webm`}
                style={{ marginTop: 10 }}
              >
                Tải video quảng cáo về máy (.webm)
              </a>
            </>
          ) : (
            <div
              style={{
                width: "100%",
                maxWidth: 270,
                aspectRatio: "9 / 16",
                borderRadius: 12,
                background: "linear-gradient(135deg, #0278B3, #0284C7 50%, #38BDF8)",
                color: "#fff",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                padding: 20,
              }}
            >
              <strong style={{ fontSize: 17, marginBottom: 6 }}>Khung video dọc 9:16</strong>
              <span style={{ fontSize: 13.5, opacity: 0.9 }}>
                Bấm “Tạo video quảng cáo ngay” để AI dựng video TikTok / Reels / Shopee Video hoàn chỉnh có mã QR và giá bán.
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
