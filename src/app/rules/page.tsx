import Link from "next/link";
import { ruleGroups } from "@/schema/rules";

export const metadata = { title: "قوانین بیزینسی" };

export default function RulesPage() {
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6 md:px-8 md:py-8">
      <h1 className="text-[24px] font-black">قوانین بیزینسی و اعتبارسنجی</h1>
      <p className="mt-1 text-[13.5px] text-muted">قوانینی که بک‌اند باید اعمال کند؛ هر قانون به جداول درگیر لینک است.</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {ruleGroups.map((g) => <a key={g.key} href={`#${g.key}`} className="chip chip-link py-1.5">{g.title} <span className="text-muted">{g.rules.length}</span></a>)}
      </div>
      <div className="mt-6 space-y-5">
        {ruleGroups.map((g) => (
          <section key={g.key} id={g.key} className="card scroll-mt-20 overflow-hidden">
            <h2 className="border-b border-line px-5 py-3.5 text-[16px] font-bold">{g.title}</h2>
            <ol className="divide-y divide-line">
              {g.rules.map((r, i) => (
                <li key={i} className="flex flex-wrap items-start gap-3 px-5 py-3.5">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary-soft text-[12px] font-bold text-primary">{(i + 1).toLocaleString("fa-IR")}</span>
                  <p className="min-w-[220px] flex-1 text-[14px] leading-7">{r.text}</p>
                  <div className="flex w-full flex-wrap gap-1 ps-9 sm:w-auto sm:ps-0">
                    {r.tables.map((t) => <Link key={t} href={`/tables/${t}`} className="chip chip-link mono !text-[11px]" dir="ltr">{t}</Link>)}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}
