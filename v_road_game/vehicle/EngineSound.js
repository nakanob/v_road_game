// vehicle/EngineSound.js

export class EngineSound {

    constructor(vehicle) {

        this.vehicle = vehicle;

        this.audio = null;

        this.context = null;

        this.gainNode = null;

        this.oscillator = null;

        this.started = false;

        this.initialize();

    }

    initialize() {

        window.addEventListener(

            "pointerdown",

            () => {

                if (this.started) return;

                this.context = new AudioContext();

                this.oscillator =

                    this.context.createOscillator();

                this.gainNode =

                    this.context.createGain();

                this.oscillator.type = "sawtooth";

                this.oscillator.frequency.value = 40;

                this.gainNode.gain.value = 0.03;

                this.oscillator.connect(

                    this.gainNode

                );

                this.gainNode.connect(

                    this.context.destination

                );

                this.oscillator.start();

                this.started = true;

            },

            {

                once: true

            }

        );

    }

    update() {

        if (!this.started) return;

        const speed = Math.abs(

            this.vehicle.speed

        );

        this.oscillator.frequency.value =

            40 +

            speed * 5;

        this.gainNode.gain.value =

            0.02 +

            speed * 0.0015;

    }

}
