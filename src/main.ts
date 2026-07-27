import "./styles.css";
import { TeetertownApp } from "./app/teetertownApp";
import {
  prepareServiceWorkerRelease,
  recoverServiceWorkerRelease
} from "./platform/serviceWorkerLifecycle";
import { LAB_ENABLED, RELEASE_ID } from "./simulation/version";

const root = document.querySelector<HTMLElement>("#app");
if (root === null) {
  throw new Error("Missing #app root.");
}
const rootElement = root;

let app: TeetertownApp | null = null;

function showFatal(error: unknown): void {
  const message = error instanceof Error ? error.message : "Unknown boot failure";
  rootElement.innerHTML = `
    <main class="fatal-card">
      <p class="eyebrow">Physics trust stop</p>
      <h1>Teetertown could not start</h1>
      <p data-fatal-message></p>
      <button type="button" data-recover-release>Recover cached release</button>
    </main>
  `;
  rootElement
    .querySelector<HTMLElement>("[data-fatal-message]")
    ?.append(document.createTextNode(message));
  rootElement
    .querySelector<HTMLButtonElement>("[data-recover-release]")
    ?.addEventListener("click", () => {
      void recoverServiceWorkerRelease();
    });
}

async function boot(): Promise<void> {
  if (import.meta.env.PROD && !LAB_ENABLED) {
    const preparation = await prepareServiceWorkerRelease(RELEASE_ID);
    if (preparation === "reloading") {
      return;
    }
  }
  app = new TeetertownApp(rootElement);
  await app.start();
}

void boot().catch(showFatal);

if (import.meta.hot !== undefined) {
  import.meta.hot.dispose(() => {
    app?.dispose();
  });
}
