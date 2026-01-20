window.onload = function () {
    const mot = document.getElementById('mot');
    var score = document.getElementById('points');
    mot.addEventListener('input', checkMot);
}

var mots = ['test', 'jouer','piscine'];

function checkMot() {
    motDansTableau(mot.value);
}

function motDansTableau(mot) {
    if(mots.includes(mot)){
        addScore(mot);
        var indexMot = mots.indexOf(mot);
        mots.splice(indexMot, 1);
        console.log(mots);
    } else {
    }
}

function addScore(mot){
    var score = document.getElementById('points');
    var longueur = mot.length;
    var scoreMot = 3*longueur;
    scoreValue = score.textContent;
    console.log('Score mot : ' + scoreMot);
    scoreValue = parseInt(scoreValue.split('Points : ')[1]);
    total = scoreValue + scoreMot;
    score.textContent = 'Points : ' + total;
}