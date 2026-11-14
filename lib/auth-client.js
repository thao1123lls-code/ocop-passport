"use client";
import { useEffect, useState } from "react";

// Trạng thái đăng nhập dùng chung giữa các component (NavBar, trang đăng nhập, dashboard…)
let auth = { user: null, loading: true };
let started = false;
const subs = new Set();
const set = (next) => {
  auth = { ...auth, ...next };
  subs.forEach((f) => f(auth));
};

async function call(url, body) {
  try {
    const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body || {}) });
    const j = await r.json().catch(() => ({}));
    return r.ok && j.success ? { ok: true, ...j } : { ok: false, error: j.error || "Có lỗi xảy ra, vui lòng thử lại." };
  } catch {
    return { ok: false, error: "Không kết nối được máy chủ." };
  }
}

export async function refreshAuth() {
  try {
    const r = await fetch("/api/auth/me", { cache: "no-store" });
    const j = await r.json();
    set({ user: j.user || null, loading: false });
  } catch {
    set({ loading: false });
  }
}

export function useAuth() {
  const [a, setA] = useState(auth);
  useEffect(() => {
    subs.add(setA);
    setA(auth);
    if (!started) {
      started = true;
      refreshAuth();
    }
    return () => subs.delete(setA);
  }, []);
  return {
    ...a,
    async login(email, password) {
      const r = await call("/api/auth/login", { email, password });
      if (r.ok) set({ user: r.user, loading: false });
      return r;
    },
    async register(data) {
      const r = await call("/api/auth/register", data);
      if (r.ok) set({ user: r.user, loading: false });
      return r;
    },
    async logout() {
      await call("/api/auth/logout");
      set({ user: null });
    },
    changePassword: (current, next) => call("/api/auth/password", { current, next }),
  };
}

export const ROLE_LABEL = { admin: "Quản trị viên", owner: "Chủ cơ sở", volunteer: "Tình nguyện viên" };
