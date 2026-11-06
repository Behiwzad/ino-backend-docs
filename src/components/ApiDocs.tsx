"use client";
import Link from "next/link";
import { endpoints, apiGroups } from "@/schema/api";
import { Icon } from "@/components/Icon";
import { exportUrl } from "@/lib/base";

const mClass: Record<string, string> = { GET: "badge-green", POST: "badge-violet", PATCH: "badge-amber", PUT: "badge-blue", DELETE: "badge-red" };
const authLabel: Record<string, string> = { public: "عمومی", customer: "کاربر", staff: "عضو سالن", owner: "مالک", expert: "متخصص", admin: "ادمین" };
const appLabel = { shared: "مشترک", customer: "اپ مشتری", staff: "پنل سالن", admin: "پنل اینو" } as const;

export function ApiDocs() {
  return (
    <div className="mx-auto max-w-[1240px] px-4 py-6 md:px-8 md:py-8">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-[24px] font-black">API Endpoints</h1>
          <p className="mt-1 text-[13.5px] text-muted">{endpoints.length} endpoint پیشنهادی REST (JWT Bearer) در {apiGroups.length} گروه — هر کدام با جداولی که لمس می‌کند و کدهای خطا.</p>
        </div>
        <a href={exportUrl("ino.openapi.json")} download className="btn btn-primary"><Icon name="download" size={18} /> OpenAPI 3.1</a>
      </div>

      {/* mobile group picker */}
      <div className="seg mt-5 lg:hidden">
        {apiGroups.map((g) => <a key={g.key} href={`#${g.key}`} className="seg-item inline-flex items-center">{g.title}</a>)}
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[230px_1fr]">
        <nav className="sticky top-20 hidden h-fit max-h-[calc(100vh-6rem)] space-y-0.5 overflow-y-auto lg:block" aria-label="گروه‌ها">
          {apiGroups.map((g) => (
            <a key={g.key} href={`#${g.key}`} className="nav-item !h-9 !text-[13px]">
              <span className="flex-1">{g.title}</span><span className="text-[11.5px] text-muted">{endpoints.filter((e) => e.group === g.key).length}</span>
            </a>
          ))}
        </nav>
        <div className="space-y-6">
          {apiGroups.map((g) => (
            <section key={g.key} id={g.key} className="scroll-mt-20">
              <div className="mb-2 flex items-center gap-2">
                <h2 className="text-[16.5px] font-bold">{g.title}</h2>
                <span className="badge badge-gray">{appLabel[g.app]}</span>
              </div>
              <div className="card divide-y divide-line overflow-hidden">
                {endpoints.filter((e) => e.group === g.key).map((e) => (
                  <details key={e.method + e.path} className="group">
                    <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 transition hover:bg-surface-2">
                      <span className={`badge ${mClass[e.method]} mono w-[62px] justify-center !text-[11px]`}>{e.method}</span>
                      <span className="mono min-w-0 flex-1 truncate text-[12.5px] font-semibold" dir="ltr" style={{ textAlign: "right" }}>{e.path}</span>
                      <span className="badge badge-gray">{authLabel[e.auth]}</span>
                      <Icon name="chevron" size={16} className="text-muted transition group-open:rotate-180" />
                      <span className="w-full text-[13px] text-ink-2">{e.summary}</span>
                    </summary>
                    <div className="grid gap-4 bg-surface-2/60 px-4 py-3 text-[13px] md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-1"><span className="font-bold text-muted">جداول:</span>{e.tables.map((t) => <Link key={t} href={`/tables/${t}`} className="chip chip-link mono !text-[11px]" dir="ltr">{t}</Link>)}</div>
                        {e.errors && <div className="flex flex-wrap items-center gap-1"><span className="font-bold text-muted">خطاها:</span>{e.errors.map((x) => <span key={x} className="badge badge-red mono !font-normal" dir="ltr">{x}</span>)}</div>}
                        {e.returns && <div><span className="font-bold text-muted">پاسخ: </span><code className="text-[12px]" dir="ltr">{e.returns}</code></div>}
                      </div>
                      {(e.body || e.query) && (
                        <pre className="code overflow-auto rounded-xl p-3 text-[12px] leading-6" style={{ boxShadow: "var(--shadow)" }} dir="ltr">
                          {e.query && <><span className="tk-com">{"// query"}</span>{"\n"}{Object.entries(e.query).map(([k, v]) => <span key={k}><span className="tk-key">?{k}</span><span className="tk-punc">=</span><span className="tk-str">{v}</span>{"\n"}</span>)}</>}
                          {e.body && <><span className="tk-com">{"// body"}</span>{"\n"}<span className="tk-punc">{"{"}</span>{"\n"}{Object.entries(e.body).map(([k, v]) => <span key={k}>{"  "}<span className="tk-key">&quot;{k}&quot;</span><span className="tk-punc">: </span><span className="tk-str">&quot;{v}&quot;</span>{"\n"}</span>)}<span className="tk-punc">{"}"}</span></>}
                        </pre>
                      )}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
