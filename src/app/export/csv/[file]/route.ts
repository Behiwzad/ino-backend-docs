import { csv } from "@/lib/generators";
import { tables } from "@/schema/tables";

// Rendered once at build time → out/export/csv/<table>.csv
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return tables.map((t) => ({ file: `${t.name}.csv` }));
}

export async function GET(_: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const table = file.replace(/\.csv$/, "");
  if (!tables.some((t) => t.name === table)) return new Response("Unknown table", { status: 404 });
  return new Response(csv(table), { headers: { "content-type": "text/csv; charset=utf-8" } });
}
