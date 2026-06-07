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

let upgradesRendered = false;

// Generate 100 Worlds with EXPONENTIAL Scaling
// World 1: 1 rebirth, World 2: 2 rebirths, World 3: 6 rebirths, World 4: 15 rebirths, etc.
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

// Generate 60 Upgrades with proper initialization
const UPGRADES = [
    // Click Power (0-29)
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
    // Passive Income (30-59) - MUST have passivePower defined
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

// NUMBER FORMATTING FUNCTION
function formatNumber(num) {
    if (num === undefined || isNaN(num)) return "0";
    
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

// Audio Management
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let bgmNode = null;
let bgmOscillators = [];

// High-quality click sound with better timbre
function createClickSound() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;
    
    // Main click sound
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    
    osc1.frequency.setValueAtTime(300 + Math.random() * 100, now);
    osc1.frequency.exponentialRampToValueAtTime(50, now + 0.15);
    osc1.type = 'triangle';
    gain1.gain.setValueAtTime(0.4, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    
    osc1.start(now);
    osc1.stop(now + 0.15);
    
    // Add subtle higher harmonics for better audio quality
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    
    osc2.frequency.setValueAtTime(800, now);
    osc2.frequency.exponentialRampToValueAtTime(400, now + 0.08);
    osc2.type = 'sine';
    gain2.gain.setValueAtTime(0.15, now);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    
    osc2.start(now);
    osc2.stop(now + 0.08);
}

// Purchase sound
function createPurchaseSound() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;
    
    // Arpeggio effect
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C major
    notes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.frequency.setValueAtTime(freq, now + i * 0.05);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + i * 0.05 + 0.15);
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.1, now + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.15);
        
        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.15);
    });
}

// Critical sound
function createCriticalSound() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;
    
    // Power-up sound with slide
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.linearRampToValueAtTime(1200, now + 0.3);
    osc.type = 'sawtooth';
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    osc.start(now);
    osc.stop(now + 0.3);
}

// Toggle background music
function toggleBGM() {
    if (!game.bgmEnabled) {
        game.bgmEnabled = true;
        playBGM();
    } else {
        game.bgmEnabled = false;
        stopBGM();
    }
}

// Simple background music loop
function playBGM() {
    if (!game.bgmEnabled || !audioCtx) return;
    
    stopBGM();
    
    const notes = [146.83, 164.81, 196.00, 220.00, 196.00, 164.81]; // D minor arpeggio
    let noteIndex = 0;
    
    function playNextNote() {
        if (!game.bgmEnabled) return;
        
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.frequency.setValueAtTime(notes[noteIndex], now);
        osc.type = 'sine';
        gain.gain.setValueAtTime(game.bgmVolume * 0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        
        osc.start(now);
        osc.stop(now + 0.6);
        
        noteIndex = (noteIndex + 1) % notes.length;
        setTimeout(playNextNote, 300);
    }
    
    playNextNote();
}

function stopBGM() {
    game.bgmEnabled = false;
}

function createParticles() {
    const overlay = document.getElementById('particle-overlay');
    if (!overlay) return;
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDuration = (10 + Math.random() * 15) + 's';
        particle.style.animationDelay = Math.random() * 5 + 's';
        overlay.appendChild(particle);
    }
}

// Modern click effect with optimized visual
function showClickPop(e, damage) {
    // Limit particles to prevent performance issues
    const overlay = document.getElementById('particle-overlay');
    if (!overlay) return;
    
    // Create click pop text
    const pop = document.createElement('div');
    pop.className = 'click-pop';
    pop.textContent = '+' + formatNumber(damage);
    pop.style.left = e.clientX + 'px';
    pop.style.top = e.clientY + 'px';
    pop.style.color = game.criticalMultiplier > 2 ? '#FFD700' : game.spamMultiplier > 3 ? '#00D9FF' : '#7FFF00';
    
    // Add click effect ring
    const ring = document.createElement('div');
    ring.className = 'click-ring';
    ring.style.left = e.clientX + 'px';
    ring.style.top = e.clientY + 'px';
    ring.style.backgroundColor = game.criticalMultiplier > 2 ? '#FFD700' : game.spamMultiplier > 3 ? '#00D9FF' : '#7FFF00';
    
    document.body.appendChild(pop);
    document.body.appendChild(ring);
    
    setTimeout(() => pop.remove(), 800);
    setTimeout(() => ring.remove(), 500);
}

// Add click ring CSS dynamically
const clickRingCSS = document.createElement('style');
clickRingCSS.textContent = `
    .click-ring {
        position: fixed;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        border: 3px solid rgba(255, 255, 255, 0.5);
        pointer-events: none;
        z-index: 501;
        animation: clickRing 0.5s ease-out forwards;
    }
    @keyframes clickRing {
        0% { transform: translate(-50%, -50%) scale(0.8); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(2); opacity: 0; border-width: 0; }
    }
`;
document.head.appendChild(clickRingCSS);

function showCriticalHit(e) {
    const critical = document.createElement('div');
    critical.className = 'critical-hit';
    critical.textContent = '⚡ CRITICAL! ⚡';
    critical.style.left = (e.clientX - 100) + 'px';
    critical.style.top = (e.clientY - 50) + 'px';
    document.body.appendChild(critical);
    createCriticalSound();
    setTimeout(() => critical.remove(), 800);
}

function showRarePopup(text, duration = 3000) {
    const popup = document.createElement('div');
    popup.className = 'rare-popup';
    popup.innerHTML = text;
    document.body.appendChild(popup);
    setTimeout(() => {
        popup.classList.add('fade-out');
        setTimeout(() => popup.remove(), 500);
    }, duration);
}

function loadGame() {
    const saved = localStorage.getItem('fartSave');
    if (saved) {
        try {
            game = JSON.parse(saved);
        } catch (e) {
            console.error("Failed to load save", e);
        }
    }
    // Ensure maxPets is set
    if (!game.maxPets) game.maxPets = 3;
    initializeUpgrades();
}

function initializeUpgrades() {
    if (!game.upgrades || Object.keys(game.upgrades).length === 0) {
        game.upgrades = {};
        UPGRADES.forEach((_, i) => {
            game.upgrades[i] = 0;
        });
    }
}

function saveGame() {
    localStorage.setItem('fartSave', JSON.stringify(game));
}

function getClickPower() {
    let power = game.baseClickPower;
    UPGRADES.forEach((upgrade, i) => {
        if (upgrade.type === "click" && game.upgrades[i]) {
            power += upgrade.clickPower * game.upgrades[i];
        }
    });
    return power;
}

function getPassiveIncome() {
    let income = 0;
    UPGRADES.forEach((upgrade, i) => {
        if (upgrade.type === "passive" && game.upgrades[i]) {
            const passivePower = upgrade.passivePower || 0;
            income += passivePower * game.upgrades[i];
        }
    });
    return income;
}

function getPetMultiplier() {
    let mult = 1;
    game.equippedPets.forEach(pet => {
        mult *= pet.power;
    });
    return mult;
}

function getRebirthCost() {
    return 10000 * Math.pow(1.3, game.rebirths);
}

// Main Click Handler
document.getElementById("main-btn").addEventListener("click", (e) => {
    const now = Date.now();
    const timeSinceLastClick = now - game.lastClickTime;

    if (timeSinceLastClick < 300) {
        game.clickStreak++;
        game.spamMultiplier = Math.min(1 + (game.clickStreak * 0.15), 5);
    } else {
        game.clickStreak = 0;
        game.spamMultiplier = 1;
    }

    game.lastClickTime = now;
    game.totalClicks++;

    const critChance = Math.min(0.05 + (game.clickStreak * 0.01), 0.15);
    if (Math.random() < critChance) {
        game.criticalMultiplier = 2 + Math.random() * 2;
        showCriticalHit(e);
    } else {
        game.criticalMultiplier = 1;
    }

    const clickPower = getClickPower();
    const petMult = getPetMultiplier();
    const damage = clickPower * game.spamMultiplier * petMult * game.criticalMultiplier;

    game.points += damage;
    game.totalEarned += damage;
    
    createClickSound();
    showClickPop(e, damage);
    
    if (Math.random() < 0.01) {
        const rarities = ['🌟 LEGENDARY CLICK! 🌟', '💎 ULTRA RARE! 💎', '🔥 BURNING FURY! 🔥', '⚡ MAXIMUM POWER! ⚡', '💥 EXPLOSIVE HIT! 💥'];
        showRarePopup(rarities[Math.floor(Math.random() * rarities.length)], 2000);
    }
    
    updateDisplay();
    updateUpgradesDisplay();
    saveGame();
});

function buyUpgrade(idx) {
    const upgrade = UPGRADES[idx];
    if (!upgrade) return;
    
    const level = game.upgrades[idx] || 0;
    const cost = Math.floor(upgrade.baseCost * Math.pow(1.15, level));

    if (game.points >= cost) {
        game.points -= cost;
        game.upgrades[idx] = (game.upgrades[idx] || 0) + 1;
        createPurchaseSound();
        updateDisplay();
        updateUpgradesDisplay();
        saveGame();
    }
}

function buyPetSlot(slotIdx) {
    const upgrade = PET_SLOT_UPGRADES[slotIdx];
    if (game.points >= upgrade.cost) {
        game.points -= upgrade.cost;
        game.maxPets = upgrade.slot;
        game.petSlotsPurchased++;
        createPurchaseSound();
        updateDisplay();
        renderPets();
        saveGame();
    } else {
        alert("Not enough Stink!");
    }
}

function updateUpgradesDisplay() {
    // Update sliding panel
    const panelClick = document.getElementById("upgrades-panel-click");
    const panelPassive = document.getElementById("upgrades-panel-passive");
    const panelPets = document.getElementById("upgrades-panel-pets");
    
    if (panelClick || panelPassive || panelPets) {
        renderUpgradesPanel();
        return;
    }
    
    const upgradesTab = document.getElementById('upgrades');
    if (!upgradesTab || !upgradesTab.classList.contains('active')) return;
    
    document.querySelectorAll('.upgrade-btn').forEach((btn, idx) => {
        const upgrade = UPGRADES[idx];
        if (!upgrade) return;
        
        const level = game.upgrades[idx] || 0;
        const nextCost = Math.floor(upgrade.baseCost * Math.pow(1.15, level));
        const affordable = game.points >= nextCost;
        
        const costEl = btn.querySelector('.upgrade-cost');
        if (costEl) costEl.innerText = `Cost: ${formatNumber(nextCost)}`;
        
        const levelEl = btn.querySelector('.upgrade-level');
        if (levelEl) levelEl.innerText = `Level: ${level}`;
        
        if (affordable && btn.classList.contains('unaffordable')) {
            btn.classList.remove('unaffordable');
        } else if (!affordable && !btn.classList.contains('unaffordable')) {
            btn.classList.add('unaffordable');
        }
    });
}

function openEggModal() {
    document.getElementById("egg-modal").classList.remove("hidden");
    renderEggSelection();
}

function closeEggModal() {
    document.getElementById("egg-modal").classList.add("hidden");
}

function renderEggSelection() {
    const worldPets = PET_POOLS[game.worldIdx];
    if (!worldPets) return;
    
    const eggPool = worldPets.eggs;
    let html = "<div style='display: grid; gap: 15px;'>";
    
    eggPool.forEach((egg, idx) => {
        let petsList = "<div style='margin-top: 10px; padding: 10px; background: rgba(0,0,0,0.5); border-radius: 8px; text-align: left; font-size: 0.85rem; max-height: 200px; overflow-y: auto;'>";
        egg.pets.forEach(pet => {
            petsList += `<div style='margin: 4px 0; color: #a0d0ff;'>• ${pet.name}: <strong style="color: #FFD700;">${pet.odds}%</strong></div>`;
        });
        petsList += "</div>";
        
        html += `
            <button class="modal-btn" style="background: linear-gradient(135deg, ${egg.color}, ${egg.color}dd); border: 3px solid ${egg.color}; text-align: left; padding: 15px; cursor: pointer;" onclick="selectEgg(${idx})">
                <div style="font-size: 1.1rem; margin-bottom: 8px;">${egg.name}</div>
                <div style="font-size: 0.9rem; margin-bottom: 10px;">Cost: ${formatNumber(egg.cost)}</div>
                ${petsList}
            </button>
        `;
    });
    
    html += "</div>";
    document.getElementById("egg-selection").innerHTML = html;
}

function selectEgg(eggIdx) {
    const worldPets = PET_POOLS[game.worldIdx];
    if (!worldPets) return;
    
    const egg = worldPets.eggs[eggIdx];
    
    if (game.points < egg.cost) {
        alert("Not enough Stink!");
        return;
    }

    game.points -= egg.cost;
    
    let rand = Math.random() * 100;
    let pet = egg.pets[0];
    for (let p of egg.pets) {
        if (rand < p.odds) {
            pet = { ...p, id: Date.now(), eggType: egg.name };
            break;
        }
        rand -= p.odds;
    }
    
    game.pets.push(pet);
    
    createPurchaseSound();
    closeEggModal();
    updateDisplay();
    saveGame();
    showRarePopup(`🎉 You got <strong>${pet.name}</strong>! (${pet.power.toFixed(2)}x)`, 3000);
}

let selectedPetId = null;
function openPetModal(petId) {
    selectedPetId = petId;
    const pet = game.pets.find(p => p.id === petId);
    if (!pet) return;

    let html = `
        <div class='pet-info'>
            <h3>${pet.name}</h3>
            <p><strong>Click Multiplier:</strong> ${pet.power.toFixed(2)}x</p>
            <p><strong>From:</strong> ${pet.eggType}</p>
            <p><strong>Status:</strong> ${game.equippedPets.some(p => p.id === petId) ? "✅ Equipped" : "❌ Not Equipped"}</p>
        </div>
    `;
    document.getElementById("pet-details").innerHTML = html;
    document.getElementById("pet-modal").classList.remove("hidden");
}

function closePetModal() {
    document.getElementById("pet-modal").classList.add("hidden");
    selectedPetId = null;
}

function equipPet() {
    const pet = game.pets.find(p => p.id === selectedPetId);
    if (!pet) return;

    const isEquipped = game.equippedPets.some(p => p.id === selectedPetId);
    if (isEquipped) {
        game.equippedPets = game.equippedPets.filter(p => p.id !== selectedPetId);
    } else {
        if (game.equippedPets.length < game.maxPets) {
            game.equippedPets.push(pet);
            createPurchaseSound();
        } else {
            alert(`Max ${game.maxPets} pets equipped! Buy more pet slots.`);
            return;
        }
    }
    closePetModal();
    updateDisplay();
    renderPets();
    saveGame();
}

function rebirth() {
    const cost = getRebirthCost();
    if (game.points >= cost) {
        game.rebirths++;
        game.baseClickPower += 1;
        game.points = 0;
        game.upgrades = {};
        game.pets = [];
        game.equippedPets = [];
        game.spamMultiplier = 1;
        game.clickStreak = 0;
        game.criticalMultiplier = 1;
        game.worldIdx = Math.min(game.rebirths, WORLDS.length - 1);
        initializeUpgrades();
        createPurchaseSound();
        updateDisplay();
        saveGame();
        showRarePopup(`🔄 REBORN! World ${game.rebirths + 1}: ${WORLDS[game.worldIdx].name}`, 3500);
    }
}

function showTab(tabId, btn) {
    document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.getElementById(tabId).classList.add("active");
    btn.classList.add("active");

    if (tabId === "upgrades") renderUpgrades();
    if (tabId === "pets") renderPets();
    if (tabId === "worlds") renderWorlds();
}

// Render upgrades for sliding menu
function renderUpgradesPanel() {
    let clickHtml = "";
    let passiveHtml = "";
    
    UPGRADES.forEach((upgrade, i) => {
        const level = game.upgrades[i] || 0;
        const nextCost = Math.floor(upgrade.baseCost * Math.pow(1.15, level));
        const affordable = game.points >= nextCost;
        
        let statsText = "";
        if (upgrade.clickPower > 0) {
            statsText = `+${formatNumber(upgrade.clickPower)} Click`;
        } else if (upgrade.passivePower > 0) {
            statsText = `+${formatNumber(upgrade.passivePower)}/s Passive`;
        }
        
        const btn = `
            <button class="upgrade-panel-btn ${affordable ? "" : "unaffordable"}" onclick="buyUpgrade(${i})">
                <div class="upgrade-panel-name">${upgrade.name}</div>
                <div class="upgrade-panel-stats">${statsText}</div>
                <div class="upgrade-panel-cost">Cost: ${formatNumber(nextCost)}</div>
                <div class="upgrade-panel-level">Lvl ${level}</div>
            </button>
        `;
        
        if (upgrade.type === "click") {
            clickHtml += btn;
        } else if (upgrade.type === "passive") {
            passiveHtml += btn;
        }
    });
    
    let petSlotsHtml = "";
    PET_SLOT_UPGRADES.forEach((upgrade, idx) => {
        if (game.maxPets > upgrade.slot) return;
        const affordable = game.points >= upgrade.cost;
        petSlotsHtml += `
            <button class="upgrade-panel-btn ${affordable ? "" : "unaffordable"}" onclick="buyPetSlot(${idx})">
                <div class="upgrade-panel-name">${upgrade.name}</div>
                <div class="upgrade-panel-stats">Unlocks slot ${upgrade.slot}</div>
                <div class="upgrade-panel-cost">Cost: ${formatNumber(upgrade.cost)}</div>
                <div class="upgrade-panel-level">Lvl 1</div>
            </button>
        `;
    });
    
    document.getElementById("upgrades-panel-click").innerHTML = clickHtml;
    document.getElementById("upgrades-panel-passive").innerHTML = passiveHtml;
    document.getElementById("upgrades-panel-pets").innerHTML = petSlotsHtml;
    
    upgradesRendered = true;
}

// Original renderUpgrades for backward compatibility with tab content
function renderUpgrades() {
    let clickHtml = "<h3>⬆️ Click Power</h3>";
    let passiveHtml = "<h3 class='passive'>💰 Passive Income</h3>";
    
    UPGRADES.forEach((upgrade, i) => {
        const level = game.upgrades[i] || 0;
        const nextCost = Math.floor(upgrade.baseCost * Math.pow(1.15, level));
        const affordable = game.points >= nextCost;
        
        const btn = `
            <button class="upgrade-btn ${affordable ? "" : "unaffordable"}" onclick="buyUpgrade(${i})">
                <div class="upgrade-name">${upgrade.name}</div>
                <div class="upgrade-level">Level: ${level}</div>
                <div class="upgrade-cost">Cost: ${formatNumber(nextCost)}</div>
            </button>
        `;
        
        if (upgrade.type === "click") {
            clickHtml += btn;
        } else if (upgrade.type === "passive") {
            passiveHtml += btn;
        }
    });
    
    let petSlotsHtml = "<h3 style='color: #FF006E; margin-top: 20px;'>🐾 Pet Slot Upgrades</h3>";
    PET_SLOT_UPGRADES.forEach((upgrade, idx) => {
        if (game.maxPets > upgrade.slot) return;
        const affordable = game.points >= upgrade.cost;
        petSlotsHtml += `
            <button class="upgrade-btn ${affordable ? "" : "unaffordable"}" onclick="buyPetSlot(${idx})">
                <div class="upgrade-name">${upgrade.name}</div>
                <div class="upgrade-cost">Cost: ${formatNumber(upgrade.cost)}</div>
            </button>
        `;
    });
    
    document.getElementById("upgrades").innerHTML = `
        <div class="upgrades-split">
            <div class="upgrade-section">${clickHtml}</div>
            <div class="upgrade-section">${passiveHtml}${petSlotsHtml}</div>
        </div>
    `;
}

function renderPets() {
    let html = `<button class="pet-btn open-egg-btn" onclick="openEggModal()">🥚 Open Egg</button>`;
    
    html += "<div class='pet-section'><h3>My Pets (" + game.pets.length + ")</h3>";
    if (game.pets.length === 0) {
        html += "<p class='empty-text'>No pets yet! Open an egg to get started.</p>";
    } else {
        game.pets.forEach(pet => {
            const equipped = game.equippedPets.some(p => p.id === pet.id);
            html += `
                <div class="pet-card ${equipped ? "equipped" : ""}" onclick="openPetModal(${pet.id})">
                    <div class="pet-name">${pet.name}</div>
                    <div class="pet-power">${pet.power.toFixed(2)}x</div>
                    ${equipped ? "<div class='equipped-badge'>✅ Equipped</div>" : ""}
                </div>
            `;
        });
    }
    html += "</div>";

    const maxPets = game.maxPets || 3;
    html += `<div class='pet-section'><h3>Equipped Pets (${game.equippedPets.length}/${maxPets})</h3>`;
    if (game.equippedPets.length === 0) {
        html += "<p class='empty-text'>No equipped pets. Select a pet to equip!</p>";
    } else {
        game.equippedPets.forEach(pet => {
            html += `
                <div class="equipped-pet-card">
                    <div class="pet-name">${pet.name}</div>
                    <div class="pet-power">${pet.power.toFixed(2)}x</div>
                </div>
            `;
        });
    }
    html += "</div>";

    document.getElementById("pets").innerHTML = html;
}

function renderWorlds() {
    let html = "<div class='worlds-list'>";
    WORLDS.forEach((world, i) => {
        // Fix: Current world is always unlocked
        const unlocked = (game.rebirths >= world.reqRebirths) || (game.worldIdx === i);
        const current = game.worldIdx === i;
        html += `
            <div class="world-card ${unlocked ? "unlocked" : "locked"} ${current ? "current" : ""}" onclick="${unlocked && !current ? 'selectWorld(' + i + ')' : ''}">
                <div class="world-name">${world.name}</div>
                <div class="world-req">${unlocked ? 'Unlocked' : 'Requires ' + world.reqRebirths + ' Rebirths'}</div>
                ${current ? "<div class='current-badge'>🌍 Current</div>" : ""}
                ${!unlocked ? "<div class='locked-badge'>🔒 Locked</div>" : ""}
            </div>
        `;
    });
    html += "</div>";
    document.getElementById("worlds").innerHTML = html;
}

// World selection
function selectWorld(idx) {
    if (game.rebirths >= WORLDS[idx].reqRebirths) {
        game.worldIdx = idx;
        createPurchaseSound();
        updateDisplay();
        renderWorlds();
        showRarePopup(`🌍 Journeying to ${WORLDS[idx].name}...`, 3000);
        saveGame();
    }
}

function updateDisplay() {
    document.getElementById("points").innerText = formatNumber(game.points);
    document.getElementById("per-click").innerText = formatNumber(getClickPower());
    document.getElementById("spam-mult").innerText = game.spamMultiplier.toFixed(1) + "x";
    document.getElementById("passive-income").innerText = formatNumber(getPassiveIncome() * getPetMultiplier()) + "/s";
    document.getElementById("rebirths").innerText = game.rebirths;
    document.getElementById("world-name").innerText = WORLDS[game.worldIdx] ? WORLDS[game.worldIdx].name : "Unknown";
    document.getElementById("rebirth-btn").innerText = `REBIRTH (Req: ${formatNumber(getRebirthCost())})`;
}

// Sliding Menu Functions
function toggleUpgradesMenu() {
    const panel = document.getElementById("upgrades-panel");
    const overlay = document.getElementById("upgrades-overlay");
    
    if (panel.classList.contains("open")) {
        panel.classList.remove("open");
        overlay.classList.remove("visible");
    } else {
        panel.classList.add("open");
        overlay.classList.add("visible");
        if (!upgradesRendered) {
            renderUpgrades();
        }
    }
}

function openUpgradesMenu() {
    const panel = document.getElementById("upgrades-panel");
    const overlay = document.getElementById("upgrades-overlay");
    panel.classList.add("open");
    overlay.classList.add("visible");
    if (!upgradesRendered) {
        renderUpgrades();
    }
}

function closeUpgradesMenu() {
    const panel = document.getElementById("upgrades-panel");
    const overlay = document.getElementById("upgrades-overlay");
    panel.classList.remove("open");
    overlay.classList.remove("visible");
}

setInterval(() => {
    const income = getPassiveIncome() * getPetMultiplier();
    game.points += income;
    updateDisplay();
    saveGame();
}, 1000);

// Initialize
loadGame();
createParticles();
updateDisplay();
showTab("upgrades", document.querySelectorAll(".tab-btn")[0]);

// Play BGM on first interaction
let audioStarted = false;
document.addEventListener('click', function startAudio() {
    if (!audioStarted && audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume().then(() => {
            playBGM();
        });
        audioStarted = true;
    }
}, { once: true });
