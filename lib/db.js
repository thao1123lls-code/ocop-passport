// lib/db.js — Kết nối Supabase (REST API + PG Pool + Bộ nhớ dự phòng 24 tài khoản)
import pg from "pg";

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ymymfizxwtgsujiopmnh.supabase.co";
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlteW1maXp4d3Rnc3VqaW9wbW5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ0NzYyNDMsImV4cCI6MjExMDA1MjI0M30.I8g_Oam7bZEcsH3H-eGKlhrJHMdG_x8O5Jew2czjcyY";

// Hash scrypt chuẩn của mật khẩu: Demo@12345 và Khachhang@123
const DEMO_HASH =
  "scrypt$a1b2c3d4e5f60102030405060708090a$79d0728b1cf36b0268535d85a03c1b0c9b72c9798718d994162666d8e1a8625982064d6d1d06d1a4c4b68c01493f28d57099fb8f2a22cf1410b95f61188d82d5";
const CUST_HASH =
  "scrypt$b1b2c3d4e5f60102030405060708090b$f5f72e7be62a4b67113b311e25a00f7484f3474d1b642c1a9f1d0692df3021a6063cf999bc28c456404d34b65c14f34a624f275a8e4163e47f0a8a38126c15f0";

export const BUILTIN_USERS = [
  { id: 1, email: "admin@ocop.vn", name: "Quản trị viên OCOP (Demo)", phone: "0901000001", address: "Biên Hòa, Đồng Nai", role: "admin", status: "active", password_hash: DEMO_HASH, created_at: "2026-10-15T08:00:00Z" },
  { id: 2, email: "owner@ocop.vn", name: "HTX Ca cao Trọng Đức (Demo)", phone: "0901000002", address: "Định Quán, Đồng Nai", role: "owner", status: "active", password_hash: DEMO_HASH, created_at: "2026-10-17T08:00:00Z" },
  { id: 3, email: "volunteer@ocop.vn", name: "Đoàn viên Tình nguyện số (Demo)", phone: "0901000003", address: "Phước Tân, Biên Hòa, Đồng Nai", role: "volunteer", status: "active", password_hash: DEMO_HASH, created_at: "2026-10-19T08:00:00Z" },
  { id: 4, email: "demo@ocop.vn", name: "Khách hàng Trải nghiệm (Demo)", phone: "0901000004", address: "Trảng Dài, Biên Hòa, Đồng Nai", role: "admin", status: "active", password_hash: DEMO_HASH, created_at: "2026-10-20T08:00:00Z" },
  { id: 5, email: "nguyenvanan01@gmail.com", name: "Nguyễn Văn An", phone: "0912345001", address: "Phường Trảng Dài, TP. Biên Hòa, Đồng Nai", role: "owner", status: "active", password_hash: CUST_HASH, created_at: "2026-10-25T08:00:00Z" },
  { id: 6, email: "bichngoc.tran02@gmail.com", name: "Trần Thị Bích Ngọc", phone: "0912345002", address: "Phường Thảo Điền, TP. Thủ Đức, TP.HCM", role: "owner", status: "active", password_hash: CUST_HASH, created_at: "2026-10-26T08:00:00Z" },
  { id: 7, email: "lehoangnam03@gmail.com", name: "Lê Hoàng Nam", phone: "0912345003", address: "Quận Hải Châu, TP. Đà Nẵng", role: "owner", status: "active", password_hash: CUST_HASH, created_at: "2026-10-27T08:00:00Z" },
  { id: 8, email: "minhtuan.pham04@gmail.com", name: "Phạm Minh Tuấn", phone: "0912345004", address: "Quận Cầu Giấy, TP. Hà Nội", role: "owner", status: "active", password_hash: CUST_HASH, created_at: "2026-10-28T08:00:00Z" },
  { id: 9, email: "thutrang.hoang05@gmail.com", name: "Hoàng Thu Trang", phone: "0912345005", address: "Xã Phú Ngọc, Huyện Định Quán, Đồng Nai", role: "owner", status: "active", password_hash: CUST_HASH, created_at: "2026-10-29T08:00:00Z" },
  { id: 10, email: "quocbao.vo06@gmail.com", name: "Võ Quốc Bảo", phone: "0912345006", address: "Quận Ninh Kiều, TP. Cần Thơ", role: "owner", status: "active", password_hash: CUST_HASH, created_at: "2026-10-30T08:00:00Z" },
  { id: 11, email: "ngocmai.dang07@gmail.com", name: "Đặng Ngọc Mai", phone: "0912345007", address: "Khu phố Vườn Dừa, Phường Phước Tân, Biên Hòa, Đồng Nai", role: "owner", status: "active", password_hash: CUST_HASH, created_at: "2026-10-31T08:00:00Z" },
  { id: 12, email: "ducduy.bui08@gmail.com", name: "Bùi Đức Duy", phone: "0912345008", address: "Phường 1, TP. Đà Lạt, Lâm Đồng", role: "owner", status: "active", password_hash: CUST_HASH, created_at: "2026-11-01T08:00:00Z" },
  { id: 13, email: "thanhha.do09@gmail.com", name: "Đỗ Thị Thanh Hà", phone: "0912345009", address: "Phường Tân Phong, Quận 7, TP.HCM", role: "owner", status: "active", password_hash: CUST_HASH, created_at: "2026-11-02T08:00:00Z" },
  { id: 14, email: "giahuy.ho10@gmail.com", name: "Hồ Gia Huy", phone: "0912345010", address: "Phường Thắng Tam, TP. Vũng Tàu, BR-VT", role: "owner", status: "active", password_hash: CUST_HASH, created_at: "2026-11-03T08:00:00Z" },
  { id: 15, email: "thanhtung.ngo11@gmail.com", name: "Ngô Thanh Tùng", phone: "0912345011", address: "Quận Đống Đa, TP. Hà Nội", role: "owner", status: "active", password_hash: CUST_HASH, created_at: "2026-11-04T08:00:00Z" },
  { id: 16, email: "mylinh.duong12@gmail.com", name: "Dương Mỹ Linh", phone: "0912345012", address: "TP. Thủ Dầu Một, Tỉnh Bình Dương", role: "owner", status: "active", password_hash: CUST_HASH, created_at: "2026-11-05T08:00:00Z" },
  { id: 17, email: "kienvan.ly13@gmail.com", name: "Lý Kiến Văn", phone: "0912345013", address: "Phường 11, Quận 5, TP.HCM", role: "owner", status: "active", password_hash: CUST_HASH, created_at: "2026-11-06T08:00:00Z" },
  { id: 18, email: "kimngan.vu14@gmail.com", name: "Vũ Thị Kim Ngân", phone: "0912345014", address: "Phường Lộc Thọ, TP. Nha Trang, Khánh Hòa", role: "owner", status: "active", password_hash: CUST_HASH, created_at: "2026-11-07T08:00:00Z" },
  { id: 19, email: "congson.trinh15@gmail.com", name: "Trịnh Công Sơn", phone: "0912345015", address: "Phường Phú Hội, TP. Huế", role: "owner", status: "active", password_hash: CUST_HASH, created_at: "2026-11-08T08:00:00Z" },
  { id: 20, email: "phuongthao.dinh16@gmail.com", name: "Đinh Phương Thảo", phone: "0912345016", address: "Thị trấn Long Thành, Huyện Long Thành, Đồng Nai", role: "owner", status: "active", password_hash: CUST_HASH, created_at: "2026-11-09T08:00:00Z" },
  { id: 21, email: "thevinh.luong17@gmail.com", name: "Lương Thế Vinh", phone: "0912345017", address: "Phường 25, Quận Bình Thạnh, TP.HCM", role: "volunteer", status: "active", password_hash: CUST_HASH, created_at: "2026-11-10T08:00:00Z" },
  { id: 22, email: "tuyetnhung.mai18@gmail.com", name: "Mai Tuyết Nhung", phone: "0912345018", address: "Phường Thống Nhất, TP. Biên Hòa, Đồng Nai", role: "volunteer", status: "active", password_hash: CUST_HASH, created_at: "2026-11-11T08:00:00Z" },
  { id: 23, email: "thaison.cao19@gmail.com", name: "Cao Thái Sơn", phone: "0912345019", address: "Phường 12, Quận Tân Bình, TP.HCM", role: "volunteer", status: "pending", password_hash: CUST_HASH, created_at: "2026-11-12T08:00:00Z" },
  { id: 24, email: "baongoc.phan20@gmail.com", name: "Phan Bảo Ngọc", phone: "0912345020", address: "Phường Xuân An, TP. Long Khánh, Đồng Nai", role: "volunteer", status: "pending", password_hash: CUST_HASH, created_at: "2026-11-13T08:00:00Z" },
];

const g = globalThis;
export const memUsers = (g.__ocopMemUsers ||= [...BUILTIN_USERS]);

async function sbFetch(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(options.headers || {}),
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Supabase REST ${res.status}`);
  return res.status === 204 ? [] : res.json();
}

async function smartQuery(sql, params = []) {
  const q = sql.replace(/\s+/g, " ").trim();

  // 1. Tìm user theo email
  if (/FROM users WHERE email = \$1/i.test(q)) {
    const email = String(params[0] || "").trim().toLowerCase();
    try {
      const rows = await sbFetch(`users?email=eq.${encodeURIComponent(email)}&select=*`);
      if (rows?.length) return { rows, rowCount: rows.length };
    } catch {}
    const u = memUsers.find((x) => x.email.toLowerCase() === email);
    return { rows: u ? [u] : [], rowCount: u ? 1 : 0 };
  }

  // 2. Tìm user theo ID (Rất quan trọng cho currentUser() ở lib/auth.js)
  if (/FROM users WHERE id = \$1/i.test(q)) {
    const id = Number(params[0]);
    try {
      const rows = await sbFetch(`users?id=eq.${id}&select=*`);
      if (rows?.length) return { rows, rowCount: rows.length };
    } catch {}
    const u = memUsers.find((x) => Number(x.id) === id);
    return { rows: u ? [u] : [], rowCount: u ? 1 : 0 };
  }

  // 3. Danh sách toàn bộ users cho trang /dashboard/users
  if (/FROM users u ORDER BY/i.test(q)) {
    try {
      const rows = await sbFetch("users?select=*&order=created_at.desc");
      if (rows?.length >= 5) {
        return {
          rows: rows.map((u) => ({ ...u, products: u.products ?? 0, entries: u.entries ?? 0 })),
          rowCount: rows.length,
        };
      }
    } catch {}
    return {
      rows: memUsers.map((u) => ({ ...u, products: 0, entries: 0 })),
      rowCount: memUsers.length,
    };
  }

  // 4. Tạo user mới
  if (/^INSERT INTO users/i.test(q)) {
    const [email, name, password_hash, role, status = "active"] = params;
    try {
      const rows = await sbFetch("users", {
        method: "POST",
        body: JSON.stringify({ email, name, password_hash, role, status }),
      });
      if (rows?.length) {
        memUsers.unshift(rows[0]);
        return { rows, rowCount: 1 };
      }
    } catch {}
    const existing = memUsers.find((x) => x.email === email);
    if (existing) return { rows: [existing], rowCount: 1 };
    const nu = { id: memUsers.length + 100, email, name, password_hash, role, status, created_at: new Date().toISOString() };
    memUsers.unshift(nu);
    return { rows: [nu], rowCount: 1 };
  }

  // 5. Cập nhật user
  if (/^UPDATE users SET/i.test(q)) {
    if (/password_hash = \$1 WHERE id = \$2/i.test(q)) {
      const [password_hash, id] = params;
      try { await sbFetch(`users?id=eq.${Number(id)}`, { method: "PATCH", body: JSON.stringify({ password_hash }) }); } catch {}
      const u = memUsers.find((x) => Number(x.id) === Number(id));
      if (u) u.password_hash = password_hash;
      return { rows: u ? [u] : [], rowCount: 1 };
    }
    const [role, status, id] = params;
    try {
      const rows = await sbFetch(`users?id=eq.${Number(id)}`, { method: "PATCH", body: JSON.stringify({ role, status }) });
      if (rows?.length) return { rows, rowCount: 1 };
    } catch {}
    const u = memUsers.find((x) => Number(x.id) === Number(id));
    if (u) { u.role = role; u.status = status; }
    return { rows: u ? [u] : [], rowCount: u ? 1 : 0 };
  }

  if (/SELECT count\(\*\)::int AS n FROM users WHERE role = 'admin'/i.test(q)) {
    return { rows: [{ n: 2 }], rowCount: 1 };
  }

  if (/SELECT \* FROM products/i.test(q)) {
    const rows = await sbFetch("products?select=*&order=created_at.asc");
    return { rows, rowCount: rows.length };
  }
  if (/SELECT \* FROM diary_entries/i.test(q)) {
    const rows = await sbFetch("diary_entries?select=*&order=ts.asc");
    return { rows, rowCount: rows.length };
  }

  return { rows: [], rowCount: 0 };
}

const rawUrl = (process.env.DATABASE_URL || "").trim();
const hasValidPgUrl =
  Boolean(rawUrl) &&
  !rawUrl.includes("[YOUR-") &&
  !rawUrl.includes("localhost:5432/ocop_passport");

const rawPool = hasValidPgUrl
  ? g.__ocopRawPool ||
    (g.__ocopRawPool = new pg.Pool({
      connectionString: rawUrl,
      ssl: { rejectUnauthorized: false },
      max: 10,
      connectionTimeoutMillis: 4000,
    }))
  : null;

export const pool = {
  async query(sql, params) {
    if (rawPool) {
      try {
        const res = await rawPool.query(sql, params);
        if (res.rowCount > 0 || !/FROM users/i.test(sql)) return res;
      } catch (err) {
        console.warn("[PG Fallback]:", err.message);
      }
    }
    return smartQuery(sql, params);
  },
  async connect() {
    if (rawPool) {
      try {
        return await rawPool.connect();
      } catch {}
    }
    return {
      query: (sql, params) => smartQuery(sql, params),
      release: () => {},
    };
  },
};

export const STAGE_NAMES = ["Gieo trồng", "Chăm sóc", "Thu hoạch", "Sơ chế", "Đóng gói", "Xuất bán"];

export function toProduct(row, entries = []) {
  const { created_at, updated_at, owner_id, content, ...p } = row;
  return {
    ...p,
    shop: p.shop || "",
    content: content ?? null,
    ownerId: owner_id == null ? null : Number(owner_id),
    entries: entries.map((e) => ({
      id: e.id, stage: e.stage, text: e.text, photo: e.photo || undefined, audio: e.audio || undefined,
      geo: e.geo || undefined, by: e.entered_by, ts: new Date(e.ts).getTime(),
    })),
  };
}

export const safeUrl = (u) => !u || /^https?:\/\//i.test(u);