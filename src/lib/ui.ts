"use client";
import { useSyncExternalStore } from "react";

/** Tiny global UI store (mobile nav drawer) — no extra dependency. */
let navOpen = false;
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());

export const nav = {
  open() { navOpen = true; emit(); },
  close() { if (navOpen) { navOpen = false; emit(); } },
  toggle() { navOpen = !navOpen; emit(); },
};

export function useNavOpen() {
  return useSyncExternalStore(
    (f) => { subs.add(f); return () => subs.delete(f); },
    () => navOpen,
    () => false,
  );
}
