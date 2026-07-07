// weather/Rain.js

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.179/build/three.module.js";

export class Rain {

    constructor(sceneManager) {

        this.sceneManager = sceneManager;

        this.scene = sceneManager.scene;

        this.vehicle = sceneManager.vehicle;

        this.count = 2600;

        this.area = 180;

        this.speed = 80;

        this.enabled = false;

        this.geometry = new THREE.BufferGeometry();

        const positions = new Float32Array(

            this.count * 3

        );

        for (let i = 0; i < this.count; i++) {

            positions[i * 3] = (Math.random() - 0.5) * this.area;

            positions[i * 3 + 1] = Math.random() * 80;

            positions[i * 3 + 2] = (Math.random() - 0.5) * this.area;

        }

        this.geometry.setAttribute(

            "position",

            new THREE.BufferAttribute(

                positions,

                3

            )

        );

        const material = new THREE.PointsMaterial({

            color: 0xaed8ff,

            size: 0.18,

            transparent: true,

            opacity: 0.8,

            depthWrite: false

        });

        this.points = new THREE.Points(

            this.geometry,

            material

        );

        this.points.visible = false;

        this.scene.add(this.points);

        window.addEventListener(

            "keydown",

            (event) => {

                if (event.repeat) return;

                if (event.code === "F5") {

                    this.enabled = !this.enabled;

                    this.points.visible = this.enabled;

                }

            }

        );

    }

    update(delta) {

        if (!this.enabled) return;

        this.points.position.x =

            this.vehicle.position.x;

        this.points.position.z =

            this.vehicle.position.z;

        const positions =

            this.geometry.attributes.position.array;

        for (let i = 0; i < this.count; i++) {

            positions[i * 3 + 1] -=

                this.speed * delta;

            if (positions[i * 3 + 1] < 0) {

                positions[i * 3 + 1] = 80;

            }

        }

        this.geometry.attributes.position.needsUpdate = true;

    }

}
