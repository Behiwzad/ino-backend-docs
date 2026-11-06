import Link from "next/link";
import { sections, figmaLink, screenCount } from "@/schema/screens";
import { tableMap, domainMap } from "@/schema/tables";
import { Icon } from "@/components/Icon";

export const metadata = { title: "اسکرین ↔ دیتا · Ino Backend" };

export default function ScreensPage() {
  const panels = [
    { k: "customer", t: "اپ مشتری", c: "#694ffd" },
    { k: "staff", t: "پنل سالن (مالک / مالک و متخصص / متخصص)", c: "#c93efe" },
  ] as const;
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-8">
      <h1 className="text-2xl font-black">اسکرین ↔ دیتا</h1>
      <p className="mt-1 text-[13px] text-muted">نگاشت {screenCount} فریم Figma به جداول و endpointها. روی هر فریم کلیک کنید تا در Figma باز شود.</p>
      {panels.map((p) => (
        <div key={p.k} className="mt-8">
          <h2 className="mb-4 flex items-center gap-2 text-[19px] font-extrabold"><span className="h-3 w-3 rounded-full" style={{ background: p.c }} />{p.t}</h2>
          <div className="space-y-4">
            {sections.filter((s) => s.panel === p.k).map((s) => (
              <section key={s.key} id={s.key} className="card scroll-mt-20 p-4">
                <div className="flex flex-wrap items-baseline gap-2">
                  <h3 className="text-[15px] font-extrabold">{s.title}</h3>
                  <span className="mono text-[11.5px] text-muted">{s.en}</span>
                  <span className="chip mr-auto bg-surface-2 text-ink-2">{s.frames.length} فریم</span>
                </div>
                <div className="mt-3 grid gap-4 lg:grid-cols-3">
                  <div className="lg:col-span-1">
                    <div className="mb-1.5 text-[11.5px] font-bold text-muted">جداول</div>
                    <div className="flex flex-wrap gap-1">
                      {s.tables.map((t) => <Link key={t} href={`/tables/${t}`} className="chip mono border text-[11px]" style={{ borderColor: `${domainMap[tableMap[t].domain].color}55`, color: domainMap[tableMap[t].domain].color }} dir="ltr">{t}</Link>)}
                    </div>
                    <div className="mb-1.5 mt-3 text-[11.5px] font-bold text-muted">Endpoint ها</div>
                    <div className="space-y-0.5">
                      {s.endpoints.map((e) => <div key={e} className="mono truncate text-[11px] text-ink-2" dir="ltr">{e}</div>)}
                    </div>
                  </div>
                  <div className="flex flex-wrap content-start gap-1.5 lg:col-span-2">
                    {s.frames.map(([id, n]) => (
                      <a key={id} href={figmaLink(id)} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-xl border border-line bg-surface-2 px-2.5 py-1.5 text-[11.5px] hover:border-primary hover:text-primary" dir="ltr">
                        <Icon name="screen" size={13} /> {n} <span className="mono text-[10px] text-muted">{id}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </section>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
