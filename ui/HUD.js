// ============================================================================
// ui/HUD.js
// Part 1
// ゴール結果画面
// ============================================================================

createResultScreen() {

    this.resultScreen =
        document.createElement("div");

    this.resultScreen.id =
        "resultScreen";

    Object.assign(

        this.resultScreen.style,

        {

            position:
                "fixed",

            inset:
                "0",

            display:
                "none",

            alignItems:
                "center",

            justifyContent:
                "center",

            padding:
                "24px",

            boxSizing:
                "border-box",

            background:
                "rgba(0, 0, 0, 0.72)",

            backdropFilter:
                "blur(8px)",

            zIndex:
                "100000",

            fontFamily:
                "Arial, Helvetica, sans-serif"

        }

    );

    const panel =
        document.createElement("div");

    panel.id =
        "resultPanel";

    Object.assign(

        panel.style,

        {

            width:
                "min(520px, 100%)",

            padding:
                "36px 28px 30px",

            boxSizing:
                "border-box",

            borderRadius:
                "18px",

            background:
                "rgba(20, 24, 30, 0.96)",

            border:
                "1px solid rgba(255, 255, 255, 0.18)",

            boxShadow:
                "0 24px 80px rgba(0, 0, 0, 0.55)",

            color:
                "#ffffff",

            textAlign:
                "center"

        }

    );

    this.resultTitle =
        document.createElement("div");

    Object.assign(

        this.resultTitle.style,

        {

            marginBottom:
                "26px",

            fontSize:
                "clamp(38px, 9vw, 68px)",

            fontWeight:
                "800",

            letterSpacing:
                "0.08em",

            lineHeight:
                "1",

            textShadow:
                "0 0 24px rgba(255, 255, 255, 0.25)"

        }

    );

    this.resultTitle.textContent =
        "GOAL";

    this.resultRows =
        document.createElement("div");

    Object.assign(

        this.resultRows.style,

        {

            display:
                "grid",

            gap:
                "12px",

            marginBottom:
                "28px"

        }

    );

    this.resultTimeRow =
        this.createResultRow(

            "ARRIVAL TIME",

            "00:00.00"

        );

    this.resultCollisionRow =
        this.createResultRow(

            "COLLISIONS",

            "0"

        );

    this.resultSpeedRow =
        this.createResultRow(

            "ARRIVAL SPEED",

            "0 km/h"

        );

    this.resultRows.append(

        this.resultTimeRow.element,

        this.resultCollisionRow.element,

        this.resultSpeedRow.element

    );

    this.retryButton =
        document.createElement("button");

    this.retryButton.type =
        "button";

    this.retryButton.textContent =
        "RETRY";

    Object.assign(

        this.retryButton.style,

        {

            width:
                "100%",

            minHeight:
                "54px",

            border:
                "0",

            borderRadius:
                "12px",

            background:
                "#ffffff",

            color:
                "#111111",

            fontSize:
                "18px",

            fontWeight:
                "700",

            letterSpacing:
                "0.08em",

            cursor:
                "pointer",

            touchAction:
                "manipulation"

        }

    );

    this.retryButton.addEventListener(

        "pointerdown",

        event => {

            event.stopPropagation();

        }

    );

    this.retryButton.addEventListener(

        "click",

        () => {

            this.hideResult();

            if (
                this.game?.restart
            ) {

                this.game.restart();

                return;

            }

            if (
                this.game?.vehicle?.reset
            ) {

                this.game.vehicle.reset();

            }

        }

    );

    panel.append(

        this.resultTitle,

        this.resultRows,

        this.retryButton

    );

    this.resultScreen.appendChild(
        panel
    );

    document.body.appendChild(
        this.resultScreen
    );

}


// ============================================================================
// 結果表示の1行
// ============================================================================

createResultRow(

    label,

    initialValue

) {

    const element =
        document.createElement("div");

    Object.assign(

        element.style,

        {

            display:
                "grid",

            gridTemplateColumns:
                "minmax(0, 1fr) auto",

            alignItems:
                "center",

            gap:
                "18px",

            padding:
                "14px 16px",

            borderRadius:
                "10px",

            background:
                "rgba(255, 255, 255, 0.07)",

            border:
                "1px solid rgba(255, 255, 255, 0.08)",

            textAlign:
                "left"

        }

    );

    const labelElement =
        document.createElement("span");

    labelElement.textContent =
        label;

    Object.assign(

        labelElement.style,

        {

            color:
                "rgba(255, 255, 255, 0.68)",

            fontSize:
                "13px",

            fontWeight:
                "700",

            letterSpacing:
                "0.08em"

        }

    );

    const valueElement =
        document.createElement("span");

    valueElement.textContent =
        initialValue;

    Object.assign(

        valueElement.style,

        {

            color:
                "#ffffff",

            fontSize:
                "20px",

            fontWeight:
                "700",

            whiteSpace:
                "nowrap"

        }

    );

    element.append(

        labelElement,

        valueElement

    );

    return {

        element,

        value:
            valueElement

    };

}


// ============================================================================
// 結果画面表示
// ============================================================================

showFinish(result = {}) {

    if (
        !this.resultScreen
    ) {

        this.createResultScreen();

    }

    this.resultTitle.textContent =

        result.title ||

        "GOAL";

    this.resultTimeRow.value.textContent =

        result.arrivalTime ||

        "00:00.00";

    this.resultCollisionRow.value.textContent =

        String(

            result.collisionCount ?? 0

        );

    this.resultSpeedRow.value.textContent =

        `${Math.round(

            result.arrivalSpeed ?? 0

        )} km/h`;

    this.resultScreen.style.display =
        "flex";

    document.body.style.overflow =
        "hidden";

    if (
        this.game?.vehicle?.input
    ) {

        this.game.vehicle.input
            .resetVirtualJoystick?.();

        this.game.vehicle.input
            .setEnabled?.(false);

    }

}


// ============================================================================
// 結果画面を閉じる
// ============================================================================

hideResult() {

    if (
        !this.resultScreen
    ) {

        return;

    }

    this.resultScreen.style.display =
        "none";

    document.body.style.overflow =
        "";

    if (
        this.game?.vehicle?.input
    ) {

        this.game.vehicle.input
            .setEnabled?.(true);

    }

}


// ============================================================================
// HUD破棄
// ============================================================================

disposeResultScreen() {

    if (
        !this.resultScreen
    ) {

        return;

    }

    this.resultScreen.remove();

    this.resultScreen =
        null;

    this.resultTitle =
        null;

    this.resultRows =
        null;

    this.resultTimeRow =
        null;

    this.resultCollisionRow =
        null;

    this.resultSpeedRow =
        null;

    this.retryButton =
        null;

}


// ============================================================================
// HUD constructor() の最後に追加
// ============================================================================

this.resultScreen = null;

this.resultTitle = null;

this.resultRows = null;

this.resultTimeRow = null;

this.resultCollisionRow = null;

this.resultSpeedRow = null;

this.retryButton = null;

this.createResultScreen();

// ============================================================================
// ui/HUD.js
// Part 2
// スピードメーター・衝突回数・タイマー
// 軽量版（DOM更新のみ）
// ============================================================================

createGameHUD() {

    this.gameHUD =
        document.createElement("div");

    this.gameHUD.id =
        "gameHUD";

    Object.assign(

        this.gameHUD.style,

        {

            position:"fixed",

            top:"18px",

            left:"18px",

            zIndex:9999,

            color:"#fff",

            fontFamily:"Arial",

            textShadow:"0 2px 5px rgba(0,0,0,.6)",

            userSelect:"none",

            pointerEvents:"none"

        }

    );

    //----------------------------------
    // SPEED
    //----------------------------------

    this.speedText =
        document.createElement("div");

    this.speedText.style.fontSize =
        "42px";

    this.speedText.style.fontWeight =
        "700";

    this.speedText.innerHTML =
        "0 <span style='font-size:18px'>km/h</span>";

    //----------------------------------
    // TIMER
    //----------------------------------

    this.timerText =
        document.createElement("div");

    this.timerText.style.marginTop =
        "12px";

    this.timerText.style.fontSize =
        "22px";

    this.timerText.innerHTML =
        "TIME 00:00.00";

    //----------------------------------
    // HIT
    //----------------------------------

    this.hitText =
        document.createElement("div");

    this.hitText.style.marginTop =
        "8px";

    this.hitText.style.fontSize =
        "22px";

    this.hitText.innerHTML =
        "HIT 0";

    this.gameHUD.appendChild(

        this.speedText

    );

    this.gameHUD.appendChild(

        this.timerText

    );

    this.gameHUD.appendChild(

        this.hitText

    );

    document.body.appendChild(

        this.gameHUD

    );

}

// ============================================================================
// 更新
// 毎フレーム呼び出し
// ============================================================================

updateHUD(vehicle){

    if(
        !vehicle
    ) return;

    //----------------------------------
    // SPEED
    //----------------------------------

    const kmh =

        Math.round(

            vehicle.speedKmh

        );

    this.speedText.innerHTML =

        kmh +

        " <span style='font-size:18px'>km/h</span>";

    //----------------------------------
    // TIME
    //----------------------------------

    const t =

        vehicle.elapsedTime;

    const min =

        Math.floor(

            t/60

        );

    const sec =

        Math.floor(

            t%60

        );

    const ms =

        Math.floor(

            (t-Math.floor(t))*100

        );

    this.timerText.innerHTML =

        "TIME " +

        String(min).padStart(2,"0") +

        ":" +

        String(sec).padStart(2,"0") +

        "." +

        String(ms).padStart(2,"0");

    //----------------------------------
    // HIT
    //----------------------------------

    this.hitText.innerHTML =

        "HIT " +

        vehicle.collisionCount;

}

// ============================================================================
// GameLoopから毎フレーム呼ぶ
// ============================================================================

update(delta){

    if(

        this.game &&

        this.game.vehicle

    ){

        this.updateHUD(

            this.game.vehicle

        );

    }

}

// ============================================================================
// constructor最後
// ============================================================================

this.createGameHUD();
