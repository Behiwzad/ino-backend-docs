"use client";
import { useEffect, useState } from "react";
import { exportUrl } from "@/lib/base";
import { CodeBlock } from "./CodeTabs";

/** curl commands with the real origin the site is served from (localhost or github.io). */
export function CurlHint() {
  const [origin, setOrigin] = useState("https://behiwzad.github.io");
  useEffect(() => setOrigin(window.location.origin), []);
  const u = (f: string) => `${origin}${exportUrl(f)}`;
  return (
    <div className="card mt-3 overflow-hidden">
      <CodeBlock lang="shell" raw={`# PostgreSQL: schema + fake data\ncurl -o ino.postgres.sql ${u("ino.postgres.sql")}\npsql $DATABASE_URL -f ino.postgres.sql\ncurl -s ${u("ino.seed.postgres.sql")} | psql $DATABASE_URL`} maxHeight={200} />
    </div>
  );
}
