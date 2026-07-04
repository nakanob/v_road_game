// world/TerrainGenerator.js

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.179/build/three.module.js";

export class TerrainGenerator {

    constructor(noiseAdapter) {

        this.noise = noiseAdapter;

        // マップサイズ（m）
        this.width = 2000;
        this.depth = 2000;

        // 分割数
        this.segmentsX = 400;
        this.segmentsZ = 400;

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

        const sampleX =
            x * this.noiseScale;

        const sampleZ =
            z * this.noiseScale;

        const warped =
            this.noise.domainWarp(
                sampleX,
                sampleZ,
                12
            );

        const mountains =
            this.noise.ridged(
                warped.x * 0.45,
                warped.z * 0.45,
                5
            );

        const hills =
            this.noise.fbm(
                warped.x,
                warped.z,
                6,
                0.5,
                2.0
            );

        const detail =
            this.noise.fbm(
                warped.x * 5,
                warped.z * 5,
                3,
                0.45,
                2.2
            );

        let height = 0;

        // なだらかな丘
        height += hills * 45;

        // 山岳
        height += mountains * 90;

        // 細かい凹凸
        height += detail * 4;

        // 平坦部を増やす
        if (height < 12) {

            height *= 0.45;

        }

       // return height;
        return 0;
    }

}
