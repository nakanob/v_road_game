// ============================================================================
// vehicle/VehicleController.js
// Part 1
// V11
// 左右操作・バック・壁衝突・ジョイスティック対応
// ============================================================================

import * as THREE from "three";

export default class VehicleController{

    constructor(vehicle){

        this.vehicle = vehicle;

        this.speed = 0;

        this.steer = 0;

        this.maxSpeed = 18;

        this.reverseSpeed = 7;

        this.acceleration = 8;

        this.brakePower = 18;

        this.drag = 3.2;

        this.maxSteer =

            THREE.MathUtils.degToRad(32);

        this.steerSpeed = 2.8;

        this.keys = {};

        this.joystick = {

            x:0,

            y:0

        };

        //--------------------------------

        window.addEventListener(

            "keydown",

            e=>{

                this.keys[e.code]=true;

            }

        );

        window.addEventListener(

            "keyup",

            e=>{

                this.keys[e.code]=false;

            }

        );

    }

    //=========================================================================
    // 仮想ジョイスティック
    //=========================================================================

    setJoystick(x,y){

        this.joystick.x =

            THREE.MathUtils.clamp(

                x,

                -1,

                1

            );

        this.joystick.y =

            THREE.MathUtils.clamp(

                y,

                -1,

                1

            );

    }

    //=========================================================================
    // 更新
    //=========================================================================

    update(delta){

        //--------------------------------
        // 前後入力
        //--------------------------------

        let throttle = 0;

        if(

            this.keys["ArrowUp"] ||

            this.keys["KeyW"]

        ){

            throttle += 1;

        }

        if(

            this.keys["ArrowDown"] ||

            this.keys["KeyS"]

        ){

            throttle -= 1;

        }

        throttle -=

            this.joystick.y;

        //--------------------------------
        // 左右入力
        //--------------------------------

        let steer = 0;

        if(

            this.keys["ArrowLeft"] ||

            this.keys["KeyA"]

        ){

            steer += 1;

        }

        if(

            this.keys["ArrowRight"] ||

            this.keys["KeyD"]

        ){

            steer -= 1;

        }

        steer -=

            this.joystick.x;

        //--------------------------------
        // 加速
        //--------------------------------

        if(throttle>0){

            this.speed +=

                this.acceleration*

                delta;

        }

        //--------------------------------
        // バック
        //--------------------------------

        else if(throttle<0){

            this.speed -=

                this.acceleration*

                delta;

        }

        //--------------------------------
        // 抵抗
        //--------------------------------

        else{

            this.speed=

                THREE.MathUtils.damp(

                    this.speed,

                    0,

                    this.drag,

                    delta

                );

        }

        //--------------------------------
        // 制限
        //--------------------------------

        this.speed=

            THREE.MathUtils.clamp(

                this.speed,

                -this.reverseSpeed,

                this.maxSpeed

            );

        //--------------------------------
        // ステア
        //--------------------------------

        this.steer=

            THREE.MathUtils.damp(

                this.steer,

                steer*

                this.maxSteer,

                this.steerSpeed,

                delta

            );

        //--------------------------------
        // ★前進・後退で左右が逆にならない
        //--------------------------------

        this.vehicle.heading -=

            this.steer *

            delta *

            Math.abs(

                this.speed

            ) *

            0.52;

        //--------------------------------
        // 移動
        //--------------------------------

        this.vehicle.root.position.x +=

            Math.sin(

                this.vehicle.heading

            ) *

            this.speed *

            delta;

        this.vehicle.root.position.z +=

            Math.cos(

                this.vehicle.heading

            ) *

            this.speed *

            delta;

    }

}
// ============================================================================
// vehicle/VehicleController.js
// Part 2
// V11
// 壁衝突・道路外減速・進行率計算・ゴール判定
// ============================================================================

//=========================================================================
// 地形追従
//=========================================================================

updateGround(delta){

    const y=

        this.vehicle.world.getHeight(

            this.vehicle.root.position.x,

            this.vehicle.root.position.z

        );

    this.vehicle.root.position.y=

        THREE.MathUtils.damp(

            this.vehicle.root.position.y,

            y,

            12,

            delta

        );

}

//=========================================================================
// 道路外判定
//=========================================================================

updateRoadLimit(delta){

    const pose=

        this.vehicle.world.getNearestPose(

            this.vehicle.root.position

        );

    const offset=

        pose.side.dot(

            this.vehicle.root.position

                .clone()

                .sub(

                    pose.position

                )

        );

    //--------------------------------
    // 進行率
    //--------------------------------

    this.vehicle.progress=

        pose.progress;

    //--------------------------------
    // 道路外
    //--------------------------------

    if(

        Math.abs(offset)>

        this.vehicle.world.roadHalfWidth

    ){

        //--------------------------------
        // 少し滑る
        //--------------------------------

        this.speed*=0.985;

        //--------------------------------
        // 壁方向へ押し戻す
        //--------------------------------

        const over=

            Math.abs(offset)-

            this.vehicle.world

                .roadHalfWidth;

        const push=

            pose.side.clone()

                .multiplyScalar(

                    offset>0

                    ?-over*.18

                    :over*.18

                );

        this.vehicle.root.position.add(

            push

        );

        //--------------------------------
        // 衝突回数
        //--------------------------------

        if(

            !this.hitCooldown

        ){

            this.hitCooldown=.35;

            this.vehicle.hitCount++;

        }

    }

    //--------------------------------

    if(this.hitCooldown){

        this.hitCooldown-=delta;

        if(this.hitCooldown<0){

            this.hitCooldown=0;

        }

    }

}

//=========================================================================
// ゴール
//=========================================================================

updateGoal(){

    if(

        this.vehicle.progress>

        .995 &&

        !this.vehicle.goal

    ){

        this.vehicle.goal=true;

        this.speed=0;

        this.vehicle.finishTime=

            performance.now();

        this.vehicle.onGoal?.();

    }

}

//=========================================================================
// update()最後へ追加
//=========================================================================

this.updateGround(

    delta

);

this.updateRoadLimit(

    delta

);

this.updateGoal();
