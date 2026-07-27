// ============================================================================
// world/VegetationManager.js
// Part 1
// 高速描画版
// Tree / Bush / Grass
// InstancedMesh採用（ロード高速化）
// ============================================================================

import * as THREE from "three";

export default class VegetationManager {

    constructor(scene) {

        this.scene = scene;

        this.groups = [];

        this.treeMaterial =
            new THREE.MeshLambertMaterial({

                color:0x3f7d34

            });

        this.trunkMaterial =
            new THREE.MeshLambertMaterial({

                color:0x78543b

            });

        this.grassMaterial =
            new THREE.MeshLambertMaterial({

                color:0x5ea63b

            });

        this.buildSharedGeometry();

    }

    //=========================================================================
    // Geometryは1回だけ生成
    //=========================================================================

    buildSharedGeometry(){

        this.treeGeo =

            new THREE.ConeGeometry(

                1.2,

                3,

                8

            );

        this.trunkGeo =

            new THREE.CylinderGeometry(

                .18,

                .22,

                1.2,

                6

            );

        this.grassGeo =

            new THREE.PlaneGeometry(

                .22,

                .65

            );

    }

    //=========================================================================
    // 木
    //=========================================================================

    createTrees(points){

        const leaves =

            new THREE.InstancedMesh(

                this.treeGeo,

                this.treeMaterial,

                points.length

            );

        const trunks =

            new THREE.InstancedMesh(

                this.trunkGeo,

                this.trunkMaterial,

                points.length

            );

        const dummy =

            new THREE.Object3D();

        points.forEach(

            (p,index)=>{

                //------------------------

                dummy.position.set(

                    p.x,

                    p.y+2.5,

                    p.z

                );

                dummy.rotation.y=

                    Math.random()*

                    Math.PI*2;

                const s=

                    .8+

                    Math.random()*.5;

                dummy.scale.set(

                    s,s,s

                );

                dummy.updateMatrix();

                leaves.setMatrixAt(

                    index,

                    dummy.matrix

                );

                //------------------------

                dummy.position.set(

                    p.x,

                    p.y+.6,

                    p.z

                );

                dummy.scale.set(

                    s,s,s

                );

                dummy.updateMatrix();

                trunks.setMatrixAt(

                    index,

                    dummy.matrix

                );

            }

        );

        leaves.instanceMatrix.needsUpdate=true;

        trunks.instanceMatrix.needsUpdate=true;

        this.scene.add(

            leaves

        );

        this.scene.add(

            trunks

        );

        this.groups.push(

            leaves,

            trunks

        );

    }

    //=========================================================================
    // 草
    //=========================================================================

    createGrass(points){

        const grass =

            new THREE.InstancedMesh(

                this.grassGeo,

                this.grassMaterial,

                points.length

            );

        const dummy=

            new THREE.Object3D();

        points.forEach(

            (p,index)=>{

                dummy.position.copy(

                    p

                );

                dummy.position.y+=

                    .32;

                dummy.rotation.y=

                    Math.random()*

                    Math.PI*2;

                const s=

                    .8+

                    Math.random()*.6;

                dummy.scale.set(

                    s,

                    s,

                    s

                );

                dummy.updateMatrix();

                grass.setMatrixAt(

                    index,

                    dummy.matrix

                );

            }

        );

        grass.instanceMatrix.needsUpdate=true;

        this.scene.add(

            grass

        );

        this.groups.push(

            grass

        );

    }

    //=========================================================================
    // 削除
    //=========================================================================

    clear(){

        this.groups.forEach(

            mesh=>{

                this.scene.remove(

                    mesh

                );

                mesh.dispose?.();

            }

        );

        this.groups=[];

    }

}
// ============================================================================
// world/VegetationManager.js
// Part 2
// 道路付近への配置・本数半減・決定的な乱数生成
// ============================================================================

// ============================================================================
// 道路沿いの植生を生成
// TrackWorld から呼び出す
// ============================================================================

createRoadsideVegetation(

    world,

    options = {}

) {

    const {

        treeCount = 72,

        grassCount = 240,

        treeMinDistance = 7,

        treeMaxDistance = 18,

        grassMinDistance = 4.8,

        grassMaxDistance = 11,

        startProgress = 0.025,

        endProgress = 0.965,

        seed = 1827

    } = options;

    const random =
        this.createSeededRandom(
            seed
        );

    const treePoints = [];

    const grassPoints = [];

    // ========================================================================
    // 木
    // 従来の約半分の本数
    // 道路から離れ過ぎない位置へ配置
    // ========================================================================

    for (

        let i = 0;

        i < treeCount;

        i++

    ) {

        const progress =

            THREE.MathUtils.lerp(

                startProgress,

                endProgress,

                random()

            );

        const side =

            random() < 0.5

                ? -1

                : 1;

        const distance =

            THREE.MathUtils.lerp(

                treeMinDistance,

                treeMaxDistance,

                random()

            );

        const pose =

            world.getPose(

                progress,

                side * distance

            );

        if (

            !this.isVegetationAllowed(

                world,

                pose.position,

                progress,

                "tree"

            )

        ) {

            continue;

        }

        treePoints.push({

            x:
                pose.position.x,

            y:
                pose.position.y,

            z:
                pose.position.z,

            scale:
                THREE.MathUtils.lerp(

                    0.76,

                    1.35,

                    random()

                ),

            rotation:
                random() *

                Math.PI *

                2

        });

    }

    // ========================================================================
    // 草
    // 従来の約半分
    // 道路脇へ寄せて配置
    // ========================================================================

    for (

        let i = 0;

        i < grassCount;

        i++

    ) {

        const progress =

            THREE.MathUtils.lerp(

                startProgress,

                endProgress,

                random()

            );

        const side =

            random() < 0.5

                ? -1

                : 1;

        const distance =

            THREE.MathUtils.lerp(

                grassMinDistance,

                grassMaxDistance,

                random()

            );

        const pose =

            world.getPose(

                progress,

                side * distance

            );

        if (

            !this.isVegetationAllowed(

                world,

                pose.position,

                progress,

                "grass"

            )

        ) {

            continue;

        }

        grassPoints.push({

            x:
                pose.position.x,

            y:
                pose.position.y + 0.02,

            z:
                pose.position.z,

            scale:
                THREE.MathUtils.lerp(

                    0.65,

                    1.2,

                    random()

                ),

            rotation:
                random() *

                Math.PI *

                2

        });

    }

    this.createTrees(

        treePoints

    );

    this.createGrass(

        grassPoints

    );

}


// ============================================================================
// 植生を置いてはいけない場所
// 川・橋・トンネル・ゴールキャンプ周辺を避ける
// ============================================================================

isVegetationAllowed(

    world,

    position,

    progress,

    type

) {

    const blockedRanges = [

        // 橋・川
        [
            0.285,
            0.355
        ],

        // トンネル
        [
            0.535,
            0.625
        ],

        // ゴール・キャンプ
        [
            0.91,
            1
        ]

    ];

    const blocked =

        blockedRanges.some(

            range =>

                progress >= range[0] &&

                progress <= range[1]

        );

    if (blocked) {

        return false;

    }

    // ワールド側に配置禁止判定がある場合は利用
    if (

        typeof world.isDecorationPositionBlocked ===

        "function"

    ) {

        if (

            world.isDecorationPositionBlocked(

                position,

                type

            )

        ) {

            return false;

        }

    }

    return true;

}


// ============================================================================
// 木
// 位置・回転・大きさを受け取れるように修正
// ============================================================================

createTrees(points) {

    if (

        !Array.isArray(points) ||

        points.length === 0

    ) {

        return;

    }

    const leaves =

        new THREE.InstancedMesh(

            this.treeGeo,

            this.treeMaterial,

            points.length

        );

    const trunks =

        new THREE.InstancedMesh(

            this.trunkGeo,

            this.trunkMaterial,

            points.length

        );

    const dummy =

        new THREE.Object3D();

    points.forEach(

        (

            point,

            index

        ) => {

            const scale =

                point.scale ?? 1;

            const rotation =

                point.rotation ?? 0;

            // 葉
            dummy.position.set(

                point.x,

                point.y +

                2.45 *

                scale,

                point.z

            );

            dummy.rotation.set(

                0,

                rotation,

                0

            );

            dummy.scale.set(

                scale,

                scale,

                scale

            );

            dummy.updateMatrix();

            leaves.setMatrixAt(

                index,

                dummy.matrix

            );

            // 幹
            dummy.position.set(

                point.x,

                point.y +

                0.6 *

                scale,

                point.z

            );

            dummy.rotation.set(

                0,

                rotation,

                0

            );

            dummy.scale.set(

                scale,

                scale,

                scale

            );

            dummy.updateMatrix();

            trunks.setMatrixAt(

                index,

                dummy.matrix

            );

        }

    );

    leaves.instanceMatrix.setUsage(

        THREE.StaticDrawUsage

    );

    trunks.instanceMatrix.setUsage(

        THREE.StaticDrawUsage

    );

    leaves.instanceMatrix.needsUpdate =

        true;

    trunks.instanceMatrix.needsUpdate =

        true;

    leaves.castShadow =

        false;

    leaves.receiveShadow =

        false;

    trunks.castShadow =

        false;

    trunks.receiveShadow =

        false;

    leaves.frustumCulled =

        true;

    trunks.frustumCulled =

        true;

    this.scene.add(

        leaves,

        trunks

    );

    this.groups.push(

        leaves,

        trunks

    );

}


// ============================================================================
// 草
// 交差した2枚の板を使わず、1インスタンスで軽量化
// ============================================================================

createGrass(points) {

    if (

        !Array.isArray(points) ||

        points.length === 0

    ) {

        return;

    }

    const grass =

        new THREE.InstancedMesh(

            this.grassGeo,

            this.grassMaterial,

            points.length

        );

    const dummy =

        new THREE.Object3D();

    points.forEach(

        (

            point,

            index

        ) => {

            const scale =

                point.scale ?? 1;

            dummy.position.set(

                point.x,

                point.y +

                0.3 *

                scale,

                point.z

            );

            dummy.rotation.set(

                0,

                point.rotation ?? 0,

                0

            );

            dummy.scale.set(

                scale,

                scale,

                scale

            );

            dummy.updateMatrix();

            grass.setMatrixAt(

                index,

                dummy.matrix

            );

        }

    );

    grass.instanceMatrix.setUsage(

        THREE.StaticDrawUsage

    );

    grass.instanceMatrix.needsUpdate =

        true;

    grass.castShadow =

        false;

    grass.receiveShadow =

        false;

    grass.frustumCulled =

        true;

    this.scene.add(

        grass

    );

    this.groups.push(

        grass

    );

}


// ============================================================================
// 同じ配置を再現する軽量乱数
// 毎回Math.random()を使って配置が変わる問題を防止
// ============================================================================

createSeededRandom(seed) {

    let value =

        seed >>> 0;

    return () => {

        value +=

            0x6D2B79F5;

        let result =

            value;

        result =

            Math.imul(

                result ^

                result >>> 15,

                result | 1

            );

        result ^=

            result +

            Math.imul(

                result ^

                result >>> 7,

                result | 61

            );

        return (

            (

                result ^

                result >>> 14

            ) >>> 0

        ) / 4294967296;

    };

}


// ============================================================================
// Geometry・Materialを含めた完全破棄
// ============================================================================

dispose() {

    this.clear();

    this.treeGeo?.dispose();

    this.trunkGeo?.dispose();

    this.grassGeo?.dispose();

    this.treeMaterial?.dispose();

    this.trunkMaterial?.dispose();

    this.grassMaterial?.dispose();

}
