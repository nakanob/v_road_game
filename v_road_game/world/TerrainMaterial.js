// world/TerrainMaterial.js

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.179/build/three.module.js";

export class TerrainMaterial {

    constructor() {

        this.material = new THREE.MeshStandardMaterial({

            color: 0x7d7d58,

            roughness: 1.0,

            metalness: 0.0,

            flatShading: false

        });

    }

    getMaterial() {

        return this.material;

    }

    setColor(color) {

        this.material.color.set(color);

    }

    setWireframe(enabled) {

        this.material.wireframe = enabled;

    }

    setRoughness(value) {

        this.material.roughness = value;

    }

    setMetalness(value) {

        this.material.metalness = value;

    }

    dispose() {

        this.material.dispose();

    }

}
