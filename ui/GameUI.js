export class GameUI {
  constructor(game, vehicle, world) {
    this.game = game;
    this.vehicle = vehicle;
    this.world = world;
    this.area = document.getElementById("area-name");
    this.time = document.getElementById("time-name");
    this.progress = document.getElementById("progress-bar");
    this.checkpoint = document.getElementById("checkpoint-text");
    this.speed = document.getElementById("speed-value");
    this.finish = document.getElementById("finish");
    this.finishTitle = document.getElementById("finish-title");
    this.finishExtra = document.getElementById("finish-extra");
    this.finishStats = document.getElementById("finish-stats");
    document.getElementById("reset-button").addEventListener("click", () => game.reset());
    this.lastArea = -1;
  }

  update() {
    const area = this.world.getArea(this.vehicle.progress);
    this.area.textContent = area.name;
    this.time.textContent = area.time;
    this.progress.style.width = `${Math.min(100, this.vehicle.progress * 100)}%`;
    this.speed.textContent = this.vehicle.speedKmh;

    if (area.id !== this.lastArea) {
      this.lastArea = area.id;
      this.checkpoint.textContent = area.id === 0 ? "START / CITY" : `CHECKPOINT ${area.id} / ${area.name.toUpperCase()}`;
      this.checkpoint.animate([
        { opacity: 0, transform: "translateY(-5px)" },
        { opacity: 1, transform: "translateY(0)" }
      ], { duration: 450 });
    }
  }

  showFinish(result) {
    this.finish.hidden = false;
    this.finishTitle.textContent = result.title;
    this.finishExtra.textContent = result.extraTitles.length ? `追加称号：${result.extraTitles.join(" / ")}` : "キャンプ場に到着しました";
    const minutes = Math.floor(result.seconds / 60);
    const seconds = Math.floor(result.seconds % 60).toString().padStart(2, "0");
    this.finishStats.innerHTML = [
      `<li><span>到着タイム</span><strong>${minutes}:${seconds}</strong></li>`,
      `<li><span>ぶつかった回数</span><strong>${result.collisions}回</strong></li>`,
      `<li><span>到着速度</span><strong>${result.arrivalSpeed} km/h</strong></li>`
    ].join("");
  }

  reset() {
    this.finish.hidden = true;
    this.lastArea = -1;
    this.finishExtra.textContent = "";
    this.finishStats.innerHTML = "";
  }
}
