// ============================================================================
// ui/HUD.js
// Part 1
// V11
// ゲームHUD
// ・ローディング
// ・フェード
// ・エリア表示
// ・ゴール通知
// ============================================================================

export default class HUD{

    constructor(game){

        this.game = game;

        this.currentArea = "";

        this.messageTimer = 0;

        this.build();

    }

    //=========================================================================
    // UI生成
    //=========================================================================

    build(){

        //--------------------------------
        // エリア表示
        //--------------------------------

        this.area = document.createElement("div");

        this.area.style.cssText = `

position:fixed;
left:50%;
top:25px;
transform:translateX(-50%);
padding:12px 28px;
background:rgba(0,0,0,.45);
color:white;
font-size:24px;
border-radius:12px;
opacity:0;
transition:.8s;
pointer-events:none;
z-index:9999;

`;

        document.body.appendChild(

            this.area

        );

        //--------------------------------
        // フェード
        //--------------------------------

        this.fade = document.createElement("div");

        this.fade.style.cssText = `

position:fixed;
left:0;
top:0;
width:100%;
height:100%;
background:black;
pointer-events:none;
opacity:0;
transition:2s;
z-index:9998;

`;

        document.body.appendChild(

            this.fade

        );

    }

    //=========================================================================
    // エリア切替
    //=========================================================================

    changeArea(name){

        if(

            this.currentArea===name

        ) return;

        this.currentArea=name;

        const text={

            town:"街",

            field:"草原",

            mountain:"山",

            camp:"キャンプ場"

        };

        this.area.innerHTML=

            text[name];

        this.area.style.opacity=1;

        this.messageTimer=3;

        //--------------------------------
        // フェード
        //--------------------------------

        this.fade.style.opacity=.35;

        setTimeout(()=>{

            this.fade.style.opacity=0;

        },500);

    }

    //=========================================================================
    // 更新
    //=========================================================================

    update(delta){

        if(

            this.messageTimer>0

        ){

            this.messageTimer-=delta;

            if(

                this.messageTimer<=0

            ){

                this.area.style.opacity=0;

            }

        }

    }

}
