import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.179/build/three.module.js";
import { Terrain } from "../world/Terrain.js";
import { TreeGenerator } from "../world/TreeGenerator.js";

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
    }

    createLights() {

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
