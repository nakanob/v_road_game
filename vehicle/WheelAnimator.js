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

        this.rotation = 0;

        this.findWheels();
        this.originalRotation.set(

    child,

    child.rotation.clone()

);
        this.originalRotation =
        new WeakMap();

    }

    findWheels() {

        if (!this.vehicle.model) return;

        this.vehicle.model.traverse((child) => {
            const name = child.name.toLowerCase();
            if (
            
                name.includes("wheel") &&
            
                name.includes("fl")
            
            ){
            
                this.wheels.frontLeft = child;
            
            }
            
            else if (
            
                name.includes("wheel") &&
            
                name.includes("fr")
            
            ){
            
                this.wheels.frontRight = child;
            
            }
            
            else if (
            
                name.includes("wheel") &&
            
                name.includes("rl")
            
            ){
            
                this.wheels.rearLeft = child;
            
            }
            
            else if (
            
                name.includes("wheel") &&
            
                name.includes("rr")
            
            ){
            
                this.wheels.rearRight = child;
            
            }

        });

    }

    update(delta) {

        if (!this.vehicle.model) return;

        if (!this.wheels.frontLeft) {

            this.findWheels();

            return;

        }

        this.rotation +=

            this.vehicle.speed *

            delta *

            1.8;

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

        wheel.rotation.y = steering;

        wheel.rotation.x = this.rotation;

    }

}
