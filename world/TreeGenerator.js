// world/TreeGenerator.js

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.179/build/three.module.js";

import { Random } from "../utils/Random.js";

export class TreeGenerator {

    constructor(sceneManager) {

        this.sceneManager = sceneManager;
        this.scene = sceneManager.scene;
        this.terrain = sceneManager.terrain;

        this.random = new Random(1001);

        this.treeCount = 1000;

        this.group = new THREE.Group();
        this.group.name = "Trees";
        this.dummy = new THREE.Object3D();
        this.collisionPoints = [];

        this.create();

        this.scene.add(this.group);

    }

    create() {

        const trunkGeometry = new THREE.CylinderGeometry(
            0.25,
            0.35,
            2.5,
            8
        );

        const trunkMaterial = new THREE.MeshStandardMaterial({

            color: 0x5a3b22

        });

        const leafGeometry = new THREE.ConeGeometry(
            1.5,
            3.8,
            10
        );

        const leafMaterial = new THREE.MeshStandardMaterial({

            color: 0x2f7d32

        });

        const trunkMesh = new THREE.InstancedMesh(
            trunkGeometry,
            trunkMaterial,
            this.treeCount
        );
        const leafMesh = new THREE.InstancedMesh(
            leafGeometry,
            leafMaterial,
            this.treeCount
        );

        trunkMesh.castShadow = true;
        trunkMesh.receiveShadow = true;
        leafMesh.castShadow = true;
        leafMesh.receiveShadow = true;

        let instanceIndex = 0;

        for (let i = 0; i < this.treeCount; i++) {

            const x = this.random.range(-980, 980);
            const z = this.random.range(-980, 980);

            const y = this.terrain.getHeight(x, z);

            if (y < 3) {

                continue;

            }

            const scale = this.random.range(0.8, 1.5);
            const rotationY = this.random.range(
                0,
                Math.PI * 2
            );

            this.collisionPoints.push(
                new THREE.Vector3(x, y, z)
            );

            this.dummy.position.set(
                x,
                y + 1.25 * scale,
                z
            );
            this.dummy.rotation.set(0, rotationY, 0);
            this.dummy.scale.setScalar(scale);
            this.dummy.updateMatrix();
            trunkMesh.setMatrixAt(instanceIndex, this.dummy.matrix);

            this.dummy.position.set(
                x,
                y + 4.2 * scale,
                z
            );
            this.dummy.updateMatrix();
            leafMesh.setMatrixAt(instanceIndex, this.dummy.matrix);

            instanceIndex++;
        }

        trunkMesh.count = instanceIndex;
        leafMesh.count = instanceIndex;
        trunkMesh.instanceMatrix.needsUpdate = true;
        leafMesh.instanceMatrix.needsUpdate = true;

        this.group.add(trunkMesh);
        this.group.add(leafMesh);
    }

    dispose() {

        this.group.traverse((child) => {

            if (child.isMesh) {

                child.geometry.dispose();

                child.material.dispose();

            }

        });

        this.scene.remove(this.group);

    }
}
