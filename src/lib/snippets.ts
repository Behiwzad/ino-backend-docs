import { mysql, prisma, drizzle, typescript, zod, seedSql, pgTable, singular, jsonSchemaFor } from "./generators";
import type { Table } from "@/schema/types";

const pascal = (s: string) => s.replace(/(^|_)([a-z0-9])/g, (_, __, c) => c.toUpperCase());
const camel = (s: string) => s.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

let cache: Record<string, string> | null = null;
function full() {
  cache ??= { mysql: mysql(), prisma: prisma(), drizzle: drizzle(), ts: typescript(), zod: zod() };
  return cache;
}

export function tableSnippets(t: Table) {
  const f = full();
  const model = pascal(singular(t.name));
  const pick = (src: string, re: RegExp) => src.match(re)?.[0]?.trim() ?? "";
  return {
    postgres: pgTable(t, true),
    mysql: pick(f.mysql, new RegExp(`-- [^\\n]*\\nCREATE TABLE \`${esc(t.name)}\` \\([\\s\\S]*?;\\n`)),
    prisma: pick(f.prisma, new RegExp(`/// [^\\n]*\\nmodel ${model} \\{[\\s\\S]*?\\n\\}\\n`)),
    drizzle: pick(f.drizzle, new RegExp(`/\\*\\* [^\\n]* \\*/\\nexport const ${camel(t.name)} = pgTable\\("${esc(t.name)}"[\\s\\S]*?\\);\\n`)),
    ts: pick(f.ts, new RegExp(`/\\*\\* [^\\n]* — ${esc(t.name)} \\*/\\nexport interface ${model} \\{[\\s\\S]*?\\n\\}\\n`)),
    zod: pick(f.zod, new RegExp(`/\\*\\* [^\\n]* \\*/\\nexport const ${camel(singular(t.name))}Schema = z\\.object\\(\\{[\\s\\S]*?Input = [^\\n]*\\n`)),
    seed: seedSql("pg", t.name),
    jsonSchema: JSON.stringify(jsonSchemaFor(t), null, 2),
  };
}
