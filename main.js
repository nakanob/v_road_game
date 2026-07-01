// main.js

import { SceneManager } from "./core/SceneManager.js";
import { GameLoop } from "./core/GameLoop.js";

window.addEventListener("DOMContentLoaded", () => {

    const sceneManager = new SceneManager("game");

    const gameLoop = new GameLoop(sceneManager);

    gameLoop.start();

    // デバッグ用（ブラウザコンソールからアクセス可能）
    window.sceneManager = sceneManager;
    window.gameLoop = gameLoop;

});
