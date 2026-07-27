import type { BufferGeometry, Material, Object3D, Texture, WebGLRenderTarget } from "three";

export interface RenderResourceCounts {
  readonly geometries: number;
  readonly materials: number;
  readonly textures: number;
  readonly renderTargets: number;
  readonly listeners: number;
}

export class LevelResourceScope {
  readonly #geometries = new Set<BufferGeometry>();
  readonly #materials = new Set<Material>();
  readonly #textures = new Set<Texture>();
  readonly #renderTargets = new Set<WebGLRenderTarget>();
  readonly #listenerDisposers: (() => void)[] = [];
  #disposed = false;

  public geometry<T extends BufferGeometry>(value: T): T {
    this.#assertOpen();
    this.#geometries.add(value);
    return value;
  }

  public material<T extends Material>(value: T): T {
    this.#assertOpen();
    this.#materials.add(value);
    return value;
  }

  public texture<T extends Texture>(value: T): T {
    this.#assertOpen();
    this.#textures.add(value);
    return value;
  }

  public renderTarget<T extends WebGLRenderTarget>(value: T): T {
    this.#assertOpen();
    this.#renderTargets.add(value);
    return value;
  }

  public listen(
    target: EventTarget,
    type: string,
    listener: EventListener,
    options?: AddEventListenerOptions
  ): void {
    this.#assertOpen();
    target.addEventListener(type, listener, options);
    this.#listenerDisposers.push(() => {
      target.removeEventListener(type, listener, options);
    });
  }

  public counts(): RenderResourceCounts {
    return {
      geometries: this.#geometries.size,
      materials: this.#materials.size,
      textures: this.#textures.size,
      renderTargets: this.#renderTargets.size,
      listeners: this.#listenerDisposers.length
    };
  }

  public dispose(root?: Object3D): void {
    if (this.#disposed) {
      return;
    }
    for (const disposeListener of this.#listenerDisposers.reverse()) {
      disposeListener();
    }
    for (const target of this.#renderTargets) {
      target.dispose();
    }
    for (const texture of this.#textures) {
      texture.dispose();
    }
    for (const material of this.#materials) {
      material.dispose();
    }
    for (const geometry of this.#geometries) {
      geometry.dispose();
    }
    root?.clear();
    this.#listenerDisposers.length = 0;
    this.#renderTargets.clear();
    this.#textures.clear();
    this.#materials.clear();
    this.#geometries.clear();
    this.#disposed = true;
  }

  #assertOpen(): void {
    if (this.#disposed) {
      throw new Error("Level resource scope is disposed.");
    }
  }
}
