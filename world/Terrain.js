// world/Terrain.js

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.179/build/three.module.js";

import { createNoise2D } from "https://cdn.jsdelivr.net/npm/simplex-noise@4.0.3/dist/esm/simplex-noise.js";

import { NoiseAdapter } from "./NoiseAdapter.js";
import { TerrainGenerator } from "./TerrainGenerator.js";

export class Terrain {

    constructor(sceneManager) {

        this.sceneManager = sceneManager;

        this.scene = sceneManager.scene;

        this.mesh = null;

        this.geometry = null;

        this.material = null;

        this.generator = null;

        this.init();

    }

    init() {

        const noise2D = createNoise2D();

        const noiseAdapter = new NoiseAdapter({

            noise2D

        });

        this.generator = new TerrainGenerator(
            noiseAdapter
        );

        this.geometry =
            this.generator.createGeometry();

        this.material =
            new THREE.MeshStandardMaterial({

                color: 0x7b7b52,

                roughness: 1.0,

                metalness: 0.0,

                flatShading: false

            });

        this.mesh = new THREE.Mesh(

            this.geometry,

            this.material

        );

        this.mesh.name = "Terrain";

        this.mesh.receiveShadow = true;

        this.mesh.castShadow = false;

        this.scene.add(this.mesh);

    }

    getHeight(x, z) {

        return this.generator.getHeight(x, z);

    }

    dispose() {

        if (this.mesh) {

            this.scene.remove(this.mesh);

        }

        if (this.geometry) {

            this.geometry.dispose();

        }

        if (this.material) {

            this.material.dispose();

        }

    }

}
