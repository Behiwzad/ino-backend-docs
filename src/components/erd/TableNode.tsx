"use client";
import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import type { Table } from "@/schema/types";
import { domainMap } from "@/schema/tables";

export type TableNodeData = {
  table: Table;
  compact: boolean;
  dim: boolean;
  active: boolean;
  rows: number;
  referenced: string[]; // columns referenced by others
  onOpen: (name: string) => void;
};
export type TableFlowNode = Node<TableNodeData, "table">;

export const ROW_H = 24;
export const HEAD_H = 52;
export const NODE_W = 270;

const hidden: React.CSSProperties = { opacity: 0, width: 6, height: 6, minWidth: 0, minHeight: 0, border: 0, background: "transparent", pointerEvents: "none" };

export function visibleColumns(t: Table, compact: boolean) {
  return compact ? t.columns.filter((c) => c.pk || c.ref || c.unique) : t.columns;
}
export function nodeHeight(t: Table, compact: boolean) {
  return HEAD_H + visibleColumns(t, compact).length * ROW_H + 10;
}

function typeLabel(c: Table["columns"][number]) {
  if (c.type === "enum") return c.enum!;
  if (c.type === "varchar") return `varchar(${c.length})`;
  if (c.type === "numeric" && c.precision) return `numeric(${c.precision.join(",")})`;
  return c.type;
}

export const TableNode = memo(function TableNode({ data, selected }: NodeProps<TableFlowNode>) {
  const { table: t, compact, dim, active, rows, referenced, onOpen } = data;
  const d = domainMap[t.domain];
  const cols = visibleColumns(t, compact);
  return (
    <div
      dir="ltr"
      onDoubleClick={() => onOpen(t.name)}
      className="erd-table overflow-hidden rounded-[14px] border bg-surface transition-[opacity,box-shadow,border-color] duration-150"
      style={{
        width: NODE_W,
        opacity: dim ? 0.22 : 1,
        borderColor: selected || active ? d.color : "var(--border)",
        boxShadow: selected || active ? `0 0 0 3px ${d.color}33, var(--shadow)` : "var(--shadow)",
      }}
    >
      <div className="relative flex items-center gap-2 px-3" style={{ height: HEAD_H, background: `linear-gradient(180deg, ${d.color}1f, transparent)` }}>
        <span className="absolute inset-x-0 top-0 h-[3px]" style={{ background: d.color }} />
        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-white" style={{ background: d.color }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 5h18v14H3zM3 10h18M9 5v14" /></svg>
        </div>
        <div className="min-w-0 flex-1">
          <div className="mono truncate text-[13px] font-bold text-ink">{t.name}</div>
          <div className="truncate text-[11px] text-muted" dir="rtl" style={{ textAlign: "left" }}>{t.title}</div>
        </div>
        <span className="mono rounded-full bg-surface-2 px-1.5 py-0.5 text-[10px] text-ink-2" title="ردیف‌های دیتای فیک">{rows}r</span>
      </div>
      <div className="pb-[10px]">
        {cols.map((c) => (
          <div key={c.name} className="relative flex items-center gap-1.5 px-3 text-[11.5px] hover:bg-surface-2" style={{ height: ROW_H }}>
            {c.ref && (
              <>
                <Handle id={`s-L-${c.name}`} type="source" position={Position.Left} style={{ ...hidden, left: -3 }} isConnectable={false} />
                <Handle id={`s-R-${c.name}`} type="source" position={Position.Right} style={{ ...hidden, right: -3 }} isConnectable={false} />
              </>
            )}
            {referenced.includes(c.name) && (
              <>
                <Handle id={`t-L-${c.name}`} type="target" position={Position.Left} style={{ ...hidden, left: -3 }} isConnectable={false} />
                <Handle id={`t-R-${c.name}`} type="target" position={Position.Right} style={{ ...hidden, right: -3 }} isConnectable={false} />
              </>
            )}
            <span className="w-4 shrink-0 text-center text-[10px]">
              {c.pk ? <span style={{ color: "#efb100" }}>🔑</span> : c.ref ? <span style={{ color: d.color }}>⛓</span> : c.unique ? <span className="text-muted">◆</span> : ""}
            </span>
            <span className={`mono truncate ${c.pk ? "font-bold text-ink" : c.ref ? "font-semibold" : "text-ink-2"}`} style={c.ref ? { color: d.color } : undefined}>{c.name}</span>
            {!c.nullable && !c.pk && <span className="text-[9px] text-danger" title="NOT NULL">*</span>}
            <span className="mono ml-auto truncate pl-2 text-[10.5px] text-muted">{typeLabel(c)}</span>
          </div>
        ))}
        {compact && cols.length < t.columns.length && <div className="px-3 pt-1 text-[10.5px] text-muted">+{t.columns.length - cols.length} ستون دیگر</div>}
      </div>
    </div>
  );
});

export type ZoneNodeData = { title: string; en: string; color: string; count: number; w: number; h: number };
export type ZoneFlowNode = Node<ZoneNodeData, "zone">;

export const ZoneNode = memo(function ZoneNode({ data }: NodeProps<ZoneFlowNode>) {
  return (
    <div className="rounded-[28px] border-2 border-dashed" style={{ width: data.w, height: data.h, borderColor: `${data.color}55`, background: `${data.color}0a` }}>
      <div className="flex items-center gap-2 px-6 pt-4" dir="rtl">
        <span className="h-3 w-3 rounded-full" style={{ background: data.color }} />
        <span className="text-[22px] font-extrabold" style={{ color: data.color }}>{data.title}</span>
        <span className="mono text-[14px] text-muted">{data.en} · {data.count}</span>
      </div>
    </div>
  );
});
