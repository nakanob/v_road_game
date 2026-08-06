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

// ============================================================================
// ui/HUD.js
// Part 2
// V11
// ゴール演出・称号表示・リザルト呼び出し
// ============================================================================

//=========================================================================
// ゴール
//=========================================================================

showGoal(){

    this.goal = document.createElement("div");

    this.goal.style.cssText=`

position:fixed;
left:50%;
top:45%;
transform:translate(-50%,-50%);
padding:30px 60px;
background:rgba(0,0,0,.65);
color:white;
font-size:46px;
border-radius:20px;
opacity:0;
transition:.8s;
z-index:99999;
pointer-events:none;

`;

    this.goal.innerHTML=`

<div style="font-size:52px;font-weight:bold;">
GOAL！
</div>

<div style="margin-top:18px;font-size:24px;">
キャンプ場に到着しました
</div>

`;

    document.body.appendChild(

        this.goal

    );

    requestAnimationFrame(()=>{

        this.goal.style.opacity=1;

    });

}

//=========================================================================
// ゴール終了
//=========================================================================

hideGoal(){

    if(!this.goal) return;

    this.goal.style.opacity=0;

    setTimeout(()=>{

        this.goal.remove();

        this.goal=null;

    },700);

}

//=========================================================================
// リザルト
//=========================================================================

showResult(vehicle){

    if(!this.resultScreen){

        return;

    }

    this.hideGoal();

    this.resultScreen.show(

        vehicle

    );

}

//=========================================================================
// セット
//=========================================================================

setResultScreen(result){

    this.resultScreen=result;

}

//=========================================================================
// リセット
//=========================================================================

hideResult(){

    this.hideGoal();

    this.resultScreen?.hide();

}

//=========================================================================
// update()最後へ追加
//=========================================================================

if(

    this.game.vehicle.goal &&

    !this.goalShown

){

    this.goalShown=true;

    this.showGoal();

    setTimeout(()=>{

        this.showResult(

            this.game.vehicle

        );

    },2200);

}

if(

    !this.game.vehicle.goal

){

    this.goalShown=false;

}

//=========================================================================
// エリア名更新
//=========================================================================

if(

    this.currentArea!==

    this.game.environment.currentArea

){

    this.changeArea(

        this.game.environment.currentArea

    );

}
