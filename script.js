/* ============================================================
   FART CLICKER: BRAINROT EDITION — single-file logic
   Features: phonk track rotation, egg FX, pet fusion, pet index,
   prestige (Aura), combo, golden farts, offline earnings.
   ============================================================ */

// ---------- Game State ----------
let game = {
    points: 0,
    baseClickPower: 1,
    rebirths: 0,
    worldIdx: 0,
    upgrades: {},
    pets: [],
    equippedPets: [],
    maxPets: 3,
    totalClicks: 0,
    totalEarned: 0,
    aura: 0,
    auraUpgrades: {},
    discovered: {},
    lastSeen: Date.now(),
    settings: {
        musicVol: 0.35, sfxVol: 0.70,
        musicOn: true, particles: true, screenShake: true, brainrot: true
    }
};

// runtime (not saved)
let spamMultiplier = 1, clickStreak = 0, lastClickTime = 0, criticalMultiplier = 1;
let comboValue = 0, comboDecayTimer = null;
let upgradesRendered = false, audioStarted = false, hatchActive = false;
let audioCtx = null, pendingHatch = null;
let petTabCur = "collection", indexWorld = 0;
let buyMode = 1; // 1, 10, 100, or "max"


// ---------- 20 Worlds ----------
const WORLDS = [
    { name: "Basement",         reqRebirths: 0,    icon: "🏚️", theme: { p:"#7FFF00", s:"#B14EFF", a:"#00E0FF", bg1:"#160a2e", bg2:"#08040f" } },
    { name: "Sewer Tunnels",    reqRebirths: 3,    icon: "🕳️", theme: { p:"#8db300", s:"#5a7d2c", a:"#a0ffaa", bg1:"#1a2a14", bg2:"#0a1408" } },
    { name: "Skibidi Toilet",   reqRebirths: 8,    icon: "🚽", theme: { p:"#5dd2ff", s:"#ffffff", a:"#ffd54a", bg1:"#0e2236", bg2:"#06121f" } },
    { name: "Rizz Dojo",        reqRebirths: 16,   icon: "😎", theme: { p:"#ff3d9a", s:"#ff6b35", a:"#ffd54a", bg1:"#2e0a1c", bg2:"#170510" } },
    { name: "Ohio",             reqRebirths: 28,   icon: "🌽", theme: { p:"#ffd54a", s:"#ff8a3d", a:"#7fff00", bg1:"#2e1f08", bg2:"#170f04" } },
    { name: "Outer Space",      reqRebirths: 45,   icon: "🚀", theme: { p:"#5d8eff", s:"#b14eff", a:"#00e0ff", bg1:"#0a0a3a", bg2:"#04041a" } },
    { name: "Gyatt Canyon",     reqRebirths: 68,   icon: "🏜️", theme: { p:"#ff8a3d", s:"#ffd54a", a:"#ff3d9a", bg1:"#3a1808", bg2:"#1a0a04" } },
    { name: "Nether Realm",     reqRebirths: 98,   icon: "🔥", theme: { p:"#ff3030", s:"#ff8030", a:"#ffd54a", bg1:"#2a0606", bg2:"#140303" } },
    { name: "Sigma City",       reqRebirths: 136,  icon: "🏙️", theme: { p:"#c0c0d0", s:"#00e0ff", a:"#ffffff", bg1:"#1a1a2a", bg2:"#0a0a14" } },
    { name: "Dimension X",      reqRebirths: 182,  icon: "🛸", theme: { p:"#7fff80", s:"#00ff80", a:"#b14eff", bg1:"#0e2410", bg2:"#061206" } },
    { name: "Quantum Realm",    reqRebirths: 238,  icon: "⚛️", theme: { p:"#00e0ff", s:"#5d8eff", a:"#ffd54a", bg1:"#0a1a3a", bg2:"#04081a" } },
    { name: "Grimace Shake",    reqRebirths: 305,  icon: "🟣", theme: { p:"#a040ff", s:"#ff3d9a", a:"#ffd54a", bg1:"#2a0a3a", bg2:"#14041a" } },
    { name: "Mewing Heights",   reqRebirths: 385,  icon: "☁️", theme: { p:"#bfdfff", s:"#7fa8ff", a:"#ffffff", bg1:"#1a2840", bg2:"#0a141f" } },
    { name: "Inferno Depths",   reqRebirths: 480,  icon: "👹", theme: { p:"#ff2020", s:"#ff5010", a:"#ffd54a", bg1:"#1a0202", bg2:"#0a0101" } },
    { name: "Crystal Cavern",   reqRebirths: 590,  icon: "💎", theme: { p:"#40ffd0", s:"#80ffff", a:"#b14eff", bg1:"#0a2828", bg2:"#041414" } },
    { name: "Mirror Dimension", reqRebirths: 720,  icon: "🪞", theme: { p:"#e0e0ff", s:"#a0a0ff", a:"#ff3d9a", bg1:"#1a1a30", bg2:"#0a0a18" } },
    { name: "Galactic Core",    reqRebirths: 870,  icon: "🌌", theme: { p:"#ffd54a", s:"#b14eff", a:"#00e0ff", bg1:"#0a0428", bg2:"#040214" } },
    { name: "Time Rift",        reqRebirths: 1050, icon: "⏳", theme: { p:"#ffe080", s:"#40ffd0", a:"#ff3d9a", bg1:"#2a200a", bg2:"#141004" } },
    { name: "Gigachad Nexus",   reqRebirths: 1260, icon: "💪", theme: { p:"#ff1050", s:"#ffd54a", a:"#00e0ff", bg1:"#2a0820", bg2:"#140410" } },
    { name: "The Final Stench", reqRebirths: 1500, icon: "👑", theme: { p:"#ffd700", s:"#ff00ff", a:"#00ffd0", bg1:"#1a001a", bg2:"#0a000a" } }
];

// ---------- Number format (NaN-safe) ----------
function fmt(num) {
    if (num === undefined || num === null || isNaN(num)) return "0";
    const a = Math.abs(num);
    if (a < 1000) return Math.floor(num).toString();
    const u = ["K","M","B","T","Qa","Qi","Sx","Sp","Oc","No","Dc","Ud","Dd"];
    let t = Math.floor(Math.log10(a) / 3);
    if (t > u.length) return num.toExponential(2);
    return (num / Math.pow(1000, t)).toFixed(2).replace(/\.?0+$/, '') + u[t - 1];
}


// ---------- Upgrades (brainrot themed) ----------
const UPGRADES = [
    { name: "Fart Bean",          baseCost: 15,            clickPower: 1,          type: "click", icon: "🫘" },
    { name: "Rizzler Cabbage",    baseCost: 100,           clickPower: 4,          type: "click", icon: "🥬" },
    { name: "Taco Bomb",          baseCost: 600,           clickPower: 18,         type: "click", icon: "🌮" },
    { name: "Skibidi Gas",        baseCost: 3500,          clickPower: 70,         type: "click", icon: "🚽" },
    { name: "Gyatt Blast",        baseCost: 20000,         clickPower: 300,        type: "click", icon: "🍑" },
    { name: "Fanum Tax Fart",     baseCost: 120000,        clickPower: 1300,       type: "click", icon: "🍔" },
    { name: "Sigma Stench",       baseCost: 750000,        clickPower: 5500,       type: "click", icon: "😤" },
    { name: "Durian Nuke",        baseCost: 4500000,       clickPower: 24000,      type: "click", icon: "🥟" },
    { name: "Ohio Cannon",        baseCost: 28000000,      clickPower: 110000,     type: "click", icon: "🌽" },
    { name: "Mewing Methane",     baseCost: 180000000,     clickPower: 520000,     type: "click", icon: "😐" },
    { name: "Grimace Eruption",   baseCost: 1200000000,    clickPower: 2500000,    type: "click", icon: "🟣" },
    { name: "Gigachad Surge",     baseCost: 8000000000,    clickPower: 12500000,   type: "click", icon: "💪" },
    { name: "Quantum Flatulence", baseCost: 55000000000,   clickPower: 65000000,   type: "click", icon: "⚛️" },
    { name: "Apocalyptic Gas",    baseCost: 400000000000,  clickPower: 350000000,  type: "click", icon: "☢️" },
    { name: "Reality Fart",       baseCost: 3000000000000, clickPower: 2000000000, type: "click", icon: "🌀" },
    { name: "Sus Fan",            baseCost: 50,            passivePower: 1,        type: "passive", icon: "📴" },
    { name: "NPC Blower",         baseCost: 400,           passivePower: 6,        type: "passive", icon: "🤖" },
    { name: "Industrial Vent",    baseCost: 2500,          passivePower: 28,       type: "passive", icon: "🏭" },
    { name: "Wind Turbine",       baseCost: 15000,         passivePower: 130,      type: "passive", icon: "🌬️" },
    { name: "Tornado Gen",        baseCost: 90000,         passivePower: 600,      type: "passive", icon: "🌪️" },
    { name: "Sheesh Cannon",      baseCost: 550000,        passivePower: 2800,     type: "passive", icon: "🗣️" },
    { name: "Stink Reactor",      baseCost: 3400000,       passivePower: 13000,    type: "passive", icon: "☣️" },
    { name: "Nuclear Plant",      baseCost: 21000000,      passivePower: 62000,    type: "passive", icon: "⚡" },
    { name: "Black Hole Gen",     baseCost: 140000000,     passivePower: 300000,   type: "passive", icon: "🕳️" },
    { name: "Galaxy Engine",      baseCost: 950000000,     passivePower: 1500000,  type: "passive", icon: "🌌" },
    { name: "Supernova Core",     baseCost: 6500000000,    passivePower: 7500000,  type: "passive", icon: "💥" },
    { name: "Quantum CPU",        baseCost: 45000000000,   passivePower: 38000000, type: "passive", icon: "💻" },
    { name: "Cosmic Amp",         baseCost: 320000000000,  passivePower: 200000000,type: "passive", icon: "📡" },
    { name: "Dimension Pump",     baseCost: 2300000000000, passivePower: 1100000000,type:"passive", icon: "🌀" },
    { name: "Reality Warper",     baseCost: 17000000000000,passivePower: 6000000000,type:"passive", icon: "✨" },
    // more click upgrades
    { name: "Skibidi Singularity",baseCost: 22000000000000,   clickPower: 11000000000,  type: "click", icon: "🌀" },
    { name: "Mewing Mastery",     baseCost: 150000000000000,  clickPower: 65000000000,  type: "click", icon: "😶" },
    { name: "Aura Overload",      baseCost: 1100000000000000, clickPower: 380000000000, type: "click", icon: "🔮" },
    { name: "NPC Apocalypse",     baseCost: 8000000000000000, clickPower: 2200000000000,type: "click", icon: "🧟" },
    { name: "Final Boss Fart",    baseCost: 60000000000000000,clickPower: 13000000000000,type:"click", icon: "👹" },
    { name: "Omega Rizz",         baseCost: 450000000000000000,clickPower:78000000000000,type:"click", icon: "💞" },
    // more passive upgrades
    { name: "Multiverse Pump",    baseCost: 130000000000000,  passivePower: 35000000000,  type: "passive", icon: "🌌" },
    { name: "Infinity Reactor",   baseCost: 900000000000000,  passivePower: 200000000000, type: "passive", icon: "♾️" },
    { name: "Aura Generator",     baseCost: 6500000000000000, passivePower: 1200000000000,type: "passive", icon: "🔮" },
    { name: "Cosmic Singularity", baseCost: 48000000000000000,passivePower: 7000000000000,type: "passive", icon: "🌟" },
    { name: "Omega Stench Engine",baseCost: 340000000000000000,passivePower:42000000000000,type:"passive",icon: "👑" }
];

const PET_SLOTS = [
    { slot: 4,  cost: 5000000,            reqRebirths: 1 },
    { slot: 5,  cost: 400000000,          reqRebirths: 3 },
    { slot: 6,  cost: 35000000000,        reqRebirths: 6 },
    { slot: 7,  cost: 3000000000000,      reqRebirths: 10 },
    { slot: 8,  cost: 280000000000000,    reqRebirths: 16 },
    { slot: 9,  cost: 25000000000000000,  reqRebirths: 24 },
    { slot: 10, cost: 2400000000000000000,reqRebirths: 34 },
    { slot: 11, cost: 2.2e23,             reqRebirths: 48 },
    { slot: 12, cost: 2e26,               reqRebirths: 64 }
];

// ---------- Prestige: Aura upgrades (permanent) ----------
const AURA_UPGRADES = [
    { name: "Sigma Click Aura", icon: "😤", base: 2, effect: "click",    per: 0.25, desc: "+25% click power / level" },
    { name: "Passive Aura",     icon: "🌬️", base: 2, effect: "passive",  per: 0.25, desc: "+25% passive income / level" },
    { name: "Lucky Aura",       icon: "🍀", base: 5, effect: "luck",     per: 1,    desc: "+1 luck roll on eggs / level" },
    { name: "Golden Aura",      icon: "🌟", base: 4, effect: "golden",   per: 0.5,  desc: "Golden farts: +50% reward / level" },
    { name: "Aura Magnet",      icon: "🧲", base: 8, effect: "auragain", per: 0.25, desc: "+25% Aura per rebirth / level" },
    { name: "Combo Master",     icon: "🔥", base: 6, effect: "combo",    per: 0.30, desc: "Combo builds +30% faster / level" },
    { name: "Triple Hatch",     icon: "🥚", base: 60, effect: "multi",   per: 1,    desc: "Unlock Open x3 eggs at once", max: 1 },
    { name: "Mega Hatch",       icon: "🪺", base: 400, effect: "mega",    per: 1,    desc: "Unlock Open x10 eggs at once", max: 1 }
];


// ---------- Rarity + Eggs ----------
const RARITY = {
    common:    { label: "Common",    color: "#9fb0c9", tier: 0 },
    rare:      { label: "Rare",      color: "#3da5ff", tier: 1 },
    epic:      { label: "Epic",      color: "#b14eff", tier: 2 },
    legendary: { label: "Legendary", color: "#ffd54a", tier: 3 },
    mythic:    { label: "MYTHIC",    color: "#ff3d9a", tier: 4 },
    secret:    { label: "✦ SECRET ✦",color: "#00ffd0", tier: 5 }
};

const EGG_TEMPLATES = [
    { id: "common", name: "Common Egg", emoji: "🥚", color: "#9fb0c9", baseCost: 800, growth: 2.2, pets: [
        { name: "Toot",      base: 1.1,  odds: 45, rarity: "common",    emoji: "💨" },
        { name: "Squeaker",  base: 1.3,  odds: 30, rarity: "common",    emoji: "🐭" },
        { name: "Puff",      base: 1.8,  odds: 18, rarity: "rare",      emoji: "☁️" },
        { name: "Skibidi",   base: 3.0,  odds: 6,  rarity: "epic",      emoji: "🚽" },
        { name: "Gigachad",  base: 6.0,  odds: 1,  rarity: "legendary", emoji: "💪" }
    ]},
    { id: "rare", name: "Rare Egg", emoji: "🥚", color: "#3da5ff", baseCost: 12000, growth: 2.4, pets: [
        { name: "Boom Butt",  base: 2.4,  odds: 45, rarity: "rare",      emoji: "💣" },
        { name: "Sonic Blast",base: 3.6,  odds: 30, rarity: "rare",      emoji: "💨" },
        { name: "Rizzler",    base: 5.5,  odds: 18, rarity: "epic",      emoji: "😎" },
        { name: "Sigma",      base: 9.0,  odds: 6,  rarity: "legendary", emoji: "🗿" },
        { name: "Grimace",    base: 18.0, odds: 1,  rarity: "mythic",    emoji: "🟣" }
    ]},
    { id: "legendary", name: "Legendary Egg", emoji: "🌟", color: "#ffd54a", baseCost: 90000, growth: 2.6, pets: [
        { name: "Stink Lord",  base: 7.0,   odds: 44, rarity: "epic",      emoji: "👑" },
        { name: "Fume Phantom",base: 12.0,  odds: 30, rarity: "legendary", emoji: "👻" },
        { name: "Gas God",     base: 22.0,  odds: 18, rarity: "legendary", emoji: "🌬️" },
        { name: "Ohio Boss",   base: 45.0,  odds: 7,  rarity: "mythic",    emoji: "🌽" },
        { name: "Skibidi GOD", base: 120.0, odds: 1,  rarity: "secret",   emoji: "🚽" }
    ]}
];

function eggCost(t, world) { return Math.floor(t.baseCost * Math.pow(t.growth, world)); }
// pet power scales exponentially per world so later-world pets are always worth getting
function petPower(base, world) { return +(base * Math.pow(1.4, world)).toFixed(2); }
function allPetsForWorld() {
    // flatten all egg pets (the 15 base pets)
    let arr = [];
    EGG_TEMPLATES.forEach(e => e.pets.forEach(p => arr.push(p)));
    return arr;
}
function dexKey(world, name) { return world + ":" + name; }


// ============================================================
//  AUDIO: multi-track procedural AMBIENT + SFX (WebAudio)
// ============================================================
function getCtx() {
    try {
        // Never create AudioContext before a user gesture — required on iOS
        if (!audioCtx) return null;
        if (audioCtx.state === "suspended") audioCtx.resume();
    } catch (e) { audioCtx = null; }
    return audioCtx;
}
function createCtx() {
    // Call this only from within a user gesture handler
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === "suspended") audioCtx.resume();
    } catch (e) { audioCtx = null; }
    return audioCtx;
}
let noiseBuffer = null;
function getNoise(ctx) {
    if (noiseBuffer) return noiseBuffer;
    const len = ctx.sampleRate * 0.4;
    noiseBuffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = noiseBuffer.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return noiseBuffer;
}
function tone(freq, dur, type, vol, slideTo) {
    try {
        const ctx = getCtx(); if (!ctx) return;
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = type || "sine";
        o.frequency.setValueAtTime(freq, ctx.currentTime);
        if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, ctx.currentTime + dur);
        const v = (vol || 0.1) * game.settings.sfxVol;
        g.gain.setValueAtTime(v, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
        o.connect(g); g.connect(ctx.destination);
        o.start(); o.stop(ctx.currentTime + dur);
    } catch (e) {}
}
function sfxClick()  { tone(520 + Math.random()*80, 0.07, "sine", 0.07, 360); }
function sfxBuy()    { tone(660, 0.10, "sine", 0.09); setTimeout(()=>tone(880,0.12,"sine",0.08),60); setTimeout(()=>tone(1100,0.12,"sine",0.06),130); }
function sfxCrit()   { tone(880, 0.18, "sine", 0.10, 1320); }
function sfxError()  { tone(200, 0.16, "triangle", 0.07, 140); }
function sfxWhoosh() { tone(300, 0.25, "sine", 0.06, 1200); }
function sfxRare(tier) {
    const notes = [523,659,784,1047,1319,1568];
    for (let i = 0; i <= Math.min(tier+1,5); i++) setTimeout(()=>tone(notes[i],0.25,"sine",0.10),i*100);
}


// ---------- AMBIENT tracks (soft, varied feel per world) ----------
const TRACKS = [
    { name: "Drifting Mist",   bpm: 72,  voice: "pad",    // world 0 - dreamy
      kick: [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
      hat:  [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0],
      bell: [0,null,null,7, null,5,null,null, 3,null,null,5, null,null,7,null],
      bass: [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0] },
    { name: "Sewer Vibes",     bpm: 80,  voice: "marimba", // world 1 - bouncy
      kick: [1,0,0,0, 0,0,1,0, 1,0,0,0, 0,0,1,0],
      hat:  [0,1,0,1, 0,1,0,1, 0,1,0,1, 0,1,0,1],
      bell: [5,null,3,null, 0,null,3,null, 5,null,7,null, 5,null,3,null],
      bass: [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,1] },
    { name: "Toilet Lounge",   bpm: 90,  voice: "ep",     // world 2 - lo-fi
      kick: [1,0,0,1, 0,0,1,0, 1,0,0,0, 0,1,0,0],
      hat:  [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,1],
      bell: [0,null,3,null, 5,3,null,null, 7,null,5,null, 3,null,null,0],
      bass: [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0] },
    { name: "Rizz Waltz",      bpm: 78,  voice: "chime",  // world 3 - chill
      kick: [1,0,0,0, 0,0,0,0, 0,0,1,0, 0,0,0,0],
      hat:  [0,0,1,0, 0,0,0,0, 0,0,1,0, 0,0,1,0],
      bell: [7,null,null,10, null,7,null,5, 3,null,null,7, null,5,null,null],
      bass: [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0] },
    { name: "Ohio Breeze",     bpm: 68,  voice: "pad",    // world 4 - slow dreamy
      kick: [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
      hat:  [0,0,0,1, 0,0,0,1, 0,0,0,1, 0,0,1,0],
      bell: [0,null,null,null, 5,null,null,null, 3,null,null,null, 7,null,null,null],
      bass: [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0] },
    { name: "Starfield",       bpm: 75,  voice: "ep",     // world 5 - space ambient
      kick: [1,0,0,0, 0,0,0,0, 0,0,1,0, 0,0,0,0],
      hat:  [0,0,0,1, 0,0,1,0, 0,0,0,1, 0,1,0,0],
      bell: [12,null,null,10, null,null,7,null, 5,null,null,7, null,10,null,null],
      bass: [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0] },
    { name: "Canyon Winds",    bpm: 82,  voice: "marimba", // world 6 - warm
      kick: [1,0,0,0, 0,1,0,0, 1,0,0,0, 0,1,0,0],
      hat:  [0,1,0,1, 0,1,0,1, 0,1,0,1, 0,1,1,0],
      bell: [5,null,7,null, 10,null,7,null, 5,null,3,null, 0,null,3,null],
      bass: [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0] },
    { name: "Ember Glow",      bpm: 70,  voice: "chime",  // world 7 - dark ambient
      kick: [1,0,0,0, 0,0,1,0, 0,0,1,0, 0,0,0,0],
      hat:  [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,0,1],
      bell: [0,null,null,3, null,null,5,null, 7,null,null,5, null,3,null,null],
      bass: [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0] }
];

const PHONK = { idx: 0, step: 0, timer: null, playing: false, bars: 0 };
function midiHz(s) { return 220 * Math.pow(2, s / 12); }

function phonkKick(ctx, t) {
    // Soft low thud instead of punchy kick
    const m = ensureMaster();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine"; o.frequency.setValueAtTime(90, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.18);
    g.gain.setValueAtTime(0.35 * game.settings.musicVol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
    o.connect(g); g.connect(m || ctx.destination); o.start(t); o.stop(t + 0.35);
}
function phonkHat(ctx, t) {
    // Very quiet shaker-style brush
    const m = ensureMaster();
    const s = ctx.createBufferSource(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    s.buffer = getNoise(ctx); f.type = "bandpass"; f.frequency.value = 6000; f.Q.value = 3;
    g.gain.setValueAtTime(0.03 * game.settings.musicVol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    s.connect(f); f.connect(g); g.connect(m || ctx.destination); s.start(t); s.stop(t + 0.07);
}
function phonkBell(ctx, t, semi, wave) { phonkLead(ctx, t, semi, wave); }
function phonk808(ctx, t, semi) {
    // Warm sub bass, very mellow
    const m = ensureMaster();
    const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    f.type = "lowpass"; f.frequency.value = 400;
    o.type = "sine"; o.frequency.setValueAtTime(midiHz(semi - 12), t);
    g.gain.setValueAtTime(0.30 * game.settings.musicVol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
    o.connect(f); f.connect(g); g.connect(m || ctx.destination); o.start(t); o.stop(t + 0.72);
}


// ---------- Ambient instrument voices ----------
function vEnv(ctx, peak, atk, dec, t) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + atk);
    g.gain.exponentialRampToValueAtTime(0.0001, t + atk + dec);
    return g;
}
// Soft pad: sine stack with slow attack, gentle release
function vPad(ctx, t, freq, vol, master) {
    const g = vEnv(ctx, vol * 0.7, 0.12, 1.2, t);
    [1, 2, 3].forEach((h, i) => {
        const o = ctx.createOscillator(); o.type = "sine";
        o.frequency.value = freq * h; o.detune.value = (i % 2 === 0 ? 3 : -3);
        const hg = ctx.createGain(); hg.gain.value = 1 / (i * 2 + 1);
        o.connect(hg); hg.connect(g); o.start(t); o.stop(t + 1.4);
    });
    g.connect(master); routeWet(g);
}
// Marimba/vibes: sine with tight percussive decay
function vMarimba(ctx, t, freq, vol, master) {
    const g = vEnv(ctx, vol, 0.002, 0.45, t);
    const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = freq;
    // add a faint 4th harmonic for marimba colour
    const o2 = ctx.createOscillator(); o2.type = "sine"; o2.frequency.value = freq * 4;
    const g2 = ctx.createGain(); g2.gain.value = 0.08;
    o2.connect(g2); g2.connect(g);
    o.connect(g); g.connect(master); routeWet(g);
    o.start(t); o2.start(t); o.stop(t + 0.5); o2.stop(t + 0.5);
}
// Electric piano: FM sine pair (soft, warm)
function vEP(ctx, t, freq, vol, master) {
    const car = ctx.createOscillator(); car.type = "sine"; car.frequency.value = freq;
    const mod = ctx.createOscillator(); mod.type = "sine"; mod.frequency.value = freq * 1.999;
    const mg = ctx.createGain();
    mg.gain.setValueAtTime(freq * 1.2, t);
    mg.gain.exponentialRampToValueAtTime(0.5, t + 0.4);
    mod.connect(mg); mg.connect(car.frequency);
    const g = vEnv(ctx, vol, 0.005, 0.7, t);
    car.connect(g); g.connect(master); routeWet(g);
    mod.start(t); car.start(t); mod.stop(t + 0.8); car.stop(t + 0.8);
}
// Chime: triangle with high shimmer overtone, long tail
function vChime(ctx, t, freq, vol, master) {
    const g = vEnv(ctx, vol * 0.8, 0.002, 1.0, t);
    const o = ctx.createOscillator(); o.type = "triangle"; o.frequency.value = freq;
    const o2 = ctx.createOscillator(); o2.type = "sine"; o2.frequency.value = freq * 5.1;
    const g2 = ctx.createGain(); g2.gain.value = 0.12;
    o2.connect(g2); g2.connect(g);
    o.connect(g); g.connect(master); routeWet(g);
    o.start(t); o2.start(t); o.stop(t + 1.1); o2.stop(t + 1.1);
}

function phonkLead(ctx, t, semi) {
    const master = ensureMaster(); if (!master) return;
    const tr = TRACKS[PHONK.idx % TRACKS.length];
    const freq = midiHz(semi + 12);
    const vol = 0.10 * game.settings.musicVol;
    switch (tr.voice) {
        case "marimba": vMarimba(ctx, t, freq, vol, master); break;
        case "ep":      vEP(ctx, t, freq, vol, master); break;
        case "chime":   vChime(ctx, t, freq, vol * 1.1, master); break;
        default:        vPad(ctx, t, freq, vol * 0.9, master);
    }
}
// Lush ambient pad chord (slow, soft)
function phonkPad(ctx, t, root) {
    const master = ensureMaster(); if (!master) return;
    const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 1800; f.Q.value = 0.5;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.030 * game.settings.musicVol, t + 0.8);
    g.gain.linearRampToValueAtTime(0.0001, t + 2.4);
    [0, 4, 7, 11, 12].forEach(iv => {
        const o = ctx.createOscillator(); o.type = "sine";
        o.frequency.value = midiHz(root + iv - 12);
        o.detune.value = (Math.random() * 6 - 3);
        o.connect(f); o.start(t); o.stop(t + 2.5);
    });
    f.connect(g); g.connect(master); routeWet(g);
}


// ---------- Master audio bus: warm filter + compressor + reverb ----------
let masterGain = null, reverbNode = null, reverbSend = null;
function ensureMaster() {
    const ctx = getCtx(); if (!ctx) return null;
    if (masterGain) return masterGain;
    masterGain = ctx.createGain(); masterGain.gain.value = 0.75;
    const warm = ctx.createBiquadFilter(); warm.type = "lowpass"; warm.frequency.value = 5000; warm.Q.value = 0.5;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -20; comp.knee.value = 30; comp.ratio.value = 3;
    comp.attack.value = 0.006; comp.release.value = 0.25;
    masterGain.connect(warm); warm.connect(comp); comp.connect(ctx.destination);
    try {
        reverbNode = ctx.createConvolver();
        const len = ctx.sampleRate * 2.5, buf = ctx.createBuffer(2, len, ctx.sampleRate);
        for (let ch = 0; ch < 2; ch++) {
            const d = buf.getChannelData(ch);
            for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5);
        }
        reverbNode.buffer = buf;
        reverbSend = ctx.createGain(); reverbSend.gain.value = 0.35;
        reverbSend.connect(reverbNode); reverbNode.connect(masterGain);
    } catch (e) { reverbNode = null; }
    return masterGain;
}
function routeWet(node) { if (reverbSend) node.connect(reverbSend); }

// ---------- sequencer + track rotation ----------
// ambient chord movement (major/minor feels)
const PROG = [0, -3, 5, -2];
function phonkTick() {
    const ctx = getCtx(); if (!ctx) return;
    const tr = TRACKS[PHONK.idx % TRACKS.length];
    const t = ctx.currentTime + 0.02;
    const s = PHONK.step % 16;
    const key = worldKey();
    const barRoot = PROG[PHONK.bars % PROG.length] + key;
    if (s === 0) phonkPad(ctx, t, barRoot);
    if (tr.kick[s]) phonkKick(ctx, t);
    if (tr.hat[s]) phonkHat(ctx, t);
    const bn = tr.bell[s];
    if (bn !== null && bn !== undefined) phonkLead(ctx, t, bn + barRoot);
    if (tr.bass[s]) phonk808(ctx, t, barRoot);
    PHONK.step++;
    if (PHONK.step % 16 === 0) PHONK.bars++;
}
// each world has its own track + musical key so it sounds different
function worldTrackIdx() { return (game.worldIdx || 0) % TRACKS.length; }
function worldKey() {
    const keys = [0,-2,3,-5,5,-4,2,-7,7,1,-1,4,-3,6,-6,8,-8,2,-4,5];
    return keys[(game.worldIdx || 0) % keys.length] || 0;
}
function announceTrack() {
    const tr = TRACKS[PHONK.idx % TRACKS.length];
    const el = document.getElementById("now-playing");
    if (el) el.textContent = "♪ " + tr.name;
}
function curStepMs() { return (60000 / TRACKS[PHONK.idx % TRACKS.length].bpm) / 2; }

function startMusic() {
    if (PHONK.playing || !game.settings.musicOn) return;
    const ctx = getCtx(); if (!ctx) return;
    ensureMaster();
    PHONK.playing = true;
    PHONK.idx = worldTrackIdx();
    announceTrack();
    const loop = () => {
        if (!PHONK.playing) return;
        phonkTick();
        PHONK.timer = setTimeout(loop, curStepMs());
    };
    loop();
}
function stopMusic() { PHONK.playing = false; if (PHONK.timer) { clearTimeout(PHONK.timer); PHONK.timer = null; } }
function skipTrack() {
    PHONK.idx = (PHONK.idx + 1) % TRACKS.length; PHONK.step = 0; announceTrack();
    if (!PHONK.playing && game.settings.musicOn) startMusic();
}


// ---------- ROBUST audio unlock (fixes mobile/iOS no-sound) ----------
// On iOS, AudioContext MUST be created AND resumed inside a user-gesture handler.
function unlockAudio() {
    try {
        const ctx = createCtx(); // creates context if not yet made — must be inside gesture
        if (!ctx) return;
        if (ctx.state === "suspended") ctx.resume();
        // Silent 1-sample buffer tricks iOS into fully unlocking audio output
        const b = ctx.createBuffer(1, 1, ctx.sampleRate);
        const src = ctx.createBufferSource();
        src.buffer = b; src.connect(ctx.destination); src.start(0);
    } catch (e) {}
}
function startAudio() {
    unlockAudio(); // always call inside gesture so iOS context gets created
    if (audioStarted) {
        if (game.settings.musicOn && !PHONK.playing) startMusic();
        return;
    }
    audioStarted = true;
    ensureMaster();
    if (game.settings.musicOn) startMusic();
}
// attach to every gesture type for max mobile compatibility
["pointerdown","touchstart","touchend","click","keydown"].forEach(ev => {
    document.addEventListener(ev, function once() {
        startAudio();
    }, { once: true, passive: true });
});
// keep context alive on every interaction (iOS suspends AudioContext on app switch)
["pointerdown","touchstart","touchend"].forEach(ev => {
    document.addEventListener(ev, () => {
        if (!audioCtx) return;
        if (audioCtx.state === "suspended") audioCtx.resume();
        if (audioStarted && game.settings.musicOn && !PHONK.playing) startMusic();
    }, { passive: true });
});
document.addEventListener("visibilitychange", () => {
    if (!document.hidden && audioCtx && audioCtx.state === "suspended") audioCtx.resume();
});


// ============================================================
//  CORE MATH (NaN-safe) + prestige/dex multipliers
// ============================================================
function auraLevel(effect) {
    let lvl = 0;
    AURA_UPGRADES.forEach((u, i) => { if (u.effect === effect) lvl = game.auraUpgrades[i] || 0; });
    return lvl;
}
function auraMult(effect) { return 1 + auraLevel(effect) * (AURA_UPGRADES.find(u=>u.effect===effect).per); }
function rebirthBonus() { return 1 + (game.rebirths || 0) * 0.25; }

function completedWorlds() {
    let c = 0;
    for (let w = 0; w < WORLDS.length; w++) {
        let all = true;
        allPetsForWorld().forEach(p => { if (!game.discovered[dexKey(w, p.name)]) all = false; });
        if (all) c++;
    }
    return c;
}
function dexBonus() { return 1 + completedWorlds() * 0.03; } // +3% per fully-dex'd world

function getClickPower() {
    let p = game.baseClickPower || 1;
    UPGRADES.forEach((u, i) => { if (u.type === "click" && game.upgrades[i]) p += (u.clickPower||0) * game.upgrades[i]; });
    return p * rebirthBonus() * auraMult("click") * dexBonus();
}
function getPassive() {
    let p = 0;
    UPGRADES.forEach((u, i) => { if (u.type === "passive" && game.upgrades[i]) p += (u.passivePower||0) * game.upgrades[i]; });
    return p * rebirthBonus() * auraMult("passive") * dexBonus();
}
function getPetMult() {
    let m = 1;
    (game.equippedPets || []).forEach(p => { m *= (p.power || 1); });
    return m;
}
function upgradeCost(i) {
    const u = UPGRADES[i]; if (!u) return Infinity;
    return Math.floor(u.baseCost * Math.pow(1.15, game.upgrades[i] || 0));
}
function getRebirthCost() { return 1000000 * Math.pow(3, game.rebirths || 0); }
function auraGainPreview() {
    return Math.max(1, Math.floor(Math.pow(game.rebirths + 1, 1.35) * auraMult("auragain")));
}
function auraUpCost(i) {
    const u = AURA_UPGRADES[i]; return Math.floor(u.base * Math.pow(1.7, game.auraUpgrades[i] || 0));
}
function initUpgrades() {
    if (!game.upgrades) game.upgrades = {};
    UPGRADES.forEach((_, i) => { if (typeof game.upgrades[i] !== "number") game.upgrades[i] = 0; });
    if (!game.auraUpgrades) game.auraUpgrades = {};
    if (!game.discovered) game.discovered = {};
}


// ============================================================
//  SAVE / LOAD (+ offline earnings)
// ============================================================
const SAVE_KEY = "fartSave_v5";
let offlinePending = 0;
function saveGame() {
    try { game.lastSeen = Date.now(); localStorage.setItem(SAVE_KEY, JSON.stringify(game)); } catch (e) {}
}
function loadGame() {
    try {
        const s = localStorage.getItem(SAVE_KEY);
        if (s) {
            const p = JSON.parse(s);
            if (p && typeof p === "object") {
                const defS = game.settings;
                game = Object.assign(game, p);
                game.settings = Object.assign(defS, p.settings || {});
            }
        }
    } catch (e) {}
    if (!game.maxPets) game.maxPets = 3;
    if (!Array.isArray(game.pets)) game.pets = [];
    if (!Array.isArray(game.equippedPets)) game.equippedPets = [];
    if (typeof game.points !== "number" || isNaN(game.points)) game.points = 0;
    if (typeof game.worldIdx !== "number") game.worldIdx = 0;
    if (typeof game.rebirths !== "number") game.rebirths = 0;
    if (typeof game.aura !== "number") game.aura = 0;
    initUpgrades();
    indexWorld = game.worldIdx;
    computeOffline();
}
function computeOffline() {
    const now = Date.now();
    const elapsed = Math.min((now - (game.lastSeen || now)) / 1000, 8 * 3600);
    const rate = getPassive() * getPetMult();
    offlinePending = Math.floor(rate * elapsed * 0.5);
    if (offlinePending > 10 && elapsed > 30) {
        const amt = document.getElementById("offline-amount");
        if (amt) amt.innerText = fmt(offlinePending) + " 💨";
        const m = document.getElementById("offline-modal"); if (m) m.classList.remove("hidden");
    } else offlinePending = 0;
}
function claimOffline() {
    game.points += offlinePending; offlinePending = 0;
    const m = document.getElementById("offline-modal"); if (m) m.classList.add("hidden");
    sfxBuy(); burstAt(window.innerWidth/2, window.innerHeight/2, "#7FFF00", 24); updateDisplay(); saveGame();
}


// ============================================================
//  MAIN CLICK + COMBO
// ============================================================
function handleMainClick(e) {
    startAudio();
    const now = Date.now();
    const dt = now - lastClickTime;
    const comboGain = 7 * auraMult("combo");
    if (dt < 400 && dt >= 0) { clickStreak++; comboValue = Math.min(comboValue + comboGain, 100); }
    else clickStreak = 0;
    lastClickTime = now;
    spamMultiplier = 1 + (comboValue / 100) * 2.5;
    game.totalClicks++;

    const critChance = Math.min(0.05 + comboValue * 0.0015, 0.25);
    criticalMultiplier = 1;
    if (Math.random() < critChance) { criticalMultiplier = 3 + Math.random() * 4; showCritFx(e); }

    let dmg = getClickPower() * spamMultiplier * getPetMult() * criticalMultiplier;
    if (isNaN(dmg) || dmg < 0) dmg = 1;
    game.points += dmg; game.totalEarned += dmg;

    sfxClick();
    floatText(e.clientX, e.clientY, "+" + fmt(dmg), criticalMultiplier > 1 ? "#FFD54A" : (comboValue > 60 ? "#00E0FF" : "#7FFF00"), criticalMultiplier > 1);
    if (comboValue > 50 && Math.random() < 0.4) ringAt(e.clientX, e.clientY, comboValue > 80 ? "#FF3D9A" : "#00E0FF");
    clickPuff(e.clientX, e.clientY);
    popButton();
    maybeBrainrotPop();
    refreshCombo();
    updateDisplay();
    if (upgradesRendered && sheetOpen("upgrades")) renderUpgradeTabs();
    saveGame();
}
function refreshCombo() {
    const bar = document.getElementById("combo-bar"), label = document.getElementById("combo-label");
    if (bar) { bar.style.width = comboValue + "%"; }
    if (label) label.innerText = "COMBO x" + spamMultiplier.toFixed(1);
    const mb = document.getElementById("main-btn");
    if (mb) mb.classList.toggle("on-fire", comboValue > 75);
    const decayRate = 4 / auraMult("combo");
    if (comboDecayTimer) clearInterval(comboDecayTimer);
    comboDecayTimer = setInterval(() => {
        comboValue = Math.max(0, comboValue - decayRate);
        spamMultiplier = 1 + (comboValue / 100) * 2.5;
        if (bar) bar.style.width = comboValue + "%";
        if (label) label.innerText = "COMBO x" + spamMultiplier.toFixed(1);
        if (mb) mb.classList.toggle("on-fire", comboValue > 75);
        if (comboValue <= 0) { clearInterval(comboDecayTimer); comboDecayTimer = null; }
    }, 200);
}
const BRAINROT_POPS = ["SKIBIDI! 🚽","RIZZ +∞ 😎","GYATT! 🍑","ONLY IN OHIO 🌽","SHEEESH 🗣️","SIGMA GRINDSET 🗿","FANUM TAX 🍔","W RIZZ 🔥","MEWING 😐","GET REAL 💀","NO CAP 🧢","BUSSIN 🤤","it's giving 💅","CAUGHT IN 4K 📸"];
function maybeBrainrotPop() {
    if (!game.settings.brainrot) return;
    if (Math.random() < 0.02) showToast(BRAINROT_POPS[Math.floor(Math.random()*BRAINROT_POPS.length)], 1500);
}


function levelCost(i, lvl) { return Math.floor(UPGRADES[i].baseCost * Math.pow(1.15, lvl)); }
// how many levels you'd buy in current mode, and total cost
function bulkInfo(i) {
    const cur = game.upgrades[i] || 0;
    let count = 0, total = 0;
    const cap = (buyMode === "max") ? 100000 : buyMode;
    let pts = game.points;
    for (let k = 0; k < cap; k++) {
        const c = levelCost(i, cur + k);
        if (buyMode === "max") { if (pts < c) break; pts -= c; }
        total += c; count++;
    }
    if (buyMode !== "max") { // fixed mode: affordable only if can pay full batch
        return { count: count, total: total, affordable: game.points >= total };
    }
    return { count: count, total: total, affordable: count > 0 };
}
function upCard(i) {
    const u = UPGRADES[i], lvl = game.upgrades[i] || 0;
    const info = bulkInfo(i);
    const ok = info.affordable && info.count > 0;
    const stat = u.type === "click" ? "+" + fmt(u.clickPower) + " / click" : "+" + fmt(u.passivePower) + " / sec";
    const buyLabel = (buyMode === "max") ? ("MAX (" + (info.count||0) + ")") : ("x" + buyMode);
    return '<button class="up-card ' + (ok ? "" : "locked") + '" onclick="buyUpgrade(' + i + ')">' +
        '<div class="up-ico">' + u.icon + '</div>' +
        '<div class="up-mid"><div class="up-name">' + u.name + ' <span class="buy-badge">' + buyLabel + '</span></div>' +
        '<div class="up-stat">' + stat + '</div><div class="up-cost">' + fmt(info.total) + ' 💨</div></div>' +
        '<div class="up-lvl">Lv ' + lvl + '</div></button>';
}
function renderUpgradeTabs() {
    let c = "", p = "", s = "";
    UPGRADES.forEach((u, i) => { if (u.type === "click") c += upCard(i); else p += upCard(i); });
    PET_SLOTS.forEach((u, idx) => {
        if (game.maxPets >= u.slot) return;
        const lockedRb = game.rebirths < (u.reqRebirths || 0);
        const ok = game.points >= u.cost && !lockedRb;
        const sub = lockedRb ? ('🔒 Needs ' + u.reqRebirths + ' rebirths') : 'Equip one more pet';
        s += '<button class="up-card ' + (ok ? "" : "locked") + '" onclick="buyPetSlot(' + idx + ')">' +
            '<div class="up-ico">🐾</div><div class="up-mid"><div class="up-name">Pet Slot ' + u.slot + '</div>' +
            '<div class="up-stat">' + sub + '</div><div class="up-cost">' + fmt(u.cost) + ' 💨</div></div></button>';
    });
    if (!s) s = '<p class="empty-text">All pet slots unlocked! 🎉</p>';
    const ce = document.getElementById("up-click"), pe = document.getElementById("up-passive"), se = document.getElementById("up-slots");
    if (ce) ce.innerHTML = c; if (pe) pe.innerHTML = p; if (se) se.innerHTML = s;
    upgradesRendered = true;
}


// ============================================================
//  BUYING
// ============================================================
function buyUpgrade(i) {
    const u = UPGRADES[i]; if (!u) return;
    const info = bulkInfo(i);
    if (info.count > 0 && info.affordable && game.points >= info.total) {
        game.points -= info.total; game.upgrades[i] = (game.upgrades[i] || 0) + info.count;
        sfxBuy(); updateDisplay(); renderUpgradeTabs(); saveGame();
    } else sfxError();
}
function setBuyMode(m, btn) {
    buyMode = m;
    document.querySelectorAll("#sheet-upgrades .buymode-btn").forEach(b => b.classList.remove("active"));
    if (btn) btn.classList.add("active");
    renderUpgradeTabs();
}
function buyPetSlot(idx) {
    const u = PET_SLOTS[idx]; if (!u) return;
    if (game.rebirths < (u.reqRebirths || 0)) { sfxError(); showToast("🔒 Needs " + u.reqRebirths + " rebirths!", 2200); return; }
    if (game.points >= u.cost) {
        game.points -= u.cost; if (u.slot > game.maxPets) game.maxPets = u.slot;
        sfxBuy(); burstAt(window.innerWidth/2, window.innerHeight*0.4, "#7FFF00", 22); updateDisplay(); renderUpgradeTabs(); renderPets(); saveGame();
        showToast("🐾 Pet slot " + u.slot + " unlocked!", 2000);
    } else sfxError();
}

// ============================================================
//  BOTTOM SHEETS
// ============================================================
function sheetOpen(name) { const s = document.getElementById("sheet-" + name); return s && s.classList.contains("open"); }
function openSheet(name) {
    closeSheet();
    const sheet = document.getElementById("sheet-" + name), overlay = document.getElementById("sheet-overlay");
    if (!sheet || !overlay) return;
    if (name === "upgrades") renderUpgradeTabs();
    if (name === "pets") renderPetSheet();
    if (name === "worlds") renderWorlds();
    if (name === "aura") renderAura();
    if (name === "settings") syncSettingsUI();
    overlay.classList.add("visible"); sheet.classList.add("open");
    // highlight the active nav button
    document.querySelectorAll(".nav-btn").forEach(b => {
        b.classList.toggle("sel", b.dataset.sheet === name);
    });
}
function closeSheet() {
    document.querySelectorAll(".sheet").forEach(s => s.classList.remove("open"));
    const overlay = document.getElementById("sheet-overlay"); if (overlay) overlay.classList.remove("visible");
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("sel"));
}
function showUpTab(name, btn) {
    document.querySelectorAll("#sheet-upgrades .up-tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll("#sheet-upgrades .stab").forEach(b => b.classList.remove("active"));
    const tab = document.getElementById("up-" + name); if (tab) tab.classList.add("active");
    if (btn) btn.classList.add("active");
}


// ============================================================
//  SETTINGS
// ============================================================
function setMusicVol(v) { game.settings.musicVol = v/100; const e=document.getElementById("music-vol-val"); if(e)e.innerText=v+"%"; saveGame(); }
function setSfxVol(v) { game.settings.sfxVol = v/100; const e=document.getElementById("sfx-vol-val"); if(e)e.innerText=v+"%"; sfxClick(); saveGame(); }
function toggleSetting(key, btn) {
    game.settings[key] = !game.settings[key];
    const pill = btn.querySelector(".toggle-pill");
    if (pill) { pill.innerText = game.settings[key] ? "ON" : "OFF"; btn.classList.toggle("off", !game.settings[key]); }
    if (key === "musicOn") { game.settings.musicOn ? startAudio() : stopMusic(); }
    if (key === "particles") { const o=document.getElementById("particle-overlay"); if(o)o.style.display=game.settings.particles?"block":"none"; }
    saveGame();
}
function syncSettingsUI() {
    const mv=document.getElementById("music-vol"), sv=document.getElementById("sfx-vol");
    if (mv) mv.value = Math.round(game.settings.musicVol*100);
    if (sv) sv.value = Math.round(game.settings.sfxVol*100);
    const mvv=document.getElementById("music-vol-val"); if(mvv)mvv.innerText=Math.round(game.settings.musicVol*100)+"%";
    const svv=document.getElementById("sfx-vol-val"); if(svv)svv.innerText=Math.round(game.settings.sfxVol*100)+"%";
    [["tg-music","musicOn"],["tg-particles","particles"],["tg-shake","screenShake"],["tg-brainrot","brainrot"]].forEach(([id,k])=>{
        const b=document.getElementById(id); if(!b)return; const p=b.querySelector(".toggle-pill");
        if(p)p.innerText=game.settings[k]?"ON":"OFF"; b.classList.toggle("off",!game.settings[k]);
    });
}
function exportSave() { try{navigator.clipboard.writeText(btoa(JSON.stringify(game)));showToast("📋 Save copied!",2200);}catch(e){showToast("Export failed",1500);} }
function importSave() { const c=prompt("Paste save code:"); if(!c)return; try{game=Object.assign(game,JSON.parse(atob(c)));initUpgrades();updateDisplay();saveGame();showToast("✅ Imported!",2000);}catch(e){showToast("❌ Invalid code",2000);} }
function hardReset() { if(!confirm("Wipe EVERYTHING?"))return; localStorage.removeItem(SAVE_KEY); location.reload(); }

// ============================================================
//  REBIRTH + WORLDS
// ============================================================
function rebirth() {
    const cost = getRebirthCost();
    if (game.points < cost) { sfxError(); showToast("❌ Need " + fmt(cost) + " Stink to Rebirth!", 2500); return; }
    const gain = auraGainPreview();
    game.rebirths++; game.aura += gain;
    game.points = 0; game.upgrades = {}; initUpgrades();
    comboValue = 0; spamMultiplier = 1;
    sfxRare(4); screenFlash("#ffd54a"); shake(); shockwave("#ffd54a"); emojiRain(["🔄","✦","💨","🌟"], 24);
    updateDisplay(); renderUpgradeTabs(); renderWorlds(); saveGame();
    bigBanner("REBIRTH #" + game.rebirths, "#ffd54a");
    showToast("🔄 REBORN! +25% power · +" + gain + " ✦ Aura!", 3200);
}
function renderWorlds() {
    let html = '<div class="world-grid">';
    WORLDS.forEach((w, i) => {
        const unlocked = game.rebirths >= w.reqRebirths, current = game.worldIdx === i;
        html += '<div class="world-card ' + (unlocked?"unlocked":"locked") + (current?" current":"") +
            '" onclick="' + (unlocked?"selectWorld("+i+")":"") + '"><div class="world-icon">' + w.icon + '</div>' +
            '<div class="world-name">' + w.name + '</div><div class="world-req">' +
            (unlocked?(current?"★ Current":"Travel"):"🔒 "+w.reqRebirths+" RB") + '</div></div>';
    });
    html += '</div>';
    const el = document.getElementById("worlds-body"); if (el) el.innerHTML = html;
}
function selectWorld(i) {
    const w = WORLDS[i]; if (!w || game.rebirths < w.reqRebirths) { sfxError(); return; }
    game.worldIdx = i; indexWorld = i; sfxBuy(); updateDisplay(); renderWorlds(); saveGame();
    PHONK.idx = worldTrackIdx(); PHONK.step = 0; announceTrack();
    applyWorldTheme();
    screenFlash(w.theme && w.theme.p ? w.theme.p : "#ffd54a");
    showToast("🌍 Travelled to " + w.name + " · 🎵 " + TRACKS[PHONK.idx].name, 2400);
}


// ============================================================
//  AURA (prestige shop)
// ============================================================
function renderAura() {
    let html = '<div class="aura-hero"><div class="aura-bal">✦ ' + fmt(game.aura) + '</div>' +
        '<div class="aura-sub">Aura · permanent power. Next rebirth grants <b>+' + auraGainPreview() + ' ✦</b></div></div>';
    html += '<div class="aura-list">';
    AURA_UPGRADES.forEach((u, i) => {
        const lvl = game.auraUpgrades[i] || 0;
        const maxed = u.max && lvl >= u.max;
        const cost = auraUpCost(i), ok = game.aura >= cost && !maxed;
        html += '<button class="aura-card ' + (ok?"":"locked") + (maxed?" maxed":"") + '" onclick="buyAura(' + i + ')">' +
            '<div class="up-ico">' + u.icon + '</div><div class="up-mid">' +
            '<div class="up-name">' + u.name + '</div><div class="up-stat">' + u.desc + '</div>' +
            '<div class="aura-cost">' + (maxed ? "✅ UNLOCKED" : "✦ " + fmt(cost)) + '</div></div><div class="up-lvl">' + (u.max ? (maxed?"MAX":"") : "Lv " + lvl) + '</div></button>';
    });
    html += '</div>';
    const el = document.getElementById("aura-body"); if (el) el.innerHTML = html;
}
function buyAura(i) {
    const u = AURA_UPGRADES[i]; if (!u) return;
    const lvl = game.auraUpgrades[i] || 0;
    if (u.max && lvl >= u.max) { sfxError(); return; }
    const cost = auraUpCost(i);
    if (game.aura >= cost) {
        game.aura -= cost; game.auraUpgrades[i] = lvl + 1;
        sfxRare(2); burstAt(window.innerWidth/2, window.innerHeight*0.4, "#b14eff", 18);
        renderAura(); updateDisplay(); saveGame();
        if (u.effect === "multi" || u.effect === "mega") showToast("🥚 Multi-hatch unlocked!", 2200);
    } else sfxError();
}

// ============================================================
//  PETS SHEET (tabs: collection / fuse / index)
// ============================================================
function renderPetSheet() {
    if (petTabCur === "collection") renderPets();
    else if (petTabCur === "fuse") renderFuse();
    else renderIndex();
}
function showPetTab(name, btn) {
    petTabCur = name;
    document.querySelectorAll("#sheet-pets .stab").forEach(b => b.classList.remove("active"));
    if (btn) btn.classList.add("active");
    renderPetSheet();
}


function petChip(p, equipped) {
    const r = RARITY[p.rarity] || RARITY.common;
    const stars = p.star ? '<span class="pet-stars">' + "⭐".repeat(Math.min(p.star,5)) + '</span>' : '';
    return '<div class="pet-chip ' + (equipped?"equipped":"") + '" style="border-color:' + r.color + ';color:' + r.color + '" onclick="openPetModal(' + p.id + ')">' +
        '<span class="pet-chip-emoji">' + (p.emoji||"🐾") + '</span>' + stars +
        '<span class="pet-chip-name">' + p.name + '</span>' +
        '<span class="pet-chip-pow">' + p.power.toFixed(2) + 'x</span>' +
        (equipped?'<span class="pet-chip-badge">✓</span>':'') + '</div>';
}
function renderPets() {
    const pets = game.pets||[], eq = game.equippedPets||[];
    let html = '<button class="action-btn" onclick="openEggModal()">🥚 Open Eggs</button>';
    html += '<div class="pet-block-title">Equipped (' + eq.length + '/' + (game.maxPets||3) + ') · Total Boost x' + getPetMult().toFixed(2) + '</div><div class="pet-grid">';
    if (eq.length===0) html += '<p class="empty-text">Equip pets to multiply click power!</p>';
    else eq.forEach(p => { html += petChip(p, true); });
    html += '</div><div class="pet-block-title">Collection (' + pets.length + ')</div><div class="pet-grid">';
    if (pets.length===0) html += '<p class="empty-text">No pets yet — open an egg!</p>';
    else pets.forEach(p => { html += petChip(p, eq.some(q=>q.id===p.id)); });
    html += '</div>';
    const el = document.getElementById("pets-body"); if (el) el.innerHTML = html;
}

// ---------- FUSION: combine 3 identical pets into a stronger one ----------
function fuseGroups() {
    const map = {};
    (game.pets||[]).forEach(p => {
        const key = p.name + "|" + (p.star||0);
        if (!map[key]) map[key] = { name: p.name, emoji: p.emoji, rarity: p.rarity, star: p.star||0, items: [] };
        map[key].items.push(p);
    });
    return Object.values(map);
}
// ---------- FUSION: combine N identical pets → one ⭐ stronger pet ----------
const MAX_STAR = 5;
function fuseNeeded(star) { return Math.min(4 + star * 4, 20); } // 4,8,12,16,20 — caps at 20
function renderFuse() {
    let html = '<p class="fuse-info">Fuse identical pets into a ⭐ stronger one (2.2x power each star). Higher stars need more pets — starts at 4, scales up, max <b>' + MAX_STAR + '⭐</b>.</p><div class="pet-grid">';
    const groups = fuseGroups();
    const fusable = groups.filter(g => g.star < MAX_STAR && g.items.length >= fuseNeeded(g.star));
    if (fusable.length === 0) html += '<p class="empty-text">No fusions ready. Collect more copies of the same pet (same ⭐ level).</p>';
    else fusable.forEach(g => {
        const r = RARITY[g.rarity] || RARITY.common;
        const stars = g.star ? "⭐".repeat(g.star) : "";
        const need = fuseNeeded(g.star);
        html += '<div class="fuse-card" style="border-color:' + r.color + '">' +
            '<span class="pet-chip-emoji">' + g.emoji + '</span><span class="pet-stars">' + stars + '</span>' +
            '<span class="pet-chip-name" style="color:' + r.color + '">' + g.name + '</span>' +
            '<span class="fuse-count">' + g.items.length + ' / ' + need + '</span>' +
            '<button class="fuse-btn" onclick="fusePet(\'' + g.name.replace(/'/g,"\\'") + '\',' + g.star + ')">FUSE ' + need + ' →</button></div>';
    });
    html += '</div>';
    // also show groups that are close but not ready
    const pending = groups.filter(g => g.star < MAX_STAR && g.items.length < fuseNeeded(g.star) && g.items.length > 1);
    if (pending.length) {
        html += '<div class="pet-block-title">In progress</div><div class="pet-grid">';
        pending.forEach(g => {
            const r = RARITY[g.rarity] || RARITY.common;
            html += '<div class="fuse-card dim" style="border-color:' + r.color + '">' +
                '<span class="pet-chip-emoji">' + g.emoji + '</span>' +
                '<span class="pet-chip-name" style="color:' + r.color + '">' + g.name + '</span>' +
                '<span class="fuse-count">' + g.items.length + ' / ' + fuseNeeded(g.star) + '</span></div>';
        });
        html += '</div>';
    }
    const el = document.getElementById("pets-body"); if (el) el.innerHTML = html;
}
function fusePet(name, star) {
    if (star >= MAX_STAR) { sfxError(); showToast("⭐ Max star reached!", 1800); return; }
    const need = fuseNeeded(star);
    const matches = (game.pets||[]).filter(p => p.name === name && (p.star||0) === star);
    if (matches.length < need) { sfxError(); return; }
    matches.sort((a,b) => b.power - a.power);
    const consumed = matches.slice(0, need);
    const ids = consumed.map(p => p.id);
    game.equippedPets = (game.equippedPets||[]).filter(p => !ids.includes(p.id));
    game.pets = game.pets.filter(p => !ids.includes(p.id));
    const top = consumed[0];
    const fused = { id: Date.now()+Math.floor(Math.random()*100000), name: top.name, emoji: top.emoji,
        rarity: top.rarity, star: (star||0)+1, power: +(top.power * 2.2).toFixed(2) };
    game.pets.push(fused);
    sfxRare(4); screenFlash(RARITY[fused.rarity].color); burstAt(window.innerWidth/2, window.innerHeight*0.4, RARITY[fused.rarity].color, 36); shake(); emojiRain(["✨","⭐",fused.emoji],18);
    showToast("✨ Fused " + fused.name + " " + "⭐".repeat(fused.star) + " (" + fused.power.toFixed(2) + "x)!", 3000);
    renderFuse(); updateDisplay(); saveGame();
}


// ============================================================
//  PET INDEX (Pokédex) — per world, silhouettes for undiscovered
// ============================================================
function renderIndex() {
    const allPets = allPetsForWorld();
    // world selector chips (unlocked worlds only)
    let chips = '<div class="dex-worlds">';
    WORLDS.forEach((w, i) => {
        if (game.rebirths < w.reqRebirths) return;
        chips += '<button class="dex-chip ' + (indexWorld===i?"active":"") + '" onclick="setIndexWorld(' + i + ')">' + w.icon + ' ' + w.name + '</button>';
    });
    chips += '</div>';

    const found = allPets.filter(p => game.discovered[dexKey(indexWorld, p.name)]).length;
    const pct = Math.round((found / allPets.length) * 100);
    let bar = '<div class="dex-progress"><div class="dex-bar" style="width:' + pct + '%"></div></div>' +
        '<div class="dex-count">' + found + '/' + allPets.length + ' discovered · ' + pct + '%' +
        (found === allPets.length ? ' · ✅ COMPLETE (+3% global!)' : '') + '</div>';

    let grid = '<div class="dex-grid">';
    allPets.forEach(p => {
        const r = RARITY[p.rarity] || RARITY.common;
        const got = game.discovered[dexKey(indexWorld, p.name)];
        const pw = petPower(p.base, indexWorld);
        grid += '<div class="dex-cell ' + (got?"found":"locked") + '" style="border-color:' + (got?r.color:"rgba(120,110,160,0.3)") + '">' +
            '<span class="dex-emoji ' + (got?"":"silhouette") + '">' + p.emoji + '</span>' +
            '<span class="dex-name" style="color:' + (got?r.color:"#6b6088") + '">' + (got?p.name:"???") + '</span>' +
            '<span class="dex-rarity" style="color:' + (got?r.color:"#6b6088") + '">' + (got?r.label:"???") + '</span>' +
            '<span class="dex-pow">' + (got?pw.toFixed(2)+"x":"—") + '</span></div>';
    });
    grid += '</div>';

    const dexBonusPct = Math.round((dexBonus()-1)*100);
    const footer = '<div class="dex-footer">🏆 Dex Bonus: <b>+' + dexBonusPct + '% to all income</b> (' + completedWorlds() + ' worlds completed)</div>';
    const el = document.getElementById("pets-body");
    if (el) el.innerHTML = chips + bar + grid + footer;
}
function setIndexWorld(i) { indexWorld = i; renderIndex(); }


// ============================================================
//  PET DETAIL MODAL
// ============================================================
let selectedPetId = null;
function openPetModal(id) {
    selectedPetId = id;
    const p = (game.pets||[]).find(x => x.id === id); if (!p) return;
    const r = RARITY[p.rarity] || RARITY.common;
    const equipped = (game.equippedPets||[]).some(x => x.id === id);
    const stars = p.star ? "⭐".repeat(Math.min(p.star,5)) : "";
    const d = document.getElementById("pet-details");
    if (d) d.innerHTML = '<div class="pet-modal-emoji" style="filter:drop-shadow(0 0 18px ' + r.color + ')">' + (p.emoji||"🐾") + '</div>' +
        '<div class="pet-modal-rarity" style="color:' + r.color + '">' + r.label + ' ' + stars + '</div>' +
        '<h3 class="pet-modal-name">' + p.name + '</h3>' +
        '<div class="pet-modal-row">Click Multiplier <b>' + p.power.toFixed(2) + 'x</b></div>' +
        '<div class="pet-modal-row">Status <b>' + (equipped?"✅ Equipped":"Not equipped") + '</b></div>';
    const b = document.getElementById("equip-btn"); if (b) b.innerText = equipped ? "Unequip" : "Equip";
    const m = document.getElementById("pet-modal"); if (m) m.classList.remove("hidden");
}
function closePetModal() { const m=document.getElementById("pet-modal"); if(m)m.classList.add("hidden"); selectedPetId=null; }
function equipPet() {
    const p = (game.pets||[]).find(x => x.id === selectedPetId); if (!p) return;
    const equipped = (game.equippedPets||[]).some(x => x.id === selectedPetId);
    if (equipped) game.equippedPets = game.equippedPets.filter(x => x.id !== selectedPetId);
    else {
        if (game.equippedPets.length >= (game.maxPets||3)) { sfxError(); showToast("All slots full! Unlock more in Upgrades.", 2200); return; }
        game.equippedPets.push(p); sfxBuy();
    }
    closePetModal(); updateDisplay(); renderPets(); saveGame();
}

// ============================================================
//  EGG SHOP + ROLL (Lucky Aura + discovery)
// ============================================================
let hatchQueue = [];
function openEggModal() { closeSheet(); renderEggShop(); const m=document.getElementById("egg-modal"); if(m)m.classList.remove("hidden"); }
function closeEggModal() { const m=document.getElementById("egg-modal"); if(m)m.classList.add("hidden"); }
function renderEggShop() {
    const bal = document.getElementById("egg-balance"); if (bal) bal.innerText = fmt(game.points);
    const multiLvl = auraLevel("multi"), megaLvl = auraLevel("mega");
    let html = '<div class="egg-grid">';
    EGG_TEMPLATES.forEach((egg, idx) => {
        const cost = eggCost(egg, game.worldIdx), ok = game.points >= cost;
        let odds = egg.pets.map(p => { const r=RARITY[p.rarity];
            return '<div class="odds-row"><span style="color:' + r.color + '">' + p.emoji + ' ' + p.name + '</span><span class="odds-pct">' + p.odds + '%</span></div>'; }).join("");
        let multiBtns = '';
        if (multiLvl > 0 && game.points >= cost*3) multiBtns += '<button class="egg-buy-multi" onclick="rollEggMulti(' + idx + ',3)">x3 · ' + fmt(cost*3) + '</button>';
        if (megaLvl > 0 && game.points >= cost*10) multiBtns += '<button class="egg-buy-multi mega" onclick="rollEggMulti(' + idx + ',10)">x10 · ' + fmt(cost*10) + '</button>';
        html += '<div class="egg-card" style="border-color:' + egg.color + '">' +
            '<div class="egg-emoji" style="filter:drop-shadow(0 0 12px ' + egg.color + ')">' + egg.emoji + '</div>' +
            '<div class="egg-name" style="color:' + egg.color + '">' + egg.name + '</div>' +
            '<div class="egg-odds">' + odds + '</div>' +
            '<button class="egg-buy ' + (ok?"":"locked") + '" onclick="rollEgg(' + idx + ')">Open · ' + fmt(cost) + '</button>' +
            multiBtns + '</div>';
    });
    html += '</div>';
    const sel = document.getElementById("egg-selection"); if (sel) sel.innerHTML = html;
}
function rollEggMulti(idx, count) {
    const egg = EGG_TEMPLATES[idx]; if (!egg) return;
    const cost = eggCost(egg, game.worldIdx) * count;
    if (game.points < cost) { sfxError(); showToast("❌ Not enough Stink!", 1500); return; }
    game.points -= cost;
    const results = [];
    for (let i=0; i<count; i++) {
        const chosen = pickFromEgg(egg);
        const pet = { id: Date.now()+Math.floor(Math.random()*100000)+i, name: chosen.name, emoji: chosen.emoji,
            rarity: chosen.rarity, star: 0, power: petPower(chosen.base, game.worldIdx) };
        game.pets.push(pet);
        game.discovered[dexKey(game.worldIdx, pet.name)] = true;
        results.push({ pet, egg });
    }
    updateDisplay(); saveGame();
    // queue all hatches — first plays immediately, rest queued
    hatchQueue = results.slice(1);
    playHatch(results[0].pet, results[0].egg);
}
function pickFromEgg(egg) {
    let roll = Math.random() * 100, chosen = egg.pets[0];
    for (const p of egg.pets) { if (roll < p.odds) { chosen = p; break; } roll -= p.odds; }
    return chosen;
}
function rollEgg(idx) {
    const egg = EGG_TEMPLATES[idx]; if (!egg) return;
    const cost = eggCost(egg, game.worldIdx);
    if (game.points < cost) { sfxError(); showToast("❌ Not enough Stink!", 1500); return; }
    game.points -= cost;
    // Lucky Aura: take best of (1+luck) rolls
    const tries = 1 + Math.min(auraLevel("luck"), 5);
    let chosen = pickFromEgg(egg);
    for (let k = 1; k < tries; k++) { const c = pickFromEgg(egg); if (RARITY[c.rarity].tier > RARITY[chosen.rarity].tier) chosen = c; }
    const pet = { id: Date.now()+Math.floor(Math.random()*100000), name: chosen.name, emoji: chosen.emoji,
        rarity: chosen.rarity, star: 0, power: petPower(chosen.base, game.worldIdx) };
    game.pets.push(pet);
    game.discovered[dexKey(game.worldIdx, pet.name)] = true;
    updateDisplay(); saveGame();
    playHatch(pet, egg);
}


// ============================================================
//  HATCH ANIMATION — heavy FX, rarity-scaled
// ============================================================
function playHatch(pet, egg) {
    hatchActive = true; pendingHatch = pet;
    const r = RARITY[pet.rarity] || RARITY.common;
    const overlay = document.getElementById("hatch-overlay");
    const eggEl = document.getElementById("hatch-egg");
    const resEl = document.getElementById("hatch-result");
    const rays = document.getElementById("hatch-rays");
    const skip = document.getElementById("hatch-skip");
    if (!overlay || !eggEl || !resEl) return;
    closeEggModal();

    resEl.innerHTML = ""; resEl.className = "hatch-result";
    eggEl.textContent = egg.emoji; eggEl.className = "hatch-egg shaking"; eggEl.style.filter = "";
    rays.style.opacity = "0"; rays.classList.remove("spin");
    rays.style.background = "conic-gradient(from 0deg," + r.color + "00," + r.color + "66," + r.color + "00," + r.color + "66," + r.color + "00)";
    overlay.style.setProperty("--rc", r.color);
    overlay.className = "hatch-overlay tier" + r.tier;
    skip.style.opacity = "0"; skip.style.pointerEvents = "none";
    overlay.classList.remove("hidden");
    sfxWhoosh();

    // charge glow + crack ticks during shake (intensity by tier)
    let ticks = 0;
    const tickInterval = Math.max(60, 140 - r.tier * 20);
    const chargeInt = setInterval(() => {
        tone(200 + ticks * 40, 0.08, "sine", 0.06 + r.tier * 0.015);
        sparkleRise(r.color);
        if (r.tier >= 3 && ticks % 2 === 0) sparkleRise(r.color);
        if (r.tier >= 5) sparkleRise("#ffffff");
        ticks++;
    }, tickInterval);

    const shakeTime = 700 + r.tier * 250; // longer build-up for rarer pets
    setTimeout(() => {
        clearInterval(chargeInt);
        // BURST — scales hard with tier
        eggEl.className = "hatch-egg burst";
        shockwave(r.color);
        spawnConfetti(r.color, 20 + r.tier * 40);
        if (r.tier >= 1) { screenFlash(r.color); }
        if (r.tier >= 2) { lightBurst(r.color); shockwave(r.color); spawnConfetti(r.color, 30); }
        if (r.tier >= 3) { shake(); rays.style.opacity = "1"; rays.classList.add("spin"); screenFlash(r.color); burstAt(window.innerWidth/2, window.innerHeight*0.4, r.color, 40); }
        if (r.tier >= 4) { emojiRain([pet.emoji,"🌟","✨","💫","⭐"], 50); document.body.classList.add("slowmo"); shake(); shockwave(r.color); }
        if (r.tier >= 5) { emojiRain(["✦","💎",pet.emoji,"🌈","💥"], 80); rainbowFlash(); shake(); shockwave("#ffffff"); spawnConfetti("#ffffff", 60); }
        sfxRare(r.tier);
        // extra dramatic sounds for high tiers
        if (r.tier >= 3) setTimeout(() => sfxRare(r.tier), 180);
        if (r.tier >= 5) setTimeout(() => sfxRare(5), 360);

        setTimeout(() => {
            eggEl.textContent = pet.emoji;
            eggEl.className = "hatch-egg reveal tier" + r.tier;
            eggEl.style.filter = "drop-shadow(0 0 " + (18 + r.tier * 18) + "px " + r.color + ")";
            const stars = pet.star ? "⭐".repeat(Math.min(pet.star,5)) : "";
            resEl.innerHTML = '<div class="hatch-rarity" style="color:' + r.color + '">' + r.label + ' ' + stars + '</div>' +
                '<div class="hatch-name">' + pet.name + '</div>' +
                '<div class="hatch-power" style="color:' + r.color + '">' + pet.power.toFixed(2) + 'x click power</div>';
            resEl.classList.add("show");
            if (r.tier >= 3) bigBanner(r.label + "!!!", r.color);
            skip.style.opacity = "1"; skip.style.pointerEvents = "auto";
            document.body.classList.remove("slowmo");
        }, 300 + r.tier * 60);
    }, shakeTime);

    if (hatchTimeout) clearTimeout(hatchTimeout);
    // common/rare: auto-dismiss. epic+: must tap to continue
    if (r.tier <= 1) {
        hatchTimeout = setTimeout(finishHatch, shakeTime + 1600);
    } else {
        hatchTimeout = null; // player must tap skip button
    }
}
let hatchTimeout = null;
function finishHatch() {
    if (!hatchActive) return; hatchActive = false;
    if (hatchTimeout) { clearTimeout(hatchTimeout); hatchTimeout = null; }
    const overlay = document.getElementById("hatch-overlay"), rays = document.getElementById("hatch-rays");
    if (rays) rays.classList.remove("spin");
    if (overlay) overlay.classList.add("hidden");
    document.body.classList.remove("slowmo");
    // queue up next in multi-open
    if (hatchQueue && hatchQueue.length > 0) {
        const next = hatchQueue.shift();
        setTimeout(() => playHatch(next.pet, next.egg), 400);
        return;
    }
    renderEggShop();
    const m = document.getElementById("egg-modal"); if (m) m.classList.remove("hidden");
    petTabCur = "collection";
}


// ============================================================
//  VISUAL FX LIBRARY
// ============================================================
function fxLayer() { return document.getElementById("golden-layer"); }

// little fart-cloud puffs + sparks on every click
const PUFFS = ["💨","💨","💨","✨","⭐","💫"];
function clickPuff(x, y) {
    if (!game.settings.particles) return;
    const layer = fxLayer(); if (!layer) return;
    const n = 2 + Math.floor(Math.random()*2);
    for (let i=0;i<n;i++) {
        const p = document.createElement("div");
        p.className = "click-puff";
        p.textContent = PUFFS[Math.floor(Math.random()*PUFFS.length)];
        p.style.left = x + "px"; p.style.top = y + "px";
        const ang = -Math.PI/2 + (Math.random()-0.5)*1.6, dist = 30 + Math.random()*55;
        p.style.setProperty("--dx", Math.cos(ang)*dist + "px");
        p.style.setProperty("--dy", (Math.sin(ang)*dist) + "px");
        p.style.fontSize = (0.8 + Math.random()*0.8) + "rem";
        layer.appendChild(p); setTimeout(()=>p.remove(), 700);
    }
}

function floatText(x, y, txt, color, big) {
    const el = document.createElement("div");
    el.className = "float-text" + (big ? " big" : "");
    el.textContent = txt; el.style.left = x + "px"; el.style.top = y + "px"; el.style.color = color;
    document.body.appendChild(el); setTimeout(() => el.remove(), 900);
}
function popButton() { const b=document.getElementById("main-btn"); if(!b)return; b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop"); }
function showCritFx(e) {
    const c = document.createElement("div"); c.className = "crit-fx"; c.textContent = "⚡ CRIT x" + criticalMultiplier.toFixed(1);
    c.style.left = (e.clientX-40)+"px"; c.style.top = (e.clientY-60)+"px";
    document.body.appendChild(c); sfxCrit(); ringAt(e.clientX, e.clientY, "#FFD54A"); setTimeout(()=>c.remove(),800);
}
function showToast(text, dur) {
    const t = document.createElement("div"); t.className = "toast"; t.innerHTML = text;
    document.body.appendChild(t);
    setTimeout(() => { t.classList.add("out"); setTimeout(()=>t.remove(),400); }, dur||2000);
}
function screenFlash(color) { const f=document.getElementById("screen-flash"); if(!f)return; f.style.background=color; f.classList.remove("flash"); void f.offsetWidth; f.classList.add("flash"); }
function rainbowFlash() { const f=document.getElementById("screen-flash"); if(!f)return; f.style.background="linear-gradient(90deg,#ff3d9a,#ffd54a,#7fff00,#00e0ff,#b14eff)"; f.classList.remove("flash"); void f.offsetWidth; f.classList.add("flash"); }
function shake() {
    if (!game.settings.screenShake) return;
    const c = document.getElementById("game-container"); if (!c) return;
    c.classList.remove("shake"); void c.offsetWidth; c.classList.add("shake"); setTimeout(()=>c.classList.remove("shake"),500);
}
function spawnConfetti(color, count) {
    if (!game.settings.particles) return; const layer = fxLayer(); if (!layer) return;
    const colors = [color, "#fff", "#FFD54A", "#00E0FF", "#FF3D9A"];
    for (let i=0;i<count;i++) {
        const p = document.createElement("div"); p.className = "confetti";
        p.style.left="50%"; p.style.top="44%"; p.style.background = colors[i%colors.length];
        const ang = Math.random()*Math.PI*2, dist = 90+Math.random()*300;
        p.style.setProperty("--dx", Math.cos(ang)*dist+"px");
        p.style.setProperty("--dy", (Math.sin(ang)*dist-50)+"px");
        layer.appendChild(p); setTimeout(()=>p.remove(),1200);
    }
}
function burstAt(x, y, color, count) {
    if (!game.settings.particles) return; const layer = fxLayer(); if (!layer) return;
    for (let i=0;i<count;i++) {
        const p = document.createElement("div"); p.className = "confetti";
        p.style.left = x+"px"; p.style.top = y+"px"; p.style.background = Math.random()<0.5?color:"#fff";
        const ang = Math.random()*Math.PI*2, dist = 40+Math.random()*150;
        p.style.setProperty("--dx", Math.cos(ang)*dist+"px");
        p.style.setProperty("--dy", (Math.sin(ang)*dist)+"px");
        layer.appendChild(p); setTimeout(()=>p.remove(),1000);
    }
}
function ringAt(x, y, color) {
    const layer = fxLayer(); if (!layer) return;
    const r = document.createElement("div"); r.className = "fx-ring";
    r.style.left = x+"px"; r.style.top = y+"px"; r.style.borderColor = color;
    layer.appendChild(r); setTimeout(()=>r.remove(),600);
}


function shockwave(color) {
    const layer = fxLayer(); if (!layer) return;
    const s = document.createElement("div"); s.className = "shockwave";
    s.style.left = "50%"; s.style.top = "44%"; s.style.borderColor = color;
    layer.appendChild(s); setTimeout(()=>s.remove(),700);
}
function lightBurst(color) {
    const layer = fxLayer(); if (!layer) return;
    const b = document.createElement("div"); b.className = "light-burst";
    b.style.left = "50%"; b.style.top = "44%";
    b.style.background = "radial-gradient(circle," + color + "cc 0%, transparent 70%)";
    layer.appendChild(b); setTimeout(()=>b.remove(),600);
}
function sparkleRise(color) {
    if (!game.settings.particles) return; const layer = fxLayer(); if (!layer) return;
    const s = document.createElement("div"); s.className = "sparkle";
    s.style.left = (40 + Math.random()*20) + "%"; s.style.top = "52%"; s.style.background = color;
    layer.appendChild(s); setTimeout(()=>s.remove(),900);
}
function emojiRain(emojis, count) {
    if (!game.settings.particles) return; const layer = fxLayer(); if (!layer) return;
    for (let i=0;i<count;i++) {
        const e = document.createElement("div"); e.className = "emoji-rain";
        e.textContent = emojis[i % emojis.length];
        e.style.left = Math.random()*100 + "%";
        e.style.animationDelay = (Math.random()*0.6) + "s";
        e.style.fontSize = (1.2 + Math.random()*1.4) + "rem";
        layer.appendChild(e); setTimeout(()=>e.remove(),2200);
    }
}
function bigBanner(text, color) {
    const b = document.createElement("div"); b.className = "rarity-banner";
    b.textContent = text; b.style.color = color; b.style.textShadow = "0 0 30px " + color;
    document.body.appendChild(b); setTimeout(()=>b.remove(),2200);
}

// ============================================================
//  GOLDEN FART (scaled by Golden Aura)
// ============================================================
function spawnGoldenFart() {
    const layer = fxLayer(); if (!layer) return;
    const el = document.createElement("div"); el.className = "golden-fart"; el.textContent = "💨";
    el.style.top = (18 + Math.random()*52) + "%"; el.style.left = "-60px";
    layer.appendChild(el);
    requestAnimationFrame(() => { el.style.left = "112%"; });
    el.onclick = () => {
        const goldMult = 1 + auraLevel("golden") * 0.5;
        // world scaling: each world makes golden farts exponentially more valuable
        const worldScale = Math.pow(1.6, game.worldIdx || 0);
        // reward = 5 minutes passive OR 1000 clicks, whichever bigger, times world scale
        const incomeBase = getPassive() * getPetMult() * 300;
        const clickBase  = getClickPower() * getPetMult() * 1000;
        const reward = Math.max(incomeBase, clickBase, game.points * 0.08, 100) * goldMult * worldScale;
        game.points += reward;
        floatText(window.innerWidth/2, window.innerHeight/2, "🤑 +" + fmt(reward), "#FFD54A", true);
        screenFlash("#ffd54a"); sfxRare(4); shake(); burstAt(window.innerWidth/2, window.innerHeight/2, "#FFD54A", 36);
        emojiRain(["💨","🌟","💰","✦"], 20);
        showToast("🌟 GOLDEN FART! +" + fmt(reward) + " Stink!", 2500);
        el.remove(); updateDisplay(); saveGame();
    };
    setTimeout(() => el.remove(), 9000);
}
setInterval(() => { if (Math.random() < 0.5) spawnGoldenFart(); }, 35000);


// ============================================================
//  DISPLAY + BOOT
// ============================================================
function setTxt(id, v) { const e = document.getElementById(id); if (e) e.innerText = v; }
function updateDisplay() {
    setTxt("points", fmt(game.points));
    setTxt("per-click", fmt(getClickPower() * getPetMult()));
    setTxt("passive-income", fmt(getPassive() * getPetMult()) + "/s");
    setTxt("rebirths", String(game.rebirths || 0));
    setTxt("aura-mini", "✦ " + fmt(game.aura));
    if (WORLDS[game.worldIdx]) setTxt("world-name", WORLDS[game.worldIdx].name);
    const rb = document.getElementById("rebirth-btn");
    if (rb) { const cost = getRebirthCost(); rb.innerHTML = '🔄 REBIRTH<span class="rb-cost">' + fmt(cost) + ' 💨</span>'; rb.classList.toggle("ready", game.points >= cost); }
}
function createParticles() {
    const overlay = document.getElementById("particle-overlay"); if (!overlay) return; overlay.innerHTML = "";
    for (let i=0;i<16;i++) {
        const p = document.createElement("div"); p.className = "particle";
        p.style.left = Math.random()*100 + "%"; p.style.animationDuration = (10+Math.random()*14)+"s"; p.style.animationDelay = (Math.random()*8)+"s";
        overlay.appendChild(p);
    }
}
// passive tick
setInterval(() => {
    const inc = getPassive() * getPetMult();
    if (!isNaN(inc) && inc > 0) { game.points += inc; updateDisplay(); if (upgradesRendered && sheetOpen("upgrades")) renderUpgradeTabs(); }
}, 1000);
setInterval(saveGame, 5000);

function initGame() {
    loadGame();
    if (!game.settings.particles) { const o=document.getElementById("particle-overlay"); if(o)o.style.display="none"; }
    createParticles();
    applyWorldTheme();
    updateDisplay();
    renderUpgradeTabs();
    renderPets();
    renderWorlds();
    syncSettingsUI();
    const mainBtn = document.getElementById("main-btn");
    if (mainBtn) {
        mainBtn.addEventListener("click", handleMainClick);
        mainBtn.addEventListener("touchstart", function(ev){ ev.preventDefault(); const tp = ev.touches&&ev.touches[0]; handleMainClick({clientX: tp?tp.clientX:innerWidth/2, clientY: tp?tp.clientY:innerHeight/2}); }, { passive:false });
    }
    buildButtonDecor();
}

// inject decorative orbiting emojis inside the main button
function buildButtonDecor() {
    const btn = document.getElementById("main-btn");
    if (!btn || btn.querySelector(".btn-orbit")) return;
    const orbit = document.createElement("div"); orbit.className = "btn-orbit";
    const orbEmojis = ["💨","✨","💩","🌟","💚","⭐","🔥","💫"];
    for (let i=0;i<8;i++) {
        const d = document.createElement("span"); d.className = "orb"; d.textContent = orbEmojis[i];
        d.style.transform = "rotate(" + (i*45) + "deg) translateY(-160px)";
        orbit.appendChild(d);
    }
    btn.appendChild(orbit);
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initGame);
else initGame();



// ============================================================
//  WORLD THEMING — recolor whole UI per world
// ============================================================
function applyWorldTheme() {
    const w = WORLDS[game.worldIdx || 0]; if (!w || !w.theme) return;
    const t = w.theme;
    const root = document.documentElement;
    // core palette
    root.style.setProperty("--green",  t.p);
    root.style.setProperty("--purple", t.s);
    root.style.setProperty("--cyan",   t.a);
    root.style.setProperty("--pink",   t.p);
    root.style.setProperty("--bg0",    t.bg2);
    root.style.setProperty("--bg1",    t.bg1);
    root.style.setProperty("--stroke", t.s + "66");
    // panel bg uses world bg tinted by secondary color
    root.style.setProperty("--panel",  hexToRgba(t.bg1, 0.75));
    // muted text slightly tinted by primary
    root.style.setProperty("--muted",  hexToRgba(t.p, 0.55));
    // update bottom nav border glow
    const nav = document.querySelector(".bottom-nav");
    if (nav) nav.style.borderTopColor = t.s + "99";
    // update body gradient
    document.body.style.background =
        "linear-gradient(160deg," + t.bg1 + "," + t.bg2 + ")";
    // recolor particles to primary
    const overlay = document.getElementById("particle-overlay");
    if (overlay) overlay.querySelectorAll(".particle").forEach(p => {
        p.style.background = "radial-gradient(circle, " + t.p + "e6, " + t.p + "00)";
    });
}
function hexToRgba(hex, alpha) {
    // handles 6-char hex like #1a2b3c
    try {
        const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
        return "rgba(" + r + "," + g + "," + b + "," + alpha + ")";
    } catch(e) { return "rgba(30,18,55," + alpha + ")"; }
}

// ============================================================
//  EXTRA HATCH FX — only fire on rarer pets (tier 3+)
// ============================================================
function lightningStrike(color) {
    const layer = fxLayer(); if (!layer) return;
    const bolt = document.createElement("div");
    bolt.className = "lightning-bolt";
    bolt.style.background = "linear-gradient(180deg, transparent, " + color + ", #fff, " + color + ", transparent)";
    bolt.style.left = (10 + Math.random() * 80) + "%";
    layer.appendChild(bolt);
    setTimeout(() => bolt.remove(), 400);
}
function spotlightBeam(color) {
    const layer = fxLayer(); if (!layer) return;
    const beam = document.createElement("div");
    beam.className = "spot-beam";
    beam.style.background = "linear-gradient(180deg, " + color + "00, " + color + "70, " + color + "00)";
    layer.appendChild(beam);
    setTimeout(() => beam.remove(), 1200);
}
function fanfareSfx(tier) {
    // layered melodic fanfare — gets richer with rarity
    const ctx = getCtx(); if (!ctx) return;
    const m = ensureMaster(); if (!m) return;
    const notes = [
        [262, 330, 392],          // C major triad
        [330, 392, 494],          // E minor
        [392, 494, 587],          // G
        [523, 659, 784, 988],     // C5 maj
        [523, 659, 784, 988, 1175], // bigger
        [523, 659, 784, 988, 1175, 1397] // mythic
    ];
    const set = notes[Math.min(tier, notes.length - 1)];
    set.forEach((freq, i) => {
        setTimeout(() => {
            const t = ctx.currentTime;
            const o = ctx.createOscillator(); o.type = "triangle"; o.frequency.value = freq;
            const o2 = ctx.createOscillator(); o2.type = "sine"; o2.frequency.value = freq * 2;
            const g = vEnv(ctx, 0.18 * (game.settings.sfxVol || 0.7), 0.005, 0.45, t);
            const g2 = ctx.createGain(); g2.gain.value = 0.4;
            o.connect(g); o2.connect(g2); g2.connect(g); g.connect(m); routeWet(g);
            o.start(t); o2.start(t); o.stop(t + 0.5); o2.stop(t + 0.5);
        }, i * 90);
    });
}
function chargeUpSfx() {
    // rising "anticipation" sweep
    const ctx = getCtx(); if (!ctx) return;
    const m = ensureMaster(); if (!m) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator(); o.type = "sawtooth";
    o.frequency.setValueAtTime(80, t); o.frequency.exponentialRampToValueAtTime(800, t + 0.9);
    const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 1200; f.Q.value = 8;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.18 * (game.settings.sfxVol || 0.7), t + 0.85);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.0);
    o.connect(f); f.connect(g); g.connect(m); routeWet(g);
    o.start(t); o.stop(t + 1.05);
}

// patch playHatch with extra FX based on tier
const _originalPlayHatch = playHatch;
playHatch = function(pet, egg) {
    const r = RARITY[pet.rarity] || RARITY.common;
    // tier 3+: anticipation charge-up sweep at start
    if (r.tier >= 3) chargeUpSfx();
    // tier 4+: spotlight beam appears
    if (r.tier >= 4) setTimeout(() => spotlightBeam(r.color), 200);
    // tier 5: lightning strikes during shake
    if (r.tier >= 5) {
        let bolts = 0;
        const li = setInterval(() => {
            lightningStrike(r.color);
            screenFlash(r.color);
            bolts++;
            if (bolts >= 4) clearInterval(li);
        }, 220);
    }
    _originalPlayHatch(pet, egg);
    // schedule reveal-time fanfare
    const shakeTime = 850 + r.tier * 160;
    setTimeout(() => {
        fanfareSfx(r.tier);
        // tier 3+: extra stacked shockwaves
        if (r.tier >= 3) {
            setTimeout(() => shockwave(r.color), 100);
            setTimeout(() => shockwave("#fff"), 250);
            setTimeout(() => shockwave(r.color), 400);
        }
        // tier 4+: even more confetti waves
        if (r.tier >= 4) {
            setTimeout(() => spawnConfetti(r.color, 40), 500);
            setTimeout(() => spawnConfetti("#fff", 40), 800);
        }
        // tier 5: epic rainbow burst
        if (r.tier >= 5) {
            ["#ff3d9a","#ffd54a","#7fff00","#00e0ff","#b14eff"].forEach((c, i) => {
                setTimeout(() => { spawnConfetti(c, 25); shockwave(c); }, i * 200);
            });
        }
    }, shakeTime);
};
