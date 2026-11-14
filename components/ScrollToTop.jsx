"use client";

import { useEffect, useState } from "react";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 250) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Cuộn lên đầu trang"
      title="Cuộn lên đầu trang"
      className={`scroll-to-top-btn ${visible ? "is-visible" : ""}`}
    >
      <style jsx>{`
        .scroll-to-top-btn {
          position: fixed;
          bottom: 24px;
          right: 88px;
          z-index: 54;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 1.5px solid rgba(2, 151, 222, 0.28);
          background: rgba(255, 255, 255, 0.94);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          color: var(--blue, #0297DE);
          display: grid;
          place-items: center;
          cursor: pointer;
          box-shadow: 0 10px 24px -4px rgba(15, 23, 42, 0.12),
                      0 4px 12px rgba(2, 151, 222, 0.14);
          opacity: 0;
          pointer-events: none;
          transform: translateY(14px) scale(0.85);
          transition:
            opacity 0.28s cubic-bezier(0.2, 0.8, 0.2, 1),
            transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1),
            background 0.2s,
            color 0.2s,
            box-shadow 0.2s;
        }

        .scroll-to-top-btn.is-visible {
          opacity: 1;
          pointer-events: auto;
          transform: translateY(0) scale(1);
        }

        .scroll-to-top-btn:hover {
          background: var(--blue, #0297DE);
          color: #ffffff;
          border-color: var(--blue, #0297DE);
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 14px 30px -4px rgba(2, 132, 199, 0.35);
        }

        .scroll-to-top-btn:active {
          transform: translateY(0) scale(0.92);
        }

        .scroll-to-top-btn:focus-visible {
          outline: 2px solid var(--blue, #0297DE);
          outline-offset: 3px;
        }

        @media (max-width: 860px) {
          .scroll-to-top-btn {
            bottom: 74px;
            right: 80px;
            width: 44px;
            height: 44px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .scroll-to-top-btn {
            transition: none !important;
          }
        }
      `}</style>
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m18 15-6-6-6 6" />
      </svg>
    </button>
  );
}
