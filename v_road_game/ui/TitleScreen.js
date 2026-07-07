// ui/TitleScreen.js

export class TitleScreen {

    constructor(game) {

        this.game = game;

        this.create();

    }

    create() {

        this.root = document.createElement("div");

        this.root.id = "title-screen";

        this.root.innerHTML = `

            <div id="title-logo">

                OFFROAD GAME

            </div>

            <button id="start-button">

                START

            </button>

        `;

        document.body.appendChild(this.root);

        document

            .getElementById("start-button")

            .addEventListener(

                "click",

                () => {

                    this.hide();

                    this.game.start();

                }

            );

    }

    hide() {

        this.root.style.opacity = "0";

        this.root.style.pointerEvents = "none";

        setTimeout(() => {

            this.root.remove();

        }, 500);

    }

}
