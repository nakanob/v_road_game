// vehicle/Vehicle.js

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.179/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.179/examples/jsm/loaders/GLTFLoader.js";

import { InputManager } from "./InputManager.js";
import { VehicleController } from "./VehicleController.js";
this.controller =
    new VehicleController(this);


export class Vehicle {

    constructor(sceneManager) {

        this.sceneManager = sceneManager;
        this.scene = sceneManager.scene;
        this.terrain = sceneManager.terrain;

        this.input = new InputManager();

        this.loader = new GLTFLoader();

        this.model = null;

        this.position = new THREE.Vector3(
            0,
            0,
            0
        );

        this.direction = 0;

        this.speed = 0;

        this.maxSpeed = 35;
        this.acceleration = 18;
        this.brakePower = 32;
        this.friction = 8;

        this.steering = THREE.MathUtils.degToRad(90);

        this.load();

    }

    load() {

        this.loader.load(

            "./models/vehicles/car.glb",

            (gltf) => {

                this.model = gltf.scene;

                this.model.traverse((child) => {

                    if (child.isMesh) {

                        child.castShadow = true;
                        child.receiveShadow = true;

                    }

                });

                this.scene.add(this.model);

                this.updateTransform();

            },

            undefined,

            (error) => {

                console.error(error);

            }

        );

    }

    update(delta) {

        if (!this.model) return;

        if (this.input.keys.forward) {

            this.speed +=
                this.acceleration * delta;

        }

        if (this.input.keys.backward) {

            this.speed -=
                this.acceleration * delta;

        }

        if (this.input.keys.brake) {

            if (this.speed > 0) {

                this.speed -=
                    this.brakePower * delta;

            } else {

                this.speed +=
                    this.brakePower * delta;

            }

        }

        if (!this.input.keys.forward &&
            !this.input.keys.backward) {

            if (this.speed > 0) {

                this.speed -=
                    this.friction * delta;

                if (this.speed < 0)
                    this.speed = 0;

            }

            if (this.speed < 0) {

                this.speed +=
                    this.friction * delta;

                if (this.speed > 0)
                    this.speed = 0;

            }

        }

        this.speed = THREE.MathUtils.clamp(

            this.speed,

            -this.maxSpeed * 0.4,

            this.maxSpeed

        );

        const steerSpeed =

            THREE.MathUtils.clamp(

                Math.abs(this.speed) / this.maxSpeed,

                0,

                1

            );

        if (this.input.keys.left) {

            this.direction +=

                this.steering *

                steerSpeed *

                delta;

        }

        if (this.input.keys.right) {

            this.direction -=

                this.steering *

                steerSpeed *

                delta;

        }

        this.position.x +=

            Math.sin(this.direction) *

            this.speed *

            delta;

        this.position.z +=

            Math.cos(this.direction) *

            this.speed *

            delta;

        this.position.y =

            this.terrain.getHeight(

                this.position.x,

                this.position.z

            );

        this.updateTransform();

    }

    updateTransform() {

        this.model.position.copy(

            this.position

        );

        this.model.rotation.y =

            this.direction;

    }

}
