// ============================================================================
// vehicle/InputManager.js
// Part 1
// 仮想ジョイスティック（4ボタン廃止）
// ============================================================================

createVirtualJoystick(){

    if(
        !(
            "ontouchstart" in window
        )
    ) return;

    const base =
        document.createElement("div");

    base.id =
        "virtualStick";

    Object.assign(

        base.style,

        {

            position:"fixed",

            left:"40px",

            bottom:"40px",

            width:"150px",

            height:"150px",

            borderRadius:"50%",

            background:"rgba(255,255,255,.12)",

            border:"2px solid rgba(255,255,255,.35)",

            backdropFilter:"blur(8px)",

            touchAction:"none",

            zIndex:99999

        }

    );

    const knob =
        document.createElement("div");

    knob.id =
        "virtualKnob";

    Object.assign(

        knob.style,

        {

            position:"absolute",

            left:"45px",

            top:"45px",

            width:"60px",

            height:"60px",

            borderRadius:"50%",

            background:"#ffffff",

            opacity:.75,

            boxShadow:

            "0 0 18px rgba(255,255,255,.45)"

        }

    );

    base.appendChild(knob);

    document.body.appendChild(base);

    this.stick = base;

    this.knob = knob;

    this.joyX = 0;

    this.joyY = 0;

    this.dragging = false;

    const radius = 45;

    const move = e=>{

        if(!this.dragging) return;

        const t =
            e.touches[0];

        const rect =
            base.getBoundingClientRect();

        let x =
            t.clientX -

            rect.left -

            rect.width/2;

        let y =
            t.clientY -

            rect.top -

            rect.height/2;

        const len =
            Math.hypot(x,y);

        if(len>radius){

            x =
            x/len*radius;

            y =
            y/len*radius;

        }

        knob.style.left =
            (45+x)+"px";

        knob.style.top =
            (45+y)+"px";

        this.joyX =
            x/radius;

        this.joyY =
            y/radius;

    };

    base.addEventListener(

        "touchstart",

        ()=>{

            this.dragging=true;

        }

    );

    base.addEventListener(

        "touchmove",

        move,

        {

            passive:false

        }

    );

    base.addEventListener(

        "touchend",

        ()=>{

            this.dragging=false;

            this.joyX=0;

            this.joyY=0;

            knob.style.left="45px";

            knob.style.top="45px";

        }

    );

}
// ============================================================================
// vehicle/InputManager.js
// Part 2
// キーボード入力と仮想ジョイスティックの統合
// ============================================================================

updateVirtualJoystick() {

    if (!this.stick) return;

    const deadZone = 0.18;

    this.keys.left =
        this.joyX < -deadZone;

    this.keys.right =
        this.joyX > deadZone;

    this.keys.forward =
        this.joyY < -deadZone;

    this.keys.backward =
        this.joyY > deadZone;

}


// ============================================================================
// InputManager の update()
// 毎フレーム呼び出す
// ============================================================================

update() {

    this.updateVirtualJoystick();

}


// ============================================================================
// ジョイスティックの入力値を直接取得する場合
// ============================================================================

getSteeringAxis() {

    if (
        Math.abs(this.joyX) > 0.18
    ) {

        return this.joyX;

    }

    if (this.keys.left) {

        return -1;

    }

    if (this.keys.right) {

        return 1;

    }

    return 0;

}


getDriveAxis() {

    if (
        Math.abs(this.joyY) > 0.18
    ) {

        return -this.joyY;

    }

    if (this.keys.forward) {

        return 1;

    }

    if (this.keys.backward) {

        return -1;

    }

    return 0;

}


// ============================================================================
// 指を離した場合や画面が非アクティブになった場合のリセット
// ============================================================================

resetVirtualJoystick() {

    this.joyX = 0;

    this.joyY = 0;

    this.dragging = false;

    this.keys.forward = false;

    this.keys.backward = false;

    this.keys.left = false;

    this.keys.right = false;

    if (this.knob) {

        this.knob.style.left = "45px";

        this.knob.style.top = "45px";

    }

}


// ============================================================================
// constructor() の最後に追加
// ============================================================================

this.joyX = 0;

this.joyY = 0;

this.dragging = false;

this.createVirtualJoystick();

window.addEventListener(

    "blur",

    () => {

        this.resetVirtualJoystick();

    }

);


// ============================================================================
// Vehicle.js 側の入力取得例
// ============================================================================

const steeringInput =
    this.input.getSteeringAxis();

const driveInput =
    this.input.getDriveAxis();


// 前進・後退

if (driveInput > 0) {

    this.speed +=
        this.acceleration *
        driveInput *
        delta;

}

else if (driveInput < 0) {

    if (this.speed > 1) {

        this.speed -=
            this.brakePower *
            Math.abs(driveInput) *
            delta;

    }

    else {

        this.speed -=
            this.acceleration *
            0.62 *
            Math.abs(driveInput) *
            delta;

    }

}


// 左右操舵

const steeringTarget =
    steeringInput;

this.steer =
    THREE.MathUtils.damp(

        this.steer,

        steeringTarget,

        10,

        delta

    );
