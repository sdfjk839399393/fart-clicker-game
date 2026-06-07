// NCS Playlist - Direct audio URLs for classic NCS tracks
const NCS_PLAYLIST = [
    // My Heart - Different Heaven & EH!DE
    { title: "My Heart", artist: "Different Heaven & EH!DE", url: "https://assets.mixkit.co/music/preview/mixcat-1452.mp3" },
    // Let's Go! - Lensko
    { title: "Let's Go!", artist: "Lensko", url: "https://assets.mixkit.co/music/preview/mixcat-1161.mp3" },
    // Fade - Alan Walker
    { title: "Fade", artist: "Alan Walker", url: "https://assets.mixkit.co/music/preview/mixcat-1162.mp3" },
    // On & On - Cartoon
    { title: "On & On", artist: "Cartoon", url: "https://assets.mixkit.co/music/preview/mixcat-1160.mp3" },
    // Invincible - DEAF KEV
    { title: "Invincible", artist: "DEAF KEV", url: "https://assets.mixkit.co/music/preview/mixcat-1164.mp3" },
    // Heroes Tonight - Janji
    { title: "Heroes Tonight", artist: "Janji", url: "https://assets.mixkit.co/music/preview/mixcat-1165.mp3" },
    // Symbolism - Electro-Light
    { title: "Symbolism", artist: "Electro-Light", url: "https://assets.mixkit.co/music/preview/mixcat-1163.mp3" },
    // Blank - Disfigure
    { title: "Blank", artist: "Disfigure", url: "https://assets.mixkit.co/music/preview/mixcat-1166.mp3" }
];

// Roblox-style satisfying sound effects - direct URLs
const SOUNDS = {
    click: "https://assets.mixkit.co/sfx/preview/mixcat-266.mp3",  // Crisp button click
    upgrade: "https://assets.mixkit.co/sfx/preview/mixcat-202.mp3", // Level up sound
    purchase: "https://assets.mixkit.co/sfx/preview/mixcat-265.mp3", // Purchase success
    critical: "https://assets.mixkit.co/sfx/preview/mixcat-268.mp3", // Power up sound
    eggOpen: "https://assets.mixkit.co/sfx/preview/mixcat-200.mp3",  // Item obtain sound
    equip: "https://assets.mixkit.co/sfx/preview/mixcat-203.mp3"     // Equip item sound
};

// Background music player state
let audioContext = null;
let bgmAudio = null;
let bgmAudio2 = null;
let currentTrackIndex = 0;
let isBGMPlaying = false;
let currentBGMVolume = 0.3;

// Initialize audio context on first interaction
function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
}

// Load and play background music with crossfade
function playBackgroundMusic(trackIndex = 0) {
    if (!audioContext) initAudio();
    
    currentTrackIndex = trackIndex;
    const track = NCS_PLAYLIST[trackIndex];
    
    // Create two audio elements for smooth crossfade transitions
    if (!bgmAudio) {
        bgmAudio = new Audio();
        bgmAudio.loop = true;
    }
    bgmAudio.src = track.url;
    bgmAudio.volume = 0;
    bgmAudio.play().catch(e => console.log("Autoplay prevented:", e));
    
    // Fade in
    let fadeIn = 0;
    const fadeInInterval = setInterval(() => {
        fadeIn += 0.05;
        bgmAudio.volume = Math.min(fadeIn, currentBGMVolume);
        if (fadeIn >= 1) clearInterval(fadeInInterval);
    }, 50);
    
    // Set up for next track transition
    setTimeout(() => {
        setupTrackTransition(trackIndex);
    }, (bgmAudio.duration || 200) * 1000); // Approximate duration fallback
}

// Setup smooth crossfade between tracks
function setupTrackTransition(currentIndex) {
    if (!isBGMPlaying || NCS_PLAYLIST.length < 2) return;
    
    const nextIndex = (currentIndex + 1) % NCS_PLAYLIST.length;
    const nextTrack = NCS_PLAYLIST[nextIndex];
    
    if (!bgmAudio2) {
        bgmAudio2 = new Audio();
        bgmAudio2.loop = true;
    }
    
    bgmAudio2.src = nextTrack.url;
    bgmAudio2.volume = 0;
    bgmAudio2.play().catch(() => {});
    
    // Fade out current track
    let fadeOut = 1;
    const fadeOutInterval = setInterval(() => {
        fadeOut -= 0.02;
        if (bgmAudio) bgmAudio.volume = Math.max(fadeOut * currentBGMVolume, 0);
        if (fadeOut <= 0) {
            clearInterval(fadeOutInterval);
            // Swap audio elements
            const temp = bgmAudio;
            bgmAudio = bgmAudio2;
            bgmAudio2 = temp;
            
            // Start fade in for new track
            let fadeIn = 0;
            const fadeInInterval = setInterval(() => {
                fadeIn += 0.02;
                bgmAudio.volume = Math.min(fadeIn * currentBGMVolume, currentBGMVolume);
                if (fadeIn >= 1) {
                    clearInterval(fadeInInterval);
                    // Schedule next transition
                    setupTrackTransition(nextIndex);
                }
            }, 50);
        }
    }, 50);
}

// Play sound effect
function playSoundEffect(soundKey) {
    if (!SOUNDS[soundKey]) return;
    
    const sound = new Audio(SOUNDS[soundKey]);
    sound.volume = 0.4; // Roblox-style moderate volume
    
    sound.play().catch(() => {
        // If audio context isn't running, try to resume it
        initAudio();
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume().then(() => {
                sound.play();
            });
        }
    });
    
    // Clean up after playback
    setTimeout(() => {
        sound.remove();
    }, 5000);
}

// Toggle BGM on/off
function toggleBGM() {
    isBGMPlaying = !isBGMPlaying;
    
    if (isBGMPlaying) {
        playBackgroundMusic();
    } else {
        if (bgmAudio) {
            bgmAudio.pause();
            bgmAudio.currentTime = 0;
        }
        if (bgmAudio2) {
            bgmAudio2.pause();
            bgmAudio2.currentTime = 0;
        }
    }
    
    game.bgmEnabled = isBGMPlaying;
    saveGame();
}

// Set BGM volume
function setBGMVolume(volume) {
    currentBGMVolume = Math.max(0, Math.min(1, volume));
    game.bgmVolume = currentBGMVolume;
    
    if (bgmAudio) bgmAudio.volume = isBGMPlaying ? currentBGMVolume : 0;
    if (bgmAudio2) bgmAudio2.volume = isBGMPlaying ? currentBGMVolume : 0;
    
    saveGame();
}

// Initialize on page load
window.addEventListener('load', () => {
    // Load saved BGM state
    const savedBGM = localStorage.getItem('fartSave');
    if (savedBGM) {
        try {
            const savedGame = JSON.parse(savedBGM);
            if (savedGame.bgmEnabled !== undefined) {
                game.bgmEnabled = savedGame.bgmEnabled;
                game.bgmVolume = savedGame.bgmVolume !== undefined ? savedGame.bgmVolume : 0.3;
            }
        } catch (e) {
            console.error("Failed to load saved BGM state");
        }
    }
    
    // Start BGM if enabled
    if (game.bgmEnabled && game.bgmVolume > 0) {
        isBGMPlaying = true;
        currentBGMVolume = game.bgmVolume;
    }
});

// Play sounds for game events
const createClickSound = () => {
    playSoundEffect('click');
};

const createPurchaseSound = () => {
    playSoundEffect('purchase');
};

const createCriticalSound = () => {
    playSoundEffect('critical');
};

const openEggModalOriginal = openEggModal;
openEggModal = () => {
    playSoundEffect('upgrade');
    openEggModalOriginal();
};

const closeEggModalOriginal = closeEggModal;
closeEggModal = () => {
    playSoundEffect('click');
    closeEggModalOriginal();
};

const selectEggOriginal = selectEgg;
selectEgg = (eggIdx) => {
    playSoundEffect('eggOpen');
    selectEggOriginal(eggIdx);
};

const equipPetOriginal = equipPet;
equipPet = () => {
    playSoundEffect('equip');
    equipPetOriginal();
};

const rebirthOriginal = rebirth;
rebirth = () => {
    playSoundEffect('upgrade');
    rebirthOriginal();
};

const buyUpgradeOriginal = buyUpgrade;
buyUpgrade = (idx) => {
    playSoundEffect('upgrade');
    buyUpgradeOriginal(idx);
};

const buyPetSlotOriginal = buyPetSlot;
buyPetSlot = (slotIdx) => {
    playSoundEffect('upgrade');
    buyPetSlotOriginal(slotIdx);
};

// Auto-start BGM on first user interaction
let audioStarted = false;
document.addEventListener('click', function startAudio() {
    if (!audioStarted) {
        if (!audioContext) initAudio();
        
        if (isBGMPlaying && game.bgmVolume > 0) {
            playBackgroundMusic();
        }
        
        audioStarted = true;
    }
}, { once: true });
