// vehicle/InputManager.js

export class InputManager {

    constructor() {

        this.keys = {

            forward: false,
            backward: false,
            left: false,
            right: false,

            brake: false,

            shift: false

        };

        this.initialize();

    }

    initialize() {

        window.addEventListener(

            "keydown",

            this.onKeyDown.bind(this)

        );

        window.addEventListener(

            "keyup",

            this.onKeyUp.bind(this)

        );

    }

    onKeyDown(event) {

        switch (event.code) {

            case "KeyW":
            case "ArrowUp":

                event.preventDefault();
                this.keys.forward = true;
                break;

            case "KeyS":
            case "ArrowDown":

                event.preventDefault();
                this.keys.backward = true;
                break;

            case "KeyA":
            case "ArrowLeft":

                event.preventDefault();
                this.keys.left = true;
                break;

            case "KeyD":
            case "ArrowRight":

                event.preventDefault();
                this.keys.right = true;
                break;

            case "Space":

                event.preventDefault();
                this.keys.brake = true;
                break;

            case "ShiftLeft":
            case "ShiftRight":

                this.keys.shift = true;
                break;

        }

    }

    onKeyUp(event) {

        switch (event.code) {

            case "KeyW":
            case "ArrowUp":

                this.keys.forward = false;
                break;

            case "KeyS":
            case "ArrowDown":

                this.keys.backward = false;
                break;

            case "KeyA":
            case "ArrowLeft":

                this.keys.left = false;
                break;

            case "KeyD":
            case "ArrowRight":

                this.keys.right = false;
                break;

            case "Space":

                this.keys.brake = false;
                break;

            case "ShiftLeft":
            case "ShiftRight":

                this.keys.shift = false;
                break;

        }

    }

    reset() {

        for (const key in this.keys) {

            this.keys[key] = false;

        }

    }

}
