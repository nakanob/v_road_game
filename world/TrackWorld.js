// ============================================================================
// world/TrackWorld.js
// Part 1
// 川・橋・トンネルを画像イメージへ変更
// ============================================================================

createRiverBridgeTunnel() {

    this.createRealRiver();

    this.createWoodBridge();

    this.createMountainTunnel();

}

// ============================================================================
// 本物の川
// ============================================================================

createRealRiver() {

    const sample =
        this.getSample(0.41);

    const river =
        new THREE.Group();

    //--------------------------------
    // 川底
    //--------------------------------

    const bed = new THREE.Mesh(

        new THREE.BoxGeometry(

            42,
            6,
            230

        ),

        new THREE.MeshStandardMaterial({

            color: 0x74624b,

            roughness: 1

        })

    );

    bed.position.y = -4;

    bed.receiveShadow = true;

    river.add(bed);

    //--------------------------------
    // 左右の土手
    //--------------------------------

    const bankMat =
        new THREE.MeshStandardMaterial({

            color: 0x6f8d48,

            roughness: 1

        });

    [-17,17].forEach(x=>{

        const bank =
            new THREE.Mesh(

                new THREE.BoxGeometry(

                    10,

                    2.4,

                    230

                ),

                bankMat

            );

        bank.position.set(

            x,

            -1,

            0

        );

        bank.receiveShadow = true;

        river.add(bank);

    });

    //--------------------------------
    // 水
    //--------------------------------

    const water =

        new THREE.Mesh(

            new THREE.PlaneGeometry(

                18,

                228,

                120,

                120

            ),

            new THREE.MeshPhysicalMaterial({

                color:0x5caed8,

                transparent:true,

                opacity:.92,

                roughness:.05,

                metalness:.08,

                clearcoat:1,

                side:THREE.DoubleSide

            })

        );

    water.rotation.x =

        -Math.PI/2;

    water.position.y =

        -1.55;

    river.add(water);

    //--------------------------------
    // 流れ
    //--------------------------------

    this.waterPlane = water;

    //--------------------------------
    // 岩
    //--------------------------------

    const rockMat =

        new THREE.MeshStandardMaterial({

            map:this.textures.rock,

            roughness:1

        });

    for(

        let i=0;

        i<35;

        i++

    ){

        const rock =

            new THREE.Mesh(

                new THREE.DodecahedronGeometry(

                    .55+

                    Math.random()*.5

                ),

                rockMat

            );

        rock.position.set(

            (Math.random()-.5)*12,

            -1.2,

            -105+

            Math.random()*210

        );

        river.add(rock);

    }

    //--------------------------------
    // 配置
    //--------------------------------

    river.position.copy(

        sample.point

    );

    river.rotation.y =

        Math.atan2(

            sample.side.x,

            sample.side.z

        );

    this.scene.add(

        river

    );

}
// ============================================================================
// world/TrackWorld.js
// Part 2
// 木橋（画像イメージ）
// ============================================================================

createWoodBridge() {

    const sample =
        this.getSample(0.41);

    const bridge =
        new THREE.Group();

    const roadYaw =
        Math.atan2(

            sample.tangent.x,

            sample.tangent.z

        );

    //--------------------------------
    // デッキ
    //--------------------------------

    const deck =

        new THREE.Mesh(

            new THREE.BoxGeometry(

                this.roadHalfWidth * 2 + 1.4,

                0.55,

                30

            ),

            new THREE.MeshStandardMaterial({

                map:this.textures.wood,

                color:0x9b7450,

                roughness:.95

            })

        );

    deck.position.y =

        0.25;

    deck.receiveShadow = true;

    bridge.add(deck);

    //--------------------------------
    // 橋脚
    //--------------------------------

    const pierMat =

        new THREE.MeshStandardMaterial({

            color:0x888888,

            roughness:1

        });

    for(

        let i=-10;

        i<=10;

        i+=10

    ){

        const pier =

            new THREE.Mesh(

                new THREE.BoxGeometry(

                    2.2,

                    3.8,

                    2

                ),

                pierMat

            );

        pier.position.set(

            0,

            -1.8,

            i

        );

        pier.castShadow = true;

        pier.receiveShadow = true;

        bridge.add(

            pier

        );

    }

    //--------------------------------
    // 左右ガードレール
    //--------------------------------

    const railMat =

        new THREE.MeshStandardMaterial({

            color:0x6d533d

        });

    [

        -this.roadHalfWidth-.7,

        this.roadHalfWidth+.7

    ].forEach(x=>{

        const rail =

            new THREE.Mesh(

                new THREE.BoxGeometry(

                    .22,

                    .22,

                    30

                ),

                railMat

            );

        rail.position.set(

            x,

            1.45,

            0

        );

        bridge.add(

            rail

        );

        for(

            let z=-14;

            z<=14;

            z+=2

        ){

            const post =

                new THREE.Mesh(

                    new THREE.BoxGeometry(

                        .18,

                        1.25,

                        .18

                    ),

                    railMat

                );

            post.position.set(

                x,

                .8,

                z

            );

            bridge.add(

                post

            );

        }

    });

    //--------------------------------
    // 路面
    //--------------------------------

    const asphalt =

        new THREE.Mesh(

            new THREE.BoxGeometry(

                this.roadHalfWidth*2,

                .12,

                29

            ),

            new THREE.MeshStandardMaterial({

                map:this.textures.asphalt,

                color:0x666666,

                roughness:1

            })

        );

    asphalt.position.y =

        .62;

    asphalt.receiveShadow = true;

    bridge.add(

        asphalt

    );

    //--------------------------------
    // 配置
    //--------------------------------

    bridge.position.copy(

        sample.point

    );

    bridge.rotation.y =

        roadYaw;

    this.scene.add(

        bridge

    );

}

// ============================================================================
// 毎フレーム
// 水を流す
// ============================================================================

updateRiver(delta){

    if(!this.waterPlane) return;

    const pos =
        this.waterPlane.geometry.attributes.position;

    const t =
        performance.now()*0.0015;

    for(

        let i=0;

        i<pos.count;

        i++

    ){

        const x =
            pos.getX(i);

        const y =

            Math.sin(

                x*.18+

                t

            )*.12+

            Math.cos(

                i*.04+

                t*1.5

            )*.05;

        pos.setZ(

            i,

            y

        );

    }

    pos.needsUpdate=true;

    this.waterPlane.geometry.computeVertexNormals();

}
// ============================================================================
// world/TrackWorld.js
// Part 3
// トンネル（画像イメージ）
// ============================================================================

createMountainTunnel() {

    const sample =
        this.getSample(0.53);

    const yaw =
        Math.atan2(

            sample.tangent.x,

            sample.tangent.z

        );

    const tunnel =
        new THREE.Group();

    //--------------------------------
    // 山本体
    //--------------------------------

    const mountainMat =

        new THREE.MeshStandardMaterial({

            map:this.textures.rock,

            color:0x78736c,

            roughness:1

        });

    const mountain =

        new THREE.Mesh(

            new THREE.ConeGeometry(

                34,

                28,

                4

            ),

            mountainMat

        );

    mountain.rotation.y =

        Math.PI/4;

    mountain.position.y =

        12;

    mountain.castShadow = true;

    mountain.receiveShadow = true;

    tunnel.add(

        mountain

    );

    //--------------------------------
    // 左右山肌
    //--------------------------------

    [

        -16,

        16

    ].forEach(x=>{

        const rock =

            new THREE.Mesh(

                new THREE.DodecahedronGeometry(

                    10,

                    0

                ),

                mountainMat

            );

        rock.position.set(

            x,

            8,

            0

        );

        rock.scale.set(

            1.25,

            1,

            1.5

        );

        rock.castShadow=true;

        rock.receiveShadow=true;

        tunnel.add(

            rock

        );

    });

    //--------------------------------
    // トンネル内壁
    //--------------------------------

    const inside =

        new THREE.Mesh(

            new THREE.CylinderGeometry(

                5.4,

                5.4,

                36,

                32,

                1,

                true,

                0,

                Math.PI

            ),

            new THREE.MeshStandardMaterial({

                color:0x454545,

                side:THREE.BackSide,

                roughness:1

            })

        );

    inside.rotation.x =

        Math.PI/2;

    inside.position.y =

        3.7;

    tunnel.add(

        inside

    );

    //--------------------------------
    // 左壁
    //--------------------------------

    const wallMat =

        new THREE.MeshStandardMaterial({

            color:0x555555

        });

    [

        -5.2,

        5.2

    ].forEach(x=>{

        const wall =

            new THREE.Mesh(

                new THREE.BoxGeometry(

                    .35,

                    3.8,

                    36

                ),

                wallMat

            );

        wall.position.set(

            x,

            1.9,

            0

        );

        tunnel.add(

            wall

        );

    });

    //--------------------------------
    // 路面
    //--------------------------------

    const road =

        new THREE.Mesh(

            new THREE.BoxGeometry(

                10,

                .08,

                36

            ),

            new THREE.MeshStandardMaterial({

                map:this.textures.asphalt,

                color:0x666666,

                roughness:1

            })

        );

    road.position.y =

        .04;

    road.receiveShadow = true;

    tunnel.add(

        road

    );

    //--------------------------------
    // コンクリート坑門
    //--------------------------------

    const portalMat =

        new THREE.MeshStandardMaterial({

            color:0xb5b5b5,

            roughness:1

        });

    const createPortal=()=>{

        const g=new THREE.Group();

        const top=

            new THREE.Mesh(

                new THREE.CylinderGeometry(

                    6.3,

                    6.3,

                    .8,

                    28,

                    1,

                    true,

                    0,

                    Math.PI

                ),

                portalMat

            );

        top.rotation.x=

            Math.PI/2;

        top.position.y=

            3.8;

        g.add(top);

        [

            -6.3,

            6.3

        ].forEach(x=>{

            const p=

                new THREE.Mesh(

                    new THREE.BoxGeometry(

                        .8,

                        3.8,

                        .8

                    ),

                    portalMat

                );

            p.position.set(

                x,

                1.9,

                0

            );

            g.add(p);

        });

        return g;

    };

    const front=

        createPortal();

    front.position.z=

        18;

    tunnel.add(

        front

    );

    const back=

        createPortal();

    back.rotation.y=

        Math.PI;

    back.position.z=

        -18;

    tunnel.add(

        back

    );

    //--------------------------------
    // トンネル照明
    //--------------------------------

    for(

        let z=-15;

        z<=15;

        z+=5

    ){

        const light=

            new THREE.PointLight(

                0xffd39a,

                .9,

                14,

                2

            );

        light.position.set(

            0,

            6,

            z

        );

        tunnel.add(

            light

        );

    }

    //--------------------------------
    // 配置
    //--------------------------------

    tunnel.position.copy(

        sample.point

    );

    tunnel.rotation.y=

        yaw;

    this.scene.add(

        tunnel

    );

}
// ============================================================================
// world/TrackWorld.js
// Part 4
// ゴールキャンプ場（リアル版）
// ============================================================================

createWelcomeCamp() {

    const sample =
        this.getSample(0.985);

    const camp =
        new THREE.Group();

    //--------------------------------
    // 地面
    //--------------------------------

    const ground =

        new THREE.Mesh(

            new THREE.CircleGeometry(

                24,

                64

            ),

            new THREE.MeshStandardMaterial({

                map:this.textures.dirt,

                color:0x8d7358,

                roughness:1

            })

        );

    ground.rotation.x =

        -Math.PI/2;

    ground.receiveShadow = true;

    camp.add(

        ground

    );

    //--------------------------------
    // ランタン
    //--------------------------------

    for(

        let i=0;

        i<14;

        i++

    ){

        const angle =
            i/14*Math.PI*2;

        const x =
            Math.cos(angle)*13;

        const z =
            Math.sin(angle)*13;

        const pole =

            new THREE.Mesh(

                new THREE.CylinderGeometry(

                    .05,

                    .05,

                    2.3,

                    8

                ),

                new THREE.MeshStandardMaterial({

                    color:0x444444

                })

            );

        pole.position.set(

            x,

            1.15,

            z

        );

        camp.add(

            pole

        );

        const lamp =

            new THREE.Mesh(

                new THREE.SphereGeometry(

                    .14,

                    12,

                    12

                ),

                new THREE.MeshBasicMaterial({

                    color:0xffe2a0

                })

            );

        lamp.position.set(

            x,

            2.25,

            z

        );

        camp.add(

            lamp

        );

        const light =

            new THREE.PointLight(

                0xffc985,

                1.8,

                12,

                2

            );

        light.position.copy(

            lamp.position

        );

        camp.add(

            light

        );

    }

    //--------------------------------
    // 焚き火
    //--------------------------------

    const fire =

        new THREE.Mesh(

            new THREE.ConeGeometry(

                .45,

                1.1,

                10

            ),

            new THREE.MeshBasicMaterial({

                color:0xff8844

            })

        );

    fire.position.y =

        .6;

    camp.add(

        fire

    );

    const fireLight =

        new THREE.PointLight(

            0xff9955,

            4,

            22,

            2

        );

    fireLight.position.y =

        1.2;

    camp.add(

        fireLight

    );

    //--------------------------------
    // BBQ
    //--------------------------------

    const bbq =

        new THREE.Mesh(

            new THREE.BoxGeometry(

                1.5,

                .8,

                .8

            ),

            new THREE.MeshStandardMaterial({

                color:0x333333

            })

        );

    bbq.position.set(

        3,

        .4,

        -2

    );

    camp.add(

        bbq

    );

    //--------------------------------
    // テーブル
    //--------------------------------

    for(

        let i=0;

        i<3;

        i++

    ){

        const table =

            new THREE.Mesh(

                new THREE.BoxGeometry(

                    1.8,

                    .12,

                    1

                ),

                new THREE.MeshStandardMaterial({

                    color:0x8b5a2b

                })

            );

        table.position.set(

            -6+i*5,

            .8,

            4

        );

        camp.add(

            table

        );

    }

    //--------------------------------
    // テント
    //--------------------------------

    for(

        let i=0;

        i<5;

        i++

    ){

        const tent =

            new THREE.Mesh(

                new THREE.ConeGeometry(

                    1.8,

                    1.8,

                    4

                ),

                new THREE.MeshStandardMaterial({

                    color:

                    [

                        0xd28b4c,

                        0x5c8bb8,

                        0x7b8d45,

                        0xb45b55,

                        0xe1c36d

                    ][i]

                })

            );

        tent.rotation.y =

            Math.PI/4;

        tent.position.set(

            -10+i*5,

            .9,

            -7

        );

        camp.add(

            tent

        );

        const inside =

            new THREE.PointLight(

                0xffd39a,

                1.4,

                7

            );

        inside.position.copy(

            tent.position

        );

        inside.position.y =

            1.2;

        camp.add(

            inside

        );

    }

    //--------------------------------
    // 人物（次Part）
    //--------------------------------

    this.createCampPeople(

        camp

    );

    //--------------------------------
    // 配置
    //--------------------------------

    camp.position.copy(

        sample.point

    );

    camp.rotation.y =

        Math.atan2(

            sample.tangent.x,

            sample.tangent.z

        );

    this.scene.add(

        camp

    );

}
// ============================================================================
// world/TrackWorld.js
// Part 5
// ゴール人物（リアル版）
// 約20人・男女混在・BBQを楽しむ
// ============================================================================

createCampPeople(parent){

    const poses=[

        "stand",

        "wave",

        "bbq",

        "talk",

        "sit"

    ];

    const radius=8.5;

    for(

        let i=0;

        i<20;

        i++

    ){

        const angle=

            i/20*Math.PI*2+

            (Math.random()-.5)*.3;

        const r=

            radius+

            (Math.random()-.5)*2;

        const person=

            this.createPerson(

                poses[i%poses.length],

                i

            );

        person.position.set(

            Math.cos(angle)*r,

            0,

            Math.sin(angle)*r

        );

        person.lookAt(

            0,

            1,

            0

        );

        parent.add(

            person

        );

    }

}

// ============================================================================
// 人物生成
// ============================================================================

createPerson(

    pose,

    seed

){

    const g=

        new THREE.Group();

    const skin=[

        0xf1c8ad,

        0xe0b08d,

        0xc58c67,

        0x8f6247

    ];

    const clothes=[

        0x2d5b8b,

        0x3d3d3d,

        0x556b2f,

        0x8b4c39,

        0xc59b37

    ];

    //--------------------------------
    // 頭
    //--------------------------------

    const head=

        new THREE.Mesh(

            new THREE.SphereGeometry(

                .17,

                20,

                20

            ),

            new THREE.MeshStandardMaterial({

                color:

                skin[

                    seed%

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

                .175,

                20,

                20,

                0,

                Math.PI*2,

                0,

                Math.PI*.55

            ),

            new THREE.MeshStandardMaterial({

                color:

                [

                    0x181818,

                    0x4b3525,

                    0x6a513b,

                    0x111111

                ][seed%4]

            })

        );

    hair.position.copy(

        head.position

    );

    hair.position.y+=

        .02;

    g.add(hair);

    //--------------------------------
    // 胴体
    //--------------------------------

    const body=

        new THREE.Mesh(

            new THREE.CapsuleGeometry(

                .18,

                .45,

                8,

                16

            ),

            new THREE.MeshStandardMaterial({

                color:

                clothes[

                    seed%

                    clothes.length

                ]

            })

        );

    body.position.y=

        1.1;

    g.add(body);

    //--------------------------------
    // 腕
    //--------------------------------

    const armMat=

        new THREE.MeshStandardMaterial({

            color:

            clothes[

                seed%

                clothes.length

            ]

        });

    const armGeo=

        new THREE.CapsuleGeometry(

            .05,

            .35,

            4,

            8

        );

    const leftArm=

        new THREE.Mesh(

            armGeo,

            armMat

        );

    const rightArm=

        new THREE.Mesh(

            armGeo,

            armMat

        );

    leftArm.position.set(

        -.25,

        1.2,

        0

    );

    rightArm.position.set(

        .25,

        1.2,

        0

    );

    if(

        pose==="wave"

    ){

        rightArm.rotation.z=

            -1.25;

    }

    if(

        pose==="bbq"

    ){

        leftArm.rotation.x=

            -.8;

        rightArm.rotation.x=

            -.8;

    }

    g.add(leftArm);

    g.add(rightArm);

    //--------------------------------
    // 足
    //--------------------------------

    const legMat=

        new THREE.MeshStandardMaterial({

            color:0x2b2b2b

        });

    const legGeo=

        new THREE.CapsuleGeometry(

            .055,

            .45,

            4,

            8

        );

    const leftLeg=

        new THREE.Mesh(

            legGeo,

            legMat

        );

    const rightLeg=

        new THREE.Mesh(

            legGeo,

            legMat

        );

    leftLeg.position.set(

        -.09,

        .42,

        0

    );

    rightLeg.position.set(

        .09,

        .42,

        0

    );

    if(

        pose==="sit"

    ){

        leftLeg.rotation.x=

            -1.45;

        rightLeg.rotation.x=

            -1.45;

        g.position.y=

            -.18;

    }

    g.add(leftLeg);

    g.add(rightLeg);

    //--------------------------------
    // 顔
    //--------------------------------

    const eyeGeo=

        new THREE.SphereGeometry(

            .012,

            8,

            8

        );

    const eyeMat=

        new THREE.MeshBasicMaterial({

            color:0x111111

        });

    const eyeL=

        new THREE.Mesh(

            eyeGeo,

            eyeMat

        );

    eyeL.position.set(

        -.05,

        1.69,

        .15

    );

    const eyeR=

        eyeL.clone();

    eyeR.position.x=

        .05;

    g.add(

        eyeL

    );

    g.add(

        eyeR

    );

    const mouth=

        new THREE.Mesh(

            new THREE.TorusGeometry(

                .03,

                .004,

                6,

                16,

                Math.PI

            ),

            new THREE.MeshBasicMaterial({

                color:0xaa4444

            })

        );

    mouth.rotation.x=

        Math.PI/2;

    mouth.position.set(

        0,

        1.62,

        .155

    );

    g.add(

        mouth

    );

    //--------------------------------
    // ランダムスケール
    //--------------------------------

    const scale=

        .94+

        Math.random()*.18;

    g.scale.setScalar(

        scale

    );

    return g;

}
// ============================================================================
// world/TrackWorld.js
// Part 6
// ゴール演出・リザルト表示
// ============================================================================

createGoalArea(){

    const sample =
        this.getSample(0.995);

    this.goalTrigger =
        new THREE.Box3().setFromCenterAndSize(

            new THREE.Vector3(

                sample.point.x,
                0,
                sample.point.z

            ),

            new THREE.Vector3(

                18,
                8,
                18

            )

        );

}

updateGoal(vehicle){

    if(this.goalReached) return;

    if(

        this.goalTrigger.containsPoint(

            vehicle.position

        )

    ){

        this.goalReached = true;

        vehicle.speed = 0;

        vehicle.lockControl = true;

        this.showResult(

            vehicle

        );

    }

}

// ============================================================================
// リザルト
// ============================================================================

showResult(vehicle){

    const time =

        performance.now()

        - this.startTime;

    const sec =

        time / 1000;

    const hit =

        vehicle.hitCount;

    const speed =

        Math.abs(

            vehicle.speed

        ) * 3.6;

    let title =

        "";

    if(

        hit===0 &&

        sec<=120

    ){

        title =

        "パーフェクトヒューマン";

    }

    else if(

        sec<=120

    ){

        title =

        "スピードキング";

    }

    else if(

        hit===0

    ){

        title =

        "キャンピングカーの達人";

    }

    else if(

        hit<=9

    ){

        title =

        "キャンピングカーの達人";

    }

    else if(

        hit<=19

    ){

        title =

        "ベテランドライバー";

    }

    else{

        title =

        "期待のルーキー";

    }

    const ui =

        document.createElement(

            "div"

        );

    ui.id =

        "goalResult";

    ui.innerHTML =

`
<div class="panel">

<h1>GOAL!</h1>

<h2>${title}</h2>

<p>

到着タイム

<br>

${sec.toFixed(1)} 秒

</p>

<p>

ぶつかった回数

<br>

${hit} 回

</p>

<p>

到着速度

<br>

${speed.toFixed(1)} km/h

</p>

<button id="restart">

もう一度遊ぶ

</button>

</div>

`;

    document.body.appendChild(

        ui

    );

    document

        .getElementById(

            "restart"

        )

        .onclick = ()=>{

            location.reload();

        };

}

// ============================================================================
// update()
// ============================================================================

update(delta,vehicle){

    this.updateRiver(delta);

    this.updateGoal(vehicle);

}
// ============================================================================
// world/TrackWorld.js
// Part 7
// 衝突回数カウント・車両停止・夜ライト連携
// ============================================================================

initGameStatus(){

    this.startTime =
        performance.now();

    this.goalReached = false;

}

// ============================================================================
// 車が壁へ衝突
// ============================================================================

checkCollision(vehicle){

    if(this.goalReached) return;

    const pos =
        vehicle.position;

    let hit = false;

    //--------------------------------
    // コース外
    //--------------------------------

    const sample =
        this.findNearestRoadPoint(

            pos

        );

    const dist =
        sample.point.distanceTo(

            pos

        );

    if(

        dist >

        this.roadHalfWidth - 0.5

    ){

        hit = true;

    }

    //--------------------------------
    // 衝突
    //--------------------------------

    if(hit){

        if(

            !vehicle.hitNow

        ){

            vehicle.hitNow = true;

            vehicle.hitCount++;

        }

        //--------------------------------
        // 少しだけ滑る
        //--------------------------------

        vehicle.speed *=

            0.88;

    }
    else{

        vehicle.hitNow = false;

    }

}

// ============================================================================
// 夜
// ============================================================================

updateLights(vehicle){

    if(

        this.currentArea===

        "camp"

    ){

        vehicle.headLightsOn = true;

        vehicle.tailLightsOn = true;

    }

    else if(

        this.currentArea===

        "mountain"

    ){

        vehicle.headLightsOn = true;

        vehicle.tailLightsOn = true;

    }

    else{

        vehicle.headLightsOn = false;

        vehicle.tailLightsOn = false;

    }

}

// ============================================================================
// 毎フレーム
// ============================================================================

update(delta,vehicle){

    this.updateRiver(delta);

    this.updateGoal(vehicle);

    this.checkCollision(vehicle);

    this.updateLights(vehicle);

}

// ============================================================================
// 呼び出し
// Game開始時
// ============================================================================

this.initGameStatus();

// 車生成時

vehicle.hitCount = 0;

vehicle.hitNow = false;

vehicle.lockControl = false;

vehicle.headLightsOn = false;

vehicle.tailLightsOn = false;
