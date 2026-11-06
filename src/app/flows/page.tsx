import Link from "next/link";
import { machines } from "@/schema/flows";
import { StateDiagram } from "@/components/StateDiagram";

export const metadata = { title: "State Machines · Ino Backend" };

export default function FlowsPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-8">
      <h1 className="text-2xl font-black">State Machine ها</h1>
      <p className="mt-1 text-[13px] text-muted">انتقال‌های مجاز وضعیت‌ها، بازیگر هر انتقال و اثرات جانبی — مستقیماً از مودال‌ها، توست‌ها و تایم‌لاین‌های دیزاین.</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {machines.map((m) => <a key={m.key} href={`#${m.key}`} className="chip border border-line bg-surface py-1.5 hover:text-primary">{m.title}</a>)}
      </div>
      <div className="mt-6 space-y-6">
        {machines.map((m) => (
          <section key={m.key} id={m.key} className="card scroll-mt-20 overflow-hidden">
            <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
              <h2 className="text-[17px] font-extrabold">{m.title}</h2>
              <Link href={`/tables/${m.table}#col-${m.column}`} className="chip mono bg-primary-soft text-primary" dir="ltr">{m.table}.{m.column}</Link>
              <p className="w-full text-[12.5px] text-ink-2">{m.description}</p>
            </div>
            <StateDiagram m={m} />
            <div className="grid gap-4 border-t border-line p-4 md:grid-cols-2">
              <div>
                <h3 className="mb-2 text-[12.5px] font-bold text-muted">جدول انتقال‌ها</h3>
                <table className="w-full text-[12.5px]">
                  <tbody>
                    {m.transitions.map((t, i) => (
                      <tr key={i} className="border-b border-line/70">
                        <td className="mono py-1.5 text-ink-2" dir="ltr">{t.from} → {t.to}</td>
                        <td className="py-1.5">{t.label}</td>
                        <td className="py-1.5 text-muted">{t.actor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {m.sideEffects && (
                <div>
                  <h3 className="mb-2 text-[12.5px] font-bold text-muted">اثرات جانبی (side effects)</h3>
                  <ul className="space-y-1.5 text-[12.5px] leading-6 text-ink-2">{m.sideEffects.map((s) => <li key={s} className="flex gap-2"><span className="text-fuchsia">⚡</span>{s}</li>)}</ul>
                </div>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
