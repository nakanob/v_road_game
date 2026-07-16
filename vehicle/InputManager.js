export class InputManager {
  constructor() {
    this.keys = { forward: false, backward: false, left: false, right: false, brake: false };
    addEventListener("keydown", (e) => this.set(e, true));
    addEventListener("keyup", (e) => this.set(e, false));
    addEventListener("blur", () => this.reset());
    this.bindVirtualPad();
  }

  set(e, value) {
    const map = {
      KeyW: "forward", ArrowUp: "forward",
      KeyS: "backward", ArrowDown: "backward",
      KeyA: "left", ArrowLeft: "left",
      KeyD: "right", ArrowRight: "right",
      Space: "brake"
    };
    const key = map[e.code];
    if (!key) return;
    e.preventDefault();
    this.keys[key] = value;
  }

  bindVirtualPad() {
    document.querySelectorAll("[data-control]").forEach((button) => {
      const key = button.dataset.control;
      const press = (e) => {
        e.preventDefault();
        this.keys[key] = true;
        button.classList.add("is-active");
        button.setPointerCapture?.(e.pointerId);
      };
      const release = (e) => {
        e.preventDefault();
        this.keys[key] = false;
        button.classList.remove("is-active");
      };
      button.addEventListener("pointerdown", press);
      button.addEventListener("pointerup", release);
      button.addEventListener("pointercancel", release);
      button.addEventListener("lostpointercapture", release);
      button.addEventListener("contextmenu", (e) => e.preventDefault());
    });
  }

  reset() {
    for (const k in this.keys) this.keys[k] = false;
    document.querySelectorAll("[data-control]").forEach((button) => button.classList.remove("is-active"));
  }
}
