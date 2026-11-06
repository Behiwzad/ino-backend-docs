import { formats } from "@/lib/generators";
import { ExportCard } from "@/components/ExportCard";
import { tables, domainMap } from "@/schema/tables";
import { getSeed } from "@/schema/seed";
import { exportUrl, csvUrl } from "@/lib/base";
import { CurlHint } from "@/components/CurlHint";
import type { Lang } from "@/lib/hl";

export const metadata = { title: "خروجی‌ها" };

const groups = [
  ["sql", "SQL DDL"], ["orm", "ORM / Migration"], ["types", "Types & Validation"], ["api", "API"], ["data", "دیتای فیک"], ["diagram", "دیاگرام"],
] as const;

export default function ExportsPage() {
  const items = formats.map((f) => {
    const text = f.gen();
    return { ...f, lines: text.split("\n").length, size: `${(Buffer.byteLength(text) / 1024).toFixed(1)} KB`, preview: text.split("\n").slice(0, 80).join("\n") };
  });
  const seed = getSeed();
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6 md:px-8 md:py-8">
      <h1 className="text-[24px] font-black">خروجی‌ها</h1>
      <p className="mt-1 text-[13.5px] leading-7 text-muted">همه از یک منبع واحد (src/schema) تولید می‌شوند؛ با تغییر مدل، همه خروجی‌ها خودکار به‌روز می‌شوند. هر فایل از آدرس <code className="mono rounded bg-surface-2 px-1" dir="ltr">{exportUrl("<file>")}</code> قابل curl است.</p>
      <CurlHint />
      <div className="mt-5 flex flex-wrap gap-2">
        {groups.map(([g, t]) => <a key={g} href={`#${g}`} className="chip chip-link py-1.5">{t}</a>)}
        <a href="#csv" className="chip chip-link py-1.5">CSV</a>
      </div>
      <div className="mt-6 space-y-8">
        {groups.map(([g, title]) => (
          <section key={g} id={g} className="scroll-mt-20">
            <h2 className="mb-3 text-[17px] font-bold">{title}</h2>
            <div className="space-y-3">
              {items.filter((i) => i.group === g).map((i) => (
                <ExportCard key={i.key} group={g} title={i.title} desc={i.desc} file={i.file} lines={i.lines} size={i.size} preview={i.preview} lang={(i.lang === "text" ? "text" : i.lang) as Lang} />
              ))}
            </div>
          </section>
        ))}
        <section id="csv" className="scroll-mt-20">
          <h2 className="mb-3 text-[17px] font-bold">CSV به تفکیک جدول</h2>
          <div className="card flex flex-wrap gap-1.5 p-4">
            {tables.map((t) => (
              <a key={t.name} href={csvUrl(t.name)} download className="chip chip-link mono !text-[11.5px]" dir="ltr">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: domainMap[t.domain].color }} />{t.name}.csv <span className="text-muted">{seed[t.name]?.length ?? 0}</span>
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
