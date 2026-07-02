// world/RoadSpline.js

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.179/build/three.module.js";

export class RoadSpline {

    constructor(sceneManager) {

        this.sceneManager = sceneManager;

        this.scene = sceneManager.scene;

        this.terrain = sceneManager.terrain;

        this.group = new THREE.Group();

        this.scene.add(this.group);

        this.create();

    }

    create() {

        const points = [

            new THREE.Vector3(-800, 0, -900),
            new THREE.Vector3(-600, 0, -650),
            new THREE.Vector3(-350, 0, -250),
            new THREE.Vector3(-100, 0, 0),
            new THREE.Vector3(250, 0, 280),
            new THREE.Vector3(500, 0, 520),
            new THREE.Vector3(850, 0, 900)

        ];

        const curve = new THREE.CatmullRomCurve3(points);

        const roadMaterial =
            new THREE.MeshStandardMaterial({

                color: 0x8a7553,

                roughness: 1.0

            });

        const width = 6;

        const step = 5;

        for (

            let d = 0;

            d <= curve.getLength();

            d += step

        ) {

            const t =

                d / curve.getLength();

            const p =

                curve.getPointAt(t);

            const tangent =

                curve.getTangentAt(t);

            const angle =

                Math.atan2(

                    tangent.x,

                    tangent.z

                );

            const y =

                this.terrain.getHeight(

                    p.x,

                    p.z

                ) + 0.03;

            const mesh = new THREE.Mesh(

                new THREE.BoxGeometry(

                    width,

                    0.08,

                    step + 0.2

                ),

                roadMaterial

            );

            mesh.position.set(

                p.x,

                y,

                p.z

            );

            mesh.rotation.y = angle;

            mesh.receiveShadow = true;

            this.group.add(mesh);

        }

    }

}
