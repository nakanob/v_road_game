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

    for (

        let i = 0;

        i < this.group.children.length;

        i++

    ) {

        const grass =

            this.group.children[i];

        grass.rotation.z =

            sway +

            Math.sin(

                i * 0.35 +

                performance.now() * 0.002

            ) * 0.05;

        }

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

        for (

            let i = 0;

            i < this.bladeCount;

            i++

        ) {

            const mesh = new THREE.Mesh(

                geometry,

                material

            );

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

            mesh.position.set(

                x,

                y,

                z

            );

            mesh.rotation.y =

                this.random.range(

                    0,

                    Math.PI * 2

                );

            mesh.rotation.z =

                THREE.MathUtils.degToRad(

                    this.random.range(

                        -10,

                        10

                    )

                );

            const scale =

                this.random.range(

                    0.7,

                    1.5

                );

            mesh.scale.setScalar(

                scale

            );

            mesh.castShadow = false;

            mesh.receiveShadow = true;

            this.group.add(

                mesh

            );

        }

    }

}
