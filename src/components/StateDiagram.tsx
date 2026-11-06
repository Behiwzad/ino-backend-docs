"use client";
import "@xyflow/react/dist/style.css";
import { useMemo } from "react";
import { ReactFlow, Background, BackgroundVariant, Controls, MarkerType, Handle, Position, type Node, type Edge, type NodeProps } from "@xyflow/react";
import dagre from "@dagrejs/dagre";
import type { Machine } from "@/schema/flows";

const colors = { start: "#694ffd", end: "#64748b", normal: "#694ffd", danger: "#e11d48", success: "#16a34a" } as const;
type SData = { label: string; kind: keyof typeof colors; id: string };

function StateNode({ data }: NodeProps<Node<SData>>) {
  const c = colors[data.kind];
  if (data.id === "start") return (<div className="h-6 w-6 rounded-full" style={{ background: c }}><Handle type="source" position={Position.Right} style={{ opacity: 0 }} /></div>);
  return (
    <div className="rounded-2xl border-2 bg-surface px-4 py-2.5 text-center shadow-sm" style={{ borderColor: c, minWidth: 150 }}>
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <div className="text-[13px] font-bold" style={{ color: c }}>{data.label}</div>
      <div className="mono text-[10.5px] text-muted" dir="ltr">{data.id}</div>
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
    </div>
  );
}
const nodeTypes = { state: StateNode };

export function StateDiagram({ m }: { m: Machine }) {
  const { nodes, edges } = useMemo(() => {
    const g = new dagre.graphlib.Graph({ multigraph: true });
    g.setGraph({ rankdir: "LR", nodesep: 36, ranksep: 120 });
    g.setDefaultEdgeLabel(() => ({}));
    m.states.forEach((s) => g.setNode(s.id, { width: s.id === "start" ? 24 : 170, height: s.id === "start" ? 24 : 58 }));
    m.transitions.filter((t) => t.from !== t.to).forEach((t, i) => g.setEdge(t.from, t.to, {}, String(i)));
    dagre.layout(g);
    const nodes: Node<SData>[] = m.states.map((s) => {
      const v = g.node(s.id);
      return { id: s.id, type: "state", position: { x: v.x - v.width / 2, y: v.y - v.height / 2 }, data: { label: s.label, kind: (s.kind ?? "normal") as keyof typeof colors, id: s.id } };
    });
    const edges: Edge[] = m.transitions.map((t, i) => ({
      id: `${t.from}-${t.to}-${i}`,
      source: t.from,
      target: t.to,
      type: t.from === t.to ? "default" : "smoothstep",
      label: `${t.label}${t.actor ? ` · ${t.actor}` : ""}`,
      labelStyle: { fontSize: 10.5, fontFamily: "var(--font-sans)", fill: "var(--text-2)" },
      labelBgStyle: { fill: "var(--surface)" },
      labelBgPadding: [6, 3] as [number, number],
      labelBgBorderRadius: 6,
      markerEnd: { type: MarkerType.ArrowClosed, color: "#a3a3a3" },
      style: { stroke: "#a3a3a3", strokeWidth: 1.4 },
    }));
    return { nodes, edges };
  }, [m]);
  return (
    <div className="h-[380px] w-full" dir="ltr">
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView fitViewOptions={{ padding: 0.15 }} proOptions={{ hideAttribution: true }} zoomOnScroll={false} nodesConnectable={false} minZoom={0.3}>
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--grid-dot)" />
        <Controls position="bottom-left" showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
