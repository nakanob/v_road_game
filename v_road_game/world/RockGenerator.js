// world/RockGenerator.js

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.179/build/three.module.js";

import { Random } from "../utils/Random.js";

export class RockGenerator {

    constructor(sceneManager) {

        this.sceneManager = sceneManager;
        this.scene = sceneManager.scene;
        this.terrain = sceneManager.terrain;

        this.random = new Random(2002);

        this.rockCount = 320;

        this.dummy = new THREE.Object3D();
        this.collisionPoints = [];

        this.create();

    }

    create() {

        const geometry = new THREE.IcosahedronGeometry(
            1,
            1
        );

        const material = new THREE.MeshStandardMaterial({

            color: 0x7c7c7c,
            roughness: 1,
            metalness: 0

        });

        this.mesh = new THREE.InstancedMesh(
            geometry,
            material,
            this.rockCount
        );

        this.mesh.name = "Rocks";
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        let instanceIndex = 0;

        for (let i = 0; i < this.rockCount; i++) {

            const radius = this.random.range(0.4, 2.5);
            const x = this.random.range(-990, 990);
            const z = this.random.range(-990, 990);
            const y = this.terrain.getHeight(x, z);

            if (y < 8) {
                continue;
            }

            this.collisionPoints.push(
                new THREE.Vector3(x, y, z)
            );

            this.dummy.position.set(
                x,
                y + radius * 0.35,
                z
            );

            this.dummy.rotation.set(
                this.random.range(0, Math.PI),
                this.random.range(0, Math.PI * 2),
                this.random.range(0, Math.PI)
            );

            this.dummy.scale.set(
                radius * this.random.range(0.8, 1.5),
                radius * this.random.range(0.6, 1.4),
                radius * this.random.range(0.8, 1.5)
            );

            this.dummy.updateMatrix();
            this.mesh.setMatrixAt(instanceIndex, this.dummy.matrix);
            instanceIndex++;

        }

        this.mesh.count = instanceIndex;
        this.mesh.instanceMatrix.needsUpdate = true;
        this.scene.add(this.mesh);

    }

    dispose() {

        this.scene.remove(this.mesh);
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();

    }

}
