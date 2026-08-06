// ============================================================================
// world/LightingManager.js
// Part 1
// エリア毎の空・環境光管理
// 街→草原→山→キャンプ場
// ============================================================================

import * as THREE from "three";

export default class LightingManager{

    constructor(scene,renderer){

        this.scene=scene;

        this.renderer=renderer;

        this.currentArea="town";

        //--------------------------------

        this.ambient=

            new THREE.AmbientLight(

                0xffffff,

                2.2

            );

        scene.add(

            this.ambient

        );

        //--------------------------------

        this.sun=

            new THREE.DirectionalLight(

                0xffffff,

                2.4

            );

        this.sun.position.set(

            40,

            60,

            20

        );

        this.sun.castShadow=true;

        scene.add(

            this.sun

        );

        //--------------------------------

        this.fog=

            new THREE.Fog(

                0xbfdfff,

                80,

                260

            );

        scene.fog=

            this.fog;

        //--------------------------------

        this.skyColors={

            town:new THREE.Color(

                0x87cfff

            ),

            field:new THREE.Color(

                0x69c8ff

            ),

            mountain:new THREE.Color(

                0xffa562

            ),

            camp:new THREE.Color(

                0x061427

            )

        };

    }

    //=========================================================================
    // エリア変更
    //=========================================================================

    setArea(area){

        if(

            area===this.currentArea

        ) return;

        this.currentArea=area;

        switch(area){

            case "town":

                this.targetAmbient=2.2;

                this.targetSun=2.5;

                this.targetFogNear=90;

                this.targetFogFar=260;

                break;

            case "field":

                this.targetAmbient=2.4;

                this.targetSun=2.8;

                this.targetFogNear=110;

                this.targetFogFar=320;

                break;

            case "mountain":

                this.targetAmbient=1.5;

                this.targetSun=1.4;

                this.targetFogNear=70;

                this.targetFogFar=220;

                break;

            case "camp":

                this.targetAmbient=.42;

                this.targetSun=.05;

                this.targetFogNear=45;

                this.targetFogFar=170;

                break;

        }

        this.targetColor=

            this.skyColors[

                area

            ];

    }

    //=========================================================================
    // 更新
    //=========================================================================

    update(delta){

        if(

            !this.targetColor

        ) return;

        //--------------------------------
        // 空色
        //--------------------------------

        this.scene.background.lerp(

            this.targetColor,

            delta*.45

        );

        //--------------------------------
        // Fog
        //--------------------------------

        this.fog.color.lerp(

            this.targetColor,

            delta*.45

        );

        this.fog.near=

            THREE.MathUtils.lerp(

                this.fog.near,

                this.targetFogNear,

                delta*.9

            );

        this.fog.far=

            THREE.MathUtils.lerp(

                this.fog.far,

                this.targetFogFar,

                delta*.9

            );

        //--------------------------------
        // Ambient
        //--------------------------------

        this.ambient.intensity=

            THREE.MathUtils.lerp(

                this.ambient.intensity,

                this.targetAmbient,

                delta*.9

            );

        //--------------------------------
        // Sun
        //--------------------------------

        this.sun.intensity=

            THREE.MathUtils.lerp(

                this.sun.intensity,

                this.targetSun,

                delta*.8

            );

    }

}
