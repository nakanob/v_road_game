import * as THREE from "three";

const AREA_DATA = [
  { id: 0, key: "city", name: "街", time: "朝", start: 0.00, end: 0.24, road: 0x3f454a },
  { id: 1, key: "field", name: "草原", time: "昼", start: 0.24, end: 0.50, road: 0x657d43 },
  { id: 2, key: "mountain", name: "山", time: "夕方", start: 0.50, end: 0.76, road: 0x6c625a },
  { id: 3, key: "camp", name: "キャンプ場", time: "夜", start: 0.76, end: 1.00, road: 0x72533b }
];

export class TrackWorld {
  constructor(game) {
    this.game = game;
    this.scene = game.scene;
    this.areas = AREA_DATA;
    this.roadHalfWidth = 5.5;
    this.length = 1120;
    this.sampleCount = 360;
    this.samples = [];

    this.curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(8, 0, 125),
      new THREE.Vector3(-18, 0, 255),
      new THREE.Vector3(20, 1, 390),
      new THREE.Vector3(2, 3, 535),
      new THREE.Vector3(-38, 13, 660),
      new THREE.Vector3(24, 27, 790),
      new THREE.Vector3(48, 18, 915),
      new THREE.Vector3(20, 7, 1030),
      new THREE.Vector3(0, 5, 1120)
    ], false, "catmullrom", 0.35);

    this.buildSamples();
    this.createGround();
    this.createRoad();
    this.createRoadEdges();
    this.createCheckpoints();
    this.createCity();
    this.createField();
    this.createRiver();
    this.createMountain();
    this.createCampground();
  }

  buildSamples() {
    for (let i = 0; i <= this.sampleCount; i++) {
      const t = i / this.sampleCount;
      const point = this.curve.getPointAt(t);
      const tangent = this.curve.getTangentAt(t).normalize();
      const side = new THREE.Vector3(tangent.z, 0, -tangent.x).normalize();
      this.samples.push({ t, point, tangent, side });
    }
  }

  createGround() {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(850, 1450, 1, 1),
      new THREE.MeshStandardMaterial({ color: 0x65764f, roughness: 1 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -0.35, 560);
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  createRoad() {
    for (const area of this.areas) {
      const startIndex = Math.floor(area.start * this.sampleCount);
      const endIndex = Math.ceil(area.end * this.sampleCount);
      const positions = [];
      const uvs = [];
      const indices = [];
      for (let i = startIndex; i <= endIndex; i++) {
        const s = this.samples[i];
        const width = this.roadHalfWidth + (area.key === "city" ? 1.2 : 0);
        const left = s.point.clone().addScaledVector(s.side, -width);
        const right = s.point.clone().addScaledVector(s.side, width);
        left.y += 0.07; right.y += 0.07;
        positions.push(left.x,left.y,left.z,right.x,right.y,right.z);
        const v = (i-startIndex) / Math.max(1,endIndex-startIndex);
        uvs.push(0,v,1,v);
        if (i < endIndex) {
          const n=(i-startIndex)*2;
          indices.push(n,n+2,n+1,n+2,n+3,n+1);
        }
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position",new THREE.Float32BufferAttribute(positions,3));
      geo.setAttribute("uv",new THREE.Float32BufferAttribute(uvs,2));
      geo.setIndex(indices); geo.computeVertexNormals();
      const mat = new THREE.MeshStandardMaterial({ color: area.road, roughness: area.key === "city" ? 0.78 : 1, metalness: 0 });
      const mesh = new THREE.Mesh(geo,mat); mesh.receiveShadow=true; this.scene.add(mesh);
    }
  }

  createRoadEdges() {
    const pointsL=[],pointsR=[];
    for(const s of this.samples){
      pointsL.push(s.point.clone().addScaledVector(s.side,-this.roadHalfWidth-0.18).add(new THREE.Vector3(0,.12,0)));
      pointsR.push(s.point.clone().addScaledVector(s.side,this.roadHalfWidth+0.18).add(new THREE.Vector3(0,.12,0)));
    }
    const mat=new THREE.LineBasicMaterial({color:0xece7d5,transparent:true,opacity:.7});
    this.scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pointsL),mat));
    this.scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pointsR),mat));
  }

  createCheckpoints() {
    [0.24,0.50,0.76,0.995].forEach((t,index)=>{
      const s=this.getSample(t); const group=new THREE.Group();
      const postGeo=new THREE.BoxGeometry(.35,5,.35);
      const postMat=new THREE.MeshStandardMaterial({color:index===3?0xf4c95d:0xe9e5d6,roughness:.7});
      for(const x of [-this.roadHalfWidth-1,this.roadHalfWidth+1]){
        const p=new THREE.Mesh(postGeo,postMat);p.position.copy(s.point).addScaledVector(s.side,x);p.position.y+=2.5;p.castShadow=true;group.add(p);
      }
      const bar=new THREE.Mesh(new THREE.BoxGeometry(this.roadHalfWidth*2+2.4,.45,.45),postMat);bar.position.copy(s.point);bar.position.y+=5;bar.rotation.y=Math.atan2(s.tangent.x,s.tangent.z);bar.castShadow=true;group.add(bar);this.scene.add(group);
    });
  }

  createCity() {
    const boxGeo=new THREE.BoxGeometry(1,1,1); const mats=[0xb7b4ad,0xd6c5a3,0x9fb4bd,0xc89b83];
    for(let i=0;i<34;i++){
      const t=.015+(i/34)*.20; const s=this.getSample(t); const side=i%2?1:-1; const dist=11+(i%4)*5;
      const h=7+(i*7)%15; const mesh=new THREE.Mesh(boxGeo,new THREE.MeshStandardMaterial({color:mats[i%mats.length],roughness:.9}));
      mesh.scale.set(7+(i%3)*2,h,8+(i%2)*3);mesh.position.copy(s.point).addScaledVector(s.side,side*dist);mesh.position.y+=h/2-.2;mesh.castShadow=true;mesh.receiveShadow=true;this.scene.add(mesh);
      this.addWindows(mesh,side);
    }
    for(let i=0;i<18;i++) this.addStreetLight(.01+i*.012,i%2?1:-1);
  }

  addWindows(building, side) {
    const geo=new THREE.PlaneGeometry(.7,.8);const mat=new THREE.MeshBasicMaterial({color:0xffe4a3});
    for(let y=2;y<building.scale.y-1;y+=3){
      const w=new THREE.Mesh(geo,mat);w.position.set(0,y-building.scale.y/2,side>0?-0.505:0.505); if(side>0)w.rotation.y=Math.PI; building.add(w);
    }
  }

  addStreetLight(t,side){const s=this.getSample(t);const pole=new THREE.Mesh(new THREE.CylinderGeometry(.08,.1,4,7),new THREE.MeshStandardMaterial({color:0x3a4145}));pole.position.copy(s.point).addScaledVector(s.side,side*8);pole.position.y+=2;pole.castShadow=true;this.scene.add(pole)}

  createField() {
    this.createInstancedTrees(.26,.48,86,0x4e6b38,0x6a4a31,10,34);
    const bladeGeo=new THREE.ConeGeometry(.09,.75,3);const mat=new THREE.MeshStandardMaterial({color:0x7b9a4b,roughness:1});const count=600;const inst=new THREE.InstancedMesh(bladeGeo,mat,count);const dummy=new THREE.Object3D();
    for(let i=0;i<count;i++){const t=.25+Math.random()*.25;const s=this.getSample(t);const side=Math.random()<.5?-1:1;dummy.position.copy(s.point).addScaledVector(s.side,side*(8+Math.random()*48));dummy.position.y+=.25;dummy.rotation.y=Math.random()*Math.PI;dummy.scale.setScalar(.65+Math.random()*.75);dummy.updateMatrix();inst.setMatrixAt(i,dummy.matrix)}inst.receiveShadow=true;this.scene.add(inst);
  }

  createRiver(){const s=this.getSample(.40);const water=new THREE.Mesh(new THREE.PlaneGeometry(115,26),new THREE.MeshStandardMaterial({color:0x3f86a8,roughness:.25,metalness:.15,transparent:true,opacity:.88}));water.rotation.x=-Math.PI/2;water.rotation.z=-Math.atan2(s.tangent.x,s.tangent.z);water.position.copy(s.point);water.position.y-=.18;this.scene.add(water);const bridge=new THREE.Mesh(new THREE.BoxGeometry(this.roadHalfWidth*2+1,.45,27),new THREE.MeshStandardMaterial({color:0x5b5a55,roughness:.8}));bridge.position.copy(s.point);bridge.position.y+=.02;bridge.rotation.y=Math.atan2(s.tangent.x,s.tangent.z);bridge.receiveShadow=true;this.scene.add(bridge)}

  createMountain(){this.createInstancedRocks(.51,.77,120);this.createInstancedTrees(.54,.75,54,0x304c34,0x4b3829,12,46)}

  createInstancedRocks(start,end,count){const geo=new THREE.DodecahedronGeometry(1,0);const mat=new THREE.MeshStandardMaterial({color:0x776f66,roughness:1});const inst=new THREE.InstancedMesh(geo,mat,count);const d=new THREE.Object3D();for(let i=0;i<count;i++){const t=start+Math.random()*(end-start);const s=this.getSample(t);const side=Math.random()<.5?-1:1;d.position.copy(s.point).addScaledVector(s.side,side*(9+Math.random()*58));d.position.y+=Math.random()*4;d.rotation.set(Math.random(),Math.random()*Math.PI,Math.random());const sc=1+Math.random()*4;d.scale.set(sc,sc*(.65+Math.random()),sc);d.updateMatrix();inst.setMatrixAt(i,d.matrix)}inst.castShadow=true;inst.receiveShadow=true;this.scene.add(inst)}

  createInstancedTrees(start,end,count,leafColor,trunkColor,minDistance,maxDistance){const trunks=new THREE.InstancedMesh(new THREE.CylinderGeometry(.18,.28,2.8,7),new THREE.MeshStandardMaterial({color:trunkColor,roughness:1}),count);const crowns=new THREE.InstancedMesh(new THREE.ConeGeometry(1.5,4.6,8),new THREE.MeshStandardMaterial({color:leafColor,roughness:1}),count);const d=new THREE.Object3D();for(let i=0;i<count;i++){const t=start+Math.random()*(end-start);const s=this.getSample(t);const side=Math.random()<.5?-1:1;const dist=minDistance+Math.random()*(maxDistance-minDistance);const sc=.8+Math.random()*.8;d.position.copy(s.point).addScaledVector(s.side,side*dist);d.position.y+=1.4*sc;d.scale.set(sc,sc,sc);d.rotation.y=Math.random()*Math.PI;d.updateMatrix();trunks.setMatrixAt(i,d.matrix);d.position.y+=3*sc;d.updateMatrix();crowns.setMatrixAt(i,d.matrix)}trunks.castShadow=true;crowns.castShadow=true;this.scene.add(trunks,crowns)}

  createCampground(){this.createInstancedTrees(.77,.98,72,0x263f2d,0x493427,12,52);for(let i=0;i<7;i++){const t=.80+i*.026;const s=this.getSample(t);const side=i%2?1:-1;this.createTent(s.point.clone().addScaledVector(s.side,side*(15+(i%3)*5)),(i*1.3)%6.28)}const fireS=this.getSample(.94);this.createCampfire(fireS.point.clone().addScaledVector(fireS.side,17));}

  createTent(position,rotation){const group=new THREE.Group();const tent=new THREE.Mesh(new THREE.ConeGeometry(3.2,3.5,4),new THREE.MeshStandardMaterial({color:0xc87c3e,roughness:.95,side:THREE.DoubleSide}));tent.rotation.y=Math.PI/4;tent.position.y=1.7;tent.castShadow=true;group.add(tent);group.position.copy(position);group.rotation.y=rotation;this.scene.add(group)}
  createCampfire(position){const group=new THREE.Group();for(let i=0;i<5;i++){const log=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,2.2,7),new THREE.MeshStandardMaterial({color:0x4a2d1e}));log.rotation.z=Math.PI/2;log.rotation.y=i*Math.PI/2.5;log.position.y=.15;group.add(log)}const flame=new THREE.Mesh(new THREE.ConeGeometry(.55,1.8,8),new THREE.MeshBasicMaterial({color:0xff8a24}));flame.position.y=1.1;group.add(flame);const light=new THREE.PointLight(0xff8a35,7,24,2);light.position.y=2;group.add(light);group.position.copy(position);this.scene.add(group)}

  getSample(t){return this.samples[Math.round(THREE.MathUtils.clamp(t,0,1)*this.sampleCount)]}
  getArea(t){return this.areas.find(a=>t>=a.start&&t<a.end)||this.areas[this.areas.length-1]}
  getPose(progress,laneOffset=0){const s=this.getSample(progress);return{position:s.point.clone().addScaledVector(s.side,laneOffset),tangent:s.tangent.clone(),side:s.side.clone()}}
}
