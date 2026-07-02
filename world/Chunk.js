// world/Chunk.js

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.179/build/three.module.js";

export class Chunk {

    constructor(

        terrainGenerator,

        xIndex,

        zIndex,

        chunkSize = 250,

        segments = 50

    ) {

        this.generator = terrainGenerator;

        this.xIndex = xIndex;
        this.zIndex = zIndex;

        this.chunkSize = chunkSize;
        this.segments = segments;

        this.mesh = null;

        this.create();

    }

    create() {

        const geometry = new THREE.PlaneGeometry(

            this.chunkSize,

            this.chunkSize,

            this.segments,

            this.segments

        );

        geometry.rotateX(

            -Math.PI / 2

        );

        const offsetX =
            this.xIndex * this.chunkSize;

        const offsetZ =
            this.zIndex * this.chunkSize;

        const position =
            geometry.attributes.position;

        for (let i = 0; i < position.count; i++) {

            const localX =
                position.getX(i);

            const localZ =
                position.getZ(i);

            const worldX =
                offsetX + localX;

            const worldZ =
                offsetZ + localZ;

            position.setY(

                i,

                this.generator.getHeight(

                    worldX,

                    worldZ

                )

            );

            position.setX(

                i,

                worldX

            );

            position.setZ(

                i,

                worldZ

            );

        }

        position.needsUpdate = true;

        geometry.computeVertexNormals();

        const material =
            new THREE.MeshStandardMaterial({

                color: 0x7d7d58,

                roughness: 1,

                metalness: 0

            });

        this.mesh = new THREE.Mesh(

            geometry,

            material

        );

        this.mesh.receiveShadow = true;

    }

    dispose() {

        this.mesh.geometry.dispose();

        this.mesh.material.dispose();

    }

}
