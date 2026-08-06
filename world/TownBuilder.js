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
// ============================================================================
// world/TownBuilder.js
// Part 2
// コンビニ・ガソリンスタンド・警察署
// ============================================================================

// ============================================================================
// コンビニ
// ============================================================================

createConvenienceStore() {

    const pose =

        this.world.getPose(

            0.235,

            -11

        );

    const group =

        new THREE.Group();

    const wallMaterial =

        new THREE.MeshLambertMaterial({

            color: 0xf5f5f1

        });

    const roofMaterial =

        new THREE.MeshLambertMaterial({

            color: 0x4c555c

        });

    const glassMaterial =

        new THREE.MeshLambertMaterial({

            color: 0x8fcce2,

            transparent: true,

            opacity: 0.78

        });

    const blueMaterial =

        new THREE.MeshBasicMaterial({

            color: 0x2d9fd8

        });

    const orangeMaterial =

        new THREE.MeshBasicMaterial({

            color: 0xf28a32

        });

    // ------------------------------------------------------------------------
    // 建物
    // ------------------------------------------------------------------------

    const building =

        new THREE.Mesh(

            new THREE.BoxGeometry(

                8.5,

                3.4,

                6.5

            ),

            wallMaterial

        );

    building.position.y =

        1.7;

    building.castShadow = true;

    building.receiveShadow = true;

    group.add(

        building

    );

    // ------------------------------------------------------------------------
    // 屋根
    // ------------------------------------------------------------------------

    const roof =

        new THREE.Mesh(

            new THREE.BoxGeometry(

                8.9,

                0.25,

                6.9

            ),

            roofMaterial

        );

    roof.position.y =

        3.52;

    roof.castShadow = true;

    group.add(

        roof

    );

    // ------------------------------------------------------------------------
    // ブランド帯
    // ------------------------------------------------------------------------

    const blueBand =

        new THREE.Mesh(

            new THREE.BoxGeometry(

                8.7,

                0.38,

                0.12

            ),

            blueMaterial

        );

    blueBand.position.set(

        0,

        2.92,

        3.31

    );

    group.add(

        blueBand

    );

    const orangeBand =

        new THREE.Mesh(

            new THREE.BoxGeometry(

                8.7,

                0.16,

                0.13

            ),

            orangeMaterial

        );

    orangeBand.position.set(

        0,

        2.64,

        3.32

    );

    group.add(

        orangeBand

    );

    // ------------------------------------------------------------------------
    // 自動ドア
    // ------------------------------------------------------------------------

    const entrance =

        new THREE.Mesh(

            new THREE.PlaneGeometry(

                2.1,

                2.25

            ),

            glassMaterial

        );

    entrance.position.set(

        0,

        1.15,

        3.27

    );

    group.add(

        entrance

    );

    // ------------------------------------------------------------------------
    // 店舗窓
    // ------------------------------------------------------------------------

    for (

        const x of [

            -3.1,

            -1.85,

            1.85,

            3.1

        ]

    ) {

        const windowMesh =

            new THREE.Mesh(

                new THREE.PlaneGeometry(

                    1.05,

                    1.45

                ),

                glassMaterial

            );

        windowMesh.position.set(

            x,

            1.45,

            3.28

        );

        group.add(

            windowMesh

        );

    }

    // ------------------------------------------------------------------------
    // 駐車場
    // ------------------------------------------------------------------------

    const parking =

        new THREE.Mesh(

            new THREE.PlaneGeometry(

                14,

                11

            ),

            new THREE.MeshLambertMaterial({

                color: 0x777b7d

            })

        );

    parking.rotation.x =

        -Math.PI / 2;

    parking.position.set(

        0,

        0.02,

        7.3

    );

    parking.receiveShadow = true;

    group.add(

        parking

    );

    // ------------------------------------------------------------------------
    // 駐車区画
    // ------------------------------------------------------------------------

    const lineMaterial =

        new THREE.MeshBasicMaterial({

            color: 0xffffff

        });

    for (

        let x = -5;

        x <= 5;

        x += 2.5

    ) {

        const line =

            new THREE.Mesh(

                new THREE.PlaneGeometry(

                    0.08,

                    4.2

                ),

                lineMaterial

            );

        line.rotation.x =

            -Math.PI / 2;

        line.position.set(

            x,

            0.04,

            7.5

        );

        group.add(

            line

        );

    }

    group.position.copy(

        pose.position

    );

    group.rotation.y =

        Math.atan2(

            pose.tangent.x,

            pose.tangent.z

        ) +

        Math.PI / 2;

    this.scene.add(

        group

    );

}


// ============================================================================
// ガソリンスタンド
// ============================================================================

createGasStation() {

    const pose =

        this.world.getPose(

            0.255,

            12

        );

    const group =

        new THREE.Group();

    const whiteMaterial =

        new THREE.MeshLambertMaterial({

            color: 0xf0f1f1

        });

    const redMaterial =

        new THREE.MeshLambertMaterial({

            color: 0xce4438

        });

    const darkMaterial =

        new THREE.MeshLambertMaterial({

            color: 0x343a40

        });

    const glassMaterial =

        new THREE.MeshLambertMaterial({

            color: 0x95bfd0,

            transparent: true,

            opacity: 0.76

        });

    // ------------------------------------------------------------------------
    // 店舗
    // ------------------------------------------------------------------------

    const shop =

        new THREE.Mesh(

            new THREE.BoxGeometry(

                8,

                3.5,

                6

            ),

            whiteMaterial

        );

    shop.position.set(

        0,

        1.75,

        -3

    );

    shop.castShadow = true;

    shop.receiveShadow = true;

    group.add(

        shop

    );

    const shopWindow =

        new THREE.Mesh(

            new THREE.PlaneGeometry(

                5.8,

                1.5

            ),

            glassMaterial

        );

    shopWindow.position.set(

        0,

        1.6,

        0.03

    );

    group.add(

        shopWindow

    );

    // ------------------------------------------------------------------------
    // 大屋根
    // ------------------------------------------------------------------------

    const canopy =

        new THREE.Mesh(

            new THREE.BoxGeometry(

                13.5,

                0.45,

                8.5

            ),

            whiteMaterial

        );

    canopy.position.set(

        0,

        4.8,

        4

    );

    canopy.castShadow = true;

    group.add(

        canopy

    );

    const canopyBand =

        new THREE.Mesh(

            new THREE.BoxGeometry(

                13.8,

                0.42,

                8.8

            ),

            redMaterial

        );

    canopyBand.position.set(

        0,

        4.6,

        4

    );

    group.add(

        canopyBand

    );

    // ------------------------------------------------------------------------
    // 支柱
    // ------------------------------------------------------------------------

    for (

        const x of [

            -4.4,

            0,

            4.4

        ]

    ) {

        const pillar =

            new THREE.Mesh(

                new THREE.BoxGeometry(

                    0.42,

                    4.5,

                    0.42

                ),

                whiteMaterial

            );

        pillar.position.set(

            x,

            2.25,

            4

        );

        pillar.castShadow = true;

        group.add(

            pillar

        );

    }

    // ------------------------------------------------------------------------
    // 給油機
    // ------------------------------------------------------------------------

    for (

        const x of [

            -2.4,

            2.4

        ]

    ) {

        const pump =

            new THREE.Mesh(

                new THREE.BoxGeometry(

                    0.9,

                    1.8,

                    0.85

                ),

                redMaterial

            );

        pump.position.set(

            x,

            0.9,

            4

        );

        pump.castShadow = true;

        group.add(

            pump

        );

        const display =

            new THREE.Mesh(

                new THREE.PlaneGeometry(

                    0.52,

                    0.38

                ),

                darkMaterial

            );

        display.position.set(

            x,

            1.2,

            4.43

        );

        group.add(

            display

        );

    }

    // ------------------------------------------------------------------------
    // 敷地
    // ------------------------------------------------------------------------

    const ground =

        new THREE.Mesh(

            new THREE.PlaneGeometry(

                16,

                17

            ),

            new THREE.MeshLambertMaterial({

                color: 0x85898a

            })

        );

    ground.rotation.x =

        -Math.PI / 2;

    ground.position.set(

        0,

        0.01,

        2

    );

    ground.receiveShadow = true;

    group.add(

        ground

    );

    group.position.copy(

        pose.position

    );

    group.rotation.y =

        Math.atan2(

            pose.tangent.x,

            pose.tangent.z

        ) -

        Math.PI / 2;

    this.scene.add(

        group

    );

}


// ============================================================================
// 警察署
// ============================================================================

createPolice() {

    const pose =

        this.world.getPose(

            0.268,

            -12

        );

    const group =

        new THREE.Group();

    const wallMaterial =

        new THREE.MeshLambertMaterial({

            color: 0xe6e9ed

        });

    const blueMaterial =

        new THREE.MeshLambertMaterial({

            color: 0x365e9c

        });

    const glassMaterial =

        new THREE.MeshLambertMaterial({

            color: 0x8eb7ca,

            transparent: true,

            opacity: 0.78

        });

    // ------------------------------------------------------------------------
    // 本体
    // ------------------------------------------------------------------------

    const building =

        new THREE.Mesh(

            new THREE.BoxGeometry(

                9.5,

                4.4,

                7.5

            ),

            wallMaterial

        );

    building.position.y =

        2.2;

    building.castShadow = true;

    building.receiveShadow = true;

    group.add(

        building

    );

    // ------------------------------------------------------------------------
    // 青い屋根
    // ------------------------------------------------------------------------

    const roof =

        new THREE.Mesh(

            new THREE.BoxGeometry(

                10,

                0.35,

                8

            ),

            blueMaterial

        );

    roof.position.y =

        4.58;

    group.add(

        roof

    );

    // ------------------------------------------------------------------------
    // 入口
    // ------------------------------------------------------------------------

    const entrance =

        new THREE.Mesh(

            new THREE.BoxGeometry(

                2.3,

                2.6,

                1.2

            ),

            wallMaterial

        );

    entrance.position.set(

        0,

        1.3,

        4.2

    );

    group.add(

        entrance

    );

    const entranceGlass =

        new THREE.Mesh(

            new THREE.PlaneGeometry(

                1.45,

                2.05

            ),

            glassMaterial

        );

    entranceGlass.position.set(

        0,

        1.25,

        4.82

    );

    group.add(

        entranceGlass

    );

    // ------------------------------------------------------------------------
    // 窓
    // ------------------------------------------------------------------------

    for (

        const y of [

            1.3,

            3.1

        ]

    ) {

        for (

            const x of [

                -3.3,

                -1.7,

                1.7,

                3.3

            ]

        ) {

            const windowMesh =

                new THREE.Mesh(

                    new THREE.PlaneGeometry(

                        1.05,

                        0.9

                    ),

                    glassMaterial

                );

            windowMesh.position.set(

                x,

                y,

                3.77

            );

            group.add(

                windowMesh

            );

        }

    }

    // ------------------------------------------------------------------------
    // 警察マーク風
    // ------------------------------------------------------------------------

    const mark =

        new THREE.Mesh(

            new THREE.CircleGeometry(

                0.48,

                24

            ),

            new THREE.MeshBasicMaterial({

                color: 0x2f62ad

            })

        );

    mark.position.set(

        0,

        3.55,

        3.79

    );

    group.add(

        mark

    );

    group.position.copy(

        pose.position

    );

    group.rotation.y =

        Math.atan2(

            pose.tangent.x,

            pose.tangent.z

        ) +

        Math.PI / 2;

    this.scene.add(

        group

    );

}
    // ============================================================================
// world/TownBuilder.js
// Part 3
// スーパー・ショッピングモール・ビル街
// ============================================================================

// ============================================================================
// スーパー
// ============================================================================

createSuperMarket() {

    const pose =
        this.world.getPose(
            0.292,
            12
        );

    const group =
        new THREE.Group();

    const wallMaterial =
        new THREE.MeshLambertMaterial({

            color:0xf4f1eb

        });

    const roofMaterial =
        new THREE.MeshLambertMaterial({

            color:0x2f2f2f

        });

    const glassMaterial =
        new THREE.MeshLambertMaterial({

            color:0x8fc7df,

            transparent:true,

            opacity:.8

        });

    //----------------------------------

    const body =
        new THREE.Mesh(

            new THREE.BoxGeometry(

                16,
                5,
                12

            ),

            wallMaterial

        );

    body.position.y=2.5;

    body.castShadow=true;

    body.receiveShadow=true;

    group.add(body);

    //----------------------------------

    const roof =
        new THREE.Mesh(

            new THREE.BoxGeometry(

                16.6,
                .35,
                12.6

            ),

            roofMaterial

        );

    roof.position.y=5.2;

    group.add(roof);

    //----------------------------------

    const entrance =
        new THREE.Mesh(

            new THREE.PlaneGeometry(

                4,
                2.8

            ),

            glassMaterial

        );

    entrance.position.set(

        0,

        1.8,

        6.02

    );

    group.add(

        entrance

    );

    //----------------------------------
    // 看板
    //----------------------------------

    const sign =
        new THREE.Mesh(

            new THREE.BoxGeometry(

                8,

                .7,

                .25

            ),

            new THREE.MeshBasicMaterial({

                color:0xe14b2e

            })

        );

    sign.position.set(

        0,

        4.15,

        6.1

    );

    group.add(sign);

    //----------------------------------
    // 駐車場
    //----------------------------------

    const parking =
        new THREE.Mesh(

            new THREE.PlaneGeometry(

                22,

                16

            ),

            new THREE.MeshLambertMaterial({

                color:0x7a7d80

            })

        );

    parking.rotation.x=
        -Math.PI/2;

    parking.position.set(

        0,

        .02,

        12

    );

    parking.receiveShadow=true;

    group.add(

        parking

    );

    group.position.copy(

        pose.position

    );

    group.rotation.y=

        Math.atan2(

            pose.tangent.x,

            pose.tangent.z

        )-

        Math.PI/2;

    this.scene.add(group);

}

// ============================================================================
// ショッピングモール
// ============================================================================

createShoppingMall(){

    const pose =
        this.world.getPose(

            0.318,

            -16

        );

    const mall =
        new THREE.Group();

    const colors=[

        0xf0f0f0,

        0xe8e5de,

        0xdfe5ea

    ];

    for(

        let i=0;

        i<3;

        i++

    ){

        const block=

            new THREE.Mesh(

                new THREE.BoxGeometry(

                    11,

                    6+i,

                    10

                ),

                new THREE.MeshLambertMaterial({

                    color:

                    colors[i]

                })

            );

        block.position.set(

            i*8-8,

            3+i*.5,

            0

        );

        block.castShadow=true;

        mall.add(block);

    }

    //----------------------------------

    const glass=

        new THREE.Mesh(

            new THREE.PlaneGeometry(

                24,

                3

            ),

            new THREE.MeshLambertMaterial({

                color:0x9fd0e8,

                transparent:true,

                opacity:.8

            })

        );

    glass.position.set(

        0,

        2,

        5.05

    );

    mall.add(

        glass

    );

    mall.position.copy(

        pose.position

    );

    mall.rotation.y=

        Math.atan2(

            pose.tangent.x,

            pose.tangent.z

        )+

        Math.PI/2;

    this.scene.add(

        mall

    );

}

// ============================================================================
// ビル群
// ============================================================================

createBusinessDistrict(){

    for(

        let i=0;

        i<32;

        i++

    ){

        const progress=

            0.34+

            Math.random()*.05;

        const side=

            Math.random()<.5?

            -15:

            15;

        const pose=

            this.world.getPose(

                progress,

                side+

                (Math.random()-0.5)*4

            );

        const floors=

            4+

            Math.floor(

                Math.random()*10

            );

        const width=

            3+

            Math.random()*4;

        const depth=

            3+

            Math.random()*3;

        const building=

            new THREE.Group();

        const wall=

            new THREE.Mesh(

                new THREE.BoxGeometry(

                    width,

                    floors*1.2,

                    depth

                ),

                new THREE.MeshLambertMaterial({

                    color:

                    new THREE.Color()

                    .setHSL(

                        Math.random(),

                        .08,

                        .72+

                        Math.random()*.12

                    )

                })

            );

        wall.position.y=

            floors*.6;

        wall.castShadow=true;

        wall.receiveShadow=true;

        building.add(wall);

        //----------------------------------
        // 窓
        //----------------------------------

        const windowMat=

            new THREE.MeshBasicMaterial({

                color:0x97d9ff

            });

        for(

            let y=0;

            y<floors;

            y++

        ){

            for(

                let x=-1;

                x<=1;

                x++

            ){

                const win=

                    new THREE.Mesh(

                        new THREE.PlaneGeometry(

                            .35,

                            .42

                        ),

                        windowMat

                    );

                win.position.set(

                    x*(width*.28),

                    .7+y*1.1,

                    depth*.5+.01

                );

                building.add(

                    win

                );

            }

        }

        building.position.copy(

            pose.position

        );

        building.rotation.y=

            Math.atan2(

                pose.tangent.x,

                pose.tangent.z

            )+

            Math.PI/2;

        this.scene.add(

            building

        );

    }

}
    // ============================================================================
// world/TownBuilder.js
// Part 4
// 横断歩道・歩道・街灯・信号・道路標識
// ============================================================================

// ============================================================================
// 横断歩道
// ============================================================================

createCrossWalk(progress) {

    const pose =

        this.world.getPose(

            progress,

            0

        );

    const group =

        new THREE.Group();

    //----------------------------------
    // 白線
    //----------------------------------

    const stripeMaterial =

        new THREE.MeshBasicMaterial({

            color:0xffffff

        });

    for(

        let i=-4;

        i<=4;

        i++

    ){

        const stripe =

            new THREE.Mesh(

                new THREE.PlaneGeometry(

                    .45,

                    3.6

                ),

                stripeMaterial

            );

        stripe.rotation.x=

            -Math.PI/2;

        stripe.position.set(

            i*.65,

            .03,

            0

        );

        group.add(

            stripe

        );

    }

    group.position.copy(

        pose.position

    );

    group.rotation.y=

        Math.atan2(

            pose.tangent.x,

            pose.tangent.z

        );

    this.scene.add(

        group

    );

}

// ============================================================================
// 歩道
// ============================================================================

createSideWalk(progress,length=28){

    const pose =

        this.world.getPose(

            progress,

            0

        );

    const group =

        new THREE.Group();

    const mat =

        new THREE.MeshLambertMaterial({

            color:0xbebebe

        });

    [

        -5.2,

        5.2

    ].forEach(x=>{

        const walk =

            new THREE.Mesh(

                new THREE.BoxGeometry(

                    1.3,

                    .15,

                    length

                ),

                mat

            );

        walk.position.set(

            x,

            .07,

            0

        );

        walk.receiveShadow=true;

        group.add(

            walk

        );

    });

    group.position.copy(

        pose.position

    );

    group.rotation.y=

        Math.atan2(

            pose.tangent.x,

            pose.tangent.z

        );

    this.scene.add(

        group

    );

}

// ============================================================================
// 街灯
// ============================================================================

createStreetLight(position){

    const group =

        new THREE.Group();

    const pole =

        new THREE.Mesh(

            new THREE.CylinderGeometry(

                .08,

                .1,

                4.8,

                10

            ),

            new THREE.MeshLambertMaterial({

                color:0x666666

            })

        );

    pole.position.y=

        2.4;

    group.add(

        pole

    );

    const arm =

        new THREE.Mesh(

            new THREE.BoxGeometry(

                .9,

                .08,

                .08

            ),

            new THREE.MeshLambertMaterial({

                color:0x666666

            })

        );

    arm.position.set(

        .42,

        4.65,

        0

    );

    group.add(

        arm

    );

    const lamp =

        new THREE.Mesh(

            new THREE.SphereGeometry(

                .12,

                12,

                12

            ),

            new THREE.MeshBasicMaterial({

                color:0xffefc8

            })

        );

    lamp.position.set(

        .83,

        4.48,

        0

    );

    group.add(

        lamp

    );

    const light =

        new THREE.PointLight(

            0xffd38f,

            0,

            10

        );

    light.position.copy(

        lamp.position

    );

    group.add(

        light

    );

    group.userData.light =

        light;

    group.position.copy(

        position

    );

    this.scene.add(

        group

    );

    return group;

}

// ============================================================================
// 信号機
// ============================================================================

createTrafficSignal(position){

    const signal =

        new THREE.Group();

    const pole =

        new THREE.Mesh(

            new THREE.CylinderGeometry(

                .08,

                .1,

                4.5,

                8

            ),

            new THREE.MeshLambertMaterial({

                color:0x555555

            })

        );

    pole.position.y=

        2.25;

    signal.add(

        pole

    );

    const box =

        new THREE.Mesh(

            new THREE.BoxGeometry(

                .45,

                .9,

                .32

            ),

            new THREE.MeshLambertMaterial({

                color:0x222222

            })

        );

    box.position.set(

        0,

        3.7,

        0

    );

    signal.add(

        box

    );

    [

        0xff3333,

        0xffdd44,

        0x33ff55

    ].forEach(

        (c,i)=>{

            const lamp=

                new THREE.Mesh(

                    new THREE.CircleGeometry(

                        .08,

                        12

                    ),

                    new THREE.MeshBasicMaterial({

                        color:c

                    })

                );

            lamp.position.set(

                0,

                3.95-i*.28,

                .17

            );

            signal.add(

                lamp

            );

        }

    );

    signal.position.copy(

        position

    );

    this.scene.add(

        signal

    );

}

// ============================================================================
// 標識
// ============================================================================

createRoadSign(position,textColor=0xffffff){

    const sign =

        new THREE.Group();

    const pole =

        new THREE.Mesh(

            new THREE.CylinderGeometry(

                .05,

                .06,

                2.5,

                8

            ),

            new THREE.MeshLambertMaterial({

                color:0x777777

            })

        );

    pole.position.y=

        1.25;

    sign.add(

        pole

    );

    const board =

        new THREE.Mesh(

            new THREE.BoxGeometry(

                .9,

                .7,

                .08

            ),

            new THREE.MeshBasicMaterial({

                color:0x2c6fd2

            })

        );

    board.position.y=

        2.2;

    sign.add(

        board

    );

    sign.position.copy(

        position

    );

    this.scene.add(

        sign

    );

}

// ============================================================================
// build() 最後に追加
// ============================================================================

this.createCrossWalk(0.105);

this.createCrossWalk(0.185);

this.createSideWalk(0.11);

this.createSideWalk(0.18);
    // ============================================================================
// world/TownBuilder.js
// Part 5
// ビル街のディティールアップ
// 駐車場・植栽・街路樹・歩道ベンチ
// ============================================================================

// ============================================================================
// 駐車場
// ============================================================================

createParkingLot(position,width=18,depth=24){

    const parking = new THREE.Group();

    const asphalt =
        new THREE.Mesh(

            new THREE.PlaneGeometry(

                width,
                depth

            ),

            new THREE.MeshLambertMaterial({

                color:0x6d6f72

            })

        );

    asphalt.rotation.x =
        -Math.PI/2;

    asphalt.receiveShadow = true;

    parking.add(asphalt);

    const lineMat =
        new THREE.MeshBasicMaterial({

            color:0xffffff

        });

    for(

        let x=-width/2+2;

        x<width/2;

        x+=2.7

    ){

        const line =
            new THREE.Mesh(

                new THREE.PlaneGeometry(

                    .08,
                    depth-2

                ),

                lineMat

            );

        line.rotation.x =
            -Math.PI/2;

        line.position.set(

            x,
            .02,
            0

        );

        parking.add(line);

    }

    parking.position.copy(position);

    this.scene.add(parking);

}

// ============================================================================
// 植栽
// ============================================================================

createPlanter(position){

    const planter = new THREE.Group();

    const box =
        new THREE.Mesh(

            new THREE.BoxGeometry(

                1.4,
                .45,
                1.4

            ),

            new THREE.MeshLambertMaterial({

                color:0x9a9a9a

            })

        );

    box.position.y=.22;

    planter.add(box);

    const bush =
        new THREE.Mesh(

            new THREE.SphereGeometry(

                .55,
                12,
                12

            ),

            new THREE.MeshLambertMaterial({

                color:0x4b8b3d

            })

        );

    bush.position.y=.9;

    planter.add(bush);

    planter.position.copy(position);

    this.scene.add(planter);

}

// ============================================================================
// ベンチ
// ============================================================================

createBench(position){

    const bench = new THREE.Group();

    const wood =
        new THREE.MeshLambertMaterial({

            color:0x8b5d37

        });

    const leg =
        new THREE.MeshLambertMaterial({

            color:0x555555

        });

    const seat =
        new THREE.Mesh(

            new THREE.BoxGeometry(

                1.4,
                .08,
                .45

            ),

            wood

        );

    seat.position.y=.55;

    bench.add(seat);

    const back =
        new THREE.Mesh(

            new THREE.BoxGeometry(

                1.4,
                .45,
                .08

            ),

            wood

        );

    back.position.set(

        0,
        .82,
        -.18

    );

    bench.add(back);

    [

        -.55,
        .55

    ].forEach(x=>{

        const l =
            new THREE.Mesh(

                new THREE.BoxGeometry(

                    .08,
                    .55,
                    .08

                ),

                leg

            );

        l.position.set(

            x,
            .27,
            -.1

        );

        bench.add(l);

    });

    bench.position.copy(position);

    this.scene.add(bench);

}

// ============================================================================
// ビル街装飾
// build()最後へ追加
// ============================================================================

const city = this.world.getPose(0.36,0);

this.createParkingLot(

    city.position.clone().add(

        new THREE.Vector3(

            -18,
            0,
            -5

        )

    )

);

this.createPlanter(

    city.position.clone().add(

        new THREE.Vector3(

            -4,
            0,
            8

        )

    )

);

this.createPlanter(

    city.position.clone().add(

        new THREE.Vector3(

            5,
            0,
            10

        )

    )

);

this.createBench(

    city.position.clone().add(

        new THREE.Vector3(

            8,
            0,
            -7

        )

    )

);
