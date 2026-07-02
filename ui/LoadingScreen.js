// ui/LoadingScreen.js

export class LoadingScreen {

    constructor() {

        this.root = document.createElement("div");

        this.root.id = "loading-screen";

        this.root.innerHTML = `

            <div id="loading-title">

                OFFROAD GAME

            </div>

            <div id="loading-text">

                Loading...

            </div>

            <div id="loading-bar">

                <div id="loading-progress"></div>

            </div>

        `;

        document.body.appendChild(this.root);

        this.progress = document.getElementById(

            "loading-progress"

        );

    }

    setProgress(percent) {

        this.progress.style.width =

            percent + "%";

    }

    hide() {

        this.root.style.opacity = "0";

        setTimeout(() => {

            this.root.remove();

        }, 600);

    }

}
