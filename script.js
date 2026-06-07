let game = { 
    points: 0, 
    mult: 1, 
    rebirths: 0, 
    upgrades: [0, 0, 0], 
    pets: [] 
};

const upgradeData = [
    { name: "Fart Bean", cost: 10, power: 1 },
    { name: "Sigma Cabbage", cost: 100, power: 5 },
    { name: "Taco Bell", cost: 1000, power: 20 }
];

// Load game on start
if(localStorage.getItem('fartSave')) {
    game = JSON.parse(localStorage.getItem('fartSave'));
}

function update() {
    document.getElementById('points').innerText = Math.floor(game.points);
    document.getElementById('mult').innerText = game.mult;
    document.getElementById('rebirths').innerText = game.rebirths;
    localStorage.setItem('fartSave', JSON.stringify(game));
    renderUI();
}

function renderUI() {
    // Render Upgrades
    const upgDiv = document.getElementById('upgrades');
    upgDiv.innerHTML = '';
    upgradeData.forEach((u, i) => {
        let cost = Math.floor(u.cost * Math.pow(1.5, game.upgrades[i]));
        upgDiv.innerHTML += `<button class="upgrade-btn" onclick="buyUpgrade(${i}, ${cost})">${u.name} (Own: ${game.upgrades[i]})<br>Cost: ${cost}</button>`;
    });

    // Render Pets
    const petDiv = document.getElementById('pet-list');
    petDiv.innerHTML = '<strong>Your Pets:</strong> ' + (game.pets.join(', ') || "None");
}

function buyUpgrade(idx, cost) {
    if (game.points >= cost) {
        game.points -= cost;
        game.upgrades[idx]++;
        update();
    }
}

function rollPet() {
    if (game.points >= 500) {
        game.points -= 500;
        let luck = Math.random();
        let pet = luck > 0.9 ? "Legendary Phonk Demon" : "Rat";
        game.pets.push(pet);
        if (pet === "Legendary Phonk Demon") game.mult += 2;
        alert("You rolled: " + pet);
        update();
    }
}

document.getElementById('main-btn').addEventListener('click', () => {
    game.points += 1 * game.mult;
    update();
});

function rebirth() {
    if (game.points >= 10000) {
        game.rebirths++;
        game.mult += 1;
        game.points = 0;
        game.upgrades = [0, 0, 0];
        game.pets = [];
        update();
    }
}

function showTab(id) {
    document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
    document.getElementById(id).style.display = 'block';
}

// Auto income
setInterval(() => {
    let income = (game.upgrades[0] * 1) + (game.upgrades[1] * 5) + (game.upgrades[2] * 20);
    game.points += income * game.mult;
    update();
}, 1000);

renderUI();