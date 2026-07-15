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
    this.maxSpeed = 25;
    this.maxReverse = 5;
    this.acceleration = 9.0;
    this.brakePower = 17;
    this.drag = 3.8;
    this.steer = 0;
    this.finished = false;

    const startPose = this.world.getPose(this.progress, 0);
    this.heading = Math.atan2(startPose.tangent.x, startPose.tangent.z);

    this.dimensions = new THREE.Vector3(2.36, 3.02, 5.25);
    this.headLights = [];
    this.tailLights = [];
    this.tailLampShape = "double";

    this.createCamper();
    this.createLights();
    this.placeAtProgress(1, true);
  }

  createCamper() {
    const camper = new THREE.Group();
    camper.name = "dyna-based-camper";

    const white = new THREE.MeshStandardMaterial({ color: 0xf6f5f1, roughness: 0.58, metalness: 0.04 });
    const white2 = new THREE.MeshStandardMaterial({ color: 0xe8e7e3, roughness: 0.64, metalness: 0.03 });
    const trim = new THREE.MeshStandardMaterial({ color: 0xa7aaad, roughness: 0.46, metalness: 0.34 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x171b1f, roughness: 0.84, metalness: 0.08 });
    const blackPlastic = new THREE.MeshStandardMaterial({ color: 0x282d31, roughness: 0.72, metalness: 0.06 });
    const glass = new THREE.MeshStandardMaterial({ color: 0x6e9ca9, roughness: 0.16, metalness: 0.08, transparent: true, opacity: 0.78 });
    const redLamp = new THREE.MeshBasicMaterial({ color: 0xff3428, toneMapped: false });
    const amberLamp = new THREE.MeshBasicMaterial({ color: 0xffa23a, toneMapped: false });
    const clearLamp = new THREE.MeshBasicMaterial({ color: 0xf4f2e9, toneMapped: false });

    const addBox = (size, pos, material, parent = camper) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
      mesh.position.set(...pos);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    };

    // シャシー・居住部。天井は水平で、天窓や突起は付けない。
    addBox([2.28, 0.72, 4.95], [0, 0.80, -0.02], white2);
    addBox([2.24, 1.72, 3.72], [0, 1.92, -0.42], white);
    addBox([2.26, 0.14, 3.78], [0, 2.85, -0.42], white2);

    // トラックキャブ。前面窓を傾け、その傾き分だけバンク部が前へ出る。
    addBox([2.10, 1.18, 1.38], [0, 1.57, 1.77], white);
    const windshield = addBox([1.86, 0.74, 0.06], [0, 1.93, 2.38], glass);
    windshield.rotation.x = -0.22;
    addBox([0.10, 0.96, 0.10], [-0.93, 1.88, 2.18], white2);
    addBox([0.10, 0.96, 0.10], [0.93, 1.88, 2.18], white2);

    // バンク部。車両フロントより前へ突き出さない。
    addBox([2.30, 0.74, 2.18], [0, 2.50, 1.02], white);
    addBox([2.18, 0.24, 0.58], [0, 2.25, 2.06], white2);

    // 運転席・助手席窓（トヨタ・ダイナ系の縦長キャブ窓を意識）。
    for (const side of [-1, 1]) {
      const cabWindow = addBox([0.06, 0.72, 0.88], [side * 1.075, 1.92, 1.62], glass);
      cabWindow.rotation.y = 0;
      addBox([0.07, 0.11, 1.22], [side * 1.12, 1.22, 1.62], blackPlastic);
    }

    // 居住部の窓。左右は必要最低限に整理。
    addBox([0.06, 0.74, 1.34], [-1.13, 2.03, 0.12], glass);
    addBox([0.06, 0.63, 0.98], [-1.13, 2.03, -1.27], glass);
    addBox([0.06, 0.72, 1.38], [1.13, 2.03, 0.02], glass);
    addBox([0.06, 0.54, 0.78], [1.13, 2.08, -1.43], glass);

    // 左側中央の閉じた扉。車体からはみ出さない。
    const sideDoor = addBox([0.055, 1.56, 0.76], [-1.145, 1.78, -0.94], white2);
    addBox([0.06, 0.50, 0.48], [-1.18, 2.04, -0.95], glass);
    addBox([0.07, 0.08, 0.20], [-1.185, 1.67, -0.70], dark);
    sideDoor.castShadow = true;

    // 右側は扉なし。収納扉のみ低い位置に配置。
    addBox([0.055, 0.44, 0.78], [1.145, 0.97, -1.36], white2);
    addBox([0.055, 0.42, 0.66], [1.145, 0.96, 0.34], white2);

    // 後面は窓を中心にし、大きな白いパネルは置かない。
    addBox([1.42, 0.60, 0.06], [0, 2.07, -2.51], glass);
    addBox([1.16, 0.06, 0.055], [0, 1.68, -2.53], redLamp);

    // はしごは屋根より上に出さない。
    const ladderMat = new THREE.MeshStandardMaterial({ color: 0xb8bcc1, roughness: 0.35, metalness: 0.75 });
    for (const x of [0.72, 0.94]) {
      const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 1.55, 8), ladderMat);
      rail.position.set(x, 2.04, -2.48);
      rail.castShadow = true;
      camper.add(rail);
    }
    for (let y = 1.42; y <= 2.68; y += 0.31) {
      const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.023, 0.023, 0.25, 8), ladderMat);
      rung.rotation.z = Math.PI / 2;
      rung.position.set(0.83, y, -2.48);
      rung.castShadow = true;
      camper.add(rung);
    }

    // フロントグリル・バンパー・ワイパー・ミラー。
    addBox([1.78, 0.18, 0.09], [0, 1.20, 2.53], blackPlastic);
    for (let y = 1.02; y <= 1.17; y += 0.05) addBox([1.18, 0.022, 0.035], [0, y, 2.59], dark);
    addBox([1.18, 0.23, 0.10], [0, 0.89, 2.53], trim);
    addBox([2.22, 0.22, 0.23], [0, 0.49, 2.44], blackPlastic);
    const emblem = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.035, 20), trim);
    emblem.rotation.x = Math.PI / 2;
    emblem.position.set(0, 1.29, 2.60);
    camper.add(emblem);
    for (const x of [-0.43, 0.43]) {
      const wiper = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.024, 0.024), dark);
      wiper.position.set(x, 1.60, 2.47);
      wiper.rotation.z = x < 0 ? -0.16 : 0.16;
      camper.add(wiper);
    }
    for (const side of [-1, 1]) {
      const arm = addBox([0.06, 0.06, 0.48], [side * 1.31, 2.00, 1.96], trim);
      arm.rotation.y = side * 0.16;
      addBox([0.16, 0.40, 0.26], [side * 1.46, 2.00, 2.14], dark);
    }

    // ヘッドライト・ウインカー・ナンバー。
    for (const x of [-0.72, 0.72]) {
      addBox([0.50, 0.22, 0.045], [x, 1.23, 2.59], clearLamp);
      addBox([0.12, 0.12, 0.048], [x + Math.sign(x) * 0.30, 1.23, 2.60], amberLamp);
    }
    addBox([0.68, 0.23, 0.045], [0, 0.67, 2.58], dark);

    // サイドグラフィックを控えめに。
    const stripe1 = addBox([0.04, 0.10, 2.55], [-1.16, 1.56, -0.10], trim);
    stripe1.rotation.x = 0;
    const stripe2 = addBox([0.04, 0.07, 1.85], [1.16, 1.72, -0.42], blackPlastic);
    stripe2.rotation.x = 0;

    // タイヤ・ホイール。
    const wheelGeometry = new THREE.CylinderGeometry(0.47, 0.47, 0.34, 22);
    const hubGeometry = new THREE.CylinderGeometry(0.19, 0.19, 0.355, 16);
    const wheelPositions = [
      [-1.10, 0.56, 1.45], [1.10, 0.56, 1.45],
      [-1.10, 0.56, -1.53], [1.10, 0.56, -1.53]
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

    // 後部ランプ。
    for (const x of [-0.78, 0.78]) {
      addBox([0.46, 0.11, 0.04], [x, 0.81, -2.57], redLamp);
      addBox([0.46, 0.075, 0.04], [x, 0.66, -2.57], clearLamp);
    }
    addBox([0.62, 0.22, 0.04], [0, 0.61, -2.58], dark);

    this.model = camper;
    this.bodyPivot.add(camper);
  }

  update(delta) {
    if (!this.model || this.finished) return;

    this.updateSpeed(delta);
    this.updateSteering(delta);

    const poseBeforeMove = this.world.getPose(this.progress, this.laneOffset);
    const moveDirection = new THREE.Vector3(Math.sin(this.heading), 0, Math.cos(this.heading));
    const forwardAmount = moveDirection.dot(poseBeforeMove.tangent) * this.speed * delta;
    const sideAmount = moveDirection.dot(poseBeforeMove.side) * this.speed * delta;

    this.progress = THREE.MathUtils.clamp(this.progress + forwardAmount / this.world.length, 0, 1);
    const nextLaneOffset = this.laneOffset + sideAmount;
    const limit = this.world.roadHalfWidth - this.dimensions.x * 0.53;

    if (nextLaneOffset < -limit || nextLaneOffset > limit) {
      const clamped = THREE.MathUtils.clamp(nextLaneOffset, -limit, limit);
      this.laneOffset = THREE.MathUtils.damp(this.laneOffset, clamped, 12, delta);
      this.speed *= Math.max(0.86, 1 - delta * 1.8);
    } else {
      this.laneOffset = nextLaneOffset;
    }

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

    this.steer = THREE.MathUtils.damp(this.steer, target, 10, delta);
    const speedRatio = THREE.MathUtils.clamp(Math.abs(this.speed) / 8, 0, 1);
    const yawRate = this.steer * this.speed * (0.030 + speedRatio * 0.022);
    this.heading += yawRate * delta;
  }

  placeAtProgress(delta = 0.016, immediate = false) {
    const pose = this.world.getPose(this.progress, this.laneOffset);
    this.root.position.copy(pose.position);
    this.root.position.y += 0.11;
    this.root.rotation.y = this.heading;

    const leanTarget = -this.steer * 0.018 * Math.min(Math.abs(this.speed) / 12, 1);
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
      const light = new THREE.SpotLight(0xffefc7, 0, 135, THREE.MathUtils.degToRad(34), 0.46, 1.05);
      light.position.set(x, height, front);
      const target = new THREE.Object3D();
      target.position.set(x * 0.38, -2.15, front + 40);
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

    const centerLamp = TailLampFactory.create("bar", 0.36, 0.10);
    centerLamp.position.set(0, 1.66, rear - 0.04);
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
    for (const light of this.headLights) light.intensity = dark ? (area.id === 3 ? 82 : 58) : 0;
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
    const startPose = this.world.getPose(this.progress, 0);
    this.heading = Math.atan2(startPose.tangent.x, startPose.tangent.z);
    this.finished = false;
    this.placeAtProgress(1, true);
  }

  get speedKmh() {
    return Math.round(Math.abs(this.speed) * 3.6);
  }
}
