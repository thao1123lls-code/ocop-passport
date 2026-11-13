"use client";
import { useEffect, useRef } from "react";
import * as T from "three";
export default function Hero3D() {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current, hero = cv.parentNode, rm = matchMedia("(prefers-reduced-motion:reduce)").matches; let R;
    try { R = new T.WebGLRenderer({ canvas: cv, alpha: true, antialias: true }); } catch { return; }
    R.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    const S = new T.Scene(), C = new T.PerspectiveCamera(45, 1, .1, 50); C.position.z = 7;
    S.add(new T.AmbientLight(0xffffff, .75));
    const key = new T.DirectionalLight(0xffffff, 1.3); key.position.set(3, 4, 5); S.add(key);
    const rim = new T.PointLight(0xd83995, 1.8, 22); rim.position.set(-4, -1, 3); S.add(rim);
    const G = new T.Group(), P = new T.Group(); G.add(P); S.add(G);
    const g = new T.SphereGeometry(1, 96, 64), p = g.attributes.position, col = [], a = new T.Color(0x0297de), b = new T.Color(0xffffff), d = new T.Color(0xd83995);
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), th = Math.atan2(z, x), k = Math.sqrt(Math.max(0, 1 - y * y)), rg = 1 + .07 * Math.cos(th * 10) * k, ay = Math.abs(y);
      p.setXYZ(i, x * .58 * rg, y * 1.35 + (y < 0 ? -1 : 1) * Math.pow(ay, 6) * .3, z * .58 * rg);
      const t = (y + 1) / 2, c = t < .5 ? a.clone().lerp(b, t * 2) : b.clone().lerp(d, (t - .5) * 2); col.push(c.r, c.g, c.b); }
    g.setAttribute("color", new T.Float32BufferAttribute(col, 3)); g.computeVertexNormals();
    const pod = new T.Mesh(g, new T.MeshStandardMaterial({ vertexColors: true, roughness: .32, metalness: .12 })); pod.rotation.z = .35; P.add(pod);
    const bg = new T.SphereGeometry(.1, 14, 10), bm = [new T.MeshStandardMaterial({ color: 0xffffff, roughness: .35, metalness: .1 }), new T.MeshStandardMaterial({ color: 0xd83995, roughness: .3, metalness: .25 })], beans = [];
    for (let j = 0; j < 64; j++) { const m = new T.Mesh(bg, bm[j % 4 === 0 ? 1 : 0]); m.scale.set(1.25, .8, .8); beans.push({ m, r: 1.9 + Math.random() * 1.9, s: (.15 + Math.random() * .35) * (Math.random() < .5 ? -1 : 1), a: Math.random() * 6.28, h: (Math.random() - .5) * 2.4, q: Math.random() * 6 }); P.add(m); }
    const n = 280, pos = new Float32Array(n * 3); for (let u = 0; u < n * 3; u++) pos[u] = (Math.random() - .5) * (u % 3 === 2 ? 6 : 16);
    const pg = new T.BufferGeometry(); pg.setAttribute("position", new T.BufferAttribute(pos, 3));
    const dust = new T.Points(pg, new T.PointsMaterial({ color: 0xffffff, size: .04, transparent: true, opacity: .75 })); S.add(dust);
    const fit = () => { const w = hero.clientWidth, h = hero.clientHeight; R.setSize(w, h, false); C.aspect = w / h; C.updateProjectionMatrix(); const vh = 2 * Math.tan(22.5 * Math.PI / 180) * 7, vw = vh * C.aspect, nar = w < 700; G.position.set(nar ? vw * .28 : vw * .24, nar ? vh * .3 : vh * .2, 0); G.scale.setScalar(nar ? .6 : 1); };
    fit(); addEventListener("resize", fit);
    let mx = 0, my = 0, run = true, sy = 0, raf;
    const sc = () => { sy = Math.min(Math.max(scrollY, 0) / hero.clientHeight, 1); }, mv = (e) => { const r = hero.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width - .5; my = (e.clientY - r.top) / r.height - .5; };
    if (!rm) addEventListener("scroll", sc, { passive: true }); hero.addEventListener("pointermove", mv);
    const draw = (tm) => { const t = tm * .001; pod.rotation.y = t * .35; P.position.y = Math.sin(t * .8) * .12 + sy * 1.1; pod.scale.setScalar(1 - sy * .25);
      beans.forEach((o) => { const an = o.a + t * o.s; o.m.position.set(Math.cos(an) * o.r, o.h + Math.sin(t + o.q) * .12, Math.sin(an) * o.r * .55); o.m.rotation.set(t + o.q, t * .7, 0); });
      dust.rotation.y = t * .02; dust.position.y = Math.sin(t * .3) * .15;
      G.rotation.y += (mx * .6 + sy * 1.4 - G.rotation.y) * .05; G.rotation.x += (my * .4 - G.rotation.x) * .05; R.render(S, C); };
    const loop = (tm) => { if (run) draw(tm); raf = requestAnimationFrame(loop); };
    let io; if (rm) draw(2500); else { raf = requestAnimationFrame(loop); io = new IntersectionObserver((e) => { run = e[0].isIntersecting; }); io.observe(hero); }
    return () => { cancelAnimationFrame(raf); io?.disconnect(); removeEventListener("resize", fit); removeEventListener("scroll", sc); hero.removeEventListener("pointermove", mv); R.dispose(); };
  }, []);
  return <canvas ref={ref} className="gl" aria-hidden="true" />;
}
