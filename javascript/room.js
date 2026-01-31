import { io_client } from "./io_client";

window.addEventListener("load", async () => {
    document.getElementById("startGameButton").addEventListener("click", startGame)
});

function startGame(){
    io_client.sendEnterGame()
}