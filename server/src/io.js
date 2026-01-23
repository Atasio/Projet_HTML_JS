import { Server } from 'socket.io'
import { spawnWord } from './services/gameService.js'

let io

export function initIO(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: '*' }
  })

  io.on('connection', (socket) => {
    console.log('Player connected', socket.id)

    socket.on('wordCompleted', (data) => handleWordMatch(socket.id, data, io))


    socket.on('disconnect', () => console.log('Player disconnected', socket.id))
  })
}

function notify(roomId, event, data) {
  io.to(roomId).emit(event, data)
}