import { io } from "https://cdn.socket.io/4.8.1/socket.io.esm.min.js";
import gameWordHandler from "./gameWordHandler.js";
import { gameState } from "./gameState.js";
import { roomState } from "./roomState.js";
import { getUserId } from "./userIdentification.js";
import roomHandler from "./roomHandler.js"
import gameEngine from "./gameEngine.js";
import gameScoreHandler from "./gameScoreHandler.js";

const socket = io("http://localhost:3000",
  {
    reconnectionDelayMax: 10000,
    auth: {
      userId: getUserId()
  },
});

socket.on("connect", () => {
  console.log("Connected", socket.id)
})

socket.on("spawnWord", (word) => {
  //console.log("Spawn word received", word);
  gameWordHandler.spawnWord(word);
})

socket.on("playerUpdate", (data) => {
  console.log("Player update received", data);
  if (data.userId === getUserId()) {  
    gameScoreHandler.updateUi(data, gameState.maxWords, gameState.maxErrors);
  }
  
  // TODO: Afficher aussi les scores des autres joueurs si besoin
})

socket.on("gameSettings", (settings) => {
  console.log("Game settings received", settings);
  gameState.settings = settings;
})

socket.on("roomJoined", (room) => {
  log(`Joined room with codeId: ${room.codeId}`);
  console.log("Room data:", room);
  roomState.codeId = room.codeId;
  roomState.roomId = room.roomId;
  roomState.players = room.players;
  
  // Récupérer nos propres stats
  const myPlayer = room.players.find(p => p.userId === getUserId());
  if (myPlayer) {
    gameState.combo = myPlayer.combo;
    gameState.score = myPlayer.score;
    gameState.wordsTyped = myPlayer.wordsTyped;
    gameState.errors = myPlayer.errors;
  }
  
  gameState.maxWords = room.gameState.maxWords;
  gameState.maxErrors = room.gameState.maxErrors;
  gameState.isGameActive = room.gameState.isGameActive;
  gameState.settings = room.gameState.settings;
  roomHandler.displayRoomCode(room.codeId);
})

socket.on("roomInfo", (room) => {
  console.log("Room data:", room);
  roomState.codeId = room.codeId;
  roomState.roomId = room.roomId;
  roomState.players = room.players;
  
  gameState.maxWords = room.gameState.maxWords;
  gameState.maxErrors = room.gameState.maxErrors;
  gameState.isGameActive = room.gameState.isGameActive;
  gameState.settings = room.gameState.settings;

  roomHandler.displayRoomCode(room.codeId);
  gameScoreHandler.updateUi(room.players.find(p => p.userId === getUserId()), gameState.maxWords, gameState.maxErrors);
});

socket.on("GameStarted", () => {
  console.log("Game Started");
  gameState.isGameActive = true;
  gameState.gameStartTime = Date.now();
  gameEngine.startGame();
})

socket.on("gameEnded", (endGameData) => {
  console.log("Game ended received from server:", endGameData);
  gameState.isGameActive = false;
  
  // Mettre à jour les stats finales de notre joueur
  if (endGameData && endGameData.players) {
    const myPlayer = endGameData.players.find(p => p.userId === getUserId());
    if (myPlayer) {
      gameState.score = myPlayer.score;
      gameState.combo = myPlayer.combo;
      gameState.wordsTyped = myPlayer.wordsTyped;
      gameState.errors = myPlayer.errors;
    }
  }
  
  // Afficher l'écran de fin
  gameEngine.endGame();
})

socket.on("error", (error) => {
  console.error("Server error:", error);
  
  const errorMessage = error.message || "Une erreur est survenue";
  showErrorNotification(errorMessage);
})

function showErrorNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'error-notification';
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #ff6b6b;
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function log(message) {
  console.log(message);
}

function sendWordCompleted(wordId, typedWord) {
  socket.emit("wordCompleted", wordId, typedWord);
}

function sendWordMissed(wordId) {
  socket.emit("wordMissed", wordId);
}

function sendGameSettings(settings) {
  socket.emit("gameSettings", settings);
}

function sendStartGame() {
  console.log("Sending startGame");
  socket.emit("startGame");
}

function sendRestartGame() {
  console.log("Sending restartGame");
  socket.emit("restartGame");
}

function sendCreateRoom() {
  console.log("send : createRoom")
  socket.emit("createRoom");
}

function sendJoinRoom(roomId){
  console.log("Trying to join room : ", roomId)
  socket.emit("joinRoom", roomId)
}

export const io_client = {
  sendWordCompleted,
  sendWordMissed,
  sendStartGame,
  sendRestartGame,
  sendCreateRoom,
  sendGameSettings,
  sendJoinRoom
};