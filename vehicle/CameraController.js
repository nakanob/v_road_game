import * as THREE from "three";

export class CameraController {
  constructor(game, vehicle) {
    this.game = game;
    this.camera = game.camera;
    this.vehicle = vehicle;
    this.yawOffset = 0;
    this.pitch = 0.26;
    this.distance = 15;
    this.dragging = false;
    this.last = { x: 0, y: 0 };
    this.position = new THREE.Vector3();
    this.smoothedAnchor = new THREE.Vector3();
    this.smoothedTarget = new THREE.Vector3();
    this.smoothedYaw = 0;

    const el = game.renderer.domElement;
    el.addEventListener("pointerdown", (e) => {
      this.dragging = true;
      this.last = { x: e.clientX, y: e.clientY };
      el.setPointerCapture?.(e.pointerId);
    });
    el.addEventListener("pointermove", (e) => {
      if (!this.dragging) return;
      this.yawOffset -= (e.clientX - this.last.x) * 0.0055;
      this.pitch = THREE.MathUtils.clamp(this.pitch + (e.clientY - this.last.y) * 0.0032, 0.06, 0.8);
      this.last = { x: e.clientX, y: e.clientY };
    });
    ["pointerup", "pointercancel", "lostpointercapture"].forEach((name) => el.addEventListener(name, () => this.dragging = false));
    el.addEventListener("wheel", (e) => {
      e.preventDefault();
      this.distance = THREE.MathUtils.clamp(this.distance + e.deltaY * 0.011, 9, 28);
    }, { passive: false });
    addEventListener("keydown", (e) => { if (e.code === "KeyC") this.reset(); });

    this.reset(true);
  }

  update(delta) {
    const anchor = this.vehicle.root.position.clone();
    anchor.y += 1.55;
    this.smoothedAnchor.lerp(anchor, 1 - Math.exp(-delta * 3.4));
    this.smoothedYaw = this.dampAngle(this.smoothedYaw, this.vehicle.yaw, 2.2, delta);

    const yaw = this.smoothedYaw + Math.PI + this.yawOffset;
    const horizontal = Math.cos(this.pitch) * this.distance;
    const desiredPos = this.smoothedAnchor.clone().add(new THREE.Vector3(
      Math.sin(yaw) * horizontal,
      Math.sin(this.pitch) * this.distance + 1.7,
      Math.cos(yaw) * horizontal
    ));
    this.position.lerp(desiredPos, 1 - Math.exp(-delta * 3.8));
    this.camera.position.copy(this.position);

    const target = this.smoothedAnchor.clone();
    if (!this.vehicle.finished) {
      target.add(new THREE.Vector3(Math.sin(this.smoothedYaw) * 5.5, 0.4, Math.cos(this.smoothedYaw) * 5.5));
    }
    this.smoothedTarget.lerp(target, 1 - Math.exp(-delta * 4.0));
    this.camera.up.set(0, 1, 0);
    this.camera.lookAt(this.smoothedTarget);
  }

  dampAngle(current, target, lambda, delta) {
    const twoPi = Math.PI * 2;
    let diff = (target - current + Math.PI) % twoPi - Math.PI;
    if (diff < -Math.PI) diff += twoPi;
    return current + diff * (1 - Math.exp(-lambda * delta));
  }

  reset(immediate = false) {
    this.yawOffset = 0;
    this.pitch = 0.26;
    this.distance = 15;
    this.smoothedYaw = this.vehicle.yaw;
    this.smoothedAnchor.copy(this.vehicle.root.position).add(new THREE.Vector3(0, 1.55, 0));
    this.smoothedTarget.copy(this.smoothedAnchor);
    if (immediate) {
      this.position.copy(this.smoothedAnchor).add(new THREE.Vector3(-Math.sin(this.vehicle.yaw) * 15, 7.0, -Math.cos(this.vehicle.yaw) * 15));
      this.camera.position.copy(this.position);
      this.camera.lookAt(this.smoothedTarget);
    }
  }
}
