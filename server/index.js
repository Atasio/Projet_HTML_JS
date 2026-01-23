import express from 'express'
import { createServer } from 'http'
import { initIO } from './src/io.js'

const app = express()
const httpServer = createServer(app)

// Ici tu peux mettre des routes REST si besoin
app.get('/', (req, res) => res.send('Server OK'))

// Initialise Socket.io et injecte le serveur HTTP
initIO(httpServer)

httpServer.listen(3000, () => console.log('Server running on port 3000'))

