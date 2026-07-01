// ui/HUD.js

export class HUD {

    constructor(sceneManager, vehicle) {

        this.sceneManager = sceneManager;
        this.vehicle = vehicle;

        this.root = document.createElement("div");

        this.root.id = "hud";

        this.root.innerHTML = `

            <div id="hud-panel">

                <div id="speed">0 km/h</div>

                <div id="position">X:0 Z:0</div>

                <div id="fps">FPS:0</div>

            </div>

        `;

        document.body.appendChild(this.root);

        this.speedElement =
            document.getElementById("speed");

        this.positionElement =
            document.getElementById("position");

        this.fpsElement =
            document.getElementById("fps");

        this.frameCount = 0;

        this.elapsed = 0;

        this.fps = 0;

    }

    update(delta) {

        this.speedElement.textContent =

            `Speed : ${Math.round(
                Math.abs(this.vehicle.speed) * 3.6
            )} km/h`;

        this.positionElement.textContent =

            `X : ${this.vehicle.position.x.toFixed(1)}
             Z : ${this.vehicle.position.z.toFixed(1)}`;

        this.frameCount++;

        this.elapsed += delta;

        if (this.elapsed >= 1) {

            this.fps = this.frameCount;

            this.frameCount = 0;

            this.elapsed = 0;

            this.fpsElement.textContent =

                `FPS : ${this.fps}`;

        }

    }

}
