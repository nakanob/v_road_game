export class GameUI {
  constructor(game,vehicle,world){this.game=game;this.vehicle=vehicle;this.world=world;this.area=document.getElementById("area-name");this.time=document.getElementById("time-name");this.progress=document.getElementById("progress-bar");this.checkpoint=document.getElementById("checkpoint-text");this.speed=document.getElementById("speed-value");this.finish=document.getElementById("finish");document.getElementById("reset-button").addEventListener("click",()=>game.reset());this.lastArea=-1}
  update(){const a=this.world.getArea(this.vehicle.progress);this.area.textContent=a.name;this.time.textContent=a.time;this.progress.style.width=`${Math.min(100,this.vehicle.progress*100)}%`;this.speed.textContent=this.vehicle.speedKmh;if(a.id!==this.lastArea){this.lastArea=a.id;this.checkpoint.textContent=a.id===0?"START / CITY":`CHECKPOINT ${a.id} / ${a.name.toUpperCase()}`;this.checkpoint.animate([{opacity:0,transform:"translateY(-5px)"},{opacity:1,transform:"translateY(0)"}],{duration:450})}}
  showFinish(){this.finish.hidden=false}
  reset(){this.finish.hidden=true;this.lastArea=-1}
}
