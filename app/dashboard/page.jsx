"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useDB, fmt, fmtVND } from "@/lib/store";

const ADMIN_PASS = process.env.NEXT_PUBLIC_ADMIN_PASS || "ocop2026";
const AUTH_KEY = "ocop-admin-auth";

function Icon({ name, className = "" }) {
  const p = {
    className,
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };

  switch (name) {
    case "dashboard":
      return (
        <svg {...p}>
          <rect x="3" y="3" width="7" height="9" rx="1" />
          <rect x="14" y="3" width="7" height="5" rx="1" />
          <rect x="14" y="12" width="7" height="9" rx="1" />
          <rect x="3" y="16" width="7" height="5" rx="1" />
        </svg>
      );
    case "logout":
      return (
        <svg {...p}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      );
    case "download":
      return (
        <svg {...p}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      );
    case "plus":
      return (
        <svg {...p}>
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      );
    case "trending-up":
      return (
        <svg {...p}>
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      );
    case "info":
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      );
    case "search":
      return (
        <svg {...p}>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      );
    case "check":
      return (
        <svg {...p}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
    case "check-circle":
      return (
        <svg {...p}>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      );
    case "trash":
      return (
        <svg {...p}>
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      );
    case "lock":
      return (
        <svg {...p}>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      );
    case "key":
      return (
        <svg {...p}>
          <path d="M21 2l-2 2m-1.5 1.5L14 9l-1.5-1.5-2 2 1.5 1.5-2 2-1.5-1.5-2 2 1.5 1.5-3 3a5.5 5.5 0 1 1-7.78-7.78 5.5 5.5 0 0 1 7.78 0l1.5-1.5" />
        </svg>
      );
    case "eye":
      return (
        <svg {...p}>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "eye-off":
      return (
        <svg {...p}>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Dashboard() {
  const [db, save] = useDB();
  const [search, setSearch] = useState("");
  const [authed, setAuthed] = useState(false);
  const [checked, setChecked] = useState(false);
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPw, setShowPw] = useState(false);

  const [changePwOpen, setChangePwOpen] = useState(false);
  const [curPw, setCurPw] = useState("");
  const [newPwVal, setNewPwVal] = useState("");
  const [changePwMsg, setChangePwMsg] = useState("");
  const [editingPriceId, setEditingPriceId] = useState(null);
  const [editingPriceVal, setEditingPriceVal] = useState("");

  const getActivePass = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("ocop-custom-admin-pass") || ADMIN_PASS;
    }
    return ADMIN_PASS;
  };

  useEffect(() => {
    try {
      const isL = localStorage.getItem(AUTH_KEY);
      const isS = sessionStorage.getItem(AUTH_KEY);
      if (isL === "1" || isS === "1") {
        setAuthed(true);
      }
    } catch {}
    setChecked(true);
  }, []);

  const login = (e) => {
    e.preventDefault();
    const activePass = getActivePass();
    if (pw === activePass || pw === ADMIN_PASS) {
      try {
        if (remember) {
          localStorage.setItem(AUTH_KEY, "1");
        }
        sessionStorage.setItem(AUTH_KEY, "1");
      } catch {}
      setAuthed(true);
      setErr("");
    } else {
      setErr("Mật khẩu chưa đúng. Vui lòng thử lại.");
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem(AUTH_KEY);
      sessionStorage.removeItem(AUTH_KEY);
    } catch {}
    setAuthed(false);
    setPw("");
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    const activePass = getActivePass();
    if (curPw !== activePass && curPw !== ADMIN_PASS) {
      setChangePwMsg("Mật khẩu hiện tại không đúng.");
      return;
    }
    if (!newPwVal.trim() || newPwVal.length < 4) {
      setChangePwMsg("Mật khẩu mới phải từ 4 ký tự trở lên.");
      return;
    }
    try {
      localStorage.setItem("ocop-custom-admin-pass", newPwVal.trim());
      setChangePwMsg("✓ Đã cập nhật mật khẩu quản trị mới thành công!");
      setTimeout(() => {
        setChangePwOpen(false);
        setCurPw("");
        setNewPwVal("");
        setChangePwMsg("");
      }, 1500);
    } catch {
      setChangePwMsg("Lỗi lưu trữ cục bộ.");
    }
  };

  const P = db?.products || [];
  const n = P.length || 1;
  const day = 864e5;

  const rows = useMemo(() => {
    return P.map((p) => {
      const last = Math.max(0, ...(p.entries || []).map((e) => e.ts || 0));
      const i = [];
      if ((p.entries || []).length < 3) i.push("ít mốc nhật ký");
      if (!(p.entries || []).some((e) => e.photo)) i.push("thiếu ảnh thật");
      if (!p.story) i.push("thiếu câu chuyện");
      if (!p.shop) i.push("chưa có link bán");
      if (last && Date.now() - last > 14 * day) i.push("lâu chưa cập nhật");
      return { p, i, last };
    });
  }, [P]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      ({ p }) =>
        p.name.toLowerCase().includes(q) ||
        (p.farm || "").toLowerCase().includes(q) ||
        (p.certs || "").toLowerCase().includes(q)
    );
  }, [rows, search]);

  const cnt = (f) => P.filter(f).length;
  const farms = new Set(P.map((p) => p.farm || p.name)).size;
  const totalEntries = P.reduce((s, p) => s + (p.entries || []).length, 0);
  const avgEntries = Math.round(totalEntries / n) || 0;
  const verifiedCount = cnt((p) => p.verified);
  const verifiedPercent = Math.round((verifiedCount / n) * 100);

  const bars = [
    ["Nhật ký từ 3 mốc", cnt((p) => (p.entries || []).length >= 3)],
    ["Có ảnh thực tế", cnt((p) => (p.entries || []).some((e) => e.photo))],
    ["Đã xác minh OCOP", verifiedCount],
    ["Nội dung AI đã duyệt", cnt((p) => p.content?.approved)],
    ["Có link sàn TMĐT", cnt((p) => p.shop)],
  ];

  const exp = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([JSON.stringify(db, null, 2)], { type: "application/json" })
    );
    a.download = `ocop-passport-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  // 1. MÀN HÌNH ĐĂNG NHẬP
  if (!checked) return <p style={{ padding: 48, textAlign: "center", color: "#94A3B8" }}>Đang tải…</p>;

  if (!authed) {
    return (
      <div className="dash-login-wrap">
        <div className="login-card">
          <div className="glow-bar" />

          <div className="login-header">
            <div className="login-icon">
              <Icon name="lock" />
            </div>
            <div>
              <span className="badge-blue">Cổng quản trị riêng</span>
              <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>Xác thực hệ thống OCOP</div>
            </div>
          </div>

          <h1 className="login-title">Đăng nhập Bảng điều khiển</h1>
          <p className="login-sub">
            Dành cho Đoàn xã, phường &amp; Đơn vị quản lý OCOP xác minh và quản lý dữ liệu số hóa nông sản.
          </p>

          <form onSubmit={login}>
            <div className="field-group">
              <label htmlFor="admin-pw" className="field-label">
                Mật khẩu quản trị
              </label>
              <div className="input-rel">
                <span className="input-icon-left">
                  <Icon name="lock" />
                </span>
                <input
                  id="admin-pw"
                  type={showPw ? "text" : "password"}
                  autoFocus
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  placeholder="Nhập mật khẩu…"
                  className="dash-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="pw-toggle-btn"
                  title={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  <Icon name={showPw ? "eye-off" : "eye"} />
                </button>
              </div>

              <label className="remember-row">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>Ghi nhớ đăng nhập trên thiết bị này</span>
              </label>

              <div className="pw-note-row">
                <span>Ghi chú mật khẩu:</span>
                <button
                  type="button"
                  onClick={() => setPw("ocop2026")}
                  className="demo-pw-btn"
                  title="Bấm để điền nhanh"
                >
                  ocop2026
                </button>
              </div>
            </div>

            {err && <div className="err-box">{err}</div>}

            <div className="btn-stack">
              <button type="submit" className="btn-primary-glow">
                <span>Mở bảng điều khiển →</span>
              </button>
              <Link href="/" className="btn-back-home">
                ← Quay lại trang chính
              </Link>
            </div>
          </form>
        </div>

        <style jsx>{`
          .dash-login-wrap {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 100px 20px 48px;
            background: #070B14;
          }
          .login-card {
            width: 100%;
            max-width: 440px;
            background: #0F172A;
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 20px;
            padding: 36px 32px;
            position: relative;
            overflow: hidden;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(0, 229, 255, 0.15);
          }
          .glow-bar {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(90deg, transparent, #00E5FF, #38BDF8, transparent);
          }
          .login-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 20px;
          }
          .login-icon {
            width: 40px;
            height: 40px;
            border-radius: 12px;
            background: #00E5FF;
            display: grid;
            place-items: center;
            color: #070B14;
            box-shadow: 0 0 15px rgba(0, 229, 255, 0.4);
          }
          .badge-blue {
            background: rgba(0, 229, 255, 0.12);
            color: #00E5FF;
            border: 1px solid rgba(0, 229, 255, 0.3);
            padding: 3px 10px;
            border-radius: 99px;
            font-size: 11px;
            font-weight: 750;
            letter-spacing: 0.04em;
          }
          .login-title {
            font-size: 24px;
            font-weight: 850;
            color: #FFFFFF;
            margin: 0 0 8px;
          }
          .login-sub {
            font-size: 13.5px;
            color: #94A3B8;
            margin: 0 0 24px;
            line-height: 1.5;
          }
          .field-group {
            margin-bottom: 16px;
          }
          .field-label {
            display: block;
            font-size: 11.5px;
            font-weight: 750;
            color: #CBD5E1;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 8px;
          }
          .input-rel {
            position: relative;
          }
          .input-icon-left {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: #64748B;
            display: flex;
          }
          .dash-input {
            width: 100%;
            padding: 12px 40px 12px 38px;
            background: #070B14;
            border: 1px solid rgba(255, 255, 255, 0.18);
            border-radius: 12px;
            color: #FFFFFF;
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s;
          }
          .dash-input:focus {
            border-color: #00E5FF;
            box-shadow: 0 0 12px rgba(0, 229, 255, 0.25);
          }
          .pw-toggle-btn {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: #64748B;
            cursor: pointer;
            display: flex;
          }
          .pw-toggle-btn:hover {
            color: #E2E8F0;
          }
          .remember-row {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            color: #94A3B8;
            cursor: pointer;
            margin-top: 10px;
            user-select: none;
          }
          .remember-row input {
            cursor: pointer;
            accent-color: #00E5FF;
          }
          .pw-note-row {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            color: #94A3B8;
            margin-top: 8px;
          }
          .err-box {
            padding: 10px 14px;
            background: rgba(239, 68, 68, 0.15);
            border: 1px solid rgba(239, 68, 68, 0.35);
            border-radius: 10px;
            color: #FCA5A5;
            font-size: 12.5px;
            margin-bottom: 16px;
          }
          .btn-stack {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          .btn-primary-glow {
            width: 100%;
            padding: 12px;
            background: #00E5FF;
            color: #070B14;
            font-weight: 800;
            font-size: 14.5px;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            box-shadow: 0 0 18px rgba(0, 229, 255, 0.4);
            transition: transform 0.15s, background 0.15s;
          }
          .btn-primary-glow:hover {
            background: #38BDF8;
            transform: translateY(-1px);
          }
          .btn-back-home {
            width: 100%;
            padding: 10px;
            background: rgba(255, 255, 255, 0.05);
            color: #CBD5E1;
            font-weight: 700;
            font-size: 13.5px;
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 12px;
            text-align: center;
            text-decoration: none;
            transition: background 0.15s;
          }
          .btn-back-home:hover {
            background: rgba(255, 255, 255, 0.1);
          }
          .demo-hint {
            margin-top: 18px;
            padding-top: 14px;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            text-align: center;
            font-size: 12px;
            color: #64748B;
          }
          .demo-pw-btn {
            font-family: monospace;
            background: #070B14;
            border: 1px solid rgba(0, 229, 255, 0.3);
            color: #00E5FF;
            padding: 2px 6px;
            border-radius: 6px;
            font-weight: 700;
            cursor: pointer;
          }
        `}</style>
      </div>
    );
  }

  // 2. GIAO DIỆN CHÍNH BẢNG ĐIỀU KHIỂN (CHUẨN BỐ CỤC KHÔNG DÙNG TAILWIND)
  return (
    <div className="dash-container">
      {/* Top Header / Actions Area */}
      <div className="dash-header-wrap">
        <div>
          <h1 className="dash-main-title">Bảng điều khiển quản lý</h1>
          <p className="dash-main-sub">
            Theo dõi mức độ số hóa, xác minh hộ chiếu trước khi hiển thị công khai và phát hiện cơ sở cần hỗ trợ.
          </p>
        </div>

        <div className="dash-actions-row">
<button onClick={exp} className="btn-outline-action" title="Tải file JSON sao lưu toàn bộ dữ liệu">
            <Icon name="download" />
            <span>Xuất dữ liệu (JSON)</span>
          </button>
          <Link href="/diary" className="btn-primary-action">
            <Icon name="plus" />
            <span>Tạo sản phẩm mới</span>
          </Link>
          <button
            type="button"
            onClick={() => setChangePwOpen(true)}
            className="btn-outline-action"
            title="Đổi mật khẩu bảo vệ bảng điều khiển"
          >
            <Icon name="key" />
            <span>Đổi mật khẩu</span>
          </button>
          <button onClick={logout} className="btn-logout-action" title="Khóa bảng điều khiển và đăng xuất">
            <Icon name="lock" />
            <span>Khóa &amp; Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* 4 Stats Cards Grid */}
      <div className="stats-cards-grid">
        {/* Card 1 */}
        <div className="dash-stat-card">
          <div>
            <div className="stat-card-title">Cơ sở / HTX tham gia</div>
            <div className="stat-card-number">{farms}</div>
          </div>
          <div className="stat-card-footer green">
            <Icon name="trending-up" />
            <span>+12% so với tháng trước</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="dash-stat-card">
          <div>
            <div className="stat-card-title">Sản phẩm có hộ chiếu</div>
            <div className="stat-card-number">{P.length}</div>
          </div>
          <div className="stat-card-footer mute">
            <span>Đã phủ rộng các xã, phường Đồng Nai</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="dash-stat-card">
          <div>
            <div className="stat-card-title">Tổng mốc nhật ký</div>
            <div className="stat-card-number">{totalEntries.toLocaleString("vi-VN")}</div>
          </div>
          <div className="stat-card-footer mute">
            <span>Mỗi sản phẩm ~{avgEntries} mốc</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="dash-stat-card">
          <div>
            <div className="stat-card-title">Hộ chiếu đã xác minh</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span className="stat-card-number">{verifiedCount}</span>
              <span style={{ fontSize: 13, color: "#94A3B8" }}>/ {P.length} ({verifiedPercent}%)</span>
            </div>
          </div>
          <div className="mini-progress-track">
            <div className="mini-progress-bar" style={{ width: `${verifiedPercent}%` }} />
          </div>
        </div>
      </div>

      {/* Content Layout: 2 Columns */}
      <div className="dash-content-grid">
        {/* CỘT TRÁI: TIẾN ĐỘ SỐ HÓA */}
        <div className="dash-col-left">
          <div className="dash-panel">
            <h2 className="panel-title">Mức độ hoàn thiện hồ sơ số</h2>

            <div className="progress-list">
              {bars.map(([label, val]) => {
                const pct = Math.round((val / n) * 100);
                return (
                  <div key={label} className="progress-item">
                    <div className="progress-label-row">
                      <span className="label-text">{label}</span>
                      <strong className="label-fraction">{val}/{P.length}</strong>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="info-tip-box">
              <div className="tip-icon">
                <Icon name="info" />
              </div>
              <p className="tip-text">
                <strong>Mẹo quản lý:</strong> Các sản phẩm có mức độ hoàn thiện dưới 50% hoặc thiếu ảnh thực địa sẽ được ưu tiên hiển thị để Đoàn viên hỗ trợ nhập liệu.
              </p>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: DANH SÁCH SẢN PHẨM & XÁC MINH */}
        <div className="dash-col-right">
          <div className="dash-panel" style={{ padding: 0 }}>
            {/* Header + Search */}
            <div className="panel-header-row">
              <h2 className="panel-title" style={{ margin: 0 }}>Xác minh hộ chiếu &amp; Hỗ trợ cơ sở</h2>

              <div className="search-wrapper">
                <span className="search-icon">
                  <Icon name="search" />
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm tên, cơ sở..."
                  className="search-input-field"
                />
              </div>
            </div>

            {/* Product List */}
            <div className="product-items-list">
              {filteredRows.length === 0 ? (
                <div style={{ padding: 40, textAlign: "center", color: "#64748B" }}>
                  <p>Không tìm thấy sản phẩm nào phù hợp.</p>
                </div>
              ) : (
                filteredRows.map(({ p, i, last }) => (
                  <div key={p.id} className="product-row-item">
                    <div className="product-info-left">
                      <div className="product-title-row">
                        <h3 className="product-name">{p.name}</h3>
                        {p.verified ? (
                          <span className="badge-green">
                            <Icon name="check-circle" />
                            <span>Đã xác minh</span>
                          </span>
                        ) : (
                          <span className="badge-gray">Chờ xác minh</span>
                        )}
                      </div>

                      <div className="product-meta" style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
                        <span>{p.farm || "Chưa cập nhật cơ sở"} · {last ? `Cập nhật ${fmt(last)}` : "Chưa có nhật ký"}</span>
                        <span style={{ color: "#64748B" }}>·</span>
                        {editingPriceId === p.id ? (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              const num = parseInt(String(editingPriceVal).replace(/\D/g, ""), 10);
                              if (!isNaN(num) && num > 0) {
                                save((d) => {
                                  const x = d.products.find((y) => y.id === p.id);
                                  if (x) x.price = num;
                                });
                                setEditingPriceId(null);
                              }
                            }}
                            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                          >
                            <span style={{ fontSize: 12, color: "#38BDF8", fontWeight: 700 }}>Giá:</span>
                            <input
                              type="number"
                              step="5000"
                              min="1000"
                              value={editingPriceVal}
                              onChange={(e) => setEditingPriceVal(e.target.value)}
                              autoFocus
                              style={{
                                width: 110,
                                padding: "3px 6px",
                                background: "#070B14",
                                border: "1px solid #00E5FF",
                                borderRadius: 6,
                                color: "#FFFFFF",
                                fontSize: 13,
                                fontWeight: 800,
                              }}
                            />
                            <button
                              type="submit"
                              style={{
                                padding: "3px 8px",
                                background: "#00E5FF",
                                color: "#070B14",
                                border: "none",
                                borderRadius: 6,
                                fontWeight: 800,
                                fontSize: 12,
                                cursor: "pointer",
                              }}
                            >
                              Lưu
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingPriceId(null)}
                              style={{
                                padding: "3px 6px",
                                background: "transparent",
                                color: "#94A3B8",
                                border: "1px solid rgba(255,255,255,0.15)",
                                borderRadius: 6,
                                fontSize: 12,
                                cursor: "pointer",
                              }}
                            >
                              ✕
                            </button>
                          </form>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPriceId(p.id);
                              setEditingPriceVal(String(p.price || 145000));
                            }}
                            title="Bấm để sửa giá sản phẩm này"
                            style={{
                              background: "rgba(56, 189, 248, 0.08)",
                              border: "1px solid rgba(56, 189, 248, 0.25)",
                              color: "#38BDF8",
                              padding: "2px 8px",
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <span>🏷️ Giá: {fmtVND(p.price || 145000)}</span>
                            <span style={{ fontSize: 11, textDecoration: "underline" }}>[Sửa]</span>
                          </button>
                        )}
                      </div>

                      {/* Issues */}
                      {i.length > 0 ? (
                        <div className="issues-row">
                          {i.map((issue) => (
                            <span key={issue} className="issue-pill">
                              Cần hỗ trợ: {issue}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="complete-row">
                          <Icon name="check-circle" />
                          <span>Hồ sơ đầy đủ</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="product-actions-right">
                      <Link href={`/p/${p.id}`} className="btn-view-passport">
                        Xem hộ chiếu
                      </Link>

                      <button
                        type="button"
                        onClick={() =>
                          save((d) => {
                            const x = d.products.find((y) => y.id === p.id);
                            if (x) x.verified = !x.verified;
                          })
                        }
                        className={p.verified ? "btn-toggle-unverify" : "btn-toggle-verify"}
                      >
                        {p.verified ? "Bỏ xác minh" : "Xác minh ngay"}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Bạn có chắc muốn xóa vĩnh viễn sản phẩm "${p.name}" không?`)) {
                            save((d) => {
                              d.products = d.products.filter((y) => y.id !== p.id);
                            });
                          }
                        }}
                        className="btn-trash"
                        title={`Xóa sản phẩm "${p.name}"`}
                      >
                        <Icon name="trash" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Summary Footer */}
            <div className="panel-footer-count">
              <span>
                Hiển thị <strong style={{ color: "#00E5FF" }}>{filteredRows.length}</strong> / {P.length} sản phẩm OCOP
              </span>
            </div>
          </div>
        </div>
      </div>

      {changePwOpen && (
        <div className="pw-modal-overlay" onClick={() => setChangePwOpen(false)}>
          <div className="pw-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="pw-modal-head">
              <h3 style={{ margin: 0, fontSize: 18, color: "#FFFFFF" }}>Đổi mật khẩu Quản trị</h3>
              <button
                type="button"
                className="pw-modal-close"
                onClick={() => setChangePwOpen(false)}
                title="Đóng"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleChangePassword}>
              <div style={{ marginBottom: 12 }}>
                <label className="field-label">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  className="dash-input"
                  placeholder="Nhập mật khẩu hiện tại (mặc định: ocop2026)…"
                  value={curPw}
                  onChange={(e) => setCurPw(e.target.value)}
                  required
                />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label className="field-label">Mật khẩu mới</label>
                <input
                  type="password"
                  className="dash-input"
                  placeholder="Nhập mật khẩu mới (tối thiểu 4 ký tự)…"
                  value={newPwVal}
                  onChange={(e) => setNewPwVal(e.target.value)}
                  required
                />
              </div>
              {changePwMsg && (
                <div style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  fontSize: 12.5,
                  fontWeight: 600,
                  marginBottom: 14,
                  background: changePwMsg.startsWith("✓") ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                  color: changePwMsg.startsWith("✓") ? "#34D399" : "#F87171",
                  border: changePwMsg.startsWith("✓") ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(239, 68, 68, 0.3)",
                }}>
                  {changePwMsg}
                </div>
              )}
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button
                  type="button"
                  className="btn-outline-action"
                  onClick={() => setChangePwOpen(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-primary-action"
                >
                  Lưu mật khẩu mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .dash-container {
          max-width: min(1780px, 97vw);
          margin: 0 auto;
          padding: 104px max(24px, 2.5vw) 60px;
          color: #F1F5F9;
        }

        .pw-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(11, 19, 32, 0.85);
          backdrop-filter: blur(8px);
          display: grid;
          place-items: center;
          z-index: 9999;
          padding: 16px;
        }

        .pw-modal-card {
          width: 100%;
          max-width: 440px;
          background: #131E31;
          border: 1.5px solid rgba(0, 229, 255, 0.3);
          border-radius: 18px;
          padding: 24px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
        }

        .pw-modal-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .pw-modal-close {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 50%;
          width: 32px;
          height: 32px;
          color: #94A3B8;
          cursor: pointer;
          padding: 0;
          display: grid;
          place-items: center;
          transition: all 0.15s ease;
        }

        .pw-modal-close:hover {
          color: #FFFFFF;
          background: rgba(255, 255, 255, 0.12);
          border-color: #00E5FF;
        }

        .dash-header-wrap {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 20px;
          flex-wrap: wrap;
          margin-bottom: 28px;
        }

        .dash-main-title {
          font-size: clamp(26px, 3.2vw, 36px);
          font-weight: 850;
          color: #FFFFFF;
          margin: 8px 0 6px;
          letter-spacing: -0.02em;
        }

        .dash-main-sub {
          margin: 0;
          font-size: 14.5px;
          color: #94A3B8;
          max-width: 600px;
          line-height: 1.5;
        }

        .dash-actions-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .btn-outline-action {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 16px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.16);
          color: #E2E8F0;
          font-size: 13.5px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-outline-action:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: #00E5FF;
          color: #00E5FF;
        }

        .btn-primary-action {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 18px;
          border-radius: 10px;
          background: #00E5FF;
          color: #070B14;
          font-size: 13.5px;
          font-weight: 800;
          text-decoration: none;
          box-shadow: 0 0 16px rgba(0, 229, 255, 0.4);
          transition: all 0.2s;
        }

        .btn-primary-action:hover {
          background: #38BDF8;
          transform: translateY(-1px);
        }

        .btn-logout-action {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 9px 14px;
          border-radius: 10px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.25);
          color: #F87171;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-logout-action:hover {
          background: rgba(239, 68, 68, 0.2);
          color: #EF4444;
        }

        /* 4 Stats Cards Grid */
        .stats-cards-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 28px;
        }

        .dash-stat-card {
          background: #0F172A;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 125px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
        }

        .stat-card-title {
          font-size: 12px;
          font-weight: 750;
          color: #94A3B8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }

        .stat-card-number {
          font-size: 28px;
          font-weight: 850;
          color: #00E5FF;
          line-height: 1;
        }

        .stat-card-footer {
          margin-top: 12px;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .stat-card-footer.green {
          color: #34D399;
          font-weight: 700;
        }

        .stat-card-footer.mute {
          color: #64748B;
        }

        .mini-progress-track {
          margin-top: 12px;
          width: 100%;
          height: 6px;
          background: #1E293B;
          border-radius: 99px;
          overflow: hidden;
        }

        .mini-progress-bar {
          height: 100%;
          border-radius: 99px;
          background: #00E5FF;
          box-shadow: 0 0 8px rgba(0, 229, 255, 0.6);
        }

        /* 2 Columns Grid */
        .dash-content-grid {
          display: grid;
          grid-template-columns: 360px 1fr;
          gap: 24px;
          align-items: start;
        }

        .dash-panel {
          background: #0F172A;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 18px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
          overflow: hidden;
        }

        .panel-title {
          font-size: 17px;
          font-weight: 800;
          color: #FFFFFF;
          margin: 0 0 20px;
        }

        /* Progress list */
        .progress-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .progress-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .progress-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13.5px;
        }

        .label-text {
          color: #CBD5E1;
        }

        .label-fraction {
          color: #00E5FF;
          font-weight: 800;
        }

        .progress-track {
          width: 100%;
          height: 8px;
          background: #1E293B;
          border-radius: 99px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          border-radius: 99px;
          background: linear-gradient(90deg, #00E5FF, #38BDF8);
          box-shadow: 0 0 8px rgba(0, 229, 255, 0.4);
          transition: width 0.4s ease;
        }

        .info-tip-box {
          margin-top: 24px;
          padding: 14px;
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .tip-icon {
          color: #00E5FF;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .tip-text {
          margin: 0;
          font-size: 12.5px;
          color: #94A3B8;
          line-height: 1.5;
        }

        .tip-text strong {
          color: #F1F5F9;
        }

        /* Right Column Panel */
        .panel-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.02);
          flex-wrap: wrap;
        }

        .search-wrapper {
          position: relative;
          min-width: 240px;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #64748B;
          display: flex;
        }

        .search-input-field {
          width: 100%;
          padding: 8px 14px 8px 36px;
          background: #070B14;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 10px;
          color: #FFFFFF;
          font-size: 13px;
          outline: none;
        }

        .search-input-field:focus {
          border-color: #00E5FF;
          box-shadow: 0 0 10px rgba(0, 229, 255, 0.25);
        }

        /* Products List */
        .product-items-list {
          display: flex;
          flex-direction: column;
        }

        .product-row-item {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          transition: background 0.15s;
        }

        .product-row-item:hover {
          background: rgba(255, 255, 255, 0.02);
        }

        .product-info-left {
          flex: 1;
          min-width: 260px;
        }

        .product-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 4px;
          flex-wrap: wrap;
        }

        .product-name {
          font-size: 16px;
          font-weight: 800;
          color: #FFFFFF;
          margin: 0;
        }

        .product-meta {
          font-size: 13px;
          color: #94A3B8;
        }

        .issues-row {
          margin-top: 8px;
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .issue-pill {
          font-size: 11.5px;
          font-weight: 700;
          color: #FCD34D;
          background: rgba(245, 158, 11, 0.15);
          border: 1px solid rgba(245, 158, 11, 0.35);
          padding: 3px 8px;
          border-radius: 6px;
        }

        .complete-row {
          margin-top: 8px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 12.5px;
          font-weight: 750;
          color: #34D399;
        }

        /* Badges */
        .badge-green {
          background: rgba(16, 185, 129, 0.15);
          color: #34D399;
          border: 1px solid rgba(16, 185, 129, 0.3);
          padding: 2px 10px;
          border-radius: 99px;
          font-size: 11.5px;
          font-weight: 750;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .badge-gray {
          background: rgba(148, 163, 184, 0.12);
          color: #94A3B8;
          border: 1px solid rgba(148, 163, 184, 0.25);
          padding: 2px 10px;
          border-radius: 99px;
          font-size: 11.5px;
          font-weight: 750;
        }

        .badge-blue {
          background: rgba(0, 229, 255, 0.12);
          color: #00E5FF;
          border: 1px solid rgba(0, 229, 255, 0.3);
          padding: 3px 10px;
          border-radius: 99px;
          font-size: 11px;
          font-weight: 750;
          letter-spacing: 0.04em;
          display: inline-block;
          margin-bottom: 6px;
        }

        /* Product Actions */
        .product-actions-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .btn-view-passport {
          padding: 7px 12px;
          border-radius: 8px;
          font-size: 12.5px;
          font-weight: 700;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.14);
          color: #E2E8F0;
          text-decoration: none;
          transition: all 0.15s;
        }

        .btn-view-passport:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #00E5FF;
        }

        .btn-toggle-verify {
          padding: 7px 14px;
          border-radius: 8px;
          font-size: 12.5px;
          font-weight: 800;
          background: #00E5FF;
          color: #070B14;
          border: none;
          cursor: pointer;
          box-shadow: 0 0 12px rgba(0, 229, 255, 0.35);
          transition: all 0.15s;
        }

        .btn-toggle-verify:hover {
          background: #38BDF8;
          transform: translateY(-1px);
        }

        .btn-toggle-unverify {
          padding: 7px 12px;
          border-radius: 8px;
          font-size: 12.5px;
          font-weight: 700;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.14);
          color: #94A3B8;
          cursor: pointer;
          transition: all 0.15s;
        }

        .btn-toggle-unverify:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #E2E8F0;
        }

        .btn-trash {
          padding: 7px 10px;
          border-radius: 8px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.25);
          color: #F87171;
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: all 0.15s;
        }

        .btn-trash:hover {
          background: rgba(239, 68, 68, 0.25);
          color: #EF4444;
        }

        .panel-footer-count {
          padding: 14px 24px;
          background: rgba(7, 11, 20, 0.6);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 13px;
          color: #94A3B8;
          text-align: center;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .stats-cards-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .dash-content-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .dash-container {
            padding: 88px 16px 40px;
          }
          .stats-cards-grid {
            grid-template-columns: 1fr;
          }
          .product-row-item {
            flex-direction: column;
            align-items: flex-start;
          }
          .product-actions-right {
            width: 100%;
            justify-content: flex-end;
          }
        }
      `}</style>
    </div>
  );
}

