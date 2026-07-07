// world/ChunkManager.js

import { Chunk } from "./Chunk.js";

export class ChunkManager {

    constructor(sceneManager) {

        this.sceneManager = sceneManager;
        this.scene = sceneManager.scene;
        this.terrain = sceneManager.terrain;

        this.chunkSize = 250;
        this.visibleRange = 2;

        this.chunks = new Map();

    }

    update() {

        if (!this.sceneManager.vehicle) return;

        const vehicle = this.sceneManager.vehicle;

        if (!vehicle.model) return;

        const currentChunkX = Math.floor(
            vehicle.position.x / this.chunkSize
        );

        const currentChunkZ = Math.floor(
            vehicle.position.z / this.chunkSize
        );

        const activeChunks = new Set();

        for (

            let z = currentChunkZ - this.visibleRange;

            z <= currentChunkZ + this.visibleRange;

            z++

        ) {

            for (

                let x = currentChunkX - this.visibleRange;

                x <= currentChunkX + this.visibleRange;

                x++

            ) {

                const key = `${x},${z}`;

                activeChunks.add(key);

                if (!this.chunks.has(key)) {

                    const chunk = new Chunk(

                        this.terrain.generator,

                        x,

                        z,

                        this.chunkSize

                    );

                    this.scene.add(chunk.mesh);

                    this.chunks.set(key, chunk);

                }

            }

        }

        for (const [key, chunk] of this.chunks) {

            if (!activeChunks.has(key)) {

                this.scene.remove(chunk.mesh);

                chunk.dispose();

                this.chunks.delete(key);

            }

        }

    }

}
