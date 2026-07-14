import * as THREE from "three";

const PRESETS = [
  { bg:0xb8d8e6, fog:0xb8d8e6, fogNear:180, fogFar:560, hemiSky:0xd9f3ff, hemiGround:0x776b59, hemi:1.8, sun:0xffe2b4, intensity:2.2, pos:[-80,55,-80], exposure:1.05 },
  { bg:0x72b7e7, fog:0xa5d0e6, fogNear:220, fogFar:650, hemiSky:0xdaf4ff, hemiGround:0x657344, hemi:2.0, sun:0xffffff, intensity:2.8, pos:[-30,130,20], exposure:1.05 },
  { bg:0xd47855, fog:0xc68c6d, fogNear:150, fogFar:500, hemiSky:0xf2b483, hemiGround:0x51433b, hemi:1.25, sun:0xff9e62, intensity:2.4, pos:[70,45,20], exposure:.96 },
  { bg:0x101b31, fog:0x17243a, fogNear:100, fogFar:390, hemiSky:0x31466c, hemiGround:0x171c18, hemi:.72, sun:0x8da6d5, intensity:.42, pos:[30,80,-20], exposure:.76 }
];

export class AreaEnvironment {
  constructor(game){this.game=game;this.current=-1;this.target=null;this.mix=1;this.from=null}
  update(progress,delta){const area=this.game.world.getArea(progress);if(area.id!==this.current)this.applyArea(area.id);if(!this.target)return;this.mix=Math.min(1,this.mix+delta*.85);const k=1-Math.pow(1-this.mix,3);this.game.scene.background.lerpColors(this.from.bg,this.target.bg,k);this.game.scene.fog.color.copy(this.game.scene.background);this.game.scene.fog.near=THREE.MathUtils.lerp(this.from.fogNear,this.target.fogNear,k);this.game.scene.fog.far=THREE.MathUtils.lerp(this.from.fogFar,this.target.fogFar,k);this.game.ambient.intensity=THREE.MathUtils.lerp(this.from.hemi,this.target.hemi,k);this.game.sun.intensity=THREE.MathUtils.lerp(this.from.intensity,this.target.intensity,k);this.game.renderer.toneMappingExposure=THREE.MathUtils.lerp(this.from.exposure,this.target.exposure,k)}
  applyArea(id,immediate=false){const p=PRESETS[id];this.current=id;this.from={bg:this.game.scene.background.clone(),fogNear:this.game.scene.fog.near,fogFar:this.game.scene.fog.far,hemi:this.game.ambient.intensity,intensity:this.game.sun.intensity,exposure:this.game.renderer.toneMappingExposure};this.target={...p,bg:new THREE.Color(p.bg)};this.game.ambient.color.set(p.hemiSky);this.game.ambient.groundColor.set(p.hemiGround);this.game.sun.color.set(p.sun);this.game.sun.position.set(...p.pos);this.mix=immediate?1:0;if(immediate){this.game.scene.background.copy(this.target.bg);this.game.scene.fog.color.copy(this.target.bg);this.game.scene.fog.near=p.fogNear;this.game.scene.fog.far=p.fogFar;this.game.ambient.intensity=p.hemi;this.game.sun.intensity=p.intensity;this.game.renderer.toneMappingExposure=p.exposure}}
}
