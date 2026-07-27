// ============================================================================
// vehicle/CameraController.js
// Part 1
// カメラ改善版
// ・車の揺れに追従しない
// ・カクつき解消
// ・右スティック対応準備
// ============================================================================

import * as THREE from "three";

export default class CameraController {

    constructor(camera, vehicle) {

        this.camera = camera;

        this.vehicle = vehicle;

        this.distance = 8.5;

        this.height = 3.2;

        this.lookHeight = 1.2;

        this.smoothPosition = new THREE.Vector3();

        this.smoothLook = new THREE.Vector3();

        this.yaw = 0;

        this.pitch = 0.18;

        this.freeLook = false;

        this.rotateSpeed = 2.2;

        this.minPitch = -0.18;

        this.maxPitch = 0.52;

        this.initialized = false;

    }

    //=========================================================================
    // 毎フレーム
    //=========================================================================

    update(delta) {

        if (!this.vehicle.root) return;

        //------------------------------------
        // 車体位置
        //------------------------------------

        const base =

            this.vehicle.root.position.clone();

        //------------------------------------
        // 車体の向きだけ使う
        // サスペンションの揺れは無視
        //------------------------------------

        if (!this.freeLook) {

            this.yaw =

                this.vehicle.heading;

        }

        //------------------------------------
        // カメラ位置
        //------------------------------------

        const offset =

            new THREE.Vector3(

                Math.sin(this.yaw) * this.distance,

                this.height,

                Math.cos(this.yaw) * this.distance

            );

        offset.multiplyScalar(-1);

        const targetPosition =

            base.clone().add(offset);

        //------------------------------------
        // 注視点
        //------------------------------------

        const targetLook =

            base.clone();

        targetLook.y +=

            this.lookHeight;

        //------------------------------------
        // 初回
        //------------------------------------

        if (!this.initialized) {

            this.initialized = true;

            this.smoothPosition.copy(

                targetPosition

            );

            this.smoothLook.copy(

                targetLook

            );

        }

        //------------------------------------
        // スムージング
        //------------------------------------

        this.smoothPosition.lerp(

            targetPosition,

            1 -

            Math.exp(

                -delta * 7

            )

        );

        this.smoothLook.lerp(

            targetLook,

            1 -

            Math.exp(

                -delta * 10

            )

        );

        //------------------------------------
        // 適用
        //------------------------------------

        this.camera.position.copy(

            this.smoothPosition

        );

        this.camera.lookAt(

            this.smoothLook

        );

    }

    //=========================================================================
    // 右スティック用
    //=========================================================================

    rotate(dx, dy) {

        this.freeLook = true;

        this.yaw -=

            dx *

            this.rotateSpeed;

        this.pitch +=

            dy *

            this.rotateSpeed;

        this.pitch =

            THREE.MathUtils.clamp(

                this.pitch,

                this.minPitch,

                this.maxPitch

            );

    }

    //=========================================================================
    // 車の後ろへ戻す
    //=========================================================================

    resetBehindVehicle() {

        this.freeLook = false;

    }

}
