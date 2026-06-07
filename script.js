/* ============================================================
   FART CLICKER — full game logic (single file, load order safe)
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
    lastClickTime: 0,
    spamMultiplier: 1,
    clickStreak: 0,
    criticalMultiplier: 1,
    totalClicks: 0,
    totalEarned: 0,
    maxPets: 3,
    bgmEnabled: false,
    bgmVolume: 0.35
};

let upgradesRendered = false;
let audioStarted = false;
let currentTrackIndex = 0;
let currentTrackAudio = null;
let audioCtx = null;


// ---------- 20 Worlds (exponential-ish rebirth gating) ----------
const WORLDS = [
    { name: "Basement",             reqRebirths: 0,   icon: "🏚️" },
    { name: "Sewer Tunnels",        reqRebirths: 1,   icon: "🕳️" },
    { name: "Enchanted Forest",     reqRebirths: 3,   icon: "🌲" },
    { name: "Volcanic Crater",      reqRebirths: 6,   icon: "🌋" },
    { name: "Frozen Tundra",        reqRebirths: 10,  icon: "❄️" },
    { name: "Outer Space",          reqRebirths: 15,  icon: "🚀" },
    { name: "Abyssal Trench",       reqRebirths: 21,  icon: "🌊" },
    { name: "Nether Realm",         reqRebirths: 28,  icon: "🔥" },
    { name: "Cybernetic City",      reqRebirths: 36,  icon: "🤖" },
    { name: "Dimension X",          reqRebirths: 45,  icon: "🛸" },
    { name: "Quantum Realm",        reqRebirths: 55,  icon: "⚛️" },
    { name: "Void of Chaos",        reqRebirths: 66,  icon: "🌀" },
    { name: "Celestial Heaven",     reqRebirths: 78,  icon: "☁️" },
    { name: "Inferno Depths",       reqRebirths: 91,  icon: "👹" },
    { name: "Crystal Cavern",       reqRebirths: 105, icon: "💎" },
    { name: "Mirror Dimension",     reqRebirths: 120, icon: "🪞" },
    { name: "Galactic Core",        reqRebirths: 136, icon: "🌌" },
    { name: "Time Rift",            reqRebirths: 153, icon: "⏳" },
    { name: "Ultimate Nexus",       reqRebirths: 171, icon: "✨" },
    { name: "The Final Stench",     reqRebirths: 190, icon: "👑" }
];


// ---------- Number formatting (NaN-safe) ----------
function formatNumber(num) {
    if (num === undefined || num === null || isNaN(num)) return "0";
    const a = Math.abs(num);
    if (a < 1000) return Math.floor(num).toString();
    const units = ["K","M","B","T","Qa","Qi","Sx","Sp","Oc","No","Dc"];
    let tier = Math.floor(Math.log10(a) / 3);
    if (tier > units.length) return num.toExponential(2);
    const scaled = num / Math.pow(1000, tier);
    return scaled.toFixed(2).replace(/\.?0+$/, '') + units[tier - 1];
}

// ---------- Upgrades ----------
// Click upgrades (index 0-14) and passive upgrades (index 15-29)
const UPGRADES = [
    { name: "Fart Bean",          baseCost: 15,            clickPower: 1,          type: "click" },
    { name: "Cabbage Burst",      baseCost: 100,           clickPower: 4,          type: "click" },
    { name: "Taco Bomb",          baseCost: 600,           clickPower: 18,         type: "click" },
    { name: "Sewer Gas Cloud",    baseCost: 3500,          clickPower: 70,         type: "click" },
    { name: "Swamp Miasma",       baseCost: 20000,         clickPower: 300,        type: "click" },
    { name: "Gym Sock Stench",    baseCost: 120000,        clickPower: 1300,       type: "click" },
    { name: "Rotten Egg Blaster", baseCost: 750000,        clickPower: 5500,       type: "click" },
    { name: "Durian Nuke",        baseCost: 4500000,       clickPower: 24000,      type: "click" },
    { name: "Sewer Pipe Cannon",  baseCost: 28000000,      clickPower: 110000,     type: "click" },
    { name: "Methane Eruption",   baseCost: 180000000,     clickPower: 520000,     type: "click" },
    { name: "Toxic Barrel Bomb",  baseCost: 1200000000,    clickPower: 2500000,    type: "click" },
    { name: "Ammonia Surge",      baseCost: 8000000000,    clickPower: 12500000,   type: "click" },
    { name: "Volcanic Flatulence",baseCost: 55000000000,   clickPower: 65000000,   type: "click" },
    { name: "Apocalyptic Gas",    baseCost: 400000000000,  clickPower: 350000000,  type: "click" },
    { name: "Reality Fart",       baseCost: 3000000000000, clickPower: 2000000000, type: "click" },

    { name: "Small Fan",          baseCost: 50,            passivePower: 1,        type: "passive" },
    { name: "Air Blower",         baseCost: 400,           passivePower: 6,        type: "passive" },
    { name: "Industrial Vent",    baseCost: 2500,          passivePower: 28,       type: "passive" },
    { name: "Wind Turbine",       baseCost: 15000,         passivePower: 130,      type: "passive" },
    { name: "Tornado Generator",  baseCost: 90000,         passivePower: 600,      type: "passive" },
    { name: "Hurricane Engine",   baseCost: 550000,        passivePower: 2800,     type: "passive" },
    { name: "Stink Cannon",       baseCost: 3400000,       passivePower: 13000,    type: "passive" },
    { name: "Nuclear Reactor",    baseCost: 21000000,      passivePower: 62000,    type: "passive" },
    { name: "Black Hole Gen",     baseCost: 140000000,     passivePower: 300000,   type: "passive" },
    { name: "Galaxy Engine",      baseCost: 950000000,     passivePower: 1500000,  type: "passive" },
    { name: "Supernova Reactor",  baseCost: 6500000000,    passivePower: 7500000,  type: "passive" },
    { name: "Quantum Processor",  baseCost: 45000000000,   passivePower: 38000000, type: "passive" },
    { name: "Cosmic Amplifier",   baseCost: 320000000000,  passivePower: 200000000,type: "passive" },
    { name: "Dimensional Pump",   baseCost: 2300000000000, passivePower: 1100000000,type:"passive" },
    { name: "Reality Warper",     baseCost: 17000000000000,passivePower: 6000000000,type:"passive" }
];

const PET_SLOT_UPGRADES = [
    { slot: 4,  cost: 250000,        name: "Pet Slot #4" },
    { slot: 5,  cost: 5000000,       name: "Pet Slot #5" },
    { slot: 6,  cost: 90000000,      name: "Pet Slot #6" },
    { slot: 7,  cost: 1500000000,    name: "Pet Slot #7" },
    { slot: 8,  cost: 28000000000,   name: "Pet Slot #8" }
];


// ---------- Pet pools per world ----------
const PET_POOLS = {};
for (let w = 0; w < 20; w++) {
    PET_POOLS[w] = {
        eggs: [
            { name: "Common Egg", emoji: "🥚", cost: Math.floor(800 * Math.pow(2.2, w)), color: "#8B9DC3", pets: [
                {name:"Toot",power:1.10,odds:40},{name:"Squeaker",power:1.20,odds:30},
                {name:"Puff",power:1.35,odds:18},{name:"Whoosh",power:1.55,odds:9},
                {name:"Breeze",power:1.80,odds:3}
            ]},
            { name: "Rare Egg", emoji: "🥚", cost: Math.floor(5000 * Math.pow(2.4, w)), color: "#9B59B6", pets: [
                {name:"Thunder Cheeks",power:2.0,odds:40},{name:"Boom Butt",power:2.4,odds:30},
                {name:"Sonic Blast",power:2.9,odds:18},{name:"Quake Crack",power:3.6,odds:9},
                {name:"Shockwave",power:4.5,odds:3}
            ]},
            { name: "Legendary Egg", emoji: "🌟", cost: Math.floor(40000 * Math.pow(2.6, w)), color: "#F1C40F", pets: [
                {name:"Stink Lord",power:5.0,odds:40},{name:"Fume Phantom",power:6.5,odds:30},
                {name:"Gas God",power:8.0,odds:18},{name:"Miasma Master",power:11.0,odds:9},
                {name:"Aroma Apocalypse",power:16.0,odds:3}
            ]}
        ]
    };
}


// ---------- Audio: SFX via WebAudio (no network, no CORS) ----------
function getAudioCtx() {
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === "suspended") audioCtx.resume();
    } catch (e) { audioCtx = null; }
    return audioCtx;
}

function beep(freq, durMs, type, gainVal) {
    try {
        const ctx = getAudioCtx();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type || "square";
        osc.frequency.value = freq;
        gain.gain.value = gainVal || 0.08;
        osc.connect(gain);
        gain.connect(ctx.destination);
        const now = ctx.currentTime;
        gain.gain.setValueAtTime(gainVal || 0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + durMs / 1000);
        osc.start(now);
        osc.stop(now + durMs / 1000);
    } catch (e) { /* silent */ }
}

function createClickSound()    { beep(620, 70, "square", 0.07); }
function createPurchaseSound() { beep(880, 90, "triangle", 0.09); setTimeout(()=>beep(1180,90,"triangle",0.07),60); }
function createCriticalSound() { beep(1320, 130, "sawtooth", 0.10); }


// ---------- Background Music Playlist (NCS-style) ----------
// Reliable, CORS-friendly streaming MP3s so music actually plays.
const NCS_TRACKS = [
    { title: "My Heart (Different Heaven & EH!DE)", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
    { title: "Let's Go! (Lensko)",                  url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
    { title: "Fade (Alan Walker)",                  url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
    { title: "On & On (Cartoon)",                   url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
    { title: "Invincible (DEAF KEV)",               url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" },
    { title: "Heroes Tonight (Janji)",              url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3" },
    { title: "Symbolism (Electro-Light)",           url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3" },
    { title: "Blank (Disfigure)",                   url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" }
];
let bgmPlaylist = [];

function loadNCSPlaylist() {
    try { bgmPlaylist = NCS_TRACKS.slice(); } catch (e) { bgmPlaylist = []; }
}

function playNextTrack() {
    try {
        if (!game.bgmEnabled || bgmPlaylist.length === 0) return;
        if (currentTrackAudio) { try { currentTrackAudio.pause(); } catch(e){} }
        const track = bgmPlaylist[currentTrackIndex % bgmPlaylist.length];
        currentTrackAudio = new Audio(track.url);
        currentTrackAudio.volume = game.bgmVolume;
        currentTrackAudio.play().then(() => {
            const s = document.getElementById("bgm-status");
            if (s) s.innerText = "BGM: ON";
        }).catch(() => {
            currentTrackIndex++;
            setTimeout(playNextTrack, 800);
        });
        currentTrackAudio.onended = () => { currentTrackIndex++; playNextTrack(); };
        currentTrackAudio.onerror = () => { currentTrackIndex++; setTimeout(playNextTrack, 800); };
    } catch (e) {
        currentTrackIndex++;
        setTimeout(playNextTrack, 800);
    }
}

// Called on the very first user interaction (browser autoplay rule)
function startAudio() {
    if (audioStarted) return;
    audioStarted = true;
    getAudioCtx();
    if (bgmPlaylist.length === 0) loadNCSPlaylist();
    if (!game.bgmEnabled) {
        game.bgmEnabled = true;
        const s = document.getElementById("bgm-status");
        if (s) s.innerText = "BGM: ON";
    }
    playNextTrack();
    saveGame();
}

function toggleBGM() {
    game.bgmEnabled = !game.bgmEnabled;
    const s = document.getElementById("bgm-status");
    if (s) s.innerText = game.bgmEnabled ? "BGM: ON" : "BGM: OFF";
    try {
        if (game.bgmEnabled) {
            if (currentTrackAudio) currentTrackAudio.play().catch(()=>{});
            else { audioStarted = true; loadNCSPlaylist(); playNextTrack(); }
        } else if (currentTrackAudio) {
            currentTrackAudio.pause();
        }
    } catch (e) {}
    saveGame();
}


// ---------- Core math (all NaN-safe) ----------
function getClickPower() {
    let power = game.baseClickPower || 1;
    UPGRADES.forEach((u, i) => {
        if (u.type === "click" && game.upgrades[i]) power += (u.clickPower || 0) * game.upgrades[i];
    });
    // each rebirth gives +25% global click power
    power *= (1 + (game.rebirths || 0) * 0.25);
    return power;
}

function getPassiveIncome() {
    let income = 0;
    UPGRADES.forEach((u, i) => {
        if (u.type === "passive" && game.upgrades[i]) income += (u.passivePower || 0) * game.upgrades[i];
    });
    income *= (1 + (game.rebirths || 0) * 0.25);
    return income;
}

function getPetMultiplier() {
    let mult = 1;
    (game.equippedPets || []).forEach(p => { mult *= (p.power || 1); });
    return mult;
}

function getUpgradeCost(i) {
    const u = UPGRADES[i];
    if (!u) return Infinity;
    const level = game.upgrades[i] || 0;
    return Math.floor(u.baseCost * Math.pow(1.15, level));
}

// Rebirth: single big exponential cost, grants +1 rebirth
function getRebirthCost() {
    return 1000000 * Math.pow(3, game.rebirths || 0);
}

function initializeUpgrades() {
    if (!game.upgrades) game.upgrades = {};
    UPGRADES.forEach((_, i) => { if (typeof game.upgrades[i] !== "number") game.upgrades[i] = 0; });
}


// ---------- Save / Load ----------
function saveGame() {
    try { localStorage.setItem("fartSave_v3", JSON.stringify(game)); } catch (e) {}
}

function loadGame() {
    try {
        const saved = localStorage.getItem("fartSave_v3");
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed && typeof parsed === "object") game = Object.assign(game, parsed);
        }
    } catch (e) { /* keep defaults */ }
    if (!game.maxPets) game.maxPets = 3;
    if (!Array.isArray(game.pets)) game.pets = [];
    if (!Array.isArray(game.equippedPets)) game.equippedPets = [];
    if (typeof game.worldIdx !== "number") game.worldIdx = 0;
    if (typeof game.rebirths !== "number") game.rebirths = 0;
    if (typeof game.points !== "number" || isNaN(game.points)) game.points = 0;
    initializeUpgrades();
}

// ---------- Main click handler ----------
function handleMainClick(e) {
    startAudio();
    const now = Date.now();
    const dt = now - (game.lastClickTime || 0);
    if (dt < 350 && dt >= 0) {
        game.clickStreak++;
        game.spamMultiplier = Math.min(1 + game.clickStreak * 0.12, 5);
    } else {
        game.clickStreak = 0;
        game.spamMultiplier = 1;
    }
    game.lastClickTime = now;
    game.totalClicks++;

    const critChance = Math.min(0.05 + game.clickStreak * 0.01, 0.20);
    if (Math.random() < critChance) {
        game.criticalMultiplier = 2 + Math.random() * 3;
        showCriticalHit(e);
    } else {
        game.criticalMultiplier = 1;
    }

    let dmg = getClickPower() * game.spamMultiplier * getPetMultiplier() * game.criticalMultiplier;
    if (isNaN(dmg) || dmg < 0) dmg = 1;
    game.points += dmg;
    game.totalEarned += dmg;

    createClickSound();
    showClickPop(e, dmg);
    pulseButton();
    updateDisplay();
    if (upgradesRendered) renderUpgradesPanel();
    saveGame();
}


// ---------- Buying ----------
function buyUpgrade(i) {
    const u = UPGRADES[i];
    if (!u) return;
    const cost = getUpgradeCost(i);
    if (game.points >= cost) {
        game.points -= cost;
        game.upgrades[i] = (game.upgrades[i] || 0) + 1;
        createPurchaseSound();
        updateDisplay();
        renderUpgradesPanel();
        saveGame();
    }
}

function buyPetSlot(idx) {
    const u = PET_SLOT_UPGRADES[idx];
    if (!u) return;
    if (game.points >= u.cost) {
        game.points -= u.cost;
        if (u.slot > game.maxPets) game.maxPets = u.slot;
        createPurchaseSound();
        updateDisplay();
        renderUpgradesPanel();
        renderPets();
        saveGame();
    }
}

// ---------- Sliding upgrades menu ----------
function toggleUpgradesMenu() {
    const panel = document.getElementById("upgrades-panel");
    const overlay = document.getElementById("upgrades-overlay");
    if (!panel || !overlay) return;
    if (panel.classList.contains("open")) {
        panel.classList.remove("open");
        overlay.classList.remove("visible");
    } else {
        renderUpgradesPanel();
        panel.classList.add("open");
        overlay.classList.add("visible");
    }
}


// ---------- Render: upgrades panel ----------
function upgradeCardHTML(i) {
    const u = UPGRADES[i];
    const level = game.upgrades[i] || 0;
    const cost = getUpgradeCost(i);
    const affordable = game.points >= cost;
    const stat = u.type === "click"
        ? "+" + formatNumber(u.clickPower) + " / click"
        : "+" + formatNumber(u.passivePower) + " / sec";
    return '<button class="up-card ' + (affordable ? "" : "locked") + '" onclick="buyUpgrade(' + i + ')">' +
        '<div class="up-top"><span class="up-name">' + u.name + '</span>' +
        '<span class="up-lvl">Lv ' + level + '</span></div>' +
        '<div class="up-stat">' + stat + '</div>' +
        '<div class="up-cost">' + formatNumber(cost) + ' 💨</div>' +
        '</button>';
}

function renderUpgradesPanel() {
    let clickHtml = "", passiveHtml = "", petHtml = "";
    UPGRADES.forEach((u, i) => {
        if (u.type === "click") clickHtml += upgradeCardHTML(i);
        else passiveHtml += upgradeCardHTML(i);
    });
    PET_SLOT_UPGRADES.forEach((u, idx) => {
        if (game.maxPets >= u.slot) return;
        const affordable = game.points >= u.cost;
        petHtml += '<button class="up-card ' + (affordable ? "" : "locked") + '" onclick="buyPetSlot(' + idx + ')">' +
            '<div class="up-top"><span class="up-name">' + u.name + '</span></div>' +
            '<div class="up-stat">Unlock slot ' + u.slot + '</div>' +
            '<div class="up-cost">' + formatNumber(u.cost) + ' 💨</div></button>';
    });
    if (!petHtml) petHtml = '<p class="empty-text">All pet slots unlocked! 🎉</p>';

    const c = document.getElementById("upgrades-panel-click");
    const p = document.getElementById("upgrades-panel-passive");
    const s = document.getElementById("upgrades-panel-pets");
    if (c) c.innerHTML = clickHtml;
    if (p) p.innerHTML = passiveHtml;
    if (s) s.innerHTML = petHtml;
    upgradesRendered = true;
}


// ---------- Egg modal ----------
function openEggModal() {
    const m = document.getElementById("egg-modal");
    if (m) { renderEggSelection(); m.classList.remove("hidden"); }
}
function closeEggModal() {
    const m = document.getElementById("egg-modal");
    if (m) m.classList.add("hidden");
}

function renderEggSelection() {
    const pool = PET_POOLS[game.worldIdx] || PET_POOLS[0];
    let html = '<div class="egg-grid">';
    pool.eggs.forEach((egg, idx) => {
        const affordable = game.points >= egg.cost;
        let odds = egg.pets.map(p =>
            '<div class="odds-row"><span>' + p.name + '</span>' +
            '<span class="odds-pct">' + p.power.toFixed(2) + 'x · ' + p.odds + '%</span></div>'
        ).join("");
        html += '<div class="egg-card" style="border-color:' + egg.color + '">' +
            '<div class="egg-emoji" style="filter:drop-shadow(0 0 10px ' + egg.color + ')">' + egg.emoji + '</div>' +
            '<div class="egg-name" style="color:' + egg.color + '">' + egg.name + '</div>' +
            '<div class="egg-odds">' + odds + '</div>' +
            '<button class="egg-buy ' + (affordable ? "" : "locked") + '" onclick="selectEgg(' + idx + ')">' +
            'Open · ' + formatNumber(egg.cost) + ' 💨</button>' +
            '</div>';
    });
    html += '</div>';
    const sel = document.getElementById("egg-selection");
    if (sel) sel.innerHTML = html;
}

function selectEgg(eggIdx) {
    const pool = PET_POOLS[game.worldIdx] || PET_POOLS[0];
    const egg = pool.eggs[eggIdx];
    if (!egg) return;
    if (game.points < egg.cost) { showRarePopup("❌ Not enough Stink!", 1500); return; }
    game.points -= egg.cost;
    let roll = Math.random() * 100, chosen = egg.pets[0];
    for (const p of egg.pets) { if (roll < p.odds) { chosen = p; break; } roll -= p.odds; }
    const pet = { id: Date.now() + Math.floor(Math.random()*10000), name: chosen.name, power: chosen.power, eggType: egg.name };
    game.pets.push(pet);
    createPurchaseSound();
    updateDisplay();
    renderEggSelection();
    renderPets();
    saveGame();
    showRarePopup('🎉 Hatched <b>' + pet.name + '</b> (' + pet.power.toFixed(2) + 'x)!', 2500);
}


// ---------- Pet modal ----------
let selectedPetId = null;
function openPetModal(petId) {
    selectedPetId = petId;
    const pet = (game.pets || []).find(p => p.id === petId);
    if (!pet) return;
    const equipped = (game.equippedPets || []).some(p => p.id === petId);
    const details = document.getElementById("pet-details");
    if (details) {
        details.innerHTML =
            '<div class="pet-modal-emoji">🐾</div>' +
            '<h3 class="pet-modal-name">' + pet.name + '</h3>' +
            '<div class="pet-modal-row">Click Multiplier: <b>' + pet.power.toFixed(2) + 'x</b></div>' +
            '<div class="pet-modal-row">From: <b>' + (pet.eggType || "?") + '</b></div>' +
            '<div class="pet-modal-row">Status: <b>' + (equipped ? "✅ Equipped" : "Not equipped") + '</b></div>';
    }
    const eqBtn = document.getElementById("equip-btn");
    if (eqBtn) eqBtn.innerText = equipped ? "Unequip" : "Equip";
    const m = document.getElementById("pet-modal");
    if (m) m.classList.remove("hidden");
}
function closePetModal() {
    const m = document.getElementById("pet-modal");
    if (m) m.classList.add("hidden");
    selectedPetId = null;
}

function equipPet() {
    const pet = (game.pets || []).find(p => p.id === selectedPetId);
    if (!pet) return;
    const equipped = (game.equippedPets || []).some(p => p.id === selectedPetId);
    if (equipped) {
        game.equippedPets = game.equippedPets.filter(p => p.id !== selectedPetId);
    } else {
        if (game.equippedPets.length >= (game.maxPets || 3)) {
            showRarePopup("⚠️ All " + game.maxPets + " slots full! Unlock more in Upgrades.", 2500);
            return;
        }
        game.equippedPets.push(pet);
        createPurchaseSound();
    }
    closePetModal();
    updateDisplay();
    renderPets();
    saveGame();
}


// ---------- Rebirth ----------
function rebirth() {
    const cost = getRebirthCost();
    if (game.points < cost) {
        showRarePopup("❌ Need " + formatNumber(cost) + " Stink to Rebirth!", 2500);
        return;
    }
    game.rebirths++;
    game.points = 0;
    game.upgrades = {};
    initializeUpgrades();
    game.spamMultiplier = 1;
    game.clickStreak = 0;
    game.criticalMultiplier = 1;
    createPurchaseSound();
    updateDisplay();
    renderUpgradesPanel();
    renderWorlds();
    saveGame();
    showRarePopup("🔄 REBORN! You now have <b>" + game.rebirths + "</b> rebirths (+25% power each)!", 3500);
}

// ---------- Tabs ----------
function showTab(tabId, btn) {
    document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    const tab = document.getElementById(tabId);
    if (tab) tab.classList.add("active");
    if (btn) btn.classList.add("active");
    if (tabId === "pets") renderPets();
    if (tabId === "worlds") renderWorlds();
}

// ---------- World selection ----------
function selectWorld(idx) {
    const w = WORLDS[idx];
    if (!w) return;
    if (game.rebirths < w.reqRebirths) {
        showRarePopup("🔒 Needs " + w.reqRebirths + " rebirths.", 2000);
        return;
    }
    game.worldIdx = idx;
    createPurchaseSound();
    updateDisplay();
    renderWorlds();
    saveGame();
    showRarePopup("🌍 Travelled to <b>" + w.name + "</b>!", 2500);
}


// ---------- Render: Pets tab ----------
function renderPets() {
    const pets = game.pets || [];
    const equipped = game.equippedPets || [];
    let html = '<button class="action-btn egg-open-btn" onclick="openEggModal()">🥚 Open Eggs</button>';

    html += '<div class="pet-block"><div class="pet-block-title">Equipped (' + equipped.length + '/' + (game.maxPets || 3) + ')</div>';
    if (equipped.length === 0) {
        html += '<p class="empty-text">No pets equipped — equip pets to boost click power!</p>';
    } else {
        html += '<div class="pet-grid">';
        equipped.forEach(p => {
            html += '<div class="pet-chip equipped" onclick="openPetModal(' + p.id + ')">' +
                '<span class="pet-chip-emoji">🐾</span><span class="pet-chip-name">' + p.name + '</span>' +
                '<span class="pet-chip-pow">' + p.power.toFixed(2) + 'x</span></div>';
        });
        html += '</div>';
    }
    html += '</div>';

    html += '<div class="pet-block"><div class="pet-block-title">Collection (' + pets.length + ')</div>';
    if (pets.length === 0) {
        html += '<p class="empty-text">No pets yet. Open an egg to start collecting!</p>';
    } else {
        html += '<div class="pet-grid">';
        pets.forEach(p => {
            const isEq = equipped.some(q => q.id === p.id);
            html += '<div class="pet-chip ' + (isEq ? "equipped" : "") + '" onclick="openPetModal(' + p.id + ')">' +
                '<span class="pet-chip-emoji">🐾</span><span class="pet-chip-name">' + p.name + '</span>' +
                '<span class="pet-chip-pow">' + p.power.toFixed(2) + 'x</span>' +
                (isEq ? '<span class="pet-chip-badge">✓</span>' : '') + '</div>';
        });
        html += '</div>';
    }
    html += '</div>';

    const el = document.getElementById("pets");
    if (el) el.innerHTML = html;
}

// ---------- Render: Worlds tab ----------
function renderWorlds() {
    let html = '<div class="world-grid">';
    WORLDS.forEach((w, i) => {
        const unlocked = game.rebirths >= w.reqRebirths;
        const current = game.worldIdx === i;
        html += '<div class="world-card ' + (unlocked ? "unlocked" : "locked") + (current ? " current" : "") +
            '" onclick="' + (unlocked ? "selectWorld(" + i + ")" : "") + '">' +
            '<div class="world-icon">' + w.icon + '</div>' +
            '<div class="world-name">' + w.name + '</div>' +
            '<div class="world-req">' + (unlocked ? (current ? "★ Current" : "Tap to travel") : "🔒 " + w.reqRebirths + " rebirths") + '</div>' +
            '</div>';
    });
    html += '</div>';
    const el = document.getElementById("worlds");
    if (el) el.innerHTML = html;
}


// ---------- Display update ----------
function setText(id, txt) { const el = document.getElementById(id); if (el) el.innerText = txt; }

function updateDisplay() {
    setText("points", formatNumber(game.points));
    setText("per-click", formatNumber(getClickPower() * getPetMultiplier()));
    setText("spam-mult", (game.spamMultiplier || 1).toFixed(1) + "x");
    setText("passive-income", formatNumber(getPassiveIncome() * getPetMultiplier()) + "/s");
    setText("rebirths", String(game.rebirths || 0));
    if (WORLDS[game.worldIdx]) setText("world-name", WORLDS[game.worldIdx].name);
    const rb = document.getElementById("rebirth-btn");
    if (rb) {
        const cost = getRebirthCost();
        rb.innerHTML = '🔄 REBIRTH<span class="rb-cost">' + formatNumber(cost) + ' 💨</span>';
        rb.classList.toggle("ready", game.points >= cost);
    }
}

// ---------- Visual effects ----------
function pulseButton() {
    const b = document.getElementById("main-btn");
    if (!b) return;
    b.classList.remove("pop");
    void b.offsetWidth;
    b.classList.add("pop");
}

function showClickPop(e, dmg) {
    const pop = document.createElement("div");
    pop.className = "click-pop";
    pop.textContent = "+" + formatNumber(dmg) + " Stink";
    pop.style.left = (e.clientX || window.innerWidth/2) + "px";
    pop.style.top = (e.clientY || window.innerHeight/2) + "px";
    pop.style.color = game.criticalMultiplier > 1.5 ? "#FFD700" : (game.spamMultiplier > 3 ? "#00D9FF" : "#7FFF00");
    document.body.appendChild(pop);
    setTimeout(() => pop.remove(), 850);
}

function showCriticalHit(e) {
    const c = document.createElement("div");
    c.className = "critical-hit";
    c.textContent = "⚡ CRIT!";
    c.style.left = ((e.clientX || window.innerWidth/2) - 40) + "px";
    c.style.top = ((e.clientY || window.innerHeight/2) - 50) + "px";
    document.body.appendChild(c);
    createCriticalSound();
    setTimeout(() => c.remove(), 800);
}

function showRarePopup(text, duration) {
    const p = document.createElement("div");
    p.className = "rare-popup";
    p.innerHTML = text;
    document.body.appendChild(p);
    setTimeout(() => { p.classList.add("fade-out"); setTimeout(() => p.remove(), 500); }, duration || 3000);
}


// ---------- Particles ----------
function createParticles() {
    const overlay = document.getElementById("particle-overlay");
    if (!overlay) return;
    for (let i = 0; i < 18; i++) {
        const p = document.createElement("div");
        p.className = "particle";
        p.style.left = Math.random() * 100 + "%";
        p.style.animationDuration = (10 + Math.random() * 15) + "s";
        p.style.animationDelay = (Math.random() * 8) + "s";
        overlay.appendChild(p);
    }
}

// ---------- Passive income loop ----------
setInterval(() => {
    const inc = getPassiveIncome() * getPetMultiplier();
    if (!isNaN(inc) && inc > 0) {
        game.points += inc;
        updateDisplay();
        if (upgradesRendered) renderUpgradesPanel();
    }
}, 1000);

// autosave every 5s
setInterval(saveGame, 5000);

// ---------- Boot ----------
function initGame() {
    loadGame();
    loadNCSPlaylist();
    createParticles();
    updateDisplay();
    renderUpgradesPanel();
    renderPets();
    renderWorlds();

    const mainBtn = document.getElementById("main-btn");
    if (mainBtn) mainBtn.addEventListener("click", handleMainClick);

    // First interaction anywhere starts the music (browser autoplay rule)
    document.addEventListener("click", startAudio, { once: true });
    document.addEventListener("touchstart", startAudio, { once: true });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGame);
} else {
    initGame();
}
