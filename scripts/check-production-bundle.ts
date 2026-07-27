import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

async function filesBelow(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? filesBelow(path) : [path];
    })
  );
  return nested.flat();
}

const forbiddenMarkers = [
  "joint-limit-reversal",
  "intentional_mesh_collider_mismatch_fixture",
  "Collider mismatch is magenta",
  "Two-axis track",
  "data-lab",
  "Export diagnostics"
];
const violations: string[] = [];
for (const file of await filesBelow("dist")) {
  if (!file.endsWith(".js") && !file.endsWith(".html") && !file.endsWith(".json")) {
    continue;
  }
  const source = await readFile(file, "utf8");
  for (const marker of forbiddenMarkers) {
    if (source.includes(marker)) {
      violations.push(`${file}: ${marker}`);
    }
  }
}
if (violations.length > 0) {
  throw new Error(`Production bundle contains laboratory markers:\n${violations.join("\n")}`);
}
console.log("Production bundle: no adversarial fixture data or internal control markers.");
