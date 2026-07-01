// world/RockGenerator.js

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.179/build/three.module.js";

import { Random } from "../utils/Random.js";

export class RockGenerator {

    constructor(sceneManager) {

        this.sceneManager = sceneManager;
        this.scene = sceneManager.scene;
        this.terrain = sceneManager.terrain;

        this.random = new Random(2002);

        this.rockCount = 400;

        this.group = new THREE.Group();
        this.group.name = "Rocks";

        this.create();

        this.scene.add(this.group);

    }

    create() {

        const material = new THREE.MeshStandardMaterial({

            color: 0x7c7c7c,
            roughness: 1,
            metalness: 0

        });

        for (let i = 0; i < this.rockCount; i++) {

            const radius =
                this.random.range(0.4, 2.5);

            const geometry =
                new THREE.IcosahedronGeometry(
                    radius,
                    1
                );

            const rock = new THREE.Mesh(

                geometry,

                material

            );

            const x =
                this.random.range(-990, 990);

            const z =
                this.random.range(-990, 990);

            const y =
                this.terrain.getHeight(x, z);

            if (y < 8) {

                geometry.dispose();

                continue;

            }

            rock.position.set(

                x,

                y + radius * 0.35,

                z

            );

            rock.rotation.set(

                this.random.range(
                    0,
                    Math.PI
                ),

                this.random.range(
                    0,
                    Math.PI * 2
                ),

                this.random.range(
                    0,
                    Math.PI
                )

            );

            rock.scale.set(

                this.random.range(0.8, 1.5),

                this.random.range(0.6, 1.4),

                this.random.range(0.8, 1.5)

            );

            rock.castShadow = true;
            rock.receiveShadow = true;

            this.group.add(rock);

        }

    }

    dispose() {

        this.group.traverse((child) => {

            if (child.isMesh) {

                child.geometry.dispose();

            }

        });

        this.scene.remove(this.group);

    }

}
