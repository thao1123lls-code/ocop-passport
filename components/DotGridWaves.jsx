// Lucian UX/UI Prompt #363 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#363
"use client";

import { useRef, useEffect } from "react";

export default function DotGridWaves({
  global = false,
  className = "",
  gap = 22,
}) {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const cv = canvasRef.current;
    if (!root || !cv) return;
    const cx = cv.getContext("2d");
    if (!cx) return;

    const rm = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0;
    let H = 0;
    let dpr = 1;
    let dots = [];
    let waves = [];
    let lastAdd = 0;
    let vis = true;
    let raf = 0;

    const setupDots = () => {
      if (global) {
        W = Math.max(320, window.innerWidth || document.documentElement.clientWidth || 1024);
        H = Math.max(320, window.innerHeight || document.documentElement.clientHeight || 768);
      } else {
        const rect = root.getBoundingClientRect();
        W = Math.max(280, Math.floor(rect.width || 340));
        H = Math.max(240, Math.floor(rect.height || 330));
      }

      dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = W * dpr;
      cv.height = H * dpr;
      cx.resetTransform?.();
      cx.scale(dpr, dpr);

      dots = [];
      const actualGap = Math.max(16, gap);
      for (let y = actualGap; y < H - 4; y += actualGap) {
        for (let x = actualGap; x < W - 4; x += actualGap) {
          dots.push([x, y]);
        }
      }
    };

    setupDots();

    let ro;
    if (global) {
      window.addEventListener("resize", setupDots, { passive: true });
    } else {
      ro = new ResizeObserver(setupDots);
      ro.observe(root);
    }

    const addWave = (x, y, a) => {
      waves.push({ x, y, t: performance.now(), a });
      if (waves.length > 18) waves.shift();
    };

    const draw = (now) => {
      const idle = "rgba(255, 255, 255, 0.18)";
      cx.clearRect(0, 0, W, H);

      waves = waves.filter((w) => now - w.t < 2600);

      dots.forEach((d) => {
        let h = 0;
        waves.forEach((w) => {
          const age = (now - w.t) / 1000;
          const dist = Math.hypot(d[0] - w.x, d[1] - w.y);
          const front = age * 175;
          const k = dist - front;
          if (k > 0 || k < -95) return;
          // Prompt 363 Wave Physics: Exponential damping + harmonic wave propagation
          h += Math.sin(k / 14) * Math.exp(k / 60) * w.a * Math.exp(-age * 1.3);
        });

        const m = Math.max(-1, Math.min(1.6, h));
        const r = 1.6 + Math.max(0, m) * 3.4;
        const hue = 230 - Math.max(0, m) * 110;
        const calm = Math.abs(m) < 0.04;

        cx.globalAlpha = calm ? 0.45 : 1;
        cx.fillStyle = calm
          ? idle
          : `hsl(${hue.toFixed(0)} 85% ${(58 - Math.min(0, m) * 10).toFixed(0)}%)`;

        cx.beginPath();
        cx.arc(d[0], d[1] - m * 3, r, 0, 6.2832);
        cx.fill();
      });

      cx.globalAlpha = 1;
    };

    const frame = (now) => {
      raf = 0;
      if (!root.isConnected || !vis) return;
      draw(now);
      raf = requestAnimationFrame(frame);
    };

    const run = () => {
      if (rm) {
        draw(performance.now());
        return;
      }
      if (!raf && vis) {
        raf = requestAnimationFrame(frame);
      }
    };

    let io;
    if (!global && "IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (es) => {
          vis = es[0].isIntersecting;
          if (vis) {
            run();
          } else if (raf) {
            cancelAnimationFrame(raf);
            raf = 0;
          }
        },
        { threshold: 0.1 }
      );
      io.observe(root);
    }

    const onVisibilityChange = () => {
      if (document.hidden) {
        if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      } else if (vis) {
        run();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange, { passive: true });

    const loc = (e) => {
      if (global) {
        return [e.clientX, e.clientY];
      }
      const r = cv.getBoundingClientRect();
      const kX = W / (r.width || 1);
      const kY = H / (r.height || 1);
      return [(e.clientX - r.left) * kX, (e.clientY - r.top) * kY];
    };

    const handlePointerMove = (e) => {
      const now = performance.now();
      if (now - lastAdd < 100) return;
      lastAdd = now;
      const [x, y] = loc(e);
      addWave(x, y, 0.55);
      if (rm) draw(now + 300);
      else run();
    };

    const handlePointerDown = (e) => {
      const [x, y] = loc(e);
      // Big wave across the whole grid when clicked
      addWave(x, y, 1.8);
      if (rm) draw(performance.now() + 500);
      else run();
    };

    // Global listener on window or scoped listener on parent container
    const eventTarget = global ? window : (root?.parentElement || root);
    eventTarget.addEventListener("pointermove", handlePointerMove, { passive: true });
    eventTarget.addEventListener("pointerdown", handlePointerDown, { passive: true });

    run();

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (global) {
        window.removeEventListener("resize", setupDots);
      } else {
        ro?.disconnect();
        io?.disconnect();
      }
      eventTarget.removeEventListener("pointermove", handlePointerMove);
      eventTarget.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [gap, global]);

  return (
    <div
      ref={rootRef}
      className={`ux u363 ${global ? "u363-global" : "u363-box"} ${className}`}
      aria-hidden="true"
    >
      <style jsx>{`
        .u363-global {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100vw;
          height: 100vh;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }

        .u363-box {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }

        .u363-cv {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
        }

        @media (prefers-reduced-motion: reduce) {
          .u363-cv {
            animation: none !important;
          }
        }
      `}</style>
      <canvas ref={canvasRef} className="u363-cv" />
    </div>
  );
}
