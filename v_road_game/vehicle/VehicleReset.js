// vehicle/VehicleReset.js

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.179/build/three.module.js";

export class VehicleReset {

    constructor(vehicle) {

        this.vehicle = vehicle;

        window.addEventListener(

            "keydown",

            (event) => {

                if (event.code === "KeyR") {

                    this.reset();

                }

            }

        );

    }

    reset() {

        this.vehicle.speed = 0;

        this.vehicle.direction = 0;

        this.vehicle.position.set(

            0,

            this.vehicle.terrain.getHeight(

                0,

                0

            ),

            0

        );

        if (

            this.vehicle.suspension

        ) {

            this.vehicle.suspension.pitch = 0;

            this.vehicle.suspension.roll = 0;

        }

        this.vehicle.updateTransform();

    }

}
