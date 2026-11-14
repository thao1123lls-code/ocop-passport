/** @type {import('next').NextConfig} */
const nextConfig = {
  // Bật nén Gzip & Brotli tự động cho tất cả HTML, CSS, JS, SVG, JSON
  compress: true,

  // Tắt header x-powered-by để giảm dung lượng gói tin và tăng bảo mật
  poweredByHeader: false,

  // Bật React Strict Mode để tối ưu hóa render
  reactStrictMode: true,

  // Cấu hình HTTP Headers tăng tốc bộ nhớ đệm (Browser Cache)
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:all*(svg|jpg|jpeg|png|webp|ico|json)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
