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


// ---------- 20 Worlds ----------
const WORLDS = [
    { name: "Basement",         reqRebirths: 0,   icon: "🏚️" },
    { name: "Sewer Tunnels",    reqRebirths: 1,   icon: "🕳️" },
    { name: "Skibidi Toilet",   reqRebirths: 3,   icon: "🚽" },
    { name: "Rizz Dojo",        reqRebirths: 6,   icon: "😎" },
    { name: "Ohio",             reqRebirths: 10,  icon: "🌽" },
    { name: "Outer Space",      reqRebirths: 15,  icon: "🚀" },
    { name: "Gyatt Canyon",     reqRebirths: 21,  icon: "🏜️" },
    { name: "Nether Realm",     reqRebirths: 28,  icon: "🔥" },
    { name: "Sigma City",       reqRebirths: 36,  icon: "🏙️" },
    { name: "Dimension X",      reqRebirths: 45,  icon: "🛸" },
    { name: "Quantum Realm",    reqRebirths: 55,  icon: "⚛️" },
    { name: "Grimace Shake",    reqRebirths: 66,  icon: "🟣" },
    { name: "Mewing Heights",   reqRebirths: 78,  icon: "☁️" },
    { name: "Inferno Depths",   reqRebirths: 91,  icon: "👹" },
    { name: "Crystal Cavern",   reqRebirths: 105, icon: "💎" },
    { name: "Mirror Dimension", reqRebirths: 120, icon: "🪞" },
    { name: "Galactic Core",    reqRebirths: 136, icon: "🌌" },
    { name: "Time Rift",        reqRebirths: 153, icon: "⏳" },
    { name: "Gigachad Nexus",   reqRebirths: 171, icon: "💪" },
    { name: "The Final Stench", reqRebirths: 190, icon: "👑" }
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
    { name: "Combo Master",     icon: "🔥", base: 6, effect: "combo",    per: 0.30, desc: "Combo builds +30% faster / level" }
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
function petPower(base, world) { return +(base * (1 + world * 0.15)).toFixed(2); }
function allPetsForWorld() {
    // flatten all egg pets (the 15 base pets)
    let arr = [];
    EGG_TEMPLATES.forEach(e => e.pets.forEach(p => arr.push(p)));
    return arr;
}
function dexKey(world, name) { return world + ":" + name; }


// ============================================================
//  AUDIO: multi-track procedural PHONK + SFX (WebAudio)
// ============================================================
function getCtx() {
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
        o.type = type || "square";
        o.frequency.setValueAtTime(freq, ctx.currentTime);
        if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, ctx.currentTime + dur);
        const v = (vol || 0.1) * game.settings.sfxVol;
        g.gain.setValueAtTime(v, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
        o.connect(g); g.connect(ctx.destination);
        o.start(); o.stop(ctx.currentTime + dur);
    } catch (e) {}
}
function sfxClick()  { tone(420 + Math.random()*120, 0.09, "square", 0.10, 180); }
function sfxBuy()    { tone(660, 0.08, "triangle", 0.12); setTimeout(()=>tone(990,0.10,"triangle",0.10),55); }
function sfxCrit()   { tone(1200, 0.16, "sawtooth", 0.13, 400); }
function sfxError()  { tone(160, 0.18, "square", 0.10, 90); }
function sfxWhoosh() { tone(200, 0.3, "sawtooth", 0.08, 1400); }
function sfxRare(tier) {
    const notes = [523,659,784,1047,1319,1568];
    for (let i = 0; i <= Math.min(tier+1,5); i++) setTimeout(()=>tone(notes[i],0.22,"triangle",0.14),i*90);
}


// ---------- PHONK tracks (each = distinct beat + melody) ----------
const TRACKS = [
    { name: "Sigma Drift", bpm: 145, wave: "square",
      kick: [1,0,0,0, 0,0,1,0, 0,0,1,0, 0,0,0,0],
      hat:  [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,1],
      bell: [0,null,3,0, null,7,5,3, 0,null,3,5, 7,null,5,3],
      bass: [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,1,0] },
    { name: "Ohio Nights", bpm: 132, wave: "sawtooth",
      kick: [1,0,0,1, 0,0,1,0, 1,0,0,1, 0,0,1,0],
      hat:  [0,1,0,1, 0,1,0,1, 0,1,0,1, 0,1,1,1],
      bell: [5,null,5,3, 0,null,3,null, 5,7,null,8, 7,5,3,null],
      bass: [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0] },
    { name: "Rizz Tek", bpm: 160, wave: "square",
      kick: [1,0,1,0, 0,1,0,0, 1,0,1,0, 0,1,0,0],
      hat:  [1,1,0,1, 1,1,0,1, 1,1,0,1, 1,1,0,1],
      bell: [7,7,null,5, 3,null,5,7, 10,null,8,7, 5,null,3,0],
      bass: [1,0,0,1, 0,0,1,0, 1,0,0,1, 0,0,1,0] },
    { name: "Gigachad Theme", bpm: 120, wave: "triangle",
      kick: [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,1,0],
      hat:  [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0],
      bell: [0,null,null,3, null,null,5,null, 7,null,null,5, null,3,null,0],
      bass: [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0] },
    { name: "Skibidi Core", bpm: 150, wave: "sawtooth",
      kick: [1,0,0,1, 1,0,0,0, 0,1,0,0, 1,0,0,1],
      hat:  [1,0,1,1, 1,0,1,1, 1,0,1,1, 1,0,1,1],
      bell: [3,3,5,null, 7,5,3,null, 10,8,7,null, 5,3,2,null],
      bass: [1,0,0,0, 1,0,0,0, 0,0,1,0, 1,0,0,0] }
];

const PHONK = { idx: 0, step: 0, timer: null, playing: false, bars: 0 };
function midiHz(s) { return 220 * Math.pow(2, s / 12); }

function phonkKick(ctx, t) {
    const m = ensureMaster();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine"; o.frequency.setValueAtTime(165, t);
    o.frequency.exponentialRampToValueAtTime(48, t + 0.12);
    g.gain.setValueAtTime(1.0 * game.settings.musicVol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.26);
    o.connect(g); g.connect(m || ctx.destination); o.start(t); o.stop(t + 0.28);
}
function phonkHat(ctx, t) {
    const m = ensureMaster();
    const s = ctx.createBufferSource(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    s.buffer = getNoise(ctx); f.type = "bandpass"; f.frequency.value = 9000; f.Q.value = 1.2;
    g.gain.setValueAtTime(0.10 * game.settings.musicVol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    s.connect(f); f.connect(g); g.connect(m || ctx.destination); s.start(t); s.stop(t + 0.05);
}
function phonkBell(ctx, t, semi, wave) { phonkLead(ctx, t, semi, wave); }
function phonk808(ctx, t, semi) {
    const m = ensureMaster();
    const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    f.type = "lowpass"; f.frequency.value = 1800;
    o.type = "sine"; o.frequency.setValueAtTime(midiHz(semi - 11), t);
    o.frequency.exponentialRampToValueAtTime(midiHz(semi - 12), t + 0.08);
    g.gain.setValueAtTime(0.55 * game.settings.musicVol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    o.connect(f); f.connect(g); g.connect(m || ctx.destination); o.start(t); o.stop(t + 0.52);
}


// ---------- Rich audio bus: master + warm filter + compressor + reverb ----------
let masterGain = null, reverbNode = null, reverbSend = null;
function ensureMaster() {
    const ctx = getCtx(); if (!ctx) return null;
    if (masterGain) return masterGain;
    masterGain = ctx.createGain(); masterGain.gain.value = 0.85;
    // warm low-pass so highs aren't harsh/8-bit
    const warm = ctx.createBiquadFilter(); warm.type = "lowpass"; warm.frequency.value = 6500; warm.Q.value = 0.6;
    // glue compressor
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18; comp.knee.value = 24; comp.ratio.value = 3.5;
    comp.attack.value = 0.004; comp.release.value = 0.22;
    masterGain.connect(warm); warm.connect(comp); comp.connect(ctx.destination);
    try {
        reverbNode = ctx.createConvolver();
        const len = ctx.sampleRate * 2.0, buf = ctx.createBuffer(2, len, ctx.sampleRate);
        for (let ch = 0; ch < 2; ch++) {
            const d = buf.getChannelData(ch);
            for (let i = 0; i < len; i++) d[i] = (Math.random()*2-1) * Math.pow(1 - i/len, 3.0);
        }
        reverbNode.buffer = buf;
        reverbSend = ctx.createGain(); reverbSend.gain.value = 0.3;
        reverbSend.connect(reverbNode); reverbNode.connect(masterGain);
    } catch (e) { reverbNode = null; }
    return masterGain;
}
function routeWet(node) { if (reverbSend) node.connect(reverbSend); }

// warm melodic lead: detuned saws + sine sub + vibrato, gentle filter
function phonkLead(ctx, t, semi, wave) {
    const master = ensureMaster(); if (!master) return;
    const f = ctx.createBiquadFilter(); f.type = "lowpass";
    f.frequency.setValueAtTime(700, t); f.frequency.exponentialRampToValueAtTime(2200, t + 0.06);
    f.frequency.exponentialRampToValueAtTime(800, t + 0.4); f.Q.value = 3;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.13 * game.settings.musicVol, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.42);
    const base = midiHz(semi + 12);
    // vibrato LFO
    const lfo = ctx.createOscillator(), lfoG = ctx.createGain();
    lfo.frequency.value = 5.5; lfoG.gain.value = base * 0.006;
    lfo.connect(lfoG); lfo.start(t); lfo.stop(t + 0.44);
    [-0.08, 0.08].forEach(det => {
        const o = ctx.createOscillator();
        o.type = "sawtooth"; o.frequency.value = base * (1 + det/12);
        lfoG.connect(o.frequency); o.connect(f); o.start(t); o.stop(t + 0.44);
    });
    const sub = ctx.createOscillator(); sub.type = "sine"; sub.frequency.value = base/2;
    sub.connect(f); sub.start(t); sub.stop(t + 0.44);
    f.connect(g); g.connect(master); routeWet(g);
}
// lush chord pad (follows the bar's chord root)
function phonkPad(ctx, t, root) {
    const master = ensureMaster(); if (!master) return;
    const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 2400;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.045 * game.settings.musicVol, t + 0.5);
    g.gain.linearRampToValueAtTime(0.0001, t + 1.95);
    [0, 3, 7, 10, 12].forEach(iv => {
        const o = ctx.createOscillator(); o.type = "sawtooth";
        o.frequency.value = midiHz(root + iv - 12);
        o.detune.value = (Math.random()*8-4);
        o.connect(f); o.start(t); o.stop(t + 2.0);
    });
    f.connect(g); g.connect(master); routeWet(g);
}


// ---------- sequencer + track rotation ----------
// catchy vi-IV-I-V style chord movement (semitone transpose per bar)
const PROG = [0, -4, 3, -2];
function phonkTick() {
    const ctx = getCtx(); if (!ctx) return;
    const tr = TRACKS[PHONK.idx % TRACKS.length];
    const t = ctx.currentTime + 0.02;
    const s = PHONK.step % 16;
    const barRoot = PROG[PHONK.bars % PROG.length];
    if (s === 0) phonkPad(ctx, t, barRoot);
    if (tr.kick[s]) phonkKick(ctx, t);
    if (tr.hat[s]) phonkHat(ctx, t);
    const bn = tr.bell[s];
    if (bn !== null && bn !== undefined) phonkLead(ctx, t, bn + barRoot, tr.wave);
    if (tr.bass[s]) phonk808(ctx, t, barRoot + ((bn === null || bn === undefined) ? 0 : 0));
    PHONK.step++;
    if (PHONK.step % 16 === 0) {
        PHONK.bars++;
        if (PHONK.bars % 8 === 0) {
            PHONK.idx = (PHONK.idx + Math.floor(1 + Math.random()*(TRACKS.length-1))) % TRACKS.length;
            announceTrack();
        }
    }
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
function unlockAudio() {
    const ctx = getCtx(); if (!ctx) return;
    try {
        if (ctx.state === "suspended") ctx.resume();
        // play a silent buffer to satisfy iOS gesture requirement
        const b = ctx.createBuffer(1, 1, 22050);
        const src = ctx.createBufferSource();
        src.buffer = b; src.connect(ctx.destination); src.start(0);
    } catch (e) {}
}
function startAudio() {
    unlockAudio();
    if (audioStarted) { if (game.settings.musicOn) startMusic(); return; }
    audioStarted = true;
    ensureMaster();
    if (game.settings.musicOn) startMusic();
}
// attach to every gesture type for max mobile compatibility
["pointerdown","touchend","click","keydown"].forEach(ev => {
    document.addEventListener(ev, function once() {
        startAudio();
    }, { once: true, passive: true });
});
// keep context alive on every interaction (mobile suspends it)
["pointerdown","touchend"].forEach(ev => {
    document.addEventListener(ev, () => { const c = getCtx(); if (c && c.state === "suspended") c.resume(); }, { passive: true });
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


function upCard(i) {
    const u = UPGRADES[i], lvl = game.upgrades[i] || 0, cost = upgradeCost(i), ok = game.points >= cost;
    const stat = u.type === "click" ? "+" + fmt(u.clickPower) + " / click" : "+" + fmt(u.passivePower) + " / sec";
    return '<button class="up-card ' + (ok ? "" : "locked") + '" onclick="buyUpgrade(' + i + ')">' +
        '<div class="up-ico">' + u.icon + '</div>' +
        '<div class="up-mid"><div class="up-name">' + u.name + '</div>' +
        '<div class="up-stat">' + stat + '</div><div class="up-cost">' + fmt(cost) + ' 💨</div></div>' +
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
    const cost = upgradeCost(i);
    if (game.points >= cost) {
        game.points -= cost; game.upgrades[i] = (game.upgrades[i] || 0) + 1;
        sfxBuy(); updateDisplay(); renderUpgradeTabs(); saveGame();
    } else sfxError();
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
}
function closeSheet() {
    document.querySelectorAll(".sheet").forEach(s => s.classList.remove("open"));
    const overlay = document.getElementById("sheet-overlay"); if (overlay) overlay.classList.remove("visible");
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
    showToast("🌍 Travelled to " + w.name + "!", 2000);
}


// ============================================================
//  AURA (prestige shop)
// ============================================================
function renderAura() {
    let html = '<div class="aura-hero"><div class="aura-bal">✦ ' + fmt(game.aura) + '</div>' +
        '<div class="aura-sub">Aura · permanent power. Next rebirth grants <b>+' + auraGainPreview() + ' ✦</b></div></div>';
    html += '<div class="aura-list">';
    AURA_UPGRADES.forEach((u, i) => {
        const lvl = game.auraUpgrades[i] || 0, cost = auraUpCost(i), ok = game.aura >= cost;
        html += '<button class="aura-card ' + (ok?"":"locked") + '" onclick="buyAura(' + i + ')">' +
            '<div class="up-ico">' + u.icon + '</div><div class="up-mid">' +
            '<div class="up-name">' + u.name + '</div><div class="up-stat">' + u.desc + '</div>' +
            '<div class="aura-cost">✦ ' + fmt(cost) + '</div></div><div class="up-lvl">Lv ' + lvl + '</div></button>';
    });
    html += '</div>';
    const el = document.getElementById("aura-body"); if (el) el.innerHTML = html;
}
function buyAura(i) {
    const cost = auraUpCost(i);
    if (game.aura >= cost) {
        game.aura -= cost; game.auraUpgrades[i] = (game.auraUpgrades[i] || 0) + 1;
        sfxRare(2); burstAt(window.innerWidth/2, window.innerHeight*0.4, "#b14eff", 18);
        renderAura(); updateDisplay(); saveGame();
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
function renderFuse() {
    let html = '<p class="fuse-info">Fuse <b>3 identical pets</b> into one ⭐ stronger pet (2.2x power)!</p><div class="pet-grid">';
    const groups = fuseGroups().filter(g => g.items.length >= 3);
    if (groups.length === 0) html += '<p class="empty-text">No fusions available. Collect 3 of the same pet (same star level).</p>';
    else groups.forEach(g => {
        const r = RARITY[g.rarity] || RARITY.common;
        const stars = g.star ? "⭐".repeat(Math.min(g.star,5)) : "";
        html += '<div class="fuse-card" style="border-color:' + r.color + '">' +
            '<span class="pet-chip-emoji">' + g.emoji + '</span><span class="pet-stars">' + stars + '</span>' +
            '<span class="pet-chip-name" style="color:' + r.color + '">' + g.name + '</span>' +
            '<span class="fuse-count">x' + g.items.length + '</span>' +
            '<button class="fuse-btn" onclick="fusePet(\'' + g.name.replace(/'/g,"\\'") + '\',' + g.star + ')">FUSE 3 →</button></div>';
    });
    html += '</div>';
    const el = document.getElementById("pets-body"); if (el) el.innerHTML = html;
}
function fusePet(name, star) {
    const matches = (game.pets||[]).filter(p => p.name === name && (p.star||0) === star);
    if (matches.length < 3) { sfxError(); return; }
    matches.sort((a,b) => b.power - a.power);
    const consumed = matches.slice(0,3);
    const ids = consumed.map(p => p.id);
    game.equippedPets = (game.equippedPets||[]).filter(p => !ids.includes(p.id));
    game.pets = game.pets.filter(p => !ids.includes(p.id));
    const top = consumed[0];
    const fused = { id: Date.now()+Math.floor(Math.random()*100000), name: top.name, emoji: top.emoji,
        rarity: top.rarity, star: (star||0)+1, power: +(top.power * 2.2).toFixed(2) };
    game.pets.push(fused);
    sfxRare(3); screenFlash(RARITY[fused.rarity].color); burstAt(window.innerWidth/2, window.innerHeight*0.4, RARITY[fused.rarity].color, 30); shake();
    showToast("✨ Fused into " + fused.name + " " + "⭐".repeat(Math.min(fused.star,5)) + " (" + fused.power.toFixed(2) + "x)!", 3000);
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
function openEggModal() { closeSheet(); renderEggShop(); const m=document.getElementById("egg-modal"); if(m)m.classList.remove("hidden"); }
function closeEggModal() { const m=document.getElementById("egg-modal"); if(m)m.classList.add("hidden"); }
function renderEggShop() {
    const bal = document.getElementById("egg-balance"); if (bal) bal.innerText = fmt(game.points);
    let html = '<div class="egg-grid">';
    EGG_TEMPLATES.forEach((egg, idx) => {
        const cost = eggCost(egg, game.worldIdx), ok = game.points >= cost;
        let odds = egg.pets.map(p => { const r=RARITY[p.rarity];
            return '<div class="odds-row"><span style="color:' + r.color + '">' + p.emoji + ' ' + p.name + '</span><span class="odds-pct">' + p.odds + '%</span></div>'; }).join("");
        html += '<div class="egg-card" style="border-color:' + egg.color + '">' +
            '<div class="egg-emoji" style="filter:drop-shadow(0 0 12px ' + egg.color + ')">' + egg.emoji + '</div>' +
            '<div class="egg-name" style="color:' + egg.color + '">' + egg.name + '</div>' +
            '<div class="egg-odds">' + odds + '</div>' +
            '<button class="egg-buy ' + (ok?"":"locked") + '" onclick="rollEgg(' + idx + ')">Open · ' + fmt(cost) + '</button></div>';
    });
    html += '</div>';
    const sel = document.getElementById("egg-selection"); if (sel) sel.innerHTML = html;
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
    skip.style.opacity = "0";
    overlay.classList.remove("hidden");
    sfxWhoosh();

    // charge glow + crack ticks during shake (intensity by tier)
    let ticks = 0;
    const chargeInt = setInterval(() => {
        tone(280 + ticks*55, 0.05, "square", 0.05);
        sparkleRise(r.color);
        ticks++;
    }, 150 - r.tier*8);

    const shakeTime = 850 + r.tier * 160;
    setTimeout(() => {
        clearInterval(chargeInt);
        // BURST
        eggEl.className = "hatch-egg burst";
        shockwave(r.color);
        spawnConfetti(r.color, 26 + r.tier * 26);
        if (r.tier >= 1) screenFlash(r.color);
        if (r.tier >= 2) { lightBurst(r.color); }
        if (r.tier >= 3) { shake(); rays.style.opacity = "1"; rays.classList.add("spin"); }
        if (r.tier >= 4) { emojiRain([pet.emoji,"🌟","✨","💫"], 30); document.body.classList.add("slowmo"); }
        if (r.tier >= 5) { emojiRain(["✦","💎",pet.emoji], 44); rainbowFlash(); }
        sfxRare(r.tier);

        setTimeout(() => {
            eggEl.textContent = pet.emoji;
            eggEl.className = "hatch-egg reveal tier" + r.tier;
            eggEl.style.filter = "drop-shadow(0 0 28px " + r.color + ")";
            const stars = pet.star ? "⭐".repeat(Math.min(pet.star,5)) : "";
            resEl.innerHTML = '<div class="hatch-rarity" style="color:' + r.color + '">' + r.label + ' ' + stars + '</div>' +
                '<div class="hatch-name">' + pet.name + '</div>' +
                '<div class="hatch-power" style="color:' + r.color + '">' + pet.power.toFixed(2) + 'x click power</div>';
            resEl.classList.add("show");
            if (r.tier >= 4) bigBanner(r.label + "!!!", r.color);
            skip.style.opacity = "1";
            document.body.classList.remove("slowmo");
        }, 360);
    }, shakeTime);

    if (hatchTimeout) clearTimeout(hatchTimeout);
    hatchTimeout = setTimeout(finishHatch, shakeTime + 1900 + r.tier * 320);
}
let hatchTimeout = null;
function finishHatch() {
    if (!hatchActive) return; hatchActive = false;
    if (hatchTimeout) { clearTimeout(hatchTimeout); hatchTimeout = null; }
    const overlay = document.getElementById("hatch-overlay"), rays = document.getElementById("hatch-rays");
    if (rays) rays.classList.remove("spin");
    if (overlay) overlay.classList.add("hidden");
    document.body.classList.remove("slowmo");
    renderEggShop();
    const m = document.getElementById("egg-modal"); if (m) m.classList.remove("hidden");
    if (petTabCur !== "collection") petTabCur = "collection";
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
        const reward = Math.max(getClickPower()*60, getPassive()*30, 50) * goldMult;
        game.points += reward;
        floatText(window.innerWidth/2, window.innerHeight/2, "🤑 +" + fmt(reward), "#FFD54A", true);
        screenFlash("#ffd54a"); sfxRare(3); shake(); burstAt(window.innerWidth/2, window.innerHeight/2, "#FFD54A", 28);
        showToast("🌟 GOLDEN FART! +" + fmt(reward) + " Stink!", 2500);
        el.remove(); updateDisplay(); saveGame();
    };
    setTimeout(() => el.remove(), 9000);
}
setInterval(() => { if (Math.random() < 0.5) spawnGoldenFart(); }, 42000);


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
