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
    clickStreak: 0,
    criticalMultiplier: 1,
    criticalExpiry: 0,
    totalClicks: 0,
    totalEarned: 0
};

// Expanded World Data - 15 WORLDS
const WORLDS = [
    { id: 0, name: "Basement", reqRebirths: 0, color: "#8B6914", scale: 1 },
    { id: 1, name: "City Sewers", reqRebirths: 2, color: "#696969", scale: 1.3 },
    { id: 2, name: "Enchanted Forest", reqRebirths: 4, color: "#228B22", scale: 1.6 },
    { id: 3, name: "Volcanic Crater", reqRebirths: 6, color: "#FF4500", scale: 1.9 },
    { id: 4, name: "Outer Space", reqRebirths: 8, color: "#1a1a2e", scale: 2.2 },
    { id: 5, name: "Abyssal Trench", reqRebirths: 10, color: "#001a4d", scale: 2.5 },
    { id: 6, name: "Nether Realm", reqRebirths: 12, color: "#330033", scale: 2.8 },
    { id: 7, name: "Cybernetic City", reqRebirths: 14, color: "#00ffff", scale: 3.1 },
    { id: 8, name: "Dimension X", reqRebirths: 16, color: "#ff00ff", scale: 3.4 },
    { id: 9, name: "Infinite Loop", reqRebirths: 18, color: "#ffff00", scale: 3.7 },
    { id: 10, name: "Quantum Realm", reqRebirths: 20, color: "#00ff00", scale: 4.0 },
    { id: 11, name: "Void of Chaos", reqRebirths: 22, color: "#ff6600", scale: 4.3 },
    { id: 12, name: "Celestial Heaven", reqRebirths: 24, color: "#66ccff", scale: 4.6 },
    { id: 13, name: "Inferno Depths", reqRebirths: 26, color: "#ff3300", scale: 4.9 },
    { id: 14, name: "Ultimate Nexus", reqRebirths: 28, color: "#ffff00", scale: 5.2 }
];

// Pet Types - 3 EGGS x 5 PETS each
const PET_POOLS = {
    0: { // Basement
        eggs: [
            { 
                name: "🥚 Basic Egg",
                cost: 500,
                color: "#8B7355",
                pets: [
                    { name: "Sewer Rat", power: 1.1, odds: 40 },
                    { name: "Stink Bug", power: 1.2, odds: 30 },
                    { name: "Dung Fly", power: 1.15, odds: 15 },
                    { name: "Waste Roach", power: 1.25, odds: 10 },
                    { name: "Swamp Slug", power: 1.3, odds: 5 }
                ]
            },
            { 
                name: "💜 Rare Egg",
                cost: 2000,
                color: "#9370DB",
                pets: [
                    { name: "Toxic Toad", power: 1.8, odds: 35 },
                    { name: "Poison Beetle", power: 1.9, odds: 30 },
                    { name: "Foul Hornet", power: 2.0, odds: 20 },
                    { name: "Decay Moth", power: 1.85, odds: 10 },
                    { name: "Rats King", power: 2.2, odds: 5 }
                ]
            },
            { 
                name: "✨ Epic Egg",
                cost: 8000,
                color: "#FFD700",
                pets: [
                    { name: "Legendary Skunk", power: 3.5, odds: 40 },
                    { name: "Ancient Badger", power: 3.2, odds: 30 },
                    { name: "Shadow Possum", power: 3.8, odds: 20 },
                    { name: "Cursed Creature", power: 3.1, odds: 5 },
                    { name: "Stench Demon", power: 4.0, odds: 5 }
                ]
            }
        ]
    },
    1: { // City Sewers
        eggs: [
            {
                name: "🥚 Street Egg",
                cost: 1200,
                color: "#696969",
                pets: [
                    { name: "Street Rat", power: 1.4, odds: 40 },
                    { name: "Alley Cat", power: 1.45, odds: 30 },
                    { name: "Sewer Crow", power: 1.5, odds: 15 },
                    { name: "Drain Snake", power: 1.55, odds: 10 },
                    { name: "Metro Mouse", power: 1.6, odds: 5 }
                ]
            },
            {
                name: "💜 Toxic Egg",
                cost: 5000,
                color: "#00AA00",
                pets: [
                    { name: "Mutant Cockroach", power: 2.6, odds: 35 },
                    { name: "Radiation Rat", power: 2.7, odds: 30 },
                    { name: "Chemical Frog", power: 2.5, odds: 20 },
                    { name: "Polluted Bird", power: 2.8, odds: 10 },
                    { name: "Toxic Possum", power: 3.0, odds: 5 }
                ]
            },
            {
                name: "✨ Legendary Egg",
                cost: 15000,
                color: "#FF00FF",
                pets: [
                    { name: "Sewer King", power: 4.5, odds: 40 },
                    { name: "Underground Demon", power: 4.7, odds: 30 },
                    { name: "Tunnel Master", power: 4.3, odds: 15 },
                    { name: "Pipe Phantom", power: 4.6, odds: 10 },
                    { name: "Metropolis Beast", power: 5.0, odds: 5 }
                ]
            }
        ]
    },
    2: { // Forest
        eggs: [
            {
                name: "🥚 Forest Egg",
                cost: 2500,
                color: "#228B22",
                pets: [
                    { name: "Forest Badger", power: 1.8, odds: 40 },
                    { name: "Tree Squirrel", power: 1.7, odds: 30 },
                    { name: "Swamp Gator", power: 1.9, odds: 15 },
                    { name: "Bog Lizard", power: 1.85, odds: 10 },
                    { name: "Woodland Beast", power: 2.1, odds: 5 }
                ]
            },
            {
                name: "💜 Mystical Egg",
                cost: 9000,
                color: "#20B2AA",
                pets: [
                    { name: "Enchanted Fox", power: 3.3, odds: 35 },
                    { name: "Magic Wolf", power: 3.5, odds: 30 },
                    { name: "Mystic Owl", power: 3.2, odds: 20 },
                    { name: "Ethereal Stag", power: 3.4, odds: 10 },
                    { name: "Forest Guardian", power: 3.7, odds: 5 }
                ]
            },
            {
                name: "✨ Legendary Egg",
                cost: 25000,
                color: "#FFD700",
                pets: [
                    { name: "Legendary Skunk", power: 5.3, odds: 40 },
                    { name: "Ancient Phoenix", power: 5.5, odds: 30 },
                    { name: "Primal Beast", power: 5.2, odds: 15 },
                    { name: "Nature's Wrath", power: 5.6, odds: 10 },
                    { name: "Forest Deity", power: 5.9, odds: 5 }
                ]
            }
        ]
    },
    3: { // Volcano
        eggs: [
            {
                name: "🥚 Lava Egg",
                cost: 4500,
                color: "#FF4500",
                pets: [
                    { name: "Lava Salamander", power: 2.4, odds: 40 },
                    { name: "Fire Imp", power: 2.6, odds: 30 },
                    { name: "Magma Worm", power: 2.5, odds: 15 },
                    { name: "Volcanic Bat", power: 2.45, odds: 10 },
                    { name: "Ash Drake", power: 2.8, odds: 5 }
                ]
            },
            {
                name: "💜 Inferno Egg",
                cost: 12500,
                color: "#FF0000",
                pets: [
                    { name: "Infernal Beast", power: 4.1, odds: 35 },
                    { name: "Flame Lord", power: 4.2, odds: 30 },
                    { name: "Fire Serpent", power: 4.0, odds: 20 },
                    { name: "Magma Demon", power: 4.3, odds: 10 },
                    { name: "Volcano Guardian", power: 4.6, odds: 5 }
                ]
            },
            {
                name: "✨ Cosmic Egg",
                cost: 35000,
                color: "#FFD700",
                pets: [
                    { name: "Chaos Dragon", power: 6.4, odds: 40 },
                    { name: "Primordial Flame", power: 6.6, odds: 30 },
                    { name: "Inferno Overlord", power: 6.2, odds: 15 },
                    { name: "Volcanic God", power: 6.7, odds: 10 },
                    { name: "Apocalypse Beast", power: 7.0, odds: 5 }
                ]
            }
        ]
    },
    4: { // Space
        eggs: [
            {
                name: "🥚 Meteor Egg",
                cost: 6500,
                color: "#4B0082",
                pets: [
                    { name: "Space Rat", power: 2.9, odds: 40 },
                    { name: "Cosmic Mouse", power: 2.8, odds: 30 },
                    { name: "Meteor Bird", power: 3.0, odds: 15 },
                    { name: "Asteroid Creature", power: 3.1, odds: 10 },
                    { name: "Zero-G Beast", power: 3.3, odds: 5 }
                ]
            },
            {
                name: "💜 Nebula Egg",
                cost: 18000,
                color: "#00BFFF",
                pets: [
                    { name: "Cosmic Squid", power: 4.8, odds: 35 },
                    { name: "Nebula Serpent", power: 4.9, odds: 30 },
                    { name: "Galaxy Falcon", power: 4.7, odds: 20 },
                    { name: "Void Leviathan", power: 5.1, odds: 10 },
                    { name: "Star Entity", power: 5.4, odds: 5 }
                ]
            },
            {
                name: "✨ Legendary Egg",
                cost: 45000,
                color: "#FFD700",
                pets: [
                    { name: "Alien Overlord", power: 7.3, odds: 40 },
                    { name: "Dimension Walker", power: 7.5, odds: 30 },
                    { name: "Universal Demon", power: 7.2, odds: 15 },
                    { name: "Cosmic Horror", power: 7.6, odds: 10 },
                    { name: "Reality Bender", power: 8.0, odds: 5 }
                ]
            }
        ]
    },
    5: { // Abyssal Trench
        eggs: [
            {
                name: "🥚 Deep Egg",
                cost: 8500,
                color: "#001a4d",
                pets: [
                    { name: "Abyssal Squid", power: 3.3, odds: 40 },
                    { name: "Deep Fish", power: 3.2, odds: 30 },
                    { name: "Trench Serpent", power: 3.4, odds: 15 },
                    { name: "Pressure Beast", power: 3.5, odds: 10 },
                    { name: "Depth Leviathan", power: 3.8, odds: 5 }
                ]
            },
            {
                name: "💜 Abyss Egg",
                cost: 22000,
                color: "#0033cc",
                pets: [
                    { name: "Void Predator", power: 5.2, odds: 35 },
                    { name: "Abyss Watcher", power: 5.3, odds: 30 },
                    { name: "Dark Behemoth", power: 5.1, odds: 20 },
                    { name: "Pressure Titan", power: 5.5, odds: 10 },
                    { name: "Abyss King", power: 5.8, odds: 5 }
                ]
            },
            {
                name: "✨ Legendary Egg",
                cost: 55000,
                color: "#FFD700",
                pets: [
                    { name: "Abyssal God", power: 7.8, odds: 40 },
                    { name: "Deep Void Entity", power: 8.0, odds: 30 },
                    { name: "Ocean Overlord", power: 7.6, odds: 15 },
                    { name: "Pressure Deity", power: 8.1, odds: 10 },
                    { name: "Darkness Incarnate", power: 8.5, odds: 5 }
                ]
            }
        ]
    },
    6: { // Nether Realm
        eggs: [
            {
                name: "🥚 Hell Egg",
                cost: 10500,
                color: "#330033",
                pets: [
                    { name: "Hell Imp", power: 3.7, odds: 40 },
                    { name: "Demon Bat", power: 3.6, odds: 30 },
                    { name: "Infernal Hound", power: 3.8, odds: 15 },
                    { name: "Soul Stealer", power: 3.9, odds: 10 },
                    { name: "Devil's Pet", power: 4.2, odds: 5 }
                ]
            },
            {
                name: "💜 Demon Egg",
                cost: 26000,
                color: "#660066",
                pets: [
                    { name: "Demon Lord", power: 5.6, odds: 35 },
                    { name: "Hell Overlord", power: 5.7, odds: 30 },
                    { name: "Eternal Demon", power: 5.5, odds: 20 },
                    { name: "Soul Reaper", power: 5.9, odds: 10 },
                    { name: "Nether King", power: 6.2, odds: 5 }
                ]
            },
            {
                name: "✨ Legendary Egg",
                cost: 65000,
                color: "#FFD700",
                pets: [
                    { name: "Satan's Steed", power: 8.3, odds: 40 },
                    { name: "Eternal Evil", power: 8.5, odds: 30 },
                    { name: "Hell's Fury", power: 8.1, odds: 15 },
                    { name: "Nether Lord", power: 8.6, odds: 10 },
                    { name: "Chaos Incarnate", power: 9.0, odds: 5 }
                ]
            }
        ]
    },
    7: { // Cybernetic City
        eggs: [
            {
                name: "🥚 Tech Egg",
                cost: 13000,
                color: "#00ffff",
                pets: [
                    { name: "Robo Rat", power: 4.1, odds: 40 },
                    { name: "Cyber Bot", power: 4.0, odds: 30 },
                    { name: "Circuit Beast", power: 4.2, odds: 15 },
                    { name: "Data Ghost", power: 4.3, odds: 10 },
                    { name: "AI Creature", power: 4.6, odds: 5 }
                ]
            },
            {
                name: "💜 Nexus Egg",
                cost: 32000,
                color: "#00ff99",
                pets: [
                    { name: "Nexus Entity", power: 6.0, odds: 35 },
                    { name: "Code Demon", power: 6.1, odds: 30 },
                    { name: "System God", power: 5.9, odds: 20 },
                    { name: "Network Leviathan", power: 6.3, odds: 10 },
                    { name: "Matrix King", power: 6.6, odds: 5 }
                ]
            },
            {
                name: "✨ Legendary Egg",
                cost: 75000,
                color: "#FFD700",
                pets: [
                    { name: "Digital Overlord", power: 8.8, odds: 40 },
                    { name: "Singularity Entity", power: 9.0, odds: 30 },
                    { name: "Machine God", power: 8.6, odds: 15 },
                    { name: "Cyber Deity", power: 9.1, odds: 10 },
                    { name: "Omniscient AI", power: 9.5, odds: 5 }
                ]
            }
        ]
    },
    8: { // Dimension X
        eggs: [
            {
                name: "🥚 Void Egg",
                cost: 16000,
                color: "#ff00ff",
                pets: [
                    { name: "Void Creature", power: 4.5, odds: 40 },
                    { name: "Dimensional Bug", power: 4.4, odds: 30 },
                    { name: "Glitch Beast", power: 4.6, odds: 15 },
                    { name: "Parallel Being", power: 4.7, odds: 10 },
                    { name: "Alternate Self", power: 5.0, odds: 5 }
                ]
            },
            {
                name: "💜 Rift Egg",
                cost: 40000,
                color: "#ff33ff",
                pets: [
                    { name: "Rift Walker", power: 6.4, odds: 35 },
                    { name: "Dimension Master", power: 6.5, odds: 30 },
                    { name: "Void Lord", power: 6.3, odds: 20 },
                    { name: "Parallel God", power: 6.7, odds: 10 },
                    { name: "Dimensional Overlord", power: 7.0, odds: 5 }
                ]
            },
            {
                name: "✨ Legendary Egg",
                cost: 85000,
                color: "#FFD700",
                pets: [
                    { name: "Multiverse Entity", power: 9.3, odds: 40 },
                    { name: "Infinite Being", power: 9.5, odds: 30 },
                    { name: "Void God", power: 9.1, odds: 15 },
                    { name: "Dimensional Deity", power: 9.6, odds: 10 },
                    { name: "Omnipotent Entity", power: 10.0, opts: 5 }
                ]
            }
        ]
    },
    9: { // Infinite Loop
        eggs: [
            {
                name: "🥚 Loop Egg",
                cost: 18500,
                color: "#ffff00",
                pets: [
                    { name: "Loop Creature", power: 4.9, odds: 40 },
                    { name: "Iteration Beast", power: 4.8, odds: 30 },
                    { name: "Recursive Being", power: 5.0, odds: 15 },
                    { name: "Cycle Entity", power: 5.1, odds: 10 },
                    { name: "Infinite Creature", power: 5.4, odds: 5 }
                ]
            },
            {
                name: "💜 Eternity Egg",
                cost: 48000,
                color: "#ffff66",
                pets: [
                    { name: "Eternity Walker", power: 6.8, odds: 35 },
                    { name: "Time Lord", power: 6.9, odds: 30 },
                    { name: "Infinity Beast", power: 6.7, odds: 20 },
                    { name: "Eternal Deity", power: 7.1, odds: 10 },
                    { name: "Cosmic Loop", power: 7.4, odds: 5 }
                ]
            },
            {
                name: "✨ Legendary Egg",
                cost: 95000,
                color: "#FFD700",
                pets: [
                    { name: "Infinite God", power: 9.8, odds: 40 },
                    { name: "Eternity Entity", power: 10.0, odds: 30 },
                    { name: "Time Overlord", power: 9.6, odds: 15 },
                    { name: "Cosmic Infinity", power: 10.1, odds: 10 },
                    { name: "Ultimate Being", power: 10.5, odds: 5 }
                ]
            }
        ]
    },
    10: { // Quantum Realm
        eggs: [
            {
                name: "🥚 Quantum Egg",
                cost: 22000,
                color: "#00ff00",
                pets: [
                    { name: "Quantum Particle", power: 5.3, odds: 40 },
                    { name: "Superposition Beast", power: 5.2, odds: 30 },
                    { name: "Wave Creature", power: 5.4, odds: 15 },
                    { name: "Probability Entity", power: 5.5, odds: 10 },
                    { name: "Entangled Being", power: 5.8, odds: 5 }
                ]
            },
            {
                name: "💜 Subatomic Egg",
                cost: 56000,
                color: "#33ff33",
                pets: [
                    { name: "Subatomic Lord", power: 7.2, odds: 35 },
                    { name: "Quantum Master", power: 7.3, odds: 30 },
                    { name: "Wave Overlord", power: 7.1, odds: 20 },
                    { name: "Probability God", power: 7.5, odds: 10 },
                    { name: "Quantum Deity", power: 7.8, odds: 5 }
                ]
            },
            {
                name: "✨ Legendary Egg",
                cost: 110000,
                color: "#FFD700",
                pets: [
                    { name: "Quantum Supreme", power: 10.3, odds: 40 },
                    { name: "Superposition God", power: 10.5, odds: 30 },
                    { name: "Wave Deity", power: 10.1, odds: 15 },
                    { name: "Probability Overlord", power: 10.6, odds: 10 },
                    { name: "Quantum Omniscience", power: 11.0, odds: 5 }
                ]
            }
        ]
    },
    11: { // Void of Chaos
        eggs: [
            {
                name: "🥚 Chaos Egg",
                cost: 25000,
                color: "#ff6600",
                pets: [
                    { name: "Chaos Imp", power: 5.7, odds: 40 },
                    { name: "Disorder Beast", power: 5.6, odds: 30 },
                    { name: "Entropy Creature", power: 5.8, odds: 15 },
                    { name: "Anarchy Entity", power: 5.9, odds: 10 },
                    { name: "Chaos God", power: 6.2, odds: 5 }
                ]
            },
            {
                name: "💜 Disorder Egg",
                cost: 64000,
                color: "#ff8800",
                pets: [
                    { name: "Disorder Master", power: 7.6, odds: 35 },
                    { name: "Entropy Lord", power: 7.7, odds: 30 },
                    { name: "Anarchy Overlord", power: 7.5, odds: 20 },
                    { name: "Chaos Deity", power: 7.9, odds: 10 },
                    { name: "Disorder Deity", power: 8.2, odds: 5 }
                ]
            },
            {
                name: "✨ Legendary Egg",
                cost: 125000,
                color: "#FFD700",
                pets: [
                    { name: "Chaos Supreme", power: 10.8, odds: 40 },
                    { name: "Entropy Overlord", power: 11.0, odds: 30 },
                    { name: "Anarchy God", power: 10.6, odds: 15 },
                    { name: "Disorder Deity", power: 11.1, odds: 10 },
                    { name: "Ultimate Chaos", power: 11.5, odds: 5 }
                ]
            }
        ]
    },
    12: { // Celestial Heaven
        eggs: [
            {
                name: "🥚 Heaven Egg",
                cost: 28500,
                color: "#66ccff",
                pets: [
                    { name: "Angel", power: 6.1, odds: 40 },
                    { name: "Celestial Being", power: 6.0, odds: 30 },
                    { name: "Holy Beast", power: 6.2, odds: 15 },
                    { name: "Divine Creature", power: 6.3, odds: 10 },
                    { name: "Heavenly Entity", power: 6.6, odds: 5 }
                ]
            },
            {
                name: "💜 Divine Egg",
                cost: 72000,
                color: "#99ddff",
                pets: [
                    { name: "Divine Master", power: 8.0, odds: 35 },
                    { name: "Celestial Lord", power: 8.1, odds: 30 },
                    { name: "Holy Overlord", power: 7.9, odds: 20 },
                    { name: "Divine Deity", power: 8.3, odds: 10 },
                    { name: "Heavenly Overlord", power: 8.6, odds: 5 }
                ]
            },
            {
                name: "✨ Legendary Egg",
                cost: 140000,
                color: "#FFD700",
                pets: [
                    { name: "Celestial Supreme", power: 11.3, odds: 40 },
                    { name: "Divine Overlord", power: 11.5, odds: 30 },
                    { name: "Holy Deity", power: 11.1, odds: 15 },
                    { name: "Celestial Deity", power: 11.6, odds: 10 },
                    { name: "Ultimate Divine", power: 12.0, odds: 5 }
                ]
            }
        ]
    },
    13: { // Inferno Depths
        eggs: [
            {
                name: "🥚 Flame Egg",
                cost: 32000,
                color: "#ff3300",
                pets: [
                    { name: "Flame Sprite", power: 6.5, odds: 40 },
                    { name: "Inferno Beast", power: 6.4, odds: 30 },
                    { name: "Fire Phoenix", power: 6.6, odds: 15 },
                    { name: "Blaze Entity", power: 6.7, odds: 10 },
                    { name: "Inferno Creature", power: 7.0, odds: 5 }
                ]
            },
            {
                name: "💜 Blaze Egg",
                cost: 80000,
                color: "#ff5500",
                pets: [
                    { name: "Blaze Master", power: 8.4, odds: 35 },
                    { name: "Inferno Lord", power: 8.5, odds: 30 },
                    { name: "Fire Overlord", power: 8.3, odds: 20 },
                    { name: "Blaze Deity", power: 8.7, odds: 10 },
                    { name: "Inferno Deity", power: 9.0, odds: 5 }
                ]
            },
            {
                name: "✨ Legendary Egg",
                cost: 155000,
                color: "#FFD700",
                pets: [
                    { name: "Inferno Supreme", power: 11.8, odds: 40 },
                    { name: "Blaze Overlord", power: 12.0, odds: 30 },
                    { name: "Fire Deity", power: 11.6, odds: 15 },
                    { name: "Flame Deity", power: 12.1, odds: 10 },
                    { name: "Ultimate Inferno", power: 12.5, odds: 5 }
                ]
            }
        ]
    },
    14: { // Ultimate Nexus
        eggs: [
            {
                name: "🥚 Nexus Egg",
                cost: 36000,
                color: "#ffff00",
                pets: [
                    { name: "Nexus Spirit", power: 6.9, odds: 40 },
                    { name: "Nexus Beast", power: 6.8, odds: 30 },
                    { name: "Nexus Creature", power: 7.0, odds: 15 },
                    { name: "Nexus Entity", power: 7.1, odds: 10 },
                    { name: "Ultimate Being", power: 7.4, odds: 5 }
                ]
            },
            {
                name: "💜 Ultimate Egg",
                cost: 90000,
                color: "#ffff99",
                pets: [
                    { name: "Ultimate Master", power: 8.8, odds: 35 },
                    { name: "Nexus Lord", power: 8.9, odds: 30 },
                    { name: "Ultimate Overlord", power: 8.7, odds: 20 },
                    { name: "Ultimate Deity", power: 9.1, odds: 10 },
                    { name: "Nexus Deity", power: 9.4, odds: 5 }
                ]
            },
            {
                name: "✨ Legendary Egg",
                cost: 170000,
                color: "#FFD700",
                pets: [
                    { name: "Ultimate Supreme", power: 12.3, odds: 40 },
                    { name: "Nexus Overlord", power: 12.5, odds: 30 },
                    { name: "Ultimate Deity", power: 12.1, odds: 15 },
                    { name: "Nexus Supreme", power: 12.6, odds: 10 },
                    { name: "Absolute Infinity", power: 13.0, odds: 5 }
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

// Audio Management - Expanded sounds
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

function createCriticalSound() {
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.frequency.setValueAtTime(1600, now);
    osc.frequency.exponentialRampToValueAtTime(2400, now + 0.2);
    osc.type = 'sine';
    
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    
    osc.start(now);
    osc.stop(now + 0.2);
}

// Particle Generator - Optimized
function createParticles() {
    const overlay = document.getElementById('particle-overlay');
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

// Click Pop Effect
function showClickPop(e) {
    const pop = document.createElement('div');
    pop.className = 'click-pop';
    const damage = Math.floor(getClickPower() * game.spamMultiplier * getPetMultiplier() * game.criticalMultiplier);
    pop.textContent = '+' + damage.toLocaleString();
    pop.style.left = e.clientX + 'px';
    pop.style.top = e.clientY + 'px';
    pop.style.color = game.criticalMultiplier > 2 ? '#FFD700' : game.spamMultiplier > 3 ? '#FFD700' : game.spamMultiplier > 1.5 ? '#00D9FF' : '#7FFF00';
    document.body.appendChild(pop);
    setTimeout(() => pop.remove(), 1000);
}

// Critical Hit Effect
function showCriticalHit(e) {
    const critical = document.createElement('div');
    critical.className = 'critical-hit';
    critical.textContent = '⚡ CRITICAL! ⚡';
    critical.style.left = (e.clientX - 80) + 'px';
    critical.style.top = (e.clientY - 50) + 'px';
    document.body.appendChild(critical);
    createCriticalSound();
    setTimeout(() => critical.remove(), 800);
}

// Rare Popup Notification
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
    return 10000 * Math.pow(1.25, game.rebirths);
}

// Main Click Handler - WITH CRITICAL HITS AND HOOKS
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
    game.totalClicks++;

    // CRITICAL HIT CHANCE: 5-15% based on clicking speed
    const critChance = Math.min(0.05 + (game.clickStreak * 0.01), 0.15);
    if (Math.random() < critChance) {
        game.criticalMultiplier = 2 + Math.random() * 2; // 2-4x multiplier
        showCriticalHit(e);
    } else {
        game.criticalMultiplier = 1;
    }

    // Calculate damage
    const clickPower = getClickPower();
    const petMult = getPetMultiplier();
    const damage = clickPower * game.spamMultiplier * petMult * game.criticalMultiplier;

    game.points += damage;
    game.totalEarned += damage;
    
    // Play sound and effects
    createClickSound();
    showClickPop(e);
    
    // Random rare popup (1% chance)
    if (Math.random() < 0.01) {
        const rarities = [
            '🌟 LEGENDARY CLICK! 🌟',
            '💎 ULTRA RARE! 💎',
            '🔥 BURNING FURY! 🔥',
            '⚡ MAXIMUM POWER! ⚡',
            '💥 EXPLOSIVE HIT! 💥'
        ];
        showRarePopup(rarities[Math.floor(Math.random() * rarities.length)], 2000);
    }
    
    // Update display IMMEDIATELY
    updateDisplay();
    updateUpgradesDisplay();
    saveGame();
});

// Buy Upgrade - WITH INSTANT DOM REFRESH
function buyUpgrade(idx) {
    const upgrade = UPGRADES[idx];
    const level = game.upgrades[idx];
    const cost = Math.floor(upgrade.baseCost * Math.pow(1.15, level));

    if (game.points >= cost) {
        game.points -= cost;
        game.upgrades[idx]++;
        createPurchaseSound();
        
        // Force immediate DOM update
        updateDisplay();
        updateUpgradesDisplay();
        saveGame();
    }
}

// Force update upgrades display (FIX FOR REAL-TIME UI)
function updateUpgradesDisplay() {
    // Only update if upgrades tab is active
    const upgradesTab = document.getElementById('upgrades');
    if (!upgradesTab.classList.contains('active')) return;
    
    document.querySelectorAll('.upgrade-btn').forEach((btn, idx) => {
        const upgrade = UPGRADES[idx];
        const level = game.upgrades[idx];
        const nextCost = Math.floor(upgrade.baseCost * Math.pow(1.15, level));
        const affordable = game.points >= nextCost;
        
        // Update cost text
        const costEl = btn.querySelector('.upgrade-cost');
        if (costEl) costEl.innerText = `Cost: ${nextCost.toLocaleString()}`;
        
        // Update level
        const levelEl = btn.querySelector('.upgrade-level');
        if (levelEl) levelEl.innerText = `Level: ${level}`;
        
        // Update affordability
        if (affordable && btn.classList.contains('unaffordable')) {
            btn.classList.remove('unaffordable');
        } else if (!affordable && !btn.classList.contains('unaffordable')) {
            btn.classList.add('unaffordable');
        }
    });
}

// Open Egg Selection Modal
function openEggModal() {
    document.getElementById("egg-modal").classList.remove("hidden");
    renderEggSelection();
}

function closeEggModal() {
    document.getElementById("egg-modal").classList.add("hidden");
}

// Render Egg Selection - WITH RARITY PERCENTAGES
function renderEggSelection() {
    const eggPool = PET_POOLS[game.worldIdx].eggs;
    let html = "<div style='display: grid; gap: 15px;'>";
    
    eggPool.forEach((egg, idx) => {
        let petsList = "<div style='margin-top: 10px; padding: 10px; background: rgba(0,0,0,0.5); border-radius: 8px; text-align: left; font-size: 0.85rem;'>";
        egg.pets.forEach(pet => {
            petsList += `<div style='margin: 4px 0; color: #a0d0ff;'>• ${pet.name}: <strong style="color: #FFD700;">${pet.odds}%</strong></div>`;
        });
        petsList += "</div>";
        
        html += `
            <button class="modal-btn" style="background: linear-gradient(135deg, ${egg.color}, ${egg.color}dd); border: 3px solid ${egg.color}; text-align: left; padding: 15px;" onclick="selectEgg(${idx})">
                <div style="font-size: 1.1rem; margin-bottom: 8px;">${egg.name}</div>
                <div style="font-size: 0.9rem; margin-bottom: 10px;">Cost: ${egg.cost.toLocaleString()}</div>
                ${petsList}
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
    
    // Random pet from this egg based on odds
    let rand = Math.random() * 100;
    let pet = egg.pets[0];
    for (let p of egg.pets) {
        if (rand < p.odds) {
            pet = { ...p, id: Date.now(), eggType: egg.name };
            break;
        }
        rand -= p.odds;
    }
    
    game.pets.push(pet);
    
    createPurchaseSound();
    closeEggModal();
    updateDisplay();
    saveGame();
    showRarePopup(`🎉 You got <strong>${pet.name}</strong>! (${pet.power.toFixed(1)}x)`, 3000);
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

// Rebirth - Progressive difficulty
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
        game.criticalMultiplier = 1;
        game.worldIdx = Math.min(game.rebirths, WORLDS.length - 1);
        initializeUpgrades();
        createRebirthSound();
        updateDisplay();
        saveGame();
        showRarePopup(`🔄 REBORN! World ${game.rebirths + 1}: ${WORLDS[game.worldIdx].name}`, 3500);
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
