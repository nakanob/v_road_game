// world/CollisionManager.js

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.179/build/three.module.js";

export class CollisionManager {

    constructor(sceneManager) {

        this.sceneManager = sceneManager;

        this.vehicle = sceneManager.vehicle;

        this.treeGenerator = sceneManager.treeGenerator;

        this.rockGenerator = sceneManager.rockGenerator;

        this.vehicleRadius = 1.2;
        this.tmp = new THREE.Vector3();

    }

    update() {

        if (!this.vehicle.model) return;

        this.checkPoints(

            this.treeGenerator.collisionPoints,

            2.0

        );

        this.checkPoints(

            this.rockGenerator.collisionPoints,

            2.2

        );

    }

    checkPoints(points, radius) {

        const hitRadius =
            radius + this.vehicleRadius;
        const hitRadiusSq = hitRadius * hitRadius;

        for (const point of points) {

            this.tmp.subVectors(
                this.vehicle.position,
                point
            );
            this.tmp.y = 0;

            const distanceSq = this.tmp.lengthSq();

            if (

                distanceSq < hitRadiusSq

            ) {

                this.resolveCollision(

                    point,

                    radius

                );

            }

        }

    }

    resolveCollision(

        obstacle,

        radius

    ) {

        const direction =

            new THREE.Vector3()

                .subVectors(

                    this.vehicle.position,

                    obstacle

                );

        direction.y = 0;

        const length = direction.length();

        if (length === 0) return;

        direction.normalize();

        const target =

            radius +

            this.vehicleRadius;

        this.vehicle.position.copy(

            obstacle.clone().add(

                direction.multiplyScalar(

                    target

                )

            )

        );

        this.vehicle.speed *= 0.25;

    }

}
