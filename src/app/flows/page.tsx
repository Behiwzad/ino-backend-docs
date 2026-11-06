import Link from "next/link";
import { machines } from "@/schema/flows";
import { StateDiagram } from "@/components/StateDiagram";
import { Icon } from "@/components/Icon";

export const metadata = { title: "State Machine ها" };

export default function FlowsPage() {
  return (
    <div className="mx-auto max-w-[1240px] px-4 py-6 md:px-8 md:py-8">
      <h1 className="text-[24px] font-black">State Machine ها</h1>
      <p className="mt-1 text-[13px] text-muted">انتقال‌های مجاز وضعیت‌ها، بازیگر هر انتقال و اثرات جانبی — از مودال‌ها، پیام‌ها و تایم‌لاین‌های اپ.</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {machines.map((m) => <a key={m.key} href={`#${m.key}`} className="chip chip-link py-1.5">{m.title}</a>)}
      </div>
      <div className="mt-6 space-y-6">
        {machines.map((m) => (
          <section key={m.key} id={m.key} className="card scroll-mt-20 overflow-hidden">
            <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
              <h2 className="text-[17px] font-bold">{m.title}</h2>
              <Link href={`/tables/${m.table}#col-${m.column}`} className="badge badge-violet mono" dir="ltr">{m.table}.{m.column}</Link>
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
                  <ul className="space-y-1.5 text-[12.5px] leading-6 text-ink-2">{m.sideEffects.map((s) => <li key={s} className="flex gap-2"><Icon name="flash" size={16} className="mt-1 text-fuchsia" />{s}</li>)}</ul>
                </div>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
