"use client";
import { useMemo, useState } from "react";
import { Icon } from "./Icon";
import { highlight, type Lang } from "@/lib/hl";

export interface CodeTab {
  key: string;
  label: string;
  raw: string;
  lang: Lang;
  file?: string;
}

export function CopyButton({ text, getText, label = "کپی", small = true }: { text?: string; getText?: () => Promise<string>; label?: string; small?: boolean }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        const t = text ?? (getText ? await getText() : "");
        try { await navigator.clipboard.writeText(t); } catch {}
        setDone(true);
        setTimeout(() => setDone(false), 1400);
      }}
      className={`btn btn-stroke ${small ? "btn-sm" : ""}`}
    >
      <Icon name={done ? "check" : "copy"} size={15} className={done ? "text-success" : ""} />
      <span className="hidden sm:inline">{done ? "کپی شد" : label}</span>
    </button>
  );
}

export function downloadText(text: string, file: string, type = "text/plain;charset=utf-8") {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = file;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

export function CodeBlock({ raw, lang, maxHeight = 520 }: { raw: string; lang: Lang; maxHeight?: number }) {
  const html = useMemo(() => highlight(raw, lang), [raw, lang]);
  return (
    <div className="code">
      <pre style={{ maxHeight }} dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

export function CodeTabs({ tabs, maxHeight = 520 }: { tabs: CodeTab[]; maxHeight?: number }) {
  const [k, setK] = useState(tabs[0]?.key);
  const cur = tabs.find((t) => t.key === k) ?? tabs[0];
  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-line p-2">
        <div className="seg" role="tablist">
          {tabs.map((t) => (
            <button key={t.key} role="tab" aria-selected={t.key === cur.key} onClick={() => setK(t.key)} className="seg-item">{t.label}</button>
          ))}
        </div>
        <div className="flex-1" />
        <CopyButton text={cur.raw} />
        {cur.file && (
          <button type="button" onClick={() => downloadText(cur.raw, cur.file!)} className="btn btn-stroke btn-sm">
            <Icon name="download" size={15} /> <span className="hidden sm:inline">دانلود</span>
          </button>
        )}
      </div>
      <CodeBlock raw={cur.raw} lang={cur.lang} maxHeight={maxHeight} />
    </div>
  );
}
