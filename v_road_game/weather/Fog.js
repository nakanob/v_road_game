// weather/Fog.js

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.179/build/three.module.js";

export class Fog {

    constructor(sceneManager) {

        this.sceneManager = sceneManager;

        this.scene = sceneManager.scene;

        this.enabled = false;

        this.scene.fog = new THREE.Fog(

            0xd9e6ef,

            250,

            900

        );

        this.scene.fog.near = 10000;

        this.scene.fog.far = 10001;

        window.addEventListener(

            "keydown",

            (event) => {

                if (event.code === "F7") {

                    this.toggle();

                }

            }

        );

    }

    toggle() {

        this.enabled = !this.enabled;

        if (this.enabled) {

            this.scene.fog.near = 250;

            this.scene.fog.far = 900;

        }

        else {

            this.scene.fog.near = 10000;

            this.scene.fog.far = 10001;

        }

    }

}
