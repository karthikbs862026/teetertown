import "./styles.css";
import { TeetertownApp } from "./app/teetertownApp";
import { LAB_ENABLED } from "./simulation/version";

const root = document.querySelector<HTMLElement>("#app");
if (root === null) {
  throw new Error("Missing #app root.");
}

const app = new TeetertownApp(root);
void app.start().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown boot failure";
  root.innerHTML = `
    <main class="fatal-card">
      <p class="eyebrow">Physics trust stop</p>
      <h1>Teetertown could not start</h1>
      <p>${message}</p>
    </main>
  `;
});

if (import.meta.hot !== undefined) {
  import.meta.hot.dispose(() => {
    app.dispose();
  });
}

if (import.meta.env.PROD && !LAB_ENABLED && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/sw.js");
  });
}
