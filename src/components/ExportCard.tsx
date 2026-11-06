"use client";
import { useState } from "react";
import { Icon } from "./Icon";
import { CopyButton } from "./CodeTabs";
import { exportUrl } from "@/lib/base";

export function ExportCard({ title, desc, file, lines, size, html }: { title: string; desc: string; file: string; lines: number; size: string; html: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 p-4">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary"><Icon name="db" /></div>
        <div className="min-w-0 flex-1">
          <div className="text-[14.5px] font-extrabold">{title}</div>
          <div className="text-[12px] text-ink-2">{desc}</div>
          <div className="mono mt-0.5 text-[11px] text-muted" dir="ltr" style={{ textAlign: "right" }}>{file} · {lines.toLocaleString()} lines · {size}</div>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setOpen((o) => !o)} className="flex h-8 items-center gap-1.5 rounded-full border border-line px-3 text-[12px] font-semibold text-ink-2 hover:bg-surface-2"><Icon name="eye" size={14} /> {open ? "بستن" : "پیش‌نمایش"}</button>
          <CopyButton getText={() => fetch(exportUrl(file)).then((r) => r.text())} />
          <a href={exportUrl(file)} download={file} className="flex h-8 items-center gap-1.5 rounded-full bg-primary px-3 text-[12px] font-bold text-white"><Icon name="download" size={14} /> دانلود</a>
        </div>
      </div>
      {open && (
        <div className="border-t border-line">
          <div className="code-wrap max-h-[460px] overflow-auto" dangerouslySetInnerHTML={{ __html: html }} />
          <div className="border-t border-line px-4 py-2 text-[11.5px] text-muted">فقط ۸۰ خط اول نمایش داده شده — برای فایل کامل دانلود کنید.</div>
        </div>
      )}
    </div>
  );
}
