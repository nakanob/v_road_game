// weather/Wind.js

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.179/build/three.module.js";

export class Wind {

    constructor(sceneManager) {

        this.sceneManager = sceneManager;

        this.time = 0;

        this.direction = new THREE.Vector3(1, 0, 0);

        this.strength = 0.6;

    }

    update(delta) {

        this.time += delta;

        this.direction.set(

            Math.cos(this.time * 0.05),

            0,

            Math.sin(this.time * 0.05)

        ).normalize();

        this.strength =

            0.4 +

            Math.sin(this.time * 0.12) * 0.2;

    }

}
