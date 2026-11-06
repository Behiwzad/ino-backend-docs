"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "./Icon";
import { tables, domainMap } from "@/schema/tables";
import { enums } from "@/schema/enums";
import { endpoints } from "@/schema/api";

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
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
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
    if (!s) return all.filter((h) => h.kind === "جدول").slice(0, 12);
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
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-surface/80 px-4 backdrop-blur-xl md:px-6">
        <Link href="/" className="brand-gradient grid h-8 w-8 place-items-center rounded-xl text-sm font-black text-white lg:hidden">ا</Link>
        <button onClick={() => setOpen(true)} className="flex h-9 w-full max-w-md items-center gap-2 rounded-full border border-line bg-surface-2 px-4 text-[13px] text-muted transition hover:border-line-strong">
          <Icon name="search" size={16} />
          <span className="flex-1 text-right">جستجوی جدول، ستون، enum یا API…</span>
          <kbd className="mono hidden rounded-md border border-line bg-surface px-1.5 text-[11px] sm:inline" dir="ltr">Ctrl K</kbd>
        </button>
        <div className="flex-1" />
        <nav className="hidden items-center gap-1 md:flex lg:hidden">
          {[["/erd", "ERD"], ["/tables", "جداول"], ["/api-docs", "API"], ["/exports", "خروجی"]].map(([h, l]) => (
            <Link key={h} href={h} className="rounded-full px-3 py-1.5 text-[13px] font-semibold text-ink-2 hover:bg-surface-2">{l}</Link>
          ))}
        </nav>
        <a href="https://www.figma.com/design/Lh9zzmtRQdRGxFfrWKXGoc/Ino-App" target="_blank" rel="noreferrer" className="hidden h-9 items-center gap-2 rounded-full border border-line px-3 text-[12.5px] font-semibold text-ink-2 hover:bg-surface-2 sm:flex">
          <Icon name="figma" size={15} /> Figma
        </a>
        <button onClick={toggleTheme} aria-label="تغییر تم" className="grid h-9 w-9 place-items-center rounded-full border border-line text-ink-2 hover:bg-surface-2">
          <Icon name={theme === "dark" ? "sun" : "moon"} size={17} />
        </button>
      </header>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 p-4 pt-[12vh] backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="card fade-up w-full max-w-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Icon name="search" className="text-muted" />
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
            </div>
            <ul className="max-h-[55vh] overflow-y-auto p-2">
              {hits.map((h, i) => (
                <li key={h.kind + h.label}>
                  <button onMouseEnter={() => setSel(i)} onClick={() => go(h)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-right ${i === sel ? "bg-primary-soft" : ""}`}>
                    <span className="chip bg-surface-2 text-[10.5px] text-ink-2">{h.kind}</span>
                    {h.color && <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: h.color }} />}
                    <span className="mono truncate text-[13px] font-semibold" dir="ltr">{h.label}</span>
                    <span className="mr-auto truncate text-[12px] text-muted">{h.sub}</span>
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
