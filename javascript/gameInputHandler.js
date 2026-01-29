import gameWordHandler from "./gameWordHandler.js"; 

function handleInputChange(inputElement, inputValue, gameState) {
        const typedWord = inputValue.trimStart().toLowerCase();
        console.log(typedWord);
        if (typedWord === '') return;
        
        // Check if word matches any falling word
        const matchedWord = gameState.fallingWords.find(
            word => word.text.toLowerCase() === typedWord
        );

        if (matchedWord) {
            // Word matched!
            console.log("Matched word:", matchedWord);
            gameWordHandler.handleWordMatch(matchedWord);
            inputElement.value = '';
        }
    }

export default { handleInputChange };