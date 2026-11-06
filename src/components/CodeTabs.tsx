"use client";
import { useState } from "react";
import { Icon } from "./Icon";

export interface CodeTab {
  key: string;
  label: string;
  html: string;
  raw: string;
  file?: string;
}

export function CopyButton({ text, getText, label = "کپی" }: { text?: string; getText?: () => Promise<string>; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={async () => {
        const t = text ?? (getText ? await getText() : "");
        await navigator.clipboard.writeText(t);
        setDone(true);
        setTimeout(() => setDone(false), 1400);
      }}
      className="flex h-8 items-center gap-1.5 rounded-full border border-line bg-surface px-3 text-[12px] font-semibold text-ink-2 hover:bg-surface-2"
    >
      <Icon name={done ? "check" : "copy"} size={14} /> {done ? "کپی شد" : label}
    </button>
  );
}

export function downloadText(text: string, file: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
  a.download = file;
  a.click();
}

export function CodeTabs({ tabs, maxHeight = 520 }: { tabs: CodeTab[]; maxHeight?: number }) {
  const [k, setK] = useState(tabs[0]?.key);
  const cur = tabs.find((t) => t.key === k) ?? tabs[0];
  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center gap-1 border-b border-line bg-surface-2/60 p-1.5">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setK(t.key)} className={`h-8 rounded-full px-3 text-[12.5px] font-semibold transition ${t.key === cur.key ? "bg-surface text-primary shadow-sm" : "text-ink-2 hover:text-ink"}`}>{t.label}</button>
        ))}
        <div className="flex-1" />
        <CopyButton text={cur.raw} />
        {cur.file && (
          <button onClick={() => downloadText(cur.raw, cur.file!)} className="flex h-8 items-center gap-1.5 rounded-full border border-line bg-surface px-3 text-[12px] font-semibold text-ink-2 hover:bg-surface-2">
            <Icon name="download" size={14} /> دانلود
          </button>
        )}
      </div>
      <div className="code-wrap overflow-auto" style={{ maxHeight }} dangerouslySetInnerHTML={{ __html: cur.html }} />
    </div>
  );
}
