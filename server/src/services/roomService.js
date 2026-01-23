const rooms = [];

export function createRoom() {
    const roomId = generateUniqueRoomId();
    rooms[roomId] = {
        players: [],
        gameSettings: initializeGameSettings()
    };
    return roomId;
}

export function joinRoom(roomId, player) {
    if (rooms[roomId]) {
        rooms[roomId].players.push(player);
        return true;
    }
    return false;
}

function generateUniqueRoomId() {
    return 'room-' + Date.now() + Math.random().toString(36);
}

function initializeGameSettings() {
    return {
        maxWords: 50,
        speed: 5,
        maxLength: 12,
        spawnRate: 2
    };
}

export function getRoom(roomId) {
    return rooms[roomId];
}
