"use client";
import { useState } from "react";
import { Icon, type IconName } from "./Icon";
import { CodeBlock, CopyButton } from "./CodeTabs";
import { exportUrl } from "@/lib/base";
import type { Lang } from "@/lib/hl";

const iconFor: Record<string, IconName> = { sql: "sql", data: "db", orm: "layers", types: "code", api: "api", diagram: "canvas" };

export function ExportCard({ title, desc, file, lines, size, preview, lang, group }: { title: string; desc: string; file: string; lines: number; size: string; preview: string; lang: Lang; group: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 p-4">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"><Icon name={iconFor[group] ?? "file"} size={20} /></div>
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-bold">{title}</div>
          <div className="text-[12.5px] text-ink-2">{desc}</div>
          <div className="mono mt-0.5 truncate text-[11px] text-muted" dir="ltr" style={{ textAlign: "right" }}>{file} · {lines.toLocaleString()} lines · {size}</div>
        </div>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="btn btn-ghost btn-sm">
            <Icon name="eye" size={15} /> {open ? "بستن" : "پیش‌نمایش"}
          </button>
          <div className="flex-1 sm:hidden" />
          <CopyButton getText={() => fetch(exportUrl(file)).then((r) => r.text())} />
          <a href={exportUrl(file)} download={file} className="btn btn-primary btn-sm"><Icon name="download" size={15} /> دانلود</a>
        </div>
      </div>
      {open && (
        <div className="border-t border-line">
          <CodeBlock raw={preview} lang={lang} maxHeight={420} />
          <div className="border-t border-line px-4 py-2 text-[12px] text-muted">۸۰ خط اول نمایش داده شده؛ فایل کامل را دانلود کنید.</div>
        </div>
      )}
    </div>
  );
}
