// ============================================================================
// main.js
// Part 1
// V11
// エントリーポイント
// ============================================================================

import * as THREE from "three";

import Game from "./Game.js";

let renderer;
let scene;
let camera;
let game;

//=============================================================================
// 初期化
//=============================================================================

async function initialize(){

    //--------------------------------
    // Renderer
    //--------------------------------

    renderer=

        new THREE.WebGLRenderer({

            antialias:true,

            powerPreference:

                "high-performance"

        });

    renderer.setPixelRatio(

        Math.min(

            window.devicePixelRatio,

            1.5

        )

    );

    renderer.setSize(

        window.innerWidth,

        window.innerHeight

    );

    renderer.shadowMap.enabled=true;

    renderer.shadowMap.type=

        THREE.PCFSoftShadowMap;

    document.body.appendChild(

        renderer.domElement

    );

    //--------------------------------
    // Scene
    //--------------------------------

    scene=

        new THREE.Scene();

    scene.background=

        new THREE.Color(

            0x8fd4ff

        );

    //--------------------------------
    // Camera
    //--------------------------------

    camera=

        new THREE.PerspectiveCamera(

            60,

            window.innerWidth/

            window.innerHeight,

            .1,

            1000

        );

    //--------------------------------
    // Game
    //--------------------------------

    game=

        new Game(

            renderer,

            scene,

            camera

        );

    //--------------------------------
    // Loading
    //--------------------------------

    showLoading();

    await game.initialize();

    hideLoading();

    //--------------------------------

    animate();

}

//=============================================================================
// Animation
//=============================================================================

function animate(){

    requestAnimationFrame(

        animate

    );

    game.update();

    renderer.render(

        scene,

        camera

    );

}

//=============================================================================
// Loading
//=============================================================================

function showLoading(){

    const div=

        document.createElement(

            "div"

        );

    div.id="loading";

    div.innerHTML=`

<div class="loading">

<h1>

車両とコースを準備中...

</h1>

<p>

Loading...

</p>

</div>

`;

    document.body.appendChild(

        div

    );

}

function hideLoading(){

    document

    .getElementById(

        "loading"

    )?.remove();

}

//=============================================================================
// Resize
//=============================================================================

window.addEventListener(

    "resize",

    ()=>{

        camera.aspect=

            window.innerWidth/

            window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(

            window.innerWidth,

            window.innerHeight

        );

    }

);

//=============================================================================

initialize();
