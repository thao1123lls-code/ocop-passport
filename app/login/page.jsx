"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, ROLE_LABEL } from "@/lib/auth-client";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, loading, login, register, logout, changePassword } = useAuth();
  const [mode, setMode] = useState("login");
  const [f, setF] = useState({ name: "", email: "", password: "", role: "owner" });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [pw, setPw] = useState({ cur: "", next: "" });
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

  const next = () => {
    const n = params.get("next");
    return n && n.startsWith("/") && !n.startsWith("//") ? n : "/diary";
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const r = mode === "login" ? await login(f.email, f.password) : await register(f);
    setBusy(false);
    if (!r.ok) return setMsg(r.error);
    router.push(r.user.role === "admin" ? "/dashboard" : next());
  };

  const changePw = async (e) => {
    e.preventDefault();
    const r = await changePassword(pw.cur, pw.next);
    setMsg(r.ok ? "✓ Đã đổi mật khẩu." : r.error);
    if (r.ok) setPw({ cur: "", next: "" });
  };

  if (loading) return <p className="w">Đang tải…</p>;

  if (user) {
    return (
      <main className="w" style={{ maxWidth: 520 }}>
        <div className="card">
          <h1 style={{ marginTop: 0 }}>Tài khoản</h1>
          <p><b>{user.name}</b><br />{user.email}<br /><span className="mute">{ROLE_LABEL[user.role]}{user.status === "pending" ? " · đang chờ duyệt" : ""}</span></p>
          <div className="row">
            <button className="btn" onClick={() => router.push(user.role === "admin" ? "/dashboard" : "/diary")}>Tiếp tục →</button>
            <button className="alt btn" onClick={logout}>Đăng xuất</button>
          </div>
          <h3 style={{ marginTop: 28 }}>Đổi mật khẩu</h3>
          <form onSubmit={changePw}>
            <input type="password" placeholder="Mật khẩu hiện tại" value={pw.cur} onChange={(e) => setPw({ ...pw, cur: e.target.value })} required autoComplete="current-password" />
            <input type="password" placeholder="Mật khẩu mới (từ 8 ký tự)" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} required minLength={8} autoComplete="new-password" style={{ marginTop: 8 }} />
            <button className="alt btn" type="submit" style={{ marginTop: 10 }}>Lưu mật khẩu mới</button>
          </form>
          {msg && <p role="status" style={{ marginTop: 12 }}>{msg}</p>}
        </div>
      </main>
    );
  }

  return (
    <main className="w" style={{ maxWidth: 480 }}>
      <div className="card">
        <h1 style={{ marginTop: 0 }}>{mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}</h1>
        <p className="lead" style={{ marginTop: 0 }}>Đăng nhập để lưu nhật ký và sản phẩm lên hệ thống OCOP Passport.</p>
        <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
          {mode === "register" && (
            <>
              <input placeholder="Họ và tên" value={f.name} onChange={set("name")} required autoComplete="name" />
              <select value={f.role} onChange={set("role")} aria-label="Vai trò">
                <option value="owner">Chủ cơ sở / hợp tác xã</option>
                <option value="volunteer">Tình nguyện viên nhập hộ</option>
              </select>
            </>
          )}
          <input type="email" placeholder="Email" value={f.email} onChange={set("email")} required autoComplete="email" />
          <input type="password" placeholder={mode === "login" ? "Mật khẩu" : "Mật khẩu (từ 8 ký tự)"} value={f.password} onChange={set("password")} required minLength={mode === "login" ? undefined : 8} autoComplete={mode === "login" ? "current-password" : "new-password"} />
          <button className="btn" type="submit" disabled={busy}>{busy ? "Đang xử lý…" : mode === "login" ? "Đăng nhập" : "Đăng ký"}</button>
        </form>
        {msg && <p role="alert" style={{ color: "#1E40AF", marginTop: 12 }}>{msg}</p>}
        <p style={{ marginTop: 16 }}>
          {mode === "login" ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
          <button type="button" className="alt btn" onClick={() => { setMode(mode === "login" ? "register" : "login"); setMsg(""); }}>
            {mode === "login" ? "Đăng ký" : "Đăng nhập"}
          </button>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="w">Đang tải…</p>}>
      <LoginInner />
    </Suspense>
  );
}
