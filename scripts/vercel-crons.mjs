import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const vercelPath = resolve(root, "vercel.json");
const configPath = resolve(root, ".vercel/output/config.json");
const pgliteSrc = resolve(root, "node_modules/@electric-sql/pglite/dist");
const pgliteDest = resolve(root, ".vercel/output/functions/__server.func/_libs");

if (existsSync(pgliteSrc) && existsSync(pgliteDest)) {
  for (const name of ["pglite.data", "pglite.wasm", "initdb.wasm"]) {
    const src = resolve(pgliteSrc, name);
    if (existsSync(src)) copyFileSync(src, resolve(pgliteDest, name));
  }
}

if (!existsSync(vercelPath) || !existsSync(configPath)) process.exit(0);

const vercel = JSON.parse(readFileSync(vercelPath, "utf8"));
if (!Array.isArray(vercel.crons) || vercel.crons.length === 0) process.exit(0);

const config = JSON.parse(readFileSync(configPath, "utf8"));
config.crons = vercel.crons;
writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n");
console.log(
  `[vercel-crons] injected ${vercel.crons.length} cron(s) into .vercel/output/config.json`,
);
