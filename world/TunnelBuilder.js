// ============================================================================
// world/TunnelBuilder.js
// V11
// Part 1
// 自然な山＋通過可能なトンネル
// ============================================================================

import * as THREE from "three";

export default class TunnelBuilder{

    constructor(scene){

        this.scene = scene;

        this.group = new THREE.Group();

    }

    //=========================================================================
    // 作成
    //=========================================================================
    build(center){

        //--------------------------------
        // 山本体
        //--------------------------------

        const mountain =

            new THREE.Mesh(

                new THREE.ConeGeometry(

                    42,

                    28,

                    8,

                    8

                ),

                new THREE.MeshStandardMaterial({

                    color:0x737067,

                    roughness:1

                })

            );

        mountain.position.y=

            13;

        mountain.castShadow=true;

        mountain.receiveShadow=true;

        this.group.add(

            mountain

        );

        //--------------------------------
        // トンネル入口
        //--------------------------------

        const frame=

            new THREE.Mesh(

                new THREE.BoxGeometry(

                    9,

                    6,

                    .8

                ),

                new THREE.MeshStandardMaterial({

                    color:0x8a8a8a

                })

            );

        frame.position.set(

            0,

            3,

            14.5

        );

        this.group.add(

            frame

        );

        //--------------------------------
        // 穴
        //--------------------------------

        const hole=

            new THREE.Mesh(

                new THREE.CylinderGeometry(

                    2.9,

                    2.9,

                    18,

                    28,

                    1,

                    true

                ),

                new THREE.MeshStandardMaterial({

                    color:0x232323,

                    side:THREE.DoubleSide

                })

            );

        hole.rotation.x=

            Math.PI/2;

        hole.position.y=

            2.7;

        this.group.add(

            hole

        );

        //--------------------------------
        // 出口
        //--------------------------------

        const exit=

            frame.clone();

        exit.position.z=

            -14.5;

        exit.rotation.y=

            Math.PI;

        this.group.add(

            exit

        );

        //--------------------------------
        // 内部照明
        //--------------------------------

        for(

            let z=-6;

            z<=6;

            z+=3

        ){

            const light=

                new THREE.PointLight(

                    0xffddaa,

                    1.2,

                    8

                );

            light.position.set(

                0,

                4.4,

                z

            );

            this.group.add(

                light

            );

        }

        //--------------------------------

        this.group.position.copy(

            center

        );

        this.scene.add(

            this.group

        );

    }

}
