import { io_client } from "./io_client.js";

function createRoom() {
    io_client.sendCreateRoom();
}
export default { createRoom };