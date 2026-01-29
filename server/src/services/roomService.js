import { gameService } from './gameService.js';

const rooms = [];

const roomState = {
    gameState: null,
    roomId: null,
    codeId: null,
    players: []
};

export function createRoom(socketId) {
    const roomId = generateUniqueRoomId(); // On génère un room id unique mais ce n'est pas le code
    const codeId = generateUniqueCodeId(); // Code à 10 chiffres pour rejoindre la room
    rooms[roomId] = {
        codeId: codeId,
        players: [socketId],
        gameSettings: initializeGameSettings()
    };
    roomState.gameState;
    roomState.roomId = roomId;
    roomState.codeId = codeId;
    roomState.players = [socketId];
    return roomState;
}

export function joinRoom(codeId, socketId) {
    if (rooms[codeId]) {
        rooms[codeId].players.push(socketId);
        return true;
    }
    return false;
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

function initializeGameState(){
    return {

    }
}

export function getRoomId(roomId) {
    return rooms[roomId];
}

export function getRoomCodeId(roomId) {
    return rooms[roomId] ? rooms[roomId].codeId : null;
}
