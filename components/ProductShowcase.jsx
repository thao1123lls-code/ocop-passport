"use client";
import Link from "next/link";
import { useDB } from "@/lib/store";

export default function ProductShowcase() {
  const [db] = useDB();
  const products = db?.products || [];

  return (
    <section aria-labelledby="showcase-title">
      <div className="sec-head">
        <div>
          <span className="badge">Gian hàng & Hộ chiếu mẫu</span>
          <h2 id="showcase-title" style={{ marginTop: 6 }}>
            Sản phẩm OCOP Đồng Nai đã số hóa
          </h2>
        </div>
        <Link className="alt btn" href="/diary">
          + Thêm sản phẩm mới
        </Link>
      </div>
      <div className="grid">
        {products.map((p) => (
          <Link
            key={p.id}
            href={`/p/${p.id}`}
            className="card card-hover"
            style={{ color: "inherit", display: "flex", flexDirection: "column", justifyContent: "space-between", margin: 0 }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <span className="badge">Lô {p.lot || "-"}</span>
                {p.verified ? (
                  <span className="badge ok">✓ Đã xác minh</span>
                ) : (
                  <span className="badge">Chờ xác minh</span>
                )}
              </div>
              <h3>{p.name}</h3>
              <p className="mute" style={{ margin: "4px 0 10px" }}>
                {p.farm || "Cơ sở OCOP Đồng Nai"}
              </p>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: "1px solid var(--line)", fontSize: 13 }}>
              <span className="mute">{p.entries.length} mốc nhật ký</span>
              <strong style={{ color: "var(--blue)" }}>Xem hộ chiếu →</strong>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
