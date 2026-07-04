// effects/TireTrack.js

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.179/build/three.module.js";

export class TireTrack {

    constructor(sceneManager, vehicle) {

        this.sceneManager = sceneManager;
        this.scene = sceneManager.scene;
        this.vehicle = vehicle;

        this.group = new THREE.Group();
        this.scene.add(this.group);

        this.trackWidth = 0;

        this.distanceThreshold = 0.6;

        this.lastLeft = null;
        this.lastRight = null;

        this.material = new THREE.MeshStandardMaterial({

            color: 0x2b241d,

            transparent: true,

            opacity: 0.35,

            depthWrite: false

        });

    }

    update() {
    
        console.log("TireTrack update");
    
        if (!this.vehicle.model) return;

        const forward = new THREE.Vector3(

            Math.sin(this.vehicle.direction),

            0,

            Math.cos(this.vehicle.direction)

        );
        this.trackWidth =
            this.vehicle.dimensions.width * 0.42;
        
        const leftOffset = -this.trackWidth;
        
        const rightOffset = this.trackWidth;
        const right = new THREE.Vector3(

            forward.z,

            0,

            -forward.x

        );

        const rearDirection = forward.clone().multiplyScalar(
        
            -this.vehicle.rearAxleOffset
        
        );
        
        // 左後輪
        const leftPos = this.vehicle.position.clone()
        
            .add(rearDirection)
        
            .add(
        
                right.clone().multiplyScalar(leftOffset)
        
        );
        
        // 右後輪
        const rightPos = this.vehicle.position.clone()
        
            .add(rearDirection)
        
            .add(
        
                right.clone().multiplyScalar(rightOffset)
        
        );

        leftPos.y += 0.02;
        rightPos.y += 0.02;

console.log("width", this.vehicle.dimensions.width);

console.log("rear", this.vehicle.rearAxleOffset);

console.log("LEFT", leftPos);

console.log("RIGHT", rightPos);
        
        this.createSegment(
            leftPos,
            "left"
        );

        this.createSegment(
            rightPos,
            "right"
        );

    }

    createSegment(position, side) {

        let previous =
            side === "left"
                ? this.lastLeft
                : this.lastRight;

        if (!previous) {

            if (side === "left") {

                this.lastLeft = position.clone();

            } else {

                this.lastRight = position.clone();

            }

            return;

        }

        if (

            previous.distanceTo(position)

            < this.distanceThreshold

        ) {

            return;

        }

        const length =
            previous.distanceTo(position);

        const geometry =
            new THREE.PlaneGeometry(
                0.25,
                length
            );

        const mesh =
            new THREE.Mesh(

                geometry,

                this.material

            );

        mesh.receiveShadow = true;

        mesh.position.copy(

            previous.clone().lerp(

                position,

                0.5

            )

        );

        mesh.rotation.x =
            -Math.PI / 2;

        mesh.rotation.z =
            Math.atan2(

                position.x - previous.x,

                position.z - previous.z

            );

        this.group.add(mesh);

        if (side === "left") {

            this.lastLeft = position.clone();

        } else {

            this.lastRight = position.clone();

        }

    }

}
