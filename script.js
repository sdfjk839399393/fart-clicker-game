let game = { points: 0, mult: 1, rebirths: 0, upgrades: Array(20).fill(0), pets: [], equipped: [], worldIdx: 0, lastClick: 0, spamMult: 1 };

const upgrades = [
    { name: "Fart Bean", cost: 15, power: 1, type: 'click' }, { name: "Cabbage", cost: 100, power: 5, type: 'click' },
    { name: "Taco Bell", cost: 500, power: 20, type: 'click' }, { name: "Sewer Gas", cost: 2000, power: 50, type: 'click' },
    { name: "Swamp Air", cost: 10000, power: 200, type: 'click' }, { name: "Old Gym Sock", cost: 50000, power: 500, type: 'click' },
    { name: "Rotten Egg", cost: 200000, power: 1200, type: 'click' }, { name: "Durian Fruit", cost: 800000, power: 3000, type: 'click' },
    { name: "Sewer Pipe", cost: 3000000, power: 8000, type: 'click' }, { name: "Toxic Barrel", cost: 15000000, power: 20000, type: 'click' },
    { name: "Fan", cost: 50, power: 2, type: 'auto' }, { name: "Blower", cost: 300, power: 10, type: 'auto' },
    { name: "Industrial Vent", cost: 1500, power: 40, type: 'auto' }, { name: "Sigma Air Purifier", cost: 8000, power: 150, type: 'auto' },
    { name: "Tornado Machine", cost: 40000, power: 600, type: 'auto' }, { name: "Wind Turbine", cost: 200000, power: 2500, type: 'auto' },
    { name: "Fart Cannon", cost: 1000000, power: 10000, type: 'auto' }, { name: "Nuclear Fart", cost: 5000000, power: 50000, type: 'auto' },
    { name: "Black Hole Suction", cost: 25000000, power: 250000, type: 'auto' }, { name: "Galaxy Fart", cost: 100000000, power: 1000000, type: 'auto' }
];

const worlds = [
    { name: "Basement", req: 0, egg: "Basic Egg" }, { name: "City", req: 5, egg: "Urban Egg" },
    { name: "Forest", req: 10, egg: "Nature Egg" }, { name: "Volcano", req: 15, egg: "Magma Egg" }, { name: "Space", req: 20, egg: "Galaxy Egg" }
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
    upgDiv.innerHTML = upgrades.map((u, i) => `<button class="item-btn" onclick="buy(${i})">${u.name} Lvl ${game.upgrades[i]}<br>Cost: ${Math.floor(u.cost * 1.5**game.upgrades[i])}</button>`).join('');
    
    document.getElementById('equipped-pets').innerHTML = game.equipped.map(p => `<div>${p.name} (+${p.mult}x)</div>`).join('');
}

function buy(i) {
    let cost = Math.floor(upgrades[i].cost * 1.5**game.upgrades[i]);
    if (game.points >= cost) {
        game.points -= cost;
        game.upgrades[i]++;
        update();
    }
}

document.getElementById('main-btn').addEventListener('click', () => {
    let now = Date.now();
    if(now - game.lastClick < 500) game.spamMult = Math.min(game.spamMult + 0.1, 5.0);
    else game.spamMult = 1.0;
    game.lastClick = now;

    let power = 1 * game.spamMult;
    upgrades.filter(u => u.type === 'click').forEach((u, i) => power += (u.power * game.upgrades[i]));
    
    let petMult = game.equipped.reduce((acc, p) => acc + p.mult, 1);
    game.points += power * game.mult * petMult;
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
    let auto = 0;
    upgrades.filter(u => u.type === 'auto').forEach((u, i) => auto += (u.power * game.upgrades[i+10]));
    game.points += auto * game.mult;
    update();
}, 1000);

render();
