"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";
import { tables, relations, domains } from "@/schema/tables";
import { endpoints } from "@/schema/api";

const nav = [
  { href: "/", label: "نمای کلی سیستم", icon: "home" },
  { href: "/erd", label: "کانوای ERD", icon: "canvas", badge: "∞" },
  { href: "/tables", label: "جداول دیتابیس", icon: "table", badge: String(tables.length) },
  { href: "/enums", label: "Enum ها", icon: "enum" },
  { href: "/flows", label: "State Machine ها", icon: "flow" },
  { href: "/api-docs", label: "API Endpoints", icon: "api", badge: String(endpoints.length) },
  { href: "/screens", label: "اسکرین ↔ دیتا", icon: "screen" },
  { href: "/rules", label: "قوانین بیزینسی", icon: "rule" },
  { href: "/exports", label: "خروجی‌ها", icon: "download" },
];

export function Sidebar() {
  const path = usePathname();
  return (
    <aside className="sticky top-0 hidden h-screen w-[264px] shrink-0 flex-col border-l border-line bg-surface lg:flex">
      <Link href="/" className="flex items-center gap-3 px-5 pb-4 pt-5">
        <div className="brand-gradient grid h-10 w-10 place-items-center rounded-2xl text-lg font-black text-white shadow-lg shadow-violet-500/30">ا</div>
        <div className="leading-tight">
          <div className="text-[15px] font-extrabold">اینو · Backend</div>
          <div className="text-[11px] text-muted">مستند فنی دیتابیس و API</div>
        </div>
      </Link>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
        {nav.map((n) => {
          const active = n.href === "/" ? path === "/" : path.startsWith(n.href);
          return (
            <Link key={n.href} href={n.href} className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-semibold transition ${active ? "bg-primary-soft text-primary" : "text-ink-2 hover:bg-surface-2 hover:text-ink"}`}>
              <Icon name={n.icon} size={18} />
              <span className="flex-1">{n.label}</span>
              {n.badge && <span className={`rounded-full px-2 py-0.5 text-[10.5px] ${active ? "bg-primary text-white" : "bg-surface-2 text-muted"}`}>{n.badge}</span>}
            </Link>
          );
        })}
        <div className="px-3 pb-2 pt-6 text-[11px] font-bold uppercase tracking-wider text-muted">دامنه‌ها</div>
        {domains.map((d) => (
          <Link key={d.key} href={`/tables#${d.key}`} className="flex items-center gap-3 rounded-xl px-3 py-1.5 text-[12.5px] text-ink-2 hover:bg-surface-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
            <span className="flex-1">{d.title}</span>
            <span className="text-[11px] text-muted">{tables.filter((t) => t.domain === d.key).length}</span>
          </Link>
        ))}
      </nav>
      <div className="m-3 rounded-2xl border border-line bg-surface-2 p-3 text-[11.5px] text-ink-2">
        <div className="mb-1 font-bold text-ink">{tables.length} جدول · {relations.length} رابطه</div>
        منبع: Figma «Ino App» — پنل مشتری و پنل سالن
      </div>
    </aside>
  );
}
