// world/NoiseAdapter.js

/*
=========================================================
NoiseAdapter.js

TerrainGenerator が利用するノイズインターフェース

※ このクラスはノイズライブラリをゲーム側へ
吸収するためのアダプターです。

後から Simplex / OpenSimplex / FastNoise などへ
差し替えても TerrainGenerator は変更不要です。
=========================================================
*/

export class NoiseAdapter {

    constructor(noiseInstance) {

        this.noise = noiseInstance;

    }

    /**
     * ノイズ取得
     * @param {number} x
     * @param {number} z
     * @returns {number} -1 ～ 1
     */
    noise(x, z) {

        if (!this.noise) {

            return 0;

        }

        // simplex-noise v4系
        if (typeof this.noise.noise2D === "function") {

            return this.noise.noise2D(x, z);

        }

        // 旧実装
        if (typeof this.noise.noise === "function") {

            return this.noise.noise(x, z);

        }

        return 0;

    }

    /**
     * Fractal Brownian Motion
     */
    fbm(
        x,
        z,
        octaves = 6,
        persistence = 0.5,
        lacunarity = 2.0
    ) {

        let value = 0;

        let amplitude = 1;

        let frequency = 1;

        let maxAmplitude = 0;

        for (let i = 0; i < octaves; i++) {

            value +=
                this.noise(
                    x * frequency,
                    z * frequency
                ) * amplitude;

            maxAmplitude += amplitude;

            amplitude *= persistence;

            frequency *= lacunarity;

        }

        return value / maxAmplitude;

    }

    /**
     * Ridged Noise
     */
    ridged(
        x,
        z,
        octaves = 6
    ) {

        let value = 0;

        let amplitude = 0.5;

        let frequency = 1;

        let sum = 0;

        for (let i = 0; i < octaves; i++) {

            let n = this.noise(
                x * frequency,
                z * frequency
            );

            n = 1 - Math.abs(n);

            n *= n;

            value += n * amplitude;

            sum += amplitude;

            amplitude *= 0.5;

            frequency *= 2;

        }

        return value / sum;

    }

    /**
     * Domain Warp
     */
    domainWarp(
        x,
        z,
        warpStrength = 15
    ) {

        const qx =
            this.noise(
                x + 13.5,
                z + 8.2
            );

        const qz =
            this.noise(
                x + 5.8,
                z + 19.4
            );

        return {

            x: x + qx * warpStrength,

            z: z + qz * warpStrength

        };

    }

}
