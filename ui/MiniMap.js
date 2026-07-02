// ui/MiniMap.js

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.179/build/three.module.js";

export class MiniMap {

    constructor(sceneManager, vehicle) {

        this.sceneManager = sceneManager;
        this.scene = sceneManager.scene;
        this.vehicle = vehicle;

        this.size = 220;
        this.worldSize = 2000;

        this.camera = new THREE.OrthographicCamera(
            -120,
            120,
            120,
            -120,
            1,
            1000
        );

        this.camera.up.set(0, 0, -1);
        this.camera.lookAt(0, -1, 0);

        this.renderer = new THREE.WebGLRenderer({

            antialias: true,
            alpha: true

        });

        this.renderer.setSize(
            this.size,
            this.size
        );

        this.renderer.setPixelRatio(
            window.devicePixelRatio
        );

        this.renderer.domElement.id = "minimap";

        document.body.appendChild(
            this.renderer.domElement
        );

    }

    update() {

        if (!this.vehicle.model) return;

        this.camera.position.set(

            this.vehicle.position.x,

            180,

            this.vehicle.position.z

        );

        this.camera.lookAt(

            this.vehicle.position.x,

            0,

            this.vehicle.position.z

        );

        this.renderer.render(

            this.scene,

            this.camera

        );

    }

}
