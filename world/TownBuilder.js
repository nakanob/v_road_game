// ============================================================================
// world/TownBuilder.js
// Part 1
// 街生成システム
// 住宅街→コンビニ→GS→警察→スーパー→ビル群
// ============================================================================

import * as THREE from "three";

export default class TownBuilder {

    constructor(scene, world) {

        this.scene = scene;

        this.world = world;

        this.materials = {

            wall: [

                0xf6f1e9,
                0xdadada,
                0xe6d9c7,
                0xd8e3ef,
                0xf2ead7

            ].map(c=>new THREE.MeshLambertMaterial({

                color:c

            })),

            roof:[

                0x444444,
                0x6d4030,
                0x38566b,
                0x6b6b6b,
                0x8c4d32

            ].map(c=>new THREE.MeshLambertMaterial({

                color:c

            })),

            window:

                new THREE.MeshBasicMaterial({

                    color:0x92d8ff

                }),

            road:

                new THREE.MeshLambertMaterial({

                    color:0x4b4b4b

                })

        };

    }

    //=========================================================================
    // 街生成
    //=========================================================================

    build(){

        this.createResidentialArea();

        this.createConvenienceStore();

        this.createGasStation();

        this.createPolice();

        this.createSuperMarket();

        this.createBusinessDistrict();

    }

    //=========================================================================
    // 住宅街
    //=========================================================================

    createResidentialArea(){

        for(

            let i=0;

            i<18;

            i++

        ){

            const progress=

                0.03+

                i*0.012;

            const side=

                i%2?-9:9;

            const pose=

                this.world.getPose(

                    progress,

                    side

                );

            this.createHouse(

                pose.position,

                pose.heading,

                i

            );

        }

    }

    //=========================================================================
    // 一軒家
    //=========================================================================

    createHouse(

        position,

        heading,

        seed

    ){

        const g=

            new THREE.Group();

        const wallMat=

            this.materials.wall[

                seed%

                this.materials.wall.length

            ];

        const roofMat=

            this.materials.roof[

                (seed+2)%

                this.materials.roof.length

            ];

        //--------------------------------

        const body=

            new THREE.Mesh(

                new THREE.BoxGeometry(

                    3.8,

                    2.7,

                    3.8

                ),

                wallMat

            );

        body.position.y=

            1.35;

        body.castShadow=true;

        body.receiveShadow=true;

        g.add(body);

        //--------------------------------

        const roof=

            new THREE.Mesh(

                new THREE.ConeGeometry(

                    3.1,

                    1.5,

                    4

                ),

                roofMat

            );

        roof.rotation.y=

            Math.PI/4;

        roof.position.y=

            3.5;

        g.add(roof);

        //--------------------------------
        // 窓
        //--------------------------------

        for(

            let x=-1;

            x<=1;

            x++

        ){

            const win=

                new THREE.Mesh(

                    new THREE.PlaneGeometry(

                        .45,

                        .55

                    ),

                    this.materials.window

                );

            win.position.set(

                x*.75,

                1.8,

                1.91

            );

            g.add(win);

        }

        //--------------------------------
        // ドア
        //--------------------------------

        const door=

            new THREE.Mesh(

                new THREE.PlaneGeometry(

                    .55,

                    1.15

                ),

                new THREE.MeshLambertMaterial({

                    color:0x69462d

                })

            );

        door.position.set(

            -1.1,

            .75,

            1.92

        );

        g.add(

            door

        );

        //--------------------------------

        g.position.copy(

            position

        );

        g.rotation.y=

            heading+

            Math.PI/2;

        this.scene.add(

            g

        );

    }
