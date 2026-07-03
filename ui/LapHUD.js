// ui/LapHUD.js

export class LapHUD {

    constructor(sceneManager) {

        this.sceneManager = sceneManager;

        this.checkpointManager =
            sceneManager.checkpointManager;

        this.root = document.createElement("div");

        this.root.id = "lap-hud";

        document.body.appendChild(this.root);

        this.update();

    }

    update() {

        const current = Math.min(

            this.checkpointManager.currentCheckpoint + 1,

            this.checkpointManager.checkpoints.length

        );

        const total =

            this.checkpointManager.checkpoints.length;

        this.root.innerHTML = `

            CHECKPOINT

            <br>

            ${current} / ${total}

        `;

    }

}
