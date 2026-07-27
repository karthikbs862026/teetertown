import { rm } from "node:fs/promises";
import { resolve } from "node:path";
import { spawn } from "node:child_process";

const fixtureRoot = resolve(".pwa-fixtures");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

async function runBuild(releaseId: string, outputDirectory: string): Promise<void> {
  await new Promise<void>((resolveRun, reject) => {
    const child = spawn(npmCommand, ["run", "build:client"], {
      stdio: "inherit",
      env: {
        ...process.env,
        TEETERTOWN_RELEASE_ID: releaseId,
        TEETERTOWN_OUT_DIR: outputDirectory
      }
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolveRun();
      } else {
        reject(new Error(`PWA fixture build ${releaseId} exited with code ${String(code)}.`));
      }
    });
  });
}

await rm(fixtureRoot, { recursive: true, force: true });
await runBuild("pwa-fixture-v1", resolve(fixtureRoot, "v1"));
await runBuild("pwa-fixture-v2", resolve(fixtureRoot, "v2"));
