// ui/LapHUD.js

export class LapHUD {

    constructor(sceneManager) {

        this.sceneManager = sceneManager;

        this.checkpointManager =
            sceneManager.checkpointManager;

        this.root = document.createElement("div");

        this.root.id = "lap-hud";
        this.lastText = "";
        this.elapsed = 0;

        document.body.appendChild(this.root);

        this.update();

    }

    update(delta = 1) {

        this.elapsed += delta;

        if (this.elapsed < 0.1) {
            return;
        }

        this.elapsed = 0;

        const current = Math.min(

            this.checkpointManager.currentCheckpoint + 1,

            this.checkpointManager.checkpoints.length

        );

        const total =

            this.checkpointManager.checkpoints.length;

        const checkpoint =
            this.checkpointManager.checkpoints[
                this.checkpointManager.currentCheckpoint
            ];

        const distance = checkpoint
            ? Math.round(
                checkpoint.position.distanceTo(
                    this.sceneManager.vehicle.position
                )
            )
            : 0;

        const text = `CHECKPOINT ${current} / ${total} - ${distance}m`;

        if (text !== this.lastText) {

            this.root.textContent = text;
            this.lastText = text;

        }

    }

}
