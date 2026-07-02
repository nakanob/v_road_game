// world/CollisionManager.js

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.179/build/three.module.js";

export class CollisionManager {

    constructor(sceneManager) {

        this.sceneManager = sceneManager;

        this.vehicle = sceneManager.vehicle;

        this.treeGenerator = sceneManager.treeGenerator;

        this.rockGenerator = sceneManager.rockGenerator;

        this.vehicleRadius = 1.2;

    }

    update() {

        if (!this.vehicle.model) return;

        this.checkGroup(

            this.treeGenerator.group,

            2.0

        );

        this.checkGroup(

            this.rockGenerator.group,

            2.2

        );

    }

    checkGroup(group, radius) {

        for (const object of group.children) {

            const distance =

                object.position.distanceTo(

                    this.vehicle.position

                );

            if (

                distance <

                radius +

                this.vehicleRadius

            ) {

                this.resolveCollision(

                    object.position,

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
