"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useDB, STAGES, slug, uid, fmt } from "@/lib/store";
const shrink = (f) => new Promise((ok) => { const r = new FileReader(); r.onload = () => { const im = new Image(); im.onload = () => { const k = Math.min(1, 800 / Math.max(im.width, im.height)), c = document.createElement("canvas"); c.width = im.width * k; c.height = im.height * k; c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); ok(c.toDataURL("image/jpeg", 0.65)); }; im.src = r.result; }; r.readAsDataURL(f); });
const where = () => new Promise((ok) => navigator.geolocation ? navigator.geolocation.getCurrentPosition((p) => ok([+p.coords.latitude.toFixed(5), +p.coords.longitude.toFixed(5)]), () => ok(null), { timeout: 4000 }) : ok(null));
const F = [["name", "Tên sản phẩm"], ["farm", "Cơ sở / hợp tác xã"], ["lot", "Mã lô"], ["weight", "Khối lượng"], ["ingredients", "Thành phần"], ["expiry", "Hạn sử dụng"], ["storage", "Bảo quản"], ["certs", "Chứng nhận (cách nhau dấu phẩy)"], ["shop", "Link gian hàng (https://…)"]];
export default function Diary() {
  const [db, save] = useDB(); const [pid, setPid] = useState(""), [st, setSt] = useState(2), [txt, setTxt] = useState(""), [img, setImg] = useState(null), [vol, setVol] = useState(false), [msg, setMsg] = useState(""), [nn, setNn] = useState(""), [on, setOn] = useState(true);
  useEffect(() => { const f = () => setOn(navigator.onLine); f(); addEventListener("online", f); addEventListener("offline", f); return () => { removeEventListener("online", f); removeEventListener("offline", f); }; }, []);
  if (!db) return <p className="w">Đang tải…</p>;
  const p = db.products.find((x) => x.id === pid) || db.products[0];
  const set = (k, v) => save((d) => { d.products.find((x) => x.id === p.id)[k] = v; });
  const mic = () => { const SR = window.SpeechRecognition || window.webkitSpeechRecognition; if (!SR) return setMsg("Trình duyệt chưa hỗ trợ giọng nói (dùng Chrome/Edge), hãy gõ trực tiếp."); const r = new SR(); r.lang = "vi-VN"; r.onresult = (e) => { setTxt((t) => (t + " " + e.results[0][0].transcript).trim()); setMsg("Đã nhận giọng nói, kiểm tra rồi lưu."); }; r.onerror = () => setMsg("Không nghe được, hãy cho phép micro."); r.start(); setMsg("Đang nghe…"); };
  const add = async () => { if (!txt.trim()) return setMsg("Hãy nói hoặc gõ vài câu trước khi lưu."); const geo = await where(); save((d) => { d.products.find((x) => x.id === p.id).entries.push({ id: uid(), stage: st, text: txt.trim(), photo: img, ts: Date.now(), geo, by: vol ? "volunteer" : "owner" }); }); setTxt(""); setImg(null); setMsg(`Đã lưu mốc “${STAGES[st][0]}”${geo ? " kèm vị trí" : ""}${on ? "" : " (ngoại tuyến, lưu trên máy)"}.`); };
  const create = () => { if (!nn.trim()) return; const id = slug(nn); save((d) => { d.products.push({ id, name: nn.trim(), farm: "", lot: "", weight: "", ingredients: "", expiry: "", storage: "", certs: "", story: "", shop: "", verified: false, content: null, entries: [] }); }); setPid(id); setNn(""); };
  return (<main className="w">
    <h1>Nhật ký số</h1>{!on && <p className="warn">Đang ngoại tuyến: dữ liệu vẫn được lưu trên điện thoại.</p>}
    <div className="card"><label htmlFor="sp">Sản phẩm</label><select id="sp" value={p.id} onChange={(e) => setPid(e.target.value)}>{db.products.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
      <div className="row"><input aria-label="Tên sản phẩm mới" placeholder="Thêm sản phẩm mới…" value={nn} onChange={(e) => setNn(e.target.value)} style={{ flex: 1 }} /><button className="alt" onClick={create}>Thêm</button></div></div>
    <div className="card"><h3>Ghi mốc sản xuất</h3><div className="chips">{STAGES.map(([n], i) => <button key={n} className="chip" aria-pressed={i === st} onClick={() => setSt(i)}>{n}</button>)}</div>
      <label htmlFor="tx">Nói hoặc gõ vài câu</label><textarea id="tx" value={txt} onChange={(e) => setTxt(e.target.value)} placeholder="Hôm nay thu hoạch đợt hai ở vườn ông Tư, hái tay, phơi ba ngày…" />
      <label htmlFor="ph">Ảnh (chụp trực tiếp hoặc chọn)</label><input id="ph" type="file" accept="image/*" capture="environment" onChange={async (e) => e.target.files[0] && setImg(await shrink(e.target.files[0]))} />{img && <img src={img} alt="Xem trước" style={{ maxWidth: 160, borderRadius: 8, marginTop: 8 }} />}
      <label className="ck"><input type="checkbox" checked={vol} onChange={(e) => setVol(e.target.checked)} />Tôi nhập hộ (tình nguyện viên Đoàn)</label>
      <div className="row"><button onClick={add}>Lưu vào nhật ký</button><button className="alt" onClick={mic}>Nói bằng giọng nói</button><span className="mute" role="status">{msg}</span></div></div>
    <div className="card"><h3>Dòng thời gian ({p.entries.length})</h3><p className="mute">Bản ghi chỉ thêm, không sửa, để hạn chế chỉnh dữ liệu về sau.</p>
      <ol className="tl">{[...p.entries].sort((a, b) => a.stage - b.stage || a.ts - b.ts).map((e) => <li key={e.id}><b>{STAGES[e.stage][0]}</b> <span className="mute">{fmt(e.ts)}{e.geo ? " · có vị trí" : ""}{e.by === "volunteer" ? " · người hỗ trợ nhập" : ""}</span><br />{e.text}{e.photo && <img src={e.photo} alt={STAGES[e.stage][0]} />}</li>)}</ol>
      <Link className="btn" href={`/p/${p.id}`}>Xem hộ chiếu số và mã QR</Link></div>
    <details className="card"><summary><b>Hồ sơ sản phẩm</b> (hiển thị trên hộ chiếu)</summary>
      {F.map(([k, l]) => <div key={k}><label htmlFor={k}>{l}</label><input id={k} value={p[k] || ""} onChange={(e) => set(k, e.target.value)} /></div>)}
      <label htmlFor="story">Câu chuyện người làm ra sản phẩm</label><textarea id="story" value={p.story || ""} onChange={(e) => set("story", e.target.value)} /></details>
  </main>);
}
