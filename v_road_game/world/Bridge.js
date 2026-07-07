// world/Bridge.js

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.179/build/three.module.js";

export class Bridge {

    constructor(sceneManager) {

        this.scene = sceneManager.scene;

        this.group = new THREE.Group();

        this.create();

        this.scene.add(this.group);

    }

    create() {

        const deckMaterial =
            new THREE.MeshStandardMaterial({

                color: 0x8b6a45,

                roughness: 0.95

            });

        const postMaterial =
            new THREE.MeshStandardMaterial({

                color: 0x5c4632,

                roughness: 1.0

            });

        const deck = new THREE.Mesh(

            new THREE.BoxGeometry(

                40,

                0.6,

                6

            ),

            deckMaterial

        );

        deck.position.set(

            0,

            2.6,

            -350

        );

        deck.receiveShadow = true;

        deck.castShadow = true;

        this.group.add(deck);

        for (

            let i = -18;

            i <= 18;

            i += 4

        ) {

            const leftPost = new THREE.Mesh(

                new THREE.BoxGeometry(

                    0.25,

                    1,

                    0.25

                ),

                postMaterial

            );

            leftPost.position.set(

                i,

                3.2,

                -353

            );

            leftPost.castShadow = true;

            this.group.add(leftPost);

            const rightPost = leftPost.clone();

            rightPost.position.z = -347;

            this.group.add(rightPost);

        }

        const leftRail = new THREE.Mesh(

            new THREE.BoxGeometry(

                40,

                0.15,

                0.15

            ),

            postMaterial

        );

        leftRail.position.set(

            0,

            3.7,

            -353

        );

        leftRail.castShadow = true;

        this.group.add(leftRail);

        const rightRail = leftRail.clone();

        rightRail.position.z = -347;

        this.group.add(rightRail);

    }

}
