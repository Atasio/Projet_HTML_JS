import { io } from "https://cdn.socket.io/4.8.1/socket.io.esm.min.js";
import gameWordHandler from "./gameWordHandler.js";
import { gameState } from "./gameState.js";

const socket = io("http://localhost:3000")

socket.on("connect", () => {
  console.log("Connected", socket.id)
})

socket.on("gameState", (data) => {
  console.log("Game state received", data);
  gameState = data;
})

socket.on("spawnWord", (word) => {
  console.log("Spawn word received", word);
  gameWordHandler.spawnWord(word);
})

socket.on("updateGameState", (score, combo, wordsTyped) => {
  console.log("Game state update received", { score, combo, wordsTyped });
  gameState.score = score;
  gameState.combo = combo;
  gameState.wordsTyped = wordsTyped;
})

function sendWordCompleted(word) {
  socket.emit("wordCompleted", { word: word });
}

function sendStartGame() {
  socket.emit("startGame");
}

export const io_client = {
  sendWordCompleted,
  sendStartGame,
};
