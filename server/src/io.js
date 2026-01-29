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
        room = createRoom(socket);
        socket.join(room.roomId);
        sendRoom(room);
      }
      gameService.startGame(room.roomId, room.gameState);
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
    socket.on('disconnect', () => {

      roomService.leaveRoom(socket.id);
      console.log('Player disconnected', socket.id)
    })

    socket.on('createRoom', () => {
      console.log('Creating room for', socket.id);
      const room = createRoom(socket.id);
      socket.join(room.roomId);
      sendRoom(room);


    })

    socket.on('joinRoom', (codeId) => {
      const success = roomService.joinRoom(codeId, socket.id);
      if (success) {
        const room = roomService.getRoomFromPlayer(socket.id);
        socket.join(room.roomId);
        io.to(room.roomId).emit('roomJoined', { room: room });
        console.log(`Player ${socket.id} joined room ${codeId}`);
      } else {
        socket.emit('error', 'Room not found');
        console.log(`Player ${socket.id} failed to join room ${codeId}`);
      }
    })
  })
}

function createRoom(socketId){
  return roomService.createRoom(socketId);

}

function sendRoom(room) {
  const roomClientData = roomService.mapToClientData(room);
  io.to(room.roomId).emit('roomCreated', roomClientData);
}

function sendSpawnWord(roomId, word) {
  console.log('Sending spawnWord:', word);
  io.to(roomId).emit('spawnWord', word)
}

function sendUpdateGameState(roomId, score, combo, wordsTyped) {
  console.log('Updating gameState:', { score, combo, wordsTyped });
  io.to(roomId).emit('updateGameState', score, combo, wordsTyped)
}

export default { initIO, sendSpawnWord, sendUpdateGameState }