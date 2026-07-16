import * as THREE from "three";
import { InputManager } from "./InputManager.js";
import { TailLampFactory } from "./TailLampFactory.js";

export class Vehicle {
  constructor(game, world) {
    this.game = game;
    this.world = world;
    this.scene = game.scene;
    this.input = new InputManager();

    this.root = new THREE.Group();
    this.scene.add(this.root);
    this.body = new THREE.Group();
    this.root.add(this.body);

    this.position = new THREE.Vector3();
    this.yaw = 0;
    this.speed = 0;
    this.currentSteer = 0;
    this.progress = 0;
    this.lastSampleIndex = 0;
    this.finished = false;
    this.started = false;
    this.hitCooldown = 0;

    this.stats = { collisions: 0, elapsed: 0, arrivalSpeed: 0 };

    this.maxSpeed = 17.5;
    this.reverseSpeed = 7.2;
    this.acceleration = 10.5;
    this.brakePower = 16.0;
    this.drag = 5.8;
    this.turnRate = 1.85;

    this.buildModel();
    this.reset();
  }

  get speedKmh() {
    return Math.round(Math.abs(this.speed) * 3.6);
  }

  buildModel() {
    const white = new THREE.MeshStandardMaterial({ color: 0xf5f5f2, roughness: 0.88 });
    const white2 = new THREE.MeshStandardMaterial({ color: 0xeaeae6, roughness: 0.9 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x2c3136, roughness: 0.7 });
    const glass = new THREE.MeshStandardMaterial({ color: 0x9ec1d1, roughness: 0.1, metalness: 0.05, transparent: true, opacity: 0.78 });
    const metal = new THREE.MeshStandardMaterial({ color: 0xc7c9cc, roughness: 0.45, metalness: 0.4 });
    const tire = new THREE.MeshStandardMaterial({ color: 0x171717, roughness: 1 });
    const wheel = new THREE.MeshStandardMaterial({ color: 0xaeb4bb, roughness: 0.55, metalness: 0.45 });
    const amber = new THREE.MeshBasicMaterial({ color: 0xffa134, toneMapped: false });
    const redLamp = new THREE.MeshBasicMaterial({ color: 0xff4338, toneMapped: false });

    // dimensions
    this.wheelBase = 3.65;
    this.track = 1.92;
    this.bodyHeight = 3.15;
    this.groundOffset = 0.78;

    // wheels
    const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.24, 18);
    const capGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.26, 18);
    const wheelPositions = [
      [-this.track / 2, 0.42, 1.54], [this.track / 2, 0.42, 1.54],
      [-this.track / 2, 0.42, -2.11], [this.track / 2, 0.42, -2.11]
    ];
    this.wheels = [];
    wheelPositions.forEach(([x, y, z]) => {
      const g = new THREE.Group();
      const outer = new THREE.Mesh(wheelGeo, tire); outer.rotation.z = Math.PI / 2; outer.castShadow = true; g.add(outer);
      const cap = new THREE.Mesh(capGeo, wheel); cap.rotation.z = Math.PI / 2; cap.castShadow = true; g.add(cap);
      g.position.set(x, y, z); this.body.add(g); this.wheels.push(g);
    });

    // cab base
    const cab = new THREE.Mesh(new THREE.BoxGeometry(2.12, 1.52, 2.24), white);
    cab.position.set(0, 1.32, 1.95);
    cab.castShadow = cab.receiveShadow = true;
    this.body.add(cab);

    const bumper = new THREE.Mesh(new THREE.BoxGeometry(2.18, 0.34, 0.52), white2);
    bumper.position.set(0, 0.68, 3.02);
    bumper.castShadow = true;
    this.body.add(bumper);

    const grille = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.28, 0.08), dark);
    grille.position.set(0, 1.18, 3.10);
    this.body.add(grille);

    const emblem = new THREE.Mesh(new THREE.CircleGeometry(0.11, 20), new THREE.MeshBasicMaterial({ color: 0xdadfe3, toneMapped: false }));
    emblem.position.set(0, 1.18, 3.15);
    this.body.add(emblem);

    // windshield and side windows - aligned height
    const wind = new THREE.Mesh(new THREE.PlaneGeometry(1.74, 0.84), glass);
    wind.position.set(0, 1.88, 2.94);
    wind.rotation.x = -0.42;
    this.body.add(wind);

    const sideWinGeo = new THREE.PlaneGeometry(0.72, 0.78);
    const leftWindow = new THREE.Mesh(sideWinGeo, glass);
    leftWindow.position.set(-1.08, 1.80, 2.08);
    leftWindow.rotation.y = Math.PI / 2;
    this.body.add(leftWindow);
    const rightWindow = new THREE.Mesh(sideWinGeo, glass);
    rightWindow.position.set(1.08, 1.80, 2.08);
    rightWindow.rotation.y = -Math.PI / 2;
    this.body.add(rightWindow);

    const quarterLeft = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.34), glass);
    quarterLeft.position.set(-1.08, 1.92, 2.63); quarterLeft.rotation.y = Math.PI / 2; this.body.add(quarterLeft);
    const quarterRight = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.34), glass);
    quarterRight.position.set(1.08, 1.92, 2.63); quarterRight.rotation.y = -Math.PI / 2; this.body.add(quarterRight);

    // over-cab and camper body - no skylight, flat roof
    const coach = new THREE.Mesh(new THREE.BoxGeometry(2.34, 2.25, 5.85), white);
    coach.position.set(0, 2.02, -0.35);
    coach.castShadow = coach.receiveShadow = true;
    this.body.add(coach);

    const roof = new THREE.Mesh(new THREE.BoxGeometry(2.38, 0.16, 5.9), white2);
    roof.position.set(0, 3.23, -0.35);
    roof.castShadow = true;
    this.body.add(roof);

    const overCab = new THREE.Mesh(new THREE.BoxGeometry(2.30, 0.88, 1.62), white);
    overCab.position.set(0, 2.72, 1.96);
    overCab.castShadow = true;
    this.body.add(overCab);

    const overCabFrontSlope = new THREE.Mesh(new THREE.BoxGeometry(2.26, 0.18, 0.82), white2);
    overCabFrontSlope.position.set(0, 2.40, 2.52);
    overCabFrontSlope.rotation.x = -0.32;
    this.body.add(overCabFrontSlope);

    // graphics
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0x4f5660, toneMapped: false });
    const stripe1 = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.18, 1.8), stripeMat);
    stripe1.position.set(-1.18, 1.56, -0.15); stripe1.rotation.y = -0.22; this.body.add(stripe1);
    const stripe2 = stripe1.clone(); stripe2.position.x = 1.18; stripe2.rotation.y = 0.22; this.body.add(stripe2);

    // left side door only
    const doorLine = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.55, 0.86), dark);
    doorLine.position.set(-1.19, 1.56, -0.30);
    this.body.add(doorLine);
    const doorWin = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.78), glass);
    doorWin.position.set(-1.17, 2.04, -0.32); doorWin.rotation.y = Math.PI / 2; this.body.add(doorWin);
    const doorHandle = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 0.12), dark);
    doorHandle.position.set(-1.17, 1.48, -0.52); this.body.add(doorHandle);

    // right side without door, only windows
    const sideWindows = [[-1.17, 1.95, 0.78], [-1.17, 2.18, -1.68], [1.17, 1.95, 0.75], [1.17, 2.12, -1.55], [1.17, 1.84, -0.25]];
    sideWindows.forEach(([x, y, z], idx) => {
      const w = idx < 2 ? 0.55 : 0.8;
      const h = idx < 2 ? 0.55 : 0.75;
      const pane = new THREE.Mesh(new THREE.PlaneGeometry(w, h), glass);
      pane.position.set(x, y, z);
      pane.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2;
      this.body.add(pane);
    });

    // rear window and ladder on rear-right
    const rearWindow = new THREE.Mesh(new THREE.PlaneGeometry(0.82, 0.6), glass);
    rearWindow.position.set(0, 2.02, -3.28);
    rearWindow.rotation.y = Math.PI;
    this.body.add(rearWindow);

    const ladder = new THREE.Group();
    const railGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.32, 10);
    const rungGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.38, 8);
    for (const x of [-0.18, 0.18]) {
      const rail = new THREE.Mesh(railGeo, metal); rail.position.set(x, 2.33, 0); ladder.add(rail);
    }
    for (let i = 0; i < 5; i++) {
      const rung = new THREE.Mesh(rungGeo, metal); rung.rotation.z = Math.PI / 2; rung.position.set(0, 1.80 + i * 0.28, 0); ladder.add(rung);
    }
    ladder.position.set(0.86, 0, -3.18);
    this.body.add(ladder);

    // mirrors
    const makeMirror = (x) => {
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.72, 8), dark);
      arm.rotation.z = x < 0 ? 0.96 : -0.96;
      arm.position.set(x * 1.2, 1.80, 2.52);
      this.body.add(arm);
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.46, 0.08), dark);
      head.position.set(x * 1.50, 1.95, 2.42);
      this.body.add(head);
    };
    makeMirror(-1); makeMirror(1);

    // lights
    const headLampGeo = new THREE.BoxGeometry(0.34, 0.18, 0.08);
    const headLightMat = new THREE.MeshBasicMaterial({ color: 0xfff4c4, toneMapped: false });
    this.headLights = [];
    this.headLightTargets = [];
    for (const x of [-0.72, 0.72]) {
      const lamp = new THREE.Mesh(headLampGeo, headLightMat);
      lamp.position.set(x, 0.98, 3.12);
      this.body.add(lamp);
      const spot = new THREE.SpotLight(0xfff4d1, 0, 34, 0.5, 0.65, 1.1);
      spot.position.set(x, 1.02, 2.95);
      const target = new THREE.Object3D();
      target.position.set(x * 0.65, -0.45, 13.5);
      this.body.add(spot);
      this.body.add(target);
      spot.target = target;
      this.headLights.push(spot);
      this.headLightTargets.push(target);
    }

    for (const x of [-0.97, 0.97]) {
      const tail = TailLampFactory.create("double", 0.42, 0.12);
      tail.position.set(x * 0.55, 1.02, -3.24);
      this.body.add(tail);
    }
    this.tailEmitters = [];
    for (const x of [-0.58, 0.58]) {
      const tailBulb = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.1, 0.06), redLamp);
      tailBulb.position.set(x, 1.02, -3.28);
      this.body.add(tailBulb);
      this.tailEmitters.push(tailBulb);
    }
    for (const x of [-0.95, 0.95]) {
      const blink = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.06), amber);
      blink.position.set(x, 0.84, 3.11);
      this.body.add(blink);
    }

    // additional cabin details
    const wiperGeo = new THREE.BoxGeometry(0.42, 0.03, 0.03);
    const wiper1 = new THREE.Mesh(wiperGeo, dark); wiper1.position.set(-0.42, 1.48, 2.86); wiper1.rotation.z = 0.20; this.body.add(wiper1);
    const wiper2 = new THREE.Mesh(wiperGeo, dark); wiper2.position.set(0.40, 1.48, 2.86); wiper2.rotation.z = -0.12; this.body.add(wiper2);

    const step = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.1, 0.85), dark);
    step.position.set(-1.08, 0.62, -0.35);
    this.body.add(step);

    // orientation fix: forward is +Z
    this.body.position.y = this.groundOffset;
  }

  update(delta) {
    if (!this.finished) {
      this.stats.elapsed += delta;
      this.hitCooldown = Math.max(0, this.hitCooldown - delta);
      this.updateDrive(delta);
    } else {
      this.speed = 0;
    }

    this.updateWheels(delta);
    this.updateLighting();
  }

  updateDrive(delta) {
    const input = this.input.keys;
    const forwardPressed = input.forward;
    const backwardPressed = input.backward;
    const steerInput = (input.left ? -1 : 0) + (input.right ? 1 : 0);

    if (forwardPressed || backwardPressed) this.started = true;

    if (forwardPressed) {
      this.speed += this.acceleration * delta;
    } else if (backwardPressed) {
      if (this.speed > 0) this.speed -= this.brakePower * delta;
      else this.speed -= this.acceleration * 0.9 * delta;
    } else {
      const drag = Math.min(Math.abs(this.speed), this.drag * delta);
      this.speed -= Math.sign(this.speed) * drag;
    }

    if (!forwardPressed && !backwardPressed && Math.abs(this.speed) < 0.03) this.speed = 0;
    this.speed = THREE.MathUtils.clamp(this.speed, -this.reverseSpeed, this.maxSpeed);

    const steerTarget = steerInput * 0.62;
    this.currentSteer = THREE.MathUtils.lerp(this.currentSteer, steerTarget, 5.2 * delta);
    const speedFactor = THREE.MathUtils.clamp(Math.abs(this.speed) / this.maxSpeed, 0, 1);
    const turnSign = this.speed >= 0 ? 1 : -1;
    this.yaw += this.currentSteer * this.turnRate * (0.22 + speedFactor * 0.78) * delta * turnSign;

    const forward = new THREE.Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw));
    this.position.addScaledVector(forward, this.speed * delta);

    const nearest = this.world.getNearestState(this.position, this.lastSampleIndex, 40);
    this.lastSampleIndex = nearest.index;
    this.progress = Math.max(this.progress, nearest.sample.t);

    const maxLateral = this.world.roadHalfWidth - 0.55;
    const hardLateral = this.world.roadHalfWidth + 0.55;
    const lateralAbs = Math.abs(nearest.lateral);
    if (lateralAbs > maxLateral) {
      if (this.hitCooldown <= 0) {
        this.stats.collisions += 1;
        this.hitCooldown = 0.35;
      }
      const over = lateralAbs - maxLateral;
      const correction = Math.min(0.20, over * 0.22);
      this.position.addScaledVector(nearest.sample.side, -Math.sign(nearest.lateral) * correction);
      this.speed *= 0.94;
      if (lateralAbs > hardLateral) {
        this.position.copy(nearest.sample.point.clone().addScaledVector(nearest.sample.side, Math.sign(nearest.lateral) * hardLateral));
        this.speed *= 0.88;
      }
    }

    // keep road height and gentle slope following
    this.position.y = nearest.sample.point.y;
    this.root.position.copy(this.position);
    this.root.rotation.y = this.yaw;

    // very light body motion only
    this.body.rotation.z = THREE.MathUtils.lerp(this.body.rotation.z, -this.currentSteer * speedFactor * 0.05, 4.0 * delta);
    this.body.rotation.x = THREE.MathUtils.lerp(this.body.rotation.x, -this.speed * 0.008, 3.5 * delta);

    if (this.progress >= 0.992) {
      this.finish();
    }
  }

  updateWheels(delta) {
    const spin = this.speed * delta * 2.25;
    this.wheels.forEach((wheel, index) => {
      wheel.rotation.x += spin;
      if (index < 2) wheel.rotation.y = this.currentSteer * 0.82;
      else wheel.rotation.y = 0;
    });
  }

  updateLighting() {
    const night = this.progress > 0.58;
    for (const light of this.headLights) {
      light.intensity = night ? 4.8 : 0;
    }
    for (const lamp of this.tailEmitters) {
      lamp.visible = night;
    }
  }

  finish() {
    if (this.finished) return;
    this.finished = true;
    this.stats.arrivalSpeed = this.speedKmh;
    this.speed = 0;
    this.game.ui.showFinish(this.getResult());
  }

  getResult() {
    const collisions = this.stats.collisions;
    const seconds = this.stats.elapsed;
    const titles = [];
    if (collisions === 0 && seconds <= 120) titles.push("パーフェクトヒューマン");
    if (seconds <= 120) titles.push("スピードキング");
    if (collisions >= 20) titles.push("期待のルーキー");
    else if (collisions >= 10) titles.push("ベテランドライバー");
    else if (collisions >= 1) titles.push("キャンピングカーの達人");
    if (titles.length === 0) titles.push("ロードトリップ完走者");
    return {
      title: titles[0],
      subtitles: titles.slice(1),
      collisions,
      seconds,
      arrivalSpeed: this.stats.arrivalSpeed
    };
  }

  reset() {
    const start = this.world.getPose(0.01, 0);
    this.position.copy(start.position);
    this.yaw = Math.atan2(start.tangent.x, start.tangent.z);
    this.root.position.copy(this.position);
    this.root.rotation.set(0, this.yaw, 0);
    this.body.rotation.set(0, 0, 0);
    this.speed = 0;
    this.currentSteer = 0;
    this.progress = 0;
    this.lastSampleIndex = 0;
    this.finished = false;
    this.started = false;
    this.hitCooldown = 0;
    this.stats = { collisions: 0, elapsed: 0, arrivalSpeed: 0 };
    this.input.reset();
  }
}
