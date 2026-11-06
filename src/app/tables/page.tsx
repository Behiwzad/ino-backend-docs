import Link from "next/link";
import { tables, relations, domains } from "@/schema/tables";
import { getSeed } from "@/schema/seed";

export const metadata = { title: "جداول" };

export default function TablesPage() {
  const seed = getSeed();
  return (
    <div className="mx-auto max-w-[1240px] px-4 py-6 md:px-8 md:py-8">
      <h1 className="text-[24px] font-black">جداول دیتابیس</h1>
      <p className="mt-1 text-[13px] text-muted">{tables.length} جدول در {domains.length} دامنه · روی هر کارت کلیک کنید تا ستون‌ها، روابط، دیتای فیک و SQL را ببینید.</p>
      <div className="mt-8 space-y-10">
        {domains.map((d) => (
          <section key={d.key} id={d.key} className="scroll-mt-20">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ background: d.color }} />
              <h2 className="text-[17px] font-bold">{d.title}</h2>
              <span className="mono text-[12px] text-muted">{d.en}</span>
              <span className="hidden text-[12.5px] text-muted md:inline">— {d.description}</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {tables.filter((t) => t.domain === d.key).map((t) => {
                const out = relations.filter((r) => r.from === t.name).length;
                const inc = relations.filter((r) => r.to === t.name).length;
                return (
                  <Link key={t.name} href={`/tables/${t.name}`} className="card card-hover group relative overflow-hidden p-4">
                    <span className="absolute inset-x-0 top-0 h-[3px] opacity-70" style={{ background: d.color }} />
                    <div className="mono text-[14.5px] font-semibold transition group-hover:text-primary" dir="ltr" style={{ textAlign: "right" }}>{t.name}</div>
                    <div className="text-[13px] font-semibold">{t.title}</div>
                    <p className="mt-1.5 line-clamp-2 text-[12px] leading-6 text-ink-2">{t.description}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
                      <span className="badge badge-gray">{t.columns.length} ستون</span>
                      <span className="badge badge-gray">↗ {out} FK</span>
                      <span className="badge badge-gray">↙ {inc} ارجاع</span>
                      <span className="badge badge-gray">{seed[t.name]?.length ?? 0} ردیف فیک</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
