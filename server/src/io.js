import { Server } from 'socket.io'
import gameService from './services/gameService.js'
import roomService from './services/roomService.js'

let io

function initIO(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: '*' }
  })

  io.use((socket, next) => {
    try {
      const userId = socket.handshake.auth.userId;
      if (!userId) {
        return next(new Error("Invalid userId"));
      }
      socket.userId = userId;
      next();
    } catch (error) {
      console.error("Auth middleware error:", error);
      next(new Error("Authentication error"));
    }
  });

  io.on('connection', (socket) => {
    try {
      console.log('Player connected', socket.userId, 'with userId:', socket.userId)
      const room = roomService.getRoomFromPlayer(socket.userId)
      if (room) {
        console.log("Player ", socket.userId, " connected back to ", room.roomId)
        socket.join(room.roomId)
        sendRoom(room)
      }

      socket.on('startGame', () => {
        try {
          let room = roomService.getRoomFromPlayer(socket.userId);
          if (!room) {
            room = createRoom(socket.userId);
            socket.join(room.roomId);
            sendRoom(room);
          }
          gameService.startGame(room.roomId, room.gameState);
          console.log('Game started by', socket.userId)
          io.to(room.roomId).emit('GameStarted');
        } catch (error) {
          console.error('Error in startGame:', error);
          socket.emit('error', { message: 'Error starting game', details: error.message });
        }
      })
      socket.on('restartGame', () => {
        try {
          let room = roomService.getRoomFromPlayer(socket.userId);
          if (!room) {
            room = createRoom(socket.userId);
            socket.join(room.roomId);
            sendRoom(room);
          }
          gameService.restartGame(room);
          console.log('Game restarted by', socket.userId)
          io.to(room.roomId).emit('GameStarted');
          sendRoom(room);
        } catch (error) {
          console.error('Error in restartGame:', error);
          socket.emit('error', { message: 'Error restarting game', details: error.message });
        }
      })
      socket.on('wordCompleted', (wordId, typedWord) => {
        try {
          console.log("wordId received:", wordId, " typedWord:", typedWord);
          const room = roomService.getRoomFromPlayer(socket.userId);
          
          if (!room) {
            console.error("No room found for player:", socket.userId);
            socket.emit('error', { message: 'Room not found' });
            return;
          }

          const playerState = room.players.get(socket.userId);
          if (!playerState) {
            console.error("Player state not found for:", socket.userId);
            return;
          }

          const result = gameService.handleWordMatch(playerState, wordId, typedWord, room.gameState.fallingWords);
          
          // Envoyer la mise à jour du state de CE joueur
          sendPlayerUpdate(room.roomId, socket.userId, playerState);
          
          // Vérifier si le jeu doit se terminer pour ce joueur
          if (result && result.shouldEndGame) {
            gameService.endGame(room.roomId, room.gameState, room.players);
          }
        } catch (error) {
          console.error('Error in wordCompleted:', error);
          socket.emit('error', { message: 'Error processing word', details: error.message });
        }
      })

      socket.on('wordMissed', (wordId) => {
        try {
          const room = roomService.getRoomFromPlayer(socket.userId);
          
          if (!room) {
            console.error("No room found for player:", socket.userId);
            return;
          }

          const playerState = room.players.get(socket.userId);
          if (!playerState) {
            console.error("Player state not found for:", socket.userId);
            return;
          }

          const result = gameService.handleWordMissed(playerState, wordId, room.gameState.fallingWords);
          
          // Envoyer la mise à jour du state de CE joueur
          sendPlayerUpdate(room.roomId, socket.userId, playerState);
          
          // Vérifier si le jeu doit se terminer pour ce joueur
          if (result && result.shouldEndGame) {
            gameService.endGame(room.roomId, room.gameState, room.players);
          }
        } catch (error) {
          console.error('Error in wordMissed:', error);
          socket.emit('error', { message: 'Error processing missed word', details: error.message });
        }
      })

      socket.on('disconnect', () => {
        try {
          setTimeout(() => {
            if (!roomService.getRoomFromPlayer(socket.userId)) {
              roomService.leaveRoom(socket.userId);
              console.log("Player leaved the room")
            }
          }, 5000)
          console.log('Player disconnected', socket.userId)
        } catch (error) {
          console.error('Error in disconnect:', error);
        }
      })

      socket.on('createRoom', () => {
        try {
          console.log('Creating room for', socket.userId);
          const room = createRoom(socket.userId);
          socket.join(room.roomId);
          sendRoom(room);
        } catch (error) {
          console.error('Error in createRoom:', error);
          socket.emit('error', { message: 'Error creating room', details: error.message });
        }
      })

      socket.on('gameSettings', (settings) => {
        try {
          const room = roomService.getRoomFromPlayer(socket.userId);
          if (room) {
            room.gameState.settings = settings;
            io.to(room.roomId).emit('gameSettings', settings);
          } else {
            socket.emit('error', { message: 'Room not found' });
          }
        } catch (error) {
          console.error('Error in gameSettings:', error);
          socket.emit('error', { message: 'Error updating settings', details: error.message });
        }
      });

      socket.on('endGame', () => {
        console.log("endGame received from ", socket.userId)
        try {
          const room = roomService.getRoomFromPlayer(socket.userId);
          if (room) {
            gameService.endGame(room.roomId, room.gameState, room.players);
          } else {
            socket.emit('error', { message: 'Room not found' });
          }
        } catch (error) {
          console.error('Error in endGame:', error);
          socket.emit('error', { message: 'Error ending game', details: error.message });
        }
      });

      socket.on('joinRoom', (codeId) => {
        try {
          console.log("Join room attempt from : ", socket.userId, " to room : ", codeId)
          const success = roomService.joinRoom(codeId, socket.userId);
          if (success) {
            const room = roomService.getRoomFromPlayer(socket.userId);
            socket.join(room.roomId);
            socket.emit('roomJoined', room);
            sendRoom(room);
            console.log(`Player ${socket.userId} joined room ${codeId}`);
          } else {
            socket.emit('error', { message: 'Room not found' });
            console.log(`Player ${socket.userId} failed to join room ${codeId}`);
          }
        } catch (error) {
          console.error('Error in joinRoom:', error);
          socket.emit('error', { message: 'Error joining room', details: error.message });
        }
      })
    } catch (error) {
      console.error('Connection error:', error);
    }
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

function sendPlayerUpdate(roomId, userId, playerState) {
  console.log('Updating player state:', { userId, playerState });
  // Envoyer à tous les joueurs de la room (pour afficher les scores des autres)
  io.to(roomId).emit('playerUpdate', {
    userId,
    score: playerState.score,
    combo: playerState.combo,
    wordsTyped: playerState.wordsTyped,
    errors: playerState.errors
  });
}

function sendGameEnded(roomId, endGameData) {
  console.log('Sending gameEnded:', endGameData);
  io.to(roomId).emit('gameEnded', endGameData);
}

export default { initIO, sendSpawnWord, sendPlayerUpdate, sendGameEnded }