"use client";
import { useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
const Hero3D = dynamic(() => import("./Hero3D"), { ssr: false });
export default function Hero() {
  const pc = useRef(null);
  const qr = useMemo(() => { let sd = 926; const o = []; for (let y = 0; y < 25; y++) for (let x = 0; x < 25; x++) { const f = (x < 7 && y < 7) || (x > 17 && y < 7) || (x < 7 && y > 17); let on; if (f) { const ox = x > 17 ? x - 18 : x, oy = y > 17 ? y - 18 : y; on = Math.max(Math.abs(ox - 3), Math.abs(oy - 3)) === 3 || Math.max(Math.abs(ox - 3), Math.abs(oy - 3)) <= 1; } else { sd = (sd * 1103515245 + 12345) & 0x7fffffff; on = (sd >> 8) % 2 === 0; } if (on) o.push([x, y]); } return o; }, []);
  const tilt = (e) => { if (matchMedia("(prefers-reduced-motion:reduce)").matches) return; const el = pc.current, r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height; el.style.transform = `perspective(900px) rotateY(${(x - .5) * 14}deg) rotateX(${(.5 - y) * 14}deg)`; };
  return (<div className="hero"><Hero3D />
    <div className="hc"><h1>Mỗi gói nông sản Đồng Nai có một hộ chiếu số</h1>
      <p className="lead">Ghi một lần bằng ảnh và giọng nói, dùng cho cả truy xuất nguồn gốc lẫn bán hàng trên sàn thương mại điện tử.</p>
      <div className="row"><Link className="btn gold" href="/diary">Ghi thử một mốc sản xuất</Link><Link className="btn ghost" href="/dashboard">Xem bảng điều khiển</Link></div></div>
    <article className="pass" ref={pc} onPointerMove={tilt} onPointerLeave={() => { pc.current.style.transform = ""; }} aria-label="Hộ chiếu số mẫu">
      <div className="pass-h"><span>HỘ CHIẾU SỐ OCOP</span><span>Lô 0926</span></div>
      <div className="pass-b"><h2>Ca cao nguyên chất Đồng Nai</h2><p className="mute" style={{ margin: "2px 0" }}>Dữ liệu minh họa</p>
        <div className="id"><svg viewBox="0 0 25 25" role="img" aria-label="Mã QR mẫu" style={{ background: "#fff" }}>{qr.map(([x, y]) => <rect key={x + "-" + y} x={x} y={y} width="1" height="1" fill="#16231c" />)}</svg><div><b style={{ color: "#16231c", display: "block" }}>Quét để xem hành trình</b>Mã QR động, cập nhật không cần in lại tem.</div></div>
        <ol className="tl"><li><b>Thu hoạch</b><br /><span className="mute">Hái tay, quả chín đều.</span></li><li><b>Sơ chế</b><br /><span className="mute">Lên men, phơi ba ngày.</span></li></ol></div>
    </article></div>);
}
