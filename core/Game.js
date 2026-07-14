import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.179/build/three.module.js";
import { TrackWorld } from "../world/TrackWorld.js";
import { AreaEnvironment } from "../world/AreaEnvironment.js";
import { Vehicle } from "../vehicle/Vehicle.js";
import { CameraController } from "../vehicle/CameraController.js";
import { Dust } from "../effects/Dust.js";
import { GameUI } from "../ui/GameUI.js";

export class Game {
  constructor(container) {
    this.container = container;
    this.clock = new THREE.Clock();
    this.running = false;
    this.updatables = [];

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xb9d8e7);
    this.scene.fog = new THREE.Fog(0xb9d8e7, 160, 520);

    this.camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, 0.1, 1600);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 800 ? 1.25 : 1.5));
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    this.ambient = new THREE.HemisphereLight(0xdceeff, 0x5d5748, 1.7);
    this.sun = new THREE.DirectionalLight(0xfff0cf, 2.5);
    this.sun.position.set(-70, 110, -50);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(1024, 1024);
    this.sun.shadow.camera.left = -90;
    this.sun.shadow.camera.right = 90;
    this.sun.shadow.camera.top = 90;
    this.sun.shadow.camera.bottom = -90;
    this.sun.shadow.camera.near = 1;
    this.sun.shadow.camera.far = 300;
    this.scene.add(this.ambient, this.sun, this.sun.target);

    addEventListener("resize", () => this.resize());
  }

  async init() {
    this.world = new TrackWorld(this);
    this.environment = new AreaEnvironment(this);
    this.vehicle = new Vehicle(this, this.world);
    await this.vehicle.load("./models/car.glb");
    this.cameraController = new CameraController(this, this.vehicle);
    this.dust = new Dust(this, this.vehicle, this.world);
    this.ui = new GameUI(this, this.vehicle, this.world);
    this.updatables.push(this.vehicle, this.cameraController, this.dust, this.ui);
    this.environment.applyArea(0, true);
    document.getElementById("loading").style.opacity = "0";
    setTimeout(() => document.getElementById("loading").remove(), 480);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.clock.start();
    this.loop();
  }

  loop = () => {
    if (!this.running) return;
    requestAnimationFrame(this.loop);
    const delta = Math.min(this.clock.getDelta(), 0.05);
    for (const item of this.updatables) item.update?.(delta);
    this.environment.update(this.vehicle.progress, delta);
    this.renderer.render(this.scene, this.camera);
  };

  reset() {
    this.vehicle.reset();
    this.cameraController.reset();
    this.ui.reset();
    this.environment.applyArea(0, true);
  }

  resize() {
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 800 ? 1.25 : 1.5));
  }
}
