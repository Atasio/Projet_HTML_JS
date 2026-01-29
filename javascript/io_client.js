import { io } from "https://cdn.socket.io/4.8.1/socket.io.esm.min.js";
import gameWordHandler from "./gameWordHandler.js";
import { gameState } from "./gameState.js";

const socket = io("http://localhost:3000")

socket.on("connect", () => {
  console.log("Connected", socket.id)
})

socket.on("gameState", (data) => {
  console.log("Game state received", data);
  gameState.score = data.score;
  gameState.combo = data.combo;
  gameState.wordsTyped = data.wordsTyped;
  
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

socket.on("roomCreated", (room) => {
  console.log("Room created :", room);
  //window.location.href = `../multiplayer.html?codeId=${room.codeId}`;
});

function sendWordCompleted(wordId, typedWord) {
  socket.emit("wordCompleted", wordId, typedWord);
}

function sendStartGame() {
  console.log("Sending startGame");
  socket.emit("startGame");
}

function sendCreateRoom() {
  socket.emit("createRoom");
}

export const io_client = {
  sendWordCompleted,
  sendStartGame,
  sendCreateRoom,
};
