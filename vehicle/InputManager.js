export class InputManager {
  constructor() {
    this.keys = { forward: false, backward: false, left: false, right: false, brake: false };
    this.axes = { x: 0, y: 0 };
    addEventListener("keydown", (e) => this.setKey(e, true));
    addEventListener("keyup", (e) => this.setKey(e, false));
    addEventListener("blur", () => this.reset());
    this.bindJoystick();
  }

  setKey(e, value) {
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
    if (key === "left" || key === "right") this.axes.x = (this.keys.right ? 1 : 0) - (this.keys.left ? 1 : 0);
    if (key === "forward" || key === "backward") this.axes.y = (this.keys.backward ? 1 : 0) - (this.keys.forward ? 1 : 0);
  }

  bindJoystick() {
    const pad = document.getElementById("joystick-pad");
    const knob = document.getElementById("joystick-knob");
    if (!pad || !knob) return;

    const state = { active: false, rect: null, pointerId: null };
    const radius = 42;

    const updateFromPoint = (clientX, clientY) => {
      if (!state.rect) state.rect = pad.getBoundingClientRect();
      const cx = state.rect.left + state.rect.width / 2;
      const cy = state.rect.top + state.rect.height / 2;
      let dx = clientX - cx;
      let dy = clientY - cy;
      const len = Math.hypot(dx, dy) || 1;
      const max = radius;
      if (len > max) {
        dx = dx / len * max;
        dy = dy / len * max;
      }
      knob.style.transform = `translate(${dx}px, ${dy}px)`;
      this.axes.x = dx / max;
      this.axes.y = dy / max;
      this.keys.left = this.axes.x < -0.18;
      this.keys.right = this.axes.x > 0.18;
      this.keys.forward = this.axes.y < -0.18;
      this.keys.backward = this.axes.y > 0.18;
      pad.classList.add("is-active");
    };

    const release = () => {
      state.active = false;
      state.pointerId = null;
      state.rect = null;
      knob.style.transform = "translate(0px, 0px)";
      pad.classList.remove("is-active");
      this.axes.x = 0;
      this.axes.y = 0;
      this.keys.forward = this.keys.backward = this.keys.left = this.keys.right = false;
    };

    pad.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      state.active = true;
      state.pointerId = e.pointerId;
      state.rect = pad.getBoundingClientRect();
      pad.setPointerCapture?.(e.pointerId);
      updateFromPoint(e.clientX, e.clientY);
    });

    pad.addEventListener("pointermove", (e) => {
      if (!state.active || state.pointerId !== e.pointerId) return;
      e.preventDefault();
      updateFromPoint(e.clientX, e.clientY);
    });

    ["pointerup", "pointercancel", "lostpointercapture"].forEach((name) => {
      pad.addEventListener(name, (e) => {
        if (state.pointerId !== null && e.pointerId !== state.pointerId) return;
        release();
      });
    });

    pad.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  reset() {
    for (const key in this.keys) this.keys[key] = false;
    this.axes.x = 0;
    this.axes.y = 0;
    const knob = document.getElementById("joystick-knob");
    const pad = document.getElementById("joystick-pad");
    if (knob) knob.style.transform = "translate(0px, 0px)";
    if (pad) pad.classList.remove("is-active");
  }
}
