"use client";
import Link from "next/link";
import { sections, screenCount } from "@/schema/screens";
import { tableMap, domainMap } from "@/schema/tables";
import { Icon } from "@/components/Icon";


const method = (e: string) => e.split(" ")[0];
const mClass: Record<string, string> = { GET: "badge-green", POST: "badge-violet", PATCH: "badge-amber", PUT: "badge-blue", DELETE: "badge-red" };

export function ScreensMap() {
  const panels = [
    { k: "customer", t: "اپ مشتری", c: "#694ffd" },
    { k: "staff", t: "پنل سالن (مالک / مالک و متخصص / متخصص)", c: "#c93efe" },
  ] as const;
  return (
    <div className="mx-auto max-w-[1240px] px-4 py-6 md:px-8 md:py-8">
      <h1 className="text-[24px] font-black">صفحات اپ ↔ API</h1>
      <p className="mt-1 text-[13.5px] text-muted">هر بخش از اپ چه جدول‌هایی را می‌خواند/می‌نویسد و با کدام endpointها کار می‌کند — {screenCount} صفحه در {sections.length} بخش.</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {panels.map((p) => <a key={p.k} href={`#${p.k}`} className="chip chip-link py-1.5"><span className="h-2 w-2 rounded-full" style={{ background: p.c }} />{p.t}</a>)}
      </div>
      {panels.map((p) => (
        <div key={p.k} id={p.k} className="mt-8 scroll-mt-20">
          <h2 className="mb-4 flex items-center gap-2 text-[19px] font-bold"><span className="h-3 w-3 rounded-full" style={{ background: p.c }} />{p.t}</h2>
          <div className="space-y-3">
            {sections.filter((s) => s.panel === p.k).map((s) => (
              <details key={s.key} id={s.key} className="card group scroll-mt-20 overflow-hidden" open={false}>
                <summary className="flex cursor-pointer list-none items-center gap-3 p-4 transition hover:bg-surface-2">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface-2 text-ink-2"><Icon name="screen" size={18} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-bold">{s.title}</span>
                    <span className="block truncate text-[12px] text-muted">{s.tables.length} جدول · {s.endpoints.length} endpoint · {s.frames.length} صفحه</span>
                  </span>
                  <Icon name="chevron" size={18} className="text-muted transition group-open:rotate-180" />
                </summary>
                <div className="grid gap-5 border-t border-line p-4 lg:grid-cols-3">
                  <div>
                    <div className="mb-2 text-[12px] font-bold text-muted">جداول</div>
                    <div className="flex flex-wrap gap-1.5">
                      {s.tables.map((t) => (
                        <Link key={t} href={`/tables/${t}`} className="chip chip-link mono text-[11.5px]" dir="ltr">
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: domainMap[tableMap[t].domain].color }} />{t}
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 text-[12px] font-bold text-muted">Endpoint ها</div>
                    <div className="space-y-1">
                      {s.endpoints.map((e) => (
                        <div key={e} className="flex items-center gap-2" dir="ltr">
                          <span className={`badge ${mClass[method(e)]} mono w-14 justify-center !text-[10.5px]`}>{method(e)}</span>
                          <span className="mono truncate text-[12px] text-ink-2">{e.slice(method(e).length + 1)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 text-[12px] font-bold text-muted">صفحه‌ها و حالت‌ها</div>
                    <div className="flex flex-wrap gap-1.5">
                      {s.frames.map(([id, n]) => <span key={id} className="badge badge-gray !font-medium" dir="ltr">{n}</span>)}
                    </div>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
