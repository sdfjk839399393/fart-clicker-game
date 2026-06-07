// Render Pets
function renderPets() {
    let html = '<button class="pet-btn open-egg-btn" onclick="openEggModal()">🥚 Open Egg</button>';
    
    const petsArray = game.pets || [];
    html += "<div class='pet-section'><h3>My Pets (" + petsArray.length + "/" + (game.maxPets || 3) + ")</h3>";
    if (petsArray.length === 0) {
        html += "<p class='empty-text'>No pets yet! Open an egg to get started.</p>";
    } else {
        petsArray.forEach(pet => {
            const equipped = game.equippedPets && game.equippedPets.some(p => p.id === pet.id);
            html += '<div class="pet-card ' + (equipped ? "equipped" : "") + '" onclick="openPetModal(' + pet.id + ')">' +
                '<div class="pet-name">' + pet.name + '</div>' +
                '<div class="pet-power">' + (pet.power || 1).toFixed(2) + 'x</div>' +
                (equipped ? "<div class='equipped-badge'>✅</div>" : "") +
                '</div>';
        });
    }
    html += "</div>";

    const equippedArray = game.equippedPets || [];
    html += '<div class="pet-section"><h3>Equipped (' + equippedArray.length + '/' + (game.maxPets || 3) + ')</h3>';
    if (equippedArray.length === 0) {
        html += "<p class='empty-text'>No equipped pets.</p>";
    } else {
        equippedArray.forEach(pet => {
            html += '<div class="equipped-pet-card">' +
                '<div class="pet-name">' + pet.name + '</div>' +
                '<div class="pet-power">' + (pet.power || 1).toFixed(2) + 'x</div>' +
                '</div>';
        });
    }
    html += "</div>";

    const petsDiv = document.getElementById("pets");
    if (petsDiv) petsDiv.innerHTML = html;
}

// Render Worlds
function renderWorlds() {
    let html = "<div class='worlds-list'>";
    if (WORLDS) {
        WORLDS.forEach((world, i) => {
            const unlocked = (game.rebirths >= world.reqRebirths);
            const current = game.worldIdx === i;
            html += '<div class="world-card ' + (unlocked ? "unlocked" : "locked") + ' ' + (current ? "current" : "") + '" onclick="' + (unlocked && !current ? 'selectWorld(' + i + ')' : '') + '">' +
                '<div class="world-name">' + world.name + '</div>' +
                '<div class="world-req">' + (unlocked ? 'Unlocked' : 'Req: ' + world.reqRebirths + ' Rebirths') + '</div>' +
                (current ? "<div class='current-badge'>🌍</div>" : "") +
                '</div>';
        });
    }
    html += "</div>";
    const worldsDiv = document.getElementById("worlds");
    if (worldsDiv) worldsDiv.innerHTML = html;
}

function selectWorld(idx) {
    if (WORLDS && game.rebirths >= WORLDS[idx].reqRebirths) {
        game.worldIdx = idx;
        createPurchaseSound();
        updateDisplay();
        renderWorlds();
        showRarePopup('🌍 Journeying to ' + WORLDS[idx].name + '...', 3000);
        saveGame();
    }
}

// Display Updates
function updateDisplay() {
    const pointsEl = document.getElementById("points");
    const perClickEl = document.getElementById("per-click");
    const spamMultEl = document.getElementById("spam-mult");
    const passiveIncomeEl = document.getElementById("passive-income");
    const rebirthsEl = document.getElementById("rebirths");
    const worldNameEl = document.getElementById("world-name");
    const rebirthBtnEl = document.getElementById("rebirth-btn");
    
    if (pointsEl) pointsEl.innerText = formatNumber(game.points);
    if (perClickEl) perClickEl.innerText = formatNumber(getClickPower());
    if (spamMultEl) spamMultEl.innerText = (game.spamMultiplier || 1).toFixed(1) + "x";
    if (passiveIncomeEl) passiveIncomeEl.innerText = formatNumber(getPassiveIncome() * getPetMultiplier()) + "/s";
    if (rebirthsEl) rebirthsEl.innerText = game.rebirths;
    if (worldNameEl && WORLDS && WORLDS[game.worldIdx]) {
        worldNameEl.innerText = WORLDS[game.worldIdx].name;
    }
    if (rebirthBtnEl) {
        rebirthBtnEl.innerText = 'REBIRTH (Cost: ' + formatNumber(getRebirthCost()) + ')';
    }
}

// Visual Effects
function showClickPop(e, damage) {
    const pop = document.createElement('div');
    pop.className = 'click-pop';
    pop.textContent = '+' + formatNumber(damage);
    pop.style.left = e.clientX + 'px';
    pop.style.top = e.clientY + 'px';
    pop.style.color = game.criticalMultiplier > 2 ? '#FFD700' : (game.spamMultiplier > 3 ? '#00D9FF' : '#7FFF00');
    document.body.appendChild(pop);
    setTimeout(() => pop.remove(), 800);
}

function showCriticalHit(e) {
    const critical = document.createElement('div');
    critical.className = 'critical-hit';
    critical.textContent = '⚡ CRITICAL! ⚡';
    critical.style.left = (e.clientX - 100) + 'px';
    critical.style.top = (e.clientY - 50) + 'px';
    document.body.appendChild(critical);
    createCriticalSound();
    setTimeout(() => critical.remove(), 800);
}

function showRarePopup(text, duration = 3000) {
    const popup = document.createElement('div');
    popup.className = 'rare-popup';
    popup.innerHTML = text;
    document.body.appendChild(popup);
    setTimeout(() => {
        popup.classList.add('fade-out');
        setTimeout(() => popup.remove(), 500);
    }, duration);
}

// Passive Income Loop
setInterval(() => {
    const income = getPassiveIncome() * getPetMultiplier();
    if (!isNaN(income) && income > 0) {
        game.points += income;
        updateDisplay();
        saveGame();
    }
}, 1000);

// Initialize Game
function initGame() {
    loadGame();
    createParticles();
    updateDisplay();
    
    const tabBtns = document.querySelectorAll(".tab-btn");
    if (tabBtns.length > 0) {
        showTab("pets", tabBtns[0]);
    }
}

function createParticles() {
    const overlay = document.getElementById('particle-overlay');
    if (!overlay) return;
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDuration = (10 + Math.random() * 15) + 's';
        particle.style.animationDelay = Math.random() * 5 + 's';
        overlay.appendChild(particle);
    }
}

// Run initialization
initGame();

// CSS for click ring
const clickRingCSS = document.createElement('style');
clickRingCSS.textContent = `
    .click-ring {
        position: fixed;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        border: 3px solid rgba(255, 255, 255, 0.5);
        pointer-events: none;
        z-index: 501;
        animation: clickRing 0.5s ease-out forwards;
    }
    @keyframes clickRing {
        0% { transform: translate(-50%, -50%) scale(0.8); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(2); opacity: 0; border-width: 0; }
    }
    .click-pop {
        position: fixed;
        pointer-events: none;
        font-size: 1.8rem;
        font-weight: bold;
        animation: popFloat 1s ease-out forwards;
        z-index: 500;
    }
    @keyframes popFloat {
        0% { opacity: 1; transform: translate(0, 0) scale(1); }
        100% { opacity: 0; transform: translate(0, -80px) scale(1.5); }
    }
    .critical-hit {
        position: fixed;
        font-size: 3rem;
        font-weight: 900;
        color: #FFD700;
        text-shadow: 0 0 20px #FFD700, 0 0 40px #FF6B35;
        pointer-events: none;
        z-index: 999;
        animation: criticalPulse 0.8s ease-out forwards;
    }
    @keyframes criticalPulse {
        0% { opacity: 1; transform: translate(0, 0) scale(0.5) rotate(0deg); }
        50% { transform: translate(0, -30px) scale(1.2) rotate(5deg); }
        100% { opacity: 0; transform: translate(0, -100px) scale(1) rotate(-5deg); }
    }
    .rare-popup {
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
        border: 3px solid #FF6B35;
        color: #000;
        padding: 18px 28px;
        border-radius: 12px;
        font-weight: bold;
        z-index: 1001;
        animation: popupSlide 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        box-shadow: 0 0 30px rgba(255, 107, 53, 0.8);
        font-size: 0.95rem;
    }
    @keyframes popupSlide {
        from { transform: translateX(400px) scale(0.8); opacity: 0; }
        to { transform: translateX(0) scale(1); opacity: 1; }
    }
    .rare-popup.fade-out {
        animation: popupFade 0.5s ease-out forwards;
    }
    @keyframes popupFade {
        to { transform: translateX(400px) scale(0.8); opacity: 0; }
    }
`;
document.head.appendChild(clickRingCSS);
