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

                // ↓↓↓ ここから追加 ↓↓↓

                this.position.set(
                    0,
                    this.terrain.getHeight(0, 0),
                    0
                );

                // ↑↑↑ ここまで追加 ↑↑↑

                this.updateTransform();

            },

            undefined,

            (error) => {

                console.error(error);

            }

        );

    }

    update(delta) {

        if (!this.vehicle.model) return;
    
        const forward = new THREE.Vector3(
    
            Math.sin(this.vehicle.direction),
    
            0,
    
            Math.cos(this.vehicle.direction)

        );

        const desiredPosition =
            this.vehicle.position.clone();

        desiredPosition.add(

            forward.clone().multiplyScalar(

                this.offset.z

            )

        );

        desiredPosition.y += this.offset.y;

        this.camera.position.lerp(

            desiredPosition,

            this.followSpeed * delta

        );

        this.lookTarget.copy(

            this.vehicle.position

        );

        this.lookTarget.y +=
            this.targetOffset.y;

        this.camera.lookAt(
            this.lookTarget
        );

    }

     updateTransform() {

        if (!this.model) return;

        this.model.position.copy(
            this.position
        );

        this.model.rotation.set(
            0,
            this.direction,
            0
        );

    }

}
