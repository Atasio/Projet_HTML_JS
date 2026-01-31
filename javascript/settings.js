import { io_client } from "./io_client.js";

// === SETTINGS MANAGEMENT ===

const SETTINGS_KEY = 'wordrain_settings';

// Paramètres par défaut
const DEFAULT_SETTINGS = {
    speed: 5,
    maxLength: 12,
    spawnRate: 2
};

// Charger les paramètres sauvegardés ou utiliser les valeurs par défaut
let currentSettings = loadSettings();

// === INITIALIZATION ===
window.addEventListener('DOMContentLoaded', function() {
    initSettingsPanel();
    applySettings();
});

/**
 * Initialise le panneau de paramètres
 */
function initSettingsPanel() {
    const toggleBtn = document.getElementById('toggle-settings');
    const settingsContent = document.getElementById('settings-content');
    const resetBtn = document.getElementById('reset-settings-btn');
    
    if (!toggleBtn || !settingsContent) return;
    
    // Toggle du panneau
    toggleBtn.addEventListener('click', () => {
        settingsContent.classList.toggle('hidden');
    });
    
    // Sliders avec mise à jour en temps réel
    const speedSlider = document.getElementById('speed');
    const maxLengthSlider = document.getElementById('max-length');
    const spawnRateSlider = document.getElementById('spawn-rate');
    
    if (speedSlider) {
        speedSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            currentSettings.speed = value;
            document.getElementById('speed-value').textContent = value;
            saveSettings();
        });
    }
    
    if (maxLengthSlider) {
        maxLengthSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            currentSettings.maxLength = value;
            document.getElementById('max-length-value').textContent = value;
            saveSettings();
        });
    }
    
    if (spawnRateSlider) {
        spawnRateSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            currentSettings.spawnRate = value;
            document.getElementById('spawn-rate-value').textContent = value;
            saveSettings();
        });
    }
    
    // Bouton reset
    if (resetBtn) {
        resetBtn.addEventListener('click', resetSettings);
    }
}

/**
 * Applique les paramètres sauvegardés aux sliders
 */
function applySettings() {
    const speedSlider = document.getElementById('speed');
    const maxLengthSlider = document.getElementById('max-length');
    const spawnRateSlider = document.getElementById('spawn-rate');
    
    if (speedSlider) {
        speedSlider.value = currentSettings.speed;
        document.getElementById('speed-value').textContent = currentSettings.speed;
    }
    
    if (maxLengthSlider) {
        maxLengthSlider.value = currentSettings.maxLength;
        document.getElementById('max-length-value').textContent = currentSettings.maxLength;
    }
    
    if (spawnRateSlider) {
        spawnRateSlider.value = currentSettings.spawnRate;
        document.getElementById('spawn-rate-value').textContent = currentSettings.spawnRate;
    }
}

/**
 * Charge les paramètres depuis localStorage
 */
function loadSettings() {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error('Erreur lors du chargement des paramètres:', e);
            return { ...DEFAULT_SETTINGS };
        }
    }
    return { ...DEFAULT_SETTINGS };
}

/**
 * Sauvegarde les paramètres dans localStorage
 */
function saveSettings() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(currentSettings));
    console.log('Paramètres sauvegardés:', currentSettings);
}

/**
 * Récupère les paramètres actuels
 */
function getSettings() {
    return { ...currentSettings };
}

/**
 * Réinitialise les paramètres aux valeurs par défaut
 */
function resetSettings() {
    currentSettings = { ...DEFAULT_SETTINGS };
    saveSettings();
    applySettings();
    
    // Feedback visuel
    const resetBtn = document.getElementById('reset-settings-btn');
    const originalText = resetBtn.textContent;
    resetBtn.textContent = '✅ Réinitialisé !';
    setTimeout(() => {
        resetBtn.textContent = originalText;
    }, 1500);
}

/**
 * Envoie les paramètres au serveur (à adapter selon votre backend)
 */
function sendSettingsToServer() {
    const settings = getSettings();
    io_client.sendGameSettings(settings);
}

export default { getSettings, sendSettingsToServer };