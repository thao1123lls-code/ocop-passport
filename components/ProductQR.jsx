"use client";
import { useEffect, useState } from "react";
import { slim, enc } from "@/lib/store";

export function getPassportUrl(product) {
  if (typeof window === "undefined" || !product) return "";
  const base = `${window.location.origin}/p/${product.id}`;
  try {
    const payload = encodeURIComponent(enc(slim(product)));
    return `${base}?d=${payload}`;
  } catch {
    return base;
  }
}

export default function ProductQR({ product, size = 160, showDownload = false }) {
  const [src, setSrc] = useState("");
  const [qrUrl, setQrUrl] = useState("");

  useEffect(() => {
    if (!product) return;
    // Short unique URL per product -> crisp, low-density standard QR matrix (#000000 on #FFFFFF)
    const shortUrl = `${window.location.origin}/p/${product.id}`;
    setQrUrl(shortUrl);
    let cancelled = false;
    import("qrcode")
      .then((QR) =>
        QR.toDataURL(shortUrl, {
          errorCorrectionLevel: "M",
          margin: 2,
          width: Math.max(240, size * 2),
          color: { dark: "#000000", light: "#FFFFFF" },
        }),
      )
      .then((dataUrl) => {
        if (!cancelled) setSrc(dataUrl);
      })
      .catch(() => {
        if (!cancelled) setSrc("");
      });
    return () => {
      cancelled = true;
    };
  }, [product, size]);

  if (!src) {
    return (
      <div
        style={{
          width: size,
          height: size,
          display: "grid",
          placeItems: "center",
          background: "#fff",
          borderRadius: 6,
          border: "1px solid var(--line)",
          fontSize: 12,
          color: "var(--mute)",
        }}
      >
        Đang tạo QR…
      </div>
    );
  }

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <img
        src={src}
        alt={`Mã QR hộ chiếu số của ${product.name}`}
        width={size}
        height={size}
        style={{
          background: "#FFFFFF",
          borderRadius: 6,
          display: "block",
          imageRendering: "pixelated",
        }}
      />
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          background: "rgba(30, 64, 175, 0.08)",
          color: "#1E40AF",
          border: "1px solid rgba(147, 197, 253, 0.45)",
          borderRadius: 99,
          padding: "3px 10px",
          fontSize: 11,
          fontWeight: 750,
          whiteSpace: "nowrap",
          letterSpacing: "0.02em",
          boxShadow: "0 1px 3px rgba(30, 64, 175, 0.06)",
        }}
        title="Dữ liệu nhật ký và nguồn gốc OCOP đã được Đoàn xã/phường thẩm định"
      >
        <span>🛡️</span>
        <span>Đã xác minh bởi Đoàn xã/phường</span>
      </div>
      {showDownload && (
        <a className="btn" download={`qr-${product.id}.png`} href={src} style={{ fontSize: 13.5, padding: "8px 14px" }}>
          Tải mã QR ({product.id})
        </a>
      )}
    </div>
  );
}
