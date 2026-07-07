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

    if (!this.vehicle.model) return;

    if (Math.abs(this.vehicle.speed) < 1) return;

    const forward = new THREE.Vector3(

        Math.sin(this.vehicle.direction),

        0,

        Math.cos(this.vehicle.direction)

    );

    const right = new THREE.Vector3(

        forward.z,

        0,

        -forward.x

    );

    // Vehicle.js の自動計算値を利用
    const leftOffset =

        -this.vehicle.trackWidth * 0.5;

    const rightOffset =

        this.vehicle.trackWidth * 0.5;

    const rear =

        forward.clone().multiplyScalar(

            -this.vehicle.rearAxleOffset

        );

    const leftPos =

        this.vehicle.position.clone()

            .add(rear)

            .add(

                right.clone().multiplyScalar(

                    leftOffset

                )

            );

    const rightPos =

        this.vehicle.position.clone()

            .add(rear)

            .add(

                right.clone().multiplyScalar(

                    rightOffset

                )

            );

    leftPos.y =

        this.vehicle.terrain.getHeight(

            leftPos.x,

            leftPos.z

        ) + 0.03;

    rightPos.y =

        this.vehicle.terrain.getHeight(

            rightPos.x,

            rightPos.z

        ) + 0.03;

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
        const up = new THREE.Vector3(
        
            0,
        
            1,
        
            0
        
        );
        
        const dir =
        
            position.clone()
        
                .sub(previous)
        
                .normalize();
        
        const right =
        
            new THREE.Vector3()
        
                .crossVectors(
        
                    up,
        
                    dir
        
                )
        
                .normalize();
        
        const normal =
        
            new THREE.Vector3(
        
                0,
        
                0,
        
                0
        
            );
        
        normal.add(
        
            new THREE.Vector3(
        
                0,
        
                1,
        
                0
        
            )
        
        );
        
        const basis =
        
            new THREE.Matrix4();
        
        basis.makeBasis(
        
            right,
        
            normal,
        
            dir
        
        );
        
        mesh.quaternion.setFromRotationMatrix(
        
            basis
        
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

        


        this.group.add(mesh);

        console.log("ADD", side, mesh.position);

        if (side === "left") {

            this.lastLeft = position.clone();

        } else {

            this.lastRight = position.clone();

        }

    }

}
