
let points = 0;
let multiplier = 1.0;

document.getElementById('main-fart-btn').addEventListener('click', () => {
    points += 1 * multiplier;
    document.getElementById('points').innerText = Math.floor(points);
});

function showTab(tabName) {
    document.querySelectorAll('.tab').forEach(t => t.style.display = 'none');
    document.getElementById(tabName + '-tab').style.display = 'block';
}

// Simple Mock Leaderboard logic (would require a backend in production)
const mockLeaderboard = [
    {name: "SigmaGamer", score: "999B"},
    {name: "FartMaster", score: "500B"},
    {name: "User123", score: "100B"}
];

const list = document.getElementById('leaderboard-list');
list.innerHTML = mockLeaderboard.map(u => `<li>${u.name}: ${u.score}</li>`).join('');
