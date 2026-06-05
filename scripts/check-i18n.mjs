#!/usr/bin/env node
/**
 * i18n parity check — alerte si une clé existe dans une langue mais pas les autres.
 * Usage : npm run check:i18n
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "..", "src", "i18n", "locales");
const langs = ["fr", "en", "es"];

function flatten(obj, prefix = "", out = {}) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) flatten(v, key, out);
    else out[key] = true;
  }
  return out;
}

const data = {};
for (const l of langs) {
  data[l] = flatten(JSON.parse(fs.readFileSync(path.join(dir, `${l}.json`), "utf8")));
}

const allKeys = new Set();
for (const l of langs) for (const k of Object.keys(data[l])) allKeys.add(k);

let problems = 0;
for (const k of [...allKeys].sort()) {
  const missing = langs.filter((l) => !data[l][k]);
  if (missing.length) {
    problems++;
    console.log(`  manquant en [${missing.join(", ")}] : ${k}`);
  }
}

console.log("");
for (const l of langs) console.log(`  ${l}: ${Object.keys(data[l]).length} cles`);
if (problems === 0) {
  console.log("\nOK - parite parfaite entre FR/EN/ES.");
} else {
  console.log(`\n${problems} cle(s) non synchronisee(s) entre les 3 langues.`);
  process.exit(1);
}
