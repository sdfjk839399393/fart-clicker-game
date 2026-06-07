let game = { points: 0, mult: 1, rebirths: 0, upgrades: Array(20).fill(0), pets: [], equipped: [], worldIdx: 0, lastClick: 0, spamMult: 1 };

const upgrades = [
    { name: "Fart Bean", cost: 15, power: 1, type: 'click' }, { name: "Cabbage", cost: 100, power: 5, type: 'click' },
    { name: "Taco Bell", cost: 500, power: 20, type: 'click' }, { name: "Sewer Gas", cost: 2000, power: 50, type: 'click' },
    { name: "Swamp Air", cost: 10000, power: 200, type: 'click' }, { name: "Gym Sock", cost: 50000, power: 500, type: 'click' },
    { name: "Rotten Egg", cost: 200000, power: 1200, type: 'click' }, { name: "Durian", cost: 800000, power: 3000, type: 'click' },
    { name: "Sewer Pipe", cost: 3000000, power: 8000, type: 'click' }, { name: "Toxic Barrel", cost: 15000000, power: 20000, type: 'click' },
    { name: "Small Fan", cost: 50, power: 2, type: 'auto' }, { name: "Blower", cost: 300, power: 10, type: 'auto' },
    { name: "Industrial Vent", cost: 1500, power: 40, type: 'auto' }, { name: "Purifier", cost: 8000, power: 150, type: 'auto' },
    { name: "Tornado", cost: 40000, power: 600, type: 'auto' }, { name: "Turbine", cost: 200000, power: 2500, type: 'auto' },
    { name: "Cannon", cost: 1000000, power: 10000, type: 'auto' }, { name: "Nuclear", cost: 5000000, power: 50000, type: 'auto' },
    { name: "Black Hole", cost: 25000000, power: 250000, type: 'auto' }, { name: "Galaxy", cost: 100000000, power: 1000000, type: 'auto' }
];

const worlds = [
    { name: "Basement", req: 0 }, { name: "City", req: 5 },
    { name: "Forest", req: 10 }, { name: "Volcano", req: 15 }, { name: "Space", req: 20 }
];

if(localStorage.getItem('fartSave')) game = JSON.parse(localStorage.getItem('fartSave'));

function update() {
    document.getElementById('points').innerText = Math.floor(game.points);
    document.getElementById('rebirths').innerText = game.rebirths;
    document.getElementById('spam-mult').innerText = game.spamMult.toFixed(1);
    document.getElementById('world-name').innerText = worlds[game.worldIdx].name;
    localStorage.setItem('fartSave', JSON.stringify(game));
    render();
}

function render() {
    const upgDiv = document.getElementById('upgrades');
    upgDiv.innerHTML = upgrades.map((u, i) => `<button class="item-btn" onclick="buy(${i})">${u.name} Lvl ${game.upgrades[i]}<br>Cost: ${Math.floor(u.cost * 1.15**game.upgrades[i])}</button>`).join('');
    
    document.getElementById('equipped-pets').innerHTML = game.equipped.map((p, i) => `<div class="item-btn">Pet: ${p.name} (+${p.mult}x) <button onclick="unequip(${i})">X</button></div>`).join('');
    document.getElementById('world-list').innerHTML = worlds.map(w => `<div class="item-btn">${w.name} (Req: ${w.req} Rebirths)</div>`).join('');
}

function buy(i) {
    let cost = Math.floor(upgrades[i].cost * 1.15**game.upgrades[i]);
    if (game.points >= cost) {
        game.points -= cost;
        game.upgrades[i]++;
        update();
    }
}

function openEgg() {
    if (game.points >= 500) {
        game.points -= 500;
        let pet = { name: "Rat", mult: 1.1 };
        if (Math.random() > 0.9) pet = { name: "Phonk Demon", mult: 5.0 };
        if (game.equipped.length < 3) game.equipped.push(pet);
        else alert("Max pets equipped!");
        update();
    }
}

function unequip(i) { game.equipped.splice(i, 1); update(); }

document.getElementById('main-btn').addEventListener('click', () => {
    let now = Date.now();
    game.spamMult = (now - game.lastClick < 500) ? Math.min(game.spamMult + 0.1, 5.0) : 1.0;
    game.lastClick = now;
    let pwr = 1 + upgrades.filter((u,i) => u.type=='click').reduce((acc,u,i) => acc + (u.power * game.upgrades[i]), 0);
    let pMult = game.equipped.reduce((acc, p) => acc + p.mult, 1);
    game.points += pwr * game.mult * game.spamMult * pMult;
    update();
});

function rebirth() {
    if (game.points >= 10000 * (game.rebirths + 1)) {
        game.rebirths++;
        game.mult += 1;
        game.points = 0;
        game.upgrades.fill(0);
        game.equipped = [];
        game.worldIdx = Math.min(Math.floor(game.rebirths / 5), worlds.length - 1);
        update();
    }
}

function showTab(id) {
    document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
    document.getElementById(id).style.display = 'block';
}

setInterval(() => {
    let auto = upgrades.filter((u,i) => u.type=='auto').reduce((acc,u,i) => acc + (u.power * game.upgrades[i+10]), 0);
    game.points += auto * game.mult;
    update();
}, 1000);

render();
showTab('upgrades');
