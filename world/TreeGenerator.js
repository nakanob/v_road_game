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

        for (let i = 0; i < this.treeCount; i++) {

            const x = this.random.range(-980, 980);
            const z = this.random.range(-980, 980);

            const y = this.terrain.getHeight(x, z);

            if (y < 3) {

                continue;

            }

            const tree = new THREE.Group();

            const trunk = new THREE.Mesh(

                trunkGeometry,

                trunkMaterial

            );

            trunk.position.y = 1.25;

            trunk.castShadow = true;
            trunk.receiveShadow = true;

            tree.add(trunk);

            const leaves = new THREE.Mesh(

                leafGeometry,

                leafMaterial

            );

            leaves.position.y = 4.2;

            leaves.castShadow = true;
            leaves.receiveShadow = true;

            tree.add(leaves);

            const scale = this.random.range(0.8, 1.5);

            tree.scale.setScalar(scale);

            tree.position.set(

                x,

                y,

                z

            );

            tree.rotation.y = this.random.range(

                0,

                Math.PI * 2

            );

            this.group.add(tree);

        }

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
