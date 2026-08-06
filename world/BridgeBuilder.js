// ============================================================================
// world/BridgeBuilder.js
// Part 1
// V11
// 川を跨ぐ橋（RiverSystem専用）
// ============================================================================

import * as THREE from "three";

export default class BridgeBuilder {

    constructor(scene){

        this.scene = scene;

        this.group = new THREE.Group();

    }

    //=========================================================================
    // 作成
    //=========================================================================

    build(center){

        //--------------------------------
        // 橋桁
        //--------------------------------

        const deck =

            new THREE.Mesh(

                new THREE.BoxGeometry(

                    10,

                    .45,

                    34

                ),

                new THREE.MeshStandardMaterial({

                    color:0x777777,

                    roughness:.85

                })

            );

        deck.receiveShadow=true;

        deck.castShadow=true;

        deck.position.y=2.6;

        this.group.add(

            deck

        );

        //--------------------------------
        // センターライン
        //--------------------------------

        const centerLine=

            new THREE.Mesh(

                new THREE.BoxGeometry(

                    .18,

                    .02,

                    30

                ),

                new THREE.MeshBasicMaterial({

                    color:0xffdd33

                })

            );

        centerLine.position.set(

            0,

            2.84,

            0

        );

        this.group.add(

            centerLine

        );

        //--------------------------------
        // 白線
        //--------------------------------

        [

            -4.2,

            4.2

        ].forEach(x=>{

            const line=

                new THREE.Mesh(

                    new THREE.BoxGeometry(

                        .14,

                        .02,

                        30

                    ),

                    new THREE.MeshBasicMaterial({

                        color:0xffffff

                    })

                );

            line.position.set(

                x,

                2.84,

                0

            );

            this.group.add(

                line

            );

        });

        //--------------------------------
        // ガードレール
        //--------------------------------

        [

            -4.8,

            4.8

        ].forEach(x=>{

            const rail=

                new THREE.Mesh(

                    new THREE.BoxGeometry(

                        .12,

                        .7,

                        34

                    ),

                    new THREE.MeshStandardMaterial({

                        color:0xe4e4e4

                    })

                );

            rail.position.set(

                x,

                3.1,

                0

            );

            rail.castShadow=true;

            this.group.add(

                rail

            );

        });

        //--------------------------------
        // 支柱
        //--------------------------------

        const pierMat=

            new THREE.MeshStandardMaterial({

                color:0x909090

            });

        for(

            let z=-12;

            z<=12;

            z+=12

        ){

            [

                -2.8,

                2.8

            ].forEach(x=>{

                const pier=

                    new THREE.Mesh(

                        new THREE.BoxGeometry(

                            1,

                            5,

                            1

                        ),

                        pierMat

                    );

                pier.position.set(

                    x,

                    .2,

                    z

                );

                pier.castShadow=true;

                pier.receiveShadow=true;

                this.group.add(

                    pier

                );

            });

        }

        //--------------------------------
        // 配置
        //--------------------------------

        this.group.position.copy(

            center

        );

        this.scene.add(

            this.group

        );

    }

}
