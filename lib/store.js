"use client";
import { useEffect, useState, useCallback } from "react";
export const STAGES = [["Gieo trồng", "Sowing"], ["Chăm sóc", "Care"], ["Thu hoạch", "Harvest"], ["Sơ chế", "Processing"], ["Đóng gói", "Packing"], ["Xuất bán", "Sale"]];
const KEY = "ocop-passport-v1", DAY = 864e5;
const demo = { products: [{ id: "ca-cao-0926", name: "Ca cao nguyên chất Đồng Nai", farm: "HTX mẫu, TP. Đồng Nai (dữ liệu minh họa)", lot: "0926", weight: "250 g", ingredients: "100% hạt ca cao lên men", expiry: "12 tháng", storage: "Nơi khô ráo, thoáng mát", certs: "OCOP", story: "", shop: "", verified: false, content: null, entries: [
  { id: "e1", stage: 2, text: "Thu hoạch đợt hai, hái tay, quả chín đều.", ts: Date.now() - 5 * DAY, by: "owner" },
  { id: "e2", stage: 3, text: "Lên men và phơi hạt ba ngày dưới nắng nhẹ.", ts: Date.now() - 3 * DAY, by: "owner" }] }] };
export function useDB() {
  const [db, setDb] = useState(null);
  useEffect(() => { let d; try { d = JSON.parse(localStorage.getItem(KEY)); } catch {} setDb(d?.products ? d : demo); }, []);
  const save = useCallback((fn) => setDb((p) => { const n = structuredClone(p); fn(n); try { localStorage.setItem(KEY, JSON.stringify(n)); } catch {} return n; }), []);
  return [db, save];
}
export const fmt = (t) => new Date(t).toLocaleDateString("vi-VN");
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
export const slug = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + uid().slice(-4);
// Bản rút gọn (không ảnh) mã hóa vào link QR: mở được trên máy bất kỳ, không cần máy chủ
export const slim = (p) => ({ ...p, content: null, entries: p.entries.map(({ photo, ...e }) => e) });
export const enc = (o) => btoa(unescape(encodeURIComponent(JSON.stringify(o))));
export const dec = (s) => { try { return JSON.parse(decodeURIComponent(escape(atob(s)))); } catch { return null; } };
