import Link from "next/link";
import { ruleGroups } from "@/schema/rules";
import { figmaLink } from "@/schema/screens";
import { Icon } from "@/components/Icon";

export const metadata = { title: "قوانین بیزینسی · Ino Backend" };

export default function RulesPage() {
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8 md:px-8">
      <h1 className="text-2xl font-black">قوانین بیزینسی و اعتبارسنجی</h1>
      <p className="mt-1 text-[13px] text-muted">هر قانون از متن، مودال یا حالت خطای یک اسکرین استخراج شده و به جداول درگیر لینک است.</p>
      <div className="mt-6 space-y-6">
        {ruleGroups.map((g) => (
          <section key={g.key} id={g.key} className="card scroll-mt-20 overflow-hidden">
            <h2 className="border-b border-line bg-surface-2/60 px-5 py-3 text-[16px] font-extrabold">{g.title}</h2>
            <ol className="divide-y divide-line">
              {g.rules.map((r, i) => (
                <li key={i} className="flex flex-wrap items-start gap-3 px-5 py-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary-soft text-[11px] font-bold text-primary">{i + 1}</span>
                  <p className="min-w-[240px] flex-1 text-[13.5px] leading-7">{r.text}</p>
                  <div className="flex flex-wrap items-center gap-1">
                    {r.tables.map((t) => <Link key={t} href={`/tables/${t}`} className="chip mono border border-line text-[10.5px] text-ink-2 hover:text-primary" dir="ltr">{t}</Link>)}
                    {r.screen && <a href={figmaLink(r.screen)} target="_blank" rel="noreferrer" className="chip bg-surface-2 text-[10.5px] text-ink-2 hover:text-primary"><Icon name="figma" size={11} /> اسکرین</a>}
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
