import * as THREE from "three";
import { InputManager } from "./InputManager.js";
import { TailLampFactory } from "./TailLampFactory.js";

export class Vehicle {
  constructor(game, world) {
    this.game = game;
    this.scene = game.scene;
    this.world = world;
    this.input = new InputManager();

    this.root = new THREE.Group();
    this.bodyPivot = new THREE.Group();
    this.root.add(this.bodyPivot);
    this.scene.add(this.root);

    this.progress = 0.006;
    this.laneOffset = 0;
    this.speed = 0;
    this.maxSpeed = 27;
    this.maxReverse = 5;
    this.acceleration = 9.5;
    this.brakePower = 17;
    this.drag = 3.8;
    this.steer = 0;
    this.finished = false;

    this.dimensions = new THREE.Vector3(2.35, 2.65, 5.15);
    this.headLights = [];
    this.tailLights = [];
    this.tailLampShape = "bar";

    this.createCamper();
    this.createLights();
    this.placeAtProgress(1, true);
  }

  createCamper() {
    const camper = new THREE.Group();
    camper.name = "lightweight-camper";

    const white = new THREE.MeshStandardMaterial({ color: 0xf4f4f0, roughness: 0.58, metalness: 0.05 });
    const white2 = new THREE.MeshStandardMaterial({ color: 0xdedfdc, roughness: 0.66, metalness: 0.04 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x171b1f, roughness: 0.82, metalness: 0.08 });
    const trim = new THREE.MeshStandardMaterial({ color: 0x666b70, roughness: 0.52, metalness: 0.25 });
    const glass = new THREE.MeshStandardMaterial({
      color: 0x6f9db2,
      roughness: 0.16,
      metalness: 0.08,
      transparent: true,
      opacity: 0.78
    });

    const addBox = (size, pos, material, radius = 0) => {
      const geometry = radius > 0
        ? new THREE.BoxGeometry(size[0], size[1], size[2], 2, 2, 2)
        : new THREE.BoxGeometry(...size);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...pos);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      camper.add(mesh);
      return mesh;
    };

    addBox([2.28, 0.72, 4.95], [0, 0.82, 0], white2);
    addBox([2.18, 1.62, 3.72], [0, 1.88, -0.42], white);
    addBox([2.12, 1.25, 1.35], [0, 1.62, 1.75], white);
    addBox([2.22, 0.16, 3.85], [0, 2.75, -0.40], white2);

    const windshield = addBox([1.82, 0.66, 0.055], [0, 1.85, 2.435], glass);
    windshield.rotation.x = -0.08;
    addBox([1.52, 0.58, 0.055], [0, 2.04, -2.305], glass);

    for (const side of [-1, 1]) {
      addBox([0.055, 0.66, 1.00], [side * 1.095, 2.05, 0.72], glass);
      addBox([0.055, 0.70, 1.10], [side * 1.095, 2.05, -0.80], glass);
      addBox([0.075, 0.12, 3.55], [side * 1.125, 1.34, -0.22], trim);
    }

    addBox([0.74, 1.38, 0.06], [1.116, 1.78, -1.40], white2);
    addBox([0.055, 0.32, 0.30], [1.156, 1.78, -1.18], dark);

    addBox([2.26, 0.25, 0.27], [0, 0.52, 2.48], dark);
    addBox([2.26, 0.25, 0.27], [0, 0.52, -2.48], dark);
    addBox([1.35, 0.08, 0.42], [0, 2.91, -0.44], trim);

    const wheelGeometry = new THREE.CylinderGeometry(0.47, 0.47, 0.34, 20);
    const hubGeometry = new THREE.CylinderGeometry(0.20, 0.20, 0.355, 16);
    const wheelPositions = [
      [-1.10, 0.58, 1.43], [1.10, 0.58, 1.43],
      [-1.10, 0.58, -1.50], [1.10, 0.58, -1.50]
    ];
    this.wheels = [];
    for (const [x, y, z] of wheelPositions) {
      const wheelGroup = new THREE.Group();
      wheelGroup.position.set(x, y, z);
      const tire = new THREE.Mesh(wheelGeometry, dark);
      tire.rotation.z = Math.PI / 2;
      tire.castShadow = true;
      wheelGroup.add(tire);
      const hub = new THREE.Mesh(hubGeometry, trim);
      hub.rotation.z = Math.PI / 2;
      wheelGroup.add(hub);
      camper.add(wheelGroup);
      this.wheels.push(wheelGroup);
    }

    this.model = camper;
    this.bodyPivot.add(camper);
  }

  update(delta) {
    if (!this.model || this.finished) return;

    this.updateSpeed(delta);
    this.updateSteering(delta);
    this.progress = THREE.MathUtils.clamp(this.progress + (this.speed * delta) / this.world.length, 0, 1);
    this.placeAtProgress(delta);

    const spin = (this.speed * delta) / 0.47;
    for (const wheel of this.wheels) wheel.rotation.x += spin;

    if (this.progress >= 0.997) {
      this.progress = 0.997;
      this.speed = 0;
      this.finished = true;
      this.input.reset();
      this.placeAtProgress(delta);
      this.game.ui?.showFinish();
    }
  }

  updateSpeed(delta) {
    if (this.input.keys.forward) this.speed += this.acceleration * delta;
    if (this.input.keys.backward) {
      if (this.speed > 1) this.speed -= this.brakePower * delta;
      else this.speed -= this.acceleration * 0.62 * delta;
    }
    if (this.input.keys.brake) this.speed -= Math.sign(this.speed || 1) * this.brakePower * delta;
    if (!this.input.keys.forward && !this.input.keys.backward && !this.input.keys.brake) {
      this.speed = THREE.MathUtils.damp(this.speed, 0, this.drag, delta);
    }
    this.speed = THREE.MathUtils.clamp(this.speed, -this.maxReverse, this.maxSpeed);
  }

  updateSteering(delta) {
    let target = 0;
    // コース座標の左右に合わせて入力方向を修正
    if (this.input.keys.left) target = 1;
    if (this.input.keys.right) target = -1;

    this.steer = THREE.MathUtils.damp(this.steer, target, 8, delta);
    const speedFactor = 0.30 + Math.min(Math.abs(this.speed) / this.maxSpeed, 1) * 0.70;
    this.laneOffset += this.steer * delta * 7.2 * speedFactor * (this.speed < 0 ? -1 : 1);

    const limit = this.world.roadHalfWidth - this.dimensions.x * 0.53;
    this.laneOffset = THREE.MathUtils.clamp(this.laneOffset, -limit, limit);
    if (!target) this.laneOffset = THREE.MathUtils.damp(this.laneOffset, 0, 0.28, delta);
  }

  placeAtProgress(delta = 0.016, immediate = false) {
    const pose = this.world.getPose(this.progress, this.laneOffset);
    this.root.position.copy(pose.position);
    this.root.position.y += 0.10;
    this.root.rotation.y = Math.atan2(pose.tangent.x, pose.tangent.z);

    // 車体だけをわずかに傾け、カメラにはこの揺れを渡さない
    const leanTarget = -this.steer * 0.025 * Math.min(Math.abs(this.speed) / 12, 1);
    this.bodyPivot.rotation.z = immediate ? leanTarget : THREE.MathUtils.damp(this.bodyPivot.rotation.z, leanTarget, 4.5, delta);
    this.bodyPivot.rotation.x = immediate ? 0 : THREE.MathUtils.damp(this.bodyPivot.rotation.x, 0, 5, delta);

    this.updateLights();
  }

  createLights() {
    const width = this.dimensions.x * 0.31;
    const front = this.dimensions.z * 0.49;
    const rear = -this.dimensions.z * 0.49;
    const height = 1.18;

    for (const x of [-width, width]) {
      const light = new THREE.SpotLight(0xfff2ce, 0, 58, THREE.MathUtils.degToRad(22), 0.72, 1.8);
      light.position.set(x, height, front);
      const target = new THREE.Object3D();
      target.position.set(x, 0.15, front + 32);
      this.bodyPivot.add(light, target);
      light.target = target;
      this.headLights.push(light);
    }

    for (const x of [-width, width]) {
      const lamp = TailLampFactory.create(this.tailLampShape, 0.52, 0.17);
      lamp.position.set(x, 1.18, rear - 0.04);
      lamp.rotation.y = Math.PI;
      this.bodyPivot.add(lamp);
      const glow = new THREE.PointLight(0xff2018, 0, 7, 2);
      glow.position.copy(lamp.position);
      this.bodyPivot.add(glow);
      this.tailLights.push({ lamp, glow });
    }
  }

  setTailLampShape(shape) {
    if (!["bar", "round", "double"].includes(shape)) return;
    for (const light of this.headLights) {
      this.bodyPivot.remove(light, light.target);
    }
    for (const item of this.tailLights) this.bodyPivot.remove(item.lamp, item.glow);
    this.headLights.length = 0;
    this.tailLights.length = 0;
    this.tailLampShape = shape;
    this.createLights();
  }

  updateLights() {
    const area = this.world.getArea(this.progress);
    const dark = area.id >= 2;
    const braking = this.input.keys.brake || this.input.keys.backward;
    for (const light of this.headLights) light.intensity = dark ? 30 : 0;
    for (const item of this.tailLights) {
      item.lamp.visible = dark || braking;
      item.glow.intensity = braking ? 3.0 : dark ? 0.9 : 0;
    }
  }

  reset() {
    this.input.reset();
    this.progress = 0.006;
    this.laneOffset = 0;
    this.speed = 0;
    this.steer = 0;
    this.finished = false;
    this.placeAtProgress(1, true);
  }

  get speedKmh() {
    return Math.round(Math.abs(this.speed) * 3.6);
  }
}
