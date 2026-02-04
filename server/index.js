import express from 'express'
import { createServer } from 'http'
import io from './src/io.js'

const app = express()
const httpServer = createServer(app)

app.get('/', (req, res) => res.send('Server OK'))

// Initialise Socket.io et injecte le serveur HTTP
io.initIO(httpServer)

httpServer.listen(31091, () => console.log('Server running on port 31091'))

