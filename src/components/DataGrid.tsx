"use client";
import { useMemo, useState } from "react";
import type { Column } from "@/schema/types";
import { Icon } from "./Icon";
import { downloadText } from "./CodeTabs";

type Row = Record<string, unknown>;

function cell(v: unknown, c: Column) {
  if (v === null || v === undefined) return <span className="text-muted">NULL</span>;
  if (typeof v === "boolean") return <span className={`chip !px-2 ${v ? "bg-success/10 text-success" : "bg-surface-2 text-muted"}`}>{String(v)}</span>;
  if (c.type === "enum") return <span className="chip !px-2 bg-primary-soft text-primary">{String(v)}</span>;
  if (typeof v === "object") return <span className="text-ink-2">{JSON.stringify(v)}</span>;
  if (typeof v === "number" && c.note === "تومان") return <span className="tabular-nums">{v.toLocaleString("en-US")}</span>;
  const s = String(v);
  if (/[؀-ۿ]/.test(s)) return <span dir="rtl" className="font-sans">{s}</span>;
  return s;
}

export function DataGrid({ name, columns, rows }: { name: string; columns: Column[]; rows: Row[] }) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<{ k: string; d: 1 | -1 } | null>(null);
  const view = useMemo(() => {
    let r = rows;
    if (q.trim()) r = r.filter((x) => Object.values(x).some((v) => String(typeof v === "object" ? JSON.stringify(v) : v).includes(q.trim())));
    if (sort)
      r = [...r].sort((a, b) => {
        const av = a[sort.k], bv = b[sort.k];
        if (typeof av === "number" && typeof bv === "number") return (av - bv) * sort.d;
        return String(av ?? "").localeCompare(String(bv ?? "")) * sort.d;
      });
    return r;
  }, [rows, q, sort]);
  const toCsv = () => "﻿" + [columns.map((c) => c.name).join(","), ...rows.map((r) => columns.map((c) => { const v = r[c.name]; const s = v === null || v === undefined ? "" : typeof v === "object" ? JSON.stringify(v) : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; }).join(","))].join("\n");

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-line p-2">
        <div className="flex h-8 items-center gap-2 rounded-full border border-line bg-surface-2 px-3">
          <Icon name="search" size={14} className="text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="فیلتر ردیف‌ها…" className="w-40 bg-transparent text-[12.5px] outline-none" />
        </div>
        <span className="text-[12px] text-muted">{view.length} از {rows.length} ردیف</span>
        <div className="flex-1" />
        <button onClick={() => downloadText(toCsv(), `${name}.csv`)} className="flex h-8 items-center gap-1.5 rounded-full border border-line px-3 text-[12px] font-semibold text-ink-2 hover:bg-surface-2"><Icon name="download" size={14} /> CSV</button>
        <button onClick={() => downloadText(JSON.stringify(rows, null, 2), `${name}.json`)} className="flex h-8 items-center gap-1.5 rounded-full border border-line px-3 text-[12px] font-semibold text-ink-2 hover:bg-surface-2"><Icon name="download" size={14} /> JSON</button>
      </div>
      <div className="max-h-[480px] overflow-auto" dir="ltr">
        <table className="mono w-max min-w-full text-[11.5px]">
          <thead className="sticky top-0 z-10 bg-surface-2">
            <tr>
              {columns.map((c) => (
                <th key={c.name} onClick={() => setSort((s) => (s?.k === c.name ? { k: c.name, d: s.d === 1 ? -1 : 1 } : { k: c.name, d: 1 }))} className="cursor-pointer select-none whitespace-nowrap border-b border-line px-3 py-2 text-left font-semibold text-ink-2 hover:text-primary">
                  {c.pk ? "🔑 " : c.ref ? "⛓ " : ""}{c.name}{sort?.k === c.name ? (sort.d === 1 ? " ↑" : " ↓") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {view.map((r, i) => (
              <tr key={i} className="border-b border-line/70 hover:bg-primary-soft/40">
                {columns.map((c) => <td key={c.name} className="max-w-[280px] truncate whitespace-nowrap px-3 py-1.5 text-ink">{cell(r[c.name], c)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <div className="p-8 text-center text-sm text-muted">بدون ردیف</div>}
      </div>
    </div>
  );
}
