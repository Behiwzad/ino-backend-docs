"use client";
import { createContext, memo, useContext } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import type { Table } from "@/schema/types";
import { domainMap } from "@/schema/tables";
import { Icon } from "../Icon";

/* Hover/selection state lives in context so dragging never re-creates node data (keeps nodes memoized). */
export interface ErdView {
  active: string | null;
  neighbors: Set<string> | null;
  compactAll: boolean;
  focus?: string;
}
export const ErdViewCtx = createContext<ErdView>({ active: null, neighbors: null, compactAll: false });

export type TableNodeData = { table: Table; rows: number; referenced: string[] };
export type TableFlowNode = Node<TableNodeData, "table">;

export const ROW_H = 24;
export const HEAD_H = 52;
export const NODE_W = 272;

const hidden: React.CSSProperties = { opacity: 0, width: 6, height: 6, minWidth: 0, minHeight: 0, border: 0, background: "transparent", pointerEvents: "none" };

export function isCompact(name: string, v: Pick<ErdView, "compactAll" | "focus">) {
  return v.compactAll || (!!v.focus && v.focus !== name);
}
export function visibleColumns(t: Table, compact: boolean) {
  return compact ? t.columns.filter((c) => c.pk || c.ref || c.unique) : t.columns;
}
export function nodeHeight(t: Table, compact: boolean) {
  const cols = visibleColumns(t, compact).length;
  return HEAD_H + cols * ROW_H + 10 + (compact && cols < t.columns.length ? 18 : 0);
}

function typeLabel(c: Table["columns"][number]) {
  if (c.type === "enum") return c.enum!;
  if (c.type === "varchar") return `varchar(${c.length})`;
  if (c.type === "numeric" && c.precision) return `numeric(${c.precision.join(",")})`;
  return c.type;
}

export const TableNode = memo(function TableNode({ data, selected }: NodeProps<TableFlowNode>) {
  const { table: t, rows, referenced } = data;
  const view = useContext(ErdViewCtx);
  const compact = isCompact(t.name, view);
  const dim = !!view.neighbors && !view.neighbors.has(t.name);
  const active = view.active === t.name;
  const d = domainMap[t.domain];
  const cols = visibleColumns(t, compact);
  return (
    <div
      dir="ltr"
      className="erd-table cursor-pointer overflow-hidden rounded-[14px] bg-surface transition-[opacity,box-shadow] duration-150"
      style={{
        width: NODE_W,
        opacity: dim ? 0.25 : 1,
        boxShadow: selected || active ? `0 0 0 2px ${d.color}, 0 0 0 6px ${d.color}26, 0 10px 24px -12px #14143a40` : "var(--shadow)",
      }}
    >
      <div className="relative flex items-center gap-2 px-3" style={{ height: HEAD_H, background: `linear-gradient(180deg, ${d.color}1c, transparent)` }}>
        <span className="absolute inset-x-0 top-0 h-[3px]" style={{ background: d.color }} />
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-white" style={{ background: d.color }}><Icon name="table" size={15} stroke={1.8} /></span>
        <div className="min-w-0 flex-1">
          <div className="mono truncate text-[13px] font-semibold text-ink">{t.name}</div>
          <div className="truncate text-[11.5px] text-muted" dir="rtl" style={{ textAlign: "left" }}>{t.title}</div>
        </div>
        <span className="badge badge-gray mono !h-5 !px-1.5 !text-[10px]" title="ردیف‌های دیتای فیک">{rows}</span>
      </div>
      <div className="pb-[10px]">
        {cols.map((c) => (
          <div key={c.name} className="relative flex items-center gap-1.5 px-3 text-[11.5px]" style={{ height: ROW_H }}>
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
            <span className="grid w-4 shrink-0 place-items-center" style={{ color: c.pk ? "#efb100" : c.ref ? d.color : "var(--muted)" }}>
              {c.pk ? <Icon name="key" size={13} stroke={1.9} /> : c.ref ? <Icon name="link" size={13} stroke={1.9} /> : <span className={`rounded-full bg-current ${c.unique ? "h-1.5 w-1.5" : "h-1 w-1 opacity-50"}`} />}
            </span>
            <span className={`mono truncate ${c.pk ? "font-semibold text-ink" : c.ref ? "font-semibold" : "text-ink-2"}`} style={c.ref ? { color: d.color } : undefined}>{c.name}</span>
            {!c.nullable && !c.pk && <span className="text-[9px] text-danger" title="NOT NULL">*</span>}
            <span className="mono ml-auto truncate pl-2 text-[10.5px] text-muted">{typeLabel(c)}</span>
          </div>
        ))}
        {compact && cols.length < t.columns.length && <div className="px-3 pt-0.5 text-[11px] text-muted" dir="rtl" style={{ textAlign: "left", height: 18 }}>+{t.columns.length - cols.length} ستون دیگر</div>}
      </div>
    </div>
  );
});

export type ZoneNodeData = { title: string; en: string; color: string; count: number; w: number; h: number };
export type ZoneFlowNode = Node<ZoneNodeData, "zone">;

export const ZoneNode = memo(function ZoneNode({ data }: NodeProps<ZoneFlowNode>) {
  return (
    <div className="rounded-[28px] border-2 border-dashed" style={{ width: data.w, height: data.h, borderColor: `${data.color}50`, background: `${data.color}08` }}>
      <div className="zone-handle m-3 inline-flex items-center gap-2.5 rounded-full px-4 py-2 transition hover:brightness-95" dir="rtl" style={{ background: `${data.color}18` }} title="برای جابه‌جایی کل دامنه بکشید">
        <Icon name="move" size={20} className="opacity-70" />
        <span className="text-[22px] font-extrabold" style={{ color: data.color }}>{data.title}</span>
        <span className="mono text-[14px] text-muted">{data.en} · {data.count}</span>
      </div>
    </div>
  );
});
