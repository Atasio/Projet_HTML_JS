import { io } from "https://cdn.socket.io/4.8.1/socket.io.esm.min.js";
import gameWordHandler from "./gameWordHandler.js";
import { gameState } from "./gameState.js";
import { roomState } from "./roomState.js";
import createRoom from "./createRoom.js";

const socket = io("http://localhost:3000")

socket.on("connect", () => {
  console.log("Connected", socket.id)
})

socket.on("gameState", (data) => {
  console.log("Game state received", data);
  gameState.score = data.score;
  gameState.combo = data.combo;
  gameState.wordsTyped = data.wordsTyped;
  gameState.errors = data.errors;
  gameState.gameStartTime = Date.now();
})

socket.on("spawnWord", (word) => {
  //console.log("Spawn word received", word);
  gameWordHandler.spawnWord(word);
})

socket.on("updateGameState", (score, combo, wordsTyped) => {
  console.log("Game state update received", { score, combo, wordsTyped });
  gameState.score = score;
  gameState.combo = combo;
  gameState.wordsTyped = wordsTyped;
})

socket.on("gameSettings", (settings) => {
  console.log("Game settings received", settings);
  gameState.settings = settings;
})

socket.on("roomCreated", (room) => {
  log(`Room created with codeId: ${room.codeId}`);
  console.log("Room data:", room);
  roomState.codeId = room.codeId;
  roomState.roomId = room.roomId;
  roomState.players = room.players;
  gameState.combo = room.gameState.combo;
  gameState.score = room.gameState.score;
  gameState.wordsTyped = room.gameState.wordsTyped;
  gameState.maxWords = room.gameState.maxWords;
  gameState.isGameActive = room.gameState.isGameActive;
  gameState.settings = room.gameState.settings;
  createRoom.displayRoomCode(room.codeId);
  //window.location.href = `../multiplayer.html?codeId=${room.codeId}`;
});

function log(message) {
  console.log(message);
}
function sendWordCompleted(wordId, typedWord) {
  socket.emit("wordCompleted", wordId, typedWord);
}

function sendGameSettings(settings) {
  socket.emit("gameSettings", settings);
}

function sendStartGame() {
  console.log("Sending startGame");
  socket.emit("startGame");
}

function sendCreateRoom() {
  console.log("send : createRoom")
  socket.emit("createRoom");
}

export const io_client = {
  sendWordCompleted,
  sendStartGame,
  sendCreateRoom,
  sendGameSettings,
};