function displayRoomCode(codeId) {
    const codeElement = document.getElementById("roomCode");
    if (codeElement) {
        codeElement.textContent = `${codeId}`;
    }
}

export default { displayRoomCode };