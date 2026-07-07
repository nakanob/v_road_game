// world/GrassGenerator.js

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.179/build/three.module.js";
import { Random } from "../utils/Random.js";

export class GrassGenerator {

    constructor(sceneManager) {

        this.sceneManager = sceneManager;

        this.scene = sceneManager.scene;

        this.terrain = sceneManager.terrain;

        this.random = new Random(3003);

        this.group = new THREE.Group();

        this.group.name = "Grass";

        this.bladeCount = 500;
        this.dummy = new THREE.Object3D();

        this.create();

        this.scene.add(this.group);

    }
update(delta) {

    if (!this.sceneManager.wind) return;

    const wind = this.sceneManager.wind;

    const sway =

        Math.sin(

            performance.now() * 0.001 *

            wind.strength

        ) * 0.12;

    }
    create() {

        const geometry = new THREE.PlaneGeometry(

            0.18,

            0.8

        );

        geometry.translate(

            0,

            0.4,

            0

        );

        const material =
            new THREE.MeshStandardMaterial({

                color: 0x4d9d39,

                side: THREE.DoubleSide

            });

        const mesh = new THREE.InstancedMesh(
            geometry,
            material,
            this.bladeCount
        );
        mesh.castShadow = false;
        mesh.receiveShadow = true;

        let instanceIndex = 0;

        for (

            let i = 0;

            i < this.bladeCount;

            i++

        ) {

            const x = this.random.range(

                -990,

                990

            );

            const z = this.random.range(

                -990,

                990

            );

            const y = this.terrain.getHeight(

                x,

                z

            );

            if (y < 2) {

                continue;

            }

            this.dummy.position.set(
                x,
                y,
                z
            );

            this.dummy.rotation.set(
                0,
                this.random.range(0, Math.PI * 2),
                THREE.MathUtils.degToRad(
                    this.random.range(-10, 10)
                )
            );

            const scale =

                this.random.range(

                    0.7,

                    1.5

                );

            this.dummy.scale.setScalar(scale);
            this.dummy.updateMatrix();
            mesh.setMatrixAt(instanceIndex, this.dummy.matrix);
            instanceIndex++;

        }

        mesh.count = instanceIndex;
        mesh.instanceMatrix.needsUpdate = true;
        this.group.add(mesh);

    }

}
