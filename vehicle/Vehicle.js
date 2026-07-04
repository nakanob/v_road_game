// vehicle/Vehicle.js

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.179/build/three.module.js";

import { GLTFLoader } from "https://unpkg.com/three@0.179.1/examples/jsm/loaders/GLTFLoader.js?module";

import { InputManager } from "./InputManager.js";
import { VehicleController } from "./VehicleController.js";
import { Suspension } from "./Suspension.js";
import { WheelAnimator } from "./WheelAnimator.js";
import { EngineSound } from "./EngineSound.js";
import { VehicleReset } from "./VehicleReset.js";




export class Vehicle {

    constructor(sceneManager) {

        this.sceneManager = sceneManager;
        this.scene = sceneManager.scene;
        this.terrain = sceneManager.terrain;

        this.assetLoader = sceneManager.assetLoader;

        this.input = new InputManager();
        this.controller =
            new VehicleController(this);

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
        this.suspension =
        new Suspension(this);
        
        this.wheelAnimator =
        new WheelAnimator(this);

        this.engineSound =
        new EngineSound(this);
        
        this.vehicleReset =
        new VehicleReset(this);
    }

    async load() {

        try {

            let model =
            this.assetLoader.getModel(
                "vehicle"
            );

            if (!model) {

                await this.assetLoader.loadGLB(

                    "vehicle",

                    "./models/car.glb"

                );

                model =
                    this.assetLoader.getModel(
                        "vehicle"
                );

            }

            this.model = model;

            this.model.scale.setScalar(200);

            this.model.updateMatrixWorld(true);

            this.model.traverse((child) => {

                if (child.isMesh) {

                    child.castShadow = true;

                    child.receiveShadow = true;

                }

            });

            this.scene.add(this.model);

this.position.set(
    0,
    20,
    0
);

            this.updateTransform();

        }

        catch (error) {

            console.error(error);

        }

    }

    update(delta) {

        if (!this.model) return;

        this.controller.update(delta);
        
        this.wheelAnimator.update(delta);

        this.suspension.update(delta);

        this.updateTransform();

        this.engineSound.update();
        
        this.position.y =
        this.terrain.getHeight(
            this.position.x,
            this.position.z
        );

    }


    
    updateTransform() {

        if (!this.model) return;

        this.model.position.copy(
            this.position
        );

        this.model.rotation.set(

            this.suspension.pitch,

            this.direction,

            this.suspension.roll

        );

    }

}
