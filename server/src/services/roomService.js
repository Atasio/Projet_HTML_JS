import gameService from './gameService.js';
const rooms = [];

function createRoom(socketId) {
    const roomId = generateUniqueRoomId();
    const codeId = generateUniqueCodeId();
    const playerState = {
        score: 0,
        combo: 1,
        wordsTyped: 0,
        errors: 0
    };
    const room = {
        roomId: roomId,
        codeId: codeId,
        gameState: gameService.createGameState(),
        players: new Map([[socketId, playerState]]),
    };
    rooms[roomId] = room;
    return room;
}

function getRoomByCodeId(codeId){
   const room = Object.values(rooms)
  .find(r => r.codeId === codeId)
  return room
}

function getPlayerFromRoom(room, userID) {
    return room.players.get(userID);
}

function joinRoom(codeId, userID) {
    const room = getRoomByCodeId(codeId)
    if (room) {
        room.players.set(userID, {
            score: 0,
            combo: 1,
            wordsTyped: 0,
            errors: 0
        });
        return true;
    }
    return false;
}

function leaveRoom(userID) {
    console.log(rooms)
    const room = getRoomFromPlayer(userID);
    if (room) {
        room.players.delete(userID);
        console.log(`Player ${userID} left room ${room.codeId}`);
        // Si la room est vide, on la supprime
        if (room.players.size === 0) {
            clearInterval(room.gameState.spawnInterval);
            delete rooms[room.roomId];
            console.log(`Room ${room.codeId} deleted because it is empty`);
        }
    }
}

function mapToClientData(room) {
    // Convertir la Map en Array pour l'envoyer au client
    const playersArray = Array.from(room.players.entries()).map(([userId, playerData]) => ({
        userId,
        score: playerData.score,
        combo: playerData.combo,
        wordsTyped: playerData.wordsTyped,
        errors: playerData.errors
    }));

    return {
        roomId: room.roomId,
        codeId: room.codeId,
        players: playersArray,
        gameState: {
            maxWords: room.gameState.maxWords,
            maxErrors: room.gameState.maxErrors,
            gameStartTime: room.gameState.gameStartTime,
            isGameActive: room.gameState.isGameActive,
            settings: room.gameState.settings
        }
    };
}

function generateUniqueRoomId() {
    return 'room-' + Date.now() + Math.random().toString(36);
}

function generateUniqueCodeId() {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

function initializeGameSettings() {
    return {
        maxWords: 50,
        speed: 5,
        maxLength: 12,
        spawnRate: 2
    };
}

function getRoomId(roomId) {
    return rooms[roomId];
}

function getRoomCodeId(roomId) {
    return rooms[roomId] ? rooms[roomId].codeId : null;
}

function getRoomFromPlayer(userID) {
    for (const roomId in rooms) {
        if (rooms[roomId].players.has(userID)) {
            return rooms[roomId];
        }
    }
    return null;
}

export default {
    createRoom,
    joinRoom,
    leaveRoom,
    getRoomId,
    getRoomCodeId,
    getPlayerFromRoom,
    getRoomFromPlayer,
    mapToClientData,
};
