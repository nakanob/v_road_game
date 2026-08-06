// ============================================================================
// ui/VirtualJoystick.js
// Part 1
// V11
// スマホ用アナログジョイスティック
// ============================================================================

export default class VirtualJoystick{

    constructor(controller){

        this.controller = controller;

        this.active = false;

        this.pointerId = null;

        this.radius = 55;

        this.create();

    }

    //=========================================================================
    // UI
    //=========================================================================

    create(){

        this.base = document.createElement("div");

        this.base.style.cssText = `

position:fixed;
left:30px;
bottom:30px;
width:110px;
height:110px;
border-radius:50%;
background:rgba(255,255,255,.12);
border:2px solid rgba(255,255,255,.3);
touch-action:none;
display:none;
z-index:99999;

`;

        this.stick = document.createElement("div");

        this.stick.style.cssText = `

position:absolute;
left:30px;
top:30px;
width:50px;
height:50px;
border-radius:50%;
background:rgba(255,255,255,.8);

`;

        this.base.appendChild(

            this.stick

        );

        document.body.appendChild(

            this.base

        );

        //--------------------------------

        if(

            "ontouchstart" in window

        ){

            this.base.style.display="block";

        }

        //--------------------------------

        this.base.addEventListener(

            "pointerdown",

            e=>this.down(e)

        );

        window.addEventListener(

            "pointermove",

            e=>this.move(e)

        );

        window.addEventListener(

            "pointerup",

            e=>this.up(e)

        );

    }

    //=========================================================================
    // Down
    //=========================================================================

    down(e){

        this.active=true;

        this.pointerId=e.pointerId;

        this.update(e);

    }

    //=========================================================================
    // Move
    //=========================================================================

    move(e){

        if(

            !this.active ||

            e.pointerId!==

            this.pointerId

        ) return;

        this.update(e);

    }

    //=========================================================================
    // Up
    //=========================================================================

    up(e){

        if(

            e.pointerId!==

            this.pointerId

        ) return;

        this.active=false;

        this.pointerId=null;

        this.stick.style.left="30px";

        this.stick.style.top="30px";

        this.controller.setJoystick(

            0,

            0

        );

    }

    //=========================================================================
    // 更新
    //=========================================================================

    update(e){

        const rect=

            this.base.getBoundingClientRect();

        const cx=

            rect.left+

            rect.width/2;

        const cy=

            rect.top+

            rect.height/2;

        let dx=

            e.clientX-cx;

        let dy=

            e.clientY-cy;

        const len=

            Math.hypot(

                dx,

                dy

            );

        if(

            len>

            this.radius

        ){

            dx*=

                this.radius/

                len;

            dy*=

                this.radius/

                len;

        }

        this.stick.style.left=

            30+dx+"px";

        this.stick.style.top=

            30+dy+"px";

        this.controller.setJoystick(

            dx/

            this.radius,

            dy/

            this.radius

        );

    }

}
