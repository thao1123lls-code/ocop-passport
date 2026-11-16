// Lucian UX/UI Prompt #216, #226 & #363 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#216 · https://lucianlabs.dev/uxui-prompt/#226 · https://lucianlabs.dev/uxui-prompt/#363
"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useDB } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import ProductQR from "./ProductQR";
import DotGridWaves from "./DotGridWaves";

const HEADLINE_LINES = [
  ["Đặc", "sản", "Đồng", "Nai", "chuẩn", "OCOP"],
  ["Đặt", "mua", "tận", "vườn"],
];

const BEAM_COLORS = ["129,140,248", "45,212,191", "244,114,182"];
const GRID_CELL = 34;

export default function Hero() {
  const { lang, t } = useLang();
  const heroT = t.hero;
  const headlineLines = heroT?.lines || HEADLINE_LINES;

  const pc = useRef(null);
  const heroRef = useRef(null);
  const canvasRef = useRef(null);
  const [db] = useDB();
  const [isIn, setIsIn] = useState(false);
  const [isSnap, setIsSnap] = useState(false);
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [isFlipped, setIsFlipped] = useState(false);

  // Sản phẩm nổi bật ở Hero: Tự động lấy sản phẩm chỉ định hoặc sản phẩm OCOP tiêu biểu đầu tiên
  const featuredId = db?.featuredProductId || null;
  const featured = (featuredId ? db?.products?.find((p) => p.id === featuredId) : null) || db?.products?.[0] || null;
  const featuredPhoto = featured?.photo || featured?.entries?.find((e) => e?.photo)?.photo || null;
  const [cardView, setCardView] = useState("qr");

  useEffect(() => {
    if (featuredPhoto) setCardView("photo");
    else setCardView("qr");
  }, [featuredPhoto]);

  // Replay staggered hero entrance
  const play = useCallback(() => {
    setIsSnap(true);
    setIsIn(false);
    if (heroRef.current) void heroRef.current.offsetWidth;
    setIsSnap(false);
    requestAnimationFrame(() => {
      setIsIn(true);
    });
  }, []);

  // IntersectionObserver for entrance animation
  useEffect(() => {
    if (typeof window !== "undefined" && "IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            observer.disconnect();
            play();
          }
        },
        { threshold: 0.25 }
      );
      if (heroRef.current) observer.observe(heroRef.current);
      return () => observer.disconnect();
    } else {
      setIsIn(true);
    }
  }, [play]);

  // Grid Beam Canvas Animation (Element #226)
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const cx = cv.getContext("2d");
    if (!cx) return;

    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0;
    let H = 0;
    let dpr = 1;
    let beams = [];
    let acc = 0;
    let raf = 0;
    let last = 0;
    let isVisible = true;

    const resize = () => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      W = Math.max(320, Math.floor(rect.width));
      H = Math.max(480, Math.floor(rect.height));
      dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = W * dpr;
      cv.height = H * dpr;
      cx.resetTransform?.();
      cx.scale(dpr, dpr);
    };

    resize();
    const ro = new ResizeObserver(resize);
    if (heroRef.current) ro.observe(heroRef.current);

    const spawnBeam = () => {
      const isVertical = Math.random() < 0.5;
      const count = isVertical ? W / GRID_CELL : H / GRID_CELL;
      const line = (1 + Math.floor(Math.random() * Math.max(1, count - 1))) * GRID_CELL - 1;
      const dir = Math.random() < 0.5 ? 1 : -1;
      beams.push({
        v: isVertical,
        l: line,
        p: dir > 0 ? -60 : (isVertical ? H : W) + 60,
        d: dir,
        sp: 110 + Math.random() * 95,
        len: 55 + Math.random() * 45,
        c: BEAM_COLORS[Math.floor(Math.random() * BEAM_COLORS.length)],
      });
    };

    // Pre-populate beams
    for (let i = 0; i < 4; i++) {
      spawnBeam();
      if (beams[i]) {
        beams[i].p = (beams[i].v ? H : W) * (0.2 + i * 0.18);
      }
    }

    const drawBeams = () => {
      cx.clearRect(0, 0, W, H);
      beams.forEach((b) => {
        const x0 = b.v ? b.l : b.p - b.d * b.len;
        const y0 = b.v ? b.p - b.d * b.len : b.l;
        const x1 = b.v ? b.l : b.p;
        const y1 = b.v ? b.p : b.l;

        const g = cx.createLinearGradient(x0, y0, x1, y1);
        g.addColorStop(0, `rgba(${b.c}, 0)`);
        g.addColorStop(1, `rgba(${b.c}, 0.95)`);

        cx.strokeStyle = g;
        cx.lineWidth = 1.6;
        cx.beginPath();
        cx.moveTo(x0 + 0.5, y0 + 0.5);
        cx.lineTo(x1 + 0.5, y1 + 0.5);
        cx.stroke();

        cx.fillStyle = `rgba(${b.c}, 1)`;
        cx.shadowColor = `rgba(${b.c}, 1)`;
        cx.shadowBlur = 8;
        cx.beginPath();
        cx.arc(x1 + 0.5, y1 + 0.5, 1.8, 0, 6.2832);
        cx.fill();
        cx.shadowBlur = 0;
      });
    };

    const frame = (now) => {
      raf = 0;
      if (!isVisible) return;
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      acc += dt;

      if (acc > 0.42 && beams.length < 10) {
        acc = 0;
        spawnBeam();
      }

      beams.forEach((b) => {
        b.p += b.d * b.sp * dt;
      });

      beams = beams.filter((b) => {
        const lim = (b.v ? H : W) + 70;
        return b.d > 0 ? b.p < lim : b.p > -70;
      });

      drawBeams();
      raf = requestAnimationFrame(frame);
    };

    const run = () => {
      if (!raf && isVisible && !rm) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0].isIntersecting;
        if (isVisible) {
          run();
        } else if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { threshold: 0.1 }
    );
    if (heroRef.current) io.observe(heroRef.current);

    drawBeams();
    run();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  // Pointer spotlight interaction (Element #226)
  const handlePointerMove = (e) => {
    if (!heroRef.current) return;
    const r = heroRef.current.getBoundingClientRect();
    heroRef.current.style.setProperty("--mx", `${(e.clientX - r.left).toFixed(0)}px`);
    heroRef.current.style.setProperty("--my", `${(e.clientY - r.top).toFixed(0)}px`);
  };

  const handlePointerLeave = () => {
    if (!heroRef.current) return;
    heroRef.current.style.setProperty("--mx", "-400px");
    heroRef.current.style.setProperty("--my", "-400px");
  };

  // 3D Card Tilt Interaction with Specular Sheen & Parallax
  const tilt = (e) => {
    if (matchMedia("(prefers-reduced-motion:reduce)").matches) return;
    const el = pc.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    const rotY = (x - 0.5) * 16;
    const rotX = (0.5 - y) * 16;
    el.style.transform = `perspective(1000px) rotateY(${rotY.toFixed(2)}deg) rotateX(${rotX.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
    setGlare({ x: (x * 100).toFixed(1), y: (y * 100).toFixed(1), opacity: 0.35 });
    setParallax({ x: (x - 0.5) * 18, y: (y - 0.5) * 18 });
  };

  const untilt = () => {
    if (pc.current) pc.current.style.transform = "";
    setGlare({ x: 50, y: 50, opacity: 0 });
    setParallax({ x: 0, y: 0 });
  };

  // Compute staggered word delays (Element #216)
  let currentDelay = 280;
  const wordDelayMap = [];
  headlineLines.forEach((line) => {
    const lineDelays = [];
    line.forEach(() => {
      lineDelays.push(currentDelay);
      currentDelay += 65;
    });
    wordDelayMap.push(lineDelays);
  });

  return (
    <section
      ref={heroRef}
      className={`hero u216 u226 ${isIn ? "is-in" : ""} ${isSnap ? "is-snap" : ""}`}
      aria-label="Giới thiệu OCOP Passport"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <style jsx>{`
        .u226 {
          position: relative;
          overflow: hidden;
          background: #DBEAFE;
          color: #17324D;
          --mx: -400px;
          --my: -400px;
          --ux-page: #EFF6FF;
          --ux-surface: #FFFFFF;
          --ux-surface-2: #F7FAFF;
          --ux-surface-3: #DBEAFE;
          --ux-ink: #17324D;
          --ux-ink-2: #35536E;
          --ux-ink-3: #577189;
          --ux-line: rgba(29, 78, 216, 0.14);
          --ux-line-2: rgba(29, 78, 216, 0.24);
          --ux-accent: #93C5FD;
          --ux-accent-2: #1E40AF;
          --ux-accent-soft: rgba(147, 197, 253, 0.18);
          --ux-accent-ink: #17324D;
          --ux-mint: #93C5FD;
          --ux-warn: #1E40AF;
          --ux-danger: #1E40AF;
          --ux-ease: cubic-bezier(0.2, 0.8, 0.2, 1);
          --ux-spring: cubic-bezier(0.34, 1.45, 0.64, 1);
        }

        /* 226 Background Grid Layers */
        .u226-gd,
        .u226-gl {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.07) 1px, transparent 1px);
          background-size: 34px 34px;
          background-position: -1px -1px;
          pointer-events: none;
          z-index: 0;
        }

        .u226-gd {
          -webkit-mask-image: radial-gradient(75% 70% at 50% 45%, #000, transparent);
          mask-image: radial-gradient(75% 70% at 50% 45%, #000, transparent);
        }

        /* Interactive cursor spotlight lighting up grid around mouse */
        .u226-gl {
          background-image:
            linear-gradient(rgba(129, 140, 248, 0.55) 1px, transparent 1px),
            linear-gradient(90deg, rgba(129, 140, 248, 0.55) 1px, transparent 1px);
          -webkit-mask-image: radial-gradient(130px 130px at var(--mx) var(--my), #000, transparent);
          mask-image: radial-gradient(130px 130px at var(--mx) var(--my), #000, transparent);
          transition: opacity 0.4s;
          pointer-events: none;
          z-index: 0;
        }

        /* Canvas Beam Layer */
        .u226-cv {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        /* Ambient Glow Behind Center (Prompt 226) */
        .u226-glow {
          position: absolute;
          left: 50%;
          top: 44%;
          width: 500px;
          height: 320px;
          margin: -160px 0 0 -250px;
          border-radius: 50%;
          background: radial-gradient(closest-side, rgba(147, 197, 253, 0.35), transparent);
          filter: blur(28px);
          pointer-events: none;
          z-index: 0;
        }

        /* 216 Staggered entrance items */
        .u216 :global([data-s]) {
          opacity: 0;
          transform: translateY(16px);
          transition:
            opacity 0.6s var(--ux-ease),
            transform 0.75s cubic-bezier(0.2, 0.8, 0.2, 1);
          transition-delay: calc(var(--d) * 1ms);
        }

        :global(.hero) {
          padding: 96px 40px 48px !important;
        }

        :global(.hero-inner) {
          max-width: min(1680px, 95vw) !important;
          gap: 56px !important;
        }

        /* Headline hidden-line sliding words with metallic 226 gradient */
        .u216-h {
          font-size: clamp(34px, 4.2vw, 56px);
          line-height: 1.15;
          margin: 0 0 16px;
          font-weight: 900;
          letter-spacing: -0.03em;
          background: linear-gradient(180deg, #1D4ED8 15%, #3B82F6 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        :global(.hero-pill) {
          background: rgba(147, 197, 253, 0.16) !important;
          box-shadow: inset 0 0 0 1.5px rgba(29, 78, 216, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.75) !important;
          color: #1E40AF !important;
          letter-spacing: 0.04em;
        }

        :global(.hero .lead) {
          color: #577189 !important;
          font-size: clamp(16px, 1.25vw, 18.5px) !important;
          max-width: 660px;
          line-height: 1.6 !important;
        }

        :global(.hero-metric) {
          background: transparent !important;
          border: 1.5px solid rgba(29, 78, 216, 0.4) !important;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px 18px !important;
          border-radius: 12px;
        }

        :global(.hero-metric b) {
          color: #17324D !important;
          font-size: 14.5px;
          font-weight: 750;
        }

        :global(.btn.white) {
          background: #FFFFFF !important;
          color: #17324D !important;
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.4) !important;
        }

        :global(.btn.white:hover) {
          background: #F1F5F9 !important;
          transform: translateY(-2px);
        }

        :global(.btn.ghost) {
          background: rgba(255, 255, 255, 0.07) !important;
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.16) !important;
          color: #17324D !important;
        }

        :global(.btn.ghost:hover) {
          background: rgba(255, 255, 255, 0.14) !important;
        }

        .u216-ln {
          display: block;
        }

        .u216-w {
          display: inline-block;
          overflow: hidden;
          vertical-align: top;
          padding: 0 0.08em;
        }

        .u216-w > span {
          display: inline-block;
          transform: translateY(108%);
          transition: transform 0.75s cubic-bezier(0.2, 0.8, 0.2, 1);
          transition-delay: calc(var(--d) * 1ms);
        }

        /* Product screen / card entrance: tilted back & blurred */
        .u216 :global(.pass[data-s]) {
          transform: translateY(48px) rotateX(22deg) scale(0.94);
          filter: blur(6px);
          transform-origin: 50% 100%;
          transition:
            opacity 0.65s var(--ux-ease),
            transform 1.15s cubic-bezier(0.2, 0.8, 0.2, 1),
            filter 0.9s ease;
          transition-delay: calc(var(--d) * 1ms);
        }

        /* Triggered active states */
        .u216.is-in :global([data-s]) {
          opacity: 1;
          transform: none;
          filter: none;
        }

        .u216.is-in .u216-w > span {
          transform: none;
        }

        /* Instant reset mode for replay */
        .u216.is-snap :global([data-s]),
        .u216.is-snap .u216-w > span {
          transition: none !important;
        }

        /* Replay button */
        .u216-re {
          position: absolute;
          right: 28px;
          top: 80px;
          z-index: 10;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 30px;
          padding: 0 12px;
          border: 1px solid rgba(255, 255, 255, 0.35);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.18);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          color: #17324D;
          font: inherit;
          font-size: 11.5px;
          font-weight: 750;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
          transition: background 0.2s, transform 0.15s;
        }

        .u216-re:hover {
          background: rgba(255, 255, 255, 0.32);
          transform: scale(1.05);
        }

        .u216-re:active {
          transform: scale(0.94);
        }

        .u216-re:focus-visible {
          outline: 2px solid #fff;
          outline-offset: 2px;
        }

        @media (max-width: 860px) {
          .u216-re {
            top: 14px;
            right: 14px;
          }

          :global(.hero) {
            min-height: auto !important;
            padding: 82px 18px calc(160px + env(safe-area-inset-bottom)) !important;
          }

          :global(.hero-inner) {
            width: 100%;
            max-width: 640px !important;
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 28px !important;
          }

          .hc {
            width: 100%;
            min-width: 0;
          }

          .u216-h {
            max-width: 100%;
            font-size: clamp(34px, 8vw, 48px);
            line-height: 1.12;
          }

        }

        @media (max-width: 480px) {
          :global(.hero) {
            padding-inline: 16px !important;
          }

          :global(.hero-inner) {
            gap: 22px !important;
          }

          .u216-h {
            font-size: clamp(32px, 9vw, 40px);
            margin-bottom: 12px;
          }

        }

        @media (prefers-reduced-motion: reduce) {
          .u216 :global([data-s]),
          .u216 .u216-w > span,
          .u216-re,
          .u226-gl {
            transition: none !important;
            animation: none !important;
          }
        }

        /* ========================================================
           THẺ SẢN PHẨM NỔI BẬT DẠNG LẬT 2 MẶT (INTERACTIVE FLIP CARD)
           - Mặt trước: Ảnh sản phẩm, chứng nhận OCOP, xuất xứ & giá
           - Mặt sau: Mã QR Hộ chiếu số, chứng nhận & link xem chi tiết
           - Lật mượt mà khi di chuột (hover) hoặc khi bấm nút lật
           - Tông màu ấm sang trọng & bóng đổ chuyên nghiệp
           ======================================================== */
        .featured-flip-scene {
          perspective: 1200px;
          perspective-origin: center center;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          max-width: 550px;
          margin: 0 auto;
        }

        /* Thẻ lật 2 mặt - Lật nhanh dứt khoát khi click chuột */
        .featured-flip-card {
          position: relative;
          width: 100%;
          min-height: 590px;
          transform-style: preserve-3d;
          transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1);
          cursor: pointer;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }

        /* CHỈ LẬT KHI CLICK CHUỘT (CÓ CLASS .is-flipped), KHÔNG LẬT KHI HOVER */
        .featured-flip-card.is-flipped {
          transform: rotateY(180deg);
        }

        /* Bóng đổ sàn phản chiếu ánh cyan neon */
        .featured-flip-floor-shadow {
          position: absolute;
          bottom: -22px;
          left: 50%;
          width: 86%;
          height: 32px;
          background: radial-gradient(ellipse at center, rgba(147, 197, 253, 0.5) 0%, rgba(29, 78, 216, 0.28) 45%, transparent 75%);
          filter: blur(16px);
          transform: translateX(-50%);
          pointer-events: none;
          z-index: 0;
          transition: transform 0.32s ease, opacity 0.32s ease;
        }

        .featured-flip-card.is-flipped ~ .featured-flip-floor-shadow {
          transform: translateX(-50%) scale(1.06);
          opacity: 0.95;
        }

        /* Thiết kế 2 mặt thẻ: Tông màu Cyber Navy & Viền Cyan Neon đa tầng nổi bật */
        .card-3d-face {
          position: absolute;
          inset: 0;
          border-radius: 22px;
          overflow: hidden;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          /* Tông Cyber Dark Navy cao cấp ăn khớp với website */
          background: linear-gradient(160deg, #EFF6FF 0%, #FFFFFF 45%, #EFF6FF 100%);
          border: 1.5px solid rgba(147, 197, 253, 0.45);
          /* Hiệu ứng nổi bật đa tầng (Neon glow + 3D shadow) */
          box-shadow:
            0 20px 45px -10px rgba(56, 189, 248, 0.32),
            0 0 30px rgba(147, 197, 253, 0.3),
            inset 0 1px 1px rgba(255, 255, 255, 0.25);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          color: #17324D;
        }

        .face-front {
          transform: translateZ(1px);
        }

        .face-back {
          transform: rotateY(180deg) translateZ(1px);
        }

        /* Header của thẻ */
        .warm-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 18px;
          background: rgba(242, 249, 254, 0.88);
          border-bottom: 1px solid rgba(147, 197, 253, 0.22);
          backdrop-filter: blur(10px);
        }

        .warm-pill {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: rgba(147, 197, 253, 0.12);
          border: 1px solid rgba(147, 197, 253, 0.45);
          border-radius: 99px;
          padding: 4px 12px;
          font-size: 11.5px;
          font-weight: 800;
          color: #1E40AF;
          letter-spacing: 0.04em;
          box-shadow: 0 0 12px rgba(147, 197, 253, 0.2);
        }

        .warm-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #93C5FD;
          box-shadow: 0 0 8px #93C5FD;
        }

        .warm-dot-mint {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #93C5FD;
          box-shadow: 0 0 8px #93C5FD;
        }

        .warm-lot {
          font-size: 11.5px;
          font-weight: 750;
          color: #577189;
          background: rgba(29, 78, 216, 0.18);
          padding: 3px 10px;
          border-radius: 99px;
          border: 1px solid rgba(147, 197, 253, 0.2);
        }

        /* Khung ảnh sản phẩm mặt trước - To hơn, chiếm trọn tâm điểm thị giác */
        .warm-stage {
          position: relative;
          width: 100%;
          height: 385px;
          background: radial-gradient(circle at center, #F7FAFF 0%, #EAF2FF 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border-bottom: 1px solid rgba(147, 197, 253, 0.2);
        }

        .warm-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 6px;
          user-select: none;
          transition: transform 0.35s ease;
        }

        .featured-flip-card:hover .warm-img {
          transform: scale(1.05);
        }

        .warm-star-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: linear-gradient(135deg, #93C5FD 0%, #93C5FD 100%);
          color: #17324D;
          border: 1px solid rgba(255, 255, 255, 0.6);
          font-size: 11.5px;
          font-weight: 850;
          padding: 4px 12px;
          border-radius: 99px;
          box-shadow: 0 4px 14px rgba(147, 197, 253, 0.45);
        }

        /* Nội dung chi tiết mặt trước */
        .warm-body {
          padding: 18px 22px 20px;
          display: flex;
          flex-direction: column;
          flex: 1;
          gap: 12px;
          justify-content: space-between;
        }

        .warm-title {
          font-size: 20px;
          font-weight: 850;
          color: #17324D;
          margin: 0 0 6px;
          line-height: 1.3;
          letter-spacing: -0.01em;
        }

        .warm-farm {
          font-size: 13px;
          color: #577189;
          margin: 0 0 8px;
          line-height: 1.45;
        }

        .warm-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin: 6px 0 10px;
        }

        .warm-tag {
          font-size: 11px;
          font-weight: 700;
          padding: 3px 9px;
          border-radius: 6px;
          background: rgba(147, 197, 253, 0.1);
          border: 1px solid rgba(147, 197, 253, 0.3);
          color: #1E40AF;
        }

        .warm-story-snippet {
          font-size: 12.5px;
          line-height: 1.55;
          color: #35536E;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .warm-price-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          background: rgba(147, 197, 253, 0.65);
          border-radius: 12px;
          border: 1px solid rgba(147, 197, 253, 0.35);
          box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.5);
          margin-top: 4px;
        }

        .warm-price-label {
          font-size: 12px;
          color: #577189;
          font-weight: 600;
        }

        .warm-price-val {
          font-size: 22px;
          font-weight: 900;
          color: #1E40AF;
          text-shadow: 0 0 14px rgba(147, 197, 253, 0.55);
        }

        .warm-hover-hint {
          text-align: center;
          font-size: 11.5px;
          color: #1E40AF;
          background: rgba(147, 197, 253, 0.1);
          border: 1px dashed rgba(147, 197, 253, 0.35);
          border-radius: 8px;
          padding: 6px 10px;
          font-weight: 650;
        }

        /* Khung mặt sau (Hộ chiếu số QR) */
        .warm-qr-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px 18px;
          flex: 1;
          text-align: center;
        }

        .warm-qr-plate {
          background: #FFFFFF;
          padding: 12px;
          border-radius: 14px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5), 0 0 20px rgba(147, 197, 253, 0.35);
          margin-bottom: 16px;
        }

        .warm-back-title {
          font-size: 16.5px;
          font-weight: 800;
          color: #17324D;
          margin: 0 0 8px;
        }

        .warm-back-desc {
          font-size: 12px;
          color: #577189;
          line-height: 1.5;
          margin: 0 auto 16px;
          max-width: 280px;
        }

        .warm-btn-action {
          width: 100%;
          background: linear-gradient(135deg, #93C5FD 0%, #93C5FD 100%);
          color: #17324D !important;
          border: none;
          border-radius: 12px;
          padding: 11px 16px;
          font-size: 14px;
          font-weight: 850;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          text-decoration: none !important;
          box-shadow: 0 0 20px rgba(147, 197, 253, 0.45);
          transition: all 0.2s ease;
        }

        .warm-btn-action:hover {
          background: linear-gradient(135deg, #93C5FD 0%, #93C5FD 100%);
          box-shadow: 0 0 28px rgba(147, 197, 253, 0.7);
          transform: translateY(-2px);
        }

        @media (max-width: 860px) {
          .featured-flip-scene {
            width: min(100%, 460px);
          }

          .featured-flip-card {
            min-height: 560px;
          }

          .warm-stage {
            height: clamp(250px, 62vw, 340px);
          }
        }

        @media (max-width: 480px) {
          .featured-flip-card {
            min-height: 520px;
          }

          .warm-stage {
            height: clamp(220px, 60vw, 280px);
          }

          .warm-body {
            padding: 14px;
          }

          .warm-price-row {
            gap: 8px;
            padding: 10px;
          }

          .warm-price-val {
            font-size: 20px;
          }
        }
      `}</style>

      {/* Element 226 Background Grid & Beams */}
      <div className="u226-gd" aria-hidden="true" />
      <div className="u226-gl" aria-hidden="true" />
      <canvas ref={canvasRef} className="u226-cv" aria-hidden="true" />
      <div className="u226-glow" aria-hidden="true" />

      {/* Element 363 Dot Grid Waves from cursor */}
      <DotGridWaves />

      {/* Replay Button to watch entrance order again */}
      <button
        type="button"
        className="u216-re"
        aria-label="Xem lại hiệu ứng mở màn / Replay entrance animation"
        title={heroT.replay}
        onClick={play}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 12 12"
          aria-hidden="true"
        >
          <path
            d="M2.2 6a3.8 3.8 0 1 0 1.1-2.7M2 1.6v2.2h2.2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>{heroT.replay}</span>
      </button>

      <div className="hero-inner" style={{ position: "relative", zIndex: 2 }}>
        <div className="hc">
          {/* 1. Badge settles in */}
          <div className="hero-pill" data-s style={{ "--d": 160 }}>
            <span>{heroT.pill}</span>
          </div>

          {/* 2. Headline with staggered sliding words */}
          <h1
            className="u216-h"
            aria-label={headlineLines.map((l) => l.join(" ")).join(" ")}
          >
            {headlineLines.map((line, lIdx) => (
              <span key={lIdx} className="u216-ln">
                {line.map((word, wIdx) => (
                  <span key={wIdx} className="u216-w">
                    <span style={{ "--d": wordDelayMap[lIdx]?.[wIdx] || 280 }}>
                      {word}
                    </span>
                    {wIdx < line.length - 1 && " "}
                  </span>
                ))}
              </span>
            ))}
          </h1>

          {/* 3. Description rises */}
          <p className="lead" data-s style={{ "--d": 720 }}>
            {heroT.lead}
          </p>

          {/* 4. Action buttons rise */}
          <div className="row" data-s style={{ "--d": 840 }}>
            <a className="btn white" href="#san-pham">
              {heroT.ctaShop}
            </a>
            <Link className="btn ghost" href="/diary">
              {heroT.ctaDiary}
            </Link>
          </div>

          {/* 5. Metrics rise */}
          <div
            className="hero-metrics"
            data-s
            style={{ "--d": 920, gridTemplateColumns: "repeat(2, 1fr)" }}
          >
            <div className="hero-metric">
              <b>{heroT.metricOcop}</b>
            </div>
            <div className="hero-metric">
              <b>{heroT.metricQr}</b>
            </div>
          </div>
        </div>

        {/* 6. Thẻ Sản Phẩm Nổi Bật Dạng Lật 2 Mặt (Interactive Flip Card) */}
        <div
          className="pass featured-flip-scene"
          data-s
          style={{ "--d": 1000 }}
          aria-label={featured ? `Thẻ lật sản phẩm nổi bật ${featured.name}` : "Sản phẩm nổi bật OCOP"}
        >
          {featured && (
            <>
              {/* Bóng đổ sàn phản chiếu ánh hổ phách */}
              <div className="featured-flip-floor-shadow" aria-hidden="true" />

              {/* Thẻ lật 2 mặt - Click chuột để lật nhanh */}
              <div
                className={`featured-flip-card ${isFlipped ? "is-flipped" : ""}`}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                {/* MẶT TRƯỚC: Trưng bày sản phẩm tông màu ấm & hình ảnh sắc nét */}
                <div className="card-3d-face face-front">
                  <div className="warm-header">
                    <div className="warm-pill">
                      <span className="warm-dot" />
                      <span>{heroT.featuredBadge}</span>
                    </div>
                    <span className="warm-lot">Lô {featured.lot || "CDQ-2026"}</span>
                  </div>

                  <div className="warm-stage">
                    {featuredPhoto ? (
                      <img
                        src={featuredPhoto}
                        alt={`Ảnh sản phẩm ${featured.name}`}
                        className="warm-img"
                        loading="eager"
                      />
                    ) : (
                      <div style={{ textAlign: "center", padding: 20 }}>
                        <span style={{ fontSize: 56 }}>🍫</span>
                        <p style={{ margin: "6px 0 0", color: "#17324D", fontSize: 13, fontWeight: 700 }}>
                          {featured.name}
                        </p>
                      </div>
                    )}
                    <span className="warm-star-badge">✓ OCOP {featured.certs || "4 sao"}</span>
                  </div>

                  <div className="warm-body">
                    <div>
                      <h3 className="warm-title" style={{ fontSize: 21, fontWeight: 900, marginBottom: 4 }}>
                        {featured.name}
                      </h3>
                      <p className="warm-farm" style={{ fontSize: 13.5, color: "#577189", margin: 0 }}>
                        {featured.farm || "Cơ sở sản xuất OCOP Đồng Nai"}
                      </p>
                    </div>

                    <div>
                      <div className="warm-price-row" style={{ marginTop: 8 }}>
                        <span className="warm-price-label">{heroT.priceLabel}</span>
                        <strong className="warm-price-val">
                          {Number(featured.price || 145000).toLocaleString("vi-VN")}đ
                        </strong>
                      </div>

                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 10 }}>
                        <Link
                          href={`/p/${featured.id}`}
                          className="warm-btn-action"
                          style={{ flex: 1, padding: "12px 16px", fontSize: 14 }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          Xem Hộ chiếu số →
                        </Link>
                        <button
                          type="button"
                          className="alt btn"
                          style={{
                            fontSize: 13,
                            padding: "11px 16px",
                            borderRadius: 12,
                            background: "rgba(147, 197, 253, 0.12)",
                            color: "#17324D",
                            border: "1px solid rgba(147, 197, 253, 0.4)",
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                            boxShadow: "0 0 12px rgba(147, 197, 253, 0.15)",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsFlipped(!isFlipped);
                          }}
                          title="Bấm để lật thẻ xem mã QR"
                        >
                          🔄 Lật QR
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* MẶT SAU: Hộ chiếu số OCOP & Mã QR động */}
                <div className="card-3d-face face-back">
                  <div className="warm-header">
                    <div className="warm-pill">
                      <span className="warm-dot-mint" />
                      <span>{heroT.backBadge}</span>
                    </div>
                    <span className="warm-lot">Lô {featured.lot || "CDQ-2026"}</span>
                  </div>

                  <div className="warm-qr-box">
                    <div className="warm-qr-plate">
                      <ProductQR product={featured} size={210} />
                    </div>
                    <h4 className="warm-back-title">{featured.name}</h4>
                    <p className="warm-back-desc">
                      {heroT.backDesc}
                    </p>
                    <Link
                      href={`/p/${featured.id}`}
                      className="warm-btn-action"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {heroT.viewDetail}
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
