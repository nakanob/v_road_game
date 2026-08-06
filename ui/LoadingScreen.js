// ============================================================================
// ui/LoadingScreen.js
// Part 1
// V11
// 高速ローディング画面（20秒以内想定）
// ============================================================================

export default class LoadingScreen{

    constructor(){

        this.progress = 0;

        this.build();

    }

    //=========================================================================
    // UI
    //=========================================================================

    build(){

        this.root=document.createElement("div");

        this.root.style.cssText=`

position:fixed;
left:0;
top:0;
width:100%;
height:100%;
background:#111;
display:flex;
justify-content:center;
align-items:center;
flex-direction:column;
z-index:999999;

`;

        //--------------------------------

        this.title=document.createElement("div");

        this.title.innerHTML=

        "車両とコースを準備中";

        this.title.style.cssText=`

font-size:38px;
color:white;
margin-bottom:35px;

`;

        this.root.appendChild(

            this.title

        );

        //--------------------------------

        this.barBack=

            document.createElement(

                "div"

            );

        this.barBack.style.cssText=`

width:420px;
max-width:85%;
height:18px;
border-radius:10px;
background:#333;
overflow:hidden;

`;

        //--------------------------------

        this.bar=

            document.createElement(

                "div"

            );

        this.bar.style.cssText=`

width:0%;
height:100%;
background:linear-gradient(
90deg,
#4ea5ff,
#7fd0ff
);
transition:.15s;

`;

        this.barBack.appendChild(

            this.bar

        );

        this.root.appendChild(

            this.barBack

        );

        //--------------------------------

        this.text=

            document.createElement(

                "div"

            );

        this.text.style.cssText=`

margin-top:18px;
font-size:18px;
color:#ddd;

`;

        this.root.appendChild(

            this.text

        );

        document.body.appendChild(

            this.root

        );

    }

    //=========================================================================
    // Progress
    //=========================================================================

    setProgress(value,message=""){

        this.progress=value;

        this.bar.style.width=

            value+"%";

        this.text.innerHTML=

            message+

            " ("+

            Math.floor(value)+

            "%)";

    }

    //=========================================================================
    // Close
    //=========================================================================

    close(){

        this.root.style.transition=

            ".6s";

        this.root.style.opacity=0;

        setTimeout(()=>{

            this.root.remove();

        },600);

    }

}
// ============================================================================
// ui/LoadingManager.js
// Part 2
// V11
// 読み込み管理
// ============================================================================

import LoadingScreen from "./LoadingScreen.js";

export default class LoadingManager{

    constructor(){

        this.screen =

            new LoadingScreen();

        this.total = 0;

        this.loaded = 0;

    }

    //=========================================================================
    // 登録
    //=========================================================================

    add(count=1){

        this.total += count;

    }

    //=========================================================================
    // 完了
    //=========================================================================

    complete(message=""){

        this.loaded++;

        const percent =

            Math.min(

                100,

                this.loaded/

                this.total*100

            );

        this.screen.setProgress(

            percent,

            message

        );

    }

    //=========================================================================
    // 閉じる
    //=========================================================================

    finish(){

        this.screen.setProgress(

            100,

            "完了"

        );

        setTimeout(()=>{

            this.screen.close();

        },250);

    }

}
