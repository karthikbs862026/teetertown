import { readdir, readFile } from "node:fs/promises";
import { dirname, extname, join, normalize, relative, resolve } from "node:path";

async function filesBelow(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? filesBelow(path) : [path];
    })
  );
  return nested.flat().filter((path) => path.endsWith(".ts"));
}

const root = resolve("src");
const files = await filesBelow(root);
const known = new Set(files.map((path) => normalize(path)));
const graph = new Map<string, string[]>();
const importPattern = /(?:from\s+|import\()\s*["'](\.[^"']+)["']/g;

for (const file of files) {
  const source = await readFile(file, "utf8");
  const dependencies: string[] = [];
  for (const match of source.matchAll(importPattern)) {
    const specifier = match[1];
    if (specifier === undefined) {
      continue;
    }
    const candidate = resolve(dirname(file), specifier);
    const resolved = extname(candidate) === "" ? `${candidate}.ts` : candidate;
    if (known.has(normalize(resolved))) {
      dependencies.push(normalize(resolved));
    }
  }
  graph.set(normalize(file), dependencies);
}

const visiting = new Set<string>();
const visited = new Set<string>();
const path: string[] = [];

function visit(file: string): void {
  if (visiting.has(file)) {
    const cycleStart = path.indexOf(file);
    const cycle = [...path.slice(cycleStart), file]
      .map((entry) => relative(process.cwd(), entry))
      .join(" -> ");
    throw new Error(`Circular dependency: ${cycle}`);
  }
  if (visited.has(file)) {
    return;
  }
  visiting.add(file);
  path.push(file);
  for (const dependency of graph.get(file) ?? []) {
    visit(dependency);
  }
  path.pop();
  visiting.delete(file);
  visited.add(file);
}

for (const file of files) {
  visit(normalize(file));
}
console.log(`Dependency graph: ${files.length} TypeScript modules, no cycles.`);
