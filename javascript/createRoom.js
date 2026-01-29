import { io_client } from "./io_client.js";

function createRoom() {
    io_client.sendCreateRoom();
}

window.addEventListener("load", async () => {
    createRoom();
});
export default { createRoom };