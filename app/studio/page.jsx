"use client";
import { useState } from "react";
import Link from "next/link";
import { useDB, slim, fmt } from "@/lib/store";
import LoginNotice from "@/components/LoginNotice";
import { check } from "@/lib/guard";
import VideoCreator from "@/components/VideoCreator";

const K = [
  ["desc", "Mô tả sản phẩm chuẩn sàn TMĐT"],
  ["post", "Bài đăng Facebook / Zalo / TikTok"],
  ["live", "Kịch bản livestream 10 phút"],
  ["en", "Bản tiếng Anh (tiếp cận khách du lịch / xuất khẩu)"],
  ["tags", "Từ khóa, hashtag & khung giờ đăng"],
];

const GOLDEN_HOURS = [
  {
    time: "07:00 – 08:30",
    label: "Sáng sớm",
    icon: "🌅",
    target: "Chào ngày mới",
    desc: "Giới thiệu nguyên liệu sạch cho gia đình, trà & cà phê nguyên chất.",
    channel: "Facebook / Zalo Feed",
  },
  {
    time: "11:30 – 13:00",
    label: "Nghỉ trưa (Giờ Vàng)",
    icon: "☀️",
    target: "Săn deal TMĐT & Quà biếu",
    desc: "Lượng truy cập Shopee & TikTok Shop cao nhất, khách chốt đơn ăn vặt & quà tặng.",
    channel: "Shopee / TikTok Shop / Zalo",
    hot: true,
  },
  {
    time: "19:30 – 21:30",
    label: "Giờ Kim Cương",
    icon: "🌆",
    target: "Livestream & Tương tác cao nhất",
    desc: "Khách hàng rảnh rỗi xem livestream, nghe câu chuyện nhà vườn và đặt mua trực tiếp.",
    channel: "TikTok Live / Facebook Live",
    hot: true,
  },
  {
    time: "21:30 – 22:30",
    label: "Lướt đêm",
    icon: "🌙",
    target: "Video ngắn thư giãn",
    desc: "Reels / TikTok quy trình đóng hộp, thu hoạch vườn đêm, đơn hàng sáng mai.",
    channel: "TikTok / Reels / Shorts",
  },
];

export default function Studio() {
  const [db, save] = useDB();
  const [pid, setPid] = useState("");
  const [dr, setDr] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [approver, setApprover] = useState("");

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

  const defaultDraft = (prod) => ({
    desc: prod.story || `Sản phẩm ${prod.name} đạt chứng nhận ${prod.certs || "OCOP Đồng Nai"}. Quy trình sản xuất đạt chuẩn an toàn, kiểm soát minh bạch từ nông trại ${prod.farm || "Đồng Nai"}.`,
    post: `🌿 Khám phá hương vị đặc sản Đồng Nai: ${prod.name}!\n✓ Cơ sở sản xuất: ${prod.farm || "Đồng Nai"}\n✓ Tiêu chuẩn: ${prod.certs || "OCOP chuẩn hóa"}\n👉 Quét mã QR Hộ chiếu số trên sản phẩm để kiểm chứng toàn bộ nhật ký vườn và nguồn gốc nông sản!`,
    live: `[00:00 - 02:00] Chào mừng mọi người đến với phiên livestream đặc sản Đồng Nai hôm nay! Trên tay em là ${prod.name} vừa thu hoạch tại ${prod.farm || "vườn Đồng Nai"}...\n[02:00 - 06:00] Cho khách xem ảnh thật và nhật ký ghi chép GPS tại vườn qua mã QR...\n[06:00 - 10:00] Báo giá ưu đãi độc quyền hôm nay và hướng dẫn quét QR chốt đơn ngay!`,
    en: `Authentic Dong Nai OCOP specialty: ${prod.name}. Cultivated with care by ${prod.farm || "local farms"}. Scan the Digital Passport QR code for verified farm diary entries.`,
    tags: `#OCOP #DongNai #${prod.id} #NongSanSach #DacSanVietNam`,
    source: "template",
  });

  const shown = dr || p.content || defaultDraft(p);
  const isApproved = !dr && p.content?.approved;
  const currentApprover = approver || p.farm || "Chủ cơ sở OCOP";

  // Kiểm tra cảnh báo từ ngữ quảng cáo quá đà trên tất cả các trường nội dung
  const allText = shown ? K.map(([k]) => shown[k] || "").join(" ") : "";
  const warns = check(allText);

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
    if (warns.length > 0) {
      setMsg("Chưa thể duyệt! Vui lòng sửa lại các từ ngữ quảng cáo bị cảnh báo đỏ.");
      return;
    }
    const current = dr || p.content || defaultDraft(p);
    save((d) => {
      const target = d.products.find((x) => x.id === p.id);
      if (target) {
        target.content = {
          ...current,
          approved: true,
          approvedBy: currentApprover,
          at: Date.now(),
        };
      }
    });
    setDr(null);
    setMsg(`✓ Chủ cơ sở (${currentApprover}) đã duyệt và lưu chính thức bản nội dung.`);
  };

  const autoFixWarnings = () => {
    const current = dr || p.content || defaultDraft(p);
    let next = { ...current };
    for (const [k] of K) {
      if (typeof next[k] === "string") {
        next[k] = next[k]
          .replace(/chữa (khỏi|bệnh|dứt điểm|hoàn toàn)/gi, "hỗ trợ tăng cường sức khỏe")
          .replace(/điều trị|trị (bệnh|ung thư|dứt điểm|khỏi)/gi, "bổ sung dinh dưỡng tự nhiên")
          .replace(/thần dược|thuốc tiên|thần hiệu|cải lão hoàn đồng/gi, "đặc sản tự nhiên giàu dưỡng chất")
          .replace(/ngừa (ung thư|bệnh)/gi, "thanh nhiệt và bồi bổ cơ thể")
          .replace(/100%\s*(khỏi|hết bệnh|chữa khỏi|an toàn tuyệt đối)/gi, "an toàn đạt chuẩn OCOP")
          .replace(/số\s*1\s*(việt nam|thế giới|thị trường)?/gi, "đặc sản tiêu biểu Đồng Nai")
          .replace(/tốt nhất\s*(thị trường|việt nam)?/gi, "đạt chứng nhận OCOP chuẩn hóa")
          .replace(/duy nhất\s*(có một không hai)?/gi, "đậm đà hương vị truyền thống");
      }
    }
    setDr(next);
    setMsg("✓ Đã tự động thay thế các cụm từ quảng cáo quá đà bằng ngôn từ chuẩn mực OCOP.");
  };

  const insertGoldenHour = (hour) => {
    const current = dr || p.content || defaultDraft(p);
    const addText = `\n⏰ Khung giờ đăng gợi ý: ${hour.time} (${hour.label} - ${hour.channel})`;
    setDr({
      ...current,
      tags: (current.tags || "") + addText,
      post: (current.post || "") + `\n(Khung giờ đăng gợi ý: ${hour.time} - ${hour.label})`,
    });
    setMsg(`✓ Đã chèn khung giờ vàng [${hour.time}] vào bài đăng.`);
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
          <h1>Trợ lý bán hàng AI & Kiểm soát nội dung</h1>
          <p className="lead">
            Chỉ viết dựa trên dữ liệu thật từ nhật ký số. Tích hợp bộ lọc kiểm soát từ ngữ quảng cáo và cơ chế Chủ cơ sở ký duyệt bản nháp.
          </p>
        </div>
        <Link className="alt btn" href="/">
          ← Quay lại trang chính
        </Link>
      </div>
      <LoginNotice />

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
          {/* Header trạng thái & Cụm nút duyệt */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                <span className={`badge ${dr ? "" : "ok"}`} style={{ fontSize: 13, padding: "4px 10px" }}>
                  {dr ? "📝 Bản nháp · Chờ chủ cơ sở duyệt" : "✓ Đã duyệt chính thức"}
                </span>
                {!dr && shown.approvedBy && (
                  <span
                    style={{
                      background: "rgba(30, 64, 175, 0.12)",
                      color: "#1E40AF",
                      border: "1px solid rgba(147, 197, 253, 0.45)",
                      padding: "3px 10px",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 750,
                    }}
                  >
                    ✍️ Người duyệt: {shown.approvedBy} ({fmt(shown.at || Date.now())})
                  </span>
                )}
              </div>
              <span className="mute" style={{ fontSize: 12.5 }}>
                {dr ? (dr.source === "ai" ? "Soạn bởi Trợ lý AI (theo dữ liệu nhật ký thực tế)" : "Soạn bằng mẫu câu chuẩn hóa") : "Đã lưu chính thức vào hồ sơ tiếp thị sản phẩm"}
              </span>
            </div>

            {/* Cụm nút hành động chính */}
            <div className="row" style={{ marginTop: 0, gap: 10, alignItems: "center" }}>
              {isApproved && !dr ? (
                <button
                  className="alt"
                  onClick={() => setDr({ ...shown })}
                  style={{ fontWeight: 700 }}
                  title="Mở bản nháp để chỉnh sửa và duyệt lại"
                >
                  ✏️ Chỉnh sửa bản nháp
                </button>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <input
                    aria-label="Tên chủ cơ sở duyệt"
                    placeholder="Tên chủ cơ sở duyệt..."
                    value={approver}
                    onChange={(e) => setApprover(e.target.value)}
                    style={{
                      width: 170,
                      padding: "7px 10px",
                      fontSize: 12.5,
                      borderRadius: 8,
                      display: "inline-block",
                    }}
                    title="Nhập tên người đại diện cơ sở duyệt nội dung"
                  />
                  <button
                    onClick={approve}
                    disabled={warns.length > 0}
                    style={{
                      background: warns.length > 0 ? "rgba(239, 68, 68, 0.15)" : "var(--blue-dark)",
                      color: warns.length > 0 ? "#DC2626" : "#FFFFFF",
                      border: warns.length > 0 ? "1.5px solid #EF4444" : "none",
                      cursor: warns.length > 0 ? "not-allowed" : "pointer",
                      padding: "8px 16px",
                      fontWeight: 800,
                    }}
                    title={warns.length > 0 ? "Vui lòng xóa các từ ngữ bị cảnh báo đỏ trước khi duyệt" : "Chủ cơ sở ký duyệt bản nháp này"}
                  >
                    ✍️ Chủ cơ sở duyệt bản nháp
                  </button>
                </div>
              )}
              <button className="alt" onClick={copy} title="Sao chép tất cả nội dung">
                📋 Sao chép tất cả
              </button>
            </div>
          </div>

          {/* BỘ LỌC CẢNH BÁO ĐỎ: CÁC TỪ NGỮ QUẢNG CÁO QUÁ ĐÀ */}
          {warns.length > 0 ? (
            <div
              role="alert"
              style={{
                background: "#FEF2F2",
                border: "2px solid #EF4444",
                borderRadius: 14,
                padding: "16px 20px",
                marginBottom: 20,
                color: "#991B1B",
                boxShadow: "0 4px 16px rgba(239, 68, 68, 0.15)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 24, lineHeight: 1 }}>🚨</span>
                  <strong style={{ fontSize: 15.5, color: "#DC2626", letterSpacing: "-0.01em" }}>
                    CẢNH BÁO ĐỎ: PHÁT HIỆN TỪ NGỮ QUẢNG CÁO QUÁ ĐÀ / VI PHẠM LUẬT QUẢNG CÁO
                  </strong>
                </div>
                {dr && (
                  <button
                    type="button"
                    onClick={autoFixWarnings}
                    style={{
                      background: "#DC2626",
                      color: "#FFFFFF",
                      padding: "6px 14px",
                      borderRadius: 8,
                      fontSize: 12.5,
                      fontWeight: 800,
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    ⚡ Tự động loại bỏ từ ngữ vi phạm
                  </button>
                )}
              </div>

              <p style={{ margin: "0 0 10px", fontSize: 13.5, lineHeight: 1.55 }}>
                Hệ thống phát hiện {warns.length} cụm từ vi phạm quy định về quảng cáo nông sản & thực phẩm OCOP (tuyên bố y tế, thổi phồng công dụng hoặc khẳng định tuyệt đối):
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                {warns.map((w, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: "#DC2626",
                      color: "#FFFFFF",
                      padding: "3px 10px",
                      borderRadius: 6,
                      fontWeight: 800,
                      fontSize: 12.5,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      boxShadow: "0 1px 4px rgba(220, 38, 38, 0.3)",
                    }}
                  >
                    ✕ “{w}”
                  </span>
                ))}
              </div>

              <div style={{ fontSize: 12.5, color: "#7F1D1D", lineHeight: 1.5, background: "rgba(254, 226, 226, 0.6)", padding: "8px 12px", borderRadius: 8 }}>
                ⚖️ <b>Căn cứ quy định:</b> Nghị định 38/2021/NĐ-CP và Luật Quảng cáo nghiêm cấm quảng cáo thực phẩm, nông sản bằng các từ ngữ <i>“chữa bệnh”, “trị dứt điểm”, “thần dược”, “số 1”</i> gây hiểu nhầm như thuốc chữa bệnh. Bạn phải chỉnh sửa hoặc bấm <b>“Tự động loại bỏ”</b> để mở khóa nút Duyệt.
              </div>
            </div>
          ) : (
            <div
              style={{
                background: "rgba(16, 185, 129, 0.08)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                borderRadius: 10,
                padding: "8px 14px",
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12.5,
                color: "#065F46",
                fontWeight: 650,
              }}
            >
              <span>✓</span>
              <span>Bộ lọc an toàn: Nội dung không chứa từ ngữ quảng cáo quá đà, đạt chuẩn quy định kiểm duyệt OCOP.</span>
            </div>
          )}

          {/* CÁC Ô BIÊN TẬP NỘI DUNG */}
          {K.map(([k, l]) => {
            const hasWarn = check(shown[k] || "").length > 0;
            return (
              <div key={k} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <label htmlFor={k} style={{ margin: 0, fontWeight: 700, fontSize: 13.5 }}>
                    {l}
                  </label>
                  {hasWarn && (
                    <span style={{ fontSize: 11.5, color: "#DC2626", fontWeight: 750 }}>
                      ⚠️ Chứa từ vi phạm ở mục này
                    </span>
                  )}
                </div>
                <textarea
                  id={k}
                  value={shown[k] || ""}
                  rows={k === "live" ? 8 : 4}
                  onChange={(e) => {
                    const current = dr || p.content || defaultDraft(p);
                    setDr({ ...current, [k]: e.target.value });
                  }}
                  style={{
                    border: hasWarn ? "2px solid #EF4444" : undefined,
                    background: hasWarn ? "#FFF5F5" : undefined,
                    borderRadius: 10,
                    width: "100%",
                  }}
                />
              </div>
            );
          })}

          {/* KHỐI GỢI Ý KHUNG GIỜ VÀNG ĐĂNG BÀI */}
          <div
            style={{
              marginTop: 22,
              padding: "18px 20px",
              background: "linear-gradient(135deg, rgba(29, 78, 216, 0.05), rgba(147, 197, 253, 0.1))",
              border: "1.5px solid rgba(29, 78, 216, 0.2)",
              borderRadius: 14,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "var(--ink)", display: "flex", alignItems: "center", gap: 6 }}>
                  <span>🕒</span>
                  <span>Gợi ý khung giờ vàng đăng bài OCOP</span>
                </h3>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--mute)" }}>
                  Các khung giờ đạt lượng tiếp cận và chuyển đổi đơn hàng cao nhất trong ngày
                </p>
              </div>
              <span
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: "#1E40AF",
                  background: "rgba(30, 64, 175, 0.1)",
                  padding: "3px 10px",
                  borderRadius: 99,
                }}
              >
                📅 Ngày vàng: Thứ Sáu · Thứ Bảy · Chủ Nhật
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
              {GOLDEN_HOURS.map((h, i) => (
                <div
                  key={i}
                  style={{
                    background: "#FFFFFF",
                    border: h.hot ? "1.5px solid #38BDF8" : "1px solid rgba(29, 78, 216, 0.16)",
                    borderRadius: 12,
                    padding: "12px 14px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxShadow: h.hot ? "0 4px 12px rgba(56, 189, 248, 0.16)" : "0 2px 6px rgba(0,0,0,0.04)",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: "#1E40AF" }}>
                        {h.icon} {h.time}
                      </span>
                      {h.hot && (
                        <span style={{ fontSize: 10, background: "#EF4444", color: "#FFF", padding: "1px 6px", borderRadius: 99, fontWeight: 800 }}>
                          HOT
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)", marginBottom: 3 }}>
                      {h.label} ({h.target})
                    </div>
                    <p style={{ margin: "0 0 8px", fontSize: 11.5, color: "var(--mute)", lineHeight: 1.4 }}>
                      {h.desc}
                    </p>
                    <div style={{ fontSize: 10.5, color: "var(--blue-dark)", fontWeight: 650 }}>
                      Kênh: {h.channel}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="alt btn"
                    style={{ marginTop: 10, fontSize: 11.5, padding: "5px 10px", width: "100%", justifyContent: "center" }}
                    onClick={() => insertGoldenHour(h)}
                    title={`Bấm để chèn khung giờ ${h.time} vào bài đăng`}
                  >
                    + Chèn giờ này
                  </button>
                </div>
              ))}
            </div>
          </div>

          <p className="mute" style={{ marginTop: 14, fontSize: 12.5 }}>
            💡 Sau khi hoàn tất biên tập và đảm bảo không có cảnh báo đỏ, bấm <b>“✍️ Chủ cơ sở duyệt bản nháp”</b> ở trên để lưu chính thức vào cơ sở dữ liệu.
          </p>
        </div>
      )}

      <VideoCreator product={p} />
    </main>
  );
}
