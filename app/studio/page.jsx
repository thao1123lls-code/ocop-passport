"use client";
import { useState } from "react";
import { useDB, slim } from "@/lib/store";
import { check } from "@/lib/guard";
const K = [["desc", "Mô tả sản phẩm"], ["post", "Bài đăng mạng xã hội"], ["live", "Kịch bản livestream 10 phút"], ["en", "Bản tiếng Anh"], ["tags", "Từ khóa, hashtag, giờ đăng"]];
export default function Studio() {
  const [db, save] = useDB(); const [pid, setPid] = useState(""), [dr, setDr] = useState(null), [busy, setBusy] = useState(false), [msg, setMsg] = useState("");
  if (!db) return <p className="w">Đang tải…</p>;
  const p = db.products.find((x) => x.id === pid) || db.products[0], shown = dr || p.content;
  const warns = shown ? check(K.map(([k]) => shown[k]).join(" ")) : [];
  const gen = async () => { setBusy(true); setMsg(""); try { const r = await fetch("/api/generate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ product: slim(p) }) }), j = await r.json(); if (!r.ok) setMsg(j.error); else setDr(j); } catch { setMsg("Không soạn được, kiểm tra kết nối."); } setBusy(false); };
  const approve = () => { save((d) => { d.products.find((x) => x.id === p.id).content = { ...dr, approved: true, at: Date.now() }; }); setDr(null); setMsg("Đã duyệt và lưu."); };
  const copy = () => navigator.clipboard.writeText(K.map(([k, l]) => `${l}\n${shown[k]}`).join("\n\n")).then(() => setMsg("Đã sao chép."), () => setMsg("Không sao chép được."));
  return (<main className="w"><h1>Trợ lý bán hàng AI</h1>
    <p className="lead">Chỉ viết từ dữ liệu trong nhật ký và hồ sơ. Mọi nội dung là bản nháp cho đến khi chủ cơ sở duyệt.</p>
    <div className="card"><label htmlFor="sp">Sản phẩm</label><select id="sp" value={p.id} onChange={(e) => { setPid(e.target.value); setDr(null); }}>{db.products.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
      <div className="row"><button onClick={gen} disabled={busy || !p.entries.length}>{busy ? "Đang soạn…" : "Soạn nội dung từ nhật ký"}</button><span className="mute" role="status">{msg || (!p.entries.length ? "Cần ít nhất một mốc nhật ký." : "")}</span></div></div>
    {shown && <div className="card">
      <p><span className="badge">{dr ? "Bản nháp, chờ duyệt" : "Đã duyệt"}</span><span className="mute">{dr ? (dr.source === "ai" ? "Soạn bằng AI" : "Soạn bằng mẫu câu (chưa cấu hình ANTHROPIC_API_KEY)") : ""}</span></p>
      {warns.length > 0 && <p className="warn" role="alert">Cảnh báo cụm từ có thể vi phạm quy định quảng cáo: <b>{warns.join(", ")}</b>. Hãy sửa trước khi duyệt.</p>}
      {K.map(([k, l]) => <div key={k}><label htmlFor={k}>{l}</label><textarea id={k} readOnly={!dr} value={shown[k]} rows={k === "live" ? 8 : 4} onChange={(e) => setDr({ ...dr, [k]: e.target.value })} /></div>)}
      <div className="row">{dr && <button onClick={approve} disabled={warns.length > 0}>Duyệt nội dung</button>}<button className="alt" onClick={copy} disabled={!!dr}>Sao chép tất cả</button>{dr && <span className="mute">Duyệt xong mới sao chép được.</span>}</div></div>}
  </main>);
}
