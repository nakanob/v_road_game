// weather/WeatherManager.js

export class WeatherManager {

    constructor(sceneManager) {

        this.sceneManager = sceneManager;

        this.rain = sceneManager.rain;
        this.snow = sceneManager.snow;
        this.fog = sceneManager.fog;

        this.mode = "clear";

        window.addEventListener(

            "keydown",

            (event) => {

                if (event.repeat) return;

                switch (event.code) {

                    case "Digit1":

                        this.setWeather("clear");

                        break;

                    case "Digit2":

                        this.setWeather("rain");

                        break;

                    case "Digit3":

                        this.setWeather("snow");

                        break;

                    case "Digit4":

                        this.setWeather("fog");

                        break;

                }

            }

        );

    }

    setWeather(mode) {

        this.mode = mode;

        this.rain.enabled = false;
        this.rain.points.visible = false;

        this.snow.enabled = false;
        this.snow.points.visible = false;

        this.fog.enabled = false;
        this.fog.scene.fog.near = 10000;
        this.fog.scene.fog.far = 10001;

        switch (mode) {

            case "rain":

                this.rain.enabled = true;
                this.rain.points.visible = true;
                break;

            case "snow":

                this.snow.enabled = true;
                this.snow.points.visible = true;
                break;

            case "fog":

                this.fog.enabled = true;
                this.fog.scene.fog.near = 250;
                this.fog.scene.fog.far = 900;
                break;

        }

    }

}
