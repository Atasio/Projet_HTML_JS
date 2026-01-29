import { gameState } from '../model/gameState.js';
import gameService from './gameService.js';

const rooms = [];

function createRoom(socketId) {
    const roomId = generateUniqueRoomId(); // On génère un room id unique mais ce n'est pas le code
    const codeId = generateUniqueCodeId(); // Code à 10 chiffres pour rejoindre la room
    const room = {
        roomId: roomId,
        codeId: codeId,
        gameState: gameService.createGameState(),
        players: [socketId],
    };
    rooms[roomId] = room;
    return room;
}

function joinRoom(codeId, socketId) {
    if (rooms[codeId]) {
        rooms[codeId].players.push(socketId);
        return true;
    }
    return false;
}

function leaveRoom(socketId) {
    const room = getRoomFromPlayer(socketId);
    if (room) {
        room.players = room.players.filter(id => id !== socketId);
        // Si la room est vide, on la supprime
        if (room.players.length === 0) {
            clearInterval(room.gameState.spawnInterval);
            delete rooms[room.roomId];
        }
    }
}

function mapToClientData(room) {
    return {
        roomId: room.roomId,
        codeId: room.codeId,
        players: room.players.length,
        gameState: {
            score: room.gameState.score,
            combo: room.gameState.combo,
            wordsTyped: room.gameState.wordsTyped,
            maxWords: room.gameState.maxWords,
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

function getRoomFromPlayer(socketId) {
    for (const roomId in rooms) {
        if (rooms[roomId].players.includes(socketId)) {
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
    getRoomFromPlayer,
    mapToClientData,
};
