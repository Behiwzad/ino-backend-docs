import { useId } from "react";

/** Ino logo mark (Brand / Ino Logo · Style=Gradient) */
export function LogoMark({ size = 40, className = "" }: { size?: number; className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} aria-label="اینو" role="img">
      <rect width="64" height="64" rx="16" fill={`url(#${id}a)`} />
      <rect width="64" height="64" rx="16" fill={`url(#${id}b)`} fillOpacity=".2" />
      <path d="M46.464 26.214c0 7.989-6.476 14.465-14.464 14.465S17.536 34.203 17.536 26.214 24.012 11.75 32 11.75s14.464 6.476 14.464 14.464Zm-23.143 0a8.679 8.679 0 1 0 17.358 0 8.679 8.679 0 0 0-17.358 0Z" fill="#fff" />
      <rect x="29.107" y="43.571" width="5.786" height="8.679" rx="2.893" fill="#fff" />
      <circle cx="32" cy="26.214" r="2.893" fill="#E4AAFF" />
      <defs>
        <linearGradient id={`${id}a`} x1="0" y1="0" x2="68.027" y2="4.612" gradientUnits="userSpaceOnUse">
          <stop stopColor="#C93EFE" />
          <stop offset=".45" stopColor="#694FFD" />
        </linearGradient>
        <linearGradient id={`${id}b`} x1="32" y1="0" x2="32" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff" stopOpacity=".16" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Logo({ sub = "مستند بک‌اند" }: { sub?: string }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark size={36} />
      <span className="leading-tight">
        <span className="block text-[16px] font-extrabold tracking-tight">اینو</span>
        <span className="block text-[11px] font-medium text-muted">{sub}</span>
      </span>
    </span>
  );
}
