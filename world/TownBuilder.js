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
// ============================================================================
// world/TownBuilder.js
// V11
// Part 2
// ガソリンスタンド・警察署
// ============================================================================

//=========================================================================
// ガソリンスタンド
//=========================================================================

createGasStation(){

    const pose=

        this.world.getPose(

            0.205,

            -18

        );

    const g=

        new THREE.Group();

    //--------------------------------
    // 建物
    //--------------------------------

    const shop=

        new THREE.Mesh(

            new THREE.BoxGeometry(

                8,

                3,

                5

            ),

            new THREE.MeshStandardMaterial({

                color:0xf4f4f4

            })

        );

    shop.position.y=

        1.5;

    g.add(shop);

    //--------------------------------
    // キャノピー
    //--------------------------------

    const roof=

        new THREE.Mesh(

            new THREE.BoxGeometry(

                10,

                .28,

                6.5

            ),

            new THREE.MeshStandardMaterial({

                color:0xd13232

            })

        );

    roof.position.y=

        3.25;

    g.add(roof);

    //--------------------------------
    // 支柱
    //--------------------------------

    [

        -3.2,

        3.2

    ].forEach(x=>{

        const pole=

            new THREE.Mesh(

                new THREE.CylinderGeometry(

                    .13,

                    .13,

                    3,

                    8

                ),

                new THREE.MeshStandardMaterial({

                    color:0xffffff

                })

            );

        pole.position.set(

            x,

            1.5,

            1.7

        );

        g.add(

            pole

        );

    });

    //--------------------------------
    // 給油機
    //--------------------------------

    [

        -2,

        0,

        2

    ].forEach(x=>{

        const pump=

            new THREE.Mesh(

                new THREE.BoxGeometry(

                    .45,

                    1.3,

                    .55

                ),

                new THREE.MeshStandardMaterial({

                    color:0xd9d9d9

                })

            );

        pump.position.set(

            x,

            .65,

            1.4

        );

        g.add(

            pump

        );

    });

    g.position.copy(

        pose.position

    );

    g.rotation.y=

        pose.heading+

        Math.PI;

    this.group.add(

        g

    );

}

//=========================================================================
// 警察署
//=========================================================================

createPoliceStation(){

    const pose=

        this.world.getPose(

            0.245,

            18

        );

    const g=

        new THREE.Group();

    //--------------------------------
    // 本体
    //--------------------------------

    const body=

        new THREE.Mesh(

            new THREE.BoxGeometry(

                8,

                3.4,

                6

            ),

            new THREE.MeshStandardMaterial({

                color:0xdfe6ec

            })

        );

    body.position.y=

        1.7;

    g.add(body);

    //--------------------------------
    // 青帯
    //--------------------------------

    const line=

        new THREE.Mesh(

            new THREE.BoxGeometry(

                8.05,

                .18,

                .15

            ),

            new THREE.MeshStandardMaterial({

                color:0x245ad0

            })

        );

    line.position.set(

        0,

        2.45,

        3.08

    );

    g.add(line);

    //--------------------------------
    // POLICE
    //--------------------------------

    const sign=

        new THREE.Mesh(

            new THREE.BoxGeometry(

                2.5,

                .55,

                .12

            ),

            new THREE.MeshBasicMaterial({

                color:0xffffff

            })

        );

    sign.position.set(

        0,

        2.15,

        3.1

    );

    g.add(sign);

    //--------------------------------
    // パトカー
    //--------------------------------

    const car=

        new THREE.Mesh(

            new THREE.BoxGeometry(

                1.8,

                .7,

                .9

            ),

            new THREE.MeshStandardMaterial({

                color:0xffffff

            })

        );

    car.position.set(

        0,

        .35,

        5

    );

    g.add(car);

    const light=

        new THREE.Mesh(

            new THREE.BoxGeometry(

                .45,

                .15,

                .15

            ),

            new THREE.MeshBasicMaterial({

                color:0x3366ff

            })

        );

    light.position.set(

        0,

        .78,

        5

    );

    g.add(light);

    g.position.copy(

        pose.position

    );

    g.rotation.y=

        pose.heading;

    this.group.add(

        g

    );

}
// ============================================================================
// world/TownBuilder.js
// V11
// Part 3
// ビル街（高さ・幅・色・配置をランダム化）
// ============================================================================

//=========================================================================
// ビル街
//=========================================================================

createBuildings(){

    const colors=[

        0xd9dde2,
        0xc9d2db,
        0xbfc6cd,
        0xe4e4e4,
        0xb4bcc3,
        0xd2cdc7

    ];

    let progress=0.26;

    for(

        let i=0;

        i<42;

        i++

    ){

        progress+=

            0.0038+

            Math.random()*.002;

        const side=

            Math.random()>.5

            ?18+

            Math.random()*5

            :-(18+

            Math.random()*5);

        const pose=

            this.world.getPose(

                progress,

                side

            );

        const g=

            new THREE.Group();

        //--------------------------------
        // 本体
        //--------------------------------

        const width=

            3+

            Math.random()*4;

        const depth=

            3+

            Math.random()*5;

        const height=

            6+

            Math.random()*20;

        const body=

            new THREE.Mesh(

                new THREE.BoxGeometry(

                    width,

                    height,

                    depth

                ),

                new THREE.MeshStandardMaterial({

                    color:

                    colors[

                        Math.floor(

                            Math.random()*

                            colors.length

                        )

                    ]

                })

            );

        body.position.y=

            height*.5;

        body.castShadow=true;

        body.receiveShadow=true;

        g.add(body);

        //--------------------------------
        // 窓
        //--------------------------------

        const winMat=

            new THREE.MeshBasicMaterial({

                color:0x9fd8ff

            });

        const rows=

            Math.floor(

                height/2

            );

        const cols=

            Math.max(

                2,

                Math.floor(

                    width

                )

            );

        for(

            let y=0;

            y<rows;

            y++

        ){

            for(

                let x=0;

                x<cols;

                x++

            ){

                const win=

                    new THREE.Mesh(

                        new THREE.PlaneGeometry(

                            .34,

                            .34

                        ),

                        winMat

                    );

                win.position.set(

                    -width*.35+

                    x*

                    (

                        width*.7/

                        (cols-1)

                    ),

                    1.1+

                    y*1.35,

                    depth*.5+

                    .02

                );

                g.add(

                    win

                );

            }

        }

        //--------------------------------
        // 屋上設備
        //--------------------------------

        if(

            Math.random()>

            .45

        ){

            const box=

                new THREE.Mesh(

                    new THREE.BoxGeometry(

                        width*.35,

                        .7,

                        depth*.3

                    ),

                    new THREE.MeshStandardMaterial({

                        color:0x777777

                    })

                );

            box.position.y=

                height+

                .35;

            g.add(

                box

            );

        }

        //--------------------------------
        // 配置
        //--------------------------------

        g.position.copy(

            pose.position

        );

        g.rotation.y=

            pose.heading+

            (

                side>0

                ?0

                :Math.PI

            );

        this.group.add(

            g

        );

    }

}
// ============================================================================
// world/TownBuilder.js
// V11
// Part 4
// ショッピングモール・コンビニ・横断歩道
// ============================================================================

//=========================================================================
// ショッピングモール
//=========================================================================

createShoppingMall(){

    const pose=

        this.world.getPose(

            0.18,

            22

        );

    const g=

        new THREE.Group();

    //--------------------------------
    // 建物
    //--------------------------------

    const mall=

        new THREE.Mesh(

            new THREE.BoxGeometry(

                18,

                5,

                12

            ),

            new THREE.MeshStandardMaterial({

                color:0xf4efe7

            })

        );

    mall.position.y=2.5;

    g.add(mall);

    //--------------------------------
    // ガラス
    //--------------------------------

    const glass=

        new THREE.Mesh(

            new THREE.PlaneGeometry(

                12,

                2.6

            ),

            new THREE.MeshBasicMaterial({

                color:0x9edcff

            })

        );

    glass.position.set(

        0,

        2,

        6.05

    );

    g.add(glass);

    //--------------------------------
    // 看板
    //--------------------------------

    const sign=

        new THREE.Mesh(

            new THREE.BoxGeometry(

                6,

                .8,

                .25

            ),

            new THREE.MeshStandardMaterial({

                color:0xe54b2f

            })

        );

    sign.position.set(

        0,

        4.6,

        6.15

    );

    g.add(sign);

    //--------------------------------
    // 駐車場
    //--------------------------------

    const parking=

        new THREE.Mesh(

            new THREE.PlaneGeometry(

                18,

                10

            ),

            new THREE.MeshStandardMaterial({

                color:0x666666

            })

        );

    parking.rotation.x=

        -Math.PI/2;

    parking.position.y=.02;

    parking.position.z=11;

    g.add(parking);

    g.position.copy(

        pose.position

    );

    g.rotation.y=

        pose.heading;

    this.group.add(

        g

    );

}

//=========================================================================
// コンビニ
//=========================================================================

createConvenienceStore(){

    const pose=

        this.world.getPose(

            0.145,

            -16

        );

    const g=

        new THREE.Group();

    const body=

        new THREE.Mesh(

            new THREE.BoxGeometry(

                8,

                3,

                6

            ),

            new THREE.MeshStandardMaterial({

                color:0xfafafa

            })

        );

    body.position.y=1.5;

    g.add(body);

    //--------------------------------
    // ライン
    //--------------------------------

    [

        0x1db954,

        0xff7f27,

        0xd92323

    ].forEach((c,i)=>{

        const line=

            new THREE.Mesh(

                new THREE.BoxGeometry(

                    8,

                    .12,

                    .08

                ),

                new THREE.MeshBasicMaterial({

                    color:c

                })

            );

        line.position.set(

            0,

            2.45-i*.18,

            3.05

        );

        g.add(line);

    });

    //--------------------------------
    // ガラス
    //--------------------------------

    const glass=

        new THREE.Mesh(

            new THREE.PlaneGeometry(

                6,

                2

            ),

            new THREE.MeshBasicMaterial({

                color:0xa8e2ff

            })

        );

    glass.position.set(

        0,

        1.5,

        3.06

    );

    g.add(glass);

    g.position.copy(

        pose.position

    );

    g.rotation.y=

        pose.heading+

        Math.PI;

    this.group.add(

        g

    );

}

//=========================================================================
// 横断歩道
//=========================================================================

createCrossWalk(progress){

    const pose=

        this.world.getPose(

            progress,

            0

        );

    const group=

        new THREE.Group();

    for(

        let i=-4;

        i<=4;

        i++

    ){

        const stripe=

            new THREE.Mesh(

                new THREE.BoxGeometry(

                    .7,

                    .02,

                    1.9

                ),

                new THREE.MeshBasicMaterial({

                    color:0xffffff

                })

            );

        stripe.position.set(

            i*.9,

            .12,

            0

        );

        group.add(

            stripe

        );

    }

    group.rotation.y=

        pose.heading;

    group.position.copy(

        pose.position);

    this.group.add(

        group

    );

}

//=========================================================================
// build() の最後へ追加
//=========================================================================

this.createShoppingMall();

this.createConvenienceStore();

this.createCrossWalk(0.09);

this.createCrossWalk(0.23);

// ============================================================================
// world/TownBuilder.js
// V11
// Part 5
// 街の駐車車両・街路樹・街灯・道路標識
// ============================================================================

//=========================================================================
// 駐車車両
//=========================================================================

createParkedCars(){

    const colors=[

        0xffffff,
        0xdc2f2f,
        0x3b6fd9,
        0x444444,
        0xc7c7c7

    ];

    for(

        let i=0;

        i<18;

        i++

    ){

        const pose=

            this.world.getPose(

                0.05+i*0.012,

                i%2?11.5:-11.5

            );

        const g=new THREE.Group();

        //--------------------------------
        // ボディ
        //--------------------------------

        const body=

            new THREE.Mesh(

                new THREE.BoxGeometry(

                    1.8,

                    .65,

                    .95

                ),

                new THREE.MeshStandardMaterial({

                    color:

                    colors[

                        Math.floor(

                            Math.random()*colors.length

                        )

                    ]

                })

            );

        body.position.y=.45;

        g.add(body);

        //--------------------------------
        // キャビン
        //--------------------------------

        const cabin=

            new THREE.Mesh(

                new THREE.BoxGeometry(

                    .95,

                    .45,

                    .82

                ),

                new THREE.MeshStandardMaterial({

                    color:0x99d9ff

                })

            );

        cabin.position.set(

            .15,

            .92,

            0

        );

        g.add(cabin);

        g.position.copy(

            pose.position

        );

        g.rotation.y=

            pose.heading+

            (i%2?0:Math.PI);

        this.group.add(

            g

        );

    }

}

//=========================================================================
// 街路樹
//=========================================================================

createStreetTrees(){

    for(

        let i=0;

        i<28;

        i++

    ){

        const pose=

            this.world.getPose(

                .03+i*.009,

                i%2?9:-9

            );

        const tree=

            new THREE.Group();

        const trunk=

            new THREE.Mesh(

                new THREE.CylinderGeometry(

                    .08,

                    .1,

                    1,

                    8

                ),

                new THREE.MeshStandardMaterial({

                    color:0x6c4828

                })

            );

        trunk.position.y=.5;

        tree.add(trunk);

        const crown=

            new THREE.Mesh(

                new THREE.SphereGeometry(

                    .55,

                    10,

                    10

                ),

                new THREE.MeshStandardMaterial({

                    color:0x4e8a38

                })

            );

        crown.position.y=1.45;

        tree.add(crown);

        tree.position.copy(

            pose.position

        );

        this.group.add(tree);

    }

}

//=========================================================================
// 街灯
//=========================================================================

createStreetLights(){

    for(

        let i=0;

        i<20;

        i++

    ){

        const pose=

            this.world.getPose(

                .05+i*.013,

                i%2?7.2:-7.2

            );

        const pole=

            new THREE.Group();

        const body=

            new THREE.Mesh(

                new THREE.CylinderGeometry(

                    .05,

                    .05,

                    4,

                    8

                ),

                new THREE.MeshStandardMaterial({

                    color:0x777777

                })

            );

        body.position.y=2;

        pole.add(body);

        const arm=

            new THREE.Mesh(

                new THREE.BoxGeometry(

                    .55,

                    .05,

                    .05

                ),

                body.material

            );

        arm.position.set(

            .25,

            3.9,

            0

        );

        pole.add(arm);

        const lamp=

            new THREE.PointLight(

                0xffe5ad,

                0,

                8

            );

        lamp.position.set(

            .48,

            3.8,

            0

        );

        pole.add(lamp);

        pole.position.copy(

            pose.position

        );

        pole.rotation.y=

            pose.heading+

            (i%2?0:Math.PI);

        this.group.add(

            pole

        );

    }

}

//=========================================================================
// build()最後へ追加
//=========================================================================

this.createParkedCars();

this.createStreetTrees();

this.createStreetLights();
