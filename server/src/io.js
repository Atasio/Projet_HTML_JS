import { Server } from 'socket.io'
import gameService from './services/gameService.js'
import roomService from './services/roomService.js'


let io

function initIO(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: '*' }
  })

  io.use((socket, next) => {
    const userId = socket.handshake.auth.userId;
    if (!userId) {
      return next(new Error("Invalid userId"));
    }
    socket.userId = userId;
    next();
  });

  io.on('connection', (socket) => {
    console.log('Player connected', socket.userId, 'with userId:', socket.userId)
    const room = roomService.getRoomFromPlayer(socket.userId)
    if (room) {
      console.log("Player ", socket.userId, " connected back to ", room.roomId)
      socket.join(room.roomId)

      sendRoom(room)
    }

    socket.on('startGame', () => {
      let room = roomService.getRoomFromPlayer(socket.userId);
      if (!room) {
        room = createRoom(socket.userId);
        socket.join(room.roomId);
        sendRoom(room);
      }
      gameService.startGame(room.roomId, room.gameState);
      console.log('Game started by', socket.userId)
      io.to(room.roomId).emit('GameStarted');
    })

    socket.on('wordCompleted', (wordId, typedWord) => {
      console.log("wordId received:", wordId, " typedWord:", typedWord);
      const room = roomService.getRoomFromPlayer(socket.userId);
      if (room) {
        const gameState = room.gameState;
        gameService.handleWordMatch(gameState, wordId, typedWord);
      }
      else {
        console.log("No room found for player:", socket.userId);
      }
    })
    socket.on('disconnect', () => {
      setTimeout(() => {
        if (!roomService.getRoomFromPlayer(socket.userId))
        {
          roomService.leaveRoom(socket.userId);
          console.log("Player leaved the room")
        }
      }, 5000
    )
      console.log('Player disconnected', socket.userId)
    })

    socket.on('createRoom', () => {
      console.log('Creating room for', socket.userId);
      const room = createRoom(socket.userId);
      socket.join(room.roomId);
      sendRoom(room);
    })

    socket.on('gameSettings', (settings) => {
      const room = roomService.getRoomFromPlayer(socket.id);
      if (room) {
        room.gameState.settings = settings;
        io.to(room.roomId).emit('gameSettings', settings);
      }
    });

    socket.on('joinRoom', (codeId) => {
      console.log("Join room attempt from : ", socket.userId, " to room : ", codeId)
      const success = roomService.joinRoom(codeId, socket.userId);
      if (success) {
        const room = roomService.getRoomFromPlayer(socket.userId);
        socket.join(room.roomId);
        socket.emit('roomJoined', room);
        sendRoom(room);
        console.log(`Player ${socket.userId} joined room ${codeId}`);
      } else {
        socket.emit('error', 'Room not found');
        console.log(`Player ${socket.userId} failed to join room ${codeId}`);
      }
    })
  })
}

function createRoom(userId){
  return roomService.createRoom(userId);

}

function sendRoom(room) {
  const roomClientData = roomService.mapToClientData(room);
  io.to(room.roomId).emit('roomInfo', roomClientData);
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