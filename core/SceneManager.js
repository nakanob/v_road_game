import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.179/build/three.module.js";
import { Terrain } from "../world/Terrain.js";
import { TreeGenerator } from "../world/TreeGenerator.js";
import { RockGenerator } from "../world/RockGenerator.js";
import { Vehicle } from "../vehicle/Vehicle.js";
import { FollowCamera } from "../vehicle/FollowCamera.js";
import { RoadGenerator } from "../world/RoadGenerator.js";
import { RiverGenerator } from "../world/RiverGenerator.js";
import { Dust } from "../effects/Dust.js";
import { TireTrack } from "../effects/TireTrack.js";
import { Smoke } from "../effects/Smoke.js";
import { HUD } from "../ui/HUD.js";
import { SpeedMeter } from "../ui/SpeedMeter.js";
import { MiniMap } from "../ui/MiniMap.js";
import { AssetLoader } from "./AssetLoader.js";
import { ChunkManager } from "../world/ChunkManager.js";
import { Sky } from "../world/Sky.js";
import { Sun } from "../world/Sun.js";
import { DayNightCycle } from "../world/DayNightCycle.js";
import { GrassGenerator } from "../world/GrassGenerator.js";
import { CollisionManager } from "../world/CollisionManager.js";
import { LoadingScreen } from "../ui/LoadingScreen.js";
import { PhotoMode } from "../ui/PhotoMode.js";
import { Wind } from "../weather/Wind.js";
import { Rain } from "../weather/Rain.js";
import { Snow } from "../weather/Snow.js";
import { Fog } from "../weather/Fog.js";
import { WeatherManager } from "../weather/WeatherManager.js";
import { Water } from "../world/Water.js";
import { Bridge } from "../world/Bridge.js";



export class SceneManager {

    constructor(containerId = "game") {

        this.container = document.getElementById(containerId);

        if (!this.container) {
            throw new Error(`Container "${containerId}" not found.`);
        }

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb);

        this.clock = new THREE.Clock();

        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            10000
        );

        this.camera.position.set(0, 40, 80);

        this.renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        this.renderer.outputColorSpace =
            THREE.SRGBColorSpace;

        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.container.appendChild(this.renderer.domElement);

        this.updatables = [];

        this.createLights();


        window.addEventListener(
            "resize",
            this.onResize.bind(this)
        );
        this.terrain = new Terrain(this);
        this.treeGenerator = new TreeGenerator(this);
        this.rockGenerator = new RockGenerator(this);
        this.vehicle = new Vehicle(this);
        this.register(this.vehicle);
        this.followCamera = new FollowCamera(
            this,
            this.vehicle
        );

        this.register(
            this.followCamera
        );
        this.roadGenerator = new RoadGenerator(this);
        this.riverGenerator = new RiverGenerator(this);


        this.dust = new Dust(
            this,
            this.vehicle
        );

        this.register(
            this.dust
        );
        this.tireTrack = new TireTrack(
            this,
            this.vehicle
        );

        this.register(
            this.tireTrack
        );
        this.smoke = new Smoke(
            this,
            this.vehicle
        );

        this.register(
            this.smoke
        );
        this.hud = new HUD(
            this,
            this.vehicle
        );

        this.register(
            this.hud
        );
        this.speedMeter = new SpeedMeter(
            this,
            this.vehicle
        );

        this.register(
            this.speedMeter
        );
        this.miniMap = new MiniMap(
            this,
            this.vehicle
        );

        this.register(
            this.miniMap
        );
        this.assetLoader = new AssetLoader();
        // core/SceneManager.js
        // constructor() の assetLoader 作成直後へ追加

        this.loadingScreen =

        new LoadingScreen();

        this.assetLoader.onProgress(

            (percent) => {

                this.loadingScreen.setProgress(

                    percent

                );

                if (percent >= 100) {

                    this.loadingScreen.hide();

                }

            }

        );

        
        this.chunkManager = new ChunkManager(this);

        this.register(
            this.chunkManager
        );
        this.dayNightCycle = new DayNightCycle(this);

        this.register(
            this.dayNightCycle
        );
        this.grassGenerator = new GrassGenerator(this);
        this.collisionManager =
            new CollisionManager(this);

        this.register(
            this.collisionManager
        );
        this.photoMode = new PhotoMode(this);


        this.wind = new Wind(this);

        this.register(this.wind);
        this.rain = new Rain(this);

        this.register(
            this.rain
        );
        this.snow = new Snow(this);

        this.register(
            this.snow
        );
        this.fog = new Fog(this);
        this.weatherManager =

        new WeatherManager(this);
        this.water = new Water(this);

        this.register(
            this.water
        );
        this.bridge = new Bridge(this);


        
    }

    createLights() {
        this.sky = new Sky(this);
        this.sun = new Sun(this);

        this.register(
            this.sun
        );
        this.ambientLight = new THREE.AmbientLight(
            0xffffff,
            1.2
        );

        this.scene.add(this.ambientLight);

        this.sunLight = new THREE.DirectionalLight(
            0xffffff,
            2.8
        );

        this.sunLight.position.set(
            300,
            400,
            200
        );

        this.sunLight.castShadow = true;

        this.sunLight.shadow.mapSize.width = 4096;
        this.sunLight.shadow.mapSize.height = 4096;

        this.sunLight.shadow.camera.left = -500;
        this.sunLight.shadow.camera.right = 500;
        this.sunLight.shadow.camera.top = 500;
        this.sunLight.shadow.camera.bottom = -500;

        this.sunLight.shadow.camera.near = 0.5;
        this.sunLight.shadow.camera.far = 1500;

        this.scene.add(this.sunLight);
        const axesHelper = new THREE.AxesHelper(5);

        this.scene.add(
            axesHelper
        );

        this.scene.add(
            this.sunLight.target
        );
    }

    add(object) {

        this.scene.add(object);

    }

    remove(object) {

        this.scene.remove(object);

    }

    register(object) {

        if (!this.updatables.includes(object)) {

            this.updatables.push(object);

        }

    }

    unregister(object) {

        const index = this.updatables.indexOf(object);

        if (index >= 0) {

            this.updatables.splice(index, 1);

        }

    }

    update() {

        const delta = this.clock.getDelta();

        for (const object of this.updatables) {

            if (object.update) {

                object.update(delta);

            }

        }

    }

    render() {

        this.renderer.render(
            this.scene,
            this.camera
        );

    }

    onResize() {

        this.camera.aspect =
            window.innerWidth / window.innerHeight;

        this.camera.updateProjectionMatrix();

        this.renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

    }

}
