"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLang } from "@/lib/i18n";

export default function NavBar() {
  const path = usePathname();
  const router = useRouter();
  const [count, setCount] = useState(0);
  const { lang, switchLang, t } = useLang();
  const [toastMsg, setToastMsg] = useState("");
  const toastTimeoutRef = useRef(null);
  const navigationFallbackRef = useRef(null);

  useEffect(() => {
    if (navigationFallbackRef.current) {
      clearTimeout(navigationFallbackRef.current);
      navigationFallbackRef.current = null;
    }
  }, [path]);

  useEffect(() => () => {
    if (navigationFallbackRef.current) clearTimeout(navigationFallbackRef.current);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
  }, []);

  useEffect(() => {
    const read = () => {
      try {
        const items = JSON.parse(localStorage.getItem("ocop-bag-v1") || "[]");
        setCount(Array.isArray(items) ? items.reduce((s, x) => s + (x.qty || 1), 0) : 0);
      } catch {
        setCount(0);
      }
    };
    read();
    window.addEventListener("ocop-bag", read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener("ocop-bag", read);
      window.removeEventListener("storage", read);
    };
  }, []);

  const handleSwitchLang = (target) => {
    if (lang === target) return;
    switchLang(target);
    const msg = target === "vi" ? "🇻🇳 Đã chuyển sang Tiếng Việt" : "🇬🇧 Switched to English";
    setToastMsg(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToastMsg(""), 2000);
  };

  const navT = t.nav;
  const LINKS = [
    ["/", navT.home],
    ["/diary", navT.diary],
    ["/studio", navT.ai],
    ["/dashboard", navT.dashboard],
  ];

  const openBag = () => {
    if (path !== "/") {
      router.push("/#san-pham");
      setTimeout(() => window.dispatchEvent(new Event("ocop-open-bag")), 350);
    } else {
      window.dispatchEvent(new Event("ocop-open-bag"));
    }
  };

  return (
    <div className="topbar-wrap">
      <nav className="topbar" aria-label="Điều hướng chính">
        {/* Brand logo: Cyan rounded icon with black QR + OCOP Passport text */}
        <Link
          className="brand"
          href="/"
          title="OCOP Passport"
          aria-label="OCOP Passport — Trang chính"
          onClick={(event) => {
            if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || path === "/") return;
            navigationFallbackRef.current = setTimeout(() => {
              if (window.location.pathname !== "/") window.location.assign("/");
            }, 1400);
          }}
        >
          <span className="brand-qr-box" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="6" height="6" rx="1.5" />
              <rect x="15" y="3" width="6" height="6" rx="1.5" />
              <rect x="3" y="15" width="6" height="6" rx="1.5" />
              <circle cx="6" cy="6" r="1" fill="#0F172A" stroke="none" />
              <circle cx="18" cy="6" r="1" fill="#0F172A" stroke="none" />
              <circle cx="6" cy="18" r="1" fill="#0F172A" stroke="none" />
              <path d="M15 15h2v2h-2zM19 19h2v2h-2zM19 15h2v2h-2zM15 19h2v2h-2z" />
            </svg>
          </span>
          <span className="brand-name">
            <span className="brand-name-white">OCOP </span>
            <span className="brand-name-cyan">Passport</span>
          </span>
        </Link>

        {/* Center navigation links */}
        <div className="nav-links">
          {LINKS.map(([href, label]) => {
            const active = href === "/" ? path === "/" : path?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                title={label}
                aria-label={label}
                className={`nav-link${active ? " active" : ""}`}
                aria-current={active ? "page" : undefined}
                onClick={(event) => {
                  if (active || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                  navigationFallbackRef.current = setTimeout(() => {
                    if (window.location.pathname !== href) window.location.assign(href);
                  }, 1400);
                }}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Right side controls: Language switcher + Lock/Dashboard button */}
        <div className="nav-actions">
          {count > 0 && (
            <button
              type="button"
              onClick={openBag}
              title={`${navT.bag} (${count})`}
              aria-label={`${navT.bag} (${count})`}
              className="nav-bag"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 7h12l1 13H5L6 7z" />
                <path d="M9 7V5a3 3 0 0 1 6 0v2" />
              </svg>
              <span className="nav-bag-badge">{count}</span>
            </button>
          )}

          {/* Compact language switcher */}
          <div className="lang-switcher-capsule" role="group" aria-label="Chọn ngôn ngữ / Select language">
            <button type="button" className="lang-capsule-btn active" onClick={() => handleSwitchLang(lang === "vi" ? "en" : "vi")} aria-label={lang === "vi" ? "Switch to English" : "Chuyển sang tiếng Việt"} title={lang === "vi" ? "Switch to English" : "Chuyển sang tiếng Việt"}>
              {lang === "vi" ? "VI" : "EN"}
            </button>
          </div>

          {/* Lock Icon button for Admin Dashboard Login */}
          <Link
            href="/dashboard"
            className={`nav-lock-btn ${path?.startsWith("/dashboard") ? "active" : ""}`}
            title="Bảng điều khiển quản trị OCOP / Admin Dashboard"
            aria-label="Admin Dashboard"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </Link>
        </div>

        {/* Thông báo nổi khi chuyển đổi ngôn ngữ */}
        {toastMsg && (
          <div className="lang-toast" role="status" aria-live="polite">
            {toastMsg}
          </div>
        )}
      </nav>
    </div>
  );
}

