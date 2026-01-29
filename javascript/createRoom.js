import { io_client } from "./io_client.js";
import { roomState } from "./roomState.js";

function createRoom() {
    io_client.sendCreateRoom();
}

function displayRoomCode(codeId) {
    const codeElement = document.getElementById("room-code");
    if (codeElement) {
        codeElement.textContent = `Room Code: ${codeId}`;
    }
}

window.addEventListener("load", async () => {
    createRoom();
});
export default { createRoom, displayRoomCode };