import { Game } from "./core/Game.js";

window.addEventListener("DOMContentLoaded", async () => {
  const loading = document.getElementById("loading");

  const emergencyTimer = setTimeout(() => {
    if (!loading) return;
    loading.querySelector(".loading-text").textContent = "軽量モードで起動しています...";
    loading.style.opacity = "0";
    setTimeout(() => loading.remove(), 480);
  }, 12000);

  try {
    const game = new Game(document.getElementById("game"));
    await game.init();
    game.start();
    window.game = game;
  } catch (error) {
    console.error(error);
    if (loading) {
      loading.querySelector(".loading-text").textContent = "起動に失敗しました。ブラウザの再読み込みをお試しください。";
    }
  } finally {
    clearTimeout(emergencyTimer);
  }
});
