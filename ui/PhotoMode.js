// ui/PhotoMode.js

export class PhotoMode {

    constructor(sceneManager) {

        this.sceneManager = sceneManager;

        this.enabled = false;

        this.hud = document.getElementById("hud");
        this.speedometer = document.getElementById("speedometer");
        this.minimap = document.getElementById("minimap");

        window.addEventListener(

            "keydown",

            (event) => {

                if (event.code === "F2") {

                    this.toggle();

                }

            }

        );

    }

    toggle() {

        this.enabled = !this.enabled;

        const display =

            this.enabled

                ? "none"

                : "";

        if (this.hud) {

            this.hud.style.display = display;

        }

        if (this.speedometer) {

            this.speedometer.style.display = display;

        }

        if (this.minimap) {

            this.minimap.style.display = display;

        }

    }

}
