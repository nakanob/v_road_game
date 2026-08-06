// ============================================================================
// vehicle/LightingSystem.js
// Part 1
// V11
// ヘッドライト・テールランプ強化版
// ============================================================================

import * as THREE from "three";

export default class LightingSystem {

    constructor(vehicle){

        this.vehicle = vehicle;

        this.group = new THREE.Group();

    }

    //=========================================================================
    // 作成
    //=========================================================================
    build(){

        //--------------------------------
        // 左右ヘッドライト
        //--------------------------------

        this.leftLight =

            this.createHeadLight(

                -0.62

            );

        this.rightLight =

            this.createHeadLight(

                0.62

            );

        //--------------------------------
        // 左右テールライト
        //--------------------------------

        this.leftTail =

            this.createTailLight(

                -0.78

            );

        this.rightTail =

            this.createTailLight(

                0.78

            );

        //--------------------------------

        this.vehicle.group.add(

            this.group

        );

    }

    //=========================================================================
    // ヘッドライト
    //=========================================================================

    createHeadLight(x){

        const light=

            new THREE.SpotLight(

                0xfff4d6,

                0,

                85,

                THREE.MathUtils.degToRad(

                    28

                ),

                .32,

                1.25

            );

        light.position.set(

            x,

            .95,

            3.05

        );

        light.castShadow=false;

        const target=

            new THREE.Object3D();

        target.position.set(

            x,

            -.65,

            28

        );

        this.group.add(

            light

        );

        this.group.add(

            target

        );

        light.target=

            target;

        return light;

    }

    //=========================================================================
    // テールランプ
    //=========================================================================

    createTailLight(x){

        const mesh=

            new THREE.Mesh(

                new THREE.CircleGeometry(

                    .1,

                    18

                ),

                new THREE.MeshBasicMaterial({

                    color:0xff3030

                })

            );

        mesh.position.set(

            x,

            .82,

            -3.02

        );

        mesh.rotation.y=

            Math.PI;

        this.group.add(

            mesh

        );

        return mesh;

    }

    //=========================================================================
    // 更新
    //=========================================================================

    update(isNight){

        const power=

            isNight?5.2:0;

        this.leftLight.intensity=

            power;

        this.rightLight.intensity=

            power;

        this.leftTail.visible=

            isNight;

        this.rightTail.visible=

            isNight;

    }

}
