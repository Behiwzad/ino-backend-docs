"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "./Icon";
import { LogoMark } from "./Logo";
import { tables, domainMap } from "@/schema/tables";
import { enums } from "@/schema/enums";
import { endpoints } from "@/schema/api";
import { nav } from "@/lib/ui";

type Hit = { label: string; sub: string; href: string; kind: string; color?: string };

export function Topbar() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const [theme, setTheme] = useState<string>("light");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme ?? "light");
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen((o) => !o); }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 10);
    else setQ("");
  }, [open]);

  const all: Hit[] = useMemo(
    () => [
      ...tables.map((t) => ({ label: t.name, sub: t.title, href: `/tables/${t.name}`, kind: "جدول", color: domainMap[t.domain].color })),
      ...tables.flatMap((t) => t.columns.map((c) => ({ label: `${t.name}.${c.name}`, sub: c.note ?? c.type, href: `/tables/${t.name}#col-${c.name}`, kind: "ستون", color: domainMap[t.domain].color }))),
      ...enums.map((e) => ({ label: e.name, sub: e.title, href: `/enums#${e.name}`, kind: "Enum" })),
      ...endpoints.map((e) => ({ label: `${e.method} ${e.path}`, sub: e.summary, href: `/api-docs#${e.group}`, kind: "API" })),
    ],
    [],
  );
  const hits = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return all.filter((h) => h.kind === "جدول").slice(0, 10);
    return all.filter((h) => h.label.toLowerCase().includes(s) || h.sub.toLowerCase().includes(s)).slice(0, 40);
  }, [q, all]);
  useEffect(() => setSel(0), [q]);

  const toggleTheme = () => {
    const t = theme === "dark" ? "light" : "dark";
    setTheme(t);
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem("ino-theme", t); } catch {}
  };
  const go = (h: Hit) => { setOpen(false); router.push(h.href); };

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center gap-2 border-b border-line bg-surface/85 px-3 backdrop-blur-xl sm:gap-3 md:px-6">
        <button onClick={nav.open} className="btn btn-ghost btn-icon lg:hidden" aria-label="باز کردن منو"><Icon name="menu" size={22} /></button>
        <Link href="/" className="lg:hidden" aria-label="اینو"><LogoMark size={32} /></Link>
        <button onClick={() => setOpen(true)} className="field ms-1 w-full max-w-md cursor-text !h-10 text-[13.5px] hover:!shadow-[0_1px_3px_#1717171f,0_0_0_1px_var(--border-strong)]" aria-label="جستجو">
          <Icon name="search" size={18} />
          <span className="flex-1 truncate text-right">جستجو<span className="hidden sm:inline"> در جدول، ستون، enum یا API…</span></span>
          <span className="kbd mono hidden sm:inline-grid" dir="ltr">Ctrl K</span>
        </button>
        <div className="flex-1" />
        <a href="https://github.com/Behiwzad/ino-backend-docs" target="_blank" rel="noreferrer" className="btn btn-ghost btn-icon hidden sm:inline-flex" aria-label="GitHub"><Icon name="github" size={20} /></a>
        <button onClick={toggleTheme} aria-label="تغییر تم" className="btn btn-stroke btn-icon"><Icon name={theme === "dark" ? "sun" : "moon"} size={19} /></button>
      </header>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center bg-black/35 p-3 pt-[8vh] backdrop-blur-sm sm:p-4 sm:pt-[12vh]" onClick={() => setOpen(false)}>
          <div className="popover fade-up w-full max-w-xl overflow-hidden" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="جستجو">
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Icon name="search" className="text-muted" size={20} />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(s + 1, hits.length - 1)); }
                  if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
                  if (e.key === "Enter" && hits[sel]) go(hits[sel]);
                }}
                placeholder="مثلاً bookings، deposit، /v1/bookings…"
                className="h-14 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted"
              />
              <button onClick={() => setOpen(false)} className="btn btn-ghost btn-xs">Esc</button>
            </div>
            <ul className="max-h-[60vh] overflow-y-auto p-2">
              {hits.map((h, i) => (
                <li key={h.kind + h.label}>
                  <button onMouseEnter={() => setSel(i)} onClick={() => go(h)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-right transition ${i === sel ? "bg-surface-2" : ""}`}>
                    <span className="badge badge-gray w-12 justify-center">{h.kind}</span>
                    {h.color && <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: h.color }} />}
                    <span className="mono truncate text-[13px] font-semibold" dir="ltr">{h.label}</span>
                    <span className="ms-auto hidden truncate text-[12px] text-muted sm:inline">{h.sub}</span>
                  </button>
                </li>
              ))}
              {!hits.length && <li className="p-6 text-center text-sm text-muted">نتیجه‌ای پیدا نشد</li>}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
