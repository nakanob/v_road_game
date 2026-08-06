// ============================================================================
// ui/GameStats.js
// V11
// ゲーム統計
// ・衝突回数
// ・平均速度
// ・最高速度
// ・走行距離
// ・プレイ時間
// ============================================================================

export default class GameStats {

    constructor(vehicle) {

        this.vehicle = vehicle;

        this.reset();

    }

    //=========================================================================
    // リセット
    //=========================================================================

    reset() {

        this.startTime = performance.now();

        this.finishTime = 0;

        this.hitCount = 0;

        this.totalDistance = 0;

        this.maxSpeed = 0;

        this.averageSpeed = 0;

        this.lastPosition = null;

    }

    //=========================================================================
    // 更新
    //=========================================================================

    update(delta) {

        const pos = this.vehicle.root.position;

        //--------------------------------
        // 距離
        //--------------------------------

        if (this.lastPosition) {

            this.totalDistance +=

                pos.distanceTo(

                    this.lastPosition

                );

        }

        this.lastPosition = pos.clone();

        //--------------------------------
        // 最高速度
        //--------------------------------

        const speed =

            Math.abs(

                this.vehicle.controller.speed

            ) * 3.6;

        if (

            speed >

            this.maxSpeed

        ) {

            this.maxSpeed = speed;

        }

        //--------------------------------
        // 平均速度
        //--------------------------------

        const time =

            (

                performance.now() -

                this.startTime

            ) / 1000;

        if (

            time > 0

        ) {

            this.averageSpeed =

                this.totalDistance /

                time *

                3.6;

        }

    }

    //=========================================================================
    // 衝突
    //=========================================================================

    addHit() {

        this.hitCount++;

    }

    //=========================================================================
    // ゴール
    //=========================================================================

    finish() {

        this.finishTime =

            performance.now();

    }

    //=========================================================================
    // 秒
    //=========================================================================

    getTime() {

        return (

            this.finishTime -

            this.startTime

        ) / 1000;

    }

    //=========================================================================
    // 称号
    //=========================================================================

    getRank() {

        const time =

            this.getTime();

        if (

            this.hitCount >= 20

        ) {

            return "期待のルーキー";

        }

        if (

            this.hitCount >= 10

        ) {

            return "ベテランドライバー";

        }

        if (

            this.hitCount >= 1

        ) {

            return "キャンピングカーの達人";

        }

        if (

            this.hitCount === 0 &&

            time <= 120

        ) {

            return "パーフェクトヒューマン";

        }

        if (

            time <= 120

        ) {

            return "スピードキング";

        }

        return "キャンピングカーの達人";

    }

}
