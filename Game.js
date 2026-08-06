// ============================================================================
// Game.js
// Part 1
// V11
// 全システム統合
// ============================================================================

import * as THREE from "three";

import TrackWorld from "./world/TrackWorld.js";
import LightingManager from "./world/LightingManager.js";
import EnvironmentController from "./world/EnvironmentController.js";

import Vehicle from "./vehicle/Vehicle.js";
import CameraController from "./vehicle/CameraController.js";

import HUD from "./ui/HUD.js";

export default class Game{

    constructor(renderer,scene,camera){

        this.renderer=renderer;
        this.scene=scene;
        this.camera=camera;

        //--------------------------------
        // World
        //--------------------------------

        this.world=
            new TrackWorld(scene);

        //--------------------------------
        // Lighting
        //--------------------------------

        this.lighting=
            new LightingManager(

                scene,

                renderer

            );

        //--------------------------------
        // Area
        //--------------------------------

        this.environment=

            new EnvironmentController(

                this.world

            );

        //--------------------------------
        // Vehicle
        //--------------------------------

        this.vehicle=

            new Vehicle(

                this

            );

        //--------------------------------
        // Camera
        //--------------------------------

        this.cameraController=

            new CameraController(

                camera,

                this.vehicle

            );

        //--------------------------------
        // UI
        //--------------------------------

        this.ui=

            new HUD(

                this

            );

        //--------------------------------

        this.environment.onAreaChanged(

            area=>{

                this.lighting.setArea(

                    area

                );

            }

        );

        //--------------------------------

        this.clock=

            new THREE.Clock();

    }

    //=========================================================================
    // 初期化
    //=========================================================================

    async initialize(){

        await this.world.build();

        await this.vehicle.build();

        this.vehicle.reset();

    }

    //=========================================================================
    // 毎フレーム
    //=========================================================================

    update(){

        const delta=

            this.clock.getDelta();

        //--------------------------------
        // 車
        //--------------------------------

        this.vehicle.update(

            delta

        );

        //--------------------------------
        // エリア
        //--------------------------------

        this.environment.update(

            this.vehicle.progress

        );

        //--------------------------------
        // ライト
        //--------------------------------

        this.lighting.update(

            delta

        );

        //--------------------------------
        // カメラ
        //--------------------------------

        this.cameraController.update(

            delta

        );

        //--------------------------------
        // UI
        //--------------------------------

        this.ui.update(

            delta

        );

        //--------------------------------
        // ワールド
        //--------------------------------

        this.world.update(

            delta,

            this.vehicle

        );

    }

    //=========================================================================
    // リスタート
    //=========================================================================

    restart(){

        this.vehicle.reset();

        this.ui.hideResult();

        this.environment.currentArea=

            "town";

        this.lighting.setArea(

            "town"

        );

    }

}

