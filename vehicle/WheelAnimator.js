// vehicle/WheelAnimator.js

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.179/build/three.module.js";

export class WheelAnimator {

    constructor(vehicle) {

        this.vehicle = vehicle;

        this.wheels = {

            frontLeft: null,

            frontRight: null,

            rearLeft: null,

            rearRight: null

        };

        this.originalRotation =
            new WeakMap();

        this.rotation = 0;

        this.findWheels();

    }

    findWheels() {

        if (!this.vehicle.model) return;

        this.vehicle.model.traverse((child) => {

            if (!child.isObject3D) return;

            const name =
                child.name.toLowerCase();

            if (

                name.includes("wheel") &&
                name.includes("fl")

            ) {

                this.wheels.frontLeft = child;

            }

            else if (

                name.includes("wheel") &&
                name.includes("fr")

            ) {

                this.wheels.frontRight = child;

            }

            else if (

                name.includes("wheel") &&
                name.includes("rl")

            ) {

                this.wheels.rearLeft = child;

            }

            else if (

                name.includes("wheel") &&
                name.includes("rr")

            ) {

                this.wheels.rearRight = child;

            }

            if (

                name.includes("wheel")

            ) {

                this.originalRotation.set(

                    child,

                    child.rotation.clone()

                );

            }

        });

    }

    update(delta) {

        if (!this.vehicle.model) return;

        if (!this.wheels.frontLeft) {

            this.findWheels();

            return;

        }

        const wheelRadius =

            this.vehicle.dimensions.height * 0.17;

        const distance =

            this.vehicle.speed * delta;

        this.rotation +=

            distance / wheelRadius;

        const steer =

            this.vehicle.controller.currentSteering;

        this.updateWheel(

            this.wheels.frontLeft,

            steer

        );

        this.updateWheel(

            this.wheels.frontRight,

            steer

        );

        this.updateWheel(

            this.wheels.rearLeft,

            0

        );

        this.updateWheel(

            this.wheels.rearRight,

            0

        );

    }

    updateWheel(

        wheel,

        steering

    ) {

        if (!wheel) return;

        const original =

            this.originalRotation.get(

                wheel

            );

        if (!original) return;

        wheel.rotation.copy(

            original

        );

        wheel.rotateY(

            steering

        );

        wheel.rotateX(

            this.rotation

        );

    }

}
