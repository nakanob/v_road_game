import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
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

    this.model = null;
    this.progress = 0.006;
    this.laneOffset = 0;
    this.speed = 0;
    this.maxSpeed = 31;
    this.maxReverse = 6;
    this.acceleration = 11;
    this.brakePower = 18;
    this.drag = 4.2;
    this.steer = 0;
    this.finished = false;

    this.dimensions = new THREE.Vector3(2.2, 1.8, 4.8);
    this.headLights = [];
    this.tailLights = [];
    this.tailLampShape = "bar";
    this.lastPosition = new THREE.Vector3();

    this.createFallbackVehicle();
    this.createLights();
    this.placeAtProgress();
  }

  createFallbackVehicle() {
    const car = new THREE.Group();
    car.name = "fallback-car";

    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x183b62,
      roughness: 0.42,
      metalness: 0.28
    });
    const darkMaterial = new THREE.MeshStandardMaterial({
      color: 0x111820,
      roughness: 0.7,
      metalness: 0.08
    });
    const glassMaterial = new THREE.MeshStandardMaterial({
      color: 0x8fc2d9,
      roughness: 0.18,
      metalness: 0.05,
      transparent: true,
      opacity: 0.72
    });

    const lower = new THREE.Mesh(new THREE.BoxGeometry(2.16, 0.62, 4.5), bodyMaterial);
    lower.position.y = 0.72;
    lower.castShadow = true;
    lower.receiveShadow = true;
    car.add(lower);

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.86, 0.92, 2.25), bodyMaterial);
    cabin.position.set(0, 1.42, -0.15);
    cabin.castShadow = true;
    car.add(cabin);

    const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.62, 0.56, 0.05), glassMaterial);
    windshield.position.set(0, 1.55, 1.0);
    windshield.rotation.x = -0.16;
    car.add(windshield);

    const rearWindow = windshield.clone();
    rearWindow.position.z = -1.28;
    rearWindow.rotation.x = 0.14;
    car.add(rearWindow);

    const bumperFront = new THREE.Mesh(new THREE.BoxGeometry(2.12, 0.22, 0.28), darkMaterial);
    bumperFront.position.set(0, 0.5, 2.28);
    car.add(bumperFront);

    const bumperRear = bumperFront.clone();
    bumperRear.position.z = -2.28;
    car.add(bumperRear);

    const wheelGeometry = new THREE.CylinderGeometry(0.43, 0.43, 0.31, 18);
    const wheelPositions = [
      [-1.05, 0.48, 1.35],
      [1.05, 0.48, 1.35],
      [-1.05, 0.48, -1.35],
      [1.05, 0.48, -1.35]
    ];

    for (const [x, y, z] of wheelPositions) {
      const wheel = new THREE.Mesh(wheelGeometry, darkMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, y, z);
      wheel.castShadow = true;
      car.add(wheel);
    }

    this.model = car;
    this.bodyPivot.add(car);
  }

  async load(url, timeoutMs = 10000) {
    const loader = new GLTFLoader();

    const timeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Vehicle model load timeout")), timeoutMs);
    });

    try {
      const gltf = await Promise.race([loader.loadAsync(url), timeout]);
      const loadedModel = gltf.scene;
      const box = new THREE.Box3().setFromObject(loadedModel);
      const size = box.getSize(new THREE.Vector3());

      if (!Number.isFinite(size.x) || size.x <= 0) {
        throw new Error("Vehicle model size is invalid");
      }

      const scale = 2.25 / Math.max(size.x, 0.001);
      loadedModel.scale.setScalar(scale);
      loadedModel.updateMatrixWorld(true);

      box.setFromObject(loadedModel);
      box.getSize(this.dimensions);
      loadedModel.position.y = -box.min.y + 0.06;

      loadedModel.traverse((object) => {
        if (!object.isMesh) return;
        object.castShadow = true;
        object.receiveShadow = true;
      });

      if (this.model) {
        this.bodyPivot.remove(this.model);
      }

      this.model = loadedModel;
      this.bodyPivot.add(this.model);
      this.rebuildLights();
    } catch (error) {
      console.warn("GLBの読み込みを省略し、軽量車両で開始します。", error);
    }
  }

  rebuildLights() {
    for (const light of this.headLights) {
      this.bodyPivot.remove(light);
      if (light.target) this.bodyPivot.remove(light.target);
    }
    for (const item of this.tailLights) {
      this.bodyPivot.remove(item.lamp, item.glow);
    }
    this.headLights.length = 0;
    this.tailLights.length = 0;
    this.createLights();
  }

  update(delta) {
    if (!this.model || this.finished) return;

    this.updateSpeed(delta);
    this.updateSteering(delta);
    this.progress = THREE.MathUtils.clamp(
      this.progress + (this.speed * delta) / this.world.length,
      0,
      1
    );
    this.placeAtProgress(delta);

    if (this.progress >= 0.997) {
      this.speed = 0;
      this.finished = true;
      this.game.ui?.showFinish();
    }
  }

  updateSpeed(delta) {
    if (this.input.keys.forward) this.speed += this.acceleration * delta;

    if (this.input.keys.backward) {
      if (this.speed > 1) this.speed -= this.brakePower * delta;
      else this.speed -= this.acceleration * 0.65 * delta;
    }

    if (this.input.keys.brake) {
      this.speed -= Math.sign(this.speed || 1) * this.brakePower * delta;
    }

    if (!this.input.keys.forward && !this.input.keys.backward && !this.input.keys.brake) {
      this.speed = THREE.MathUtils.damp(this.speed, 0, this.drag, delta);
    }

    this.speed = THREE.MathUtils.clamp(this.speed, -this.maxReverse, this.maxSpeed);
  }

  updateSteering(delta) {
    let target = 0;
    if (this.input.keys.left) target = -1;
    if (this.input.keys.right) target = 1;

    this.steer = THREE.MathUtils.damp(this.steer, target, 7, delta);

    const speedFactor = 0.35 + Math.min(Math.abs(this.speed) / this.maxSpeed, 1) * 0.65;
    this.laneOffset += this.steer * delta * 8 * speedFactor * (this.speed < 0 ? -1 : 1);

    const limit = this.world.roadHalfWidth - this.dimensions.x * 0.48;
    this.laneOffset = THREE.MathUtils.clamp(this.laneOffset, -limit, limit);

    if (!target) {
      this.laneOffset = THREE.MathUtils.damp(this.laneOffset, 0, 0.35, delta);
    }
  }

  placeAtProgress(delta = 0.016) {
    const pose = this.world.getPose(this.progress, this.laneOffset);
    this.lastPosition.copy(this.root.position);
    this.root.position.copy(pose.position);
    this.root.position.y += 0.08;
    this.root.rotation.y = Math.atan2(pose.tangent.x, pose.tangent.z);

    const ahead = this.world.getPose(Math.min(1, this.progress + 0.003), this.laneOffset).position;
    const behind = this.world.getPose(Math.max(0, this.progress - 0.003), this.laneOffset).position;
    const pitch = Math.atan2(ahead.y - behind.y, ahead.distanceTo(behind));

    this.bodyPivot.rotation.x = THREE.MathUtils.damp(this.bodyPivot.rotation.x, -pitch, 7, delta);
    this.bodyPivot.rotation.z = THREE.MathUtils.damp(
      this.bodyPivot.rotation.z,
      -this.steer * 0.06 * Math.min(Math.abs(this.speed) / 10, 1),
      6,
      delta
    );

    this.updateLights();
  }

  createLights() {
    const width = this.dimensions.x * 0.32;
    const front = this.dimensions.z * 0.48;
    const rear = -this.dimensions.z * 0.48;
    const height = this.dimensions.y * 0.42;

    for (const x of [-width, width]) {
      const light = new THREE.SpotLight(
        0xfff4d5,
        0,
        55,
        THREE.MathUtils.degToRad(24),
        0.65,
        1.7
      );
      light.position.set(x, height, front);

      const target = new THREE.Object3D();
      target.position.set(x, height - 0.65, front + 30);
      this.bodyPivot.add(light, target);
      light.target = target;
      this.headLights.push(light);
    }

    for (const x of [-width, width]) {
      const lamp = TailLampFactory.create(
        this.tailLampShape,
        this.dimensions.x * 0.22,
        this.dimensions.y * 0.1
      );
      lamp.position.set(x, height * 0.82, rear - 0.03);
      lamp.rotation.y = Math.PI;
      this.bodyPivot.add(lamp);

      const glow = new THREE.PointLight(0xff1f18, 0, 8, 2);
      glow.position.copy(lamp.position);
      this.bodyPivot.add(glow);
      this.tailLights.push({ lamp, glow });
    }
  }

  setTailLampShape(shape) {
    if (!['bar', 'round', 'double'].includes(shape)) return;
    this.tailLampShape = shape;
    this.rebuildLights();
  }

  updateLights() {
    const area = this.world.getArea(this.progress);
    const dark = area.id >= 2;
    const braking = this.input.keys.brake || this.input.keys.backward;

    for (const light of this.headLights) {
      light.intensity = dark ? 32 : 0;
    }

    for (const item of this.tailLights) {
      item.lamp.visible = dark || braking;
      item.glow.intensity = braking ? 3.2 : dark ? 1.1 : 0;
    }
  }

  reset() {
    this.input.reset();
    this.progress = 0.006;
    this.laneOffset = 0;
    this.speed = 0;
    this.steer = 0;
    this.finished = false;
    this.placeAtProgress();
  }

  get speedKmh() {
    return Math.round(Math.abs(this.speed) * 3.6);
  }
}
