// ============================================================================
// world/BridgeBuilder.js
// V11
// Part 1
// 川を跨ぐ橋（RiverSystem専用）
// ============================================================================

import * as THREE from "three";

export default class BridgeBuilder{

    constructor(scene){

        this.scene = scene;

        this.group = new THREE.Group();

    }

    //=========================================================================
    // 作成
    //=========================================================================
    build(center){

        //--------------------------------
        // 橋面
        //--------------------------------

        const deck =

            new THREE.Mesh(

                new THREE.BoxGeometry(

                    32,

                    .55,

                    8.4

                ),

                new THREE.MeshStandardMaterial({

                    color:0x8b8b8b,

                    roughness:.9

                })

            );

        deck.position.y =

            1.15;

        deck.receiveShadow = true;

        this.group.add(

            deck

        );

        //--------------------------------
        // 白線
        //--------------------------------

        [

            -3.25,

            3.25

        ].forEach(z=>{

            const line=

                new THREE.Mesh(

                    new THREE.BoxGeometry(

                        31,

                        .03,

                        .08

                    ),

                    new THREE.MeshBasicMaterial({

                        color:0xffffff

                    })

                );

            line.position.set(

                0,

                1.44,

                z

            );

            this.group.add(

                line

            );

        });

        //--------------------------------
        // ガードレール
        //--------------------------------

        [

            -4,

            4

        ].forEach(z=>{

            const rail=

                new THREE.Mesh(

                    new THREE.BoxGeometry(

                        31,

                        .15,

                        .12

                    ),

                    new THREE.MeshStandardMaterial({

                        color:0xd6d6d6,

                        metalness:.55,

                        roughness:.35

                    })

                );

            rail.position.set(

                0,

                2.0,

                z

            );

            this.group.add(

                rail

            );

            for(

                let x=-15;

                x<=15;

                x+=2

            ){

                const post=

                    new THREE.Mesh(

                        new THREE.BoxGeometry(

                            .09,

                            .9,

                            .09

                        ),

                        rail.material

                    );

                post.position.set(

                    x,

                    1.55,

                    z

                );

                this.group.add(

                    post

                );

            }

        });

        //--------------------------------
        // 橋脚
        //--------------------------------

        [

            -10,

            0,

            10

        ].forEach(x=>{

            [

                -2.7,

                2.7

            ].forEach(z=>{

                const pier=

                    new THREE.Mesh(

                        new THREE.BoxGeometry(

                            .9,

                            3.8,

                            .9

                        ),

                        new THREE.MeshStandardMaterial({

                            color:0x8a8a8a

                        })

                    );

                pier.position.set(

                    x,

                    -1,

                    z

                );

                this.group.add(

                    pier

                );

            });

        });

        //--------------------------------

        this.group.position.copy(

            center

        );

        this.scene.add(

            this.group

        );

    }

}
