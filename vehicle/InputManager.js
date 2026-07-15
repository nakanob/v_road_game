export class InputManager {
  constructor() {
    this.keys = { forward: false, backward: false, left: false, right: false, brake: false };
    addEventListener("keydown", (e) => this.set(e, true));
    addEventListener("keyup", (e) => this.set(e, false));
    addEventListener("blur", () => this.reset());
    this.bindVirtualJoystick();
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

  bindVirtualJoystick() {
    const stick = document.getElementById("virtual-joystick");
    const knob = document.getElementById("virtual-knob");
    if (!stick || !knob) return;

    const radius = 42;
    let pointerId = null;

    const apply = (dx, dy) => {
      const len = Math.hypot(dx, dy) || 1;
      const clamped = Math.min(len, radius);
      const nx = (dx / len) * clamped;
      const ny = (dy / len) * clamped;
      knob.style.transform = `translate(${nx}px, ${ny}px)`;

      const sx = nx / radius;
      const sy = ny / radius;
      const dead = 0.18;
      this.keys.left = sx < -dead;
      this.keys.right = sx > dead;
      this.keys.forward = sy < -dead;
      this.keys.backward = sy > dead;
      this.keys.brake = false;
      stick.classList.toggle("is-active", clamped > 2);
    };

    const release = () => {
      pointerId = null;
      knob.style.transform = "translate(0px, 0px)";
      stick.classList.remove("is-active");
      this.keys.forward = false;
      this.keys.backward = false;
      this.keys.left = false;
      this.keys.right = false;
    };

    const move = (e) => {
      if (pointerId !== e.pointerId) return;
      const rect = stick.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      apply(e.clientX - cx, e.clientY - cy);
    };

    stick.addEventListener("pointerdown", (e) => {
      pointerId = e.pointerId;
      stick.setPointerCapture?.(e.pointerId);
      move(e);
      e.preventDefault();
    });
    stick.addEventListener("pointermove", move);
    stick.addEventListener("pointerup", release);
    stick.addEventListener("pointercancel", release);
    stick.addEventListener("lostpointercapture", release);
    stick.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  reset() {
    for (const k in this.keys) this.keys[k] = false;
    const stick = document.getElementById("virtual-joystick");
    const knob = document.getElementById("virtual-knob");
    if (stick) stick.classList.remove("is-active");
    if (knob) knob.style.transform = "translate(0px, 0px)";
  }
}
