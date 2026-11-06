#!/usr/bin/env node
/**
 * Auto-deploy: commit + push every change so GitHub Pages rebuilds the live site.
 *
 *   node scripts/auto-deploy.mjs           one-shot (npm run deploy)
 *   node scripts/auto-deploy.mjs --watch   push a few seconds after you stop saving (npm run deploy:watch)
 *   node scripts/auto-deploy.mjs --hook    used by the Claude Code Stop hook (prints a JSON status message)
 *   --no-check                             skip the TypeScript check before pushing
 *
 * Safety: nothing is pushed if `tsc --noEmit` fails, so a broken edit never replaces the live site.
 */
import { execFileSync } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, rmSync, watch } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = new Set(process.argv.slice(2));
const HOOK = args.has("--hook");
const CHECK = !args.has("--no-check");
const LOCK = join(ROOT, ".git", "auto-deploy.lock");
const LOG = join(ROOT, ".auto-deploy.log");
const IGNORE = /^(node_modules|\.next|out|\.git)([\\/]|$)|\.auto-deploy\.log$|\.tsbuildinfo$/;

const git = (...a) => execFileSync("git", a, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout: 120_000 }).trim();
const log = (msg) => {
  const line = `[${new Date().toISOString()}] ${msg}`;
  try { appendFileSync(LOG, line + "\n"); } catch {}
  if (!HOOK) console.log(line);
};
const say = (msg) => {
  // Stop-hook output: shown to the user in the Claude Code UI
  if (HOOK) process.stdout.write(JSON.stringify({ systemMessage: msg }) + "\n");
};

function siteUrl() {
  try {
    const m = git("remote", "get-url", "origin").match(/github\.com[/:]([^/]+)\/([^/.]+)/);
    return m ? `https://${m[1].toLowerCase()}.github.io/${m[2]}/` : "";
  } catch { return ""; }
}

function deployOnce() {
  if (!existsSync(join(ROOT, ".git"))) return say("auto-deploy: not a git repo, skipped");
  const changed = git("status", "--porcelain").split("\n").filter(Boolean);
  if (!changed.length) return; // nothing to do — stay silent

  try { mkdirSync(LOCK); } catch { return log("another deploy is running, skipped"); }
  try {
    if (CHECK) {
      try {
        execFileSync(process.execPath, [join(ROOT, "node_modules/typescript/bin/tsc"), "--noEmit"], { cwd: ROOT, stdio: "pipe", timeout: 180_000 });
      } catch (e) {
        const out = String(e.stdout ?? "").split("\n").filter(Boolean).slice(0, 3).join(" | ");
        log(`typecheck failed, NOT pushed: ${out}`);
        return say(`⚠ auto-deploy: TypeScript errors, changes NOT pushed (live site unchanged). ${out}`);
      }
    }
    // porcelain lines look like " M file", "?? file", "R  a -> b" (first line arrives trimmed)
    const files = changed.map((l) => l.replace(/^\s*\S{1,2}\s+/, "").replace(/^"|"$/g, ""));
    const shown = files.slice(0, 4).join(", ") + (files.length > 4 ? ` +${files.length - 4} more` : "");
    git("add", "-A");
    git("commit", "-q", "-m", `auto: update ${shown}`);
    const sha = git("rev-parse", "--short", "HEAD");
    try {
      git("push", "-q", "origin", "HEAD:main");
    } catch {
      // remote moved ahead (e.g. edit on github.com): replay ours on top and retry once
      git("pull", "-q", "--rebase", "origin", "main");
      git("push", "-q", "origin", "HEAD:main");
    }
    log(`pushed ${sha}: ${shown}`);
    say(`✓ auto-deploy: pushed ${sha} (${files.length} file${files.length > 1 ? "s" : ""}). Live in ~1–2 min: ${siteUrl()}`);
  } catch (e) {
    const msg = String(e.stderr || e.message).split("\n")[0];
    log(`deploy failed: ${msg}`);
    say(`⚠ auto-deploy failed: ${msg}`);
  } finally {
    rmSync(LOCK, { recursive: true, force: true });
  }
}

if (args.has("--watch")) {
  let timer = null;
  log(`watching ${ROOT} — saves are pushed after 8s of quiet. Ctrl+C to stop.`);
  watch(ROOT, { recursive: true }, (_, file) => {
    if (!file || IGNORE.test(file)) return;
    clearTimeout(timer);
    timer = setTimeout(deployOnce, 8000);
  });
} else {
  deployOnce();
}
