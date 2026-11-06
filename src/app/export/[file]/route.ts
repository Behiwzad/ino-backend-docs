import { formats } from "@/lib/generators";

// Rendered once at build time → out/export/<file> (e.g. ino.postgres.sql)
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return formats.map((f) => ({ file: f.file }));
}

export async function GET(_: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const f = formats.find((x) => x.file === file);
  if (!f) return new Response("Unknown file", { status: 404 });
  return new Response(f.gen(), {
    headers: { "content-type": f.lang === "json" ? "application/json; charset=utf-8" : "text/plain; charset=utf-8" },
  });
}
