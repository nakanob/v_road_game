import * as THREE from "three";

export class CameraController {
  constructor(game, vehicle) {
    this.game = game;
    this.camera = game.camera;
    this.vehicle = vehicle;
    this.yawOffset = 0;
    this.pitch = 0.28;
    this.distance = 16;
    this.dragging = false;
    this.last = { x: 0, y: 0 };
    this.position = new THREE.Vector3();
    this.target = new THREE.Vector3();
    this.smoothedAnchor = new THREE.Vector3();
    this.smoothedTarget = new THREE.Vector3();
    this.smoothedRoadYaw = 0;

    const el = game.renderer.domElement;
    el.addEventListener("pointerdown", (e) => {
      this.dragging = true;
      this.last = { x: e.clientX, y: e.clientY };
      el.setPointerCapture(e.pointerId);
    });
    el.addEventListener("pointermove", (e) => {
      if (!this.dragging) return;
      this.yawOffset -= (e.clientX - this.last.x) * 0.0055;
      this.pitch = THREE.MathUtils.clamp(this.pitch + (e.clientY - this.last.y) * 0.0035, 0.06, 0.78);
      this.last = { x: e.clientX, y: e.clientY };
    });
    el.addEventListener("pointerup", () => { this.dragging = false; });
    el.addEventListener("pointercancel", () => { this.dragging = false; });
    el.addEventListener("wheel", (e) => {
      e.preventDefault();
      this.distance = THREE.MathUtils.clamp(this.distance + e.deltaY * 0.011, 9, 28);
    }, { passive: false });
    addEventListener("keydown", (e) => { if (e.code === "KeyC") this.reset(); });

    this.reset(true);
  }

  update(delta) {
    const pose = this.vehicle.world.getPose(this.vehicle.progress, this.vehicle.laneOffset);
    const vehicleYaw = this.vehicle.root.rotation.y;
    this.smoothedRoadYaw = this.dampAngle(this.smoothedRoadYaw, vehicleYaw, 2.8, delta);

    const anchorTarget = this.vehicle.root.position.clone();
    anchorTarget.y += 1.45;
    const followK = 1 - Math.exp(-delta * 4.0);
    this.smoothedAnchor.lerp(anchorTarget, followK);

    const yaw = this.smoothedRoadYaw + Math.PI + this.yawOffset;
    const horizontal = Math.cos(this.pitch) * this.distance;
    const desired = this.smoothedAnchor.clone().add(new THREE.Vector3(
      Math.sin(yaw) * horizontal,
      Math.sin(this.pitch) * this.distance + 1.9,
      Math.cos(yaw) * horizontal
    ));

    const cameraK = 1 - Math.exp(-delta * 4.2);
    this.position.lerp(desired, cameraK);
    this.camera.position.copy(this.position);

    const lookDirection = new THREE.Vector3(
      Math.sin(this.smoothedRoadYaw),
      0,
      Math.cos(this.smoothedRoadYaw)
    );
    const lookAhead = lookDirection.multiplyScalar(this.vehicle.finished ? 0 : 4.0);
    const desiredTarget = this.smoothedAnchor.clone().add(lookAhead);
    desiredTarget.y += 0.50;
    this.smoothedTarget.lerp(desiredTarget, 1 - Math.exp(-delta * 5.0));
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
    this.pitch = 0.28;
    this.distance = 16;
    const yaw = this.vehicle.root.rotation.y;
    this.smoothedRoadYaw = yaw;
    this.smoothedAnchor.copy(this.vehicle.root.position).add(new THREE.Vector3(0, 1.45, 0));
    this.smoothedTarget.copy(this.smoothedAnchor);
    if (immediate) {
      this.position.copy(this.smoothedAnchor).add(new THREE.Vector3(-Math.sin(yaw) * 16, 7.4, -Math.cos(yaw) * 16));
      this.camera.position.copy(this.position);
    }
  }
}
