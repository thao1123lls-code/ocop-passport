"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
export default function PWA() {
  const path = usePathname();
  useEffect(() => { if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") navigator.serviceWorker.register("/sw.js").catch(() => {}); }, []);
  useEffect(() => { const b = document.getElementById("prog"), f = () => { const h = document.documentElement.scrollHeight - innerHeight; b.style.transform = `scaleX(${h > 0 ? Math.min(scrollY / h, 1) : 0})`; }; f(); addEventListener("scroll", f, { passive: true }); return () => removeEventListener("scroll", f); }, [path]);
  useEffect(() => { if (!window.IntersectionObserver || matchMedia("(prefers-reduced-motion:reduce)").matches) return; const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12 }); document.querySelectorAll("[data-rv]").forEach((e, i) => { e.classList.add("rv"); e.style.transitionDelay = (i % 4) * .1 + "s"; io.observe(e); }); return () => io.disconnect(); }, [path]);
  return <div id="prog" />;
}
