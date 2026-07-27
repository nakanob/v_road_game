// ============================================================================
// world/VegetationManager.js
// Part 1
// 高速描画版
// Tree / Bush / Grass
// InstancedMesh採用（ロード高速化）
// ============================================================================

import * as THREE from "three";

export default class VegetationManager {

    constructor(scene) {

        this.scene = scene;

        this.groups = [];

        this.treeMaterial =
            new THREE.MeshLambertMaterial({

                color:0x3f7d34

            });

        this.trunkMaterial =
            new THREE.MeshLambertMaterial({

                color:0x78543b

            });

        this.grassMaterial =
            new THREE.MeshLambertMaterial({

                color:0x5ea63b

            });

        this.buildSharedGeometry();

    }

    //=========================================================================
    // Geometryは1回だけ生成
    //=========================================================================

    buildSharedGeometry(){

        this.treeGeo =

            new THREE.ConeGeometry(

                1.2,

                3,

                8

            );

        this.trunkGeo =

            new THREE.CylinderGeometry(

                .18,

                .22,

                1.2,

                6

            );

        this.grassGeo =

            new THREE.PlaneGeometry(

                .22,

                .65

            );

    }

    //=========================================================================
    // 木
    //=========================================================================

    createTrees(points){

        const leaves =

            new THREE.InstancedMesh(

                this.treeGeo,

                this.treeMaterial,

                points.length

            );

        const trunks =

            new THREE.InstancedMesh(

                this.trunkGeo,

                this.trunkMaterial,

                points.length

            );

        const dummy =

            new THREE.Object3D();

        points.forEach(

            (p,index)=>{

                //------------------------

                dummy.position.set(

                    p.x,

                    p.y+2.5,

                    p.z

                );

                dummy.rotation.y=

                    Math.random()*

                    Math.PI*2;

                const s=

                    .8+

                    Math.random()*.5;

                dummy.scale.set(

                    s,s,s

                );

                dummy.updateMatrix();

                leaves.setMatrixAt(

                    index,

                    dummy.matrix

                );

                //------------------------

                dummy.position.set(

                    p.x,

                    p.y+.6,

                    p.z

                );

                dummy.scale.set(

                    s,s,s

                );

                dummy.updateMatrix();

                trunks.setMatrixAt(

                    index,

                    dummy.matrix

                );

            }

        );

        leaves.instanceMatrix.needsUpdate=true;

        trunks.instanceMatrix.needsUpdate=true;

        this.scene.add(

            leaves

        );

        this.scene.add(

            trunks

        );

        this.groups.push(

            leaves,

            trunks

        );

    }

    //=========================================================================
    // 草
    //=========================================================================

    createGrass(points){

        const grass =

            new THREE.InstancedMesh(

                this.grassGeo,

                this.grassMaterial,

                points.length

            );

        const dummy=

            new THREE.Object3D();

        points.forEach(

            (p,index)=>{

                dummy.position.copy(

                    p

                );

                dummy.position.y+=

                    .32;

                dummy.rotation.y=

                    Math.random()*

                    Math.PI*2;

                const s=

                    .8+

                    Math.random()*.6;

                dummy.scale.set(

                    s,

                    s,

                    s

                );

                dummy.updateMatrix();

                grass.setMatrixAt(

                    index,

                    dummy.matrix

                );

            }

        );

        grass.instanceMatrix.needsUpdate=true;

        this.scene.add(

            grass

        );

        this.groups.push(

            grass

        );

    }

    //=========================================================================
    // 削除
    //=========================================================================

    clear(){

        this.groups.forEach(

            mesh=>{

                this.scene.remove(

                    mesh

                );

                mesh.dispose?.();

            }

        );

        this.groups=[];

    }

}
