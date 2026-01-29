// === LEADERBOARD MANAGEMENT ===

const LEADERBOARD_KEY = 'wordrain_leaderboard';
const MAX_ENTRIES = 10;

/**
 * Sauvegarde un score dans le leaderboard
 */
function saveToLeaderboard(playerName, score, time, wordsTyped, maxCombo) {
    const entry = {
        name: playerName,
        score: score,
        time: time,
        wordsTyped: wordsTyped,
        maxCombo: maxCombo,
        date: new Date().toISOString()
    };
    
    // Récupérer le leaderboard actuel
    let leaderboard = getLeaderboard();
    
    // Ajouter la nouvelle entrée
    leaderboard.push(entry);
    
    // Trier par score (décroissant)
    leaderboard.sort((a, b) => b.score - a.score);
    
    // Garder seulement les 10 meilleurs
    leaderboard = leaderboard.slice(0, MAX_ENTRIES);
    
    // Sauvegarder dans localStorage
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));
    
    // Mettre à jour l'affichage si on est sur la page menu
    if (document.getElementById('leaderboard-list')) {
        displayLeaderboard();
    }
    
    return leaderboard;
}

/**
 * Récupère le leaderboard depuis localStorage
 */
function getLeaderboard() {
    const stored = localStorage.getItem(LEADERBOARD_KEY);
    return stored ? JSON.parse(stored) : [];
}

/**
 * Affiche le leaderboard dans le DOM
 */
function displayLeaderboard() {
    const leaderboard = getLeaderboard();
    const container = document.getElementById('leaderboard-list');
    
    if (!container) return;
    
    // Vider le container
    container.innerHTML = '';
    
    if (leaderboard.length === 0) {
        container.innerHTML = '<div class="leaderboard-empty">Aucun score enregistré.<br>Soyez le premier !</div>';
        return;
    }
    
    // Créer les entrées
    leaderboard.forEach((entry, index) => {
        const rank = index + 1;
        const entryDiv = document.createElement('div');
        entryDiv.className = 'leaderboard-entry';
        
        // Ajouter classe spéciale pour top 3
        if (rank <= 3) {
            entryDiv.classList.add('top-3');
        }
        
        // Déterminer la classe du rang
        let rankClass = '';
        if (rank === 1) rankClass = 'gold';
        else if (rank === 2) rankClass = 'silver';
        else if (rank === 3) rankClass = 'bronze';
        
        // Formater la date
        const date = new Date(entry.date);
        const dateStr = date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
        
        entryDiv.innerHTML = `
            <div class="entry-rank ${rankClass}">${rank}</div>
            <div class="entry-info">
                <div class="entry-name">${escapeHtml(entry.name)}</div>
                <div class="entry-details">${entry.wordsTyped} mots • ${entry.time} • ${dateStr}</div>
            </div>
            <div class="entry-score">${entry.score}</div>
        `;
        
        container.appendChild(entryDiv);
    });
}

/**
 * Réinitialise le leaderboard (utile pour debug)
 */
function clearLeaderboard() {
    localStorage.removeItem(LEADERBOARD_KEY);
    if (document.getElementById('leaderboard-list')) {
        displayLeaderboard();
    }
}

/**
 * Échappe les caractères HTML pour éviter les injections
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Charger le leaderboard au chargement de la page
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', displayLeaderboard);
} else {
    displayLeaderboard();
}