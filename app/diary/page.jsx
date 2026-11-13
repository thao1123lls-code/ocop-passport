"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useDB, STAGES, slug, uid, fmt, fmtVND } from "@/lib/store";
import ProductQR from "@/components/ProductQR";
import JourneyShowcase from "@/components/JourneyShowcase";
import VoiceReactiveDotLoader from "@/components/VoiceReactiveDotLoader";

const shrink = (f) =>
  new Promise((ok) => {
    const r = new FileReader();
    r.onload = () => {
      const im = new Image();
      im.onload = () => {
        const k = Math.min(1, 800 / Math.max(im.width, im.height));
        const c = document.createElement("canvas");
        c.width = im.width * k;
        c.height = im.height * k;
        c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
        ok(c.toDataURL("image/jpeg", 0.65));
      };
      im.src = r.result;
    };
    r.readAsDataURL(f);
  });

const where = () =>
  new Promise((ok) =>
    navigator.geolocation
      ? navigator.geolocation.getCurrentPosition(
          (p) => ok([+p.coords.latitude.toFixed(5), +p.coords.longitude.toFixed(5)]),
          () => ok(null),
          { timeout: 4000 },
        )
      : ok(null),
  );

const F = [
  ["name", "Tên sản phẩm"],
  ["farm", "Cơ sở / hợp tác xã"],
  ["lot", "Mã lô"],
  ["weight", "Khối lượng"],
  ["ingredients", "Thành phần"],
  ["expiry", "Hạn sử dụng"],
  ["storage", "Bảo quản"],
  ["certs", "Chứng nhận (cách nhau dấu phẩy)"],
  ["shop", "Link gian hàng (https://…)"],
];

export default function Diary() {
  const [db, save] = useDB();
  const [pid, setPid] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const productSearchRef = useRef(null);
  const [st, setSt] = useState(2);
  const [txt, setTxt] = useState("");
  const [img, setImg] = useState(null);
  const [vol, setVol] = useState(false);
  const [msg, setMsg] = useState("");
  const [nn, setNn] = useState("");
  const [newPrice, setNewPrice] = useState(150000);
  const [voiceOpen, setVoiceOpen] = useState(true);
  const [audioRecord, setAudioRecord] = useState(null);
  const [on, setOn] = useState(true);

  useEffect(() => {
    const f = () => setOn(navigator.onLine);
    f();
    addEventListener("online", f);
    addEventListener("offline", f);
    return () => {
      removeEventListener("online", f);
      removeEventListener("offline", f);
    };
  }, []);

  if (!db) return <p className="w">Đang tải…</p>;

  const products = db?.products || [];

  const create = () => {
    if (!nn.trim()) return;
    const id = slug(nn);
    const priceVal = Number(newPrice) || 150000;
    save((d) => {
      d.products.push({
        id,
        name: nn.trim(),
        category: "Mật ong & Đặc sản",
        price: priceVal,
        promo: "Sản phẩm mới",
        farm: "",
        lot: uid().slice(-4).toUpperCase(),
        weight: "",
        ingredients: "",
        expiry: "",
        storage: "",
        certs: "",
        story: "",
        shop: "",
        verified: false,
        content: null,
        entries: [],
      });
    });
    setPid(id);
    setNn("");
    setMsg(`Đã tạo sản phẩm mới “${nn.trim()}” (${fmtVND(priceVal)}) kèm mã QR riêng (${id}).`);
  };

  if (products.length === 0) {
    return (
      <main className="w">
        <div className="page-head">
          <div>
            <h1>Nhật ký sản xuất OCOP</h1>
            <p className="lead">Hệ thống chưa có sản phẩm nào. Hãy tạo sản phẩm OCOP đầu tiên để bắt đầu ghi nhật ký và tạo hộ chiếu số.</p>
          </div>
          <div className="row" style={{ marginTop: 0 }}>
            <Link className="alt btn" href="/">← Quay lại trang chính</Link>
          </div>
        </div>

        <div className="card" style={{ maxWidth: 560, margin: "24px auto", textAlign: "center", padding: "36px 24px" }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>📦</div>
          <h2 style={{ margin: "0 0 8px" }}>Tạo sản phẩm OCOP đầu tiên</h2>
          <p className="mute" style={{ margin: "0 auto 20px", maxWidth: 440, fontSize: 14 }}>
            Nhập tên sản phẩm và kéo thanh trượt để chọn giá bán (VND). Hệ thống sẽ tự động tạo mã QR riêng, thẻ sản phẩm và hộ chiếu số.
          </p>
          <div style={{ display: "flex", gap: 8, maxWidth: 460, margin: "0 auto 16px", flexWrap: "wrap" }}>
            <input
              placeholder="Nhập tên sản phẩm OCOP..."
              value={nn}
              onChange={(e) => setNn(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && create()}
              style={{ flex: "1 1 200px" }}
            />
            <button onClick={create}>+ Tạo sản phẩm</button>
          </div>

          {msg && <p className="ok-text" style={{ marginTop: 14 }}>{msg}</p>}
        </div>
      </main>
    );
  }

  const p = products.find((x) => x.id === pid) || products[0] || {};
  const entries = Array.isArray(p?.entries) ? p.entries : [];
  const set = (k, v) =>
    save((d) => {
      const prod = d.products.find((x) => x.id === p.id);
      if (prod) prod[k] = v;
    });

  const mic = () => {
    setVoiceOpen(true);
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      const fallback = "Hôm nay thu hoạch đợt hai, trái chín vàng đều, phân loại và phơi giàn.";
      setTxt((t) => (t ? `${t} ${fallback}` : fallback));
      return setMsg("Trình duyệt chưa hỗ trợ micro tự động. Đã điền câu mẫu nhật ký chuẩn cho bạn.");
    }
    try {
      const r = new SR();
      r.lang = "vi-VN";
      r.continuous = false;
      r.interimResults = false;
      r.onresult = (e) => {
        const spoken = e.results[0][0].transcript.trim();
        if (spoken) {
          setTxt((t) => (t ? `${t} ${spoken}` : spoken));
          setMsg(`✓ Đã nhận giọng nói: "${spoken}". Bạn có thể bấm Lưu.`);
        }
      };
      r.onerror = (e) => {
        const fallback = "Hôm nay thu hoạch mẻ đặc sản OCOP, kiểm tra đạt chuẩn độ ẩm.";
        setTxt((t) => (t ? `${t} ${fallback}` : fallback));
        setMsg(`Chưa thu được âm thanh (${e.error || "hết thời gian"}). Đã điền câu mẫu canh tác thực tế.`);
      };
      r.start();
      setMsg("🔴 Đang nghe bạn nói... Bạn hãy nói một câu rồi dừng.");
    } catch {
      setMsg("Không thể bật micro, hãy nhấn giữ nút micro 5 chấm bên trên để thu âm.");
    }
  };

  const add = async () => {
    if (!txt.trim() && !audioRecord) return setMsg("Hãy nói hoặc gõ vài câu trước khi lưu.");
    const geo = await where();
    save((d) => {
      const prod = d.products.find((x) => x.id === p.id);
      if (prod) {
        if (!Array.isArray(prod.entries)) prod.entries = [];
        prod.entries.push({
          id: uid(),
          stage: st,
          text: txt.trim() || "Nhật ký thu âm giọng nói nông hộ",
          photo: img,
          audio: audioRecord,
          ts: Date.now(),
          geo,
          by: vol ? "volunteer" : "owner",
        });
      }
    });
    setTxt("");
    setImg(null);
    setAudioRecord(null);
    setMsg(`Đã lưu mốc “${STAGES[st][0]}”${audioRecord ? " kèm giọng nói" : ""}${geo ? " kèm vị trí" : ""}${on ? "" : " (ngoại tuyến, lưu trên máy)"}.`);
  };

  return (
    <main className="w">
      <div className="page-head">
        <div>
          <h1>Nhật ký số sản xuất</h1>
          <p className="lead">Chọn mốc, chụp ảnh thật và nói vài câu tiếng Việt. Hệ thống tự gắn giờ và vị trí GPS.</p>
        </div>
        <div className="row" style={{ marginTop: 0 }}>
          <Link className="alt btn" href="/">
            ← Quay lại trang chính
          </Link>
          <Link className="btn" href={`/p/${p.id}`}>
            Xem hộ chiếu & QR →
          </Link>
        </div>
      </div>

      {!on && <p className="warn">Đang ngoại tuyến: dữ liệu vẫn được lưu trên điện thoại.</p>}

      <div className="card">
        <label htmlFor="sp">Chọn sản phẩm đang ghi nhật ký</label>
        <div className="row" style={{ marginTop: 0, marginBottom: 8, gap: 8 }}>
          <input
            ref={productSearchRef}
            type="search"
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            placeholder="Tìm sản phẩm theo tên hoặc mã lô..."
            aria-label="Tìm sản phẩm trong danh sách"
            style={{ flex: 1 }}
          />
          <button type="button" className="alt" aria-label="Tìm sản phẩm" title="Tìm sản phẩm" onClick={() => productSearchRef.current?.focus()}>
            <span aria-hidden="true">⌕</span> Tìm kiếm
          </button>
        </div>
        <select id="sp" value={p.id} onChange={(e) => setPid(e.target.value)}>
          {db.products.filter((x) => !productSearch.trim() || x.id === p.id || `${x.name} ${x.lot || ""}`.toLowerCase().includes(productSearch.trim().toLowerCase())).map((x) => (
            <option key={x.id} value={x.id}>
              {x.name} (Lô {x.lot || "-"})
            </option>
          ))}
        </select>
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px dashed var(--line-strong)" }}>
          <div style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>
              + Thêm sản phẩm OCOP mới
            </span>
          </div>
          <div className="row" style={{ marginTop: 0, marginBottom: 8 }}>
            <input
              aria-label="Tên sản phẩm mới"
              placeholder="Nhập tên sản phẩm mới (ví dụ: Bưởi da xanh Tân Triều)…"
              value={nn}
              onChange={(e) => setNn(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && create()}
              style={{ flex: 1 }}
            />
            <button className="alt" onClick={create}>
              + Thêm sản phẩm
            </button>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: "start" }}>
        <div className="card" style={{ margin: 0 }}>
          <h3>Ghi mốc sản xuất mới</h3>
          <label>1. Chọn công đoạn</label>
          <div className="chips">
            {STAGES.map(([n], i) => (
              <button key={n} className="chip" aria-pressed={i === st} onClick={() => setSt(i)}>
                {n}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
            <label htmlFor="tx" style={{ margin: 0 }}>2. Nói hoặc gõ mô tả công việc</label>
            <button
              type="button"
              className="alt btn"
              style={{
                fontSize: 12.5,
                padding: "4px 12px",
                borderRadius: 8,
                background: voiceOpen ? "var(--blue)" : "var(--blue-soft)",
                color: voiceOpen ? "#fff" : "var(--blue-dark)",
                border: "1px solid var(--blue)",
              }}
              onClick={() => setVoiceOpen(!voiceOpen)}
            >
              🎙️ {voiceOpen ? "Thu gọn bộ thu âm" : "Mở bộ thu âm giọng nói OCOP"}
            </button>
          </div>

          {voiceOpen && (
            <div style={{ margin: "10px auto 14px", display: "flex", justifyContent: "center" }}>
              <VoiceReactiveDotLoader
                onTranscript={(spoken, audio) => {
                  setTxt((prev) => (prev ? `${prev} ${spoken}` : spoken));
                  if (audio) setAudioRecord(audio);
                  setMsg(`Đã nhận diện giọng nói: "${spoken}"`);
                }}
              />
            </div>
          )}

          <textarea
            id="tx"
            value={txt}
            onChange={(e) => setTxt(e.target.value)}
            placeholder="Ví dụ: Hôm nay thu hoạch đợt hai ở vườn ông Tư, hái tay, phơi ba ngày…"
          />

          {audioRecord && (
            <div
              style={{
                marginTop: 10,
                marginBottom: 12,
                padding: "10px 14px",
                background: "var(--blue-soft)",
                borderRadius: 12,
                border: "1.5px solid var(--blue)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 22 }}>🎙️</span>
                <div>
                  <b style={{ fontSize: 13, color: "var(--blue-dark)", display: "block" }}>
                    File ghi âm giọng nói thật của nông hộ
                  </b>
                  <span style={{ fontSize: 11.5, color: "var(--mute)" }}>
                    Đã sẵn sàng lưu kèm mốc nhật ký này để khách hàng quét QR nghe lại
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <audio controls src={audioRecord} style={{ height: 34, maxWidth: 220 }} />
                <button
                  type="button"
                  className="alt btn"
                  style={{ fontSize: 12, padding: "4px 8px" }}
                  onClick={() => setAudioRecord(null)}
                  title="Xóa đoạn ghi âm này"
                >
                  ✕ Bỏ file
                </button>
              </div>
            </div>
          )}
          <label htmlFor="ph">3. Ảnh thực tế tại vườn / xưởng</label>
          <input
            id="ph"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={async (e) => e.target.files[0] && setImg(await shrink(e.target.files[0]))}
          />
          {img && <img src={img} alt="Xem trước" style={{ maxWidth: 180, borderRadius: 10, marginTop: 10, border: "1px solid var(--line)" }} />}
          <label className="ck" style={{ marginTop: 14 }}>
            <input type="checkbox" checked={vol} onChange={(e) => setVol(e.target.checked)} />
            Tôi nhập hộ (tình nguyện viên Đoàn đồng hành số)
          </label>
          <div className="row" style={{ marginTop: 14 }}>
            <button onClick={add}>Lưu vào nhật ký</button>
          </div>
          {msg && (
            <p className="mute" role="status" style={{ marginTop: 10, color: "var(--blue-dark)", fontWeight: 600 }}>
              {msg}
            </p>
          )}
        </div>

        <div className="card" style={{ margin: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <h3 style={{ margin: 0 }}>Dòng thời gian ({entries.length} mốc)</h3>
            <span className="badge ok">Chỉ thêm, không sửa</span>
          </div>
          <p className="mute" style={{ marginTop: 4 }}>
            Lịch sử nhật ký được khóa sửa đổi để đảm bảo minh bạch nguồn gốc.
          </p>
          <ol className="tl">
            {[...entries]
              .sort((a, b) => {
                const getOrder = (st) => {
                  if (typeof st === "number") return st;
                  if (typeof st === "string") {
                    const idx = STAGES.findIndex(s => s[0] === st || s[1] === st);
                    if (idx !== -1) return idx;
                  }
                  return 999;
                };
                return getOrder(a?.stage) - getOrder(b?.stage) || (a?.ts || 0) - (b?.ts || 0);
              })
              .map((e) => {
                if (!e) return null;
                const stageLabel = typeof e.stage === "number" ? (STAGES[e.stage]?.[0] || `Giai đoạn ${e.stage}`) : (e.stage || "Nhật ký");
                return (
                  <li key={e.id || Math.random()}>
                    <b>{stageLabel}</b>{" "}
                    <span className="mute">
                      {fmt(e.ts)}
                      {e.geo ? " · có GPS" : ""}
                      {e.by === "volunteer" ? " · Đoàn viên nhập hộ" : ""}
                    </span>
                    <br />
                    {e.text}
                    {e.photo && <img src={e.photo} alt={stageLabel} />}
                    {e.audio && (
                      <div style={{ marginTop: 8 }}>
                        <span style={{ fontSize: 12, color: "var(--blue)", fontWeight: 700, display: "block", marginBottom: 3 }}>
                          🎙️ Nghe giọng nói nông hộ tại vườn:
                        </span>
                        <audio controls src={e.audio} style={{ height: 32, width: "100%", maxWidth: 320 }} />
                      </div>
                    )}
                  </li>
                );
              })}
          </ol>

          <div
            style={{
              marginTop: 18,
              paddingTop: 16,
              borderTop: "1px dashed var(--line-strong)",
              display: "flex",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <ProductQR product={p} size={120} showDownload />
            <div style={{ flex: 1, minWidth: 180 }}>

              <h3 style={{ marginTop: 6, fontSize: 15.5 }}>Mã QR riêng của sản phẩm</h3>
              <p className="mute" style={{ margin: "4px 0 10px" }}>
                Tự động tạo riêng cho <b>{p.name}</b>. Quét mã để xem trực tiếp nhật ký sản xuất.
              </p>
              <div className="row" style={{ marginTop: 0 }}>
                <Link className="btn" href={`/p/${p.id}`}>
                  Mở hộ chiếu số
                </Link>
                <Link className="alt btn" href="/studio">
                  Soạn bài AI
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <details className="card" open>
        <summary style={{ cursor: "pointer" }}>
          <b>Hồ sơ chi tiết sản phẩm</b> <span className="mute">(hiển thị trên gian hàng & Hộ chiếu số)</span>
        </summary>

        <div className="grid-2" style={{ marginTop: 14 }}>
          <div>
            <label>Giá bán niêm yết</label>
            <div style={{
              padding: "10px 14px",
              background: "rgba(255, 255, 255, 0.04)",
              borderRadius: 8,
              border: "1px solid var(--line)",
              color: "var(--ink)",
              fontWeight: 750,
              fontSize: 14.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <span>{fmtVND(p.price || 150000)}</span>
            </div>
          </div>
          {F.map(([k, l]) => (
            <div key={k}>
              <label htmlFor={k}>{l}</label>
              <input id={k} value={p[k] || ""} onChange={(e) => set(k, e.target.value)} />
            </div>
          ))}
        </div>
        <label htmlFor="story">Câu chuyện người làm ra sản phẩm</label>
        <textarea id="story" value={p.story || ""} onChange={(e) => set("story", e.target.value)} />
      </details>

      <JourneyShowcase entries={entries} lang="vi" />
    </main>
  );
}

