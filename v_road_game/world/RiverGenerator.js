// world/RiverGenerator.js

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.179/build/three.module.js";

export class RiverGenerator {

    constructor(sceneManager) {

        this.sceneManager = sceneManager;
        this.scene = sceneManager.scene;
        this.terrain = sceneManager.terrain;

        this.width = 8;

        this.points = [

            new THREE.Vector3(-900, 0, 700),
            new THREE.Vector3(-650, 0, 420),
            new THREE.Vector3(-350, 0, 180),
            new THREE.Vector3(-80, 0, -120),
            new THREE.Vector3(250, 0, -420),
            new THREE.Vector3(720, 0, -850)

        ];

        this.create();

    }

    create() {

        for (const point of this.points) {

            point.y = this.terrain.getHeight(
                point.x,
                point.z
            ) + 0.08;

        }

        const curve = new THREE.CatmullRomCurve3(
            this.points,
            false
        );

        const geometry = new THREE.TubeGeometry(

            curve,

            500,

            this.width,

            20,

            false

        );

        const material = new THREE.MeshPhysicalMaterial({

            color: 0x4ba3ff,

            roughness: 0.05,

            metalness: 0,

            transmission: 0.9,

            transparent: true,

            opacity: 0.85,

            ior: 1.333,

            thickness: 1.5

        });

        this.mesh = new THREE.Mesh(

            geometry,

            material

        );

        this.mesh.receiveShadow = true;
        this.mesh.castShadow = false;

        this.scene.add(this.mesh);

    }

}
