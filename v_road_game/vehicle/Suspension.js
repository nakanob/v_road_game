// vehicle/Suspension.js

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.179/build/three.module.js";

export class Suspension {

    constructor(vehicle) {

        this.vehicle = vehicle;

        this.terrain = vehicle.terrain;

        this.pitch = 0;
        this.roll = 0;

        this.smoothing = 6;

    }

    update(delta) {

        if (!this.vehicle.model) return;

        const position = this.vehicle.position;

        const direction = this.vehicle.direction;

        // Vehicle.jsで自動計算された値を利用
        const wheelBase =
            this.vehicle.wheelBase;

        const trackWidth =
            this.vehicle.trackWidth;

        const forward = new THREE.Vector3(

            Math.sin(direction),

            0,

            Math.cos(direction)

        );

        const right = new THREE.Vector3(

            forward.z,

            0,

            -forward.x

        );

        // 前輪中心
        const front = position.clone().add(

            forward.clone().multiplyScalar(

                this.vehicle.frontAxleOffset

            )

        );

        // 後輪中心
        const rear = position.clone().add(

            forward.clone().multiplyScalar(

                -this.vehicle.rearAxleOffset

            )

        );

        // 左右タイヤ
        const left = position.clone().add(

            right.clone().multiplyScalar(

                -trackWidth * 0.5

            )

        );

        const rightPos = position.clone().add(

            right.clone().multiplyScalar(

                trackWidth * 0.5

            )

        );

        const frontHeight =
            this.terrain.getHeight(

                front.x,

                front.z

            );

        const rearHeight =
            this.terrain.getHeight(

                rear.x,

                rear.z

            );

        const leftHeight =
            this.terrain.getHeight(

                left.x,

                left.z

            );

        const rightHeight =
            this.terrain.getHeight(

                rightPos.x,

                rightPos.z

            );

        const targetPitch = Math.atan2(

            frontHeight - rearHeight,

            wheelBase

        );

        const targetRoll = Math.atan2(

            leftHeight - rightHeight,

            trackWidth

        );

        this.pitch = THREE.MathUtils.lerp(

            this.pitch,

            targetPitch,

            this.smoothing * delta

        );

        this.roll = THREE.MathUtils.lerp(

            this.roll,

            targetRoll,

            this.smoothing * delta

        );

    }

}
