export class GameLoop {

    constructor(sceneManager) {

        this.sceneManager = sceneManager;

        this.running = false;

        this.animationId = null;

        this.animate = this.animate.bind(this);

    }

    start() {

        if (this.running) return;

        this.running = true;

        this.sceneManager.clock.start();

        this.animate();

    }
    stop() {

        this.running = false;

        if (this.animationId !== null) {

            cancelAnimationFrame(this.animationId);

            this.animationId = null;

        }

    }
    pause() {

        this.running = false;

    }
    resume() {

        if (this.running) return;

        this.running = true;

        this.clock.getDelta();

        this.animate();

    }
    animate() {

        if (!this.running) return;

        this.animationId = requestAnimationFrame(this.animate);

        this.sceneManager.update();

        this.sceneManager.render();

    }

}
