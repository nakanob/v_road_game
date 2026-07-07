// vehicle/FollowCamera.js

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.179/build/three.module.js";

export class FollowCamera {

    constructor(sceneManager, vehicle) {

        this.sceneManager = sceneManager;

        this.camera = sceneManager.camera;

        this.vehicle = vehicle;

        this.offset = new THREE.Vector3(
            0,
            8,
            -18
        );

        this.targetOffset = new THREE.Vector3(
            0,
            3,
            0
        );

        this.cameraPosition = new THREE.Vector3();

        this.lookTarget = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.desiredPosition = new THREE.Vector3();

        this.followSpeed = 6;

        this.lookSpeed = 8;

    }

    update(delta) {

        if (!this.vehicle.model) return;

        const speedRatio = Math.min(
            Math.abs(this.vehicle.speed) / 35,
            1
        );

        this.direction.set(

            Math.sin(this.vehicle.direction),

            0,

            -Math.cos(this.vehicle.direction)

        );

        this.desiredPosition.copy(this.vehicle.position);

        this.desiredPosition.add(

            this.direction.clone().multiplyScalar(

                -this.offset.z - speedRatio * 6

            )

        );

        this.desiredPosition.y += this.offset.y + speedRatio * 2;

        this.cameraPosition.lerp(

            this.desiredPosition,

            this.followSpeed * delta

        );

        this.camera.position.copy(

            this.cameraPosition

        );

        this.lookTarget.copy(

            this.vehicle.position

        );

        this.lookTarget.add(
            this.direction.multiplyScalar(speedRatio * 8)
        );

        this.lookTarget.y += this.targetOffset.y;

        const current = new THREE.Vector3();

        this.camera.getWorldDirection(current);

        const targetDirection = this.lookTarget
            .clone()
            .sub(this.camera.position)
            .normalize();

        current.lerp(

            targetDirection,

            this.lookSpeed * delta

        );

        this.camera.lookAt(this.lookTarget);

        const targetFov = 60 + speedRatio * 8;

        if (Math.abs(this.camera.fov - targetFov) > 0.1) {

            this.camera.fov = THREE.MathUtils.lerp(
                this.camera.fov,
                targetFov,
                delta * 3
            );
            this.camera.updateProjectionMatrix();

        }

    }

}
