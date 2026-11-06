import Link from "next/link";
import { enums } from "@/schema/enums";
import { tables } from "@/schema/tables";

export const metadata = { title: "Enum ها" };

export default function EnumsPage() {
  return (
    <div className="mx-auto max-w-[1240px] px-4 py-6 md:px-8 md:py-8">
      <h1 className="text-[24px] font-black">Enum ها</h1>
      <p className="mt-1 text-[13px] text-muted">{enums.length} نوع شمارشی — در PostgreSQL به‌صورت CREATE TYPE و در MySQL به‌صورت ENUM خروجی گرفته می‌شوند.</p>
      <div className="mt-6 columns-1 gap-4 md:columns-2 xl:columns-3">
        {enums.map((e) => {
          const used = tables.flatMap((t) => t.columns.filter((c) => c.enum === e.name).map((c) => ({ t: t.name, c: c.name })));
          return (
            <section key={e.name} id={e.name} className="card mb-4 break-inside-avoid scroll-mt-20 p-4 target:shadow-[0_0_0_2px_var(--primary)]">
              <div className="flex items-baseline gap-2">
                <h2 className="mono text-[15px] font-semibold" dir="ltr">{e.name}</h2>
                <span className="text-[12.5px] text-muted">{e.title}</span>
              </div>
              <ul className="mt-3 space-y-1.5">
                {e.values.map((v, i) => (
                  <li key={v.value} className="flex items-start gap-2 rounded-xl bg-surface-2 px-3 py-1.5">
                    <span className="mono w-5 shrink-0 pt-0.5 text-[10.5px] text-muted">{i}</span>
                    <span className="mono shrink-0 text-[12.5px] font-semibold text-primary" dir="ltr">{v.value}</span>
                    <span className="text-[12.5px]">{v.fa}{v.note && <span className="block text-[11.5px] leading-5 text-muted">{v.note}</span>}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex flex-wrap gap-1">
                {used.map((u) => <Link key={u.t + u.c} href={`/tables/${u.t}#col-${u.c}`} className="chip chip-link mono !text-[10.5px]" dir="ltr">{u.t}.{u.c}</Link>)}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
