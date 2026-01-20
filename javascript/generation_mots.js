window.onload = function () {
    const words = fetch('../words.json').then(words => words.json());
    const maxLength = document.getElementById('longueur')
    const wordToType = document.getElementById('liste_mots');
    
    const mot = document.getElementById('mot');
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

function checkMot() {
    console.log(mot.value);
}

function generateRandomWord(maxLength, words) {
    const filteredWords = words.filter(word => word.length <= maxLength.value);
    const randomIndex = Math.floor(Math.random() * filteredWords.length);
    return filteredWords[randomIndex];

}