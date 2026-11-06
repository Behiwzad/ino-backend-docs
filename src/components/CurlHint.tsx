"use client";
import { useEffect, useState } from "react";
import { exportUrl } from "@/lib/base";

/** Shows curl commands with the real origin the site is served from (localhost or github.io). */
export function CurlHint() {
  const [origin, setOrigin] = useState("https://<your-site>");
  useEffect(() => setOrigin(window.location.origin), []);
  const u = (f: string) => `${origin}${exportUrl(f)}`;
  return (
    <pre className="mono mt-3 overflow-auto rounded-xl border border-line bg-surface p-3 text-[12px]" dir="ltr">
      {`curl -o ino.postgres.sql ${u("ino.postgres.sql")}\npsql $DATABASE_URL -f ino.postgres.sql && curl -s ${u("ino.seed.postgres.sql")} | psql $DATABASE_URL`}
    </pre>
  );
}
