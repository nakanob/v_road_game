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

        this.followSpeed = 6;

        this.lookSpeed = 8;

    }

    update(delta) {

        if (!this.vehicle.model) return;

        const direction = new THREE.Vector3(

            Math.sin(this.vehicle.direction),

            0,

            -Math.cos(this.vehicle.direction)

        );

        const desiredPosition = this.vehicle.position.clone();

        desiredPosition.add(

            direction.clone().multiplyScalar(

                -this.offset.z

            )

        );

        desiredPosition.y += this.offset.y;

        this.cameraPosition.lerp(

            desiredPosition,

            this.followSpeed * delta

        );

        this.camera.position.copy(

            this.cameraPosition

        );

        this.lookTarget.copy(

            this.vehicle.position

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

    }

}
