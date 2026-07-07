// world/CheckpointManager.js

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.179/build/three.module.js";

export class CheckpointManager {

    constructor(sceneManager) {

        this.sceneManager = sceneManager;

        this.scene = sceneManager.scene;

        this.vehicle = sceneManager.vehicle;

        this.terrain = sceneManager.terrain;

        this.group = new THREE.Group();

        this.scene.add(this.group);

        this.checkpoints = [];

        this.currentCheckpoint = 0;

        this.create();

    }

    create() {

        const positions = [

            [-600, -650],
            [-350, -250],
            [-100, 0],
            [250, 280],
            [500, 520],
            [850, 900]

        ];

        const geometry = new THREE.CylinderGeometry(

            3,

            3,

            5,

            24

        );

        const material = new THREE.MeshStandardMaterial({

            color: 0x00ff55,

            emissive: 0x00aa33

        });

        positions.forEach(([x, z], index) => {

            const y =

                this.terrain.getHeight(x, z);

            const mesh = new THREE.Mesh(

                geometry,

                material.clone()

            );

            mesh.position.set(

                x,

                y + 2.5,

                z

            );

            mesh.visible =

                index === 0;

            this.group.add(mesh);

            this.checkpoints.push(mesh);

        });

    }

    update() {

        if (

            this.currentCheckpoint >=

            this.checkpoints.length

        ) {

            return;

        }

        const checkpoint =

            this.checkpoints[

                this.currentCheckpoint

            ];

        const distance =

            checkpoint.position.distanceTo(

                this.vehicle.position

            );

        if (distance < 8) {

            checkpoint.visible = false;

            this.currentCheckpoint++;

            if (

                this.currentCheckpoint <

                this.checkpoints.length

            ) {

                this.checkpoints[

                    this.currentCheckpoint

                ].visible = true;

            }

        }

    }

}
