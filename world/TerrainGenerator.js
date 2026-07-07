// world/TerrainGenerator.js

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.179/build/three.module.js";

export class TerrainGenerator {

    constructor(noiseAdapter) {

        this.noise = noiseAdapter;

        // マップサイズ（m）
        this.width = 2000;
        this.depth = 2000;

        // 分割数
        this.segmentsX = 220;
        this.segmentsZ = 220;

        // 地形パラメータ
        this.heightScale = 120;
        this.noiseScale = 0.0015;

    }

    createGeometry() {

        const geometry = new THREE.PlaneGeometry(

            this.width,
            this.depth,

            this.segmentsX,
            this.segmentsZ

        );

        geometry.rotateX(-Math.PI / 2);

        this.generateHeight(geometry);

        geometry.computeVertexNormals();

        geometry.computeBoundingBox();

        geometry.computeBoundingSphere();

        return geometry;

    }

    generateHeight(geometry) {

        const positions =
            geometry.attributes.position;

        for (let i = 0; i < positions.count; i++) {

            const x = positions.getX(i);

            const z = positions.getZ(i);

            const y = this.getHeight(x, z);

            positions.setY(i, y);

        }

        positions.needsUpdate = true;

    }
    getHeight(x, z) {

        return Math.sin(x * 0.01) * 5
             + Math.cos(z * 0.01) * 5;

    }


}
