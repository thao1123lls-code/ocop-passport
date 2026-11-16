"use client";
import { useEffect, useState, useCallback } from "react";

export const STAGES = [
  ["Gieo trồng", "Sowing"],
  ["Chăm sóc", "Care"],
  ["Thu hoạch", "Harvest"],
  ["Sơ chế", "Processing"],
  ["Đóng gói", "Packing"],
  ["Xuất bán", "Sale"],
];

const KEY = "ocop-passport-v7";
const DAY = 864e5;

export const DEFAULT_PRODUCTS = [
  {
    id: "bot-ca-cao-nguyen-chat-trong-duc",
    name: "Bột Ca cao nguyên chất Trọng Đức",
    category: "Ca cao & Cà phê",
    price: 145000,
    promo: "OCOP 4 sao · Bán chạy nhất",
    farm: "Công ty TNHH Ca cao Trọng Đức, Định Quán, Đồng Nai",
    lot: "CDQ-2026",
    weight: "Hộp 400g (20 gói x 20g)",
    ingredients: "100% hạt ca cao lên men tự nhiên Đồng Nai",
    expiry: "18 tháng kể từ ngày sản xuất",
    storage: "Bảo quản nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp",
    certs: "4 sao",
    story: "Vùng trồng ca cao Định Quán được phù sa sông Đồng Nai bồi đắp, kết hợp quy trình ủ lên men tự nhiên theo tiêu chuẩn xuất khẩu Nhật Bản, mang lại hương vị thơm nồng, đậm đà khó quên.",
    shop: "https://cacaotrongduc.com.vn",
    photo: "/bot-cacao-3in1.jpg",
    verified: true,
    entries: [
      {
        id: "ent-1",
        stage: "Thu hoạch",
        text: "Thu hái trái ca cao chín vàng tại vườn xã Phú Hòa, Định Quán. Trái được chọn lọc kỹ càng, đồng đều kích cỡ.",
        photo: "/bot-cacao-3in1.jpg",
        ts: Date.now() - 864e5 * 14,
      },
      {
        id: "ent-2",
        stage: "Sơ chế",
        text: "Tách hạt và ủ lên men tự nhiên trong thùng gỗ sồi 6 ngày đêm, đảo hạt đều đặn để phát triển hương thơm sô-cô-la đặc trưng.",
        ts: Date.now() - 864e5 * 7,
      },
      {
        id: "ent-3",
        stage: "Đóng gói",
        text: "Nghiền mịn, kiểm tra an toàn vệ sinh thực phẩm và đóng hộp thiếc kín khí kèm tem Hộ chiếu số OCOP.",
        ts: Date.now() - 864e5 * 2,
      },
    ],
  },
  {
    id: "hat-dieu-rang-muoi-dinh-quan",
    name: "Hạt điều vỏ lụa rang muối Định Quán",
    category: "Hạt & Trái cây",
    price: 185000,
    promo: "OCOP 4 sao · Giòn bùi thơm ngon",
    farm: "HTX Nông nghiệp Tân Phú - Định Quán, Đồng Nai",
    lot: "HDQ-882",
    weight: "Hũ 500g",
    ingredients: "Hạt điều loại A nguyên hạt (99%), muối tinh khiết (1%)",
    expiry: "12 tháng kể từ ngày sản xuất",
    storage: "Đậy kín sau khi mở, để nơi khô ráo thoáng mát",
    certs: "4 sao",
    story: "Hạt điều Đồng Nai nổi tiếng với độ giòn rụm, vị ngọt bùi tự nhiên. Được rang củi thủ công giữ trọn lớp vỏ lụa bảo vệ hạt thơm lừng.",
    shop: "",
    photo: null,
    verified: true,
    entries: [
      {
        id: "ent-hd-1",
        stage: "Thu hoạch",
        text: "Thu hoạch hạt điều chín rộ vụ xuân tại vùng đất bazan màu mỡ Định Quán.",
        ts: Date.now() - 864e5 * 10,
      },
      {
        id: "ent-hd-2",
        stage: "Đóng gói",
        text: "Rang củi muối hột theo bí quyết gia truyền và hút chân không bảo quản độ giòn.",
        ts: Date.now() - 864e5 * 3,
      },
    ],
  },
  {
    id: "mat-ong-hoa-tram-rung-tri-an",
    name: "Mật ong hoa tràm tự nhiên Rừng Trị An",
    category: "Mật ong & Đặc sản",
    price: 220000,
    promo: "OCOP 4 sao · Thuần khiết thiên nhiên",
    farm: "Khu bảo tồn thiên nhiên văn hóa Đồng Nai, Vĩnh Cửu",
    lot: "MTA-520",
    weight: "Chai 500ml",
    ingredients: "100% mật ong hoa tràm tự nhiên nguyên chất",
    expiry: "24 tháng kể từ ngày thu hoạch",
    storage: "Nhiệt độ phòng thoáng mát, không bảo quản trong tủ lạnh",
    certs: "4 sao",
    story: "Mật ong thu hái từ rừng tràm nguyên sinh ven hồ Trị An, màu vàng óng sóng sánh, thơm nhẹ mùi hoa tràm, hàm lượng khoáng chất và enzyme kháng khuẩn tự nhiên cao.",
    shop: "",
    photo: null,
    verified: true,
    entries: [
      {
        id: "ent-mo-1",
        stage: "Thu hoạch",
        text: "Quay mật vào sáng sớm khi đàn ong vừa hoàn tất luyện mật hoa tràm rộ nở.",
        ts: Date.now() - 864e5 * 12,
      },
    ],
  },
  {
    id: "ca-phe-robusta-long-khanh",
    name: "Cà phê Robusta mộc Long Khánh",
    category: "Ca cao & Cà phê",
    price: 160000,
    promo: "OCOP 3 sao · Đậm vị truyền thống",
    farm: "Nông trường Cà phê Long Khánh, Đồng Nai",
    lot: "CLK-109",
    weight: "Túi 500g",
    ingredients: "100% hạt Robusta chín cây hái chọn lọc",
    expiry: "12 tháng kể từ ngày rang",
    storage: "Bảo quản nơi khô ráo, tránh không khí và ánh nắng",
    certs: "3 sao",
    story: "Được trồng trên sườn đồi thoai thoải Long Khánh với biên độ nhiệt ngày đêm lý tưởng, cho hạt cà phê đậm đà thể chất, hậu vị đầm sâu đặc trưng phương Nam.",
    shop: "",
    photo: null,
    verified: true,
    entries: [],
  },
];

// ====== Kho dữ liệu: đọc/ghi qua /api/products, có đệm localStorage + hàng đợi khi mất mạng ======
const OUTBOX = "ocop-outbox-v1";
const FIELDS = ["name", "category", "price", "promo", "farm", "lot", "weight", "ingredients", "expiry", "storage", "certs", "story", "shop", "photo", "verified", "content"];

let state = null; // { products: [...] } dùng chung cho mọi component
let loadedAt = 0;
let flushing = false;
const listeners = new Set();

const emit = () => listeners.forEach((l) => l(state));
const notify = (detail) => typeof window !== "undefined" && window.dispatchEvent(new CustomEvent("ocop-sync", { detail }));
const readJSON = (k, d) => {
  try {
    const v = JSON.parse(localStorage.getItem(k));
    return v ?? d;
  } catch {
    return d;
  }
};
const writeJSON = (k, v) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {}
};
const getOutbox = () => readJSON(OUTBOX, []);
const norm = (v) => (v === undefined ? null : v);

// So sánh trạng thái cũ/mới để biết cần gửi lệnh nào lên máy chủ
function diff(prev, next) {
  const ops = [];
  const before = new Map(prev.products.map((p) => [p.id, p]));
  const after = new Set(next.products.map((p) => p.id));
  for (const p of next.products) {
    const o = before.get(p.id);
    if (!o) {
      ops.push({ type: "create", product: p });
      for (const e of p.entries || []) ops.push({ type: "entry", productId: p.id, entry: e });
      continue;
    }
    const fields = {};
    for (const k of FIELDS) if (JSON.stringify(norm(o[k])) !== JSON.stringify(norm(p[k]))) fields[k] = norm(p[k]);
    if (Object.keys(fields).length) ops.push({ type: "patch", id: p.id, fields });
    const old = new Set((o.entries || []).map((e) => e.id));
    for (const e of p.entries || []) if (!old.has(e.id)) ops.push({ type: "entry", productId: p.id, entry: e });
  }
  for (const p of prev.products) if (!after.has(p.id)) ops.push({ type: "delete", id: p.id });
  return ops;
}

const J = { "content-type": "application/json" };
function send(op) {
  const id = encodeURIComponent(op.id || op.productId || "");
  if (op.type === "create") return fetch("/api/products", { method: "POST", headers: J, body: JSON.stringify(op.product) });
  if (op.type === "patch") return fetch(`/api/products/${id}`, { method: "PATCH", headers: J, body: JSON.stringify(op.fields) });
  if (op.type === "delete") return fetch(`/api/products/${id}`, { method: "DELETE" });
  return fetch(`/api/products/${id}/entries`, { method: "POST", headers: J, body: JSON.stringify(op.entry) });
}

// Gửi lần lượt các thay đổi đang chờ. Lỗi mạng/5xx: giữ lại thử sau. Lỗi 4xx: bỏ và báo người dùng.
async function flush() {
  if (flushing || typeof window === "undefined") return true;
  flushing = true;
  let ok = true;
  try {
    for (;;) {
      const q = getOutbox();
      if (!q.length) break;
      let res;
      try {
        res = await send(q[0]);
      } catch {
        ok = false;
        break;
      }
      if (res.status >= 500) {
        ok = false;
        break;
      }
      if (!res.ok && res.status !== 409) {
        let msg = "Không lưu được thay đổi lên hệ thống.";
        try {
          msg = (await res.json()).error || msg;
        } catch {}
        notify({ type: "error", status: res.status, msg });
      }
      const cur = getOutbox();
      cur.shift();
      writeJSON(OUTBOX, cur);
    }
  } finally {
    flushing = false;
  }
  return ok;
}

async function refresh() {
  const pending = getOutbox();
  try {
    const r = await fetch("/api/products", { cache: "no-store" });
    const j = await r.json();
    if (!r.ok || !j.success) throw new Error();
    const remoteProducts = Array.isArray(j.data) ? j.data : [];
    if (!pending.length) {
      state = { products: remoteProducts };
    } else {
      const localProducts = state?.products || [];
      const localById = new Map(localProducts.map((product) => [String(product.id), product]));
      const deletedIds = new Set(
        pending.filter((op) => op.type === "delete").map((op) => String(op.id)),
      );
      const dirtyIds = new Set(
        pending
          .filter((op) => op.type !== "delete")
          .map((op) => String(op.id || op.productId || op.product?.id || "")),
      );
      const merged = remoteProducts
        .filter((product) => !deletedIds.has(String(product.id)))
        .map((product) =>
          dirtyIds.has(String(product.id))
            ? localById.get(String(product.id)) || product
            : product,
        );
      const remoteIds = new Set(merged.map((product) => String(product.id)));
      for (const product of localProducts) {
        const id = String(product.id);
        if (!remoteIds.has(id) && !deletedIds.has(id)) merged.push(product);
      }
      state = { products: merged };
    }
    writeJSON(KEY, state);
    emit();
  } catch {
    if (!state) {
      state = { products: structuredClone(DEFAULT_PRODUCTS) }; // chưa có DB/mạng: dùng dữ liệu mẫu
      emit();
    }
  }
}

async function load() {
  loadedAt = Date.now();
  if (!state) {
    const c = readJSON(KEY, null);
    if (c && Array.isArray(c.products) && c.products.length) {
      state = c;
      emit();
    }
  }
  await flush();
  await refresh();
}

export function useDB() {
  const [db, setDb] = useState(state);
  useEffect(() => {
    listeners.add(setDb);
    if (state) setDb(state);
    if (!loadedAt || Date.now() - loadedAt > 10000) load();
    const onOnline = () => flush().then(refresh);
    window.addEventListener("online", onOnline);
    return () => {
      listeners.delete(setDb);
      window.removeEventListener("online", onOnline);
    };
  }, []);
  const save = useCallback((fn) => {
    const prev = state || { products: [] };
    const next = structuredClone(prev);
    fn(next);
    next.products.forEach((p) => {
      if (!Array.isArray(p.entries)) p.entries = [];
    });
    const ops = diff(prev, next);
    state = next;
    emit();
    writeJSON(KEY, next);
    if (ops.length) {
      writeJSON(OUTBOX, [...getOutbox(), ...ops]);
      flush().then(refresh);
    }
  }, []);
  return [db, save];
}

export const fmt = (t) => {
  if (!t) return "";
  try {
    const d = new Date(t);
    return isNaN(d.getTime()) ? "" : d.toLocaleDateString("vi-VN");
  } catch {
    return "";
  }
};
export const fmtVND = (n) => (Number(n) || 0).toLocaleString("vi-VN") + "đ";
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
export const slug = (s) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") +
  "-" +
  uid().slice(-4);

// Bản rút gọn (không ảnh) mã hóa vào link QR: mở được trên máy bất kỳ, không cần máy chủ
export const slim = (p) => ({
  ...p,
  content: null,
  entries: (Array.isArray(p?.entries) ? p.entries : []).map(({ photo, ...e }) => e),
});
export const enc = (o) => btoa(unescape(encodeURIComponent(JSON.stringify(o))));
export const dec = (s) => {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(s))));
  } catch {
    return null;
  }
};
