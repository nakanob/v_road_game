// ============================================================================
// ui/PerformanceOptimizer.js
// V11
// 軽量化システム
// ・LOD
// ・距離カリング
// ・FPS監視
// ・20秒以内ロード対策
// ============================================================================

import * as THREE from "three";

export default class PerformanceOptimizer{

    constructor(scene,camera){

        this.scene = scene;

        this.camera = camera;

        this.targets = [];

        this.clock = 0;

        this.frame = 0;

        this.fps = 60;

    }

    //=========================================================================
    // 登録
    //=========================================================================

    register(mesh,hideDistance=220){

        this.targets.push({

            mesh,

            distance:hideDistance

        });

    }

    //=========================================================================
    // 更新
    //=========================================================================

    update(delta){

        this.clock+=delta;

        this.frame++;

        //--------------------------------
        // FPS
        //--------------------------------

        if(this.clock>=1){

            this.fps=

                this.frame/

                this.clock;

            this.clock=0;

            this.frame=0;

        }

        //--------------------------------
        // 5フレームに1回だけ
        //--------------------------------

        if((performance.now()|0)%5!==0)

            return;

        //--------------------------------
        // 距離カリング
        //--------------------------------

        const cam=

            this.camera.position;

        for(const t of this.targets){

            const d=

                cam.distanceTo(

                    t.mesh.position

                );

            t.mesh.visible=

                d<t.distance;

        }

        //--------------------------------
        // FPS低下時LOD
        //--------------------------------

        if(this.fps<45){

            this.reduceQuality();

        }

    }

    //=========================================================================
    // 軽量化
    //=========================================================================

    reduceQuality(){

        this.scene.traverse(obj=>{

            if(

                obj.material &&

                obj.material.map

            ){

                obj.material.map.anisotropy=1;

            }

        });

    }

}
