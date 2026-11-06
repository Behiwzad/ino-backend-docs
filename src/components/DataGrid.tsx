"use client";
import { useMemo, useState } from "react";
import type { Column } from "@/schema/types";
import { Icon } from "./Icon";
import { downloadText } from "./CodeTabs";

type Row = Record<string, unknown>;

function cell(v: unknown, c: Column) {
  if (v === null || v === undefined) return <span className="text-muted">NULL</span>;
  if (typeof v === "boolean") return <span className={`badge ${v ? "badge-green" : "badge-gray"}`}>{String(v)}</span>;
  if (c.type === "enum") return <span className="badge badge-violet">{String(v)}</span>;
  if (typeof v === "object") return <span className="text-ink-2">{JSON.stringify(v)}</span>;
  if (typeof v === "number" && c.note === "تومان") return <span className="tabular-nums">{v.toLocaleString("en-US")}</span>;
  const s = String(v);
  if (/[؀-ۿ]/.test(s)) return <span dir="rtl" className="font-sans text-[12.5px]">{s}</span>;
  return s;
}

export function DataGrid({ name, columns, rows }: { name: string; columns: Column[]; rows: Row[] }) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<{ k: string; d: 1 | -1 } | null>(null);
  const view = useMemo(() => {
    let r = rows;
    const s = q.trim();
    if (s) r = r.filter((x) => Object.values(x).some((v) => String(typeof v === "object" ? JSON.stringify(v) : v).includes(s)));
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
        <label className="field !h-8 w-full sm:w-56">
          <Icon name="search" size={16} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="فیلتر ردیف‌ها…" className="!text-[13px]" />
        </label>
        <span className="text-[12.5px] text-muted">{view.length} از {rows.length} ردیف</span>
        <div className="flex-1" />
        <button type="button" onClick={() => downloadText(toCsv(), `${name}.csv`, "text/csv;charset=utf-8")} className="btn btn-stroke btn-sm"><Icon name="csv" size={15} /> CSV</button>
        <button type="button" onClick={() => downloadText(JSON.stringify(rows, null, 2), `${name}.json`, "application/json")} className="btn btn-stroke btn-sm"><Icon name="code" size={15} /> JSON</button>
      </div>
      <div className="max-h-[460px] overflow-auto" dir="ltr">
        <table className="mono w-max min-w-full text-[12px]">
          <thead className="sticky top-0 z-10 bg-surface-2">
            <tr>
              {columns.map((c) => (
                <th key={c.name} className="whitespace-nowrap border-b border-line p-0 text-left">
                  <button type="button" onClick={() => setSort((s) => (s?.k === c.name ? { k: c.name, d: s.d === 1 ? -1 : 1 } : { k: c.name, d: 1 }))} className="flex w-full items-center gap-1.5 px-3 py-2 font-semibold text-ink-2 transition hover:text-primary">
                    {c.pk ? <Icon name="key" size={13} className="text-warning" /> : c.ref ? <Icon name="link" size={13} /> : null}
                    {c.name}
                    {sort?.k === c.name && <Icon name="chevron" size={13} className={sort.d === -1 ? "rotate-180" : ""} />}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {view.map((r, i) => (
              <tr key={i} className="border-b border-line/70 transition hover:bg-primary-soft/50">
                {columns.map((c) => <td key={c.name} className="max-w-[280px] truncate whitespace-nowrap px-3 py-1.5 text-ink">{cell(r[c.name], c)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
        {!view.length && <div className="p-8 text-center text-sm text-muted">{rows.length ? "ردیفی با این فیلتر پیدا نشد" : "بدون ردیف"}</div>}
      </div>
    </div>
  );
}
