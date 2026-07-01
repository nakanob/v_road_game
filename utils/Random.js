// utils/Random.js

export class Random {

    constructor(seed = Date.now()) {

        this.setSeed(seed);

    }

    setSeed(seed) {

        this.seed = seed >>> 0;

    }

    next() {

        let x = this.seed;

        x ^= x << 13;
        x ^= x >>> 17;
        x ^= x << 5;

        this.seed = x >>> 0;

        return this.seed;

    }

    nextFloat() {

        return this.next() / 4294967295;

    }

    range(min, max) {

        return min + this.nextFloat() * (max - min);

    }

    rangeInt(min, max) {

        return Math.floor(
            this.range(min, max + 1)
        );

    }

    chance(percent) {

        return this.nextFloat() <= percent;

    }

    sign() {

        return this.chance(0.5) ? 1 : -1;

    }

    pick(array) {

        if (!array || array.length === 0) {

            return null;

        }

        return array[
            this.rangeInt(0, array.length - 1)
        ];

    }

    shuffle(array) {

        const result = [...array];

        for (let i = result.length - 1; i > 0; i--) {

            const j = this.rangeInt(0, i);

            [
                result[i],
                result[j]
            ] = [
                result[j],
                result[i]
            ];

        }

        return result;

    }

}
