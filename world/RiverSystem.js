// ============================================================================
// world/RiverSystem.js
// V11
// Part 1
// 画像イメージ版
// 「ちゃんと川がある」River
// ============================================================================

import * as THREE from "three";

export default class RiverSystem{

    constructor(scene){

        this.scene = scene;

        this.group = new THREE.Group();

        this.time = 0;

    }

    //=========================================================================
    // 作成
    //=========================================================================
    build(center,length=230){

        //--------------------------------
        // 川底
        //--------------------------------

        const bottom =

            new THREE.Mesh(

                new THREE.BoxGeometry(

                    length,

                    1.2,

                    34

                ),

                new THREE.MeshStandardMaterial({

                    color:0x78684e,

                    roughness:1

                })

            );

        bottom.position.y =

            -3.2;

        this.group.add(

            bottom

        );

        //--------------------------------
        // 水面
        //--------------------------------

        this.water =

            new THREE.Mesh(

                new THREE.PlaneGeometry(

                    length,

                    28,

                    120,

                    18

                ),

                new THREE.MeshPhysicalMaterial({

                    color:0x3d84d6,

                    transparent:true,

                    opacity:.88,

                    transmission:.65,

                    roughness:.08,

                    metalness:.08

                })

            );

        this.water.rotation.x =

            -Math.PI/2;

        this.water.position.y =

            -.45;

        this.group.add(

            this.water

        );

        //--------------------------------
        // 左岸
        //--------------------------------

        const bankLeft =

            new THREE.Mesh(

                new THREE.BoxGeometry(

                    length,

                    3,

                    5

                ),

                new THREE.MeshStandardMaterial({

                    color:0x6b8d47

                })

            );

        bankLeft.position.set(

            0,

            -.4,

            -16.5

        );

        this.group.add(

            bankLeft

        );

        //--------------------------------
        // 右岸
        //--------------------------------

        const bankRight =

            bankLeft.clone();

        bankRight.position.z =

            16.5;

        this.group.add(

            bankRight

        );

        //--------------------------------
        // 岸の斜面
        //--------------------------------

        [

            -13.5,

            13.5

        ].forEach(z=>{

            const slope=

                new THREE.Mesh(

                    new THREE.BoxGeometry(

                        length,

                        2,

                        4

                    ),

                    new THREE.MeshStandardMaterial({

                        color:0x7ea05a

                    })

                );

            slope.rotation.x=

                (z<0?1:-1)*0.23;

            slope.position.set(

                0,

                .1,

                z

            );

            this.group.add(

                slope

            );

        });

        //--------------------------------

        this.group.position.copy(

            center

        );

        this.scene.add(

            this.group

        );

    }

    //=========================================================================
    // 水流
    //=========================================================================
    update(delta){

        this.time += delta;

        const pos=

            this.water.geometry.attributes.position;

        for(

            let i=0;

            i<pos.count;

            i++

        ){

            const x=

                pos.getX(i);

            const y=

                Math.sin(

                    x*.06+

                    this.time*2.2

                )*.08+

                Math.cos(

                    x*.025+

                    this.time

                )*.04;

            pos.setZ(

                i,

                y

            );

        }

        pos.needsUpdate=true;

        this.water.geometry.computeVertexNormals();

    }

}
