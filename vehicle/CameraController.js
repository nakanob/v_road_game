// ============================================================================
// vehicle/CameraController.js
// V11
// カメラ
// ・通常追従
// ・酔い防止
// ・ゴール後フリーカメラ
// ============================================================================

import * as THREE from "three";

export default class CameraController{

    constructor(camera,vehicle){

        this.camera=camera;

        this.vehicle=vehicle;

        this.freeLook=false;

        this.distance=9.5;

        this.height=3.6;

        this.lookHeight=1.4;

        this.target=new THREE.Vector3();

    }

    //=========================================================================
    // フリーカメラ
    //=========================================================================

    enableFreeLook(){

        this.freeLook=true;

    }

    disableFreeLook(){

        this.freeLook=false;

    }

    //=========================================================================
    // 更新
    //=========================================================================

    update(delta){

        if(this.freeLook){

            this.updateFree(delta);

            return;

        }

        //--------------------------------
        // 車の向き
        //--------------------------------

        const angle=

            this.vehicle.heading;

        const targetPos=

            this.vehicle.root.position;

        //--------------------------------
        // カメラ位置
        //--------------------------------

        const desired=

            new THREE.Vector3(

                targetPos.x-

                Math.sin(angle)*

                this.distance,

                targetPos.y+

                this.height,

                targetPos.z-

                Math.cos(angle)*

                this.distance

            );

        //--------------------------------
        // ★酔い防止
        // 車の細かい揺れは追従しない
        //--------------------------------

        this.camera.position.lerp(

            desired,

            delta*3.5

        );

        //--------------------------------
        // 注視点
        //--------------------------------

        this.target.set(

            targetPos.x,

            targetPos.y+

            this.lookHeight,

            targetPos.z

        );

        this.camera.lookAt(

            this.target

        );

    }

    //=========================================================================
    // ゴール後
    //=========================================================================

    updateFree(delta){

        if(this.dragging)

            return;

        this.camera.lookAt(

            this.vehicle.root.position

        );

    }

}
