// ============================================================================
// vehicle/CamperBuilder.js
// Part 1
// V11
// キャンピングカー外装（ZiL風）
// トヨタダイナベース
// ============================================================================

import * as THREE from "three";

export default class CamperBuilder {

    constructor(){

        this.group = new THREE.Group();

    }

    //=========================================================================
    // 作成
    //=========================================================================
    build(){

        //--------------------------------
        // シャーシ
        //--------------------------------

        const chassis =

            new THREE.Mesh(

                new THREE.BoxGeometry(

                    2.18,
                    .28,
                    6.65

                ),

                new THREE.MeshStandardMaterial({

                    color:0x2c2c2c,

                    metalness:.4,

                    roughness:.6

                })

            );

        chassis.position.y=.38;

        this.group.add(chassis);

        //--------------------------------
        // キャブ
        //--------------------------------

        const cab =

            new THREE.Mesh(

                new THREE.BoxGeometry(

                    2.08,
                    1.65,
                    1.75

                ),

                new THREE.MeshStandardMaterial({

                    color:0xffffff

                })

            );

        cab.position.set(

            0,

            1.35,

            2.18

        );

        this.group.add(cab);

        //--------------------------------
        // シェル
        //--------------------------------

        const shell =

            new THREE.Mesh(

                new THREE.BoxGeometry(

                    2.32,
                    2.08,
                    4.65

                ),

                new THREE.MeshStandardMaterial({

                    color:0xffffff

                })

            );

        shell.position.set(

            0,

            1.55,

            -.72

        );

        this.group.add(shell);

        //--------------------------------
        // バンクベッド
        //--------------------------------

        const overCab =

            new THREE.Mesh(

                new THREE.BoxGeometry(

                    2.32,
                    .72,
                    1.25

                ),

                new THREE.MeshStandardMaterial({

                    color:0xffffff

                })

            );

        overCab.position.set(

            0,

            2.25,

            1.15

        );

        this.group.add(overCab);

        //--------------------------------
        // フロントガラス
        //--------------------------------

        const windshield =

            new THREE.Mesh(

                new THREE.PlaneGeometry(

                    1.72,

                    .92

                ),

                new THREE.MeshPhysicalMaterial({

                    color:0x99d6ff,

                    transparent:true,

                    transmission:.9,

                    roughness:.05

                })

            );

        windshield.position.set(

            0,

            1.62,

            3.05

        );

        windshield.rotation.x=

            -.55;

        this.group.add(

            windshield

        );

        //--------------------------------
        // 左右ドアガラス
        //--------------------------------

        [

            -1.045,

            1.045

        ].forEach(x=>{

            const side=

                new THREE.Mesh(

                    new THREE.PlaneGeometry(

                        .82,

                        .72

                    ),

                    windshield.material

                );

            side.position.set(

                x,

                1.55,

                2.2

            );

            side.rotation.y=

                Math.PI/2;

            this.group.add(

                side

            );

        });

        return this.group;

    }

}
// ============================================================================
// vehicle/CamperBuilder.js
// Part 2
// ZiL風ディティール
// 左ドア・リアラダー・リア窓・サイド窓
// ============================================================================

//=========================================================================
// 左側エントランスドア
//=========================================================================

createEntranceDoor(){

    const door =

        new THREE.Mesh(

            new THREE.BoxGeometry(

                .04,

                1.68,

                .72

            ),

            new THREE.MeshStandardMaterial({

                color:0xf9f9f9

            })

        );

    door.position.set(

        -1.18,

        1.38,

        -.55

    );

    this.group.add(

        door

    );

    //--------------------------------
    // 窓
    //--------------------------------

    const window =

        new THREE.Mesh(

            new THREE.PlaneGeometry(

                .42,

                .46

            ),

            new THREE.MeshPhysicalMaterial({

                color:0x9fdcff,

                transparent:true,

                transmission:.95,

                roughness:.04

            })

        );

    window.position.set(

        -1.205,

        1.75,

        -.55

    );

    window.rotation.y=

        Math.PI/2;

    this.group.add(

        window

    );

}

//=========================================================================
// サイド窓
//=========================================================================

createSideWindows(){

    [

        -1.19,

        1.19

    ].forEach(side=>{

        const isLeft=

            side<0;

        const positions=[

            -1.65,

            .55

        ];

        positions.forEach(z=>{

            if(

                isLeft &&

                z===.55

            ){

                return;

            }

            const glass=

                new THREE.Mesh(

                    new THREE.PlaneGeometry(

                        .72,

                        .56

                    ),

                    new THREE.MeshPhysicalMaterial({

                        color:0x9fdcff,

                        transparent:true,

                        transmission:.92,

                        roughness:.05

                    })

                );

            glass.position.set(

                side,

                1.7,

                z

            );

            glass.rotation.y=

                side<0

                ?Math.PI/2

                :-Math.PI/2;

            this.group.add(

                glass

            );

        });

    });

}

//=========================================================================
// リア窓
//=========================================================================

createRearWindow(){

    const rear=

        new THREE.Mesh(

            new THREE.PlaneGeometry(

                .82,

                .62

            ),

            new THREE.MeshPhysicalMaterial({

                color:0x9fdcff,

                transparent:true,

                transmission:.92,

                roughness:.04

            })

        );

    rear.position.set(

        0,

        1.76,

        -3.03

    );

    rear.rotation.y=

        Math.PI;

    this.group.add(

        rear

    );

}

//=========================================================================
// リアラダー（右側）
//=========================================================================

createRearLadder(){

    const mat=

        new THREE.MeshStandardMaterial({

            color:0xb8b8b8,

            metalness:.65,

            roughness:.35

        });

    const x=.82;

    [

        -.08,

        .08

    ].forEach(dx=>{

        const rail=

            new THREE.Mesh(

                new THREE.CylinderGeometry(

                    .018,

                    .018,

                    1.65,

                    6

                ),

                mat

            );

        rail.position.set(

            x+dx,

            1.5,

            -3.01

        );

        this.group.add(

            rail

        );

    });

    for(

        let i=0;

        i<6;

        i++

    ){

        const step=

            new THREE.Mesh(

                new THREE.CylinderGeometry(

                    .016,

                    .016,

                    .18,

                    6

                ),

                mat

            );

        step.rotation.z=

            Math.PI/2;

        step.position.set(

            x,

            .82+i*.27,

            -3.01

        );

        this.group.add(

            step

        );

    }

}

//=========================================================================
// build()最後へ追加
//=========================================================================

this.createEntranceDoor();

this.createSideWindows();

this.createRearWindow();

this.createRearLadder();

// ============================================================================
// vehicle/CamperBuilder.js
// Part 3
// ZiL風ディティール完成
// ヘッドライト・テールランプ・ミラー・ホイール
// ============================================================================

//=========================================================================
// ドアミラー
//=========================================================================

createMirrors(){

    const mat =

        new THREE.MeshStandardMaterial({

            color:0x222222,

            metalness:.35,

            roughness:.55

        });

    [

        -1,

        1

    ].forEach(side=>{

        const arm=

            new THREE.Mesh(

                new THREE.CylinderGeometry(

                    .018,

                    .018,

                    .26,

                    6

                ),

                mat

            );

        arm.rotation.z=

            Math.PI/2;

        arm.position.set(

            side*1.12,

            1.72,

            2.72

        );

        this.group.add(

            arm

        );

        const mirror=

            new THREE.Mesh(

                new THREE.BoxGeometry(

                    .11,

                    .18,

                    .08

                ),

                new THREE.MeshStandardMaterial({

                    color:0x303030

                })

            );

        mirror.position.set(

            side*1.28,

            1.72,

            2.72

        );

        this.group.add(

            mirror

        );

    });

}

//=========================================================================
// ヘッドライト
//=========================================================================

createHeadLights(){

    const lightMat=

        new THREE.MeshBasicMaterial({

            color:0xfff2d2

        });

    [

        -.72,

        .72

    ].forEach(x=>{

        const lamp=

            new THREE.Mesh(

                new THREE.CircleGeometry(

                    .11,

                    18

                ),

                lightMat

            );

        lamp.position.set(

            x,

            .92,

            3.06

        );

        this.group.add(

            lamp

        );

    });

}

//=========================================================================
// テールランプ
//=========================================================================

createTailLights(){

    const mat=

        new THREE.MeshBasicMaterial({

            color:0xff2b2b

        });

    [

        -.82,

        .82

    ].forEach(x=>{

        const tail=

            new THREE.Mesh(

                new THREE.CircleGeometry(

                    .09,

                    18

                ),

                mat

            );

        tail.position.set(

            x,

            .82,

            -3.05

        );

        tail.rotation.y=

            Math.PI;

        this.group.add(

            tail

        );

    });

}

//=========================================================================
// ホイール
//=========================================================================

createWheels(){

    const tireMat=

        new THREE.MeshStandardMaterial({

            color:0x202020,

            roughness:1

        });

    const wheelMat=

        new THREE.MeshStandardMaterial({

            color:0xbdbdbd,

            metalness:.55

        });

    const pos=[

        [-1.02,.48,1.55],

        [ 1.02,.48,1.55],

        [-1.02,.48,-1.45],

        [ 1.02,.48,-1.45]

    ];

    this.wheels=[];

    pos.forEach(p=>{

        const g=

            new THREE.Group();

        const tire=

            new THREE.Mesh(

                new THREE.CylinderGeometry(

                    .43,

                    .43,

                    .26,

                    20

                ),

                tireMat

            );

        tire.rotation.z=

            Math.PI/2;

        g.add(

            tire

        );

        const wheel=

            new THREE.Mesh(

                new THREE.CylinderGeometry(

                    .28,

                    .28,

                    .28,

                    18

                ),

                wheelMat

            );

        wheel.rotation.z=

            Math.PI/2;

        g.add(

            wheel

        );

        g.position.set(

            p[0],

            p[1],

            p[2]

        );

        this.group.add(

            g

        );

        this.wheels.push(

            g

        );

    });

}

//=========================================================================
// build() の最後へ追加
//=========================================================================

this.createMirrors();

this.createHeadLights();

this.createTailLights();

this.createWheels();

return this.group;
