window.onload = function () {
    const mot = document.getElementById('mot');

    mot.addEventListener('input', checkMot);
    console.log("dqzdqzdq");
}

function checkMot() {
    console.log(mot.value);
}