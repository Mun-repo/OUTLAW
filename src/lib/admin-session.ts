import { create } from "zustand";

const STORAGE_KEY = "outlaw-admin-token";

type AdminSession = {
  token: string | null;
  ready: boolean;
  hydrate: () => void;
  setToken: (token: string) => void;
  clear: () => void;
};

export const useAdminSession = create<AdminSession>((set) => ({
  token: null,
  ready: false,
  hydrate: () => {
    if (typeof window === "undefined") {
      set({ ready: true, token: null });
      return;
    }
    set({ token: sessionStorage.getItem(STORAGE_KEY), ready: true });
  },
  setToken: (token) => {
    sessionStorage.setItem(STORAGE_KEY, token);
    set({ token, ready: true });
  },
  clear: () => {
    sessionStorage.removeItem(STORAGE_KEY);
    set({ token: null, ready: true });
  },
}));
