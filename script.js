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

// Pet Types (different per world)
const PET_POOLS = {
    0: [ // Basement
        { name: "Sewer Rat", power: 1.1, rarity: 0.7 },
        { name: "Stink Bug", power: 1.3, rarity: 0.25 },
        { name: "Rats King", power: 1.8, rarity: 0.05 }
    ],
    1: [ // City Sewers
        { name: "Street Rat", power: 1.3, rarity: 0.6 },
        { name: "Mutant Cockroach", power: 1.6, rarity: 0.3 },
        { name: "Toxic Possum", power: 2.2, rarity: 0.1 }
    ],
    2: [ // Forest
        { name: "Forest Badger", power: 1.5, rarity: 0.6 },
        { name: "Swamp Gator", power: 2.0, rarity: 0.3 },
        { name: "Legendary Skunk", power: 3.0, rarity: 0.1 }
    ],
    3: [ // Volcano
        { name: "Lava Salamander", power: 2.0, rarity: 0.6 },
        { name: "Fire Imp", power: 2.5, rarity: 0.3 },
        { name: "Magma Demon", power: 4.0, rarity: 0.1 }
    ],
    4: [ // Space
        { name: "Space Rat", power: 2.5, rarity: 0.6 },
        { name: "Cosmic Squid", power: 3.5, rarity: 0.3 },
        { name: "Alien Overlord", power: 6.0, rarity: 0.1 }
    ]
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

// Get egg cost for current world
function getEggCost() {
    return 500 * Math.pow(1.5, game.rebirths);
}

// Get rebirth cost
function getRebirthCost() {
    return 10000 * Math.pow(1.3, game.rebirths);
}

// Main Click Handler
document.getElementById("main-btn").addEventListener("click", () => {
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
        updateDisplay();
        saveGame();
    }
}

// Open Egg Modal
function openEggModal() {
    const cost = getEggCost();
    if (game.points < cost) {
        alert("Not enough Stink!");
        return;
    }
    document.getElementById("egg-modal").classList.remove("hidden");
    renderEggOdds();
}

function closeEggModal() {
    document.getElementById("egg-modal").classList.add("hidden");
}

// Render Egg Odds
function renderEggOdds() {
    const petPool = PET_POOLS[game.worldIdx];
    let html = "<div class='odds-list'>";
    petPool.forEach(pet => {
        const percentage = (pet.rarity * 100).toFixed(1);
        html += `<div class='odds-item'>${pet.name}: ${percentage}%</div>`;
    });
    html += "</div>";
    document.getElementById("egg-odds").innerHTML = html;
    document.getElementById("egg-cost").innerText = getEggCost();
}

// Hatch Egg
function hatchEgg() {
    const cost = getEggCost();
    if (game.points < cost) {
        alert("Not enough Stink!");
        return;
    }

    game.points -= cost;

    // Roll for pet
    const petPool = PET_POOLS[game.worldIdx];
    let rand = Math.random();
    let pet = petPool[0];

    for (let p of petPool) {
        if (rand < p.rarity) {
            pet = { ...p, id: Date.now() };
            break;
        }
        rand -= p.rarity;
    }

    game.pets.push(pet);
    closeEggModal();
    updateDisplay();
    saveGame();
    alert(`🎉 You got ${pet.name}!`);
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
            <p><strong>World:</strong> ${WORLDS[game.worldIdx].name}</p>
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

// Render Upgrades Tab
function renderUpgrades() {
    let html = "";
    UPGRADES.forEach((upgrade, i) => {
        const level = game.upgrades[i];
        const nextCost = Math.floor(upgrade.baseCost * Math.pow(1.15, level));
        const affordable = game.points >= nextCost;
        html += `
            <button class="upgrade-btn ${affordable ? "" : "unaffordable"}" onclick="buyUpgrade(${i})">
                <div class="upgrade-name">${upgrade.name}</div>
                <div class="upgrade-level">Level: ${level}</div>
                <div class="upgrade-cost">Cost: ${nextCost.toLocaleString()}</div>
                <div class="upgrade-type">${upgrade.type === "click" ? "⬆️ Click Power" : "💰 Passive"}</div>
            </button>
        `;
    });
    document.getElementById("upgrades").innerHTML = html;
}

// Render Pets Tab
function renderPets() {
    let html = `<button class="pet-btn open-egg-btn" onclick="openEggModal()">🥚 Open Egg (Cost: ${getEggCost().toLocaleString()})</button>`;
    
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
updateDisplay();
showTab("upgrades", document.querySelectorAll(".tab-btn")[0]);
