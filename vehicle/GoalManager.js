// ============================================================================
// vehicle/GoalManager.js
// V11
// ゴール判定・タイム・称号
// ============================================================================

export default class GoalManager{

    constructor(vehicle){

        this.vehicle = vehicle;

        this.started = false;

    }

    //=========================================================================
    // スタート
    //=========================================================================

    start(){

        this.started = true;

        this.vehicle.startTime =

            performance.now();

        this.vehicle.hitCount = 0;

        this.vehicle.totalDistance = 0;

        this.vehicle.goal = false;

    }

    //=========================================================================
    // 更新
    //=========================================================================

    update(delta){

        if(

            !this.started ||

            this.vehicle.goal

        ){

            return;

        }

        //--------------------------------
        // 走行距離
        //--------------------------------

        this.vehicle.totalDistance +=

            Math.abs(

                this.vehicle.controller.speed

            ) *

            delta;

        //--------------------------------
        // ゴール
        //--------------------------------

        if(

            this.vehicle.progress >

            0.995

        ){

            this.finish();

        }

    }

    //=========================================================================
    // ゴール
    //=========================================================================

    finish(){

        this.vehicle.goal = true;

        this.vehicle.finishTime =

            performance.now();

        this.vehicle.controller.speed = 0;

        //--------------------------------
        // キャンプ場では車を停止
        //--------------------------------

        this.vehicle.controller.enabled = false;

        //--------------------------------
        // カメラだけ自由
        //--------------------------------

        this.vehicle.cameraController
            ?.enableFreeLook();

        //--------------------------------
        // リザルト
        //--------------------------------

        this.vehicle.game.ui.showGoal();

    }

    //=========================================================================
    // 称号
    //=========================================================================

    getTitle(){

        const time =

            (

                this.vehicle.finishTime -

                this.vehicle.startTime

            ) / 1000;

        const hit =

            this.vehicle.hitCount;

        if(

            hit === 0 &&

            time <= 120

        ){

            return "パーフェクトヒューマン";

        }

        if(

            hit >= 20

        ){

            return "期待のルーキー";

        }

        if(

            hit >= 10

        ){

            return "ベテランドライバー";

        }

        if(

            hit >= 1

        ){

            return "キャンピングカーの達人";

        }

        if(

            time <= 120

        ){

            return "スピードキング";

        }

        return "キャンピングカーの達人";

    }

}
