// ============================================================================
// world/CheckpointSystem.js
// V11
// チェックポイント・エリア遷移管理
// ============================================================================

import * as THREE from "three";

export default class CheckpointSystem{

    constructor(world){

        this.world = world;

        this.index = 0;

        this.checkpoints = [

            {

                name:"街",

                progress:0.00

            },

            {

                name:"草原",

                progress:0.28

            },

            {

                name:"山",

                progress:0.56

            },

            {

                name:"キャンプ場",

                progress:0.82

            },

            {

                name:"GOAL",

                progress:0.995

            }

        ];

    }

    //=========================================================================
    // 更新
    //=========================================================================

    update(vehicle){

        if(

            this.index>=

            this.checkpoints.length

        ) return;

        const cp=

            this.checkpoints[

                this.index

            ];

        if(

            vehicle.progress>=

            cp.progress

        ){

            this.onReach(

                cp,

                vehicle

            );

            this.index++;

        }

    }

    //=========================================================================
    // 到達
    //=========================================================================

    onReach(cp,vehicle){

        //--------------------------------
        // HUD
        //--------------------------------

        vehicle.game

            .ui

            .changeArea(

                this.convert(

                    cp.name

                )

            );

        //--------------------------------
        // ライト
        //--------------------------------

        switch(cp.name){

            case "街":

                vehicle.lighting.update(

                    false

                );

                break;

            case "草原":

                vehicle.lighting.update(

                    false

                );

                break;

            case "山":

                vehicle.lighting.update(

                    true

                );

                break;

            case "キャンプ場":

                vehicle.lighting.update(

                    true

                );

                break;

        }

    }

    //=========================================================================
    // 変換
    //=========================================================================

    convert(name){

        switch(name){

            case "街":

                return "town";

            case "草原":

                return "field";

            case "山":

                return "mountain";

            case "キャンプ場":

                return "camp";

            default:

                return "town";

        }

    }

    //=========================================================================
    // リセット
    //=========================================================================

    reset(){

        this.index=0;

    }

}
