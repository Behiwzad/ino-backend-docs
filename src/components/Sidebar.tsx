"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Icon, type IconName } from "./Icon";
import { Logo } from "./Logo";
import { tables, relations, domains } from "@/schema/tables";
import { endpoints } from "@/schema/api";
import { nav, useNavOpen } from "@/lib/ui";

const items: { href: string; label: string; icon: IconName; badge?: string }[] = [
  { href: "/", label: "نمای کلی سیستم", icon: "home" },
  { href: "/erd", label: "کانوای ERD", icon: "canvas" },
  { href: "/tables", label: "جداول دیتابیس", icon: "table", badge: String(tables.length) },
  { href: "/enums", label: "Enum ها", icon: "enum" },
  { href: "/flows", label: "State Machine ها", icon: "flow" },
  { href: "/api-docs", label: "API Endpoints", icon: "api", badge: String(endpoints.length) },
  { href: "/screens", label: "صفحات اپ ↔ API", icon: "screen" },
  { href: "/rules", label: "قوانین بیزینسی", icon: "rule" },
  { href: "/exports", label: "خروجی‌ها", icon: "download" },
];

function NavBody({ onNavigate }: { onNavigate?: () => void }) {
  const path = usePathname();
  const isActive = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
  return (
    <>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2" aria-label="ناوبری اصلی">
        {items.map((n) => (
          <Link key={n.href} href={n.href} onClick={onNavigate} aria-current={isActive(n.href) ? "page" : undefined} className="nav-item">
            <Icon name={n.icon} size={20} />
            <span className="flex-1">{n.label}</span>
            {n.badge && <span className="badge badge-gray">{n.badge}</span>}
          </Link>
        ))}
        <div className="px-3 pb-2 pt-6 text-[12px] font-bold text-muted">دامنه‌ها</div>
        {domains.map((d) => (
          <Link key={d.key} href={`/tables#${d.key}`} onClick={onNavigate} className="nav-item !h-9 !text-[13px] !font-medium">
            <span className="mx-1 h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
            <span className="flex-1">{d.title}</span>
            <span className="text-[12px] text-muted">{tables.filter((t) => t.domain === d.key).length}</span>
          </Link>
        ))}
      </nav>
      <div className="m-3 rounded-2xl bg-surface-2 p-3 text-[12px] text-ink-2">
        <div className="font-bold text-ink">{tables.length} جدول · {relations.length} رابطه · {endpoints.length} API</div>
        <div className="mt-0.5">اپ مشتری و پنل سالن</div>
      </div>
    </>
  );
}

export function Sidebar() {
  const open = useNavOpen();
  const path = usePathname();

  useEffect(() => { nav.close(); }, [path]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && nav.close();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-[272px] shrink-0 flex-col border-l border-line bg-surface lg:flex">
        <Link href="/" className="px-5 pb-3 pt-5"><Logo /></Link>
        <NavBody />
      </aside>

      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="منو">
          <button aria-label="بستن منو" className="fade-up absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={nav.close} />
          <aside className="slide-in absolute inset-y-0 right-0 flex w-[min(86vw,320px)] flex-col bg-surface shadow-2xl">
            <div className="flex items-center justify-between px-4 pb-2 pt-4">
              <Link href="/" onClick={nav.close}><Logo /></Link>
              <button onClick={nav.close} className="btn btn-ghost btn-icon btn-sm" aria-label="بستن منو"><Icon name="close" size={18} /></button>
            </div>
            <NavBody onNavigate={nav.close} />
          </aside>
        </div>
      )}
    </>
  );
}
