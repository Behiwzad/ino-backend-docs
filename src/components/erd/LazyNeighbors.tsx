"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

// React Flow is only downloaded when the diagram scrolls into view
const ErdCanvas = dynamic(() => import("./ErdCanvas").then((m) => m.ErdCanvas), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center text-[13px] text-muted">در حال بارگذاری دیاگرام…</div>,
});

export function LazyNeighbors({ focus, seedCounts }: { focus: string; seedCounts: Record<string, number> }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setShow(true), io.disconnect()), { rootMargin: "200px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className="dot-grid h-[420px] md:h-[480px]">
      {show && <ErdCanvas focus={focus} seedCounts={seedCounts} height="100%" />}
    </div>
  );
}
