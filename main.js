import { Game } from "./core/Game.js";

async function boot() {
  const loading = document.getElementById("loading");

  try {
    const game = new Game(document.getElementById("game"));
    await game.init();
    game.start();
    window.game = game;

    clearTimeout(window.__roadTripWatchdog);
  } catch (error) {
    console.error("ゲームの起動に失敗しました。", error);

    if (loading) {
      const text = loading.querySelector(".loading-text");
      if (text) {
        text.textContent = "起動に失敗しました。GitHubへ全ファイルを上書きしてください。";
      }
    }
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}
