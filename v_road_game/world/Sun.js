// world/Sun.js

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.179/build/three.module.js";

export class Sun {

    constructor(sceneManager) {

        this.sceneManager = sceneManager;

        this.scene = sceneManager.scene;

        this.light = sceneManager.sunLight;

        this.angle = THREE.MathUtils.degToRad(45);

        this.distance = 1200;

        this.speed = 0.01;

        this.target = new THREE.Vector3();

        this.initialize();

    }

    initialize() {

        this.light.castShadow = true;

        this.light.shadow.mapSize.set(
            4096,
            4096
        );

        this.light.shadow.camera.left = -500;
        this.light.shadow.camera.right = 500;
        this.light.shadow.camera.top = 500;
        this.light.shadow.camera.bottom = -500;

        this.updateLight();

    }

    update(delta) {

        this.angle += this.speed * delta;

        if (this.angle > Math.PI * 2) {

            this.angle -= Math.PI * 2;

        }

        this.updateLight();

    }

    updateLight() {

        const x =
            Math.cos(this.angle) *
            this.distance;

        const y =
            Math.sin(this.angle) *
            this.distance;

        const z =
            Math.sin(this.angle * 0.35) *
            this.distance * 0.4;

        this.light.position.set(
            x,
            y,
            z
        );

        this.light.target.position.copy(
            this.target
        );

        this.light.target.updateMatrixWorld();

    }

}
