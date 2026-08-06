// ============================================================================
// world/CampBuilder.js
// Part 1
// ゴールキャンプ場
// V11
// ============================================================================

import * as THREE from "three";

export default class CampBuilder {

    constructor(scene){

        this.scene = scene;

        this.group = new THREE.Group();

        this.lanternLights = [];

    }

    //=========================================================================
    // 作成
    //=========================================================================
    build(center){

        //--------------------------------
        // 地面
        //--------------------------------

        const ground =

            new THREE.Mesh(

                new THREE.CircleGeometry(

                    22,

                    48

                ),

                new THREE.MeshStandardMaterial({

                    color:0x70563a,

                    roughness:1

                })

            );

        ground.rotation.x =

            -Math.PI/2;

        ground.receiveShadow = true;

        this.group.add(

            ground

        );

        //--------------------------------
        // 芝
        //--------------------------------

        const grass =

            new THREE.Mesh(

                new THREE.CircleGeometry(

                    30,

                    64

                ),

                new THREE.MeshStandardMaterial({

                    color:0x4d7d36

                })

            );

        grass.rotation.x =

            -Math.PI/2;

        grass.position.y =

            -.03;

        this.group.add(

            grass

        );

        //--------------------------------
        // テント
        //--------------------------------

        for(

            let i=0;

            i<6;

            i++

        ){

            const angle=

                i/6*

                Math.PI*2;

            const r=10;

            const tent=

                this.createTent();

            tent.position.set(

                Math.cos(angle)*r,

                0,

                Math.sin(angle)*r

            );

            tent.lookAt(

                0,

                0,

                0

            );

            this.group.add(

                tent

            );

        }

        //--------------------------------
        // BBQ
        //--------------------------------

        this.group.add(

            this.createBBQ()

        );

        //--------------------------------
        // 焚き火
        //--------------------------------

        this.group.add(

            this.createFire()

        );

        //--------------------------------
        // ランタン
        //--------------------------------

        for(

            let i=0;

            i<14;

            i++

        ){

            const angle=

                i/14*

                Math.PI*2;

            const r=

                13.5;

            const lantern=

                this.createLantern();

            lantern.position.set(

                Math.cos(angle)*r,

                0,

                Math.sin(angle)*r

            );

            this.group.add(

                lantern

            );

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

    //=========================================================================
    // テント
    //=========================================================================

    createTent(){

        const g=

            new THREE.Group();

        const tent=

            new THREE.Mesh(

                new THREE.ConeGeometry(

                    1.6,

                    1.8,

                    4

                ),

                new THREE.MeshStandardMaterial({

                    color:0xd2b98f

                })

            );

        tent.rotation.y=

            Math.PI/4;

        tent.position.y=

            .9;

        tent.castShadow=true;

        g.add(

            tent

        );

        return g;

    }

    //=========================================================================
    // BBQ
    //=========================================================================

    createBBQ(){

        const g=

            new THREE.Group();

        const table=

            new THREE.Mesh(

                new THREE.BoxGeometry(

                    2,

                    .12,

                    1.2

                ),

                new THREE.MeshStandardMaterial({

                    color:0x704c30

                })

            );

        table.position.y=

            .82;

        g.add(table);

        return g;

    }

    //=========================================================================
    // 焚き火
    //=========================================================================

    createFire(){

        const g=

            new THREE.Group();

        const woodMat=

            new THREE.MeshStandardMaterial({

                color:0x5e3f27

            });

        for(

            let i=0;

            i<4;

            i++

        ){

            const log=

                new THREE.Mesh(

                    new THREE.CylinderGeometry(

                        .08,

                        .08,

                        .8,

                        8

                    ),

                    woodMat

                );

            log.rotation.z=

                Math.PI/2;

            log.rotation.y=

                i*Math.PI/4;

            log.position.y=

                .08;

            g.add(log);

        }

        const flame=

            new THREE.Mesh(

                new THREE.SphereGeometry(

                    .28,

                    12,

                    12

                ),

                new THREE.MeshBasicMaterial({

                    color:0xff8c2a

                })

            );

        flame.position.y=.45;

        g.add(flame);

        const light=

            new THREE.PointLight(

                0xffaa55,

                4.5,

                18

            );

        light.position.y=.6;

        g.add(light);

        return g;

    }

}
// ============================================================================
// world/CampBuilder.js
// Part 2
// ランタン・キャンプテーブル・チェア
// V11
// ============================================================================

//=========================================================================
// ランタン
//=========================================================================

createLantern(){

    const g =

        new THREE.Group();

    //--------------------------------
    // 支柱
    //--------------------------------

    const pole =

        new THREE.Mesh(

            new THREE.CylinderGeometry(

                .05,

                .05,

                1.5,

                8

            ),

            new THREE.MeshStandardMaterial({

                color:0x444444

            })

        );

    pole.position.y=.75;

    g.add(pole);

    //--------------------------------
    // ランタン本体
    //--------------------------------

    const body =

        new THREE.Mesh(

            new THREE.CylinderGeometry(

                .14,

                .14,

                .28,

                10

            ),

            new THREE.MeshStandardMaterial({

                color:0x2b2b2b

            })

        );

    body.position.y=1.55;

    g.add(body);

    //--------------------------------
    // ガラス
    //--------------------------------

    const glass =

        new THREE.Mesh(

            new THREE.CylinderGeometry(

                .11,

                .11,

                .18,

                10

            ),

            new THREE.MeshBasicMaterial({

                color:0xfff4bf

            })

        );

    glass.position.y=1.55;

    g.add(glass);

    //--------------------------------
    // 光
    //--------------------------------

    const light =

        new THREE.PointLight(

            0xffd38a,

            3.5,

            12

        );

    light.position.y=1.55;

    g.add(light);

    this.lanternLights.push(

        light

    );

    return g;

}

//=========================================================================
// キャンプテーブル
//=========================================================================

createTable(){

    const g=

        new THREE.Group();

    const wood=

        new THREE.MeshStandardMaterial({

            color:0x845b39

        });

    const top=

        new THREE.Mesh(

            new THREE.BoxGeometry(

                1.6,

                .08,

                1

            ),

            wood

        );

    top.position.y=.82;

    g.add(top);

    [

        -.65,

        .65

    ].forEach(x=>{

        [

            -.35,

            .35

        ].forEach(z=>{

            const leg=

                new THREE.Mesh(

                    new THREE.BoxGeometry(

                        .08,

                        .8,

                        .08

                    ),

                    wood

                );

            leg.position.set(

                x,

                .4,

                z

            );

            g.add(

                leg

            );

        });

    });

    return g;

}

//=========================================================================
// チェア
//=========================================================================

createChair(){

    const g=

        new THREE.Group();

    const mat=

        new THREE.MeshStandardMaterial({

            color:0x325b86

        });

    const seat=

        new THREE.Mesh(

            new THREE.BoxGeometry(

                .55,

                .06,

                .55

            ),

            mat

        );

    seat.position.y=.42;

    g.add(seat);

    const back=

        new THREE.Mesh(

            new THREE.BoxGeometry(

                .55,

                .45,

                .06

            ),

            mat

        );

    back.position.set(

        0,

        .68,

        -.24

    );

    g.add(back);

    [

        -.22,

        .22

    ].forEach(x=>{

        [

            -.22,

            .22

        ].forEach(z=>{

            const leg=

                new THREE.Mesh(

                    new THREE.BoxGeometry(

                        .05,

                        .42,

                        .05

                    ),

                    new THREE.MeshStandardMaterial({

                        color:0x666666

                    })

                );

            leg.position.set(

                x,

                .21,

                z

            );

            g.add(

                leg

            );

        });

    });

    return g;

}

//=========================================================================
// build()へ追加
//=========================================================================

const table =

    this.createTable();

table.position.set(

    2.5,

    0,

    1.8

);

this.group.add(

    table

);

for(

    let i=0;

    i<4;

    i++

){

    const chair=

        this.createChair();

    const angle=

        i*Math.PI/2;

    chair.position.set(

        Math.cos(angle)*1.25+2.5,

        0,

        Math.sin(angle)*1.25+1.8

    );

    chair.rotation.y=

        angle+

        Math.PI;

    this.group.add(

        chair

    );

}
// ============================================================================
// world/CampBuilder.js
// Part 3
// BBQ・夜演出・星空
// V11
// ============================================================================

//=========================================================================
// BBQコンロ
//=========================================================================

createBBQGrill(){

    const g=

        new THREE.Group();

    //--------------------------------
    // 本体
    //--------------------------------

    const body=

        new THREE.Mesh(

            new THREE.BoxGeometry(

                .9,

                .28,

                .55

            ),

            new THREE.MeshStandardMaterial({

                color:0x444444,

                metalness:.45,

                roughness:.65

            })

        );

    body.position.y=.72;

    g.add(body);

    //--------------------------------
    // 脚
    //--------------------------------

    [

        -.32,

        .32

    ].forEach(x=>{

        [

            -.16,

            .16

        ].forEach(z=>{

            const leg=

                new THREE.Mesh(

                    new THREE.CylinderGeometry(

                        .025,

                        .025,

                        .72,

                        6

                    ),

                    new THREE.MeshStandardMaterial({

                        color:0x666666

                    })

                );

            leg.position.set(

                x,

                .36,

                z

            );

            g.add(

                leg

            );

        });

    });

    //--------------------------------
    // 炭
    //--------------------------------

    for(

        let i=0;

        i<8;

        i++

    ){

        const coal=

            new THREE.Mesh(

                new THREE.DodecahedronGeometry(

                    .055

                ),

                new THREE.MeshBasicMaterial({

                    color:0xff6a1a

                })

            );

        coal.position.set(

            (Math.random()-.5)*.45,

            .82,

            (Math.random()-.5)*.22

        );

        g.add(

            coal

        );

    }

    //--------------------------------
    // 明かり
    //--------------------------------

    const light=

        new THREE.PointLight(

            0xff9440,

            2.8,

            7

        );

    light.position.y=1.05;

    g.add(light);

    return g;

}

//=========================================================================
// 星空
//=========================================================================

createStars(){

    const geo=

        new THREE.BufferGeometry();

    const stars=[];

    for(

        let i=0;

        i<900;

        i++

    ){

        const r=

            420;

        const theta=

            Math.random()*Math.PI*2;

        const phi=

            Math.random()*Math.PI*.48;

        stars.push(

            Math.cos(theta)*Math.sin(phi)*r,

            Math.cos(phi)*r,

            Math.sin(theta)*Math.sin(phi)*r

        );

    }

    geo.setAttribute(

        "position",

        new THREE.Float32BufferAttribute(

            stars,

            3

        )

    );

    const mat=

        new THREE.PointsMaterial({

            color:0xffffff,

            size:1.3,

            sizeAttenuation:true

        });

    const points=

        new THREE.Points(

            geo,

            mat

        );

    this.scene.add(

        points

    );

}

//=========================================================================
// ゴール周辺の夜照明
//=========================================================================

createCampLights(){

    for(

        let i=0;

        i<8;

        i++

    ){

        const angle=

            i*Math.PI/4;

        const light=

            new THREE.PointLight(

                0xffddaa,

                2.4,

                10

            );

        light.position.set(

            Math.cos(angle)*8,

            2,

            Math.sin(angle)*8

        );

        this.group.add(

            light

        );

    }

}

//=========================================================================
// build()へ追加
//=========================================================================

const grill=

    this.createBBQGrill();

grill.position.set(

    -2.2,

    0,

    2

);

this.group.add(

    grill

);

this.createCampLights();

this.createStars();
