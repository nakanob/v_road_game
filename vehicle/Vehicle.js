// vehicle/Vehicle.js
// ====== Part 1 / 3 ======

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

        this.loader = new GLTFLoader();

        this.model = null;
        this.pivot = null;

        this.input = new InputManager();

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

        this.steering =
            THREE.MathUtils.degToRad(90);

        this.dimensions = {

            width: 0,

            height: 0,

            length: 0

        };

        this.groundOffset = 0;

        this.wheelBase = 0;

        this.trackWidth = 0;

        this.frontAxleOffset = 0;

        this.rearAxleOffset = 0;

        this.headLights = [];

        this.tailLights = [];

        this.controller =
            new VehicleController(this);

        this.suspension =
            new Suspension(this);

        this.wheelAnimator =
            new WheelAnimator(this);

        this.engineSound =
            new EngineSound(this);

        this.vehicleReset =
            new VehicleReset(this);

        this.load();

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

            //----------------------------------
            // 実車サイズへ自動スケール
            //----------------------------------

            const box =
                new THREE.Box3()
                    .setFromObject(
                        this.model
                    );

            const size =
                new THREE.Vector3();

            box.getSize(size);

            const targetWidth = 2.35;

            const scale =
                targetWidth / size.x;

            this.model.scale.setScalar(scale);

            this.model.updateMatrixWorld(true);

            box.setFromObject(this.model);

            box.getSize(size);

            this.dimensions.width =
                size.x;

            this.dimensions.height =
                size.y;

            this.dimensions.length =
                size.z;

            //----------------------------------
            // GroundPivot生成
            //----------------------------------

            this.pivot =
                new THREE.Group();

            this.scene.add(
                this.pivot
            );

            this.pivot.add(
                this.model
            );

            //----------------------------------
            // GroundOffset
            //----------------------------------

            const wheelRadius =
                this.dimensions.height * 0.17;

            this.groundOffset =
                wheelRadius - box.min.y;

            //----------------------------------
            // 車両寸法
            //----------------------------------

            this.wheelBase =
                this.dimensions.length * 0.60;

            this.trackWidth =
                this.dimensions.width * 0.84;

            this.frontAxleOffset =
                this.wheelBase * 0.5;

            this.rearAxleOffset =
                this.wheelBase * 0.5;

            //----------------------------------
            // GroundPivotへ追加
            //----------------------------------

            this.model.position.set(

                0,

                this.groundOffset,

                0

            );

            this.model.rotation.set(

                0,

                0,

                0

            );

            //----------------------------------
            // 影設定
            //----------------------------------

            this.model.traverse((child) => {

                if (!child.isMesh) return;

                child.castShadow = true;

                child.receiveShadow = true;

            });

            //----------------------------------
            // 初期位置
            //----------------------------------

            this.position.set(

                0,

                20,

                0

            );

            //----------------------------------
            // 初回更新
            //----------------------------------

            this.updateTransform();

            this.createLights();

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

        this.position.y =

            this.terrain.getHeight(

                this.position.x,

                this.position.z

            );

        this.updateTransform();

        this.engineSound.update();

        this.updateLights();

    }

    updateTransform() {

        if (!this.model) return;

        //----------------------------------
        // Pivot
        //----------------------------------

        this.pivot.position.copy(

            this.position

        );

        this.pivot.rotation.y =

            this.direction;

        //----------------------------------
        // サスペンション
        //----------------------------------

        const tireCompression = 0.03;

        this.model.position.set(

            0,

            this.groundOffset -

            tireCompression,

            0

        );

        this.model.rotation.set(

            this.suspension.pitch,

            0,

            this.suspension.roll

        );

    }

    createLights() {

        const front =

            this.dimensions.length * 0.48;

        const rear =

            this.dimensions.length * 0.48;

        const halfWidth =

            this.trackWidth * 0.5;

        const lightHeight =

            this.dimensions.height * 0.45;

        this.createHeadLight(

            -halfWidth,

            lightHeight,

            front

        );

        this.createHeadLight(

            halfWidth,

            lightHeight,

            front

        );

        this.createTailLight(

            -halfWidth,

            lightHeight,

            -rear

        );

        this.createTailLight(

            halfWidth,

            lightHeight,

            -rear

        );

    }

    createHeadLight(x, y, z) {

        const light =

            new THREE.SpotLight(

                0xffffff,

                0

            );

        light.distance = 80;

        light.angle = 0.35;

        light.penumbra = 0.5;

        light.decay = 2;

        light.position.set(

            x,

            y,

            z

        );

        light.target.position.set(

            x,

            y - 0.2,

            z + 30

        );

        this.pivot.add(light);

        this.pivot.add(light.target);

        this.headLights.push(light);

    }
        createTailLight(x, y, z) {

        const geometry =

            new THREE.SphereGeometry(

                0.08,

                12,

                12

            );

        const material =

            new THREE.MeshBasicMaterial({

                color: 0xff2020

            });

        const mesh =

            new THREE.Mesh(

                geometry,

                material

            );

        mesh.position.set(

            x,

            y,

            z

        );

        mesh.visible = false;

        this.pivot.add(mesh);

        this.tailLights.push(mesh);

    }

    updateLights() {

        const isNight =

            this.sceneManager.sun

                ? this.sceneManager.sun.isNight

                : false;

        for (const light of this.headLights) {

            light.intensity =

                isNight ? 35 : 0;

        }

        for (const lamp of this.tailLights) {

            lamp.visible = isNight;

        }

    }

}
