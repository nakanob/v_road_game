// vehicle/VehicleController.js

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.179/build/three.module.js";

export class VehicleController {

    constructor(vehicle) {

        this.vehicle = vehicle;

        this.input = vehicle.input;

        this.maxForwardSpeed = 35;
        this.maxReverseSpeed = 12;

        this.acceleration = 18;
        this.brakePower = 30;

        this.drag = 8;

        this.maxSteeringAngle =
            THREE.MathUtils.degToRad(35);

        this.steeringReturnSpeed = 2.5;

        this.currentSteering = 0;

    }

    update(delta) {

        this.updateAcceleration(delta);

        this.updateSteering(delta);

        this.updateMovement(delta);

    }

    updateAcceleration(delta) {

        if (this.input.keys.forward) {

            this.vehicle.speed +=
                this.acceleration * delta;

        }

        if (this.input.keys.backward) {

            this.vehicle.speed -=
                this.acceleration * delta;

        }

        if (this.input.keys.brake) {

            if (this.vehicle.speed > 0) {

                this.vehicle.speed -=
                    this.brakePower * delta;

            } else {

                this.vehicle.speed +=
                    this.brakePower * delta;

            }

        }

        if (
            !this.input.keys.forward &&
            !this.input.keys.backward
        ) {

            if (this.vehicle.speed > 0) {

                this.vehicle.speed -=
                    this.drag * delta;

                if (this.vehicle.speed < 0) {

                    this.vehicle.speed = 0;

                }

            }

            if (this.vehicle.speed < 0) {

                this.vehicle.speed +=
                    this.drag * delta;

                if (this.vehicle.speed > 0) {

                    this.vehicle.speed = 0;

                }

            }

        }

        this.vehicle.speed =
            THREE.MathUtils.clamp(

                this.vehicle.speed,

                -this.maxReverseSpeed,

                this.maxForwardSpeed

            );

    }

    updateSteering(delta) {

        if (this.input.keys.left) {

            this.currentSteering +=
                this.maxSteeringAngle * delta;

        }

        else if (this.input.keys.right) {

            this.currentSteering -=
                this.maxSteeringAngle * delta;

        }

        else {

            this.currentSteering =
                THREE.MathUtils.lerp(

                    this.currentSteering,

                    0,

                    this.steeringReturnSpeed * delta

                );

        }

        this.currentSteering =
            THREE.MathUtils.clamp(

                this.currentSteering,

                -this.maxSteeringAngle,

                this.maxSteeringAngle

            );

    }

    updateMovement(delta) {

        const steeringFactor =
            Math.abs(
                this.vehicle.speed
            ) / this.maxForwardSpeed;

        this.vehicle.direction +=

            this.currentSteering *

            steeringFactor *

            delta;

        this.vehicle.position.x +=

            Math.sin(
                this.vehicle.direction
            ) *

            this.vehicle.speed *

            delta;

        this.vehicle.position.z +=

            Math.cos(
                this.vehicle.direction
            ) *

            this.vehicle.speed *

            delta;

        this.vehicle.position.y =

            this.vehicle.terrain.getHeight(

                this.vehicle.position.x,

                this.vehicle.position.z

            ) + 1.5;

    }

}
