// world/DayNightCycle.js

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.179/build/three.module.js";

export class DayNightCycle {

    constructor(sceneManager) {

        this.sceneManager = sceneManager;

        this.scene = sceneManager.scene;

        this.sun = sceneManager.sun;

        this.sunLight = sceneManager.sunLight;

        this.ambientLight = sceneManager.ambientLight;

        this.time = 0.35;

        this.dayLength = 600;

    }

    update(delta) {

        this.time += delta / this.dayLength;

        if (this.time >= 1) {

            this.time -= 1;

        }

        const angle = this.time * Math.PI * 2;

        this.sun.angle = angle;

        const intensity = Math.max(

            0,

            Math.sin(angle)

        );

        this.sunLight.intensity =

            THREE.MathUtils.lerp(

                0.15,

                2.8,

                intensity

            );

        this.ambientLight.intensity =

            THREE.MathUtils.lerp(

                0.2,

                1.2,

                intensity

            );

        if (this.scene.background) {

            this.scene.background.lerpColors(

                new THREE.Color(0x061426),

                new THREE.Color(0x87ceeb),

                intensity

            );

        }

    }

}
