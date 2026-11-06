/* Tiny syntax highlighter (≈2 KB) — replaces shiki. Produces <span class="tk-*"> tokens + one .ln per line. */

export type Lang = "sql" | "prisma" | "typescript" | "json" | "php" | "shell" | "text";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const SQL_KW = "select|from|where|insert|into|values|update|set|delete|create|table|type|as|enum|alter|add|constraint|primary|key|foreign|references|on|cascade|restrict|null|not|default|unique|index|check|comment|is|begin|commit|exists|if|extension|using|exclude|with|and|or|in|between|generated|always|identity|overriding|system|value|sequence|start|column|engine|charset|collate|auto_increment|true|false|join|left|group|by|order|limit|returning";
const SQL_TYPE = "bigint|integer|int|smallint|varchar|text|boolean|timestamptz|timestamp|date|time|numeric|decimal|jsonb|json|inet|tinyint|datetime|tstzrange|gist";
const TS_KW = "import|export|from|const|let|var|function|return|type|interface|extends|as|new|if|else|for|of|in|true|false|null|undefined|typeof|keyof|readonly|satisfies|async|await|default";
const TS_TYPE = "string|number|boolean|unknown|Record|any|void|never";
const PRISMA_KW = "model|enum|generator|datasource|true|false";
const PRISMA_TYPE = "String|Int|BigInt|Boolean|DateTime|Decimal|Json|Float|Bytes";
const PHP_KW = "use|return|new|class|extends|public|function|void|true|false|null";

type Rule = [RegExp, string | null];

function rules(lang: Lang): Rule[] {
  const word = (list: string, cls: string, flags = ""): Rule => [new RegExp(`\\b(?:${list})\\b`, "y" + flags), cls];
  const common: Rule[] = [
    [/\s+/y, null],
    [/"(?:\\.|[^"\\])*"/y, "tk-str"],
  ];
  switch (lang) {
    case "sql":
      return [
        [/--[^\n]*/y, "tk-com"], [/\/\*[\s\S]*?\*\//y, "tk-com"], ...common,
        [/'(?:''|[^'])*'/y, "tk-str"], [/`[^`]*`/y, "tk-key"],
        word(SQL_TYPE, "tk-type", "i"), word(SQL_KW, "tk-kw", "i"),
        [/\b\d+(?:\.\d+)?\b/y, "tk-num"], [/\b[a-z_]\w*(?=\()/iy, "tk-fn"], [/[(),;.=<>*+\-:&|~]+/y, "tk-punc"], [/\w+/y, null], [/./y, null],
      ];
    case "prisma":
      return [
        [/\/\/\/[^\n]*/y, "tk-com"], [/\/\/[^\n]*/y, "tk-com"], ...common,
        [/@@?\w+(?:\.\w+)?/y, "tk-attr"], word(PRISMA_KW, "tk-kw"), word(PRISMA_TYPE, "tk-type"),
        [/\b[A-Z]\w*/y, "tk-type"], [/\b\d+\b/y, "tk-num"], [/[{}()[\],:?=.]+/y, "tk-punc"], [/\w+/y, null], [/./y, null],
      ];
    case "typescript":
    case "php":
      return [
        [/\/\*[\s\S]*?\*\//y, "tk-com"], [/\/\/[^\n]*/y, "tk-com"], ...(lang === "php" ? ([[/#[^\n]*/y, "tk-com"]] as Rule[]) : []), ...common,
        [/'(?:\\.|[^'\\])*'/y, "tk-str"], [/`(?:\\.|[^`\\])*`/y, "tk-str"],
        [/\$\w+/y, "tk-key"], word(lang === "php" ? PHP_KW : TS_KW, "tk-kw"), word(TS_TYPE, "tk-type"),
        [/\b[A-Z]\w*/y, "tk-type"], [/\b\d+(?:\.\d+)?\b/y, "tk-num"], [/\b[a-z_]\w*(?=\s*\()/iy, "tk-fn"],
        [/\b[a-z_]\w*(?=\??:)/iy, "tk-key"], [/[{}()[\],;:?=.<>|&!+\-*\/>]+/y, "tk-punc"], [/\w+/y, null], [/./y, null],
      ];
    case "json":
      return [
        [/\s+/y, null], [/"(?:\\.|[^"\\])*"(?=\s*:)/y, "tk-key"], [/"(?:\\.|[^"\\])*"/y, "tk-str"],
        [/\b(?:true|false|null)\b/y, "tk-kw"], [/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/iy, "tk-num"], [/[{}[\],:]/y, "tk-punc"], [/./y, null],
      ];
    case "shell":
      return [
        [/#[^\n]*/y, "tk-com"], ...common, [/'[^']*'/y, "tk-str"], [/\$\w+/y, "tk-key"],
        [/(?<=^|\n|\|\s?|&&\s?)[a-z][\w-]*/y, "tk-fn"], [/\s-{1,2}[\w-]+/y, "tk-attr"], [/https?:\/\/\S+/y, "tk-str"],
        [/[|&;<>]+/y, "tk-punc"], [/\S+/y, null],
      ];
    default:
      return [[/[\s\S]+/y, null]];
  }
}

const cache = new Map<string, string>();

export function highlight(code: string, lang: Lang): string {
  const key = lang + "\u0000" + code;
  const hit = cache.get(key);
  if (hit) return hit;
  const rs = rules(lang);
  let out = "";
  let i = 0;
  while (i < code.length) {
    let matched = false;
    for (const [re, cls] of rs) {
      re.lastIndex = i;
      const m = re.exec(code);
      if (m && m[0].length) {
        const t = esc(m[0]);
        // wrap each line of a multi-line token separately so line splitting never breaks a span
        out += cls ? t.split("\n").map((p) => (p ? `<span class="${cls}">${p}</span>` : "")).join("\n") : t;
        i += m[0].length;
        matched = true;
        break;
      }
    }
    if (!matched) { out += esc(code[i]); i++; }
  }
  // one numbered line per source line
  const html = out
    .split("\n")
    .map((l) => `<span class="ln">${l || " "}</span>`)
    .join("");
  if (cache.size > 40) cache.clear();
  cache.set(key, html);
  return html;
}

export function langOf(file: string): Lang {
  if (file.endsWith(".sql")) return "sql";
  if (file.endsWith(".prisma")) return "prisma";
  if (file.endsWith(".json")) return "json";
  if (file.endsWith(".php")) return "php";
  if (file.endsWith(".ts")) return "typescript";
  return "text";
}
