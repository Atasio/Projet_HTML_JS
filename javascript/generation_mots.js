window.onload = function () {
    const words = fetch('../words.json').then(words => words.json());
    const maxLength = document.getElementById('longueur')
    const wordToType = document.getElementById('liste_mots');
    
    const mot = document.getElementById('mot');
    var score = document.getElementById('points');
    mot.addEventListener('input', checkMot);
    genererateWords(words, maxLength, wordToType);
}

async function genererateWords(wordsPromise, maxLength, wordListToAdd) {
    const words = await wordsPromise;
    while (true) {
        const randomWord = generateRandomWord(maxLength, words);
        wordListToAdd.textContent += " " + randomWord;
        await sleep(2000);
        console.log(wordListToAdd);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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

function generateRandomWord(maxLength, words) {
    const filteredWords = words.filter(word => word.length <= maxLength.value);
    const randomIndex = Math.floor(Math.random() * filteredWords.length);
    return filteredWords[randomIndex];

}

function generateRandomWord(maxLength, words) {
    const filteredWords = words.filter(word => word.length <= maxLength.value);
    const randomIndex = Math.floor(Math.random() * filteredWords.length);
    return filteredWords[randomIndex];

}