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
        // モデル寸法
        this.dimensions = {
        
            width: 0,
        
            height: 0,
        
            length: 0
        
        };
        
        // GroundPivot補正
        this.groundOffset = 0;
        
        // ホイール位置
        this.wheelBase = 0;
        
        this.trackWidth = 0;
        
        this.frontAxleOffset = 0;
        
        this.rearAxleOffset = 0;
        this.dimensions = {
        
            width: 4.75,
        
            length: 10.9,
        
            height: 3.1
        
        };
        
        // 前後タイヤ中心距離
        this.wheelBase = 6.2;
        
        // 左右タイヤ中心距離
        this.trackWidth = 2.1;
        
        // 後輪中心までの距離
        this.rearAxleOffset =
            this.wheelBase * 0.5;
        
        this.wheelBase = 0;

        this.rearAxleOffset = 0;
        
        this.groundOffset = 0;
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
        this.headLights = [];
        this.tailLights = [];


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
            //------------------------------------
            // モデルサイズ取得
            //------------------------------------
            
            const box = new THREE.Box3().setFromObject(
                this.model
            );
            
            const size = new THREE.Vector3();
            
            box.getSize(size);
            
            // 本番車両の横幅(m)
            const targetWidth = 2.35;
            
            // GLBを実車サイズへ合わせる
            const scale =
                targetWidth / size.x;
            
            this.model.scale.setScalar(scale);
            
            // 再取得
            box.setFromObject(this.model);
            
            box.getSize(size);
            
            // 保存
            this.dimensions.width = size.x;
            
            this.dimensions.height = size.y;
            
            this.dimensions.length = size.z;


            
            // モデル中心
            const center =
                new THREE.Vector3();
            
            box.getCenter(center);
            
            // タイヤ半径を推定
            const wheelRadius =
                this.dimensions.height * 0.17;
            
            // GroundOffset
            this.groundOffset =
                wheelRadius - box.min.y;

            // 前後ホイール位置
            this.wheelBase =
                this.dimensions.length * 0.58;
            
            // 左右ホイール位置
            this.trackWidth =
                this.dimensions.width * 0.84;
            
            this.frontAxleOffset =
                this.wheelBase * 0.5;
            
            this.rearAxleOffset =
                this.wheelBase * 0.5;

            

            console.log("Vehicle Size");
            
            console.log(this.dimensions);
            
            console.log("GroundOffset");
            
            console.log(this.groundOffset);
            
            console.log("WheelBase");
            
            console.log(this.wheelBase);
            
            console.log("TrackWidth");
            
            console.log(this.trackWidth);


            
            this.pivot = new THREE.Group();
            
            this.scene.add(this.pivot);
            
            this.pivot.add(this.model);
            
            this.model.updateMatrixWorld(true);


            
            this.dimensions.width = size.x;
            
            this.dimensions.height = size.y;
            
            this.dimensions.length = size.z;

            // 車長からホイールベースを推定
            this.wheelBase = this.dimensions.length * 0.62;
            
            // 車体中心から後輪までの距離
            this.rearAxleOffset = this.wheelBase * 0.5;
            
            this.groundOffset = -box.min.y;
            
            console.log(this.dimensions);
            
            console.log(this.groundOffset);

            this.model.traverse((child) => {

                if (child.isMesh) {

                    child.castShadow = true;

                    child.receiveShadow = true;

                }

            });

  //          this.scene.add(this.model);

            this.position.set(
                0,
                20,
                0
            );

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

        this.updateTransform();

        this.engineSound.update();
        this.updateLights();
        this.position.y =
        this.terrain.getHeight(
            this.position.x,
            this.position.z
        );

    }


    
    updateTransform() {

        if (!this.model) return;

        this.pivot.position.copy(this.position);
        const tireCompression = 0.03;
        this.model.position.set(
        
            0,
        
            this.groundOffset - tireCompression,
        
            0
        
        );

        this.model.rotation.set(

            this.suspension.pitch,

            this.direction,

            this.suspension.roll

        );

    }
    createLights() {

    const front =
        this.dimensions.length * 0.48;

    const rear =
        this.dimensions.length * 0.48;

    const halfWidth =
        this.dimensions.width * 0.42;

    const lightHeight =
        this.dimensions.height * 0.45;

    // 左ヘッドライト
    this.createHeadLight(
        -halfWidth,
        lightHeight,
        front
    );

    // 右ヘッドライト
    this.createHeadLight(
        halfWidth,
        lightHeight,
        front
    );

    // 左テールランプ
    this.createTailLight(
        -halfWidth,
        lightHeight,
        -rear
    );

    // 右テールランプ
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

    light.position.set(x, y, z);

    light.target.position.set(
        x,
        y - 0.2,
        z + 30
    );

    this.pivot.add(light);

    this.model.add(light.target);

    this.pivot.add(light.target);

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
