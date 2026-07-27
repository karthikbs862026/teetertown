import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

async function filesBelow(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? filesBelow(path) : [path];
    })
  );
  return files.flat().filter((path) => path.endsWith(".ts"));
}

const forbidden = [
  /from\s+["']three["']/,
  /from\s+["']\.\.\/(?:rendering|ui|platform|analytics|meta|app)\//,
  /\bdocument\./,
  /\bwindow\./,
  /\bHTMLElement\b/,
  /\bWebGL/
];

const violations: string[] = [];
for (const path of await filesBelow("src/simulation")) {
  const source = await readFile(path, "utf8");
  for (const pattern of forbidden) {
    if (pattern.test(source)) {
      violations.push(`${path}: ${pattern.source}`);
    }
  }
}

if (violations.length > 0) {
  throw new Error(`Simulation boundary violations:\n${violations.join("\n")}`);
}
console.log("Simulation boundary: no Three.js, DOM, UI, platform, or analytics dependency.");
