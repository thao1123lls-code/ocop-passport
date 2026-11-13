"use client";
import { useState } from "react";
import Link from "next/link";
import { useDB, slim } from "@/lib/store";
import { check } from "@/lib/guard";
import VideoCreator from "@/components/VideoCreator";

const K = [
  ["desc", "Mô tả sản phẩm chuẩn sàn TMĐT"],
  ["post", "Bài đăng Facebook / Zalo / TikTok"],
  ["live", "Kịch bản livestream 10 phút"],
  ["en", "Bản tiếng Anh (tiếp cận khách du lịch / xuất khẩu)"],
  ["tags", "Từ khóa, hashtag & khung giờ đăng"],
];

export default function Studio() {
  const [db, save] = useDB();
  const [pid, setPid] = useState("");
  const [dr, setDr] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  if (!db) return <p className="w">Đang tải…</p>;

  const products = db?.products || [];
  if (products.length === 0) {
    return (
      <main className="w">
        <div className="page-head">
          <div>
            <h1>Trợ lý bán hàng & Tiếp thị số</h1>
            <p className="lead">Hệ thống chưa có sản phẩm nào. Hãy tạo sản phẩm tại Nhật ký số trước để AI có dữ liệu tạo nội dung tiếp thị.</p>
          </div>
          <div className="row" style={{ marginTop: 0 }}>
            <Link className="alt btn" href="/">← Quay lại trang chính</Link>
            <Link className="btn" href="/diary">+ Tạo sản phẩm tại Nhật ký</Link>
          </div>
        </div>
      </main>
    );
  }

  const p = products.find((x) => x.id === pid) || products[0];
  const shown = dr || p.content;
  const warns = shown ? check(K.map(([k]) => shown[k]).join(" ")) : [];

  const gen = async () => {
    setBusy(true);
    setMsg("");
    try {
      const r = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ product: slim(p) }),
      });
      const j = await r.json();
      if (!r.ok) setMsg(j.error);
      else setDr(j);
    } catch {
      setMsg("Không soạn được, kiểm tra kết nối.");
    }
    setBusy(false);
  };

  const approve = () => {
    save((d) => {
      d.products.find((x) => x.id === p.id).content = { ...dr, approved: true, at: Date.now() };
    });
    setDr(null);
    setMsg("Đã duyệt và lưu nội dung bán hàng.");
  };

  const copy = () =>
    navigator.clipboard
      .writeText(K.map(([k, l]) => `${l}\n${shown[k]}`).join("\n\n"))
      .then(
        () => setMsg("Đã sao chép toàn bộ nội dung."),
        () => setMsg("Không sao chép được."),
      );

  return (
    <main className="w">
      <div className="page-head">
        <div>
          <h1>Trợ lý bán hàng AI</h1>
          <p className="lead">
            Chỉ viết dựa trên dữ liệu thật trong nhật ký. Mọi nội dung ở trạng thái bản nháp chờ chủ cơ sở duyệt.
          </p>
        </div>
        <Link className="alt btn" href="/">
          ← Quay lại trang chính
        </Link>
      </div>

      <div className="card">
        <label htmlFor="sp">Chọn sản phẩm để soạn nội dung</label>
        <select
          id="sp"
          value={p.id}
          onChange={(e) => {
            setPid(e.target.value);
            setDr(null);
          }}
        >
          {db.products.map((x) => (
            <option key={x.id} value={x.id}>
              {x.name} ({x.entries.length} mốc nhật ký)
            </option>
          ))}
        </select>
        <div className="row">
          <button onClick={gen} disabled={busy || !p.entries.length}>
            {busy ? "Đang soạn từ nhật ký…" : "Soạn nội dung từ nhật ký"}
          </button>
          <span className="mute" role="status">
            {msg || (!p.entries.length ? "Cần ít nhất một mốc nhật ký." : "Sẵn sàng sinh mô tả, bài đăng, kịch bản livestream & bản tiếng Anh.")}
          </span>
        </div>
      </div>

      {shown && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
            <div>
              <span className={`badge ${dr ? "" : "ok"}`}>{dr ? "Bản nháp · Chờ chủ cơ sở duyệt" : "✓ Đã duyệt"}</span>
              <span className="mute">
                {dr ? (dr.source === "ai" ? "Soạn bằng AI" : "Soạn bằng mẫu câu (chưa cấu hình ANTHROPIC_API_KEY)") : "Đã lưu chính thức"}
              </span>
            </div>
            <div className="row" style={{ marginTop: 0 }}>
              {dr && (
                <button onClick={approve} disabled={warns.length > 0}>
                  Duyệt nội dung
                </button>
              )}
              <button className="alt" onClick={copy} disabled={!!dr}>
                Sao chép tất cả
              </button>
            </div>
          </div>

          {warns.length > 0 && (
            <p className="warn" role="alert">
              Cảnh báo cụm từ có thể vi phạm quy định quảng cáo: <b>{warns.join(", ")}</b>. Hãy chỉnh sửa trước khi duyệt.
            </p>
          )}

          {K.map(([k, l]) => (
            <div key={k}>
              <label htmlFor={k}>{l}</label>
              <textarea
                id={k}
                readOnly={!dr}
                value={shown[k]}
                rows={k === "live" ? 8 : 4}
                onChange={(e) => setDr({ ...dr, [k]: e.target.value })}
              />
            </div>
          ))}
          {dr && <p className="mute" style={{ marginTop: 10 }}>Bấm “Duyệt nội dung” ở trên để xác nhận và mở khóa nút Sao chép.</p>}
        </div>
      )}

      <VideoCreator product={p} />
    </main>
  );
}
