import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"

const app = express()
const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: "*"
  }
})

io.on("connection", (socket) => {
  console.log("Player connected", socket.id)

  socket.on("disconnect", () => {
    console.log("Player disconnected", socket.id)
  })
})

httpServer.listen(3000, () => {
  console.log("Server running on port 3000")
})
