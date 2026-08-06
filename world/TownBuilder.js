// ============================================================================
// world/TownBuilder.js
// V11
// Part 1
// 住宅街 → ガソリンスタンド → 警察署 → ビル群
// ============================================================================

import * as THREE from "three";

export default class TownBuilder{

    constructor(scene,world){

        this.scene = scene;
        this.world = world;

        this.group = new THREE.Group();

    }

    //=========================================================================
    // 作成
    //=========================================================================

    build(){

        //--------------------------------
        // 住宅街
        //--------------------------------

        this.createResidentialArea();

        //--------------------------------
        // ガソリンスタンド
        //--------------------------------

        this.createGasStation();

        //--------------------------------
        // 警察署
        //--------------------------------

        this.createPoliceStation();

        //--------------------------------
        // ビル群
        //--------------------------------

        this.createBuildings();

        //--------------------------------

        this.scene.add(

            this.group

        );

    }

    //=========================================================================
    // 住宅街
    //=========================================================================

    createResidentialArea(){

        for(

            let i=0;

            i<22;

            i++

        ){

            const pose=

                this.world.getPose(

                    0.03+

                    i*0.009,

                    i%2

                    ?13

                    :-13

                );

            const house=

                this.createHouse();

            house.position.copy(

                pose.position

            );

            house.rotation.y=

                pose.heading+

                (i%2

                ?Math.PI

                :0);

            this.group.add(

                house

            );

        }

    }

    //=========================================================================
    // 家
    //=========================================================================

    createHouse(){

        const g=

            new THREE.Group();

        //--------------------------------
        // 色をランダム化
        //--------------------------------

        const wallColors=[

            0xf6f1e7,
            0xf0e6d7,
            0xe4e0d7,
            0xe8e3cf,
            0xf2ede4

        ];

        const roofColors=[

            0x333333,
            0x5c3d31,
            0x664444,
            0x555555,
            0x3a2f2b

        ];

        //--------------------------------
        // 壁
        //--------------------------------

        const body=

            new THREE.Mesh(

                new THREE.BoxGeometry(

                    3.2,

                    2.4,

                    3

                ),

                new THREE.MeshStandardMaterial({

                    color:

                    wallColors[

                        Math.floor(

                            Math.random()*

                            wallColors.length

                        )

                    ]

                })

            );

        body.position.y=

            1.2;

        body.castShadow=true;

        g.add(body);

        //--------------------------------
        // 屋根
        //--------------------------------

        const roof=

            new THREE.Mesh(

                new THREE.ConeGeometry(

                    2.7,

                    1.2,

                    4

                ),

                new THREE.MeshStandardMaterial({

                    color:

                    roofColors[

                        Math.floor(

                            Math.random()*

                            roofColors.length

                        )

                    ]

                })

            );

        roof.rotation.y=

            Math.PI/4;

        roof.position.y=

            3;

        roof.castShadow=true;

        g.add(roof);

        //--------------------------------
        // ドア
        //--------------------------------

        const door=

            new THREE.Mesh(

                new THREE.BoxGeometry(

                    .55,

                    1.2,

                    .08

                ),

                new THREE.MeshStandardMaterial({

                    color:0x6a4328

                })

            );

        door.position.set(

            (Math.random()-.5)*1.2,

            .6,

            1.55

        );

        g.add(door);

        //--------------------------------
        // 窓
        //--------------------------------

        for(

            let i=0;

            i<4;

            i++

        ){

            const win=

                new THREE.Mesh(

                    new THREE.PlaneGeometry(

                        .45,

                        .45

                    ),

                    new THREE.MeshBasicMaterial({

                        color:0x99d8ff

                    })

                );

            win.position.set(

                -1+

                (i%2)*2,

                1.7,

                1.56

            );

            if(i>=2){

                win.position.y=

                    1;

            }

            g.add(win);

        }

        return g;

    }

}
