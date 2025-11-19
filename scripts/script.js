// scripts/list-imports.mjs
import fs from "fs";
import path from "path";

const ROOT = process.argv[2] || "app";
const exts = new Set([".js", ".jsx", ".ts", ".tsx"]);
const files = [];

// Walk recursively
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (exts.has(path.extname(entry.name))) files.push(p);
  }
}
walk(ROOT);

// Simple extractors
const RE_IMPORT  = /\bimport(?:["'\s]*[\w*{}\n\r,$ ]+from\s*)?["']([^"']+)["']/g;     // import ... from 'x'
const RE_REQUIRE = /\brequire\(\s*["']([^"']+)["']\s*\)/g;                             // require('x')
const RE_EXPORT  = /\bexport\s+.*\s+from\s+["']([^"']+)["']/g;                         // export ... from 'x'
const RE_DYNIMP  = /\bimport\(\s*["']([^"']+)["']\s*\)/g;                              // import('x')

// bare module? (not relative/absolute)
const isBare = (s) => s && !s.startsWith(".") && !s.startsWith("/") && !s.startsWith("..");

// normalize subpaths → package roots
function toPackageName(spec) {
  // e.g. '@scope/pkg/sub/path' → '@scope/pkg'
  // e.g. 'pkg/sub/path'       → 'pkg'
  if (spec.startsWith("@")) {
    const [scope, name] = spec.split("/");
    return scope && name ? `${scope}/${name}` : spec;
  }
  return spec.split("/")[0];
}

const found = new Set();

for (const f of files) {
  const code = fs.readFileSync(f, "utf8");
  for (const re of [RE_IMPORT, RE_REQUIRE, RE_EXPORT, RE_DYNIMP]) {
    for (let m; (m = re.exec(code)); ) {
      const spec = m[1];
      if (!isBare(spec)) continue;

      // ignore built-ins and virtuals if any (tiny safety net)
      if (spec.startsWith("node:")) continue;

      // map known subpaths to roots
      let pkg = toPackageName(spec);

      // small normalizations you might want
      if (pkg === "react-native-safe-area-context") pkg = "react-native-safe-area-context";
      if (pkg === "expo-router") pkg = "expo-router";

      found.add(pkg);
    }
  }
}

const list = Array.from(found).sort();
for (const p of list) console.log(p);

// also write to a file
fs.writeFileSync("imports.txt", list.join("\n"));
console.error(`Wrote ${list.length} packages to imports.txt`);
