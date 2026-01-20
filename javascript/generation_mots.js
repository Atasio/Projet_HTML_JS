window.onload = function () {
    const mot = document.getElementById('mot');

    mot.addEventListener('input', checkMot);
}

var mots = ['test', 'jouer','piscine'];

function checkMot() {
    console.log(mot.value);
    motDansTableau(mot.value);
}

function motDansTableau(mot) {
    if(mots.includes(mot)){
        console.log(mots);
        console.log('MOT TROUVE');
        var indexMot = mots.indexOf(mot);
        mots.splice(indexMot, 1);
        console.log(mots);    
    } else {
        console.log('MOT NON TROUVE');
    }
}