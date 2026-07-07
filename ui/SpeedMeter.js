// ui/SpeedMeter.js

export class SpeedMeter {

    constructor(sceneManager, vehicle) {

        this.sceneManager = sceneManager;
        this.vehicle = vehicle;

        this.container = document.createElement("div");
        this.container.id = "speedometer";

        this.value = document.createElement("div");
        this.value.id = "speedometer-value";

        this.unit = document.createElement("div");
        this.unit.id = "speedometer-unit";

        this.value.textContent = "0";
        this.unit.textContent = "km/h";

        this.container.appendChild(this.value);
        this.container.appendChild(this.unit);

        document.body.appendChild(this.container);
        this.elapsed = 0;

    }

    update(delta) {

        this.elapsed += delta;

        if (this.elapsed < 0.08) {
            return;
        }

        this.elapsed = 0;

        const speed = Math.abs(
            this.vehicle.speed * 3.6
        );

        this.value.textContent =
            Math.round(speed);

    }

}
