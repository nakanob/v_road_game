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

    this.dimensions = new THREE.Vector3(2.36, 3.05, 5.35);
    this.headLights = [];
    this.tailLights = [];
    this.tailLampShape = "double";

    this.createCamper();
    this.createLights();
    this.placeAtProgress(1, true);
  }

  createCamper() {
    const camper = new THREE.Group();
    camper.name = "vantech-style-camper";

    const bodyWhite = new THREE.MeshStandardMaterial({ color: 0xf6f5f1, roughness: 0.58, metalness: 0.04 });
    const bodyWhite2 = new THREE.MeshStandardMaterial({ color: 0xe8e7e3, roughness: 0.64, metalness: 0.03 });
    const trim = new THREE.MeshStandardMaterial({ color: 0x9b9ea2, roughness: 0.48, metalness: 0.32 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x171b1f, roughness: 0.84, metalness: 0.08 });
    const glass = new THREE.MeshStandardMaterial({ color: 0x7aa2af, roughness: 0.18, metalness: 0.08, transparent: true, opacity: 0.76 });
    const blackPlastic = new THREE.MeshStandardMaterial({ color: 0x282d31, roughness: 0.72, metalness: 0.06 });

    const addBox = (size, pos, material) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
      mesh.position.set(...pos);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      camper.add(mesh);
      return mesh;
    };

    // lower chassis and floor
    addBox([2.28, 0.76, 5.00], [0, 0.80, 0], bodyWhite2);

    // main habitation box and cab
    addBox([2.22, 1.70, 3.78], [0, 1.94, -0.35], bodyWhite);
    addBox([2.08, 1.22, 1.46], [0, 1.64, 1.78], bodyWhite);

    // over-cab sleeping section
    const overCab = addBox([2.34, 0.92, 2.62], [0, 2.64, 1.14], bodyWhite);
    overCab.scale.x = 1.03;
    const overNose = addBox([2.30, 0.60, 1.15], [0, 2.35, 2.28], bodyWhite2);
    overNose.scale.x = 1.02;
    addBox([2.36, 0.12, 2.30], [0, 3.11, 0.65], bodyWhite2);

    // windshield and windows
    const windshield = addBox([1.80, 0.68, 0.06], [0, 1.86, 2.41], glass);
    windshield.rotation.x = -0.1;
    addBox([1.56, 0.56, 0.06], [0, 2.02, -2.30], glass); // rear window

    // side windows and door
    for (const side of [-1, 1]) {
      addBox([0.06, 0.62, 1.02], [side * 1.11, 2.10, 0.85], glass);
      addBox([0.06, 0.72, 1.22], [side * 1.11, 1.96, -0.68], glass);
      addBox([0.06, 0.42, 0.62], [side * 1.11, 2.64, 1.18], glass);
      addBox([0.08, 0.12, 4.10], [side * 1.15, 1.24, -0.10], trim);
    }

    const sideDoor = addBox([0.72, 1.46, 0.06], [1.12, 1.82, -1.20], bodyWhite2);
    sideDoor.castShadow = true;
    const doorWindow = addBox([0.06, 0.48, 0.20], [1.14, 2.07, -1.38], glass);
    doorWindow.rotation.y = Math.PI / 2;
    addBox([0.08, 0.22, 0.08], [1.16, 1.76, -1.00], dark);

    // rear hatch and ladder
    addBox([1.46, 1.10, 0.06], [0, 1.75, -2.53], bodyWhite2);
    const ladderMat = new THREE.MeshStandardMaterial({ color: 0xb8bcc1, roughness: 0.35, metalness: 0.75 });
    for (const x of [0.75, 0.96]) {
      const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.9, 8), ladderMat);
      rail.position.set(x, 2.35, -2.48); rail.castShadow = true; camper.add(rail);
    }
    for (let y = 1.65; y <= 3.0; y += 0.34) {
      const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.24, 8), ladderMat);
      rung.rotation.z = Math.PI / 2; rung.position.set(0.855, y, -2.48); rung.castShadow = true; camper.add(rung);
    }

    // side storage doors
    addBox([0.82, 0.48, 0.05], [-1.12, 1.00, -1.72], bodyWhite2);
    addBox([0.64, 0.42, 0.05], [1.12, 0.95, -0.38], bodyWhite2);
    addBox([0.82, 0.52, 0.05], [1.12, 0.92, 1.02], bodyWhite2);

    // graphic stripes
    const stripeMat = new THREE.MeshStandardMaterial({ color: 0x8e9196, roughness: 0.75 });
    const stripeMat2 = new THREE.MeshStandardMaterial({ color: 0x2c3135, roughness: 0.75 });
    const stripe1 = addBox([0.05, 0.14, 2.6], [1.13, 1.85, -0.10], stripeMat);
    stripe1.rotation.x = 0.0;
    const stripe2 = addBox([0.05, 0.08, 1.9], [-1.13, 2.0, -0.50], stripeMat2);
    stripe2.rotation.x = 0;

    // roof parts and awning
    addBox([1.10, 0.08, 0.44], [0.22, 3.16, 0.50], trim);
    const awning = addBox([0.10, 0.10, 2.45], [1.16, 2.88, 0.20], trim);
    awning.rotation.x = 0.03;

    // front grill / bumper and mirrors
    addBox([1.75, 0.18, 0.10], [0, 1.18, 2.54], blackPlastic);
    addBox([1.15, 0.24, 0.10], [0, 0.88, 2.55], trim);
    addBox([0.52, 0.28, 0.16], [-0.66, 1.22, 2.51], bodyWhite2);
    addBox([0.52, 0.28, 0.16], [0.66, 1.22, 2.51], bodyWhite2);
    addBox([2.22, 0.22, 0.25], [0, 0.50, 2.48], blackPlastic);
    for (const side of [-1, 1]) {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.52), trim);
      arm.position.set(side * 1.34, 2.0, 1.92); arm.castShadow = true; camper.add(arm);
      const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.42, 0.28), dark);
      mirror.position.set(side * 1.46, 2.0, 2.14); mirror.castShadow = true; camper.add(mirror);
    }

    // wheel arches / tires
    const wheelGeometry = new THREE.CylinderGeometry(0.47, 0.47, 0.34, 22);
    const hubGeometry = new THREE.CylinderGeometry(0.19, 0.19, 0.355, 16);
    const wheelPositions = [
      [-1.10, 0.56, 1.48], [1.10, 0.56, 1.48],
      [-1.10, 0.56, -1.56], [1.10, 0.56, -1.56]
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

    // headlights visual meshes
    const lampMat = new THREE.MeshBasicMaterial({ color: 0xf8f1db, toneMapped: false });
    for (const x of [-0.78, 0.78]) {
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.16, 0.04), lampMat);
      head.position.set(x, 1.25, 2.58);
      camper.add(head);
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
    if (this.input.keys.left) target = -1;
    if (this.input.keys.right) target = 1;

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
    this.root.position.y += 0.11;
    this.root.rotation.y = Math.atan2(pose.tangent.x, pose.tangent.z);

    const leanTarget = -this.steer * 0.022 * Math.min(Math.abs(this.speed) / 12, 1);
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
      const lamp = TailLampFactory.create(this.tailLampShape, 0.54, 0.16);
      lamp.position.set(x, 1.10, rear - 0.05);
      lamp.rotation.y = Math.PI;
      this.bodyPivot.add(lamp);
      const glow = new THREE.PointLight(0xff2018, 0, 7, 2);
      glow.position.copy(lamp.position);
      this.bodyPivot.add(glow);
      this.tailLights.push({ lamp, glow });
    }
    // center high mount stop lamp
    const centerLamp = TailLampFactory.create("bar", 0.36, 0.10);
    centerLamp.position.set(0, 2.0, rear - 0.04);
    centerLamp.rotation.y = Math.PI;
    this.bodyPivot.add(centerLamp);
    const centerGlow = new THREE.PointLight(0xff2b22, 0, 5, 2);
    centerGlow.position.copy(centerLamp.position);
    this.bodyPivot.add(centerGlow);
    this.tailLights.push({ lamp: centerLamp, glow: centerGlow });
  }

  setTailLampShape(shape) {
    if (!["bar", "round", "double"].includes(shape)) return;
    for (const light of this.headLights) this.bodyPivot.remove(light, light.target);
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
