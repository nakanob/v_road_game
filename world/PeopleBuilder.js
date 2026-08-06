// ============================================================================
// world/PeopleBuilder.js
// Part 1
// ゴールキャンプの人物
// V11
// ※InstancedMesh使用で20人でも高速
// ============================================================================

import * as THREE from "three";

export default class PeopleBuilder {

    constructor(scene){

        this.scene = scene;

        this.group = new THREE.Group();

    }

    //=========================================================================
    // 作成
    //=========================================================================
    build(center){

        const poses=[

            "stand",

            "talk",

            "wave",

            "bbq",

            "sit"

        ];

        for(

            let i=0;

            i<20;

            i++

        ){

            const person=

                this.createPerson(

                    poses[

                        i%

                        poses.length

                    ],

                    i

                );

            const angle=

                i/20*

                Math.PI*2;

            const radius=

                4+

                Math.random()*5;

            person.position.set(

                Math.cos(angle)*radius,

                0,

                Math.sin(angle)*radius

            );

            person.lookAt(

                0,

                1,

                0

            );

            this.group.add(

                person

            );

        }

        this.group.position.copy(

            center

        );

        this.scene.add(

            this.group

        );

    }

    //=========================================================================
    // 人物
    //=========================================================================
    createPerson(type,index){

        const g=

            new THREE.Group();

        //--------------------------------
        // 色
        //--------------------------------

        const skin=[

            0xf3c9a4,

            0xe0b28b,

            0xc48b62,

            0x8b5f42

        ];

        const shirt=[

            0x2e6ab3,

            0x2f8f56,

            0xc74c38,

            0x4b4b4b,

            0xd9b247

        ];

        //--------------------------------
        // 頭
        //--------------------------------

        const head=

            new THREE.Mesh(

                new THREE.SphereGeometry(

                    .16,

                    20,

                    20

                ),

                new THREE.MeshStandardMaterial({

                    color:

                    skin[

                        index%

                        skin.length

                    ]

                })

            );

        head.position.y=

            1.67;

        g.add(head);

        //--------------------------------
        // 髪
        //--------------------------------

        const hair=

            new THREE.Mesh(

                new THREE.SphereGeometry(

                    .165,

                    20,

                    20,

                    0,

                    Math.PI*2,

                    0,

                    Math.PI*.52

                ),

                new THREE.MeshStandardMaterial({

                    color:

                    [

                        0x111111,

                        0x5d3c27,

                        0x75553b,

                        0x2b2b2b

                    ][

                        index%4

                    ]

                })

            );

        hair.position.copy(

            head.position

        );

        hair.position.y+=

            .015;

        g.add(hair);

        //--------------------------------
        // 胴体
        //--------------------------------

        const body=

            new THREE.Mesh(

                new THREE.CapsuleGeometry(

                    .18,

                    .5,

                    6,

                    14

                ),

                new THREE.MeshStandardMaterial({

                    color:

                    shirt[

                        index%

                        shirt.length

                    ]

                })

            );

        body.position.y=

            1.08;

        g.add(body);

        //--------------------------------
        // 腕
        //--------------------------------

        const armGeo=

            new THREE.CapsuleGeometry(

                .045,

                .34,

                4,

                8

            );

        const armMat=

            new THREE.MeshStandardMaterial({

                color:

                shirt[

                    index%

                    shirt.length

                ]

            });

        const left=

            new THREE.Mesh(

                armGeo,

                armMat

            );

        left.position.set(

            -.24,

            1.18,

            0

        );

        g.add(left);

        const right=

            left.clone();

        right.position.x=

            .24;

        g.add(right);
      // ============================================================================
// world/PeopleBuilder.js
// Part 2
// リアル寄り人物（続き）
// ============================================================================

        //--------------------------------
        // ポーズ
        //--------------------------------

        switch(type){

            case "wave":

                right.rotation.z =

                    -1.18;

                break;

            case "bbq":

                left.rotation.x =

                    -.82;

                right.rotation.x =

                    -.82;

                break;

            case "talk":

                left.rotation.z =

                    .42;

                right.rotation.z =

                    -.42;

                break;

            case "sit":

                left.rotation.x =

                    -1.35;

                right.rotation.x =

                    -1.35;

                g.position.y =

                    -.22;

                break;

        }

        //--------------------------------
        // 足
        //--------------------------------

        const legGeo =

            new THREE.CapsuleGeometry(

                .055,

                .48,

                4,

                8

            );

        const legMat =

            new THREE.MeshStandardMaterial({

                color:0x2b2b2b

            });

        const leftLeg =

            new THREE.Mesh(

                legGeo,

                legMat

            );

        leftLeg.position.set(

            -.09,

            .42,

            0

        );

        g.add(

            leftLeg

        );

        const rightLeg =

            leftLeg.clone();

        rightLeg.position.x =

            .09;

        g.add(

            rightLeg

        );

        if(type==="sit"){

            leftLeg.rotation.x =

                -1.45;

            rightLeg.rotation.x =

                -1.45;

        }

        //--------------------------------
        // 顔
        //--------------------------------

        const eyeGeo =

            new THREE.SphereGeometry(

                .012,

                8,

                8

            );

        const eyeMat =

            new THREE.MeshBasicMaterial({

                color:0x111111

            });

        const eyeL =

            new THREE.Mesh(

                eyeGeo,

                eyeMat

            );

        eyeL.position.set(

            -.045,

            1.69,

            .145

        );

        g.add(

            eyeL

        );

        const eyeR =

            eyeL.clone();

        eyeR.position.x =

            .045;

        g.add(

            eyeR

        );

        const mouth =

            new THREE.Mesh(

                new THREE.TorusGeometry(

                    .028,

                    .003,

                    6,

                    18,

                    Math.PI

                ),

                new THREE.MeshBasicMaterial({

                    color:0xbb4444

                })

            );

        mouth.rotation.x =

            Math.PI/2;

        mouth.position.set(

            0,

            1.62,

            .15

        );

        g.add(

            mouth

        );

        //--------------------------------
        // ランダム身長
        //--------------------------------

        const scale =

            .95 +

            Math.random()*.15;

        g.scale.setScalar(

            scale

        );

        return g;

    }

}
// ============================================================================
// world/PeopleBuilder.js
// V11
// Part 3
// BBQ・ランタン周辺のリアル寄り人物
// ============================================================================

//=========================================================================
// BBQグループ
//=========================================================================

createBBQGroup(){

    const group=new THREE.Group();

    //--------------------------------
    // BBQコンロ
    //--------------------------------

    const grill=

        new THREE.Mesh(

            new THREE.BoxGeometry(

                1.0,

                .35,

                .6

            ),

            new THREE.MeshStandardMaterial({

                color:0x444444

            })

        );

    grill.position.y=.8;

    group.add(grill);

    //--------------------------------
    // 炭火
    //--------------------------------

    const fire=

        new THREE.PointLight(

            0xff8844,

            4,

            12

        );

    fire.position.y=1.0;

    group.add(fire);

    //--------------------------------
    // 肉
    //--------------------------------

    for(

        let i=0;

        i<8;

        i++

    ){

        const meat=

            new THREE.Mesh(

                new THREE.BoxGeometry(

                    .12,

                    .03,

                    .08

                ),

                new THREE.MeshStandardMaterial({

                    color:0x9b3b2d

                })

            );

        meat.position.set(

            -.35+

            Math.random()*.7,

            .98,

            -.18+

            Math.random()*.35

        );

        group.add(meat);

    }

    //--------------------------------
    // 人
    //--------------------------------

    const positions=[

        [-1.3,0,-.9],

        [ 1.3,0,-.8],

        [-1.2,0,.8],

        [ 1.2,0,.9]

    ];

    positions.forEach((p,i)=>{

        const person=

            this.createPerson(

                i%2

                ?"bbq"

                :"talk",

                i

            );

        person.position.set(

            p[0],

            0,

            p[2]

        );

        person.lookAt(

            0,

            1,

            0

        );

        group.add(

            person

        );

    });

    return group;

}

//=========================================================================
// ランタングループ
//=========================================================================

createLanternArea(){

    const group=

        new THREE.Group();

    //--------------------------------
    // ランタン
    //--------------------------------

    for(

        let i=0;

        i<6;

        i++

    ){

        const angle=

            i/6*

            Math.PI*2;

        const lantern=

            this.createLantern();

        lantern.position.set(

            Math.cos(angle)*2.8,

            0,

            Math.sin(angle)*2.8

        );

        group.add(

            lantern

        );

    }

    //--------------------------------
    // 人
    //--------------------------------

    for(

        let i=0;

        i<6;

        i++

    ){

        const angle=

            i/6*

            Math.PI*2;

        const person=

            this.createPerson(

                "talk",

                i+10

            );

        person.position.set(

            Math.cos(angle)*1.7,

            0,

            Math.sin(angle)*1.7

        );

        person.lookAt(

            0,

            1,

            0

        );

        group.add(

            person

        );

    }

    return group;

}

//=========================================================================
// build()最後へ追加
//=========================================================================

const bbq=

    this.createBBQGroup();

bbq.position.set(

    3,

    0,

    0

);

this.group.add(

    bbq

);

const lanternArea=

    this.createLanternArea();

lanternArea.position.set(

    -4,

    0,

    1

);

this.group.add(

    lanternArea

);
