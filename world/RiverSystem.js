// ============================================================================
// world/RiverSystem.js
// Part 1
// 本物の川システム
// V11
// ============================================================================

import * as THREE from "three";

export default class RiverSystem {

    constructor(scene){

        this.scene = scene;

        this.group = new THREE.Group();

        this.water = null;

        this.clock = 0;

    }

    //=========================================================================
    // 作成
    //=========================================================================

    build(center,length=220){

        //--------------------------------
        // 川底
        //--------------------------------

        const bottom =

            new THREE.Mesh(

                new THREE.BoxGeometry(

                    24,

                    2,

                    length

                ),

                new THREE.MeshStandardMaterial({

                    color:0x6d5d43,

                    roughness:1

                })

            );

        bottom.position.y=-2.4;

        bottom.receiveShadow=true;

        this.group.add(bottom);

        //--------------------------------
        // 水
        //--------------------------------

        this.water =

            new THREE.Mesh(

                new THREE.PlaneGeometry(

                    18,

                    length,

                    120,

                    120

                ),

                new THREE.MeshPhysicalMaterial({

                    color:0x58acd7,

                    transparent:true,

                    opacity:.93,

                    roughness:.08,

                    metalness:.05,

                    clearcoat:1,

                    side:THREE.DoubleSide

                })

            );

        this.water.rotation.x=

            -Math.PI/2;

        this.water.position.y=

            -.45;

        this.group.add(

            this.water

        );

        //--------------------------------
        // 左右土手
        //--------------------------------

        const bankMat=

            new THREE.MeshStandardMaterial({

                color:0x6e9850,

                roughness:1

            });

        [

            -15,

            15

        ].forEach(x=>{

            const bank=

                new THREE.Mesh(

                    new THREE.BoxGeometry(

                        10,

                        2,

                        length

                    ),

                    bankMat

                );

            bank.position.set(

                x,

                -.9,

                0

            );

            bank.receiveShadow=true;

            this.group.add(

                bank

            );

        });

        //--------------------------------
        // 河原
        //--------------------------------

        const stoneMat=

            new THREE.MeshStandardMaterial({

                color:0x8c857d

            });

        for(

            let i=0;

            i<70;

            i++

        ){

            const stone=

                new THREE.Mesh(

                    new THREE.DodecahedronGeometry(

                        .25+

                        Math.random()*.45

                    ),

                    stoneMat

                );

            stone.position.set(

                (Math.random()-.5)*16,

                -.55,

                (Math.random()-.5)*length

            );

            stone.rotation.set(

                Math.random(),

                Math.random(),

                Math.random()

            );

            this.group.add(

                stone

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
    // 水流
    //=========================================================================

    update(delta){

        if(!this.water) return;

        this.clock+=delta;

        const pos=

            this.water.geometry.attributes.position;

        for(

            let i=0;

            i<pos.count;

            i++

        ){

            const x=

                pos.getX(i);

            const z=

                pos.getY(i);

            const wave=

                Math.sin(

                    z*.18+

                    this.clock*1.8

                )*.08+

                Math.cos(

                    x*.22+

                    this.clock

                )*.04;

            pos.setZ(

                i,

                wave

            );

        }

        pos.needsUpdate=true;

        this.water.geometry.computeVertexNormals();

    }

}
