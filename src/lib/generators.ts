import { enums, enumMap } from "@/schema/enums";
import { relations, tableMap, tables } from "@/schema/tables";
import type { Column, Table } from "@/schema/types";
import { endpoints, apiGroups } from "@/schema/api";
import { getSeed, type Row } from "@/schema/seed";

/* ───────────── utils ───────────── */
const q = (s: string) => `'${s.replace(/'/g, "''")}'`;
const pascal = (s: string) => s.replace(/(^|_)([a-z0-9])/g, (_, __, c) => c.toUpperCase());
const camel = (s: string) => s.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
export function singular(s: string) {
  if (s.endsWith("ies")) return s.slice(0, -3) + "y";
  if (s.endsWith("esses")) return s.slice(0, -2);
  if (/(ches|shes|xes)$/.test(s)) return s.slice(0, -2);
  if (s.endsWith("s") && !s.endsWith("ss")) return s.slice(0, -1);
  return s;
}
const modelName = (t: string) => pascal(singular(t));
const pks = (t: Table) => t.columns.filter((c) => c.pk);
const isRequired = (c: Column) => !c.nullable;
const header = (title: string, c = "--") =>
  `${c} ════════════════════════════════════════════════════════════\n${c} Ino (اینو) — ${title}\n${c} Generated from the single-source schema (${tables.length} tables, ${relations.length} relations, ${enums.length} enums)\n${c} ════════════════════════════════════════════════════════════\n`;

/* ───────────── PostgreSQL ───────────── */
function pgType(c: Column) {
  switch (c.type) {
    case "varchar": return `varchar(${c.length ?? 255})`;
    case "numeric": return c.precision ? `numeric(${c.precision[0]},${c.precision[1]})` : "numeric";
    case "int": return "integer";
    case "bool": return "boolean";
    case "enum": return c.enum!;
    default: return c.type;
  }
}
export function pgColumn(c: Column, t: Table) {
  const parts = [`"${c.name}"`.replace(/"/g, ""), pgType(c)];
  if (c.identity) parts.push("GENERATED ALWAYS AS IDENTITY");
  if (c.pk && pks(t).length === 1) parts.push("PRIMARY KEY");
  else if (!c.nullable) parts.push("NOT NULL");
  if (c.unique && !c.pk) parts.push("UNIQUE");
  if (c.default !== undefined) parts.push(`DEFAULT ${c.default}`);
  return parts.join(" ");
}
function idxName(t: Table, cols: string[], unique?: boolean) {
  return `${t.name}_${cols.join("_")}_${unique ? "uq" : "idx"}`.slice(0, 63);
}
export function pgTable(t: Table, withFks = false) {
  const lines = t.columns.map((c) => "  " + pgColumn(c, t));
  if (pks(t).length > 1) lines.push(`  PRIMARY KEY (${pks(t).map((c) => c.name).join(", ")})`);
  (t.checks ?? []).forEach((ch) => lines.push(`  CONSTRAINT ${ch.name} CHECK (${ch.expr})`));
  if (withFks)
    t.columns.filter((c) => c.ref).forEach((c) => lines.push(`  CONSTRAINT ${t.name}_${c.name}_fkey FOREIGN KEY (${c.name}) REFERENCES ${c.ref!.table}(${c.ref!.column ?? "id"}) ON DELETE ${(c.ref!.onDelete ?? "restrict").toUpperCase()}`));
  let out = `CREATE TABLE ${t.name} (\n${lines.join(",\n")}\n);\n`;
  out += `COMMENT ON TABLE ${t.name} IS ${q(t.title + " — " + t.description)};\n`;
  t.columns.filter((c) => c.note).forEach((c) => (out += `COMMENT ON COLUMN ${t.name}.${c.name} IS ${q(c.note!)};\n`));
  (t.indexes ?? []).forEach((ix) => {
    out += `CREATE ${ix.unique ? "UNIQUE " : ""}INDEX ${ix.name ?? idxName(t, ix.columns, ix.unique)} ON ${t.name} (${ix.columns.join(", ")})${ix.where ? ` WHERE ${ix.where}` : ""};${ix.note ? ` -- ${ix.note}` : ""}\n`;
  });
  t.columns.filter((c) => c.ref && !c.pk && !c.unique && !(t.indexes ?? []).some((i) => i.columns[0] === c.name)).forEach((c) => {
    out += `CREATE INDEX ${idxName(t, [c.name])} ON ${t.name} (${c.name});\n`;
  });
  return out;
}
export function pgEnums() {
  return enums.map((e) => `CREATE TYPE ${e.name} AS ENUM (${e.values.map((v) => q(v.value)).join(", ")}); -- ${e.title}`).join("\n");
}
export function postgres() {
  let out = header("PostgreSQL 15+ DDL") + "\nBEGIN;\n\n-- ─── Extensions ───\nCREATE EXTENSION IF NOT EXISTS pg_trgm;   -- جستجوی فازی نام سالن/خدمت\nCREATE EXTENSION IF NOT EXISTS btree_gist; -- جلوگیری از هم‌پوشانی نوبت‌ها\n\n-- ─── Enums ───\n" + pgEnums() + "\n\n-- ─── Tables ───\n";
  tables.forEach((t) => (out += `\n-- ${t.title}\n` + pgTable(t)));
  out += "\n-- ─── Foreign keys (added after tables to allow cycles) ───\n";
  relations.forEach((r) => (out += `ALTER TABLE ${r.from} ADD CONSTRAINT ${`${r.from}_${r.fromColumn}_fkey`.slice(0, 63)} FOREIGN KEY (${r.fromColumn}) REFERENCES ${r.to}(${r.toColumn}) ON DELETE ${r.onDelete.toUpperCase()};\n`));
  out += `\n-- ─── Domain-level constraints ───\n-- هیچ متخصصی نباید دو خدمت هم‌پوشان داشته باشد (فقط رزروهای فعال)\nALTER TABLE booking_items ADD CONSTRAINT booking_items_no_overlap\n  EXCLUDE USING gist (member_id WITH =, tstzrange(start_at, end_at) WITH &&) WHERE (is_active);\n\nCREATE SEQUENCE IF NOT EXISTS booking_no_seq START 1000;\nALTER TABLE bookings ALTER COLUMN booking_no SET DEFAULT nextval('booking_no_seq');\n\nCOMMIT;\n`;
  return out;
}

/* ───────────── MySQL ───────────── */
function myType(c: Column) {
  switch (c.type) {
    case "bigint": return "BIGINT";
    case "int": return "INT";
    case "smallint": return "SMALLINT";
    case "varchar": return `VARCHAR(${c.length ?? 255})`;
    case "text": return "TEXT";
    case "bool": return "TINYINT(1)";
    case "timestamptz": return "DATETIME(6)";
    case "date": return "DATE";
    case "time": return "TIME";
    case "numeric": return c.precision ? `DECIMAL(${c.precision[0]},${c.precision[1]})` : "DECIMAL(18,4)";
    case "jsonb": return "JSON";
    case "inet": return "VARCHAR(45)";
    case "enum": return `ENUM(${enumMap[c.enum!].values.map((v) => q(v.value)).join(",")})`;
  }
}
function myDefault(c: Column) {
  if (c.default === undefined || c.type === "text" || c.type === "jsonb") return "";
  if (c.default === "now()") return " DEFAULT CURRENT_TIMESTAMP(6)";
  if (c.type === "bool") return ` DEFAULT ${c.default === "true" ? 1 : 0}`;
  return ` DEFAULT ${c.default}`;
}
export function mysql() {
  let out = header("MySQL 8 DDL") + "\nSET NAMES utf8mb4;\nSET FOREIGN_KEY_CHECKS = 0;\n";
  tables.forEach((t) => {
    const lines = t.columns.map((c) => `  \`${c.name}\` ${myType(c)}${c.nullable ? " NULL" : " NOT NULL"}${c.identity ? " AUTO_INCREMENT" : ""}${myDefault(c)}${c.unique && !c.pk ? " UNIQUE" : ""}${c.note ? ` COMMENT ${q(c.note)}` : ""}`);
    lines.push(`  PRIMARY KEY (${pks(t).map((c) => `\`${c.name}\``).join(", ")})`);
    (t.indexes ?? []).forEach((ix) => {
      const partial = !!ix.where;
      lines.push(`  ${ix.unique && !partial ? "UNIQUE " : ""}KEY \`${ix.name ?? idxName(t, ix.columns, ix.unique)}\` (${ix.columns.map((c) => `\`${c}\``).join(", ")})${partial ? ` /* partial in PG: WHERE ${ix.where} — enforce in app */` : ""}`);
    });
    (t.checks ?? []).filter((ch) => !ch.expr.includes("~")).forEach((ch) => lines.push(`  CONSTRAINT \`${ch.name}\` CHECK (${ch.expr})`));
    t.columns.filter((c) => c.ref).forEach((c) => lines.push(`  CONSTRAINT \`${`${t.name}_${c.name}_fk`.slice(0, 64)}\` FOREIGN KEY (\`${c.name}\`) REFERENCES \`${c.ref!.table}\` (\`${c.ref!.column ?? "id"}\`) ON DELETE ${(c.ref!.onDelete ?? "restrict").toUpperCase()}`));
    out += `\n-- ${t.title}\nCREATE TABLE \`${t.name}\` (\n${lines.join(",\n")}\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci COMMENT=${q(t.title)};\n`;
  });
  return out + "\nSET FOREIGN_KEY_CHECKS = 1;\n";
}

/* ───────────── Prisma ───────────── */
function relField(t: Table, c: Column) {
  let base = c.name.endsWith("_id") ? c.name.slice(0, -3) : c.name.endsWith("_code") ? c.name.slice(0, -5) : `${c.name}_${singular(c.ref!.table)}`;
  if (t.columns.some((x) => x.name === base)) base += "_rel";
  return base;
}
function prismaScalar(c: Column) {
  switch (c.type) {
    case "bigint": return { t: "BigInt", a: "" };
    case "int": return { t: "Int", a: "" };
    case "smallint": return { t: "Int", a: " @db.SmallInt" };
    case "varchar": return { t: "String", a: ` @db.VarChar(${c.length})` };
    case "text": return { t: "String", a: "" };
    case "bool": return { t: "Boolean", a: "" };
    case "timestamptz": return { t: "DateTime", a: " @db.Timestamptz(6)" };
    case "date": return { t: "DateTime", a: " @db.Date" };
    case "time": return { t: "DateTime", a: " @db.Time(6)" };
    case "numeric": return { t: "Decimal", a: c.precision ? ` @db.Decimal(${c.precision[0]}, ${c.precision[1]})` : "" };
    case "jsonb": return { t: "Json", a: "" };
    case "inet": return { t: "String", a: " @db.Inet" };
    case "enum": return { t: pascal(c.enum!), a: "" };
  }
}
function prismaDefault(c: Column) {
  if (c.identity) return " @default(autoincrement())";
  if (c.default === undefined) return "";
  if (c.default === "now()") return " @default(now())";
  if (c.type === "enum") return ` @default(${c.default.replace(/'/g, "")})`;
  if (c.default.startsWith("'")) return ` @default("${c.default.replace(/'/g, "")}")`;
  return ` @default(${c.default})`;
}
export function prisma() {
  let out = header("Prisma schema", "//") + `\ngenerator client {\n  provider        = "prisma-client-js"\n  previewFeatures = ["postgresqlExtensions"]\n}\n\ndatasource db {\n  provider   = "postgresql"\n  url        = env("DATABASE_URL")\n  extensions = [pg_trgm, btree_gist]\n}\n`;
  enums.forEach((e) => (out += `\n/// ${e.title}\nenum ${pascal(e.name)} {\n${e.values.map((v) => `  ${v.value} // ${v.fa}`).join("\n")}\n\n  @@map("${e.name}")\n}\n`));
  tables.forEach((t) => {
    const L: string[] = [];
    const singlePk = pks(t).length === 1;
    t.columns.forEach((c) => {
      const s = prismaScalar(c)!;
      L.push(`  ${c.name} ${s.t}${c.nullable ? "?" : ""}${c.pk && singlePk ? " @id" : ""}${prismaDefault(c)}${c.unique && !c.pk ? " @unique" : ""}${s.a}${c.note ? ` /// ${c.note}` : ""}`);
    });
    // forward relations
    t.columns.filter((c) => c.ref).forEach((c) => {
      const r = c.ref!;
      const od = r.onDelete === "cascade" ? "Cascade" : r.onDelete === "set null" ? "SetNull" : "Restrict";
      L.push(`  ${relField(t, c)} ${modelName(r.table)}${c.nullable ? "?" : ""} @relation("${t.name}_${c.name}", fields: [${c.name}], references: [${r.column ?? "id"}], onDelete: ${od})`);
    });
    // back relations
    relations.filter((r) => r.to === t.name).forEach((r) => {
      const src = tableMap[r.from];
      const col = src.columns.find((c) => c.name === r.fromColumn)!;
      const oneToOne = col.unique || (col.pk && pks(src).length === 1);
      const many = relations.filter((x) => x.to === t.name && x.from === r.from).length > 1;
      const fname = many ? `${r.from}_by_${r.fromColumn.replace(/_id$/, "")}` : r.from;
      L.push(`  ${fname} ${modelName(r.from)}${oneToOne ? "?" : "[]"} @relation("${r.from}_${r.fromColumn}")`);
    });
    if (!singlePk) L.push(`\n  @@id([${pks(t).map((c) => c.name).join(", ")}])`);
    (t.indexes ?? []).forEach((ix) => {
      if (ix.where) L.push(`  // partial ${ix.unique ? "unique " : ""}index (add in SQL migration): (${ix.columns.join(", ")}) WHERE ${ix.where}`);
      else L.push(`  @@${ix.unique ? "unique" : "index"}([${ix.columns.join(", ")}])`);
    });
    L.push(`  @@map("${t.name}")`);
    out += `\n/// ${t.title} — ${t.description}\nmodel ${modelName(t.name)} {\n${L.join("\n")}\n}\n`;
  });
  return out;
}

/* ───────────── Drizzle ───────────── */
export function drizzle() {
  const used = new Set<string>();
  const colExpr = (c: Column) => {
    let e: string;
    switch (c.type) {
      case "bigint": e = `bigint("${c.name}", { mode: "number" })`; used.add("bigint"); break;
      case "int": e = `integer("${c.name}")`; used.add("integer"); break;
      case "smallint": e = `smallint("${c.name}")`; used.add("smallint"); break;
      case "varchar": e = `varchar("${c.name}", { length: ${c.length} })`; used.add("varchar"); break;
      case "text": e = `text("${c.name}")`; used.add("text"); break;
      case "bool": e = `boolean("${c.name}")`; used.add("boolean"); break;
      case "timestamptz": e = `timestamp("${c.name}", { withTimezone: true })`; used.add("timestamp"); break;
      case "date": e = `date("${c.name}")`; used.add("date"); break;
      case "time": e = `time("${c.name}")`; used.add("time"); break;
      case "numeric": e = `numeric("${c.name}"${c.precision ? `, { precision: ${c.precision[0]}, scale: ${c.precision[1]} }` : ""})`; used.add("numeric"); break;
      case "jsonb": e = `jsonb("${c.name}")`; used.add("jsonb"); break;
      case "inet": e = `inet("${c.name}")`; used.add("inet"); break;
      case "enum": e = `${camel(c.enum!)}Enum("${c.name}")`; break;
    }
    if (c.identity) e += ".generatedAlwaysAsIdentity()";
    if (c.pk && !c.identity) e += "";
    if (!c.nullable) e += ".notNull()";
    if (c.unique && !c.pk) e += ".unique()";
    if (c.default !== undefined && !c.identity) {
      if (c.default === "now()") e += ".defaultNow()";
      else if (c.type === "numeric") e += `.default("${c.default}")`; // drizzle numeric = string
      else if (c.type === "bool" || /^\d+$/.test(c.default)) e += `.default(${c.default})`;
      else e += `.default("${c.default.replace(/'/g, "")}")`;
    }
    if (c.ref) e += `.references((): AnyPgColumn => ${camel(c.ref.table)}.${camel(c.ref.column ?? "id")}, { onDelete: "${c.ref.onDelete ?? "restrict"}" })`;
    return e;
  };
  let body = "";
  enums.forEach((e) => (body += `export const ${camel(e.name)}Enum = pgEnum("${e.name}", [${e.values.map((v) => `"${v.value}"`).join(", ")}]);\n`));
  tables.forEach((t) => {
    const singlePk = pks(t).length === 1;
    const cols = t.columns.map((c) => `    ${camel(c.name)}: ${colExpr(c)}${c.pk && singlePk ? ".primaryKey()" : ""},`).join("\n");
    const extras: string[] = [];
    if (!singlePk) extras.push(`primaryKey({ columns: [${pks(t).map((c) => `t.${camel(c.name)}`).join(", ")}] })`);
    (t.indexes ?? []).forEach((ix) => extras.push(`${ix.unique ? "uniqueIndex" : "index"}("${ix.name ?? idxName(t, ix.columns, ix.unique)}").on(${ix.columns.map((c) => `t.${camel(c)}`).join(", ")})${ix.where ? `.where(sql\`${ix.where}\`)` : ""}`));
    body += `\n/** ${t.title} */\nexport const ${camel(t.name)} = pgTable("${t.name}", {\n${cols}\n}${extras.length ? `, (t) => [\n    ${extras.join(",\n    ")},\n  ]` : ""});\n`;
  });
  const imports = ["pgTable", "pgEnum", "primaryKey", "index", "uniqueIndex", "type AnyPgColumn", ...used].join(", ");
  return header("Drizzle ORM schema (pg-core)", "//") + `import { sql } from "drizzle-orm";\nimport { ${imports} } from "drizzle-orm/pg-core";\n\n` + body;
}

/* ───────────── DBML ───────────── */
export function dbml() {
  let out = header("DBML — paste into dbdiagram.io / dbdocs", "//") + `\nProject ino {\n  database_type: 'PostgreSQL'\n  Note: 'Ino salon booking marketplace — customer app + staff panel'\n}\n`;
  enums.forEach((e) => (out += `\nEnum ${e.name} {\n${e.values.map((v) => `  ${v.value} [note: '${v.fa}']`).join("\n")}\n}\n`));
  tables.forEach((t) => {
    const cols = t.columns.map((c) => {
      const s: string[] = [];
      if (c.pk) s.push("pk");
      if (c.identity) s.push("increment");
      if (!c.nullable && !c.pk) s.push("not null");
      if (c.unique && !c.pk) s.push("unique");
      if (c.default !== undefined) s.push(`default: ${c.default === "now()" ? "`now()`" : c.default.startsWith("'") ? c.default : c.default}`);
      if (c.note) s.push(`note: '${c.note.replace(/'/g, "\\'")}'`);
      const type = c.type === "enum" ? c.enum : pgType(c).replace(/\s/g, "");
      return `  ${c.name} ${type}${s.length ? ` [${s.join(", ")}]` : ""}`;
    });
    const idx = [...(pks(t).length > 1 ? [`    (${pks(t).map((c) => c.name).join(", ")}) [pk]`] : []), ...(t.indexes ?? []).map((ix) => `    (${ix.columns.join(", ")})${ix.unique ? " [unique]" : ""}`)];
    out += `\nTable ${t.name} [headercolor: #694ffd] {\n${cols.join("\n")}${idx.length ? `\n\n  indexes {\n${idx.join("\n")}\n  }` : ""}\n  Note: '${(t.title + " — " + t.description).replace(/'/g, "\\'")}'\n}\n`;
  });
  out += "\n// ─── Relations ───\n";
  relations.forEach((r) => (out += `Ref: ${r.from}.${r.fromColumn} ${r.kind === "one-to-one" ? "-" : ">"} ${r.to}.${r.toColumn} [delete: ${r.onDelete}]\n`));
  const groups: Record<string, string[]> = {};
  tables.forEach((t) => (groups[t.domain] ??= []).push(t.name));
  Object.entries(groups).forEach(([g, ts]) => (out += `\nTableGroup ${g} {\n${ts.map((x) => `  ${x}`).join("\n")}\n}\n`));
  return out;
}

/* ───────────── Mermaid ───────────── */
export function mermaid() {
  let out = "%% Ino — Mermaid ER diagram\nerDiagram\n";
  relations.forEach((r) => (out += `  ${r.to} ${r.kind === "one-to-one" ? "||--o|" : r.nullable ? "|o--o{" : "||--o{"} ${r.from} : "${r.fromColumn}"\n`));
  tables.forEach((t) => {
    out += `  ${t.name} {\n${t.columns.map((c) => `    ${c.type === "enum" ? c.enum : c.type} ${c.name}${c.pk ? " PK" : c.ref ? " FK" : c.unique ? " UK" : ""}`).join("\n")}\n  }\n`;
  });
  return out;
}

/* ───────────── TypeScript / Zod / JSON Schema ───────────── */
function tsType(c: Column) {
  switch (c.type) {
    case "bigint": case "int": case "smallint": return "number";
    case "numeric": return "string";
    case "bool": return "boolean";
    case "jsonb": return "Record<string, unknown>";
    case "enum": return pascal(c.enum!);
    default: return "string";
  }
}
export function typescript() {
  let out = header("TypeScript row types", "//") + "\n";
  enums.forEach((e) => (out += `/** ${e.title} */\nexport type ${pascal(e.name)} = ${e.values.map((v) => `"${v.value}"`).join(" | ")};\n`));
  tables.forEach((t) => (out += `\n/** ${t.title} — ${t.name} */\nexport interface ${modelName(t.name)} {\n${t.columns.map((c) => `  ${c.note ? `/** ${c.note} */\n  ` : ""}${c.name}: ${tsType(c)}${c.nullable ? " | null" : ""};`).join("\n")}\n}\n`));
  return out;
}
function zodType(c: Column) {
  let z: string;
  switch (c.type) {
    case "bigint": case "int": case "smallint": z = "z.number().int()"; break;
    case "numeric": z = "z.coerce.number()"; break;
    case "bool": z = "z.boolean()"; break;
    case "varchar": z = `z.string().max(${c.length})`; break;
    case "timestamptz": z = "z.string().datetime({ offset: true })"; break;
    case "date": z = "z.string().date()"; break;
    case "time": z = 'z.string().regex(/^\\d{2}:\\d{2}(:\\d{2})?$/)'; break;
    case "jsonb": z = "z.record(z.string(), z.unknown())"; break;
    case "enum": z = `${camel(c.enum!)}Schema`; break;
    default: z = "z.string()";
  }
  if (c.name === "mobile") z = 'z.string().regex(/^\\+989\\d{9}$/, "شماره موبایل معتبر نیست؛ ۱۰ رقم وارد کنید")';
  if (c.name === "rating") z = "z.number().int().min(1).max(5)";
  return z + (c.nullable ? ".nullable()" : "");
}
export function zod() {
  let out = header("Zod validation schemas", "//") + `import { z } from "zod";\n\n`;
  enums.forEach((e) => (out += `export const ${camel(e.name)}Schema = z.enum([${e.values.map((v) => `"${v.value}"`).join(", ")}]);\n`));
  tables.forEach((t) => (out += `\n/** ${t.title} */\nexport const ${camel(singular(t.name))}Schema = z.object({\n${t.columns.map((c) => `  ${c.name}: ${zodType(c)},`).join("\n")}\n});\nexport type ${modelName(t.name)}Input = z.infer<typeof ${camel(singular(t.name))}Schema>;\n`));
  return out;
}
export function jsonSchemaFor(t: Table) {
  const prop = (c: Column): Record<string, unknown> => {
    const base: Record<string, unknown> = { description: c.note };
    switch (c.type) {
      case "bigint": case "int": case "smallint": base.type = "integer"; break;
      case "numeric": base.type = "number"; break;
      case "bool": base.type = "boolean"; break;
      case "jsonb": base.type = "object"; break;
      case "enum": base.type = "string"; base.enum = enumMap[c.enum!].values.map((v) => v.value); break;
      case "timestamptz": base.type = "string"; base.format = "date-time"; break;
      case "date": base.type = "string"; base.format = "date"; break;
      default: base.type = "string"; if (c.length) base.maxLength = c.length;
    }
    if (c.nullable) base.type = [base.type, "null"];
    return base;
  };
  return { title: t.title, description: t.description, type: "object", properties: Object.fromEntries(t.columns.map((c) => [c.name, prop(c)])), required: t.columns.filter(isRequired).map((c) => c.name) };
}
export function jsonSchema() {
  return JSON.stringify({ $schema: "https://json-schema.org/draft/2020-12/schema", $id: "https://ino.app/schema.json", title: "Ino data model", $defs: Object.fromEntries(tables.map((t) => [modelName(t.name), jsonSchemaFor(t)])) }, null, 2);
}

/* ───────────── Laravel ───────────── */
export function laravel() {
  const m = (c: Column) => {
    let e: string;
    if (c.identity) return `$table->id('${c.name}');`;
    switch (c.type) {
      case "bigint": e = c.ref ? `$table->foreignId('${c.name}')` : `$table->bigInteger('${c.name}')`; break;
      case "int": e = `$table->integer('${c.name}')`; break;
      case "smallint": e = `$table->smallInteger('${c.name}')`; break;
      case "varchar": e = `$table->string('${c.name}', ${c.length})`; break;
      case "text": e = `$table->text('${c.name}')`; break;
      case "bool": e = `$table->boolean('${c.name}')`; break;
      case "timestamptz": e = `$table->timestampTz('${c.name}')`; break;
      case "date": e = `$table->date('${c.name}')`; break;
      case "time": e = `$table->time('${c.name}')`; break;
      case "numeric": e = `$table->decimal('${c.name}', ${c.precision?.[0] ?? 18}, ${c.precision?.[1] ?? 4})`; break;
      case "jsonb": e = `$table->jsonb('${c.name}')`; break;
      case "inet": e = `$table->ipAddress('${c.name}')`; break;
      case "enum": e = `$table->enum('${c.name}', [${enumMap[c.enum!].values.map((v) => `'${v.value}'`).join(", ")}])`; break;
    }
    if (c.nullable) e += "->nullable()";
    if (c.unique && !c.pk) e += "->unique()";
    if (c.default === "now()") e += "->useCurrent()";
    else if (c.default !== undefined) e += `->default(${c.default === "true" || c.default === "false" ? c.default : c.default.startsWith("'") ? c.default : c.default})`;
    if (c.ref) e += `->constrained('${c.ref.table}'${c.ref.column ? `, '${c.ref.column}'` : ""})${c.ref.onDelete === "cascade" ? "->cascadeOnDelete()" : c.ref.onDelete === "set null" ? "->nullOnDelete()" : "->restrictOnDelete()"}`;
    if (c.note) e += `->comment('${c.note.replace(/'/g, "\\'")}')`;
    return e + ";";
  };
  let up = "";
  tables.forEach((t) => {
    const body = t.columns.map((c) => `            ${m(c)}`);
    if (pks(t).length > 1) body.push(`            $table->primary([${pks(t).map((c) => `'${c.name}'`).join(", ")}]);`);
    (t.indexes ?? []).filter((i) => !i.where).forEach((ix) => body.push(`            $table->${ix.unique ? "unique" : "index"}([${ix.columns.map((c) => `'${c}'`).join(", ")}]);`));
    up += `        // ${t.title}\n        Schema::create('${t.name}', function (Blueprint $table) {\n${body.join("\n")}\n        });\n\n`;
  });
  return `<?php\n${header("Laravel migration", "//")}\nuse Illuminate\\Database\\Migrations\\Migration;\nuse Illuminate\\Database\\Schema\\Blueprint;\nuse Illuminate\\Support\\Facades\\Schema;\n\nreturn new class extends Migration {\n    public function up(): void\n    {\n        Schema::disableForeignKeyConstraints();\n${up}        Schema::enableForeignKeyConstraints();\n    }\n\n    public function down(): void\n    {\n        Schema::disableForeignKeyConstraints();\n${[...tables].reverse().map((t) => `        Schema::dropIfExists('${t.name}');`).join("\n")}\n        Schema::enableForeignKeyConstraints();\n    }\n};\n`;
}

/* ───────────── Seed data ───────────── */
function sqlValue(v: Row[string], c: Column | undefined, dialect: "pg" | "mysql") {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "boolean") return dialect === "pg" ? String(v) : v ? "1" : "0";
  if (typeof v === "number") return String(v);
  if (typeof v === "object") return dialect === "pg" ? `${q(JSON.stringify(v))}::jsonb` : q(JSON.stringify(v));
  if (dialect === "mysql" && c?.type === "timestamptz") return q(String(v).replace("T", " ").replace(/\+03:30$/, ""));
  return q(String(v));
}
export function seedSql(dialect: "pg" | "mysql" = "pg", only?: string) {
  const seed = getSeed();
  let out = header(`Seed data (${dialect === "pg" ? "PostgreSQL" : "MySQL"}) — fake, FK-consistent`) + "\n";
  out += dialect === "pg" ? "BEGIN;\nSET session_replication_role = replica; -- disable FK checks while seeding\n" : "SET FOREIGN_KEY_CHECKS = 0;\n";
  tables.filter((t) => !only || t.name === only).forEach((t) => {
    const rows = seed[t.name] ?? [];
    if (!rows.length) return;
    const cols = t.columns.map((c) => c.name).filter((c) => c in rows[0]);
    const hasIdentity = t.columns.some((c) => c.identity);
    out += `\n-- ${t.title} (${rows.length})\nINSERT INTO ${dialect === "mysql" ? `\`${t.name}\`` : t.name} (${cols.join(", ")})${dialect === "pg" && hasIdentity ? " OVERRIDING SYSTEM VALUE" : ""} VALUES\n`;
    out += rows.map((r) => `  (${cols.map((c) => sqlValue(r[c], t.columns.find((x) => x.name === c), dialect)).join(", ")})`).join(",\n") + ";\n";
    if (dialect === "pg" && hasIdentity) out += `SELECT setval(pg_get_serial_sequence('${t.name}', 'id'), (SELECT max(id) FROM ${t.name}));\n`;
  });
  out += dialect === "pg" ? "\nSET session_replication_role = DEFAULT;\nCOMMIT;\n" : "\nSET FOREIGN_KEY_CHECKS = 1;\n";
  return out;
}
export function seedJson() {
  return JSON.stringify(getSeed(), null, 2);
}
export function csv(tableName: string) {
  const t = tableMap[tableName];
  const rows = getSeed()[tableName] ?? [];
  const cols = t.columns.map((c) => c.name);
  const esc = (v: unknown) => {
    if (v === null || v === undefined) return "";
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return "\ufeff" + [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
}

/* ───────────── OpenAPI ───────────── */
export function openapi() {
  const paths: Record<string, Record<string, unknown>> = {};
  endpoints.forEach((e) => {
    const params = [...e.path.matchAll(/\{(\w+)\}/g)].map((m) => ({ name: m[1], in: "path", required: true, schema: { type: m[1].endsWith("id") ? "integer" : "string" } }));
    Object.entries(e.query ?? {}).forEach(([k, v]) => params.push({ name: k, in: "query", required: false, schema: { type: "string", description: v } as never }));
    const op: Record<string, unknown> = {
      tags: [apiGroups.find((g) => g.key === e.group)?.title ?? e.group],
      summary: e.summary,
      operationId: `${e.method.toLowerCase()}_${e.path.replace(/^\/v1\//, "").replace(/[{}]/g, "").replace(/[\/-]/g, "_")}`,
      description: `Auth: \`${e.auth}\` · Tables: ${e.tables.map((t) => `\`${t}\``).join(", ") || "—"}${e.errors ? `\n\nErrors: ${e.errors.join(", ")}` : ""}`,
      parameters: params.length ? params : undefined,
      security: e.auth === "public" ? [] : [{ bearer: [] }],
      responses: { "200": { description: e.returns ?? "OK", content: { "application/json": { schema: e.tables[0] && !e.returns ? { $ref: `#/components/schemas/${modelName(e.tables[0])}` } : { type: "object" } } } }, ...(e.errors ? { "422": { description: e.errors.join(" | ") } } : {}) },
    };
    if (e.body) op.requestBody = { content: { "application/json": { schema: { type: "object", properties: Object.fromEntries(Object.entries(e.body).map(([k, v]) => [k, { type: "string", description: v }])) } } } };
    (paths[e.path] ??= {})[e.method.toLowerCase()] = op;
  });
  return JSON.stringify({
    openapi: "3.1.0",
    info: { title: "Ino API", version: "1.0.0", description: "API پیشنهادی اینو — اپ مشتری، پنل سالن و پنل تیم اینو. تولیدشده از دیزاین Figma." },
    servers: [{ url: "https://api.ino.app" }],
    tags: apiGroups.map((g) => ({ name: g.title, description: g.app })),
    paths,
    components: { securitySchemes: { bearer: { type: "http", scheme: "bearer", bearerFormat: "JWT" } }, schemas: Object.fromEntries(tables.map((t) => [modelName(t.name), jsonSchemaFor(t)])) },
  }, null, 2);
}

/* ───────────── registry ───────────── */
export interface ExportFormat {
  key: string;
  title: string;
  file: string;
  lang: string;
  desc: string;
  group: "sql" | "orm" | "types" | "data" | "api" | "diagram";
  gen: () => string;
}
export const formats: ExportFormat[] = [
  { key: "postgres", title: "PostgreSQL DDL", file: "ino.postgres.sql", lang: "sql", desc: "Enums، جداول، کامنت فارسی، ایندکس‌های partial، EXCLUDE برای هم‌پوشانی", group: "sql", gen: postgres },
  { key: "mysql", title: "MySQL 8 DDL", file: "ino.mysql.sql", lang: "sql", desc: "InnoDB + utf8mb4_persian_ci، ENUM و FK", group: "sql", gen: mysql },
  { key: "seed-pg", title: "Seed — PostgreSQL", file: "ino.seed.postgres.sql", lang: "sql", desc: "INSERT دیتای فیک سازگار با FK", group: "data", gen: () => seedSql("pg") },
  { key: "seed-mysql", title: "Seed — MySQL", file: "ino.seed.mysql.sql", lang: "sql", desc: "INSERT دیتای فیک برای MySQL", group: "data", gen: () => seedSql("mysql") },
  { key: "fixtures", title: "JSON Fixtures", file: "ino.fixtures.json", lang: "json", desc: "تمام دیتای فیک به‌صورت JSON برای تست و Mock", group: "data", gen: seedJson },
  { key: "prisma", title: "Prisma Schema", file: "schema.prisma", lang: "prisma", desc: "مدل‌ها، روابط نام‌دار دوطرفه، enums", group: "orm", gen: prisma },
  { key: "drizzle", title: "Drizzle ORM", file: "schema.ts", lang: "typescript", desc: "pg-core با pgEnum و references", group: "orm", gen: drizzle },
  { key: "laravel", title: "Laravel Migration", file: "2026_11_06_000000_create_ino_tables.php", lang: "php", desc: "Schema::create برای همه جداول", group: "orm", gen: laravel },
  { key: "typescript", title: "TypeScript Types", file: "ino.types.ts", lang: "typescript", desc: "Interface برای هر جدول + union برای enums", group: "types", gen: typescript },
  { key: "zod", title: "Zod Schemas", file: "ino.zod.ts", lang: "typescript", desc: "اعتبارسنجی ورودی‌ها با پیام فارسی", group: "types", gen: zod },
  { key: "jsonschema", title: "JSON Schema", file: "ino.schema.json", lang: "json", desc: "Draft 2020-12 برای هر جدول", group: "types", gen: jsonSchema },
  { key: "openapi", title: "OpenAPI 3.1", file: "ino.openapi.json", lang: "json", desc: `${endpoints.length} endpoint با گروه، احراز و خطاها`, group: "api", gen: openapi },
  { key: "dbml", title: "DBML", file: "ino.dbml", lang: "text", desc: "برای dbdiagram.io / dbdocs با TableGroup", group: "diagram", gen: dbml },
  { key: "mermaid", title: "Mermaid ERD", file: "ino.mmd", lang: "text", desc: "erDiagram برای GitHub/Notion", group: "diagram", gen: mermaid },
];
export const formatMap = Object.fromEntries(formats.map((f) => [f.key, f]));
