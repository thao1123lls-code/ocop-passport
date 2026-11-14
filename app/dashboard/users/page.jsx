"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth, ROLE_LABEL } from "@/lib/auth-client";

const STATUS_LABEL = { active: "Hoạt động", pending: "Chờ duyệt", disabled: "Đã khóa" };
const J = { "content-type": "application/json" };

export default function UsersAdmin() {
  const { user, loading } = useAuth();
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const [u, p] = await Promise.all([
      fetch("/api/admin/users", { cache: "no-store" }).then((r) => r.json()).catch(() => null),
      fetch("/api/products", { cache: "no-store" }).then((r) => r.json()).catch(() => null),
    ]);
    if (u?.success) setUsers(u.data);
    if (p?.success) setProducts(p.data.map(({ id, name, ownerId }) => ({ id, name, ownerId })));
  }, []);

  useEffect(() => {
    if (user?.role === "admin") load();
  }, [user, load]);

  const patch = async (url, body, ok) => {
    const r = await fetch(url, { method: "PATCH", headers: J, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    setMsg(r.ok && j.success ? `✓ ${ok}` : j.error || "Không cập nhật được.");
    load();
  };

  if (loading) return <p className="w">Đang tải…</p>;
  if (user?.role !== "admin") {
    return (
      <main className="w" style={{ maxWidth: 520 }}>
        <div className="card">
          <h1 style={{ marginTop: 0 }}>Khu vực quản trị</h1>
          <p>Trang này chỉ dành cho quản trị viên. <Link href="/login?next=/dashboard/users">Đăng nhập bằng tài khoản quản trị →</Link></p>
        </div>
      </main>
    );
  }

  const owners = users.filter((u) => ["owner", "admin"].includes(u.role) && u.status === "active");
  const pending = users.filter((u) => u.status === "pending").length;
  const th = { textAlign: "left", padding: "8px 10px", fontSize: 12, opacity: 0.7, whiteSpace: "nowrap" };
  const td = { padding: "8px 10px", borderTop: "1px solid rgba(255,255,255,.08)", fontSize: 14, verticalAlign: "middle" };

  return (
    <main className="w">
      <div className="page-head">
        <div>
          <h1>Quản lý người dùng</h1>
          <p className="lead">Duyệt tình nguyện viên, đổi vai trò, khóa tài khoản và gán chủ sở hữu cho sản phẩm.</p>
        </div>
        <div className="row" style={{ marginTop: 0 }}>
          <Link className="alt btn" href="/dashboard">← Bảng điều khiển</Link>
        </div>
      </div>

      {msg && <p role="status" style={{ margin: "0 0 12px" }}>{msg}</p>}

      <div className="card" style={{ overflowX: "auto" }}>
        <h3 style={{ marginTop: 0 }}>Tài khoản ({users.length}){pending > 0 && <span style={{ color: "#FBBF24" }}> · {pending} chờ duyệt</span>}</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr><th style={th}>Họ tên</th><th style={th}>Email</th><th style={th}>Vai trò</th><th style={th}>Trạng thái</th><th style={th}>Sản phẩm / Mốc</th><th style={th}></th></tr>
          </thead>
          <tbody>
            {users.map((u, idx) => {
              const self = (u.id != null && u.id === user.id) || u.email === user.email;
              return (
                <tr key={u.id ?? u.email ?? idx}>
                  <td style={td}>{u.name}{self && " (bạn)"}</td>
                  <td style={td}>{u.email}</td>
                  <td style={td}>
                    <select value={u.role} disabled={self} onChange={(e) => patch(`/api/admin/users/${u.id}`, { role: e.target.value }, "Đã đổi vai trò.")}>
                      {Object.entries(ROLE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </td>
                  <td style={{ ...td, color: u.status === "active" ? "#34D399" : u.status === "pending" ? "#FBBF24" : "#F87171" }}>{STATUS_LABEL[u.status]}</td>
                  <td style={td}>{u.products} / {u.entries}</td>
                  <td style={{ ...td, whiteSpace: "nowrap" }}>
                    {u.status !== "active" && <button className="btn" onClick={() => patch(`/api/admin/users/${u.id}`, { status: "active" }, u.status === "pending" ? "Đã duyệt tài khoản." : "Đã mở khóa.")}>{u.status === "pending" ? "Duyệt" : "Mở khóa"}</button>}
                    {u.status !== "disabled" && !self && <button className="alt btn" style={{ marginLeft: 6 }} onClick={() => window.confirm(`Khóa tài khoản ${u.email}?`) && patch(`/api/admin/users/${u.id}`, { status: "disabled" }, "Đã khóa tài khoản.")}>Khóa</button>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ marginTop: 16, overflowX: "auto" }}>
        <h3 style={{ marginTop: 0 }}>Chủ sở hữu sản phẩm</h3>
        <p className="mute" style={{ marginTop: 0, fontSize: 13 }}>Chủ cơ sở chỉ sửa và ghi nhật ký được cho sản phẩm của mình. Sản phẩm chưa có chủ chỉ admin sửa được.</p>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><th style={th}>Sản phẩm</th><th style={th}>Chủ sở hữu</th></tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td style={td}>{p.name}</td>
                <td style={td}>
                  <select value={p.ownerId ?? ""} onChange={(e) => patch(`/api/products/${encodeURIComponent(p.id)}`, { ownerId: e.target.value === "" ? null : Number(e.target.value) }, "Đã đổi chủ sở hữu.")}>
                    <option value="">(chưa có chủ, chỉ admin)</option>
                    {owners.map((o) => <option key={o.id} value={o.id}>{o.name} · {o.email}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
