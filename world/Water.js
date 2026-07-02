// world/Water.js

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.179/build/three.module.js";

export class Water {

    constructor(sceneManager) {

        this.sceneManager = sceneManager;

        this.scene = sceneManager.scene;

        this.time = 0;

        const geometry = new THREE.PlaneGeometry(

            500,

            200,

            120,

            40

        );

        geometry.rotateX(

            -Math.PI / 2

        );

        const material =
            new THREE.MeshStandardMaterial({

                color: 0x3f9cff,

                transparent: true,

                opacity: 0.82,

                metalness: 0.35,

                roughness: 0.18

            });

        this.mesh = new THREE.Mesh(

            geometry,

            material

        );

        this.mesh.receiveShadow = true;

        this.mesh.position.set(

            0,

            2,

            -350

        );

        this.scene.add(

            this.mesh

        );

    }

    update(delta) {

        this.time += delta;

        const pos =

            this.mesh.geometry.attributes.position;

        for (

            let i = 0;

            i < pos.count;

            i++

        ) {

            const x = pos.getX(i);

            const z = pos.getZ(i);

            pos.setY(

                i,

                Math.sin(

                    x * 0.03 +

                    this.time * 2

                ) * 0.18 +

                Math.cos(

                    z * 0.04 +

                    this.time * 1.7

                ) * 0.12

            );

        }

        pos.needsUpdate = true;

        this.mesh.geometry.computeVertexNormals();

    }

}
