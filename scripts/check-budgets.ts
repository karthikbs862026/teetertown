import { gzipSync } from "node:zlib";
import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";

const MAXIMUM_CHUNK_GZIP_BYTES = 650 * 1024;
const MAXIMUM_TOTAL_GZIP_BYTES = 6 * 1024 * 1024;

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

await stat("dist");
const files = await filesBelow("dist");
let totalGzip = 0;
const oversizedChunks: string[] = [];
for (const file of files) {
  const bytes = await readFile(file);
  const gzipBytes = gzipSync(bytes, { level: 9 }).byteLength;
  totalGzip += gzipBytes;
  console.log(
    `${relative("dist", file)}: ${(bytes.byteLength / 1024).toFixed(1)} KiB raw, ${(gzipBytes / 1024).toFixed(1)} KiB gzip`
  );
  if (file.endsWith(".js") && gzipBytes > MAXIMUM_CHUNK_GZIP_BYTES) {
    oversizedChunks.push(file);
  }
}
console.log(`Total gzip: ${(totalGzip / 1024 / 1024).toFixed(2)} MiB`);
if (oversizedChunks.length > 0 || totalGzip > MAXIMUM_TOTAL_GZIP_BYTES) {
  throw new Error(
    [
      oversizedChunks.length > 0
        ? `JavaScript chunks above 650 KiB gzip: ${oversizedChunks.join(", ")}`
        : null,
      totalGzip > MAXIMUM_TOTAL_GZIP_BYTES ? "First-load output exceeds 6 MiB gzip." : null
    ]
      .filter((line) => line !== null)
      .join("\n")
  );
}
