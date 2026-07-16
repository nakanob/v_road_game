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
    const pad = document.getElementById("joystick-pad");
    const knob = document.getElementById("joystick-knob");
    if (!pad || !knob) return;

    let pointerId = null;
    const maxDistance = 42;

    const update = (clientX, clientY) => {
      const rect = pad.getBoundingClientRect();
      const centerX = rect.left + rect.width * 0.5;
      const centerY = rect.top + rect.height * 0.5;
      let x = clientX - centerX;
      let y = clientY - centerY;
      const distance = Math.hypot(x, y);

      if (distance > maxDistance) {
        x = x / distance * maxDistance;
        y = y / distance * maxDistance;
      }

      knob.style.transform = `translate(${x}px, ${y}px)`;
      this.keys.left = x < -8;
      this.keys.right = x > 8;
      this.keys.forward = y < -8;
      this.keys.backward = y > 8;
      pad.classList.add("is-active");
    };

    const release = () => {
      pointerId = null;
      knob.style.transform = "translate(0px, 0px)";
      pad.classList.remove("is-active");
      this.keys.forward = false;
      this.keys.backward = false;
      this.keys.left = false;
      this.keys.right = false;
    };

    pad.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      pointerId = e.pointerId;
      pad.setPointerCapture?.(e.pointerId);
      update(e.clientX, e.clientY);
    });

    pad.addEventListener("pointermove", (e) => {
      if (e.pointerId !== pointerId) return;
      e.preventDefault();
      update(e.clientX, e.clientY);
    });

    for (const eventName of ["pointerup", "pointercancel", "lostpointercapture"]) {
      pad.addEventListener(eventName, (e) => {
        if (pointerId !== null && e.pointerId !== pointerId) return;
        release();
      });
    }

    pad.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  reset() {
    for (const key in this.keys) this.keys[key] = false;
    const knob = document.getElementById("joystick-knob");
    const pad = document.getElementById("joystick-pad");
    if (knob) knob.style.transform = "translate(0px, 0px)";
    if (pad) pad.classList.remove("is-active");
  }
}
