// ============================================================================
// vehicle/InputManager.js
// V11
// キーボード・ゲームパッド・仮想ジョイスティック統合
// ============================================================================

export default class InputManager{

    constructor(){

        this.throttle=0;
        this.steer=0;

        this.keys={};

        //--------------------------------

        window.addEventListener(

            "keydown",

            e=>{

                this.keys[e.code]=true;

            }

        );

        window.addEventListener(

            "keyup",

            e=>{

                this.keys[e.code]=false;

            }

        );

    }

    //=========================================================================
    // 仮想ジョイスティック
    //=========================================================================

    setJoystick(x,y){

        this.steer=x;

        this.throttle=-y;

    }

    //=========================================================================
    // 更新
    //=========================================================================

    update(){

        //--------------------------------
        // キーボード
        //--------------------------------

        if(

            this.keys["ArrowUp"]||

            this.keys["KeyW"]

        ){

            this.throttle=1;

        }

        else if(

            this.keys["ArrowDown"]||

            this.keys["KeyS"]

        ){

            this.throttle=-1;

        }

        //--------------------------------

        if(

            this.keys["ArrowLeft"]||

            this.keys["KeyA"]

        ){

            this.steer=-1;

        }

        else if(

            this.keys["ArrowRight"]||

            this.keys["KeyD"]

        ){

            this.steer=1;

        }

        //--------------------------------
        // GamePad
        //--------------------------------

        const pads=

            navigator.getGamepads?.();

        if(

            pads&&

            pads[0]

        ){

            const p=

                pads[0];

            if(

                Math.abs(

                    p.axes[0]

                )>.15

            ){

                this.steer=

                    p.axes[0];

            }

            if(

                Math.abs(

                    p.axes[1]

                )>.15

            ){

                this.throttle=

                    -p.axes[1];

            }

        }

    }

    //=========================================================================
    // リセット
    //=========================================================================

    reset(){

        this.throttle=0;

        this.steer=0;

    }

}
