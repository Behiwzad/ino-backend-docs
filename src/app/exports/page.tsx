import { formats } from "@/lib/generators";
import { highlight } from "@/lib/highlight";
import { ExportCard } from "@/components/ExportCard";
import { tables, domainMap } from "@/schema/tables";
import { getSeed } from "@/schema/seed";
import { exportUrl, csvUrl } from "@/lib/base";
import { CurlHint } from "@/components/CurlHint";

export const metadata = { title: "خروجی‌ها · Ino Backend" };

const groups = [
  ["sql", "SQL DDL"], ["orm", "ORM / Migration"], ["types", "Types & Validation"], ["api", "API"], ["data", "دیتای فیک"], ["diagram", "دیاگرام"],
] as const;

export default async function ExportsPage() {
  const items = await Promise.all(
    formats.map(async (f) => {
      const text = f.gen();
      const preview = text.split("\n").slice(0, 80).join("\n");
      return { ...f, lines: text.split("\n").length, size: `${(new TextEncoder().encode(text).length / 1024).toFixed(1)} KB`, html: await highlight(preview, f.lang) };
    }),
  );
  const seed = getSeed();
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8 md:px-8">
      <h1 className="text-2xl font-black">خروجی‌ها</h1>
      <p className="mt-1 text-[13px] text-muted">همه از یک منبع واحد (src/schema) تولید می‌شوند؛ با تغییر مدل، همه خروجی‌ها خودکار به‌روز می‌شوند. هر فایل از آدرس <code className="mono" dir="ltr">{exportUrl("<file>")}</code> هم قابل curl است.</p>
      <CurlHint />

      <div className="mt-6 space-y-8">
        {groups.map(([g, title]) => (
          <section key={g}>
            <h2 className="mb-3 text-[16px] font-extrabold">{title}</h2>
            <div className="space-y-3">
              {items.filter((i) => i.group === g).map((i) => <ExportCard key={i.key} title={i.title} desc={i.desc} file={i.file} lines={i.lines} size={i.size} html={i.html} />)}
            </div>
          </section>
        ))}
        <section>
          <h2 className="mb-3 text-[16px] font-extrabold">CSV به تفکیک جدول</h2>
          <div className="card flex flex-wrap gap-1.5 p-4">
            {tables.map((t) => (
              <a key={t.name} href={csvUrl(t.name)} download className="chip mono border border-line bg-surface-2 text-[11.5px] hover:border-primary hover:text-primary" dir="ltr">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: domainMap[t.domain].color }} />{t.name}.csv <span className="text-muted">{seed[t.name]?.length ?? 0}</span>
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
