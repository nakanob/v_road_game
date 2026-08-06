// ============================================================================
// vehicle/Effects.js
// V11
// エフェクト
// ・ダスト
// ・ブレーキランプ
// ・ヘッドライト切替
// ・キャンプ場到着演出
// ============================================================================

import * as THREE from "three";

export default class Effects{

    constructor(vehicle){

        this.vehicle = vehicle;

        this.scene = vehicle.scene;

        this.dust = [];

    }

    //=========================================================================
    // 初期化
    //=========================================================================

    build(){

        //--------------------------------
        // ダスト
        //--------------------------------

        const mat =

            new THREE.SpriteMaterial({

                color:0xd5c6a4,

                transparent:true,

                opacity:.18

            });

        for(

            let i=0;

            i<20;

            i++

        ){

            const s=

                new THREE.Sprite(

                    mat.clone()

                );

            s.visible=false;

            s.scale.set(

                .5,

                .5,

                .5

            );

            this.scene.add(

                s

            );

            this.dust.push(

                s

            );

        }

    }

    //=========================================================================
    // 更新
    //=========================================================================

    update(delta){

        //--------------------------------
        // ダスト
        //--------------------------------

        if(

            this.vehicle.controller.speed>

            2

        ){

            this.spawnDust();

        }

        for(

            const d of

            this.dust

        ){

            if(!d.visible)

                continue;

            d.position.y+=

                delta*.4;

            d.material.opacity-=

                delta*.25;

            d.scale.x+=

                delta*.5;

            d.scale.y+=

                delta*.5;

            if(

                d.material.opacity<=0

            ){

                d.visible=false;

            }

        }

        //--------------------------------
        // 夜
        //--------------------------------

        const night=

            this.vehicle.game

            .environment

            .shouldHeadLight();

        this.vehicle.lighting

            .update(

                night

            );

    }

    //=========================================================================
    // ダスト
    //=========================================================================

    spawnDust(){

        const dust=

            this.dust.find(

                d=>!d.visible

            );

        if(!dust)

            return;

        dust.visible=true;

        dust.material.opacity=.18;

        dust.scale.set(

            .5,

            .5,

            .5

        );

        dust.position.copy(

            this.vehicle.root.position

        );

        dust.position.y=.12;

        dust.position.x+=

            (Math.random()-.5)*.8;

        dust.position.z+=

            (Math.random()-.5)*.8;

    }

    //=========================================================================
    // ゴール演出
    //=========================================================================

    celebration(){

        for(

            let i=0;

            i<50;

            i++

        ){

            const p=

                new THREE.Sprite(

                    new THREE.SpriteMaterial({

                        color:

                        new THREE.Color()

                        .setHSL(

                            Math.random(),

                            1,

                            .6

                        )

                    })

                );

            p.position.copy(

                this.vehicle.root.position

            );

            p.position.y=2;

            p.scale.set(

                .15,

                .15,

                .15

            );

            this.scene.add(

                p

            );

        }

    }

}
