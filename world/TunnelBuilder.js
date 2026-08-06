// ============================================================================
// world/TunnelBuilder.js
// Part 1
// V11
// 自然な山＋通過可能トンネル
// ============================================================================

import * as THREE from "three";

export default class TunnelBuilder {

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

                    58,
                    42,
                    8,
                    8

                ),

                new THREE.MeshStandardMaterial({

                    color:0x6e685d,

                    roughness:1

                })

            );

        mountain.position.y = 18;

        mountain.castShadow = true;

        mountain.receiveShadow = true;

        this.group.add(mountain);

        //--------------------------------
        // トンネル入口
        //--------------------------------

        const entrance =

            new THREE.Mesh(

                new THREE.CylinderGeometry(

                    4.8,
                    4.8,
                    7,
                    28,
                    1,
                    true,
                    0,
                    Math.PI

                ),

                new THREE.MeshStandardMaterial({

                    color:0x686868,

                    side:THREE.DoubleSide

                })

            );

        entrance.rotation.z =

            Math.PI/2;

        entrance.position.set(

            0,

            4.2,

            -16

        );

        this.group.add(

            entrance

        );

        //--------------------------------
        // トンネル出口
        //--------------------------------

        const exit =

            entrance.clone();

        exit.position.z = 16;

        this.group.add(exit);

        //--------------------------------
        // トンネル内部
        //--------------------------------

        const tunnel =

            new THREE.Mesh(

                new THREE.CylinderGeometry(

                    4.8,
                    4.8,
                    32,
                    28,
                    1,
                    true,
                    0,
                    Math.PI

                ),

                new THREE.MeshStandardMaterial({

                    color:0x555555,

                    side:THREE.DoubleSide

                })

            );

        tunnel.rotation.z =

            Math.PI/2;

        tunnel.position.y =

            4.2;

        this.group.add(

            tunnel

        );

        //--------------------------------
        // 路面
        //--------------------------------

        const road =

            new THREE.Mesh(

                new THREE.BoxGeometry(

                    8,

                    .12,

                    34

                ),

                new THREE.MeshStandardMaterial({

                    color:0x3d3d3d

                })

            );

        road.position.y =

            .05;

        this.group.add(

            road

        );

        //--------------------------------
        // 天井照明
        //--------------------------------

        for(

            let z=-12;

            z<=12;

            z+=6

        ){

            const lamp=

                new THREE.PointLight(

                    0xfff1c4,

                    2.2,

                    11

                );

            lamp.position.set(

                0,

                6.2,

                z

            );

            this.group.add(

                lamp

            );

            const mesh=

                new THREE.Mesh(

                    new THREE.SphereGeometry(

                        .12,

                        10,

                        10

                    ),

                    new THREE.MeshBasicMaterial({

                        color:0xfff3d6

                    })

                );

            mesh.position.copy(

                lamp.position

            );

            this.group.add(

                mesh

            );

        }

        //--------------------------------
        // 岩
        //--------------------------------

        const rockMat=

            new THREE.MeshStandardMaterial({

                color:0x6f6a62

            });

        for(

            let i=0;

            i<18;

            i++

        ){

            const rock=

                new THREE.Mesh(

                    new THREE.DodecahedronGeometry(

                        1+

                        Math.random()*1.6

                    ),

                    rockMat

                );

            const angle=

                Math.random()*Math.PI*2;

            const radius=

                18+

                Math.random()*16;

            rock.position.set(

                Math.cos(angle)*radius,

                Math.random()*8,

                Math.sin(angle)*12

            );

            rock.castShadow=true;

            this.group.add(

                rock

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

}
