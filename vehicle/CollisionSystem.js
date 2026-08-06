// ============================================================================
// vehicle/CollisionSystem.js
// V11
// 壁衝突・コース外減速・見えない壁管理
// ============================================================================

import * as THREE from "three";

export default class CollisionSystem{

    constructor(vehicle,world){

        this.vehicle = vehicle;

        this.world = world;

        this.hitCooldown = 0;

    }

    //=========================================================================
    // 更新
    //=========================================================================

    update(delta){

        if(this.hitCooldown>0){

            this.hitCooldown-=delta;

        }

        const pose=

            this.world.getNearestPose(

                this.vehicle.root.position

            );

        //--------------------------------
        // 中心線からの距離
        //--------------------------------

        const local=

            this.vehicle.root.position

                .clone()

                .sub(

                    pose.position

                );

        const sideDistance=

            pose.side.dot(

                local

            );

        //--------------------------------
        // 道路外
        //--------------------------------

        const roadHalf=

            this.world.roadHalfWidth;

        if(

            Math.abs(sideDistance)<=

            roadHalf

        ){

            return;

        }

        //--------------------------------
        // 押し戻し
        //--------------------------------

        const over=

            Math.abs(

                sideDistance

            )-roadHalf;

        const normal=

            pose.side.clone();

        if(sideDistance>0){

            normal.negate();

        }

        //--------------------------------
        // 少しだけ滑る
        //--------------------------------

        this.vehicle.root.position.add(

            normal.multiplyScalar(

                over*.18

            )

        );

        //--------------------------------
        // ブレーキ
        //--------------------------------

        this.vehicle.controller.speed*=

            .92;

        //--------------------------------
        // 衝突数
        //--------------------------------

        if(

            this.hitCooldown<=0

        ){

            this.vehicle.hitCount++;

            this.hitCooldown=.45;

        }

    }

}
