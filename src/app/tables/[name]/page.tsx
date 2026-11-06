import Link from "next/link";
import { notFound } from "next/navigation";
import { tables, tableMap, relations, domainMap } from "@/schema/tables";
import { enumMap } from "@/schema/enums";
import { endpoints } from "@/schema/api";
import { sections } from "@/schema/screens";
import { getSeed } from "@/schema/seed";
import { tableSnippets } from "@/lib/snippets";
import { CodeTabs, type CodeTab } from "@/components/CodeTabs";
import { DataGrid } from "@/components/DataGrid";
import { LazyNeighbors } from "@/components/erd/LazyNeighbors";
import { Icon } from "@/components/Icon";

export function generateStaticParams() {
  return tables.map((t) => ({ name: t.name }));
}
export async function generateMetadata({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  return { title: name };
}

const mClass: Record<string, string> = { GET: "badge-green", POST: "badge-violet", PATCH: "badge-amber", PUT: "badge-blue", DELETE: "badge-red" };

export default async function TablePage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const t = tableMap[name];
  if (!t) notFound();
  const d = domainMap[t.domain];
  const seed = getSeed();
  const rows = seed[t.name] ?? [];
  const out = relations.filter((r) => r.from === t.name);
  const inc = relations.filter((r) => r.to === t.name);
  const eps = endpoints.filter((e) => e.tables.includes(t.name));
  const secs = sections.filter((s) => s.tables.includes(t.name) || s.frames.some(([id]) => (t.screens ?? []).includes(id)));
  const neighborNames = new Set([t.name, ...out.map((r) => r.to), ...inc.map((r) => r.from)]);
  const counts = Object.fromEntries([...neighborNames].map((n) => [n, seed[n]?.length ?? 0]));
  const sn = tableSnippets(t);
  const tabs: CodeTab[] = [
    { key: "postgres", label: "PostgreSQL", raw: sn.postgres, lang: "sql", file: `${t.name}.sql` },
    { key: "mysql", label: "MySQL", raw: sn.mysql, lang: "sql", file: `${t.name}.mysql.sql` },
    { key: "prisma", label: "Prisma", raw: sn.prisma, lang: "prisma", file: `${t.name}.prisma` },
    { key: "drizzle", label: "Drizzle", raw: sn.drizzle, lang: "typescript", file: `${t.name}.drizzle.ts` },
    { key: "ts", label: "TypeScript", raw: sn.ts, lang: "typescript", file: `${t.name}.ts` },
    { key: "zod", label: "Zod", raw: sn.zod, lang: "typescript", file: `${t.name}.zod.ts` },
    { key: "json", label: "JSON Schema", raw: sn.jsonSchema, lang: "json", file: `${t.name}.schema.json` },
    { key: "seed", label: "Seed", raw: sn.seed, lang: "sql", file: `${t.name}.seed.sql` },
  ];
  const idx = tables.findIndex((x) => x.name === t.name);
  const prev = tables[idx - 1], next = tables[idx + 1];
  const typeLabel = (c: (typeof t.columns)[number]) => (c.type === "varchar" ? `varchar(${c.length})` : c.type === "numeric" && c.precision ? `numeric(${c.precision.join(",")})` : c.type);

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-6 md:px-8 md:py-8">
      {/* header */}
      <section className="card relative overflow-hidden p-5 md:p-6" style={{ background: `radial-gradient(90% 160% at 0% 0%, ${d.color}14, transparent 55%), var(--surface)` }}>
        <div className="flex flex-col gap-5 md:flex-row md:items-start">
          <div className="min-w-0 flex-1">
            <nav className="flex flex-wrap items-center gap-1.5 text-[12.5px]" aria-label="مسیر">
              <Link href="/tables" className="text-muted transition hover:text-primary">جداول</Link>
              <Icon name="arrowL" size={14} className="text-muted" />
              <Link href={`/tables#${d.key}`} className="chip" style={{ background: `${d.color}1c`, color: d.color }}>{d.title}</Link>
            </nav>
            <h1 className="mono mt-3 break-all text-[26px] font-semibold md:text-[32px]" dir="ltr" style={{ textAlign: "right" }}>{t.name}</h1>
            <div className="mt-0.5 text-[17px] font-bold">{t.title}</div>
            <p className="mt-2 max-w-3xl text-[14px] leading-7 text-ink-2">{t.description}</p>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center md:w-[260px] md:grid-cols-2">
            {[["ستون", t.columns.length], ["FK خروجی", out.length], ["ارجاع ورودی", inc.length], ["ردیف فیک", rows.length]].map(([l, v]) => (
              <div key={l} className="rounded-2xl bg-surface-2 px-2 py-2.5"><div className="text-[20px] font-black tabular-nums">{v}</div><div className="text-[11px] text-muted">{l}</div></div>
            ))}
          </div>
        </div>
      </section>

      {/* in-page nav */}
      <nav className="sticky top-16 z-20 -mx-4 mt-4 bg-bg/90 px-4 py-2 backdrop-blur md:-mx-8 md:px-8" aria-label="بخش‌های صفحه">
        <div className="seg">
          {[["columns", "ستون‌ها"], ["relations", "روابط"], ["data", "دیتای فیک"], ["code", "کد"], ["api", "API"]].map(([id, l]) => (
            <a key={id} href={`#${id}`} className="seg-item inline-flex items-center">{l}</a>
          ))}
        </div>
      </nav>

      <div className="mt-4 space-y-8">
        {/* columns */}
        <section id="columns" className="scroll-mt-32">
          <h2 className="mb-3 text-[18px] font-bold">ستون‌ها</h2>
          <div className="card divide-y divide-line overflow-hidden">
            {t.columns.map((c) => (
              <div key={c.name} id={`col-${c.name}`} className="grid scroll-mt-36 gap-x-4 gap-y-1.5 px-4 py-3 transition hover:bg-surface-2 target:bg-primary-soft md:grid-cols-[minmax(180px,1.1fr)_minmax(150px,0.9fr)_minmax(0,2fr)]">
                <div className="flex items-center gap-2" dir="ltr">
                  <span className="grid w-5 place-items-center" style={{ color: c.pk ? "#efb100" : c.ref ? d.color : "var(--muted)" }}>
                    {c.pk ? <Icon name="key" size={16} /> : c.ref ? <Icon name="link" size={16} /> : c.unique ? <Icon name="unique" size={16} /> : <span className="h-1 w-1 rounded-full bg-current" />}
                  </span>
                  <span className={`mono text-[13.5px] ${c.pk || c.ref ? "font-semibold" : ""}`} style={{ color: c.ref ? d.color : undefined }}>{c.name}</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5" dir="ltr">
                  {c.type === "enum" ? <Link href={`/enums#${c.enum}`} className="mono text-[12.5px] text-primary hover:underline">{c.enum}</Link> : <span className="mono text-[12.5px] text-ink-2">{typeLabel(c)}</span>}
                  {c.pk && <span className="badge badge-amber">PK</span>}
                  {c.unique && !c.pk && <span className="badge badge-blue">UNIQUE</span>}
                  {!c.nullable && !c.pk && <span className="badge badge-red">NOT NULL</span>}
                  {c.nullable && <span className="badge badge-gray">NULL</span>}
                  {(c.identity || c.default) && <span className="mono text-[11px] text-muted">= {c.identity ? "identity" : c.default}</span>}
                </div>
                <div className="text-[13px] leading-6 text-ink-2">
                  {c.ref && (
                    <Link href={`/tables/${c.ref.table}`} className="chip chip-link mono mb-1 me-2 !text-[11px]" dir="ltr">
                      <Icon name="arrowR" size={12} /> {c.ref.table}{c.ref.column ? `.${c.ref.column}` : ""} · on delete {c.ref.onDelete ?? "restrict"}
                    </Link>
                  )}
                  {c.note}
                  {c.type === "enum" && <div className="mt-1 flex flex-wrap gap-1" dir="ltr">{enumMap[c.enum!].values.map((v) => <span key={v.value} className="badge badge-gray mono !font-normal" title={v.fa}>{v.value}</span>)}</div>}
                  {c.example && <div className="mono mt-0.5 text-[11.5px] text-muted" dir="ltr" style={{ textAlign: "right" }}>e.g. {c.example}</div>}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* constraints + rules */}
        <section className="grid gap-4 lg:grid-cols-2">
          <div className="card p-5">
            <h3 className="mb-3 flex items-center gap-2 text-[15.5px] font-bold"><Icon name="rule" size={18} className="text-primary" /> ایندکس‌ها و قیدها</h3>
            <ul className="space-y-2 text-[12.5px]">
              {(t.indexes ?? []).map((ix, i) => (
                <li key={i} className="rounded-xl bg-surface-2 px-3 py-2">
                  <span className="mono font-semibold" dir="ltr">{ix.unique ? "UNIQUE " : ""}INDEX ({ix.columns.join(", ")}){ix.where ? ` WHERE ${ix.where}` : ""}</span>
                  {ix.note && <div className="mt-0.5 text-[13px] text-ink-2">{ix.note}</div>}
                </li>
              ))}
              {(t.checks ?? []).map((ch) => (
                <li key={ch.name} className="rounded-xl bg-surface-2 px-3 py-2">
                  <span className="mono break-all font-semibold" dir="ltr">CHECK {ch.name}: {ch.expr}</span>
                  {ch.note && <div className="mt-0.5 text-[13px] text-ink-2">{ch.note}</div>}
                </li>
              ))}
              {!t.indexes?.length && !t.checks?.length && <li className="text-[13px] text-muted">فقط کلید اصلی و ایندکس خودکار FKها</li>}
            </ul>
          </div>
          <div className="card p-5">
            <h3 className="mb-3 flex items-center gap-2 text-[15.5px] font-bold"><Icon name="list" size={18} className="text-primary" /> قوانین بیزینسی</h3>
            <ul className="space-y-2 text-[13.5px] leading-7 text-ink-2">
              {(t.rules ?? []).map((r) => <li key={r} className="flex gap-2.5"><Icon name="check" size={16} className="mt-1.5 text-primary" />{r}</li>)}
              {(t.derived ?? []).map((r) => <li key={r} className="flex gap-2.5"><Icon name="reset" size={16} className="mt-1.5 text-fuchsia" /><span className="mono text-[12px]" dir="ltr">{r}</span></li>)}
              {!t.rules?.length && !t.derived?.length && <li className="text-muted">قانون خاصی جز قیدهای ستون ثبت نشده.</li>}
            </ul>
          </div>
        </section>

        {/* relations */}
        <section id="relations" className="scroll-mt-32">
          <h2 className="mb-3 text-[18px] font-bold">روابط</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            <RelList title={`belongs to · ${out.length}`} empty="جدول ریشه — به جدولی وابسته نیست.">
              {out.map((r) => (
                <Link key={r.id} href={`/tables/${r.to}`} className="mono flex flex-wrap items-center gap-x-2 gap-y-0.5 rounded-xl bg-surface-2 px-3 py-2 text-[12.5px] transition hover:bg-primary-soft" dir="ltr">
                  <span className="font-semibold">{r.fromColumn}</span><span className="text-muted">{r.kind === "one-to-one" ? "1—1" : "N—1"}</span>
                  <span className="font-semibold" style={{ color: domainMap[tableMap[r.to].domain].color }}>{r.to}.{r.toColumn}</span>
                  <span className="ml-auto text-[11px] text-muted">{r.nullable ? "optional" : "required"} · {r.onDelete}</span>
                </Link>
              ))}
            </RelList>
            <RelList title={`has many · ${inc.length}`} empty="هیچ جدولی به این جدول ارجاع نمی‌دهد.">
              {inc.map((r) => (
                <Link key={r.id} href={`/tables/${r.from}`} className="mono flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2 text-[12.5px] transition hover:bg-primary-soft" dir="ltr">
                  <span className="font-semibold" style={{ color: domainMap[tableMap[r.from].domain].color }}>{r.from}</span><span className="truncate text-muted">.{r.fromColumn}</span>
                  <span className="ml-auto shrink-0 text-[11px] text-muted">{r.kind === "one-to-one" ? "has one" : "has many"}</span>
                </Link>
              ))}
            </RelList>
          </div>
          <div className="card mt-4 overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
              <span className="text-[13px] font-bold">دیاگرام همسایه‌ها</span>
              <Link href="/erd" className="btn btn-ghost btn-xs"><Icon name="canvas" size={14} /> کانوای کامل</Link>
            </div>
            <LazyNeighbors focus={t.name} seedCounts={counts} />
          </div>
        </section>

        <section id="data" className="scroll-mt-32">
          <h2 className="mb-3 text-[18px] font-bold">دیتای فیک <span className="text-[13px] font-medium text-muted">— سازگار با FKها</span></h2>
          <DataGrid name={t.name} columns={t.columns} rows={rows} />
        </section>

        <section id="code" className="scroll-mt-32">
          <h2 className="mb-3 text-[18px] font-bold">کد و خروجی‌ها</h2>
          <CodeTabs tabs={tabs} />
        </section>

        <section id="api" className="grid scroll-mt-32 gap-4 lg:grid-cols-2">
          <div className="card p-5">
            <h3 className="mb-3 text-[15.5px] font-bold">Endpoint هایی که این جدول را می‌خوانند/می‌نویسند · {eps.length}</h3>
            <div className="max-h-96 space-y-0.5 overflow-y-auto">
              {eps.map((e) => (
                <Link key={e.method + e.path} href={`/api-docs#${e.group}`} className="flex items-center gap-2 rounded-xl px-2 py-2 transition hover:bg-surface-2">
                  <span className={`badge ${mClass[e.method]} mono w-[58px] justify-center !text-[10.5px]`}>{e.method}</span>
                  <span className="mono truncate text-[12px]" dir="ltr">{e.path}</span>
                  <span className="ms-auto hidden truncate text-[12px] text-muted md:inline">{e.summary}</span>
                </Link>
              ))}
              {!eps.length && <div className="text-[13px] text-muted">فقط داخلی (جاب‌ها / ادمین)</div>}
            </div>
          </div>
          <div className="card p-5">
            <h3 className="mb-3 text-[15.5px] font-bold">صفحات اپ که از این جدول استفاده می‌کنند</h3>
            <div className="flex flex-wrap gap-1.5">
              {secs.map((s) => (
                <Link key={s.key} href={`/screens#${s.key}`} className="chip chip-link py-1">
                  <Icon name="screen" size={14} /> {s.title} <span className="text-muted">· {s.panel === "customer" ? "مشتری" : "سالن"}</span>
                </Link>
              ))}
              {!secs.length && <span className="text-[13px] text-muted">مستقیماً در صفحه‌ای نمایش داده نمی‌شود.</span>}
            </div>
          </div>
        </section>

        <nav className="flex justify-between gap-3">
          {prev ? <Link href={`/tables/${prev.name}`} className="btn btn-stroke mono !text-[13px]" dir="ltr">{prev.name} <Icon name="arrowR" size={16} /></Link> : <span />}
          {next ? <Link href={`/tables/${next.name}`} className="btn btn-stroke mono !text-[13px]" dir="ltr"><Icon name="arrowL" size={16} /> {next.name}</Link> : <span />}
        </nav>
      </div>
    </div>
  );
}

function RelList({ title, empty, children }: { title: string; empty: string; children: React.ReactNode[] }) {
  return (
    <div className="card p-4">
      <h3 className="mb-2 text-[13px] font-bold text-muted" dir="ltr" style={{ textAlign: "right" }}>{title}</h3>
      <div className="max-h-72 space-y-1.5 overflow-y-auto">{children.length ? children : <div className="text-[13px] text-muted">{empty}</div>}</div>
    </div>
  );
}
