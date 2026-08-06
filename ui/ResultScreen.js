// ============================================================================
// ui/ResultScreen.js
// Part 1
// V11
// ゴール結果画面
// ・到着タイム
// ・衝突回数
// ・平均速度
// ・称号
// ============================================================================

export default class ResultScreen{

    constructor(game){

        this.game = game;

        this.create();

    }

    //=========================================================================
    // 作成
    //=========================================================================

    create(){

        this.root =

            document.createElement(

                "div"

            );

        this.root.id =

            "resultScreen";

        this.root.style.cssText = `

position:fixed;
left:50%;
top:50%;
transform:translate(-50%,-50%);
width:520px;
max-width:92%;
background:rgba(20,20,20,.88);
backdrop-filter:blur(12px);
border-radius:18px;
padding:28px;
color:#fff;
display:none;
text-align:center;
z-index:99999;
box-shadow:0 0 40px rgba(0,0,0,.5);

`;

        this.title =

            document.createElement(

                "h1"

            );

        this.title.innerHTML=

            "GOAL";

        this.title.style.margin=

            "0 0 18px";

        this.root.appendChild(

            this.title

        );

        this.result =

            document.createElement(

                "div"

            );

        this.result.style.lineHeight=

            "2";

        this.result.style.fontSize=

            "22px";

        this.root.appendChild(

            this.result

        );

        //--------------------------------
        // ボタン
        //--------------------------------

        const btn=

            document.createElement(

                "button"

            );

        btn.innerHTML=

            "最初からプレイ";

        btn.style.cssText=`

margin-top:25px;
padding:14px 36px;
font-size:20px;
border:none;
border-radius:10px;
cursor:pointer;
background:#3b7cff;
color:white;

`;

        btn.onclick=()=>{

            this.hide();

            this.game.restart();

        };

        this.root.appendChild(

            btn

        );

        document.body.appendChild(

            this.root

        );

    }

    //=========================================================================
    // 表示
    //=========================================================================

    show(vehicle){

        const time=

            (

                vehicle.finishTime-

                vehicle.startTime

            )/1000;

        const speed=

            vehicle.totalDistance/

            time*

                3.6;

        const hit=

            vehicle.hitCount;

        let title=

            "期待のルーキー";

        if(

            hit===0 &&

            time<=120

        ){

            title=

            "パーフェクトヒューマン";

        }

        else if(

            hit<=9

        ){

            title=

            "キャンピングカーの達人";

        }

        else if(

            hit<=19

        ){

            title=

            "ベテランドライバー";

        }

        if(

            time<=120 &&

            hit>0

        ){

            title +=

            "<br>スピードキング";

        }

        this.result.innerHTML=`

<h2 style="font-size:34px;margin-bottom:10px;">
${title}
</h2>

<div>

到着タイム　
<b>${time.toFixed(1)} 秒</b>

</div>

<div>

衝突回数　
<b>${hit} 回</b>

</div>

<div>

平均速度　
<b>${speed.toFixed(1)} km/h</b>

</div>

`;

        this.root.style.display=

            "block";

    }

    //=========================================================================
    // 非表示
    //=========================================================================

    hide(){

        this.root.style.display=

            "none";

    }

}
