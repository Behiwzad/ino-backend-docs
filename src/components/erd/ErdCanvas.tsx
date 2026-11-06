"use client";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ReactFlow, ReactFlowProvider, Background, BackgroundVariant, Controls, MiniMap, useReactFlow, applyNodeChanges,
  type Edge, type NodeChange, type Node, ConnectionMode, Panel,
} from "@xyflow/react";
import dagre from "@dagrejs/dagre";
import { tables, relations, domains, domainMap, tableMap } from "@/schema/tables";
import type { DomainKey } from "@/schema/types";
import { TableNode, ZoneNode, NODE_W, nodeHeight, type TableFlowNode, type ZoneFlowNode } from "./TableNode";
import { Icon } from "../Icon";

const nodeTypes = { table: TableNode, zone: ZoneNode };
const STORAGE = "ino-erd-positions-v2";
const ZONE_PAD = 36;
const ZONE_TOP = 70;

/* domain grid used for the initial "by domain" layout */
const DOMAIN_GRID: DomainKey[][] = [
  ["geo", "identity", "notify", "platform"],
  ["salon", "staff", "service"],
  ["catalog", "booking", "payment", "social"],
];

type Pos = Record<string, { x: number; y: number }>;

function domainLayout(compact: boolean): Pos {
  const pos: Pos = {};
  let y = 0;
  for (const row of DOMAIN_GRID) {
    let x = 0;
    let rowH = 0;
    for (const dk of row) {
      const ts = tables.filter((t) => t.domain === dk);
      const maxColH = 1250;
      let cx = 0, cy = 0, colW = 0, clusterH = 0;
      for (const t of ts) {
        const h = nodeHeight(t, compact);
        if (cy > 0 && cy + h > maxColH) { cx += NODE_W + 60; cy = 0; }
        pos[t.name] = { x: x + ZONE_PAD + cx, y: y + ZONE_TOP + cy };
        cy += h + 44;
        clusterH = Math.max(clusterH, cy);
        colW = cx + NODE_W;
      }
      x += colW + ZONE_PAD * 2 + 120;
      rowH = Math.max(rowH, clusterH + ZONE_TOP + ZONE_PAD);
    }
    y += rowH + 140;
  }
  return pos;
}

function dagreLayout(compact: boolean, visible: Set<string>, dir: "LR" | "TB" = "LR"): Pos {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: dir, nodesep: 40, ranksep: 140, marginx: 20, marginy: 20 });
  g.setDefaultEdgeLabel(() => ({}));
  tables.filter((t) => visible.has(t.name)).forEach((t) => g.setNode(t.name, { width: NODE_W, height: nodeHeight(t, compact) }));
  relations.filter((r) => visible.has(r.from) && visible.has(r.to) && r.from !== r.to).forEach((r) => g.setEdge(r.to, r.from));
  dagre.layout(g);
  const pos: Pos = {};
  g.nodes().forEach((n) => { const v = g.node(n); pos[n] = { x: v.x - v.width / 2, y: v.y - v.height / 2 }; });
  return pos;
}

function focusLayout(focus: string, compact: boolean): { pos: Pos; names: string[] } {
  const parents = [...new Set(relations.filter((r) => r.from === focus).map((r) => r.to))].filter((n) => n !== focus);
  const children = [...new Set(relations.filter((r) => r.to === focus).map((r) => r.from))].filter((n) => n !== focus && !parents.includes(n));
  const pos: Pos = {};
  const stack = (names: string[], x: number) => {
    let y = 0;
    names.forEach((n) => { pos[n] = { x, y }; y += nodeHeight(tableMap[n], true) + 30; });
    return y;
  };
  const hp = stack(parents, 0);
  const hc = stack(children, NODE_W * 2 + 260);
  const fh = nodeHeight(tableMap[focus], compact);
  pos[focus] = { x: NODE_W + 130, y: Math.max(0, (Math.max(hp, hc) - fh) / 2) };
  return { pos, names: [focus, ...parents, ...children] };
}

const referencedCols: Record<string, string[]> = {};
relations.forEach((r) => { (referencedCols[r.to] ??= []).includes(r.toColumn) || referencedCols[r.to].push(r.toColumn); });

interface Props {
  seedCounts: Record<string, number>;
  sample?: Record<string, Record<string, unknown>[]>;
  focus?: string;
  height?: number | string;
}

export function ErdCanvas(props: Props) {
  return (
    <ReactFlowProvider>
      <Inner {...props} />
    </ReactFlowProvider>
  );
}

function Inner({ seedCounts, sample, focus, height = "calc(100vh - 56px)" }: Props) {
  const mini = !!focus;
  const rf = useReactFlow();
  const [compact, setCompact] = useState(false);
  const [showZones, setShowZones] = useState(true);
  const [edgeType, setEdgeType] = useState<"default" | "smoothstep">("default");
  const [hiddenDomains, setHiddenDomains] = useState<Set<DomainKey>>(new Set());
  const [hover, setHover] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const focusData = useMemo(() => (focus ? focusLayout(focus, compact) : null), [focus, compact]);
  const visibleNames = useMemo(() => {
    if (focusData) return new Set(focusData.names);
    return new Set(tables.filter((t) => !hiddenDomains.has(t.domain)).map((t) => t.name));
  }, [focusData, hiddenDomains]);

  const openTable = useCallback((name: string) => setSelected(name), []);

  const makeNodes = useCallback(
    (pos: Pos): TableFlowNode[] =>
      tables
        .filter((t) => (focusData ? focusData.names.includes(t.name) : true))
        .map((t) => ({
          id: t.name,
          type: "table" as const,
          position: pos[t.name] ?? { x: 0, y: 0 },
          data: { table: t, compact: mini && t.name !== focus ? true : compact, dim: false, active: false, rows: seedCounts[t.name] ?? 0, referenced: referencedCols[t.name] ?? [], onOpen: openTable },
          zIndex: 2,
        })),
    [compact, focusData, focus, mini, seedCounts, openTable],
  );

  const [nodes, setNodes] = useState<TableFlowNode[]>(() => makeNodes(focusData ? focusData.pos : domainLayout(false)));

  // restore saved positions (full canvas only)
  useEffect(() => {
    if (mini) return;
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE) ?? "null") as Pos | null;
      if (saved) setNodes((ns) => ns.map((n) => (saved[n.id] ? { ...n, position: saved[n.id] } : n)));
    } catch {}
  }, [mini]);

  // keep data in sync with toggles
  useEffect(() => {
    setNodes((ns) => ns.map((n) => ({ ...n, data: { ...n.data, compact: mini && n.id !== focus ? true : compact } })));
  }, [compact, mini, focus]);

  const persist = useCallback((ns: TableFlowNode[]) => {
    if (mini) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try { localStorage.setItem(STORAGE, JSON.stringify(Object.fromEntries(ns.map((n) => [n.id, n.position])))); } catch {}
    }, 300);
  }, [mini]);

  /* zones = bounding boxes of each domain's tables (draggable → moves whole domain) */
  const zones: ZoneFlowNode[] = useMemo(() => {
    if (mini || !showZones) return [];
    return domains.filter((d) => !hiddenDomains.has(d.key)).flatMap((d) => {
      const ns = nodes.filter((n) => n.data.table.domain === d.key);
      if (!ns.length) return [];
      const minX = Math.min(...ns.map((n) => n.position.x)) - ZONE_PAD;
      const minY = Math.min(...ns.map((n) => n.position.y)) - ZONE_TOP;
      const maxX = Math.max(...ns.map((n) => n.position.x + NODE_W)) + ZONE_PAD;
      const maxY = Math.max(...ns.map((n) => n.position.y + nodeHeight(n.data.table, n.data.compact))) + ZONE_PAD;
      return [{ id: `zone:${d.key}`, type: "zone" as const, position: { x: minX, y: minY }, data: { title: d.title, en: d.en, color: d.color, count: ns.length, w: maxX - minX, h: maxY - minY }, zIndex: 0, selectable: false, draggable: true, style: { width: maxX - minX, height: maxY - minY } }];
    });
  }, [nodes, mini, showZones, hiddenDomains]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const zoneMoves = changes.filter((c): c is Extract<NodeChange, { type: "position" }> => c.type === "position" && c.id.startsWith("zone:") && !!c.position);
      const rest = changes.filter((c) => !("id" in c) || !String(c.id).startsWith("zone:"));
      setNodes((ns) => {
        let next = rest.length ? (applyNodeChanges(rest, ns as Node[]) as TableFlowNode[]) : ns;
        for (const zm of zoneMoves) {
          const dk = zm.id.slice(5);
          const z = zones.find((x) => x.id === zm.id);
          if (!z || !zm.position) continue;
          const dx = zm.position.x - z.position.x, dy = zm.position.y - z.position.y;
          next = next.map((n) => (n.data.table.domain === dk ? { ...n, position: { x: n.position.x + dx, y: n.position.y + dy } } : n));
        }
        if (changes.some((c) => c.type === "position" && !c.dragging)) persist(next);
        return next;
      });
    },
    [zones, persist],
  );

  const activeName = hover ?? selected;
  const neighbors = useMemo(() => {
    if (!activeName) return null;
    const s = new Set([activeName]);
    relations.forEach((r) => { if (r.from === activeName) s.add(r.to); if (r.to === activeName) s.add(r.from); });
    return s;
  }, [activeName]);

  const posMap = useMemo(() => Object.fromEntries(nodes.map((n) => [n.id, n.position])), [nodes]);

  const edges: Edge[] = useMemo(
    () =>
      relations
        .filter((r) => visibleNames.has(r.from) && visibleNames.has(r.to) && posMap[r.from] && posMap[r.to])
        .map((r) => {
          const a = posMap[r.from], b = posMap[r.to];
          const self = r.from === r.to;
          const targetRight = b.x + NODE_W / 2 > a.x + NODE_W / 2;
          const sSide = self ? "R" : targetRight ? "R" : "L";
          const tSide = self ? "R" : targetRight ? "L" : "R";
          const on = activeName ? r.from === activeName || r.to === activeName : false;
          const color = domainMap[tableMap[r.from].domain].color;
          return {
            id: r.id,
            source: r.from,
            target: r.to,
            sourceHandle: `s-${sSide}-${r.fromColumn}`,
            targetHandle: `t-${tSide}-${r.toColumn}`,
            type: edgeType,
            animated: on,
            markerStart: r.kind === "one-to-one" ? "erd-one" : "erd-many",
            markerEnd: r.nullable ? "erd-zero-one" : "erd-one",
            zIndex: on ? 3 : 1,
            style: { stroke: on ? color : activeName ? "var(--border)" : `${color}88`, strokeWidth: on ? 2.4 : 1.4, strokeDasharray: r.nullable ? "5 4" : undefined, opacity: activeName && !on ? 0.35 : 1 },
            label: on ? r.fromColumn : undefined,
            labelStyle: { fontSize: 10, fontFamily: "var(--font-mono)", fill: color },
            labelBgStyle: { fill: "var(--surface)" },
          } satisfies Edge;
        }),
    [visibleNames, posMap, activeName, edgeType],
  );

  const viewNodes = useMemo(() => {
    const ts = nodes
      .filter((n) => visibleNames.has(n.id))
      .map((n) => ({ ...n, data: { ...n.data, dim: !!neighbors && !neighbors.has(n.id), active: n.id === activeName } }));
    return [...zones, ...ts] as Node[];
  }, [nodes, zones, visibleNames, neighbors, activeName]);

  const focusOn = useCallback((name: string) => {
    const n = nodes.find((x) => x.id === name);
    if (!n) return;
    setTimeout(() => setSelected(name), 60); // after the pane click that follows the menu click
    rf.setCenter(n.position.x + NODE_W / 2, n.position.y + nodeHeight(n.data.table, n.data.compact) / 2, { zoom: 1.1, duration: 600 });
  }, [nodes, rf]);

  const relayout = (kind: "domain" | "dagre" | "dagre-tb") => {
    const pos = kind === "domain" ? domainLayout(compact) : dagreLayout(compact, visibleNames, kind === "dagre" ? "LR" : "TB");
    setNodes((ns) => { const next = ns.map((n) => (pos[n.id] ? { ...n, position: pos[n.id] } : n)); persist(next); return next; });
    setTimeout(() => rf.fitView({ duration: 600, padding: 0.08 }), 50);
  };

  const exportPositions = () => {
    const blob = new Blob([JSON.stringify(Object.fromEntries(nodes.map((n) => [n.id, n.position])), null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "ino-erd-layout.json"; a.click();
  };

  const results = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return [];
    return tables.filter((t) => t.name.includes(s) || t.title.includes(search.trim()) || t.columns.some((c) => c.name.includes(s))).slice(0, 8);
  }, [search]);

  const sel = selected ? tableMap[selected] : null;

  return (
    <div className="relative w-full overflow-hidden" style={{ height }} dir="ltr">
      <svg width="0" height="0" className="absolute">
        <defs>
          <marker id="erd-many" viewBox="0 0 20 20" markerWidth="16" markerHeight="16" refX="2" refY="10" orient="auto-start-reverse" markerUnits="userSpaceOnUse">
            <path d="M2 10 L16 2 M2 10 L16 10 M2 10 L16 18 M18 3 V17" fill="none" stroke="var(--text-2)" strokeWidth="1.5" />
          </marker>
          <marker id="erd-one" viewBox="0 0 20 20" markerWidth="16" markerHeight="16" refX="18" refY="10" orient="auto-start-reverse" markerUnits="userSpaceOnUse">
            <path d="M10 3 V17 M14 3 V17" fill="none" stroke="var(--text-2)" strokeWidth="1.5" />
          </marker>
          <marker id="erd-zero-one" viewBox="0 0 24 20" markerWidth="20" markerHeight="16" refX="22" refY="10" orient="auto-start-reverse" markerUnits="userSpaceOnUse">
            <circle cx="7" cy="10" r="4" fill="var(--surface)" stroke="var(--text-2)" strokeWidth="1.5" />
            <path d="M16 3 V17" fill="none" stroke="var(--text-2)" strokeWidth="1.5" />
          </marker>
        </defs>
      </svg>
      <ReactFlow
        nodes={viewNodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onNodeMouseEnter={(_, n) => n.type === "table" && setHover(n.id)}
        onNodeMouseLeave={() => setHover(null)}
        onNodeClick={(_, n) => n.type === "table" && setSelected(n.id)}
        onPaneClick={() => setSelected(null)}
        connectionMode={ConnectionMode.Loose}
        nodesConnectable={false}
        minZoom={0.05}
        maxZoom={2.5}
        fitView
        fitViewOptions={{ padding: mini ? 0.12 : 0.06 }}
        proOptions={{ hideAttribution: true }}
        panOnScroll={!mini}
        zoomOnScroll={mini ? false : undefined}
        selectionOnDrag={false}
        panOnDrag
        onlyRenderVisibleElements={!mini}
        className="dot-grid"
      >
        <Background variant={BackgroundVariant.Dots} gap={22} size={1.2} color="var(--grid-dot)" />
        <Controls position="bottom-left" showInteractive={false} />
        {!mini && <MiniMap position="bottom-right" pannable zoomable nodeColor={(n) => (n.type === "zone" ? "transparent" : domainMap[(n.data as { table: { domain: DomainKey } }).table.domain].color)} nodeStrokeWidth={0} maskColor="rgb(105 79 253 / 0.08)" style={{ width: 200, height: 140 }} />}

        {!mini && (
          <Panel position="top-left" className="!m-3">
            <div className="card flex max-w-[calc(100vw-340px)] flex-wrap items-center gap-2 p-2" dir="rtl">
              <div className="relative">
                <div className="flex h-9 items-center gap-2 rounded-full border border-line bg-surface-2 px-3">
                  <Icon name="search" size={15} className="text-muted" />
                  <input value={search} onFocus={() => setShowSearch(true)} onBlur={() => setTimeout(() => setShowSearch(false), 150)} onChange={(e) => setSearch(e.target.value)} placeholder="پیدا کردن جدول…" className="w-40 bg-transparent text-[13px] outline-none" />
                </div>
                {showSearch && results.length > 0 && (
                  <div className="card absolute right-0 top-11 z-10 w-72 p-1.5">
                    {results.map((t) => (
                      <button key={t.name} onMouseDown={() => { focusOn(t.name); setSearch(""); }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-right hover:bg-surface-2">
                        <span className="h-2 w-2 rounded-full" style={{ background: domainMap[t.domain].color }} />
                        <span className="mono text-[12.5px] font-semibold" dir="ltr">{t.name}</span>
                        <span className="mr-auto text-[11.5px] text-muted">{t.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Seg value={compact ? "keys" : "all"} onChange={(v) => setCompact(v === "keys")} options={[["all", "همه ستون‌ها"], ["keys", "فقط کلیدها"]]} />
              <Seg value={edgeType} onChange={(v) => setEdgeType(v as "default" | "smoothstep")} options={[["default", "منحنی"], ["smoothstep", "پله‌ای"]]} />
              <ToolBtn on={showZones} onClick={() => setShowZones((s) => !s)} icon="layout" label="ناحیه‌ها" />
              <div className="mx-1 h-6 w-px bg-line" />
              <ToolBtn onClick={() => relayout("domain")} icon="reset" label="چیدمان دامنه‌ای" />
              <ToolBtn onClick={() => relayout("dagre")} icon="flow" label="Auto افقی" />
              <ToolBtn onClick={() => relayout("dagre-tb")} icon="flow" label="Auto عمودی" />
              <ToolBtn onClick={() => rf.fitView({ duration: 500, padding: 0.06 })} icon="focus" label="نمای کامل" />
              <ToolBtn onClick={exportPositions} icon="download" label="Layout JSON" />
            </div>
            <div className="mt-2 flex max-w-[calc(100vw-340px)] flex-wrap gap-1.5" dir="rtl">
              {domains.map((d) => {
                const off = hiddenDomains.has(d.key);
                return (
                  <button key={d.key} onClick={() => setHiddenDomains((s) => { const n = new Set(s); if (n.has(d.key)) n.delete(d.key); else n.add(d.key); return n; })}
                    className="chip border bg-surface !px-2 !text-[11px] transition" style={{ borderColor: off ? "var(--border)" : `${d.color}66`, color: off ? "var(--muted)" : d.color, opacity: off ? 0.6 : 1 }}>
                    <span className="h-2 w-2 rounded-full" style={{ background: off ? "var(--muted)" : d.color }} />
                    {d.title}
                  </button>
                );
              })}
            </div>
          </Panel>
        )}
        {!mini && (
          <Panel position="bottom-left" className="!mb-3 !ml-16 hidden lg:block">
            <div className="card flex items-center gap-4 whitespace-nowrap px-4 py-2 text-[11.5px] text-ink-2" dir="rtl">
              <span className="flex items-center gap-1.5"><Legend kind="many" /> چند (FK)</span>
              <span className="flex items-center gap-1.5"><Legend kind="one" /> یک (اجباری)</span>
              <span className="flex items-center gap-1.5"><Legend kind="zero" /> صفر یا یک (nullable)</span>
              <span className="hidden text-muted 2xl:inline">· درگ ناحیه = جابه‌جایی کل دامنه · کلیک = جزئیات</span>
            </div>
          </Panel>
        )}
      </ReactFlow>

      {sel && !mini && <Drawer name={sel.name} sample={sample?.[sel.name] ?? []} onClose={() => setSelected(null)} onFocus={focusOn} />}
    </div>
  );
}

function Seg({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <div className="flex h-9 items-center rounded-full border border-line bg-surface-2 p-0.5">
      {options.map(([v, l]) => (
        <button key={v} onClick={() => onChange(v)} className={`h-8 rounded-full px-3 text-[12px] font-semibold transition ${value === v ? "bg-surface text-primary shadow-sm" : "text-ink-2"}`}>{l}</button>
      ))}
    </div>
  );
}
function ToolBtn({ onClick, icon, label, on }: { onClick: () => void; icon: string; label: string; on?: boolean }) {
  return (
    <button onClick={onClick} title={label} className={`flex h-9 items-center gap-1.5 rounded-full border px-2.5 text-[12px] font-semibold transition ${on ? "border-primary/40 bg-primary-soft text-primary" : "border-line text-ink-2 hover:bg-surface-2"}`}>
      <Icon name={icon} size={15} /> <span className="hidden 2xl:inline">{label}</span>
    </button>
  );
}
function Legend({ kind }: { kind: "many" | "one" | "zero" }) {
  return (
    <svg width="34" height="14" viewBox="0 0 34 14" className="text-ink-2">
      <line x1="0" y1="7" x2="34" y2="7" stroke="currentColor" strokeWidth="1.3" strokeDasharray={kind === "zero" ? "4 3" : undefined} />
      {kind === "many" && <path d="M22 7 L32 1 M22 7 L32 7 M22 7 L32 13" stroke="currentColor" strokeWidth="1.3" fill="none" />}
      {kind === "one" && <path d="M26 1 V13 M30 1 V13" stroke="currentColor" strokeWidth="1.3" />}
      {kind === "zero" && <><circle cx="24" cy="7" r="3.5" fill="var(--surface)" stroke="currentColor" strokeWidth="1.3" /><path d="M31 1 V13" stroke="currentColor" strokeWidth="1.3" /></>}
    </svg>
  );
}

function Drawer({ name, sample, onClose, onFocus }: { name: string; sample: Record<string, unknown>[]; onClose: () => void; onFocus: (n: string) => void }) {
  const t = tableMap[name];
  const d = domainMap[t.domain];
  const out = relations.filter((r) => r.from === name);
  const inc = relations.filter((r) => r.to === name);
  const cols = t.columns.map((c) => c.name);
  return (
    <aside className="card fade-up absolute bottom-3 right-3 top-3 z-20 flex w-[400px] max-w-[calc(100%-24px)] flex-col overflow-hidden" dir="rtl">
      <div className="relative p-4" style={{ background: `linear-gradient(180deg, ${d.color}1c, transparent)` }}>
        <button onClick={onClose} className="absolute left-3 top-3 grid h-8 w-8 place-items-center rounded-full hover:bg-surface-2"><Icon name="close" size={16} /></button>
        <span className="chip" style={{ background: `${d.color}1f`, color: d.color }}>{d.title}</span>
        <h3 className="mono mt-2 text-lg font-extrabold" dir="ltr" style={{ textAlign: "right" }}>{t.name}</h3>
        <div className="text-[13px] font-bold">{t.title}</div>
        <p className="mt-1.5 text-[12.5px] leading-6 text-ink-2">{t.description}</p>
        <Link href={`/tables/${t.name}`} className="mt-3 inline-flex h-9 items-center gap-2 rounded-full bg-primary px-4 text-[12.5px] font-bold text-white">صفحه کامل جدول ← SQL، دیتا، API</Link>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto p-4 pt-1">
        <section>
          <h4 className="mb-2 text-[12px] font-bold text-muted">ستون‌ها ({t.columns.length})</h4>
          <div className="divide-y divide-line rounded-xl border border-line">
            {t.columns.map((c) => (
              <div key={c.name} className="flex items-start gap-2 px-3 py-1.5 text-[12px]">
                <span className="mono font-semibold" dir="ltr" style={{ color: c.ref ? d.color : undefined }}>{c.pk ? "🔑 " : ""}{c.name}</span>
                <span className="mono text-[11px] text-muted" dir="ltr">{c.type === "enum" ? c.enum : c.type}{c.nullable ? "?" : ""}</span>
                {c.ref && <button onClick={() => onFocus(c.ref!.table)} className="mono mr-auto text-[11px] text-primary hover:underline" dir="ltr">→ {c.ref.table}</button>}
              </div>
            ))}
          </div>
        </section>
        <section>
          <h4 className="mb-2 text-[12px] font-bold text-muted">روابط</h4>
          <div className="flex flex-wrap gap-1.5">
            {out.map((r) => <button key={r.id} onClick={() => onFocus(r.to)} className="chip border border-line bg-surface-2 mono" dir="ltr">{r.fromColumn} → {r.to}</button>)}
            {inc.map((r) => <button key={r.id} onClick={() => onFocus(r.from)} className="chip border border-dashed border-line mono text-ink-2" dir="ltr">{r.from}.{r.fromColumn} ←</button>)}
          </div>
        </section>
        <section>
          <h4 className="mb-2 text-[12px] font-bold text-muted">نمونه دیتای فیک ({sample.length})</h4>
          <div className="overflow-auto rounded-xl border border-line" dir="ltr">
            <table className="mono w-max text-[11px]">
              <thead className="bg-surface-2"><tr>{cols.map((c) => <th key={c} className="px-2 py-1.5 text-left font-semibold text-ink-2">{c}</th>)}</tr></thead>
              <tbody>
                {sample.slice(0, 6).map((r, i) => (
                  <tr key={i} className="border-t border-line">{cols.map((c) => <td key={c} className="max-w-[180px] truncate px-2 py-1 text-ink">{fmt(r[c])}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </aside>
  );
}
export function fmt(v: unknown) {
  if (v === null || v === undefined) return "∅";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}
