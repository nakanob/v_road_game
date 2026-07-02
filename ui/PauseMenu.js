// ui/PauseMenu.js

export class PauseMenu {

    constructor(gameLoop) {

        this.gameLoop = gameLoop;

        this.visible = false;

        this.create();

        window.addEventListener(

            "keydown",

            (event) => {

                if (event.code === "Escape") {

                    this.toggle();

                }

            }

        );

    }

    create() {

        this.root = document.createElement("div");

        this.root.id = "pause-menu";

        this.root.innerHTML = `

            <div id="pause-title">

                PAUSED

            </div>

            <button id="resume-button">

                Resume

            </button>

        `;

        document.body.appendChild(this.root);

        document

            .getElementById(

                "resume-button"

            )

            .addEventListener(

                "click",

                () => {

                    this.toggle();

                }

            );

        this.root.style.display = "none";

    }

    toggle() {

        this.visible = !this.visible;

        if (this.visible) {

            this.root.style.display = "flex";

            this.gameLoop.pause();

        }

        else {

            this.root.style.display = "none";

            this.gameLoop.resume();

        }

    }

}
