const paths: Record<string, string> = {
  home: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z",
  canvas: "M4 4h6v6H4zM14 14h6v6h-6zM14 4h6v6h-6zM10 7h4M17 10v4M7 10v7h7",
  table: "M3 5h18v14H3zM3 10h18M3 15h18M9 5v14",
  enum: "M4 6h16M4 12h10M4 18h6M18 15l3 3-3 3",
  flow: "M5 5h5v5H5zM14 14h5v5h-5zM10 7.5h4.5a2 2 0 0 1 2 2V14",
  api: "M8 9l-4 3 4 3M16 9l4 3-4 3M13.5 6l-3 12",
  screen: "M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM10 18h4",
  rule: "M9 12l2 2 4-4M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z",
  download: "M12 4v12M7 11l5 5 5-5M5 20h14",
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4",
  sun: "M12 4V2M12 22v-2M4 12H2M22 12h-2M5.6 5.6 4.2 4.2M19.8 19.8l-1.4-1.4M5.6 18.4l-1.4 1.4M19.8 4.2l-1.4 1.4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  moon: "M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z",
  copy: "M8 8h11v11H8zM5 16V5h11",
  check: "M5 12l5 5 9-10",
  key: "M14 10a4 4 0 1 0-3.5 3.97L9 15.5V18H7v2H4v-3l6.03-6.03A4 4 0 0 0 14 10z",
  link: "M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1",
  figma: "M9 3h3v6H9a3 3 0 0 1 0-6zM12 3h3a3 3 0 0 1 0 6h-3zM9 9h3v6H9a3 3 0 0 1 0-6zM15 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6zM9 15h3v3a3 3 0 1 1-3-3z",
  arrow: "M15 6l-6 6 6 6",
  close: "M6 6l12 12M18 6 6 18",
  layout: "M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z",
  eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  db: "M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3",
  reset: "M4 12a8 8 0 1 0 2.3-5.7M4 4v4h4",
  focus: "M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5",
};

export function Icon({ name, size = 18, className = "", stroke = 1.7 }: { name: keyof typeof paths | string; size?: number; className?: string; stroke?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d={paths[name] ?? paths.table} />
    </svg>
  );
}
