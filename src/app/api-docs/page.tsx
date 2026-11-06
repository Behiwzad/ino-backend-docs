import Link from "next/link";
import { endpoints, apiGroups } from "@/schema/api";
import { Icon } from "@/components/Icon";
import { exportUrl } from "@/lib/base";

export const metadata = { title: "API · Ino Backend" };
const methodColor: Record<string, string> = { GET: "#16a34a", POST: "#694ffd", PATCH: "#ca8a04", PUT: "#0891b2", DELETE: "#e11d48" };
const authLabel: Record<string, string> = { public: "عمومی", customer: "کاربر", staff: "عضو سالن", owner: "مالک", expert: "متخصص", admin: "ادمین" };
const appLabel = { shared: "مشترک", customer: "اپ مشتری", staff: "پنل سالن", admin: "پنل اینو" } as const;

export default function ApiPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-8">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1">
          <h1 className="text-2xl font-black">API Endpoints</h1>
          <p className="mt-1 text-[13px] text-muted">{endpoints.length} endpoint پیشنهادی REST (JWT Bearer) در {apiGroups.length} گروه — هر کدام با جداولی که لمس می‌کند و کدهای خطا.</p>
        </div>
        <a href={exportUrl("ino.openapi.json")} download className="flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-[13px] font-bold text-white"><Icon name="download" size={16} /> OpenAPI 3.1</a>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr]">
        <nav className="sticky top-20 hidden h-fit space-y-0.5 lg:block">
          {apiGroups.map((g) => (
            <a key={g.key} href={`#${g.key}`} className="flex items-center justify-between rounded-lg px-3 py-1.5 text-[12.5px] text-ink-2 hover:bg-surface-2">
              {g.title}<span className="text-[11px] text-muted">{endpoints.filter((e) => e.group === g.key).length}</span>
            </a>
          ))}
        </nav>
        <div className="space-y-6">
          {apiGroups.map((g) => (
            <section key={g.key} id={g.key} className="scroll-mt-20">
              <div className="mb-2 flex items-center gap-2">
                <h2 className="text-[16px] font-extrabold">{g.title}</h2>
                <span className="chip bg-surface-2 text-ink-2">{appLabel[g.app]}</span>
              </div>
              <div className="card divide-y divide-line">
                {endpoints.filter((e) => e.group === g.key).map((e) => (
                  <details key={e.method + e.path} className="group">
                    <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-2.5 hover:bg-surface-2">
                      <span className="mono w-16 shrink-0 rounded-md py-0.5 text-center text-[11px] font-bold text-white" style={{ background: methodColor[e.method] }}>{e.method}</span>
                      <span className="mono truncate text-[12.5px] font-semibold" dir="ltr">{e.path}</span>
                      <span className="hidden truncate text-[12.5px] text-ink-2 md:inline">{e.summary}</span>
                      <span className="chip mr-auto shrink-0 bg-surface-2 text-[10.5px] text-muted">{authLabel[e.auth]}</span>
                    </summary>
                    <div className="grid gap-4 bg-surface-2/50 px-4 py-3 text-[12.5px] md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="md:hidden">{e.summary}</div>
                        <div><span className="font-bold text-muted">جداول: </span>{e.tables.map((t) => <Link key={t} href={`/tables/${t}`} className="chip mono ml-1 border border-line bg-surface text-[11px] hover:text-primary" dir="ltr">{t}</Link>)}</div>
                        {e.errors && <div><span className="font-bold text-muted">خطاها: </span>{e.errors.map((x) => <span key={x} className="chip mono ml-1 bg-danger/10 text-[11px] text-danger" dir="ltr">{x}</span>)}</div>}
                        {e.returns && <div><span className="font-bold text-muted">پاسخ: </span><code className="text-[11.5px]" dir="ltr">{e.returns}</code></div>}
                      </div>
                      {(e.body || e.query) && (
                        <pre className="overflow-auto rounded-xl border border-line bg-surface p-3 text-[11.5px] leading-6" dir="ltr">
                          {e.query && `// query\n${Object.entries(e.query).map(([k, v]) => `?${k}=${v}`).join("\n")}\n`}
                          {e.body && `// body\n${JSON.stringify(e.body, null, 2)}`}
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
