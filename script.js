// NCS Playlist - Direct audio URLs for classic NCS tracks
const NCS_PLAYLIST = [
    { title: "My Heart", artist: "Different Heaven & EH!DE", url: "https://assets.mixkit.co/music/preview/mixcat-1452.mp3" },
    { title: "Let's Go!", artist: "Lensko", url: "https://assets.mixkit.co/music/preview/mixcat-1161.mp3" },
    { title: "Fade", artist: "Alan Walker", url: "https://assets.mixkit.co/music/preview/mixcat-1162.mp3" },
    { title: "On & On", artist: "Cartoon", url: "https://assets.mixkit.co/music/preview/mixcat-1160.mp3" },
    { title: "Invincible", artist: "DEAF KEV", url: "https://assets.mixkit.co/music/preview/mixcat-1164.mp3" },
    { title: "Heroes Tonight", artist: "Janji", url: "https://assets.mixkit.co/music/preview/mixcat-1165.mp3" },
    { title: "Symbolism", artist: "Electro-Light", url: "https://assets.mixkit.co/music/preview/mixcat-1163.mp3" },
    { title: "Blank", artist: "Disfigure", url: "https://assets.mixkit.co/music/preview/mixcat-1166.mp3" }
];

// Roblox-style satisfying sound effects
const SOUNDS = {
    click: "https://assets.mixkit.co/sfx/preview/mixcat-266.mp3",
    upgrade: "https://assets.mixkit.co/sfx/preview/mixcat-202.mp3",
    purchase: "https://assets.mixkit.co/sfx/preview/mixcat-265.mp3",
    critical: "https://assets.mixkit.co/sfx/preview/mixcat-268.mp3",
    eggOpen: "https://assets.mixkit.co/sfx/preview/mixcat-200.mp3",
    equip: "https://assets.mixkit.co/sfx/preview/mixcat-203.mp3"
};

// Background music player state
let audioContext = null;
let bgmAudio = null;
let bgmAudio2 = null;
let currentTrackIndex = 0;
let isBGMPlaying = false;
let currentBGMVolume = 0.3;
let upgradesRendered = false;

// Game State
let game = {
    points: 0,
    baseClickPower: 1,
    rebirths: 0,
    worldIdx: 0,
    upgrades: {},
    pets: [],
    equippedPets: [],
    lastClickTime: 0,
    spamMultiplier: 1,
    clickStreak: 0,
    criticalMultiplier: 1,
    criticalExpiry: 0,
    totalClicks: 0,
    totalEarned: 0,
    maxPets: 3,
    petSlotsPurchased: 0,
    bgmEnabled: true,
    bgmVolume: 0.3
};

// Generate 100 Worlds with EXPONENTIAL Scaling
const WORLDS = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    name: generateWorldName(i),
    reqRebirths: Math.floor(Math.pow(2.5, i / 4) / 2),
    scale: 1 + (i * 0.08),
    color: generateWorldColor(i)
}));

function generateWorldName(idx) {
    const names = [
        "Basement", "City Sewers", "Enchanted Forest", "Volcanic Crater", "Outer Space",
        "Abyssal Trench", "Nether Realm", "Cybernetic City", "Dimension X", "Infinite Loop",
        "Quantum Realm", "Void of Chaos", "Celestial Heaven", "Inferno Depths", "Ultimate Nexus",
        "Twilight Zone", "Mirror Dimension", "Steam Vents", "Crystal Cavern", "Bioluminescent Swamp",
        "Frozen Tundra", "Desert Wasteland", "Toxic Bog", "Shadow Realm", "Luminous Gardens",
        "Copper Mines", "Silver Vault", "Golden Palace", "Diamond Cavern", "Obsidian Tower",
        "Plasma Core", "Quantum Singularity", "Dark Matter Factory", "Exotic Matter Lab", "Antimatter Reactor",
        "Temporal Vortex", "Dimensional Rift", "Parallel Universe", "Multiverse Hub", "Reality Fracture",
        "Ethereal Plane", "Spectral Realm", "Phantom Zone", "Ghost Dimension", "Poltergeist Domain",
        "Void Expanse", "Null Space", "Empty Void", "Nothingness", "The Abyss",
        "Sonic Barrier", "Light Speed Zone", "Hypersonic Tunnel", "Warp Field", "Teleportation Hub",
        "Mystical Grove", "Enchanted Valley", "Magical Nexus", "Sorcerer's Tower", "Wizard's Peak",
        "Dragon's Lair", "Phoenix Nest", "Basilisk Cave", "Hydra Pool", "Leviathan Depths",
        "God's Throne", "Angel's Peak", "Demon's Pit", "Devil's Workshop", "Titan's Forge",
        "Cosmic Void", "Nebula Cloud", "Stardust Field", "Black Hole Center", "Supernova Zone",
        "Ancient Ruins", "Lost Civilization", "Forgotten Temple", "Cursed Tomb", "Sacred Ground",
        "Robot Factory", "Android Assembly", "Cyborg Laboratory", "AI Mainframe", "Server Farm",
        "Biological Reactor", "Genetic Lab", "Cloning Chamber", "Evolution Pod", "Mutation Chamber",
        "Consciousness Pool", "Mind Nexus", "Soul Forge", "Spirit Realm", "Astral Plane",
        "Infinity Engine", "Eternity Core", "Time Machine", "Fate's Loom", "Destiny's Vault"
    ];
    return names[idx] || `World ${idx + 1}`;
}

function generateWorldColor(idx) {
    const colors = [
        "#8B6914", "#696969", "#228B22", "#FF4500", "#1a1a2e",
        "#001a4d", "#330033", "#00ffff", "#ff00ff", "#ffff00",
        "#00ff00", "#ff6600", "#66ccff", "#ff3300", "#ffff00"
    ];
    return colors[idx % colors.length];
}

// NUMBER FORMATTING FUNCTION - STABLE with NaN protection
function formatNumber(num) {
    if (num === undefined || num === null || isNaN(num)) return "0";
    
    const absNum = Math.abs(num);
    
    if (absNum < 1000) return Math.floor(num).toString();
    if (absNum < 1000000) return (num / 1000).toFixed(1).replace(/\.?0+$/, '') + "K";
    if (absNum < 1000000000) return (num / 1000000).toFixed(1).replace(/\.?0+$/, '') + "M";
    if (absNum < 1000000000000) return (num / 1000000000).toFixed(1).replace(/\.?0+$/, '') + "B";
    if (absNum < 1000000000000000) return (num / 1000000000000).toFixed(1).replace(/\.?0+$/, '') + "T";
    if (absNum < 1000000000000000000) return (num / 1000000000000000).toFixed(1).replace(/\.?0+$/, '') + "Qa";
    if (absNum < 1000000000000000000000) return (num / 1000000000000000000).toFixed(1).replace(/\.?0+$/, '') + "Qi";
    if (absNum < 1e24) return (num / 1e21).toFixed(1).replace(/\.?0+$/, '') + "Sx";
    if (absNum < 1e27) return (num / 1e24).toFixed(1).replace(/\.?0+$/, '') + "Sp";
    if (absNum < 1e30) return (num / 1e27).toFixed(1).replace(/\.?0+$/, '') + "Oc";
    
    return num.toExponential(2);
}

// Audio Management Functions
function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
}

function playSoundEffect(soundKey) {
    if (!SOUNDS[soundKey]) return;
    
    const sound = new Audio(SOUNDS[soundKey]);
    sound.volume = 0.4;
    sound.play().catch(() => {
        initAudio();
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume().then(() => {
                sound.play();
            });
        }
    });
    setTimeout(() => sound.remove(), 5000);
}

function playBackgroundMusic(trackIndex = 0) {
    if (!audioContext) initAudio();
    
    currentTrackIndex = trackIndex;
    const track = NCS_PLAYLIST[trackIndex];
    
    if (!bgmAudio) {
        bgmAudio = new Audio();
        bgmAudio.loop = true;
    }
    bgmAudio.src = track.url;
    bgmAudio.volume = 0;
    bgmAudio.play().catch(e => console.log("Autoplay prevented:", e));
    
    let fadeIn = 0;
    const fadeInInterval = setInterval(() => {
        fadeIn += 0.05;
        bgmAudio.volume = Math.min(fadeIn, currentBGMVolume);
        if (fadeIn >= 1) clearInterval(fadeInInterval);
    }, 50);
    
    setTimeout(() => {
        setupTrackTransition(trackIndex);
    }, 200000);
}

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
    
    let fadeOut = 1;
    const fadeOutInterval = setInterval(() => {
        fadeOut -= 0.02;
        if (bgmAudio) bgmAudio.volume = Math.max(fadeOut * currentBGMVolume, 0);
        if (fadeOut <= 0) {
            clearInterval(fadeOutInterval);
            const temp = bgmAudio;
            bgmAudio = bgmAudio2;
            bgmAudio2 = temp;
            
            let fadeIn = 0;
            const fadeInInterval = setInterval(() => {
                fadeIn += 0.02;
                bgmAudio.volume = Math.min(fadeIn * currentBGMVolume, currentBGMVolume);
                if (fadeIn >= 1) {
                    clearInterval(fadeInInterval);
                    setupTrackTransition(nextIndex);
                }
            }, 50);
        }
    }, 50);
}

function toggleBGM() {
    isBGMPlaying = !isBGMPlaying;
    
    if (isBGMPlaying) {
        playBackgroundMusic();
    } else {
        if (bgmAudio) { bgmAudio.pause(); bgmAudio.currentTime = 0; }
        if (bgmAudio2) { bgmAudio2.pause(); bgmAudio2.currentTime = 0; }
    }
    
    game.bgmEnabled = isBGMPlaying;
    saveGame();
}

function setBGMVolume(volume) {
    currentBGMVolume = Math.max(0, Math.min(1, volume));
    game.bgmVolume = currentBGMVolume;
    
    if (bgmAudio) bgmAudio.volume = isBGMPlaying ? currentBGMVolume : 0;
    if (bgmAudio2) bgmAudio2.volume = isBGMPlaying ? currentBGMVolume : 0;
    
    saveGame();
}

// Generate 60 Upgrades with proper initialization
const UPGRADES = [
    { name: "Fart Bean", baseCost: 10, clickPower: 1, passivePower: 0, type: "click" },
    { name: "Cabbage Burst", baseCost: 50, clickPower: 3, passivePower: 0, type: "click" },
    { name: "Taco Bomb", baseCost: 250, clickPower: 12, passivePower: 0, type: "click" },
    { name: "Sewer Gas Cloud", baseCost: 1200, clickPower: 40, passivePower: 0, type: "click" },
    { name: "Swamp Miasma", baseCost: 5500, clickPower: 150, passivePower: 0, type: "click" },
    { name: "Gym Sock Stench", baseCost: 25000, clickPower: 450, passivePower: 0, type: "click" },
    { name: "Rotten Egg Blaster", baseCost: 110000, clickPower: 1200, passivePower: 0, type: "click" },
    { name: "Durian Nuke", baseCost: 500000, clickPower: 3500, passivePower: 0, type: "click" },
    { name: "Sewer Pipe Cannon", baseCost: 2200000, clickPower: 10000, passivePower: 0, type: "click" },
    { name: "Toxic Barrel Bomb", baseCost: 10000000, clickPower: 30000, passivePower: 0, type: "click" },
    { name: "Methane Eruption", baseCost: 45000000, clickPower: 85000, passivePower: 0, type: "click" },
    { name: "Hydrogen Sulfide Blast", baseCost: 200000000, clickPower: 250000, passivePower: 0, type: "click" },
    { name: "Ammonia Surge", baseCost: 900000000, clickPower: 750000, passivePower: 0, type: "click" },
    { name: "Fecal Matter Strike", baseCost: 4000000000, clickPower: 2200000, passivePower: 0, type: "click" },
    { name: "Intestinal Rupture", baseCost: 18000000000, clickPower: 6500000, passivePower: 0, type: "click" },
    { name: "Volcanic Flatulence", baseCost: 80000000000, clickPower: 19000000, passivePower: 0, type: "click" },
    { name: "Plague Winds", baseCost: 360000000000, clickPower: 55000000, passivePower: 0, type: "click" },
    { name: "Apocalyptic Gas", baseCost: 1600000000000, clickPower: 160000000, passivePower: 0, type: "click" },
    { name: "Reality Fart", baseCost: 7200000000000, clickPower: 465000000, passivePower: 0, type: "click" },
    { name: "Dimensional Rupture", baseCost: 32000000000000, clickPower: 1350000000, passivePower: 0, type: "click" },
    { name: "Cosmic Explosion", baseCost: 145000000000000, clickPower: 3900000000, passivePower: 0, type: "click" },
    { name: "Multiverse Collapse", baseCost: 650000000000000, clickPower: 11000000000, passivePower: 0, type: "click" },
    { name: "Time Distortion", baseCost: 3000000000000000, clickPower: 32000000000, passivePower: 0, type: "click" },
    { name: "Singularity Formation", baseCost: 14000000000000000, clickPower: 92000000000, passivePower: 0, type: "click" },
    { name: "Universe Bender", baseCost: 63000000000000000, clickPower: 265000000000, passivePower: 0, type: "click" },
    { name: "Omnipotent Fart", baseCost: 285000000000000000, clickPower: 770000000000, passivePower: 0, type: "click" },
    { name: "Infinity Gauntlet", baseCost: 1300000000000000000, clickPower: 2200000000000, passivePower: 0, type: "click" },
    { name: "Beyond Infinity", baseCost: 5800000000000000000, clickPower: 6400000000000, passivePower: 0, type: "click" },
    { name: "Void Collapse", baseCost: 26000000000000000000, clickPower: 18500000000000, passivePower: 0, type: "click" },
    { name: "Ultimate Power", baseCost: 118000000000000000000, clickPower: 53500000000000, passivePower: 0, type: "click" },
    { name: "Small Fan", baseCost: 30, clickPower: 0, passivePower: 1, type: "passive" },
    { name: "Air Blower", baseCost: 150, clickPower: 0, passivePower: 5, type: "passive" },
    { name: "Industrial Vent", baseCost: 750, clickPower: 0, passivePower: 20, type: "passive" },
    { name: "Wind Turbine", baseCost: 3500, clickPower: 0, passivePower: 75, type: "passive" },
    { name: "Tornado Generator", baseCost: 16000, clickPower: 0, passivePower: 300, type: "passive" },
    { name: "Hurricane Engine", baseCost: 75000, clickPower: 0, passivePower: 1200, type: "passive" },
    { name: "Stink Cannon", baseCost: 340000, clickPower: 0, passivePower: 5000, type: "passive" },
    { name: "Nuclear Reactor", baseCost: 1500000, clickPower: 0, passivePower: 18000, type: "passive" },
    { name: "Black Hole Generator", baseCost: 7000000, clickPower: 0, passivePower: 65000, type: "passive" },
    { name: "Galaxy Engine", baseCost: 32000000, clickPower: 0, passivePower: 240000, type: "passive" },
    { name: "Supernova Reactor", baseCost: 145000000, clickPower: 0, passivePower: 700000, type: "passive" },
    { name: "Quantum Processor", baseCost: 650000000, clickPower: 0, passivePower: 2100000, type: "passive" },
    { name: "Cosmic Amplifier", baseCost: 3000000000, clickPower: 0, passivePower: 6200000, type: "passive" },
    { name: "Dimensional Extractor", baseCost: 14000000000, clickPower: 0, passivePower: 18000000, type: "passive" },
    { name: "Time Accelerator", baseCost: 63000000000, clickPower: 0, passivePower: 52000000, type: "passive" },
    { name: "Reality Warper", baseCost: 285000000000, clickPower: 0, passivePower: 150000000, type: "passive" },
    { name: "Multiverse Portal", baseCost: 1300000000000, clickPower: 0, passivePower: 435000000, type: "passive" },
    { name: "Infinity Well", baseCost: 5800000000000, clickPower: 0, passivePower: 1250000000, type: "passive" },
    { name: "Void Harvester", baseCost: 26000000000000, clickPower: 0, passivePower: 3600000000, type: "passive" },
    { name: "Omniscient Extractor", baseCost: 118000000000000, clickPower: 0, passivePower: 10400000000, type: "passive" },
    { name: "Eternal Generator", baseCost: 535000000000000, clickPower: 0, passivePower: 30000000000, type: "passive" },
    { name: "Universal Pump", baseCost: 2400000000000000, clickPower: 0, passivePower: 87000000000, type: "passive" },
    { name: "Cosmic Drain", baseCost: 11000000000000000, clickPower: 0, passivePower: 250000000000, type: "passive" },
    { name: "Infinity Harvester", baseCost: 49000000000000000, clickPower: 0, passivePower: 725000000000, type: "passive" },
    { name: "Reality Extractor", baseCost: 220000000000000000, clickPower: 0, passivePower: 2100000000000, type: "passive" },
    { name: "Beyond Creation", baseCost: 1000000000000000000, clickPower: 0, passivePower: 6000000000000, type: "passive" },
    { name: "Absolute Power", baseCost: 4500000000000000000, clickPower: 0, passivePower: 17500000000000, type: "passive" },
    { name: "Cosmic Domination", baseCost: 20000000000000000000, clickPower: 0, passivePower: 50000000000000, type: "passive" },
    { name: "Ultimate Extraction", baseCost: 90000000000000000000, clickPower: 0, passivePower: 145000000000000, type: "passive" },
    { name: "Transcendence", baseCost: 410000000000000000000, clickPower: 0, passivePower: 420000000000000, type: "passive" }
];

// Pet Slot Upgrade
const PET_SLOT_UPGRADES = [
    { slot: 4, cost: 100000000, name: "Extra Pet Slot #4" },
    { slot: 5, cost: 500000000, name: "Extra Pet Slot #5" },
    { slot: 6, cost: 2500000000, name: "Extra Pet Slot #6" },
    { slot: 7, cost: 12500000000, name: "Extra Pet Slot #7" },
    { slot: 8, cost: 62500000000, name: "Extra Pet Slot #8" },
    { slot: 9, cost: 312500000000, name: "Extra Pet Slot #9" },
    { slot: 10, cost: 1562500000000, name: "Extra Pet Slot #10" }
];

// PET POOLS - properly initialized
const PET_POOLS = {};
for (let w = 0; w < 100; w++) {
    PET_POOLS[w] = {
        eggs: [
            {
                name: "💨 Benign Breeze Egg",
                cost: 500 * Math.pow(1.8, w),
                color: "#8B7355",
                pets: [
                    { name: "Toot", power: 1.1, odds: 25 },
                    { name: "Squeaker", power: 1.15, odds: 25 },
                    { name: "Puff", power: 1.2, odds: 20 },
                    { name: "Whoosh", power: 1.25, odds: 15 },
                    { name: "Breeze", power: 1.3, odds: 8 },
                    { name: "Zephyr", power: 1.35, odds: 3 },
                    { name: "Gentle Gust", power: 1.4, odds: 2 },
                    { name: "Light Wind", power: 1.45, odds: 1 },
                    { name: "Soft Snort", power: 1.5, odds: 0.5 },
                    { name: "Tiny Burp", power: 1.55, odds: 0.5 }
                ]
            },
            {
                name: "💜 Catastrophic Rumble Egg",
                cost: 2000 * Math.pow(1.9, w),
                color: "#9370DB",
                pets: [
                    { name: "Thunder Cheeks", power: 1.8, odds: 25 },
                    { name: "Boom Butt", power: 1.9, odds: 25 },
                    { name: "Sonic Sphincter", power: 2.0, odds: 20 },
                    { name: "Rumble Rump", power: 2.1, odds: 15 },
                    { name: "Quake Crack", power: 2.2, odds: 8 },
                    { name: "Shockwave Cheeks", power: 2.3, odds: 3 },
                    { name: "Blast Bottom", power: 2.4, odds: 2 },
                    { name: "Explosion Posterior", power: 2.5, odds: 1 },
                    { name: "Volcanic Valve", power: 2.6, odds: 0.5 },
                    { name: "Detonator", power: 2.7, odds: 0.5 }
                ]
            },
            {
                name: "✨ Legendary Stench Egg",
                cost: 8000 * Math.pow(2.0, w),
                color: "#FFD700",
                pets: [
                    { name: "Odor Overlord", power: 3.5, odds: 25 },
                    { name: "Stink Lord", power: 3.6, odds: 25 },
                    { name: "Smell Supreme", power: 3.7, odds: 20 },
                    { name: "Fume Phantom", power: 3.8, odds: 15 },
                    { name: "Gas God", power: 3.9, odds: 8 },
                    { name: "Miasma Master", power: 4.0, odds: 3 },
                    { name: "Reek Royalty", power: 4.1, odds: 2 },
                    { name: "Stench Sovereign", power: 4.2, odds: 1 },
                    { name: "Pungent Prophet", power: 4.3, odds: 0.5 },
                    { name: "Aroma Apocalypse", power: 4.4, odds: 0.5 }
                ]
            }
        ]
    };
}

function createClickSound() {
    playSoundEffect('click');
}

function createPurchaseSound() {
    playSoundEffect('purchase');
}

function createCriticalSound() {
    playSoundEffect('critical');
}