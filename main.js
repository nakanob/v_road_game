import { Game } from "./core/Game.js";

window.addEventListener("DOMContentLoaded", async () => {
  const game = new Game(document.getElementById("game"));
  await game.init();
  game.start();
  window.game = game;
});
