import { Server } from 'socket.io'
import gameService from './services/gameService.js'
import roomService from './services/roomService.js'

let io

function initIO(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: '*' }
  })

  io.on('connection', (socket) => {
    console.log('Player connected', socket.id)

    socket.on('startGame', () => {
      let room = roomService.getRoomFromPlayer(socket.id);
      if (!room) {
        room = roomService.createRoom(socket.id);
      }
      gameService.startGame(room.gameState);
      console.log('Game started by', socket.id)
    })

    socket.on('wordCompleted', (wordId, typedWord) => {
      console.log("wordId received:", wordId, " typedWord:", typedWord);
      const room = roomService.getRoomFromPlayer(socket.id);
      if (room) {
        const gameState = room.gameState;
        gameService.handleWordMatch(gameState, wordId, typedWord);
      }
      else {
        console.log("No room found for player:", socket.id);
      }
    })
    socket.on('disconnect', () => console.log('Player disconnected', socket.id))

    socket.on('createRoom', () => {
      const room = roomService.createRoom(socket.id);
      console.log('Room created:', room);
      socket.emit('roomCreated', { room: room });
    })
  })
}

function sendSpawnWord(word) {
  console.log('Sending spawnWord:', word);
  io.emit('spawnWord', word)
}

function sendUpdateGameState(score, combo, wordsTyped) {
  console.log('Updating gameState:', { score, combo, wordsTyped });
  io.emit('updateGameState', score, combo, wordsTyped)
}

export default { initIO, sendSpawnWord, sendUpdateGameState }