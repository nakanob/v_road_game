// ============================================================================
// world/VegetationManager.js
// Part 1
// V11
// 軽量植生システム
// 道沿いだけ配置
// ============================================================================

import * as THREE from "three";

export default class VegetationManager{

    constructor(scene){

        this.scene = scene;

        this.treeMaterial =

            new THREE.MeshStandardMaterial({

                color:0x567d39,

                roughness:1

            });

        this.trunkMaterial =

            new THREE.MeshStandardMaterial({

                color:0x6b4b32

            });

        this.grassMaterial =

            new THREE.MeshLambertMaterial({

                color:0x6fa648,

                side:THREE.DoubleSide

            });

    }

    //=========================================================================
    // 作成
    //=========================================================================

    createRoadsideVegetation(world,opt={}){

        const treeCount=

            opt.treeCount ?? 80;

        const grassCount=

            opt.grassCount ?? 240;

        //--------------------------------
        // 木
        //--------------------------------

        for(

            let i=0;

            i<treeCount;

            i++

        ){

            const progress=

                THREE.MathUtils.lerp(

                    opt.startProgress,

                    opt.endProgress,

                    Math.random()

                );

            const side=

                Math.random()<0.5

                ?-1

                :1;

            const offset=

                THREE.MathUtils.lerp(

                    opt.treeMinDistance,

                    opt.treeMaxDistance,

                    Math.random()

                )*side;

            const pose=

                world.getPose(

                    progress,

                    offset

                );

            if(

                world.isDecorationPositionBlocked(

                    pose.position,

                    "tree"

                )

            ) continue;

            this.scene.add(

                this.createTree(

                    pose.position

                )

            );

        }

        //--------------------------------
        // 草
        //--------------------------------

        for(

            let i=0;

            i<grassCount;

            i++

        ){

            const progress=

                THREE.MathUtils.lerp(

                    opt.startProgress,

                    opt.endProgress,

                    Math.random()

                );

            const side=

                Math.random()<0.5

                ?-1

                :1;

            const offset=

                THREE.MathUtils.lerp(

                    opt.grassMinDistance,

                    opt.grassMaxDistance,

                    Math.random()

                )*side;

            const pose=

                world.getPose(

                    progress,

                    offset

                );

            if(

                world.isDecorationPositionBlocked(

                    pose.position,

                    "grass"

                )

            ) continue;

            this.scene.add(

                this.createGrass(

                    pose.position

                )

            );

        }

    }

    //=========================================================================
    // 木
    //=========================================================================

    createTree(position){

        const g=

            new THREE.Group();

        const trunk=

            new THREE.Mesh(

                new THREE.CylinderGeometry(

                    .12,

                    .16,

                    1.2,

                    8

                ),

                this.trunkMaterial

            );

        trunk.position.y=.6;

        trunk.castShadow=true;

        g.add(trunk);

        const crown=

            new THREE.Mesh(

                new THREE.ConeGeometry(

                    .75,

                    1.6,

                    8

                ),

                this.treeMaterial

            );

        crown.position.y=1.7;

        crown.castShadow=true;

        g.add(crown);

        g.position.copy(position);

        return g;

    }

    //=========================================================================
    // 草
    //=========================================================================

    createGrass(position){

        const mesh=

            new THREE.Mesh(

                new THREE.PlaneGeometry(

                    .6,

                    .45

                ),

                this.grassMaterial

            );

        mesh.position.copy(position);

        mesh.position.y=.22;

        mesh.rotation.y=

            Math.random()*

            Math.PI;

        return mesh;

    }

}
