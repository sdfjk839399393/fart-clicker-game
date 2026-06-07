let game = { points: 0, mult: 1, rebirths: 0, upgrades: [0, 0], pets: [] };

// Load save
if(localStorage.getItem('fartSave')) game = JSON.parse(localStorage.getItem('fartSave'));

function update() {
    document.getElementById('points').innerText = Math.floor(game.points);
    document.getElementById('mult').innerText = game.mult;
    document.getElementById('rebirths').innerText = game.rebirths;
    localStorage.setItem('fartSave', JSON.stringify(game));
}

document.getElementById('main-btn').addEventListener('click', () => {
    game.points += 1 * game.mult;
    update();
});

function buyUpgrade(idx, cost) {
    if (game.points >= cost) {
        game.points -= cost;
        game.upgrades[idx]++;
        update();
    }
}

function rebirth() {
    if (game.points >= 10000) { // Requirement
        game.rebirths++;
        game.mult += 1;
        game.points = 0;
        game.upgrades = [0, 0]; // Reset upgrades
        update();
    }
}

function showTab(id) {
    document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
    document.getElementById(id).style.display = 'block';
}

setInterval(() => {
    game.points += (game.upgrades[0] * 1) + (game.upgrades[1] * 5); // Auto income
    update();
}, 1000);

update();
