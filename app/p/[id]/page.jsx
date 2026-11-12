"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useDB, STAGES, fmt, slim, enc, dec } from "@/lib/store";
const T = { vi: { story: "Câu chuyện", trip: "Hành trình sản phẩm", map: "Vùng trồng", info: "Thông tin sản phẩm", buy: "Mua hàng chính thức", share: "Chia sẻ", pend: "Hộ chiếu đang chờ Đoàn/đơn vị OCOP xác minh.", none: "Không tìm thấy sản phẩm.", f: ["Khối lượng", "Thành phần", "Hạn sử dụng", "Bảo quản"], lot: "Lô", ver: "Đã xác minh" }, en: { story: "Our story", trip: "Product journey", map: "Growing area", info: "Product details", buy: "Buy from the official shop", share: "Share", pend: "This passport is awaiting verification.", none: "Product not found.", f: ["Weight", "Ingredients", "Shelf life", "Storage"], lot: "Lot", ver: "Verified" } };
export default function Passport() {
  const { id } = useParams(); const [db] = useDB(); const [q, setQ] = useState(); const [lang, setLang] = useState("vi"), [qr, setQr] = useState(""), [url, setUrl] = useState(""), [cp, setCp] = useState(false);
  useEffect(() => { const d = new URLSearchParams(location.search).get("d"); setQ(d ? dec(d) : null); }, []);
  const p = db && q !== undefined ? db.products.find((x) => x.id === id) || q : null;
  useEffect(() => { if (!p) return; const u = `${location.origin}/p/${p.id}?d=${encodeURIComponent(enc(slim(p)))}`; setUrl(u); import("qrcode").then((m) => m.toDataURL(u, { errorCorrectionLevel: "L", margin: 1, width: 220 })).then(setQr).catch(() => setQr("")); }, [p]);
  const t = T[lang];
  if (!db || q === undefined) return <p className="w">Đang tải…</p>;
  if (!p) return <p className="w">{t.none}</p>;
  const geo = p.entries.find((e) => e.geo)?.geo, buy = /^https?:\/\//.test(p.shop || "");
  const certs = (p.certs || "").split(",").map((s) => s.trim()).filter(Boolean), vals = [p.weight, p.ingredients, p.expiry, p.storage];
  const share = () => navigator.share ? navigator.share({ title: p.name, url }).catch(() => {}) : navigator.clipboard.writeText(url).then(() => { setCp(true); setTimeout(() => setCp(false), 2000); });
  return (<main className="w">
    <div className="row" style={{ justifyContent: "space-between" }}><span>{t.lot} {p.lot || "-"}</span><button className="alt" onClick={() => setLang(lang === "vi" ? "en" : "vi")} aria-label="Đổi ngôn ngữ / Switch language">{lang === "vi" ? "English" : "Tiếng Việt"}</button></div>
    <h1>{p.name}</h1><p className="mute">{p.farm}</p>
    <div>{certs.map((c) => <span key={c} className="badge">{c}</span>)}{p.verified && <span className="badge">{t.ver}</span>}</div>
    {!p.verified && <p className="warn">{t.pend}</p>}
    {p.story && <div className="card"><h2>{t.story}</h2><p>{p.story}</p></div>}
    <div className="card"><h2>{t.trip}</h2><ol className="tl">{[...p.entries].sort((a, b) => a.stage - b.stage || a.ts - b.ts).map((e) => <li key={e.id}><b>{STAGES[e.stage][lang === "vi" ? 0 : 1]}</b> <span className="mute">{fmt(e.ts)}</span><br />{e.text}{e.photo && <img src={e.photo} alt="" loading="lazy" />}</li>)}</ol></div>
    {geo && <div className="card"><h2>{t.map}</h2><iframe loading="lazy" title={t.map} src={`https://www.openstreetmap.org/export/embed.html?bbox=${geo[1] - 0.01},${geo[0] - 0.01},${geo[1] + 0.01},${geo[0] + 0.01}&layer=mapnik&marker=${geo[0]},${geo[1]}`} /></div>}
    <div className="card"><h2>{t.info}</h2>{t.f.map((l, i) => vals[i] && <p key={l} style={{ margin: "4px 0" }}><b>{l}:</b> {vals[i]}</p>)}</div>
    <div className="row">{buy && <a className="btn" href={p.shop} target="_blank" rel="noopener noreferrer">{t.buy}</a>}<button className="alt" onClick={share}>{cp ? "Đã chép link" : t.share}</button><a className="alt btn" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer">Facebook</a></div>
    <div className="card" style={{ textAlign: "center" }}><h3>Mã QR in lên bao bì</h3>{qr ? <><img src={qr} alt="Mã QR hộ chiếu số" width="220" height="220" style={{ background: "#fff", borderRadius: 8 }} /><p><a download={`qr-${p.id}.png`} href={qr}>Tải mã QR</a></p></> : <p className="mute">Đang tạo mã…</p>}<p className="mute">Mã chứa bản rút gọn (không kèm ảnh) nên quét được trên mọi thiết bị. Ảnh chỉ hiện trên máy đã ghi nhật ký cho đến khi có máy chủ lưu trữ.</p></div>
  </main>);
}
