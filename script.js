/* ============================================================
   FART CLICKER: BRAINROT EDITION — single-file logic
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
    bestPet: 0,
    lastSeen: Date.now(),
    settings: {
        musicVol: 0.35,
        sfxVol: 0.70,
        musicOn: true,
        particles: true,
        screenShake: true,
        brainrot: true
    }
};

// runtime (not saved)
let spamMultiplier = 1, clickStreak = 0, lastClickTime = 0, criticalMultiplier = 1;
let comboValue = 0, comboDecayTimer = null;
let upgradesRendered = false, audioStarted = false, hatchActive = false;
let audioCtx = null, pendingHatch = null;


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
    // Click power
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
    // Passive
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
    { name: "Reality Warper",     baseCost: 17000000000000,passivePower: 6000000000,type:"passive", icon: "✨" }
];

const PET_SLOTS = [
    { slot: 4, cost: 250000,      },
    { slot: 5, cost: 5000000,     },
    { slot: 6, cost: 90000000,    },
    { slot: 7, cost: 1500000000,  },
    { slot: 8, cost: 28000000000, }
];


// ---------- Rarity tiers (drive hatch animation intensity) ----------
const RARITY = {
    common:    { label: "Common",    color: "#9fb0c9", tier: 0 },
    rare:      { label: "Rare",      color: "#3da5ff", tier: 1 },
    epic:      { label: "Epic",      color: "#b14eff", tier: 2 },
    legendary: { label: "Legendary", color: "#ffd54a", tier: 3 },
    mythic:    { label: "MYTHIC",    color: "#ff3d9a", tier: 4 },
    secret:    { label: "✦ SECRET ✦",color: "#00ffd0", tier: 5 }
};

// base egg templates: pets get power scaled per world
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

function eggCost(template, world) {
    return Math.floor(template.baseCost * Math.pow(template.growth, world));
}
function petPower(petBase, world) {
    return +(petBase * (1 + world * 0.15)).toFixed(2);
}


// ============================================================
//  AUDIO: procedural PHONK engine + SFX (WebAudio, no network)
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

// generic tone
function tone(freq, dur, type, vol, slideTo) {
    try {
        const ctx = getCtx(); if (!ctx) return;
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = type || "square";
        o.frequency.setValueAtTime(freq, ctx.currentTime);
        if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, ctx.currentTime + dur);
        const v = (vol || 0.1) * (game.settings.sfxVol);
        g.gain.setValueAtTime(v, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
        o.connect(g); g.connect(ctx.destination);
        o.start(); o.stop(ctx.currentTime + dur);
    } catch (e) {}
}

// SFX
function sfxClick()    { tone(420 + Math.random()*120, 0.09, "square", 0.10, 180); }
function sfxBuy()      { tone(660, 0.08, "triangle", 0.12); setTimeout(()=>tone(990,0.10,"triangle",0.10),55); }
function sfxCrit()     { tone(1200, 0.16, "sawtooth", 0.13, 400); }
function sfxError()    { tone(160, 0.18, "square", 0.10, 90); }
function sfxRare(tier) {
    const notes = [523,659,784,1047,1319,1568];
    for (let i = 0; i <= Math.min(tier+1,5); i++) setTimeout(()=>tone(notes[i],0.22,"triangle",0.14),i*90);
}


// ---------- PHONK loop engine ----------
const PHONK = {
    bpm: 145, step: 0, timer: null, playing: false,
    // 16-step patterns (1 = hit)
    kick:  [1,0,0,0, 0,0,1,0, 0,0,1,0, 0,0,0,0],
    hat:   [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,1],
    // cowbell melody (semitone offsets from base, null = rest) — classic phonk riff
    bell:  [0,null,3,0, null,7,5,3, 0,null,3,5, 7,null,5,3],
    bass:  [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,1,0]
};

function midiHz(semitoneFromA3) { return 220 * Math.pow(2, semitoneFromA3 / 12); }

function phonkKick(ctx, t) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(160, t);
    o.frequency.exponentialRampToValueAtTime(45, t + 0.13);
    g.gain.setValueAtTime(0.9 * game.settings.musicVol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + 0.24);
}
function phonkHat(ctx, t) {
    const s = ctx.createBufferSource(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    s.buffer = getNoise(ctx); f.type = "highpass"; f.frequency.value = 7000;
    g.gain.setValueAtTime(0.22 * game.settings.musicVol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    s.connect(f); f.connect(g); g.connect(ctx.destination); s.start(t); s.stop(t + 0.06);
}
function phonkBell(ctx, t, semi) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "square";
    o.frequency.value = midiHz(semi + 24); // cowbell register
    g.gain.setValueAtTime(0.16 * game.settings.musicVol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + 0.2);
}
function phonk808(ctx, t, semi) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine"; o.frequency.value = midiHz(semi - 12);
    g.gain.setValueAtTime(0.5 * game.settings.musicVol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + 0.42);
}


function phonkTick() {
    const ctx = getCtx(); if (!ctx) return;
    const t = ctx.currentTime + 0.02;
    const s = PHONK.step % 16;
    if (PHONK.kick[s]) phonkKick(ctx, t);
    if (PHONK.hat[s]) phonkHat(ctx, t);
    if (PHONK.bell[s] !== null && PHONK.bell[s] !== undefined) phonkBell(ctx, t, PHONK.bell[s]);
    if (PHONK.bass[s]) {
        const bn = PHONK.bell[s]; phonk808(ctx, t, (bn === null || bn === undefined) ? 0 : bn);
    }
    PHONK.step++;
}

function startMusic() {
    if (PHONK.playing || !game.settings.musicOn) return;
    const ctx = getCtx(); if (!ctx) return;
    PHONK.playing = true;
    const stepMs = (60000 / PHONK.bpm) / 2; // 8th notes
    PHONK.timer = setInterval(phonkTick, stepMs);
    const tg = document.getElementById("tg-music");
}
function stopMusic() {
    PHONK.playing = false;
    if (PHONK.timer) { clearInterval(PHONK.timer); PHONK.timer = null; }
}

function startAudio() {
    if (audioStarted) return;
    audioStarted = true;
    getCtx();
    if (game.settings.musicOn) startMusic();
}


// ============================================================
//  CORE MATH (NaN-safe)
// ============================================================
function rebirthBonus() { return 1 + (game.rebirths || 0) * 0.25; }

function getClickPower() {
    let p = game.baseClickPower || 1;
    UPGRADES.forEach((u, i) => { if (u.type === "click" && game.upgrades[i]) p += (u.clickPower||0) * game.upgrades[i]; });
    return p * rebirthBonus();
}
function getPassive() {
    let p = 0;
    UPGRADES.forEach((u, i) => { if (u.type === "passive" && game.upgrades[i]) p += (u.passivePower||0) * game.upgrades[i]; });
    return p * rebirthBonus();
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

function initUpgrades() {
    if (!game.upgrades) game.upgrades = {};
    UPGRADES.forEach((_, i) => { if (typeof game.upgrades[i] !== "number") game.upgrades[i] = 0; });
}


// ============================================================
//  SAVE / LOAD  (+ offline earnings)
// ============================================================
const SAVE_KEY = "fartSave_v4";
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
                const defSettings = game.settings;
                game = Object.assign(game, p);
                game.settings = Object.assign(defSettings, p.settings || {});
            }
        }
    } catch (e) {}
    if (!game.maxPets) game.maxPets = 3;
    if (!Array.isArray(game.pets)) game.pets = [];
    if (!Array.isArray(game.equippedPets)) game.equippedPets = [];
    if (typeof game.points !== "number" || isNaN(game.points)) game.points = 0;
    if (typeof game.worldIdx !== "number") game.worldIdx = 0;
    if (typeof game.rebirths !== "number") game.rebirths = 0;
    initUpgrades();
    computeOffline();
}

function computeOffline() {
    const now = Date.now();
    const elapsed = Math.min((now - (game.lastSeen || now)) / 1000, 8 * 3600); // cap 8h
    const rate = getPassive() * getPetMult();
    offlinePending = Math.floor(rate * elapsed * 0.5); // 50% offline rate
    if (offlinePending > 10 && elapsed > 30) {
        const amt = document.getElementById("offline-amount");
        if (amt) amt.innerText = fmt(offlinePending) + " 💨";
        const m = document.getElementById("offline-modal");
        if (m) m.classList.remove("hidden");
    } else { offlinePending = 0; }
}
function claimOffline() {
    game.points += offlinePending; offlinePending = 0;
    const m = document.getElementById("offline-modal"); if (m) m.classList.add("hidden");
    sfxBuy(); updateDisplay(); saveGame();
}


// ============================================================
//  MAIN CLICK + COMBO
// ============================================================
function handleMainClick(e) {
    startAudio();
    const now = Date.now();
    const dt = now - lastClickTime;
    if (dt < 400 && dt >= 0) {
        clickStreak++;
        comboValue = Math.min(comboValue + 7, 100);
    } else {
        clickStreak = 0;
    }
    lastClickTime = now;
    spamMultiplier = 1 + (comboValue / 100) * 2.5; // up to 3.5x at full combo
    game.totalClicks++;

    const critChance = Math.min(0.05 + comboValue * 0.0015, 0.25);
    criticalMultiplier = 1;
    if (Math.random() < critChance) { criticalMultiplier = 3 + Math.random() * 4; showCritFx(e); }

    let dmg = getClickPower() * spamMultiplier * getPetMult() * criticalMultiplier;
    if (isNaN(dmg) || dmg < 0) dmg = 1;
    game.points += dmg; game.totalEarned += dmg;

    sfxClick();
    floatText(e.clientX, e.clientY, "+" + fmt(dmg), criticalMultiplier > 1 ? "#FFD54A" : (comboValue > 60 ? "#00E0FF" : "#7FFF00"), criticalMultiplier > 1);
    popButton();
    maybeBrainrotPop();
    refreshCombo();
    updateDisplay();
    if (upgradesRendered) renderUpgradeTabs();
    saveGame();
}

function refreshCombo() {
    const bar = document.getElementById("combo-bar");
    const label = document.getElementById("combo-label");
    if (bar) bar.style.width = comboValue + "%";
    if (label) label.innerText = "COMBO x" + spamMultiplier.toFixed(1);
    if (comboDecayTimer) clearTimeout(comboDecayTimer);
    comboDecayTimer = setInterval(() => {
        comboValue = Math.max(0, comboValue - 4);
        spamMultiplier = 1 + (comboValue / 100) * 2.5;
        if (bar) bar.style.width = comboValue + "%";
        if (label) label.innerText = "COMBO x" + spamMultiplier.toFixed(1);
        if (comboValue <= 0) { clearInterval(comboDecayTimer); comboDecayTimer = null; }
    }, 200);
}

const BRAINROT_POPS = ["SKIBIDI! 🚽","RIZZ +∞ 😎","GYATT! 🍑","ONLY IN OHIO 🌽","SHEEESH 🗣️","SIGMA GRINDSET 🗿","FANUM TAX 🍔","W RIZZ 🔥","MEWING 😐","GET REAL 💀","NO CAP 🧢","BUSSIN 🤤"];
function maybeBrainrotPop() {
    if (!game.settings.brainrot) return;
    if (Math.random() < 0.018) showToast(BRAINROT_POPS[Math.floor(Math.random()*BRAINROT_POPS.length)], 1600);
}


// ============================================================
//  BUYING
// ============================================================
function buyUpgrade(i) {
    const u = UPGRADES[i]; if (!u) return;
    const cost = upgradeCost(i);
    if (game.points >= cost) {
        game.points -= cost;
        game.upgrades[i] = (game.upgrades[i] || 0) + 1;
        sfxBuy(); updateDisplay(); renderUpgradeTabs(); saveGame();
    } else { sfxError(); }
}
function buyPetSlot(idx) {
    const u = PET_SLOTS[idx]; if (!u) return;
    if (game.points >= u.cost) {
        game.points -= u.cost;
        if (u.slot > game.maxPets) game.maxPets = u.slot;
        sfxBuy(); updateDisplay(); renderUpgradeTabs(); renderPets(); saveGame();
        showToast("🐾 Pet slot " + u.slot + " unlocked!", 2000);
    } else { sfxError(); }
}

// ============================================================
//  BOTTOM SHEETS
// ============================================================
function openSheet(name) {
    closeSheet();
    const sheet = document.getElementById("sheet-" + name);
    const overlay = document.getElementById("sheet-overlay");
    if (!sheet || !overlay) return;
    if (name === "upgrades") renderUpgradeTabs();
    if (name === "pets") renderPets();
    if (name === "worlds") renderWorlds();
    if (name === "settings") syncSettingsUI();
    overlay.classList.add("visible");
    sheet.classList.add("open");
}
function closeSheet() {
    document.querySelectorAll(".sheet").forEach(s => s.classList.remove("open"));
    const overlay = document.getElementById("sheet-overlay");
    if (overlay) overlay.classList.remove("visible");
}
function showUpTab(name, btn) {
    document.querySelectorAll(".up-tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".stab").forEach(b => b.classList.remove("active"));
    const tab = document.getElementById("up-" + name);
    if (tab) tab.classList.add("active");
    if (btn) btn.classList.add("active");
}


function upCard(i) {
    const u = UPGRADES[i];
    const lvl = game.upgrades[i] || 0;
    const cost = upgradeCost(i);
    const ok = game.points >= cost;
    const stat = u.type === "click" ? "+" + fmt(u.clickPower) + " / click" : "+" + fmt(u.passivePower) + " / sec";
    return '<button class="up-card ' + (ok ? "" : "locked") + '" onclick="buyUpgrade(' + i + ')">' +
        '<div class="up-ico">' + u.icon + '</div>' +
        '<div class="up-mid"><div class="up-name">' + u.name + '</div>' +
        '<div class="up-stat">' + stat + '</div>' +
        '<div class="up-cost">' + fmt(cost) + ' 💨</div></div>' +
        '<div class="up-lvl">Lv ' + lvl + '</div></button>';
}

function renderUpgradeTabs() {
    let clickHtml = "", passiveHtml = "", slotHtml = "";
    UPGRADES.forEach((u, i) => { if (u.type === "click") clickHtml += upCard(i); else passiveHtml += upCard(i); });
    PET_SLOTS.forEach((u, idx) => {
        if (game.maxPets >= u.slot) return;
        const ok = game.points >= u.cost;
        slotHtml += '<button class="up-card ' + (ok ? "" : "locked") + '" onclick="buyPetSlot(' + idx + ')">' +
            '<div class="up-ico">🐾</div><div class="up-mid"><div class="up-name">Pet Slot ' + u.slot + '</div>' +
            '<div class="up-stat">Equip one more pet</div><div class="up-cost">' + fmt(u.cost) + ' 💨</div></div></button>';
    });
    if (!slotHtml) slotHtml = '<p class="empty-text">All pet slots unlocked! 🎉</p>';
    const c = document.getElementById("up-click"), p = document.getElementById("up-passive"), s = document.getElementById("up-slots");
    if (c) c.innerHTML = clickHtml;
    if (p) p.innerHTML = passiveHtml;
    if (s) s.innerHTML = slotHtml;
    upgradesRendered = true;
}


// ============================================================
//  SETTINGS
// ============================================================
function setMusicVol(v) {
    game.settings.musicVol = v / 100;
    const el = document.getElementById("music-vol-val"); if (el) el.innerText = v + "%";
    saveGame();
}
function setSfxVol(v) {
    game.settings.sfxVol = v / 100;
    const el = document.getElementById("sfx-vol-val"); if (el) el.innerText = v + "%";
    sfxClick(); saveGame();
}
function toggleSetting(key, btn) {
    game.settings[key] = !game.settings[key];
    const pill = btn.querySelector(".toggle-pill");
    if (pill) { pill.innerText = game.settings[key] ? "ON" : "OFF"; btn.classList.toggle("off", !game.settings[key]); }
    if (key === "musicOn") { game.settings.musicOn ? (audioStarted ? startMusic() : startAudio()) : stopMusic(); }
    if (key === "particles") { const o = document.getElementById("particle-overlay"); if (o) o.style.display = game.settings.particles ? "block" : "none"; }
    saveGame();
}
function syncSettingsUI() {
    const mv = document.getElementById("music-vol"), sv = document.getElementById("sfx-vol");
    if (mv) mv.value = Math.round(game.settings.musicVol * 100);
    if (sv) sv.value = Math.round(game.settings.sfxVol * 100);
    const mvv = document.getElementById("music-vol-val"); if (mvv) mvv.innerText = Math.round(game.settings.musicVol*100) + "%";
    const svv = document.getElementById("sfx-vol-val"); if (svv) svv.innerText = Math.round(game.settings.sfxVol*100) + "%";
    [["tg-music","musicOn"],["tg-particles","particles"],["tg-shake","screenShake"],["tg-brainrot","brainrot"]].forEach(([id,key]) => {
        const b = document.getElementById(id); if (!b) return;
        const pill = b.querySelector(".toggle-pill");
        if (pill) pill.innerText = game.settings[key] ? "ON" : "OFF";
        b.classList.toggle("off", !game.settings[key]);
    });
}
function exportSave() {
    try { navigator.clipboard.writeText(btoa(JSON.stringify(game))); showToast("📋 Save copied to clipboard!", 2200); }
    catch (e) { showToast("Export failed", 1500); }
}
function importSave() {
    const code = prompt("Paste your save code:");
    if (!code) return;
    try { const obj = JSON.parse(atob(code)); game = Object.assign(game, obj); initUpgrades(); updateDisplay(); saveGame(); showToast("✅ Save imported!", 2000); }
    catch (e) { showToast("❌ Invalid save code", 2000); }
}
function hardReset() {
    if (!confirm("Wipe EVERYTHING and start over? This cannot be undone.")) return;
    localStorage.removeItem(SAVE_KEY);
    location.reload();
}


// ============================================================
//  REBIRTH + WORLDS
// ============================================================
function rebirth() {
    const cost = getRebirthCost();
    if (game.points < cost) { sfxError(); showToast("❌ Need " + fmt(cost) + " Stink to Rebirth!", 2500); return; }
    game.rebirths++;
    game.points = 0;
    game.upgrades = {}; initUpgrades();
    comboValue = 0; spamMultiplier = 1;
    sfxRare(3);
    screenFlash("#ffd54a");
    shake();
    updateDisplay(); renderUpgradeTabs(); renderWorlds(); saveGame();
    showToast("🔄 REBORN! Rebirth #" + game.rebirths + " · +25% power!", 3200);
}

function renderWorlds() {
    let html = '<div class="world-grid">';
    WORLDS.forEach((w, i) => {
        const unlocked = game.rebirths >= w.reqRebirths;
        const current = game.worldIdx === i;
        html += '<div class="world-card ' + (unlocked ? "unlocked" : "locked") + (current ? " current" : "") +
            '" onclick="' + (unlocked ? "selectWorld(" + i + ")" : "") + '">' +
            '<div class="world-icon">' + w.icon + '</div>' +
            '<div class="world-name">' + w.name + '</div>' +
            '<div class="world-req">' + (unlocked ? (current ? "★ Current" : "Travel") : "🔒 " + w.reqRebirths + " RB") + '</div></div>';
    });
    html += '</div>';
    const el = document.getElementById("worlds-body"); if (el) el.innerHTML = html;
}
function selectWorld(i) {
    const w = WORLDS[i]; if (!w || game.rebirths < w.reqRebirths) { sfxError(); return; }
    game.worldIdx = i; sfxBuy(); updateDisplay(); renderWorlds(); saveGame();
    showToast("🌍 Travelled to " + w.name + "!", 2200);
}


// ============================================================
//  PETS
// ============================================================
function renderPets() {
    const pets = game.pets || [], eq = game.equippedPets || [];
    let html = '<button class="action-btn" onclick="openEggModal()">🥚 Open Eggs</button>';
    html += '<div class="pet-block-title">Equipped (' + eq.length + '/' + (game.maxPets||3) + ') · Total x' + getPetMult().toFixed(2) + '</div>';
    html += '<div class="pet-grid">';
    if (eq.length === 0) html += '<p class="empty-text">Equip pets to multiply click power!</p>';
    else eq.forEach(p => { html += petChip(p, true); });
    html += '</div>';
    html += '<div class="pet-block-title">Collection (' + pets.length + ')</div><div class="pet-grid">';
    if (pets.length === 0) html += '<p class="empty-text">No pets yet — open an egg!</p>';
    else pets.forEach(p => { html += petChip(p, eq.some(q => q.id === p.id)); });
    html += '</div>';
    const el = document.getElementById("pets-body"); if (el) el.innerHTML = html;
}
function petChip(p, equipped) {
    const r = RARITY[p.rarity] || RARITY.common;
    return '<div class="pet-chip ' + (equipped ? "equipped" : "") + '" style="border-color:' + r.color + '" onclick="openPetModal(' + p.id + ')">' +
        '<span class="pet-chip-emoji">' + (p.emoji || "🐾") + '</span>' +
        '<span class="pet-chip-name">' + p.name + '</span>' +
        '<span class="pet-chip-pow" style="color:' + r.color + '">' + p.power.toFixed(2) + 'x</span>' +
        (equipped ? '<span class="pet-chip-badge">✓</span>' : '') + '</div>';
}

let selectedPetId = null;
function openPetModal(id) {
    selectedPetId = id;
    const p = (game.pets||[]).find(x => x.id === id); if (!p) return;
    const r = RARITY[p.rarity] || RARITY.common;
    const equipped = (game.equippedPets||[]).some(x => x.id === id);
    const d = document.getElementById("pet-details");
    if (d) d.innerHTML = '<div class="pet-modal-emoji">' + (p.emoji||"🐾") + '</div>' +
        '<div class="pet-modal-rarity" style="color:' + r.color + '">' + r.label + '</div>' +
        '<h3 class="pet-modal-name">' + p.name + '</h3>' +
        '<div class="pet-modal-row">Click Multiplier <b>' + p.power.toFixed(2) + 'x</b></div>' +
        '<div class="pet-modal-row">Status <b>' + (equipped ? "✅ Equipped" : "Not equipped") + '</b></div>';
    const b = document.getElementById("equip-btn"); if (b) b.innerText = equipped ? "Unequip" : "Equip";
    const m = document.getElementById("pet-modal"); if (m) m.classList.remove("hidden");
}
function closePetModal() { const m = document.getElementById("pet-modal"); if (m) m.classList.add("hidden"); selectedPetId = null; }
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
//  EGG SHOP
// ============================================================
function openEggModal() {
    closeSheet();
    renderEggShop();
    const m = document.getElementById("egg-modal"); if (m) m.classList.remove("hidden");
}
function closeEggModal() { const m = document.getElementById("egg-modal"); if (m) m.classList.add("hidden"); }

function renderEggShop() {
    const bal = document.getElementById("egg-balance"); if (bal) bal.innerText = fmt(game.points);
    let html = '<div class="egg-grid">';
    EGG_TEMPLATES.forEach((egg, idx) => {
        const cost = eggCost(egg, game.worldIdx);
        const ok = game.points >= cost;
        let odds = egg.pets.map(p => {
            const r = RARITY[p.rarity];
            return '<div class="odds-row"><span style="color:' + r.color + '">' + p.emoji + ' ' + p.name + '</span>' +
                '<span class="odds-pct">' + p.odds + '%</span></div>';
        }).join("");
        html += '<div class="egg-card" style="border-color:' + egg.color + '">' +
            '<div class="egg-emoji" style="filter:drop-shadow(0 0 12px ' + egg.color + ')">' + egg.emoji + '</div>' +
            '<div class="egg-name" style="color:' + egg.color + '">' + egg.name + '</div>' +
            '<div class="egg-odds">' + odds + '</div>' +
            '<button class="egg-buy ' + (ok ? "" : "locked") + '" onclick="rollEgg(' + idx + ')">Open · ' + fmt(cost) + '</button></div>';
    });
    html += '</div>';
    const sel = document.getElementById("egg-selection"); if (sel) sel.innerHTML = html;
}

function rollEgg(idx) {
    const egg = EGG_TEMPLATES[idx]; if (!egg) return;
    const cost = eggCost(egg, game.worldIdx);
    if (game.points < cost) { sfxError(); showToast("❌ Not enough Stink!", 1500); return; }
    game.points -= cost;
    let roll = Math.random() * 100, chosen = egg.pets[0];
    for (const p of egg.pets) { if (roll < p.odds) { chosen = p; break; } roll -= p.odds; }
    const pet = {
        id: Date.now() + Math.floor(Math.random()*100000),
        name: chosen.name, emoji: chosen.emoji, rarity: chosen.rarity,
        power: petPower(chosen.base, game.worldIdx)
    };
    game.pets.push(pet);
    updateDisplay(); saveGame();
    playHatch(pet, egg);
}


// ============================================================
//  HATCH ANIMATION (rarity-scaled dopamine)
// ============================================================
function playHatch(pet, egg) {
    hatchActive = true;
    pendingHatch = pet;
    const r = RARITY[pet.rarity] || RARITY.common;
    const overlay = document.getElementById("hatch-overlay");
    const eggEl = document.getElementById("hatch-egg");
    const resEl = document.getElementById("hatch-result");
    const rays = document.getElementById("hatch-rays");
    const skip = document.getElementById("hatch-skip");
    if (!overlay || !eggEl || !resEl) return;

    closeEggModal();
    resEl.innerHTML = ""; resEl.className = "hatch-result";
    eggEl.textContent = egg.emoji;
    eggEl.className = "hatch-egg shaking";
    rays.style.opacity = "0";
    rays.style.background = "conic-gradient(from 0deg, transparent, " + r.color + "55, transparent, " + r.color + "55, transparent)";
    skip.style.opacity = "0";
    overlay.classList.remove("hidden");
    sfxClick();

    // crack sounds during shake
    let shakes = 0;
    const shakeSfx = setInterval(() => { tone(300 + shakes*60, 0.05, "square", 0.06); shakes++; }, 200);

    const shakeTime = 900 + r.tier * 120;
    setTimeout(() => {
        clearInterval(shakeSfx);
        // BURST
        eggEl.className = "hatch-egg burst";
        spawnConfetti(r.color, 30 + r.tier * 25);
        if (r.tier >= 2) { screenFlash(r.color); }
        if (r.tier >= 3) { shake(); rays.style.opacity = "1"; rays.classList.add("spin"); }
        if (r.tier >= 4) { sfxRare(5); bigRarityBanner(r); }
        sfxRare(r.tier);

        setTimeout(() => {
            eggEl.textContent = pet.emoji;
            eggEl.className = "hatch-egg reveal tier" + r.tier;
            eggEl.style.filter = "drop-shadow(0 0 24px " + r.color + ")";
            resEl.innerHTML = '<div class="hatch-rarity" style="color:' + r.color + '">' + r.label + '</div>' +
                '<div class="hatch-name">' + pet.name + '</div>' +
                '<div class="hatch-power" style="color:' + r.color + '">' + pet.power.toFixed(2) + 'x click power</div>';
            resEl.classList.add("show");
            skip.style.opacity = "1";
        }, 350);
    }, shakeTime);

    // auto-finish (short!) — longer for rarer
    setTimeout(finishHatch, shakeTime + 1700 + r.tier * 250);
}

function finishHatch() {
    if (!hatchActive) return;
    hatchActive = false;
    const overlay = document.getElementById("hatch-overlay");
    const rays = document.getElementById("hatch-rays");
    if (rays) rays.classList.remove("spin");
    if (overlay) overlay.classList.add("hidden");
    renderEggShop();
    const m = document.getElementById("egg-modal"); if (m) m.classList.remove("hidden");
    renderPets();
}


// ============================================================
//  VISUAL FX
// ============================================================
function floatText(x, y, txt, color, big) {
    const el = document.createElement("div");
    el.className = "float-text" + (big ? " big" : "");
    el.textContent = txt; el.style.left = x + "px"; el.style.top = y + "px"; el.style.color = color;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 900);
}
function popButton() {
    const b = document.getElementById("main-btn"); if (!b) return;
    b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop");
}
function showCritFx(e) {
    const c = document.createElement("div");
    c.className = "crit-fx"; c.textContent = "⚡ CRIT x" + criticalMultiplier.toFixed(1);
    c.style.left = (e.clientX - 40) + "px"; c.style.top = (e.clientY - 60) + "px";
    document.body.appendChild(c); sfxCrit();
    setTimeout(() => c.remove(), 800);
}
function showToast(text, dur) {
    const t = document.createElement("div");
    t.className = "toast"; t.innerHTML = text;
    document.body.appendChild(t);
    setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 400); }, dur || 2000);
}
function screenFlash(color) {
    const f = document.getElementById("screen-flash");
    if (!f) return;
    f.style.background = color;
    f.classList.remove("flash"); void f.offsetWidth; f.classList.add("flash");
}
function shake() {
    if (!game.settings.screenShake) return;
    const c = document.getElementById("game-container"); if (!c) return;
    c.classList.remove("shake"); void c.offsetWidth; c.classList.add("shake");
    setTimeout(() => c.classList.remove("shake"), 500);
}
function spawnConfetti(color, count) {
    if (!game.settings.particles) return;
    const layer = document.getElementById("golden-layer"); if (!layer) return;
    for (let i = 0; i < count; i++) {
        const p = document.createElement("div");
        p.className = "confetti";
        p.style.left = "50%"; p.style.top = "42%";
        p.style.background = Math.random() < 0.5 ? color : "#fff";
        const ang = Math.random() * Math.PI * 2, dist = 80 + Math.random() * 260;
        p.style.setProperty("--dx", Math.cos(ang) * dist + "px");
        p.style.setProperty("--dy", (Math.sin(ang) * dist - 60) + "px");
        layer.appendChild(p);
        setTimeout(() => p.remove(), 1100);
    }
}
function bigRarityBanner(r) {
    const b = document.createElement("div");
    b.className = "rarity-banner"; b.textContent = r.label + "!!!";
    b.style.color = r.color; b.style.textShadow = "0 0 30px " + r.color;
    document.body.appendChild(b);
    setTimeout(() => b.remove(), 2200);
}


// ============================================================
//  GOLDEN FART (random bonus — dopamine hook)
// ============================================================
function spawnGoldenFart() {
    const el = document.createElement("div");
    el.className = "golden-fart";
    el.textContent = "💨";
    el.style.top = (20 + Math.random() * 50) + "%";
    el.style.left = "-60px";
    document.getElementById("golden-layer").appendChild(el);
    // float across
    requestAnimationFrame(() => { el.style.left = "110%"; });
    el.onclick = () => {
        const reward = Math.max(getClickPower() * 60, getPassive() * 30, 50);
        game.points += reward;
        floatText(window.innerWidth/2, window.innerHeight/2, "🤑 +" + fmt(reward), "#FFD54A", true);
        screenFlash("#ffd54a"); sfxRare(3); shake();
        showToast("🌟 GOLDEN FART! +" + fmt(reward) + " Stink!", 2500);
        el.remove(); updateDisplay(); saveGame();
    };
    setTimeout(() => el.remove(), 9000);
}
setInterval(() => { if (Math.random() < 0.5) spawnGoldenFart(); }, 45000);

// ============================================================
//  DISPLAY
// ============================================================
function setTxt(id, v) { const e = document.getElementById(id); if (e) e.innerText = v; }
function updateDisplay() {
    setTxt("points", fmt(game.points));
    setTxt("per-click", fmt(getClickPower() * getPetMult()));
    setTxt("passive-income", fmt(getPassive() * getPetMult()) + "/s");
    setTxt("rebirths", String(game.rebirths || 0));
    if (WORLDS[game.worldIdx]) setTxt("world-name", WORLDS[game.worldIdx].name);
    const rb = document.getElementById("rebirth-btn");
    if (rb) {
        const cost = getRebirthCost();
        rb.innerHTML = '🔄 REBIRTH<span class="rb-cost">' + fmt(cost) + ' 💨</span>';
        rb.classList.toggle("ready", game.points >= cost);
    }
}


// ============================================================
//  PARTICLES + LOOPS + BOOT
// ============================================================
function createParticles() {
    const overlay = document.getElementById("particle-overlay"); if (!overlay) return;
    overlay.innerHTML = "";
    for (let i = 0; i < 16; i++) {
        const p = document.createElement("div");
        p.className = "particle";
        p.style.left = Math.random() * 100 + "%";
        p.style.animationDuration = (10 + Math.random() * 14) + "s";
        p.style.animationDelay = (Math.random() * 8) + "s";
        overlay.appendChild(p);
    }
}

// passive income tick
setInterval(() => {
    const inc = getPassive() * getPetMult();
    if (!isNaN(inc) && inc > 0) {
        game.points += inc;
        updateDisplay();
        if (upgradesRendered && document.getElementById("sheet-upgrades").classList.contains("open")) renderUpgradeTabs();
    }
}, 1000);

setInterval(saveGame, 5000);

function initGame() {
    loadGame();
    if (!game.settings.particles) { const o = document.getElementById("particle-overlay"); if (o) o.style.display = "none"; }
    createParticles();
    updateDisplay();
    renderUpgradeTabs();
    renderPets();
    renderWorlds();
    syncSettingsUI();

    const mainBtn = document.getElementById("main-btn");
    if (mainBtn) {
        mainBtn.addEventListener("click", handleMainClick);
        mainBtn.addEventListener("touchstart", function(ev){ ev.preventDefault(); handleMainClick(ev.touches ? {clientX:ev.touches[0].clientX, clientY:ev.touches[0].clientY} : ev); }, { passive: false });
    }
    document.addEventListener("click", startAudio, { once: true });
    document.addEventListener("touchstart", startAudio, { once: true });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initGame);
else initGame();
