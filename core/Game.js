// core/Game.js

import { SceneManager } from "./SceneManager.js";
import { GameLoop } from "./GameLoop.js";
import { TitleScreen } from "../ui/TitleScreen.js";
import { PauseMenu } from "../ui/PauseMenu.js";


export class Game {

    constructor() {

        this.sceneManager = new SceneManager();

        this.gameLoop = new GameLoop(

            this.sceneManager

        );

        this.titleScreen =

            new TitleScreen(this);

    }

    start() {

        this.gameLoop.start();

    }

}
