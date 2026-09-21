import { copyFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const pgliteSrc = resolve(root, "node_modules/@electric-sql/pglite/dist");
const pgliteDest = resolve(root, ".vercel/output/functions/__server.func/_libs");

if (existsSync(pgliteSrc) && existsSync(pgliteDest)) {
  for (const name of ["pglite.data", "pglite.wasm", "initdb.wasm"]) {
    const src = resolve(pgliteSrc, name);
    if (existsSync(src)) copyFileSync(src, resolve(pgliteDest, name));
  }
}

// Crons stay in vercel.json only. Injecting the same jobs into
// .vercel/output/config.json duplicates them and fails the deploy.
