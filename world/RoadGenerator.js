// world/RoadGenerator.js

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.179/build/three.module.js";

export class RoadGenerator {

    constructor(sceneManager) {

        this.sceneManager = sceneManager;
        this.scene = sceneManager.scene;
        this.terrain = sceneManager.terrain;

        this.width = 6;

        this.points = [

            new THREE.Vector3(-800, 0, -800),
            new THREE.Vector3(-500, 0, -250),
            new THREE.Vector3(-150, 0, 100),
            new THREE.Vector3(250, 0, 250),
            new THREE.Vector3(700, 0, 650)

        ];

        this.create();

    }

    create() {

        for (const point of this.points) {

            point.y = this.terrain.getHeight(
                point.x,
                point.z
            ) + 0.05;

        }

        const curve = new THREE.CatmullRomCurve3(
            this.points,
            false
        );

        const geometry = new THREE.TubeGeometry(

            curve,

            400,

            this.width,

            12,

            false

        );

        const material = new THREE.MeshStandardMaterial({

            color: 0x8f7f65,

            roughness: 1,

            metalness: 0

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
