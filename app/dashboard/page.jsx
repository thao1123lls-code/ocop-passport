"use client";
import { useDB, fmt } from "@/lib/store";
export default function Dashboard() {
  const [db, save] = useDB();
  if (!db) return <p className="w">Đang tải…</p>;
  const P = db.products, n = P.length || 1, day = 864e5;
  const rows = P.map((p) => { const last = Math.max(0, ...p.entries.map((e) => e.ts)), i = []; if (p.entries.length < 3) i.push("ít mốc nhật ký"); if (!p.entries.some((e) => e.photo)) i.push("thiếu ảnh"); if (!p.story) i.push("thiếu câu chuyện"); if (!p.shop) i.push("chưa có link bán"); if (last && Date.now() - last > 14 * day) i.push("lâu chưa cập nhật"); return { p, i, last }; });
  const cnt = (f) => P.filter(f).length, farms = new Set(P.map((p) => p.farm || p.name)).size;
  const bars = [["Nhật ký từ 3 mốc", cnt((p) => p.entries.length >= 3)], ["Có ảnh thật", cnt((p) => p.entries.some((e) => e.photo))], ["Đã xác minh", cnt((p) => p.verified)], ["Nội dung đã duyệt", cnt((p) => p.content?.approved)], ["Có link bán hàng", cnt((p) => p.shop)]];
  const exp = () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(db, null, 1)], { type: "application/json" })); a.download = "ocop-passport.json"; a.click(); };
  return (<main className="w"><h1>Bảng điều khiển</h1>
    <p className="lead">Số liệu tính từ dữ liệu trên thiết bị này. Khi nối máy chủ (Supabase), bảng này sẽ tổng hợp toàn bộ cơ sở.</p>
    <div className="grid">{[[farms, "cơ sở"], [P.length, "sản phẩm"], [P.reduce((s, p) => s + p.entries.length, 0), "mốc nhật ký"], [cnt((p) => p.verified), "hộ chiếu đã xác minh"]].map(([v, l]) => <div key={l} className="card stat"><b>{v}</b>{l}</div>)}</div>
    <div className="card"><h3>Mức độ hoàn thiện</h3>{bars.map(([l, v]) => <div key={l} className="bar"><span>{l}</span><span><i style={{ width: (v / n) * 100 + "%" }} /></span><span>{v}/{P.length}</span></div>)}</div>
    <div className="card"><h3>Xác minh và hỗ trợ</h3>{rows.map(({ p, i, last }) => <div key={p.id} className="row" style={{ justifyContent: "space-between", borderTop: "1px solid var(--line)", paddingTop: 10 }}>
      <div><b>{p.name}</b><div className="mute">{last ? "Cập nhật " + fmt(last) : "Chưa có nhật ký"}</div>{i.length ? <div className="warn">Cần hỗ trợ: {i.join(", ")}</div> : <div className="ok">Đầy đủ</div>}</div>
      <button className={p.verified ? "alt" : ""} onClick={() => save((d) => { const x = d.products.find((y) => y.id === p.id); x.verified = !x.verified; })}>{p.verified ? "Bỏ xác minh" : "Xác minh hộ chiếu"}</button></div>)}</div>
    <button className="alt" onClick={exp}>Xuất dữ liệu (JSON)</button></main>);
}
