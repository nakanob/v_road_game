// ============================================================================
// world/EnvironmentController.js
// Part 1
// エリア管理
// 街 → 草原 → 山 → キャンプ場
// ============================================================================

import * as THREE from "three";

export default class EnvironmentController{

    constructor(world){

        this.world = world;

        this.currentArea = "town";

        this.callbacks = [];

        this.areaTable=[

            {

                name:"town",

                start:0.00,

                end:0.28

            },

            {

                name:"field",

                start:0.28,

                end:0.56

            },

            {

                name:"mountain",

                start:0.56,

                end:0.82

            },

            {

                name:"camp",

                start:0.82,

                end:1.00

            }

        ];

    }

    //=========================================================================
    // エリア変更通知
    //=========================================================================

    onAreaChanged(callback){

        this.callbacks.push(

            callback

        );

    }

    //=========================================================================
    // 現在エリア
    //=========================================================================

    getArea(progress){

        for(

            const area of

            this.areaTable

        ){

            if(

                progress>=area.start &&

                progress<area.end

            ){

                return area.name;

            }

        }

        return "camp";

    }

    //=========================================================================
    // 更新
    //=========================================================================

    update(progress){

        const area=

            this.getArea(

                progress

            );

        if(

            area===

            this.currentArea

        ){

            return;

        }

        this.currentArea=

            area;

        for(

            const callback of

            this.callbacks

        ){

            callback(

                area

            );

        }

    }

    //=========================================================================
    // 車両ライト判定
    //=========================================================================

    isNight(){

        return (

            this.currentArea===

            "camp"

        );

    }

    isEvening(){

        return (

            this.currentArea===

            "mountain"

        );

    }

    shouldHeadLight(){

        return (

            this.currentArea===

            "mountain" ||

            this.currentArea===

            "camp"

        );

    }

}
