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

    socket.on('wordCompleted', (data) => gameService.handleWordMatch(socket.id, data, io))

    socket.on('startGame', () => {
      gameService.startGame();
      console.log('Game started by', socket.id)
    })

    socket.on('disconnect', () => console.log('Player disconnected', socket.id))

    socket.on('createRoom', () => {
      const codeId = roomService.createRoom(socket.id);
      console.log('Room created with codeId:', codeId);
      socket.emit('roomCreated', { codeId: codeId });
    })
  })
}

function sendSpawnWord(word) {
  console.log('Sending spawnWord:', word);
  io.emit('spawnWord', word)
}

function sendUpdateGameState(score, combo, wordsTyped) {
  console.log('Updating gameState:', { score, combo, wordsTyped });
  io.emit('updateGameState', { score, combo, wordsTyped })
}

export default { initIO, sendSpawnWord, sendUpdateGameState }