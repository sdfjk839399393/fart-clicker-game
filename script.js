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
    clickStreak: 0
};

// World Data
const WORLDS = [
    { id: 0, name: "Basement", reqRebirths: 0, color: "#8B6914" },
    { id: 1, name: "City Sewers", reqRebirths: 5, color: "#696969" },
    { id: 2, name: "Enchanted Forest", reqRebirths: 10, color: "#228B22" },
    { id: 3, name: "Volcanic Crater", reqRebirths: 15, color: "#FF4500" },
    { id: 4, name: "Outer Space", reqRebirths: 20, color: "#1a1a2e" }
];

// 3 EGG TYPES with 5 PETS EACH
const PET_POOLS = {
    0: { // Basement - 3 Egg Types
        eggs: [
            { // Common Egg
                name: "🥚 Basic Egg",
                cost: 500,
                color: "#8B7355",
                pets: [
                    { name: "Sewer Rat", power: 1.1 },
                    { name: "Stink Bug", power: 1.2 },
                    { name: "Dung Fly", power: 1.15 },
                    { name: "Waste Roach", power: 1.25 },
                    { name: "Swamp Slug", power: 1.3 }
                ]
            },
            { // Rare Egg
                name: "💜 Rare Egg",
                cost: 2000,
                color: "#9370DB",
                pets: [
                    { name: "Toxic Toad", power: 1.8 },
                    { name: "Poison Beetle", power: 1.9 },
                    { name: "Foul Hornet", power: 2.0 },
                    { name: "Decay Moth", power: 1.85 },
                    { name: "Rats King", power: 2.2 }
                ]
            },
            { // Epic Egg
                name: "✨ Epic Egg",
                cost: 8000,
                color: "#FFD700",
                pets: [
                    { name: "Legendary Skunk", power: 3.5 },
                    { name: "Ancient Badger", power: 3.2 },
                    { name: "Shadow Possum", power: 3.8 },
                    { name: "Cursed Creature", power: 3.1 },
                    { name: "Stench Demon", power: 4.0 }
                ]
            }
        ]
    },
    1: { // City Sewers
        eggs: [
            {
                name: "🥚 Street Egg",
                cost: 1000,
                color: "#696969",
                pets: [
                    { name: "Street Rat", power: 1.3 },
                    { name: "Alley Cat", power: 1.35 },
                    { name: "Sewer Crow", power: 1.4 },
                    { name: "Drain Snake", power: 1.45 },
                    { name: "Metro Mouse", power: 1.5 }
                ]
            },
            {
                name: "💜 Toxic Egg",
                cost: 4000,
                color: "#00AA00",
                pets: [
                    { name: "Mutant Cockroach", power: 2.4 },
                    { name: "Radiation Rat", power: 2.5 },
                    { name: "Chemical Frog", power: 2.3 },
                    { name: "Polluted Bird", power: 2.6 },
                    { name: "Toxic Possum", power: 2.8 }
                ]
            },
            {
                name: "✨ Legendary Egg",
                cost: 12000,
                color: "#FF00FF",
                pets: [
                    { name: "Sewer King", power: 4.2 },
                    { name: "Underground Demon", power: 4.5 },
                    { name: "Tunnel Master", power: 4.0 },
                    { name: "Pipe Phantom", power: 4.3 },
                    { name: "Metropolis Beast", power: 4.8 }
                ]
            }
        ]
    },
    2: { // Forest
        eggs: [
            {
                name: "🥚 Forest Egg",
                cost: 2000,
                color: "#228B22",
                pets: [
                    { name: "Forest Badger", power: 1.7 },
                    { name: "Tree Squirrel", power: 1.6 },
                    { name: "Swamp Gator", power: 1.8 },
                    { name: "Bog Lizard", power: 1.75 },
                    { name: "Woodland Beast", power: 1.9 }
                ]
            },
            {
                name: "💜 Mystical Egg",
                cost: 7000,
                color: "#20B2AA",
                pets: [
                    { name: "Enchanted Fox", power: 3.0 },
                    { name: "Magic Wolf", power: 3.2 },
                    { name: "Mystic Owl", power: 2.9 },
                    { name: "Ethereal Stag", power: 3.1 },
                    { name: "Forest Guardian", power: 3.4 }
                ]
            },
            {
                name: "✨ Legendary Egg",
                cost: 20000,
                color: "#FFD700",
                pets: [
                    { name: "Legendary Skunk", power: 5.0 },
                    { name: "Ancient Phoenix", power: 5.2 },
                    { name: "Primal Beast", power: 4.9 },
                    { name: "Nature's Wrath", power: 5.3 },
                    { name: "Forest Deity", power: 5.5 }
                ]
            }
        ]
    },
    3: { // Volcano
        eggs: [
            {
                name: "🥚 Lava Egg",
                cost: 3500,
                color: "#FF4500",
                pets: [
                    { name: "Lava Salamander", power: 2.2 },
                    { name: "Fire Imp", power: 2.4 },
                    { name: "Magma Worm", power: 2.3 },
                    { name: "Volcanic Bat", power: 2.25 },
                    { name: "Ash Drake", power: 2.5 }
                ]
            },
            {
                name: "💜 Inferno Egg",
                cost: 10000,
                color: "#FF0000",
                pets: [
                    { name: "Infernal Beast", power: 3.8 },
                    { name: "Flame Lord", power: 3.9 },
                    { name: "Fire Serpent", power: 3.7 },
                    { name: "Magma Demon", power: 4.0 },
                    { name: "Volcano Guardian", power: 4.2 }
                ]
            },
            {
                name: "✨ Cosmic Egg",
                cost: 30000,
                color: "#FFD700",
                pets: [
                    { name: "Chaos Dragon", power: 6.0 },
                    { name: "Primordial Flame", power: 6.2 },
                    { name: "Inferno Overlord", power: 5.9 },
                    { name: "Volcanic God", power: 6.3 },
                    { name: "Apocalypse Beast", power: 6.5 }
                ]
            }
        ]
    },
    4: { // Space
        eggs: [
            {
                name: "🥚 Meteor Egg",
                cost: 5000,
                color: "#4B0082",
                pets: [
                    { name: "Space Rat", power: 2.6 },
                    { name: "Cosmic Mouse", power: 2.5 },
                    { name: "Meteor Bird", power: 2.7 },
                    { name: "Asteroid Creature", power: 2.8 },
                    { name: "Zero-G Beast", power: 2.9 }
                ]
            },
            {
                name: "💜 Nebula Egg",
                cost: 15000,
                color: "#00BFFF",
                pets: [
                    { name: "Cosmic Squid", power: 4.5 },
                    { name: "Nebula Serpent", power: 4.6 },
                    { name: "Galaxy Falcon", power: 4.4 },
                    { name: "Void Leviathan", power: 4.8 },
                    { name: "Star Entity", power: 5.0 }
                ]
            },
            {
                name: "✨ Legendary Egg",
                cost: 40000,
                color: "#FFD700",
                pets: [
                    { name: "Alien Overlord", power: 7.0 },
                    { name: "Dimension Walker", power: 7.2 },
                    { name: "Universal Demon", power: 6.9 },
                    { name: "Cosmic Horror", power: 7.3 },
                    { name: "Reality Bender", power: 7.5 }
                ]
            }
        ]
    }
};

// Upgrades: [name, baseCost, clickPower, passivePower, type]
const UPGRADES = [
    // Click Upgrades (0-9)
    { name: "Fart Bean", baseCost: 15, clickPower: 1, passivePower: 0, type: "click" },
    { name: "Cabbage", baseCost: 100, clickPower: 5, passivePower: 0, type: "click" },
    { name: "Taco Bell", baseCost: 500, clickPower: 20, passivePower: 0, type: "click" },
    { name: "Sewer Gas", baseCost: 2000, clickPower: 50, passivePower: 0, type: "click" },
    { name: "Swamp Air", baseCost: 10000, clickPower: 200, passivePower: 0, type: "click" },
    { name: "Gym Sock", baseCost: 50000, clickPower: 500, passivePower: 0, type: "click" },
    { name: "Rotten Egg", baseCost: 200000, clickPower: 1500, passivePower: 0, type: "click" },
    { name: "Durian Fruit", baseCost: 1000000, clickPower: 4000, passivePower: 0, type: "click" },
    { name: "Sewer Pipe", baseCost: 5000000, clickPower: 12000, passivePower: 0, type: "click" },
    { name: "Toxic Barrel", baseCost: 25000000, clickPower: 40000, passivePower: 0, type: "click" },
    // Passive Upgrades (10-19)
    { name: "Small Fan", baseCost: 50, clickPower: 0, passivePower: 2, type: "passive" },
    { name: "Air Blower", baseCost: 300, clickPower: 0, passivePower: 10, type: "passive" },
    { name: "Industrial Vent", baseCost: 1500, clickPower: 0, passivePower: 40, type: "passive" },
    { name: "Wind Purifier", baseCost: 8000, clickPower: 0, passivePower: 150, type: "passive" },
    { name: "Tornado Generator", baseCost: 50000, clickPower: 0, passivePower: 600, type: "passive" },
    { name: "Turbine Engine", baseCost: 250000, clickPower: 0, passivePower: 2500, type: "passive" },
    { name: "Stink Cannon", baseCost: 1500000, clickPower: 0, passivePower: 10000, type: "passive" },
    { name: "Nuclear Reactor", baseCost: 8000000, clickPower: 0, passivePower: 50000, type: "passive" },
    { name: "Black Hole Generator", baseCost: 50000000, clickPower: 0, passivePower: 250000, type: "passive" },
    { name: "Galaxy Engine", baseCost: 300000000, clickPower: 0, passivePower: 1500000, type: "passive" }
];

// Audio Management
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function createClickSound() {
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
    osc.type = 'sine';
    
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    
    osc.start(now);
    osc.stop(now + 0.1);
}

function createPurchaseSound() {
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
    osc.type = 'square';
    
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    
    osc.start(now);
    osc.stop(now + 0.15);
}

function createRebirthSound() {
    const now = audioCtx.currentTime;
    for (let i = 0; i < 3; i++) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.frequency.setValueAtTime(600 + i * 200, now + i * 0.1);
        osc.frequency.exponentialRampToValueAtTime(1500 + i * 200, now + i * 0.1 + 0.2);
        osc.type = 'sine';
        
        gain.gain.setValueAtTime(0.15, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.2);
        
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.2);
    }
}

// Particle Generator
function createParticles() {
    const overlay = document.getElementById('particle-overlay');
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDuration = (10 + Math.random() * 15) + 's';
        particle.style.animationDelay = Math.random() * 5 + 's';
        overlay.appendChild(particle);
    }
}

// Click Pop Effect
function showClickPop(e) {
    const pop = document.createElement('div');
    pop.className = 'click-pop';
    const damage = Math.floor(getClickPower() * game.spamMultiplier * getPetMultiplier());
    pop.textContent = '+' + damage.toLocaleString();
    pop.style.left = e.clientX + 'px';
    pop.style.top = e.clientY + 'px';
    pop.style.color = game.spamMultiplier > 3 ? '#FFD700' : game.spamMultiplier > 1.5 ? '#00D9FF' : '#7FFF00';
    document.body.appendChild(pop);
    setTimeout(() => pop.remove(), 1000);
}

// Load Game
function loadGame() {
    const saved = localStorage.getItem('fartSave');
    if (saved) {
        game = JSON.parse(saved);
    }
    initializeUpgrades();
}

// Initialize upgrades object
function initializeUpgrades() {
    if (!game.upgrades || Object.keys(game.upgrades).length === 0) {
        game.upgrades = {};
        UPGRADES.forEach((_, i) => {
            game.upgrades[i] = 0;
        });
    }
}

// Save Game
function saveGame() {
    localStorage.setItem('fartSave', JSON.stringify(game));
}

// Calculate click power
function getClickPower() {
    let power = game.baseClickPower;
    UPGRADES.forEach((upgrade, i) => {
        if (upgrade.type === "click" && game.upgrades[i]) {
            power += upgrade.clickPower * game.upgrades[i];
        }
    });
    return power;
}

// Calculate passive income per second
function getPassiveIncome() {
    let income = 0;
    UPGRADES.forEach((upgrade, i) => {
        if (upgrade.type === "passive" && game.upgrades[i]) {
            income += upgrade.passivePower * game.upgrades[i];
        }
    });
    return income;
}

// Calculate pet multiplier
function getPetMultiplier() {
    let mult = 1;
    game.equippedPets.forEach(pet => {
        mult *= pet.power;
    });
    return mult;
}

// Get rebirth cost
function getRebirthCost() {
    return 10000 * Math.pow(1.3, game.rebirths);
}

// Main Click Handler
document.getElementById("main-btn").addEventListener("click", (e) => {
    const now = Date.now();
    const timeSinceLastClick = now - game.lastClickTime;

    // Spam multiplier logic
    if (timeSinceLastClick < 300) {
        game.clickStreak++;
        game.spamMultiplier = Math.min(1 + (game.clickStreak * 0.15), 5);
    } else {
        game.clickStreak = 0;
        game.spamMultiplier = 1;
    }

    game.lastClickTime = now;

    // Calculate damage
    const clickPower = getClickPower();
    const petMult = getPetMultiplier();
    const damage = clickPower * game.spamMultiplier * petMult;

    game.points += damage;
    
    // Play sound and effects
    createClickSound();
    showClickPop(e);
    
    // Update display IMMEDIATELY
    updateDisplay();
    saveGame();
});

// Buy Upgrade
function buyUpgrade(idx) {
    const upgrade = UPGRADES[idx];
    const level = game.upgrades[idx];
    const cost = Math.floor(upgrade.baseCost * Math.pow(1.15, level));

    if (game.points >= cost) {
        game.points -= cost;
        game.upgrades[idx]++;
        createPurchaseSound();
        updateDisplay(); // INSTANT UPDATE
        saveGame();
    }
}

// Open Egg Selection Modal
function openEggModal() {
    document.getElementById("egg-modal").classList.remove("hidden");
    renderEggSelection();
}

function closeEggModal() {
    document.getElementById("egg-modal").classList.add("hidden");
}

// Render Egg Selection
function renderEggSelection() {
    const eggPool = PET_POOLS[game.worldIdx].eggs;
    let html = "<div style='display: grid; gap: 15px;'>";
    
    eggPool.forEach((egg, idx) => {
        html += `
            <button class="modal-btn" style="background: linear-gradient(135deg, ${egg.color}, ${egg.color}dd); border: 3px solid ${egg.color};" onclick="selectEgg(${idx})">
                <div>${egg.name}</div>
                <div style="font-size: 0.9rem; margin-top: 5px;">Cost: ${egg.cost.toLocaleString()}</div>
            </button>
        `;
    });
    
    html += "</div>";
    document.getElementById("egg-selection").innerHTML = html;
}

// Select and Hatch Egg
function selectEgg(eggIdx) {
    const egg = PET_POOLS[game.worldIdx].eggs[eggIdx];
    
    if (game.points < egg.cost) {
        alert("Not enough Stink!");
        return;
    }

    game.points -= egg.cost;
    
    // Random pet from this egg
    const pet = { ...egg.pets[Math.floor(Math.random() * egg.pets.length)], id: Date.now(), eggType: egg.name };
    game.pets.push(pet);
    
    createPurchaseSound();
    closeEggModal();
    updateDisplay();
    saveGame();
    alert(`🎉 You got ${pet.name}! (${pet.power.toFixed(1)}x)`);
}

// Open Pet Modal
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

// Equip Pet
function equipPet() {
    const pet = game.pets.find(p => p.id === selectedPetId);
    if (!pet) return;

    const isEquipped = game.equippedPets.some(p => p.id === selectedPetId);
    if (isEquipped) {
        game.equippedPets = game.equippedPets.filter(p => p.id !== selectedPetId);
    } else {
        if (game.equippedPets.length < 3) {
            game.equippedPets.push(pet);
            createPurchaseSound();
        } else {
            alert("Max 3 pets equipped!");
            return;
        }
    }
    closePetModal();
    updateDisplay();
    saveGame();
}

// Rebirth
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
        game.worldIdx = Math.min(Math.floor(game.rebirths / 5), WORLDS.length - 1);
        initializeUpgrades();
        createRebirthSound();
        updateDisplay();
        saveGame();
    }
}

// Show Tab
function showTab(tabId, btn) {
    // Hide all tabs
    document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));

    // Show selected tab
    document.getElementById(tabId).classList.add("active");
    btn.classList.add("active");

    // Render content
    if (tabId === "upgrades") renderUpgrades();
    if (tabId === "pets") renderPets();
    if (tabId === "worlds") renderWorlds();
}

// Render Upgrades Tab - SPLIT LAYOUT
function renderUpgrades() {
    let clickHtml = "<h3>⬆️ Click Power</h3>";
    let passiveHtml = "<h3 class='passive'>💰 Passive Income</h3>";
    
    UPGRADES.forEach((upgrade, i) => {
        const level = game.upgrades[i];
        const nextCost = Math.floor(upgrade.baseCost * Math.pow(1.15, level));
        const affordable = game.points >= nextCost;
        
        const btn = `
            <button class="upgrade-btn ${affordable ? "" : "unaffordable"}" onclick="buyUpgrade(${i})">
                <div class="upgrade-name">${upgrade.name}</div>
                <div class="upgrade-level">Level: ${level}</div>
                <div class="upgrade-cost">Cost: ${nextCost.toLocaleString()}</div>
            </button>
        `;
        
        if (upgrade.type === "click") {
            clickHtml += btn;
        } else {
            passiveHtml += btn;
        }
    });
    
    document.getElementById("upgrades").innerHTML = `
        <div class="upgrades-split">
            <div class="upgrade-section">${clickHtml}</div>
            <div class="upgrade-section">${passiveHtml}</div>
        </div>
    `;
}

// Render Pets Tab
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

    html += "<div class='pet-section'><h3>Equipped Pets (" + game.equippedPets.length + "/3)</h3>";
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

// Render Worlds Tab
function renderWorlds() {
    let html = "<div class='worlds-list'>";
    WORLDS.forEach((world, i) => {
        const unlocked = game.rebirths >= world.reqRebirths;
        const current = game.worldIdx === i;
        html += `
            <div class="world-card ${unlocked ? "unlocked" : "locked"} ${current ? "current" : ""}">
                <div class="world-name">${world.name}</div>
                <div class="world-req">Requires ${world.reqRebirths} Rebirths</div>
                ${current ? "<div class='current-badge'>🌍 Current</div>" : ""}
                ${!unlocked ? "<div class='locked-badge'>🔒 Locked</div>" : ""}
            </div>
        `;
    });
    html += "</div>";
    document.getElementById("worlds").innerHTML = html;
}

// Update Display
function updateDisplay() {
    document.getElementById("points").innerText = Math.floor(game.points).toLocaleString();
    document.getElementById("per-click").innerText = getClickPower().toLocaleString();
    document.getElementById("spam-mult").innerText = game.spamMultiplier.toFixed(1) + "x";
    document.getElementById("passive-income").innerText = (getPassiveIncome() * getPetMultiplier()).toFixed(1) + "/s";
    document.getElementById("rebirths").innerText = game.rebirths;
    document.getElementById("world-name").innerText = WORLDS[game.worldIdx].name;

    const rebirthCost = getRebirthCost();
    document.getElementById("rebirth-btn").innerText = `REBIRTH (Req: ${rebirthCost.toLocaleString()})`;
}

// Passive Income Loop
setInterval(() => {
    const income = getPassiveIncome() * getPetMultiplier();
    game.points += income;
    updateDisplay();
    saveGame();
}, 1000);

// Initialize Game
loadGame();
createParticles();
updateDisplay();
showTab("upgrades", document.querySelectorAll(".tab-btn")[0]);
