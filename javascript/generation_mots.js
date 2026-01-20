var compteur = 0;
const wordToTypeList = [];

window.onload = function () {
    const words = fetch('../words.json').then(words => words.json());
    const maxLength = document.getElementById('longueur')
    const wordToTypeDiv = document.getElementById('liste_mots');
    
    const mot = document.getElementById('mot');
    var score = document.getElementById('points');
    mot.addEventListener('input', checkMot);
    genererateWords(words, maxLength,wordToTypeDiv);
    
}

async function genererateWords(wordsPromise, maxLength, div) {
    const maxMots = 10;

    const words = await wordsPromise;
    while (compteur < maxMots) {
        const randomWord = generateRandomWord(maxLength, words);
        wordToTypeList.push(randomWord);
        displayWords(div);
        console.log(wordToTypeList);
        await sleep(2000);
        compteur ++;
    }
}

function displayWords(div){
    div.textContent = "";
    wordToTypeList.forEach(mot => {
        div.textContent += " " + mot;
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function checkMot() {
    motDansTableau(mot.value);
}

function motDansTableau(mot) {
    if(wordToTypeList.includes(mot)){
        addScore(mot);
        const indexMot = wordToTypeList.indexOf(mot);
        wordToTypeList.splice(indexMot, 1);
        const wordToTypeDiv = document.getElementById('liste_mots');
        displayWords(wordToTypeDiv);
        console.log(wordToTypeList);
        const mot2 = document.getElementById('mot');
        mot2.value = "";
        compteur --;
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