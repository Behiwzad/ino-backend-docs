import { createHighlighter, type Highlighter } from "shiki";

let hl: Promise<Highlighter> | null = null;
function get() {
  hl ??= createHighlighter({ themes: ["github-light", "github-dark-dimmed"], langs: ["sql", "prisma", "typescript", "json", "php", "bash"] });
  return hl;
}

export async function highlight(code: string, lang: string) {
  const h = await get();
  const l = ["sql", "prisma", "typescript", "json", "php", "bash"].includes(lang) ? lang : "text";
  return h.codeToHtml(code, { lang: l, themes: { light: "github-light", dark: "github-dark-dimmed" }, defaultColor: "light" });
}
