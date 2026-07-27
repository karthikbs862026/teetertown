import type { InputModel } from "../simulation/types";

export interface PointerInputSample {
  readonly x: number;
  readonly z: number;
  readonly active: boolean;
  readonly sequence: number;
  readonly ageMilliseconds: number;
}

export class PointerInputOwner {
  readonly #element: HTMLElement;
  #model: InputModel;
  #activePointer: number | null = null;
  #originX = 0;
  #originY = 0;
  #x = 0;
  #z = 0;
  #sequence = 0;
  #lastEventTime = performance.now();

  public constructor(element: HTMLElement, model: InputModel) {
    this.#element = element;
    this.#model = model;
    element.style.touchAction = "none";
    element.addEventListener("pointerdown", this.#onPointerDown);
    element.addEventListener("pointermove", this.#onPointerMove);
    element.addEventListener("pointerup", this.#onPointerEnd);
    element.addEventListener("pointercancel", this.#onPointerEnd);
    element.addEventListener("lostpointercapture", this.#onLostCapture);
  }

  public setModel(model: InputModel): void {
    this.#model = model;
    this.release();
  }

  public sample(): PointerInputSample {
    return {
      x: this.#x,
      z: this.#model.startsWith("one_axis") ? 0 : this.#z,
      active: this.#activePointer !== null,
      sequence: this.#sequence,
      ageMilliseconds: performance.now() - this.#lastEventTime
    };
  }

  public release(): void {
    if (this.#activePointer !== null && this.#element.hasPointerCapture(this.#activePointer)) {
      this.#element.releasePointerCapture(this.#activePointer);
    }
    this.#activePointer = null;
    this.#x = 0;
    this.#z = 0;
  }

  public dispose(): void {
    this.release();
    this.#element.removeEventListener("pointerdown", this.#onPointerDown);
    this.#element.removeEventListener("pointermove", this.#onPointerMove);
    this.#element.removeEventListener("pointerup", this.#onPointerEnd);
    this.#element.removeEventListener("pointercancel", this.#onPointerEnd);
    this.#element.removeEventListener("lostpointercapture", this.#onLostCapture);
  }

  readonly #onPointerDown = (event: PointerEvent): void => {
    if (this.#activePointer !== null) {
      return;
    }
    this.#activePointer = event.pointerId;
    this.#originX = event.clientX;
    this.#originY = event.clientY;
    this.#element.setPointerCapture(event.pointerId);
    this.#update(event);
  };

  readonly #onPointerMove = (event: PointerEvent): void => {
    if (event.pointerId === this.#activePointer) {
      this.#update(event);
    }
  };

  readonly #onPointerEnd = (event: PointerEvent): void => {
    if (event.pointerId !== this.#activePointer) {
      return;
    }
    this.release();
    this.#sequence += 1;
    this.#lastEventTime = performance.now();
  };

  readonly #onLostCapture = (): void => {
    this.#activePointer = null;
    this.#x = 0;
    this.#z = 0;
  };

  #update(event: PointerEvent): void {
    const bounds = this.#element.getBoundingClientRect();
    const track = this.#model.endsWith("_track");
    const centerX = track ? this.#originX : bounds.left + bounds.width * 0.5;
    const centerY = track ? this.#originY : bounds.top + bounds.height * 0.5;
    const radius = Math.max(48, Math.min(bounds.width, bounds.height) * 0.32);
    this.#x = Math.max(-1, Math.min(1, (event.clientX - centerX) / radius));
    this.#z = Math.max(-1, Math.min(1, (event.clientY - centerY) / radius));
    this.#sequence += 1;
    this.#lastEventTime = performance.now();
  }
}
