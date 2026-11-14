"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let observer = null;

    // Reveal all elements immediately on back/forward navigation
    const revealAll = () => {
      document.querySelectorAll(".reveal-init").forEach((el) => {
        el.classList.add("is-revealed");
      });
    };

    window.addEventListener("popstate", revealAll);

    const setupReveal = () => {
      const vh = window.innerHeight || 800;

      // Leaf targets to smoothly reveal on scroll
      const selectors = [
        "[data-reveal]",
        ".sec-head",
        ".product-card",
        ".grid > .card",
        ".grid-2 > .card",
        ".site-footer",
        ".gift-builder",
      ];

      const elements = Array.from(document.querySelectorAll(selectors.join(",")));

      if (observer) observer.disconnect();

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-revealed");
              observer.unobserve(entry.target);
            }
          });
        },
        {
          rootMargin: "0px 0px -40px 0px",
          threshold: 0.05,
        }
      );

      elements.forEach((el) => {
        // Never hide anything in hero or modals/drawers
        if (el.closest(".hero") || el.closest(".drawer") || el.closest(".modal")) {
          el.classList.add("is-revealed");
          return;
        }

        const rect = el.getBoundingClientRect();

        // If currently in viewport, reveal immediately
        if (rect.top < vh - 20) {
          el.classList.add("is-revealed");
          return;
        }

        // If below viewport and not yet revealed, apply reveal class
        if (!el.classList.contains("is-revealed") && !el.classList.contains("reveal-init")) {
          el.classList.add("reveal-init");

          const parent = el.parentElement;
          if (parent && (parent.classList.contains("grid") || parent.classList.contains("grid-2") || parent.classList.contains("store-grid"))) {
            const siblings = Array.from(parent.children);
            const index = siblings.indexOf(el);
            if (index > 0) {
              el.style.setProperty("--reveal-delay", `${Math.min(index * 80, 320)}ms`);
            }
          }
        }

        observer.observe(el);
      });
    };

    // Run setup after layout paint
    const timer = setTimeout(setupReveal, 60);

    // Safety fallback: ensure nothing stays stuck invisible
    const safetyTimer = setTimeout(revealAll, 1200);

    return () => {
      clearTimeout(timer);
      clearTimeout(safetyTimer);
      window.removeEventListener("popstate", revealAll);
      if (observer) observer.disconnect();
    };
  }, [pathname]);

  return null;
}
