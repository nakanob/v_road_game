export class InputManager {
  constructor(){this.keys={forward:false,backward:false,left:false,right:false,brake:false};addEventListener("keydown",e=>this.set(e,true));addEventListener("keyup",e=>this.set(e,false));addEventListener("blur",()=>this.reset())}
  set(e,value){const map={KeyW:"forward",ArrowUp:"forward",KeyS:"backward",ArrowDown:"backward",KeyA:"left",ArrowLeft:"left",KeyD:"right",ArrowRight:"right",Space:"brake"};const key=map[e.code];if(key){e.preventDefault();this.keys[key]=value}}
  reset(){for(const k in this.keys)this.keys[k]=false}
}
