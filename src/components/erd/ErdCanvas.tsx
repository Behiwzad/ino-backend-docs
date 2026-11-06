"use client";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ReactFlow, ReactFlowProvider, Background, BackgroundVariant, MiniMap, useReactFlow, applyNodeChanges, Panel,
  type Edge, type NodeChange, type Node, ConnectionMode,
} from "@xyflow/react";
import dagre from "@dagrejs/dagre";
import { tables, relations, domains, domainMap, tableMap } from "@/schema/tables";
import type { DomainKey } from "@/schema/types";
import { TableNode, ZoneNode, NODE_W, nodeHeight, isCompact, ErdViewCtx, type TableFlowNode, type ZoneFlowNode } from "./TableNode";
import { Icon, type IconName } from "../Icon";

const nodeTypes = { table: TableNode, zone: ZoneNode };
const STORAGE = "ino-erd-positions-v3";
const HINT_KEY = "ino-erd-hint-v1";
const ZONE_PAD = 36;
const ZONE_TOP = 78;

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
    let x = 0, rowH = 0;
    for (const dk of row) {
      const ts = tables.filter((t) => t.domain === dk);
      const maxColH = compact ? 900 : 1250;
      let cx = 0, cy = 0, colW = 0, clusterH = 0;
      for (const t of ts) {
        const h = nodeHeight(t, compact);
        if (cy > 0 && cy + h > maxColH) { cx += NODE_W + 56; cy = 0; }
        pos[t.name] = { x: x + ZONE_PAD + cx, y: y + ZONE_TOP + cy };
        cy += h + 40;
        clusterH = Math.max(clusterH, cy);
        colW = cx + NODE_W;
      }
      x += colW + ZONE_PAD * 2 + 110;
      rowH = Math.max(rowH, clusterH + ZONE_TOP + ZONE_PAD);
    }
    y += rowH + 130;
  }
  return pos;
}

function dagreLayout(compact: boolean, visible: Set<string>, dir: "LR" | "TB"): Pos {
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

function focusLayout(focus: string): { pos: Pos; names: string[] } {
  const parents = [...new Set(relations.filter((r) => r.from === focus).map((r) => r.to))].filter((n) => n !== focus);
  const children = [...new Set(relations.filter((r) => r.to === focus).map((r) => r.from))].filter((n) => n !== focus && !parents.includes(n));
  const pos: Pos = {};
  const stack = (names: string[], x: number) => {
    let y = 0;
    names.forEach((n) => { pos[n] = { x, y }; y += nodeHeight(tableMap[n], true) + 28; });
    return y;
  };
  const hp = stack(parents, 0);
  const hc = stack(children, NODE_W * 2 + 240);
  const fh = nodeHeight(tableMap[focus], false);
  pos[focus] = { x: NODE_W + 120, y: Math.max(0, (Math.max(hp, hc) - fh) / 2) };
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

const ls = {
  get<T>(k: string): T | null { try { return JSON.parse(localStorage.getItem(k) ?? "null"); } catch { return null; } },
  set(k: string, v: unknown) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

function Inner({ seedCounts, sample, focus, height = "calc(100dvh - 64px)" }: Props) {
  const mini = !!focus;
  const rf = useReactFlow();
  const router = useRouter();
  const [compact, setCompact] = useState(false);
  const [showZones, setShowZones] = useState(true);
  const [showMinimap, setShowMinimap] = useState(true);
  const [edgeType, setEdgeType] = useState<"default" | "smoothstep">("default");
  const [hiddenDomains, setHiddenDomains] = useState<Set<DomainKey>>(new Set());
  const [hover, setHover] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [menu, setMenu] = useState<null | "layout" | "view" | "domains">(null);
  const [hint, setHint] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const focusData = useMemo(() => (focus ? focusLayout(focus) : null), [focus]);

  const [nodes, setNodes] = useState<TableFlowNode[]>(() => {
    const pos = focusData ? focusData.pos : domainLayout(false);
    return tables
      .filter((t) => (focusData ? focusData.names.includes(t.name) : true))
      .map((t) => ({ id: t.name, type: "table" as const, position: pos[t.name] ?? { x: 0, y: 0 }, data: { table: t, rows: seedCounts[t.name] ?? 0, referenced: referencedCols[t.name] ?? [] }, zIndex: 2 }));
  });

  // client-only setup: mobile defaults, saved layout, first-visit hint
  useEffect(() => {
    if (mini) return;
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    setIsMobile(mobile);
    if (mobile) { setCompact(true); setShowMinimap(false); }
    const saved = ls.get<Pos>(STORAGE);
    if (saved) setNodes((ns) => ns.map((n) => (saved[n.id] ? { ...n, position: saved[n.id] } : n)));
    else if (mobile) setNodes((ns) => { const p = domainLayout(true); return ns.map((n) => ({ ...n, position: p[n.id] ?? n.position })); });
    setHint(!ls.get<boolean>(HINT_KEY));
    setTimeout(() => rf.fitView({ padding: 0.06 }), 50);
  }, [mini, rf]);

  const persist = useCallback((ns: TableFlowNode[]) => {
    if (mini) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => ls.set(STORAGE, Object.fromEntries(ns.map((n) => [n.id, n.position]))), 300);
  }, [mini]);

  const visibleNames = useMemo(() => {
    if (focusData) return new Set(focusData.names);
    return new Set(tables.filter((t) => !hiddenDomains.has(t.domain)).map((t) => t.name));
  }, [focusData, hiddenDomains]);

  const view = useMemo(() => ({ compactAll: compact, focus }), [compact, focus]);

  const zones: ZoneFlowNode[] = useMemo(() => {
    if (mini || !showZones) return [];
    return domains.filter((d) => !hiddenDomains.has(d.key)).flatMap((d) => {
      const ns = nodes.filter((n) => n.data.table.domain === d.key);
      if (!ns.length) return [];
      const minX = Math.min(...ns.map((n) => n.position.x)) - ZONE_PAD;
      const minY = Math.min(...ns.map((n) => n.position.y)) - ZONE_TOP;
      const maxX = Math.max(...ns.map((n) => n.position.x + NODE_W)) + ZONE_PAD;
      const maxY = Math.max(...ns.map((n) => n.position.y + nodeHeight(n.data.table, isCompact(n.id, view)))) + ZONE_PAD;
      return [{ id: `zone:${d.key}`, type: "zone" as const, position: { x: minX, y: minY }, data: { title: d.title, en: d.en, color: d.color, count: ns.length, w: maxX - minX, h: maxY - minY }, zIndex: 0, selectable: false, draggable: true, dragHandle: ".zone-handle", style: { width: maxX - minX, height: maxY - minY } }];
    });
  }, [nodes, mini, showZones, hiddenDomains, view]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const zoneMoves = changes.filter((c): c is Extract<NodeChange, { type: "position" }> => c.type === "position" && c.id.startsWith("zone:") && !!c.position);
      const rest = changes.filter((c) => !("id" in c) || !String(c.id).startsWith("zone:"));
      setNodes((ns) => {
        let next = rest.length ? (applyNodeChanges(rest, ns as Node[]) as TableFlowNode[]) : ns;
        for (const zm of zoneMoves) {
          const z = zones.find((x) => x.id === zm.id);
          if (!z || !zm.position) continue;
          const dk = zm.id.slice(5), dx = zm.position.x - z.position.x, dy = zm.position.y - z.position.y;
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
  const ctx = useMemo(() => ({ active: activeName, neighbors, ...view }), [activeName, neighbors, view]);

  const posMap = useMemo(() => Object.fromEntries(nodes.map((n) => [n.id, n.position])), [nodes]);

  const edges: Edge[] = useMemo(
    () =>
      relations
        .filter((r) => visibleNames.has(r.from) && visibleNames.has(r.to) && posMap[r.from] && posMap[r.to])
        .map((r) => {
          const a = posMap[r.from], b = posMap[r.to];
          const toRight = r.from === r.to || b.x > a.x;
          const on = activeName ? r.from === activeName || r.to === activeName : false;
          const color = domainMap[tableMap[r.from].domain].color;
          return {
            id: r.id, source: r.from, target: r.to,
            sourceHandle: `s-${toRight ? "R" : "L"}-${r.fromColumn}`,
            targetHandle: `t-${r.from === r.to ? "R" : toRight ? "L" : "R"}-${r.toColumn}`,
            type: edgeType, animated: on,
            markerStart: r.kind === "one-to-one" ? "erd-one" : "erd-many",
            markerEnd: r.nullable ? "erd-zero-one" : "erd-one",
            zIndex: on ? 3 : 1,
            style: { stroke: on ? color : activeName ? "var(--border-strong)" : `${color}80`, strokeWidth: on ? 2.4 : 1.4, strokeDasharray: r.nullable ? "5 4" : undefined, opacity: activeName && !on ? 0.3 : 1 },
            label: on ? r.fromColumn : undefined,
            labelStyle: { fontSize: 11, fontFamily: "var(--font-mono)", fill: color },
            labelBgStyle: { fill: "var(--surface)" }, labelBgPadding: [6, 3] as [number, number], labelBgBorderRadius: 6,
          } satisfies Edge;
        }),
    [visibleNames, posMap, activeName, edgeType],
  );

  const viewNodes = useMemo(() => [...zones, ...nodes.map((n) => (visibleNames.has(n.id) === !n.hidden ? n : { ...n, hidden: !visibleNames.has(n.id) }))] as Node[], [nodes, zones, visibleNames]);

  const focusOn = useCallback((name: string) => {
    const n = nodes.find((x) => x.id === name);
    if (!n) return;
    if (n.data.table && hiddenDomains.has(n.data.table.domain)) setHiddenDomains((s) => { const x = new Set(s); x.delete(n.data.table.domain); return x; });
    setTimeout(() => setSelected(name), 60);
    rf.setCenter(n.position.x + NODE_W / 2, n.position.y + nodeHeight(n.data.table, compact) / 2, { zoom: isMobile ? 0.9 : 1.1, duration: 600 });
  }, [nodes, rf, compact, isMobile, hiddenDomains]);

  const relayout = (kind: "domain" | "dagre" | "dagre-tb") => {
    const pos = kind === "domain" ? domainLayout(compact) : dagreLayout(compact, visibleNames, kind === "dagre" ? "LR" : "TB");
    setNodes((ns) => { const next = ns.map((n) => (pos[n.id] ? { ...n, position: pos[n.id] } : n)); persist(next); return next; });
    setMenu(null);
    setTimeout(() => rf.fitView({ duration: 600, padding: 0.06 }), 60);
  };
  const exportPositions = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(Object.fromEntries(nodes.map((n) => [n.id, n.position])), null, 2)], { type: "application/json" }));
    a.download = "ino-erd-layout.json"; a.click(); setMenu(null);
  };
  const closeHint = () => { setHint(false); ls.set(HINT_KEY, true); };

  // keyboard shortcuts
  useEffect(() => {
    if (mini) return;
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.closest("input, textarea");
      if (e.key === "Escape") { setMenu(null); setSelected(null); (e.target as HTMLElement)?.blur?.(); }
      if (typing || e.ctrlKey || e.metaKey) return;
      if (e.key === "/") { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key.toLowerCase() === "f") rf.fitView({ duration: 500, padding: 0.06 });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mini, rf]);

  const sel = selected ? tableMap[selected] : null;
  const shownCount = visibleNames.size;

  return (
    <div className="relative w-full overflow-hidden" style={{ height }} dir="ltr" onClick={() => menu && setMenu(null)}>
      <svg width="0" height="0" className="absolute" aria-hidden>
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

      <ErdViewCtx.Provider value={ctx}>
        <ReactFlow
          nodes={viewNodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onNodeMouseEnter={(_, n) => !isMobile && n.type === "table" && setHover(n.id)}
          onNodeMouseLeave={() => setHover(null)}
          onNodeClick={(_, n) => { if (n.type !== "table") return; if (mini) router.push(`/tables/${n.id}`); else setSelected(n.id); }}
          onPaneClick={() => { setSelected(null); setMenu(null); }}
          connectionMode={ConnectionMode.Loose}
          nodesConnectable={false}
          minZoom={0.05}
          maxZoom={2.5}
          fitView
          fitViewOptions={{ padding: mini ? 0.12 : 0.06 }}
          proOptions={{ hideAttribution: true }}
          panOnScroll={!mini && !isMobile}
          zoomOnScroll={mini ? false : undefined}
          zoomOnDoubleClick={false}
          selectionOnDrag={false}
          panOnDrag
          onlyRenderVisibleElements={!mini}
          className="dot-grid"
        >
          <Background variant={BackgroundVariant.Dots} gap={22} size={1.2} color="var(--grid-dot)" />
          {!mini && showMinimap && (
            <MiniMap position="bottom-right" pannable zoomable nodeColor={(n) => (n.type === "zone" ? "transparent" : domainMap[(n.data as { table: { domain: DomainKey } }).table.domain].color)} nodeStrokeWidth={0} maskColor="rgb(105 79 253 / 0.08)" style={{ width: 190, height: 130 }} />
          )}

          {/* zoom controls (design-system buttons) */}
          <Panel position="bottom-left" className="!m-3">
            <div className="flex flex-col gap-1.5">
              <IconBtn icon="zoomIn" label="بزرگ‌نمایی" onClick={() => rf.zoomIn({ duration: 200 })} />
              <IconBtn icon="zoomOut" label="کوچک‌نمایی" onClick={() => rf.zoomOut({ duration: 200 })} />
              <IconBtn icon="fit" label="نمای کامل (F)" onClick={() => rf.fitView({ duration: 500, padding: 0.06 })} />
            </div>
          </Panel>

          {!mini && (
            <Panel position="top-center" className="!m-3 !w-[calc(100%-24px)] md:!w-auto">
              <div className="popover flex items-center gap-1.5 p-1.5" dir="rtl" onClick={(e) => e.stopPropagation()}>
                <TableSearch inputRef={searchRef} onPick={focusOn} />
                <span className="mx-0.5 hidden h-6 w-px bg-line sm:block" />
                <MenuBtn icon="layers" label="دامنه‌ها" open={menu === "domains"} onClick={() => setMenu(menu === "domains" ? null : "domains")} badge={hiddenDomains.size ? `${domains.length - hiddenDomains.size}/${domains.length}` : undefined} />
                <MenuBtn icon="eye" label="نمایش" open={menu === "view"} onClick={() => setMenu(menu === "view" ? null : "view")} />
                <MenuBtn icon="canvas" label="چیدمان" open={menu === "layout"} onClick={() => setMenu(menu === "layout" ? null : "layout")} />

                {menu && (
                  <div className="popover fade-up absolute left-1/2 top-[calc(100%+8px)] z-30 w-[min(340px,calc(100vw-24px))] -translate-x-1/2 p-3 md:left-auto md:right-0 md:translate-x-0">
                    {menu === "domains" && (
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-[13px] font-bold">نمایش دامنه‌ها <span className="font-medium text-muted">· {shownCount} جدول</span></span>
                          <button className="btn btn-ghost btn-xs" onClick={() => setHiddenDomains(new Set())}>همه</button>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          {domains.map((d) => {
                            const on = !hiddenDomains.has(d.key);
                            return (
                              <button key={d.key} onClick={() => setHiddenDomains((s) => { const n = new Set(s); if (n.has(d.key)) n.delete(d.key); else n.add(d.key); return n; })}
                                onDoubleClick={() => setHiddenDomains(new Set(domains.filter((x) => x.key !== d.key).map((x) => x.key)))}
                                className={`flex h-9 items-center gap-2 rounded-xl px-2.5 text-right text-[13px] font-semibold transition hover:bg-surface-2 ${on ? "" : "text-muted"}`}>
                                <span className="grid h-4 w-4 shrink-0 place-items-center rounded-[5px] border-2" style={{ borderColor: on ? d.color : "var(--border-strong)", background: on ? d.color : "transparent" }}>
                                  {on && <Icon name="check" size={11} stroke={3} className="text-white" />}
                                </span>
                                <span className="truncate">{d.title}</span>
                              </button>
                            );
                          })}
                        </div>
                        <p className="mt-2 text-[11.5px] text-muted">دابل‌کلیک = فقط همین دامنه</p>
                      </div>
                    )}
                    {menu === "view" && (
                      <div className="space-y-3">
                        <Row label="ستون‌ها"><Seg value={compact ? "keys" : "all"} onChange={(v) => setCompact(v === "keys")} options={[["all", "همه"], ["keys", "فقط کلیدها"]]} /></Row>
                        <Row label="خطوط"><Seg value={edgeType} onChange={(v) => setEdgeType(v as "default" | "smoothstep")} options={[["default", "منحنی"], ["smoothstep", "پله‌ای"]]} /></Row>
                        <Row label="ناحیه دامنه‌ها"><Toggle on={showZones} onChange={setShowZones} /></Row>
                        <Row label="نقشه کوچک"><Toggle on={showMinimap} onChange={setShowMinimap} /></Row>
                        <div className="rounded-xl bg-surface-2 p-2.5 text-[12px] text-ink-2">
                          <div className="mb-1.5 font-bold text-ink">راهنمای خطوط</div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                            <span className="flex items-center gap-1.5"><Legend kind="many" /> چند (FK)</span>
                            <span className="flex items-center gap-1.5"><Legend kind="one" /> یک</span>
                            <span className="flex items-center gap-1.5"><Legend kind="zero" /> اختیاری</span>
                          </div>
                        </div>
                      </div>
                    )}
                    {menu === "layout" && (
                      <div className="space-y-0.5">
                        <MenuItem icon="layers" title="چیدمان دامنه‌ای" sub="جداول هر دامنه کنار هم (پیش‌فرض)" onClick={() => relayout("domain")} />
                        <MenuItem icon="flow" title="خودکار افقی" sub="جهت روابط از چپ به راست" onClick={() => relayout("dagre")} />
                        <MenuItem icon="route" title="خودکار عمودی" sub="جهت روابط از بالا به پایین" onClick={() => relayout("dagre-tb")} />
                        <div className="my-1 h-px bg-line" />
                        <MenuItem icon="download" title="دانلود چیدمان" sub="موقعیت جداول به‌صورت JSON" onClick={exportPositions} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Panel>
          )}

          {!mini && hint && (
            <Panel position="bottom-center" className="!mb-3 hidden md:block">
              <div className="popover fade-up flex items-center gap-3 px-4 py-2.5 text-[12.5px] text-ink-2" dir="rtl">
                <Icon name="idea" size={18} className="text-primary" />
                <span><b className="text-ink">راهنما:</b> کشیدن پس‌زمینه یا اسکرول = حرکت · <span className="kbd">Ctrl</span>+اسکرول = زوم · کلیک روی جدول = جزئیات · کشیدن عنوان دامنه = جابه‌جایی کل دامنه · <span className="kbd">/</span> جستجو · <span className="kbd">F</span> نمای کامل</span>
                <button className="btn btn-ghost btn-xs" onClick={closeHint}>متوجه شدم</button>
              </div>
            </Panel>
          )}
        </ReactFlow>
      </ErdViewCtx.Provider>

      {sel && !mini && <Drawer key={sel.name} name={sel.name} sample={sample?.[sel.name] ?? []} onClose={() => setSelected(null)} onFocus={focusOn} />}
    </div>
  );
}

/* ───────── toolbar parts ───────── */
function TableSearch({ inputRef, onPick }: { inputRef: React.RefObject<HTMLInputElement | null>; onPick: (n: string) => void }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);
  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    // rank: exact name > name prefix > name contains > Persian title > column match
    const score = (t: (typeof tables)[number]) =>
      t.name === s ? 0 : t.name.startsWith(s) ? 1 : t.name.includes(s) ? 2 : t.title.includes(q.trim()) ? 3 : t.columns.some((c) => c.name.includes(s)) ? 4 : 9;
    return tables.map((t) => [score(t), t] as const).filter(([sc]) => sc < 9).sort((a, b) => a[0] - b[0]).map(([, t]) => t).slice(0, 8);
  }, [q]);
  const pick = (n: string) => { onPick(n); setQ(""); setOpen(false); inputRef.current?.blur(); };
  return (
    <div className="relative min-w-0 flex-1 md:w-60 md:flex-none">
      <label className="field !h-9 !shadow-none !bg-surface-2">
        <Icon name="search" size={17} />
        <input ref={inputRef} value={q} onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)}
          onChange={(e) => { setQ(e.target.value); setI(0); }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setI((x) => Math.min(x + 1, results.length - 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setI((x) => Math.max(x - 1, 0)); }
            if (e.key === "Enter" && results[i]) pick(results[i].name);
          }}
          placeholder="پیدا کردن جدول…" className="!text-[13.5px]" aria-label="پیدا کردن جدول" />
        <span className="kbd mono hidden md:inline-grid">/</span>
      </label>
      {open && results.length > 0 && (
        <div className="popover absolute right-0 top-11 z-40 w-[min(320px,calc(100vw-24px))] p-1.5">
          {results.map((t, k) => (
            <button key={t.name} onMouseDown={() => pick(t.name)} onMouseEnter={() => setI(k)} className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-right ${k === i ? "bg-surface-2" : ""}`}>
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: domainMap[t.domain].color }} />
              <span className="mono text-[12.5px] font-semibold" dir="ltr">{t.name}</span>
              <span className="ms-auto truncate text-[12px] text-muted">{t.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MenuBtn({ icon, label, open, onClick, badge }: { icon: IconName; label: string; open: boolean; onClick: () => void; badge?: string }) {
  return (
    <button onClick={onClick} aria-expanded={open} aria-pressed={open} title={label} className="btn btn-stroke btn-sm !shadow-none hover:!shadow-[var(--shadow)] max-sm:!w-9 max-sm:!px-0">
      <Icon name={icon} size={17} />
      <span className="hidden sm:inline">{label}</span>
      {badge && <span className="badge badge-violet !h-4 !px-1 !text-[10px]">{badge}</span>}
    </button>
  );
}
function IconBtn({ icon, label, onClick }: { icon: IconName; label: string; onClick: () => void }) {
  return <button onClick={onClick} title={label} aria-label={label} className="btn btn-stroke btn-icon btn-sm"><Icon name={icon} size={17} /></button>;
}
function MenuItem({ icon, title, sub, onClick }: { icon: IconName; title: string; sub: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-right transition hover:bg-surface-2">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface-2 text-ink-2"><Icon name={icon} size={17} /></span>
      <span><span className="block text-[13.5px] font-semibold">{title}</span><span className="block text-[11.5px] text-muted">{sub}</span></span>
    </button>
  );
}
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex items-center justify-between gap-3"><span className="text-[13px] font-semibold">{label}</span>{children}</div>;
}
function Seg({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <div className="seg" role="tablist">
      {options.map(([v, l]) => <button key={v} role="tab" aria-selected={value === v} onClick={() => onChange(v)} className="seg-item">{l}</button>)}
    </div>
  );
}
function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button role="switch" aria-checked={on} onClick={() => onChange(!on)} className="relative h-6 w-10 rounded-full transition" style={{ background: on ? "var(--primary)" : "var(--surface-3)" }}>
      <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all" style={{ left: on ? 18 : 2 }} />
    </button>
  );
}
function Legend({ kind }: { kind: "many" | "one" | "zero" }) {
  return (
    <svg width="34" height="14" viewBox="0 0 34 14" className="text-ink-2" aria-hidden>
      <line x1="0" y1="7" x2="34" y2="7" stroke="currentColor" strokeWidth="1.3" strokeDasharray={kind === "zero" ? "4 3" : undefined} />
      {kind === "many" && <path d="M22 7 L32 1 M22 7 L32 7 M22 7 L32 13" stroke="currentColor" strokeWidth="1.3" fill="none" />}
      {kind === "one" && <path d="M26 1 V13 M30 1 V13" stroke="currentColor" strokeWidth="1.3" />}
      {kind === "zero" && <><circle cx="24" cy="7" r="3.5" fill="var(--surface)" stroke="currentColor" strokeWidth="1.3" /><path d="M31 1 V13" stroke="currentColor" strokeWidth="1.3" /></>}
    </svg>
  );
}

/* ───────── details panel (side panel on desktop, bottom sheet on mobile) ───────── */
function Drawer({ name, sample, onClose, onFocus }: { name: string; sample: Record<string, unknown>[]; onClose: () => void; onFocus: (n: string) => void }) {
  const t = tableMap[name];
  const d = domainMap[t.domain];
  const out = relations.filter((r) => r.from === name);
  const inc = relations.filter((r) => r.to === name);
  const cols = t.columns.map((c) => c.name);
  const [tab, setTab] = useState<"cols" | "rel" | "data">("cols");
  return (
    <aside className="popover absolute inset-x-2 bottom-2 z-30 flex max-h-[72%] flex-col overflow-hidden drawer-anim md:inset-x-auto md:bottom-3 md:right-3 md:top-3 md:max-h-none md:w-[400px]" dir="rtl" onClick={(e) => e.stopPropagation()}>
      <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-surface-3 md:hidden" />
      <div className="relative p-4 pb-3" style={{ background: `linear-gradient(180deg, ${d.color}14, transparent)` }}>
        <button onClick={onClose} className="btn btn-ghost btn-icon btn-sm absolute left-3 top-3" aria-label="بستن"><Icon name="close" size={18} /></button>
        <span className="chip" style={{ background: `${d.color}1c`, color: d.color }}>{d.title}</span>
        <h3 className="mono mt-2 break-all text-[18px] font-semibold" dir="ltr" style={{ textAlign: "right" }}>{t.name}</h3>
        <div className="text-[14px] font-bold">{t.title}</div>
        <p className="mt-1 line-clamp-3 text-[13px] leading-6 text-ink-2">{t.description}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href={`/tables/${t.name}`} className="btn btn-primary btn-sm">صفحه کامل جدول <Icon name="arrowL" size={15} /></Link>
          <button onClick={() => onFocus(t.name)} className="btn btn-stroke btn-sm"><Icon name="focus" size={15} /> تمرکز</button>
        </div>
      </div>
      <div className="px-4">
        <div className="seg w-full" role="tablist">
          {([["cols", `ستون‌ها ${t.columns.length}`], ["rel", `روابط ${out.length + inc.length}`], ["data", `دیتا ${sample.length}`]] as const).map(([k, l]) => (
            <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className="seg-item flex-1">{l}</button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 pt-3">
        {tab === "cols" && (
          <div className="divide-y divide-line overflow-hidden rounded-xl" style={{ boxShadow: "var(--shadow)" }}>
            {t.columns.map((c) => (
              <div key={c.name} className="flex items-center gap-2 px-3 py-2 text-[12.5px]" dir="ltr">
                <span className="grid w-4 place-items-center" style={{ color: c.pk ? "#efb100" : c.ref ? d.color : "var(--muted)" }}>{c.pk ? <Icon name="key" size={13} /> : c.ref ? <Icon name="link" size={13} /> : <span className="h-1 w-1 rounded-full bg-current" />}</span>
                <span className="mono font-semibold" style={{ color: c.ref ? d.color : undefined }}>{c.name}</span>
                <span className="mono text-[11px] text-muted">{c.type === "enum" ? c.enum : c.type}{c.nullable ? "?" : ""}</span>
                {c.ref && <button onClick={() => onFocus(c.ref!.table)} className="mono ml-auto text-[11.5px] text-primary hover:underline">→ {c.ref.table}</button>}
              </div>
            ))}
          </div>
        )}
        {tab === "rel" && (
          <div className="space-y-3">
            <div>
              <div className="mb-1.5 text-[12px] font-bold text-muted">وابسته به</div>
              <div className="flex flex-wrap gap-1.5">{out.length ? out.map((r) => <button key={r.id} onClick={() => onFocus(r.to)} className="chip chip-link mono" dir="ltr">{r.fromColumn} → {r.to}</button>) : <span className="text-[12.5px] text-muted">—</span>}</div>
            </div>
            <div>
              <div className="mb-1.5 text-[12px] font-bold text-muted">ارجاع‌دهنده‌ها</div>
              <div className="flex flex-wrap gap-1.5">{inc.length ? inc.map((r) => <button key={r.id} onClick={() => onFocus(r.from)} className="chip chip-link mono" dir="ltr">{r.from}.{r.fromColumn}</button>) : <span className="text-[12.5px] text-muted">—</span>}</div>
            </div>
          </div>
        )}
        {tab === "data" && (
          <div className="overflow-auto rounded-xl" style={{ boxShadow: "var(--shadow)" }} dir="ltr">
            <table className="mono w-max text-[11.5px]">
              <thead className="bg-surface-2"><tr>{cols.map((c) => <th key={c} className="px-2.5 py-1.5 text-left font-semibold text-ink-2">{c}</th>)}</tr></thead>
              <tbody>{sample.slice(0, 6).map((r, i) => <tr key={i} className="border-t border-line">{cols.map((c) => <td key={c} className="max-w-[180px] truncate px-2.5 py-1.5">{fmt(r[c])}</td>)}</tr>)}</tbody>
            </table>
          </div>
        )}
      </div>
    </aside>
  );
}
export function fmt(v: unknown) {
  if (v === null || v === undefined) return "∅";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}
