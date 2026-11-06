/** basePath prefix for plain <a href> and fetch() (Next <Link> adds it by itself). */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const withBase = (path: string) => `${BASE_PATH}${path}`;

/** Static export file URLs */
export const exportUrl = (file: string) => withBase(`/export/${file}`);
export const csvUrl = (table: string) => withBase(`/export/csv/${table}.csv`);
