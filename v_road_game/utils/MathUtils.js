// utils/MathUtils.js

export class MathUtils {

    static clamp(value, min, max) {

        return Math.min(Math.max(value, min), max);

    }

    static lerp(a, b, t) {

        return a + (b - a) * t;

    }

    static inverseLerp(a, b, value) {

        if (a === b) return 0;

        return (value - a) / (b - a);

    }

    static remap(value, inMin, inMax, outMin, outMax) {

        const t = this.inverseLerp(
            inMin,
            inMax,
            value
        );

        return this.lerp(
            outMin,
            outMax,
            t
        );

    }

    static degToRad(deg) {

        return deg * Math.PI / 180;

    }

    static radToDeg(rad) {

        return rad * 180 / Math.PI;

    }

    static distance2D(x1, z1, x2, z2) {

        const dx = x2 - x1;
        const dz = z2 - z1;

        return Math.sqrt(dx * dx + dz * dz);

    }

    static distance3D(x1, y1, z1, x2, y2, z2) {

        const dx = x2 - x1;
        const dy = y2 - y1;
        const dz = z2 - z1;

        return Math.sqrt(
            dx * dx +
            dy * dy +
            dz * dz
        );

    }

    static random(min, max) {

        return Math.random() * (max - min) + min;

    }

    static randomInt(min, max) {

        return Math.floor(
            this.random(min, max + 1)
        );

    }

    static smoothStep(edge0, edge1, x) {

        x = this.clamp(
            (x - edge0) / (edge1 - edge0),
            0,
            1
        );

        return x * x * (3 - 2 * x);

    }

    static pingPong(t, length) {

        t = t % (length * 2);

        return length - Math.abs(t - length);

    }

    static repeat(t, length) {

        return t - Math.floor(t / length) * length;

    }

    static nearlyEquals(a, b, epsilon = 0.0001) {

        return Math.abs(a - b) < epsilon;

    }

}
