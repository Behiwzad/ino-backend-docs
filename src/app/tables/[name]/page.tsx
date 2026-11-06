import Link from "next/link";
import { notFound } from "next/navigation";
import { tables, tableMap, relations, domainMap } from "@/schema/tables";
import { enumMap } from "@/schema/enums";
import { endpoints } from "@/schema/api";
import { sections, figmaLink } from "@/schema/screens";
import { getSeed } from "@/schema/seed";
import { tableSnippets } from "@/lib/snippets";
import { highlight } from "@/lib/highlight";
import { CodeTabs } from "@/components/CodeTabs";
import { DataGrid } from "@/components/DataGrid";
import { ErdCanvas } from "@/components/erd/ErdCanvas";
import { Icon } from "@/components/Icon";

export function generateStaticParams() {
  return tables.map((t) => ({ name: t.name }));
}
export async function generateMetadata({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  return { title: `${name} · Ino Backend` };
}

const methodColor: Record<string, string> = { GET: "#16a34a", POST: "#694ffd", PATCH: "#ca8a04", PUT: "#0891b2", DELETE: "#e11d48" };

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
  const frames = sections.flatMap((s) => s.frames.map(([id, n]) => ({ id, n, s }))).filter((f) => (t.screens ?? []).includes(f.id));
  const secs = sections.filter((s) => s.tables.includes(t.name));
  const sn = tableSnippets(t);
  const tabs = await Promise.all(
    ([
      ["postgres", "PostgreSQL", sn.postgres, "sql", `${t.name}.sql`],
      ["mysql", "MySQL", sn.mysql, "sql", `${t.name}.mysql.sql`],
      ["prisma", "Prisma", sn.prisma, "prisma", `${t.name}.prisma`],
      ["drizzle", "Drizzle", sn.drizzle, "typescript", `${t.name}.drizzle.ts`],
      ["ts", "TypeScript", sn.ts, "typescript", `${t.name}.ts`],
      ["zod", "Zod", sn.zod, "typescript", `${t.name}.zod.ts`],
      ["json", "JSON Schema", sn.jsonSchema, "json", `${t.name}.schema.json`],
      ["seed", "Seed INSERT", sn.seed, "sql", `${t.name}.seed.sql`],
    ] as const).map(async ([key, label, raw, lang, file]) => ({ key, label, raw, file, html: await highlight(raw, lang) })),
  );
  const idx = tables.findIndex((x) => x.name === t.name);
  const prev = tables[idx - 1], next = tables[idx + 1];

  return (
    <div className="mx-auto max-w-[1280px] space-y-8 px-4 py-8 md:px-8">
      {/* header */}
      <section className="relative overflow-hidden rounded-[24px] border border-line bg-surface p-6">
        <div className="pointer-events-none absolute -left-16 -top-20 h-64 w-64 rounded-full opacity-20 blur-3xl" style={{ background: d.color }} />
        <div className="relative flex flex-wrap items-start gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-[12px]">
              <Link href="/tables" className="text-muted hover:text-primary">جداول</Link>
              <span className="text-muted">/</span>
              <Link href={`/tables#${d.key}`} className="chip" style={{ background: `${d.color}1c`, color: d.color }}>{d.title}</Link>
            </div>
            <h1 className="mono mt-3 text-3xl font-black" dir="ltr" style={{ textAlign: "right" }}>{t.name}</h1>
            <div className="mt-1 text-[17px] font-bold">{t.title}</div>
            <p className="mt-2 max-w-3xl text-[13.5px] leading-7 text-ink-2">{t.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            {[["ستون", t.columns.length], ["FK خروجی", out.length], ["ارجاع ورودی", inc.length], ["ردیف فیک", rows.length]].map(([l, v]) => (
              <div key={l} className="rounded-2xl border border-line bg-surface-2 px-4 py-2.5"><div className="text-xl font-black">{v}</div><div className="text-[11px] text-muted">{l}</div></div>
            ))}
          </div>
        </div>
      </section>

      {/* columns */}
      <section>
        <h2 className="mb-3 text-[17px] font-extrabold">ستون‌ها</h2>
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[860px] text-[13px]">
            <thead className="bg-surface-2 text-[12px] text-muted">
              <tr>{["ستون", "نوع", "Null", "پیش‌فرض", "کلید / رابطه", "توضیح"].map((h) => <th key={h} className="px-4 py-2.5 text-right font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody>
              {t.columns.map((c) => (
                <tr key={c.name} id={`col-${c.name}`} className="scroll-mt-24 border-t border-line target:bg-primary-soft">
                  <td className="mono px-4 py-2.5 font-semibold" dir="ltr" style={{ textAlign: "right", color: c.ref ? d.color : undefined }}>{c.name}</td>
                  <td className="mono px-4 py-2.5 text-[12px] text-ink-2" dir="ltr" style={{ textAlign: "right" }}>
                    {c.type === "enum" ? <Link href={`/enums#${c.enum}`} className="text-primary hover:underline">{c.enum}</Link> : c.type === "varchar" ? `varchar(${c.length})` : c.type === "numeric" && c.precision ? `numeric(${c.precision.join(",")})` : c.type}
                  </td>
                  <td className="px-4 py-2.5">{c.nullable ? <span className="chip bg-surface-2 text-muted">NULL</span> : <span className="chip bg-danger/10 text-danger">NOT NULL</span>}</td>
                  <td className="mono px-4 py-2.5 text-[12px] text-ink-2" dir="ltr" style={{ textAlign: "right" }}>{c.identity ? "identity" : c.default ?? "—"}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {c.pk && <span className="chip bg-warning/15 text-[#a16207] dark:text-warning">PK</span>}
                      {c.unique && !c.pk && <span className="chip bg-royal/10 text-royal">UNIQUE</span>}
                      {c.ref && (
                        <Link href={`/tables/${c.ref.table}`} title={`ON DELETE ${c.ref.onDelete ?? "restrict"}`} className="chip mono hover:underline" style={{ background: `${d.color}18`, color: d.color }} dir="ltr">
                          → {c.ref.table}{c.ref.column ? `.${c.ref.column}` : ""}
                        </Link>
                      )}
                      {c.ref && <span className="mono text-[10.5px] text-muted" dir="ltr">on delete {c.ref.onDelete ?? "restrict"}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-[12.5px] leading-6 text-ink-2">
                    {c.note}
                    {c.type === "enum" && <div className="mt-1 flex flex-wrap gap-1">{enumMap[c.enum!].values.map((v) => <span key={v.value} className="chip mono !text-[10.5px] bg-surface-2" title={v.fa}>{v.value}</span>)}</div>}
                    {c.example && <div className="mono mt-0.5 text-[11px] text-muted" dir="ltr" style={{ textAlign: "right" }}>e.g. {c.example}</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* constraints + rules */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-3 text-[15px] font-extrabold">ایندکس‌ها و قیدها</h3>
          <ul className="space-y-2 text-[12.5px]">
            {(t.indexes ?? []).map((ix, i) => (
              <li key={i} className="rounded-xl bg-surface-2 px-3 py-2">
                <span className="mono font-semibold" dir="ltr">{ix.unique ? "UNIQUE " : ""}INDEX ({ix.columns.join(", ")}){ix.where ? ` WHERE ${ix.where}` : ""}</span>
                {ix.note && <div className="mt-0.5 text-ink-2">{ix.note}</div>}
              </li>
            ))}
            {(t.checks ?? []).map((ch) => (
              <li key={ch.name} className="rounded-xl bg-surface-2 px-3 py-2">
                <span className="mono font-semibold" dir="ltr">CHECK {ch.name}: {ch.expr}</span>
                {ch.note && <div className="mt-0.5 text-ink-2">{ch.note}</div>}
              </li>
            ))}
            {!t.indexes?.length && !t.checks?.length && <li className="text-muted">فقط کلید اصلی و ایندکس خودکار FKها</li>}
          </ul>
        </div>
        <div className="card p-5">
          <h3 className="mb-3 text-[15px] font-extrabold">قوانین بیزینسی</h3>
          <ul className="space-y-2 text-[13px] leading-7 text-ink-2">
            {(t.rules ?? []).map((r) => <li key={r} className="flex gap-2"><span className="text-primary">◆</span>{r}</li>)}
            {(t.derived ?? []).map((r) => <li key={r} className="flex gap-2"><span className="text-fuchsia">⟳</span><span className="mono text-[12px]" dir="ltr">{r}</span></li>)}
            {!t.rules?.length && !t.derived?.length && <li className="text-muted">قانون خاصی جز قیدهای ستون ثبت نشده.</li>}
          </ul>
        </div>
      </section>

      {/* relations */}
      <section>
        <h2 className="mb-3 text-[17px] font-extrabold">روابط</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="card p-4">
            <h3 className="mb-2 text-[13px] font-bold text-muted">belongs to (این جدول → دیگری) · {out.length}</h3>
            <div className="space-y-1.5">
              {out.map((r) => (
                <Link key={r.id} href={`/tables/${r.to}`} className="mono flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2 text-[12.5px] hover:bg-primary-soft" dir="ltr">
                  <span className="font-semibold">{r.fromColumn}</span><span className="text-muted">{r.kind === "one-to-one" ? "1 —— 1" : "N —< 1"}</span><span className="font-bold" style={{ color: domainMap[tableMap[r.to].domain].color }}>{r.to}.{r.toColumn}</span>
                  <span className="ml-auto text-[11px] text-muted">{r.nullable ? "optional" : "required"} · on delete {r.onDelete}</span>
                </Link>
              ))}
              {!out.length && <div className="text-[12.5px] text-muted">جدول ریشه — به جدولی وابسته نیست.</div>}
            </div>
          </div>
          <div className="card p-4">
            <h3 className="mb-2 text-[13px] font-bold text-muted">has many (دیگری → این جدول) · {inc.length}</h3>
            <div className="max-h-72 space-y-1.5 overflow-y-auto">
              {inc.map((r) => (
                <Link key={r.id} href={`/tables/${r.from}`} className="mono flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2 text-[12.5px] hover:bg-primary-soft" dir="ltr">
                  <span className="font-bold" style={{ color: domainMap[tableMap[r.from].domain].color }}>{r.from}</span><span className="text-muted">.{r.fromColumn}</span>
                  <span className="ml-auto text-[11px] text-muted">{r.kind === "one-to-one" ? "has one" : "has many"}</span>
                </Link>
              ))}
              {!inc.length && <div className="text-[12.5px] text-muted">هیچ جدولی به این جدول ارجاع نمی‌دهد.</div>}
            </div>
          </div>
        </div>
        <div className="card mt-4 overflow-hidden">
          <div className="border-b border-line px-4 py-2.5 text-[12.5px] font-bold text-muted">دیاگرام همسایه‌ها (قابل درگ و زوم)</div>
          <ErdCanvas focus={t.name} seedCounts={Object.fromEntries(Object.entries(seed).map(([k, v]) => [k, v.length]))} height={480} />
        </div>
      </section>

      {/* data */}
      <section>
        <h2 className="mb-3 text-[17px] font-extrabold">دیتای فیک <span className="text-[12px] font-normal text-muted">— سازگار با FKها، از اسامی و اعداد داخل دیزاین</span></h2>
        <DataGrid name={t.name} columns={t.columns} rows={rows} />
      </section>

      {/* code */}
      <section>
        <h2 className="mb-3 text-[17px] font-extrabold">کد و خروجی‌ها</h2>
        <CodeTabs tabs={tabs} />
      </section>

      {/* api + screens */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-3 text-[15px] font-extrabold">Endpoint هایی که این جدول را می‌خوانند/می‌نویسند · {eps.length}</h3>
          <div className="max-h-96 space-y-1.5 overflow-y-auto">
            {eps.map((e) => (
              <Link key={e.method + e.path} href={`/api-docs#${e.group}`} className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-surface-2">
                <span className="mono w-14 shrink-0 rounded-md py-0.5 text-center text-[10.5px] font-bold text-white" style={{ background: methodColor[e.method] }}>{e.method}</span>
                <span className="mono truncate text-[12px]" dir="ltr">{e.path}</span>
                <span className="mr-auto truncate text-[11.5px] text-muted">{e.summary}</span>
              </Link>
            ))}
            {!eps.length && <div className="text-[12.5px] text-muted">فقط داخلی (جاب‌ها / ادمین)</div>}
          </div>
        </div>
        <div className="card p-5">
          <h3 className="mb-3 text-[15px] font-extrabold">اسکرین‌های مرتبط در Figma</h3>
          <div className="flex flex-wrap gap-1.5">
            {frames.map((f) => (
              <a key={f.id} href={figmaLink(f.id)} target="_blank" rel="noreferrer" className="chip border border-line bg-surface-2 hover:border-primary hover:text-primary">
                <Icon name="figma" size={12} /> <span dir="ltr">{f.n}</span> <span className="text-muted">· {f.s.panel === "customer" ? "مشتری" : "سالن"}</span>
              </a>
            ))}
          </div>
          <div className="mt-4 text-[12px] font-bold text-muted">بخش‌ها</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {secs.map((s) => <Link key={s.key} href={`/screens#${s.key}`} className="chip bg-primary-soft text-primary">{s.panel === "customer" ? "مشتری" : "سالن"} · {s.title}</Link>)}
          </div>
        </div>
      </section>

      <nav className="flex justify-between gap-3 text-[13px]">
        {prev ? <Link href={`/tables/${prev.name}`} className="card mono px-4 py-3 hover:text-primary" dir="ltr">→ {prev.name}</Link> : <span />}
        {next ? <Link href={`/tables/${next.name}`} className="card mono px-4 py-3 hover:text-primary" dir="ltr">{next.name} ←</Link> : <span />}
      </nav>
    </div>
  );
}
