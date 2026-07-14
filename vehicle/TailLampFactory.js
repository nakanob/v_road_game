import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.179/build/three.module.js";

export class TailLampFactory {
  static create(shape="bar",width=.5,height=.16){
    const material=new THREE.MeshBasicMaterial({color:0xff2a20,toneMapped:false});
    const group=new THREE.Group();
    if(shape==="round"){
      const g=new THREE.CircleGeometry(height*.65,18);for(const x of [-width*.22,width*.22]){const m=new THREE.Mesh(g,material.clone());m.position.x=x;group.add(m)}
    }else if(shape==="double"){
      const g=new THREE.BoxGeometry(width*.34,height,.06);for(const x of [-width*.25,width*.25]){const m=new THREE.Mesh(g,material.clone());m.position.x=x;group.add(m)}
    }else{
      group.add(new THREE.Mesh(new THREE.BoxGeometry(width,height,.07),material));
    }
    return group;
  }
}
