// ============================================
// VisionPlay v4.2 - Full Script (JS Jump Runner)
// ============================================

// ---------- BASIC DOM ----------
const body = document.body;

// Controls
const themeSelect = document.getElementById("themeSelect");
const soundThemeSelect = document.getElementById("soundThemeSelect");
const soundToggleButton = document.getElementById("soundToggleButton");
const colorButton = document.getElementById("colorButton");
const fontButton = document.getElementById("fontButton");
const titleButton = document.getElementById("titleButton");
const typewriterToggleButton = document.getElementById("typewriterToggleButton");
const titleEl = document.getElementById("title");

// Navigation
const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");
const navLinks = document.querySelectorAll(".nav-link");

// Game cards
const clickRaceCard = document.getElementById("clickRaceSection");
const jumpRunnerCard = document.getElementById("jumpRunnerSection");
const reactionCard = document.getElementById("reactionSection");
const aimTrainerCard = document.getElementById("aimTrainerSection");

// Stats elements
const statsClickBest = document.getElementById("statsClickBest");
const statsRunnerBest = document.getElementById("statsRunnerBest");
const statsReactionBest = document.getElementById("statsReactionBest");
const statsAimBest = document.getElementById("statsAimBest");
const resetStatsButton = document.getElementById("resetStatsButton");

// ---------- STORAGE HELPERS ----------
function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (_) {}
}
function loadFromStorage(key, defaultValue) {
    try {
        const raw = localStorage.getItem(key);
        if (raw === null) return defaultValue;
        return JSON.parse(raw);
    } catch (_) {
        return defaultValue;
    }
}

// ============================================
// SOUND SYSTEM (SFX + BG MUSIC)
// ============================================
let clickSfx, jumpSfx, hitSfx, gameOverSfx, diffSelectSfx, whooshSfx, perfectSfx, hoverSfx, startFanSfx;
let bgClassic, bgArcade, bgSoft;
let soundEnabled = false;       // OFF by default
let currentBgTheme = "classic";
let currentBgAudio = null;

try {
    clickSfx      = new Audio("click.mp3");
    jumpSfx       = new Audio("jump.mp3");
    hitSfx        = new Audio("hit.mp3");
    gameOverSfx   = new Audio("gameover.mp3");
    diffSelectSfx = new Audio("diffselect.mp3");
    whooshSfx     = new Audio("whoosh.mp3");
    perfectSfx    = new Audio("perfect.mp3");
    hoverSfx      = new Audio("hover.mp3");
    startFanSfx   = new Audio("startfan.mp3");

    bgClassic     = new Audio("bgmusic_classic.mp3");
    bgArcade      = new Audio("bgmusic_arcade.mp3");
    bgSoft        = new Audio("bgmusic_soft.mp3");

    [bgClassic, bgArcade, bgSoft].forEach(a => {
        if (!a) return;
        a.loop = true;
        a.volume = 0.25;
    });

    currentBgAudio = bgClassic;
} catch (_) {}

function playSound(sfx) {
    if (!soundEnabled) return;
    if (!sfx || typeof sfx.play !== "function") return;
    try {
        sfx.currentTime = 0;
        sfx.play();
    } catch (_) {}
}

function stopAllBgMusic() {
    [bgClassic, bgArcade, bgSoft].forEach(a => {
        if (!a) return;
        try { a.pause(); } catch (_) {}
    });
}

function updateBgMusic() {
    if (!soundEnabled) {
        stopAllBgMusic();
        return;
    }
    stopAllBgMusic();
    if (!currentBgAudio) return;
    try {
        currentBgAudio.currentTime = 0;
        currentBgAudio.play();
    } catch (_) {}
}

// Toggle sound on/off
if (soundToggleButton) {
    soundToggleButton.textContent = "Sound: Off";
    soundToggleButton.classList.add("muted");
    soundToggleButton.setAttribute("aria-pressed", "true");

    soundToggleButton.addEventListener("click", () => {
        if (soundEnabled) playSound(clickSfx);

        soundEnabled = !soundEnabled;
        soundToggleButton.textContent = soundEnabled ? "Sound: On" : "Sound: Off";
        soundToggleButton.classList.toggle("muted", !soundEnabled);
        soundToggleButton.setAttribute("aria-pressed", soundEnabled ? "false" : "true");
        updateBgMusic();
    });
}

// Background music theme (classic / arcade / soft)
if (soundThemeSelect) {
    const savedTheme = loadFromStorage("vp_bgTheme", "classic");
    currentBgTheme = ["classic", "arcade", "soft"].includes(savedTheme) ? savedTheme : "classic";
    soundThemeSelect.value = currentBgTheme;

    function setBgTheme(theme) {
        currentBgTheme = theme;
        saveToStorage("vp_bgTheme", theme);

        if (theme === "arcade") currentBgAudio = bgArcade;
        else if (theme === "soft") currentBgAudio = bgSoft;
        else currentBgAudio = bgClassic;

        if (soundEnabled) updateBgMusic();
    }

    setBgTheme(currentBgTheme);

    soundThemeSelect.addEventListener("change", () => {
        playSound(clickSfx);
        setBgTheme(soundThemeSelect.value);
    });
}

// ============================================
// NAV + ACTIVE CARD
// ============================================
function setActiveGameCard(card) {
    [clickRaceCard, jumpRunnerCard, reactionCard, aimTrainerCard].forEach(c => {
        if (!c) return;
        c.classList.remove("active-game");
    });
    if (card) card.classList.add("active-game");
}

if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
        const open = navMenu.classList.toggle("open");
        navToggle.setAttribute("aria-expanded", open ? "true" : "false");
        playSound(clickSfx);
    });
}

navLinks.forEach(link => {
    link.addEventListener("click", () => {
        if (navMenu && navMenu.classList.contains("open")) {
            navMenu.classList.remove("open");
            navToggle.setAttribute("aria-expanded", "false");
        }
    });
});

// ============================================
// THEME / ACCENT / FONT / TITLE / TYPEWRITER
// ============================================
const themeClasses = ["theme-dark", "theme-light", "theme-neon"];
const savedTheme = loadFromStorage("vp_theme", "dark");
if (body) {
    body.classList.remove(...themeClasses);
    body.classList.add(`theme-${savedTheme}`);
}
if (themeSelect) {
    themeSelect.value = savedTheme;
    themeSelect.addEventListener("change", () => {
        const val = themeSelect.value;
        body.classList.remove(...themeClasses);
        body.classList.add(`theme-${val}`);
        saveToStorage("vp_theme", val);
        playSound(clickSfx);
    });
}

// Accent color
const accentColors = ["#4c6fff", "#22c55e", "#f97316", "#ec4899", "#eab308", "#06b6d4"];
let accentIndex = 0;
const savedAccent = loadFromStorage("vp_accent", null);
if (savedAccent) {
    document.documentElement.style.setProperty("--accent-color", savedAccent);
    const idx = accentColors.indexOf(savedAccent);
    accentIndex = idx >= 0 ? idx : 0;
}
if (colorButton) {
    colorButton.addEventListener("click", () => {
        playSound(clickSfx);
        accentIndex = (accentIndex + 1) % accentColors.length;
        const next = accentColors[accentIndex];
        document.documentElement.style.setProperty("--accent-color", next);
        saveToStorage("vp_accent", next);
    });
}

// Font cycle
const fontClasses = ["font-default", "font-rounded", "font-mono"];
let fontIndex = 0;
if (body) {
    const savedFont = loadFromStorage("vp_font", "font-default");
    body.classList.remove(...fontClasses);
    body.classList.add(savedFont);
    fontIndex = Math.max(0, fontClasses.indexOf(savedFont));
}
if (fontButton) {
    fontButton.addEventListener("click", () => {
        playSound(clickSfx);
        body.classList.remove(...fontClasses);
        fontIndex = (fontIndex + 1) % fontClasses.length;
        const cls = fontClasses[fontIndex];
        body.classList.add(cls);
        saveToStorage("vp_font", cls);
    });
}

// Title change
if (titleButton && titleEl) {
    const savedTitle = loadFromStorage("vp_title", null);
    if (savedTitle) titleEl.textContent = savedTitle;

    titleButton.addEventListener("click", () => {
        playSound(clickSfx);
        const newTitle = prompt("Enter a new title that fits VisionPlay:", titleEl.textContent.trim());
        if (newTitle && newTitle.trim() !== "") {
            titleEl.textContent = newTitle.trim();
            saveToStorage("vp_title", newTitle.trim());
        }
    });
}

// Typewriter effect
let typewriterTimer = null;
let typewriterActive = false;

function stopTypewriter() {
    if (!titleEl) return;
    if (typewriterTimer) clearInterval(typewriterTimer);
    typewriterTimer = null;
    typewriterActive = false;
    titleEl.classList.remove("typewriter-active");

    const saved = loadFromStorage("vp_title", titleEl.textContent);
    titleEl.textContent = saved || "Welcome to VisionPlay";
}

function startTypewriter() {
    if (!titleEl) return;
    stopTypewriter();
    typewriterActive = true;
    titleEl.classList.add("typewriter-active");

    const full = titleEl.textContent || "Welcome to VisionPlay";
    let i = 0;
    typewriterTimer = setInterval(() => {
        if (!typewriterActive) return;
        if (i <= full.length) {
            titleEl.textContent = full.slice(0, i);
            i++;
        } else {
            stopTypewriter();
        }
    }, 90);
}

if (typewriterToggleButton) {
    typewriterToggleButton.addEventListener("click", () => {
        playSound(clickSfx);
        if (typewriterActive) stopTypewriter();
        else startTypewriter();
    });
}

// ============================================
// RANDOM FACTS
// ============================================
const factText = document.getElementById("factText");
const factButtons = document.querySelectorAll(".fact-btn");

const facts = {
    world: [
        "Australia is wider than the Moon.",
        "Honey never spoils — edible honey has been found in ancient tombs.",
        "Japan is made up of over 6,800 islands.",
        "Antarctica is technically a desert because it gets very little rain.",
        "Some countries, like Saudi Arabia, have no rivers.",
        "The Sahara Desert was once green and full of plants."
    ],
    animals: [
        "Octopuses have three hearts and blue blood.",
        "Cows can have best friends and get stressed when separated.",
        "A group of flamingos is called a 'flamboyance'.",
        "Some turtles can breathe through their butts underwater.",
        "Sloths move so slowly that algae can grow on their fur.",
        "Elephants can recognize themselves in a mirror."
    ],
    space: [
        "One day on Venus is longer than a year on Venus.",
        "There are more stars in the universe than grains of sand on Earth.",
        "Footprints on the Moon may last millions of years.",
        "Jupiter is so big that over 1,300 Earths could fit inside it.",
        "Space is completely silent because there is no air.",
        "The Sun makes up about 99.8% of the mass in our solar system."
    ],
    tech: [
        "The first computer mouse was made of wood.",
        "Email existed before the World Wide Web.",
        "Modern smartphones are more powerful than the computers used for Apollo missions.",
        "The first 1GB hard drive weighed over 200 kilograms.",
        "The first website went online in 1991 and is still accessible."
    ],
    gaming: [
        "Minecraft was originally called 'Cave Game'.",
        "The first commercially successful video game was Pong.",
        "Pac-Man was inspired by a pizza with a slice missing.",
        "Tetris has been ported to almost every system ever made.",
        "The Konami Code appears in many games."
    ],
    weird: [
        "Bananas are berries, but strawberries are not.",
        "Wombat poop is cube-shaped.",
        "There is a jellyfish that may be biologically immortal.",
        "You are slightly taller in the morning than at night.",
        "Some cats are allergic to humans.",
        "Sharks existed before trees."
    ]
};

if (factText && factButtons.length > 0) {
    factButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            playSound(clickSfx);
            const cat = btn.dataset.category;
            const arr = facts[cat];
            if (!arr || arr.length === 0) {
                factText.textContent = "No facts for this category yet.";
                return;
            }
            const random = arr[Math.floor(Math.random() * arr.length)];
            factText.textContent = random;
        });
    });
}

// ============================================
// CLICK RACE
// ============================================
const clickStartButton = document.getElementById("clickStartButton");
const clickButton = document.getElementById("clickButton");
const clickStatus = document.getElementById("clickStatus");
const clickScoreLabel = document.getElementById("clickScore");
const clickBestLabel = document.getElementById("clickBest");
const timePresetButtons = document.querySelectorAll(".time-preset-btn");
const clickCustomTimeInput = document.getElementById("clickCustomTime");
const clickApplyCustomButton = document.getElementById("clickApplyCustom");

let clickGameActive = false;
let clickCount = 0;
let clickGameTimer = null;
let clickCountdownTimer = null;
let clickDurationSeconds = 5;
let clickGameStartTime = 0;

let bestClickScore = 0;
let bestClickDuration = 5;
const storedClick = loadFromStorage("vp_clickBest", null);
if (storedClick && typeof storedClick.score === "number" && typeof storedClick.duration === "number") {
    bestClickScore = storedClick.score;
    bestClickDuration = storedClick.duration;
}

function getClickRank(score, duration) {
    const cps = duration > 0 ? score / duration : 0;
    if (cps >= 10) return "Legendary";
    if (cps >= 7)  return "Insane";
    if (cps >= 5)  return "Fast";
    if (cps >= 3)  return "Warm-up";
    return "Chill";
}

function updateClickBestDisplay() {
    const d = bestClickDuration || 1;
    const cps = (bestClickScore / d).toFixed(1);
    if (clickBestLabel) {
        clickBestLabel.textContent = `Best: ${bestClickScore} clicks (${cps} cps, ${getClickRank(bestClickScore, d)})`;
    }
    if (statsClickBest) {
        statsClickBest.textContent = `Best Click Race score: ${bestClickScore} clicks (${cps} cps, ${getClickRank(bestClickScore, d)})`;
    }
}
updateClickBestDisplay();

function stopClickRace(finalReason) {
    clickGameActive = false;
    if (clickGameTimer) clearTimeout(clickGameTimer);
    if (clickCountdownTimer) clearInterval(clickCountdownTimer);
    clickGameTimer = null;
    clickCountdownTimer = null;

    if (clickButton) clickButton.disabled = true;

    const elapsed = (Date.now() - clickGameStartTime) / 1000;
    const cps = elapsed > 0 ? (clickCount / elapsed).toFixed(1) : "0.0";
    const rank = getClickRank(clickCount, elapsed);

    if (clickStatus) {
        clickStatus.textContent = `${finalReason} You clicked ${clickCount} times in ${elapsed.toFixed(1)}s (${cps} cps, ${rank}).`;
    }

    if (clickCount > bestClickScore) {
        bestClickScore = clickCount;
        bestClickDuration = elapsed;
        saveToStorage("vp_clickBest", { score: bestClickScore, duration: bestClickDuration });
        playSound(perfectSfx || clickSfx);
    } else {
        playSound(gameOverSfx || clickSfx);
    }

    updateClickBestDisplay();
    updateStatsPanel();
}

if (clickStartButton && clickButton) {
    // Preset buttons
    timePresetButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const sec = Number(btn.dataset.seconds || "5");
            if (isNaN(sec) || sec < 3 || sec > 60) return;
            clickDurationSeconds = sec;
            if (clickStatus) clickStatus.textContent = `Timer set to ${sec}s. Press "Start Round" to play.`;
            playSound(clickSfx);
        });
    });

    // Custom time
    if (clickApplyCustomButton && clickCustomTimeInput) {
        clickApplyCustomButton.addEventListener("click", () => {
            const sec = Number(clickCustomTimeInput.value);
            if (isNaN(sec) || sec < 3 || sec > 60) {
                if (clickStatus) clickStatus.textContent = "Custom time must be between 3 and 60 seconds.";
                return;
            }
            clickDurationSeconds = sec;
            if (clickStatus) clickStatus.textContent = `Timer set to ${sec}s. Press "Start Round" to play.`;
            playSound(clickSfx);
        });
    }

    // Start round
    clickStartButton.addEventListener("click", () => {
        if (clickGameActive) return;

        const duration = clickDurationSeconds || 5;
        clickGameActive = true;
        clickCount = 0;
        clickGameStartTime = Date.now();
        setActiveGameCard(clickRaceCard);
        playSound(startFanSfx || clickSfx);

        if (clickScoreLabel) clickScoreLabel.textContent = "Score: 0 clicks";
        if (clickButton) clickButton.disabled = false;

        let remaining = duration;
        if (clickCountdownTimer) clearInterval(clickCountdownTimer);
        clickCountdownTimer = setInterval(() => {
            if (!clickGameActive) {
                clearInterval(clickCountdownTimer);
                return;
            }
            remaining = Math.max(0, remaining - 0.1);
            const elapsed = (Date.now() - clickGameStartTime) / 1000;
            const cps = elapsed > 0 ? (clickCount / elapsed).toFixed(1) : "0.0";
            if (clickStatus) {
                clickStatus.textContent = `Time left: ${remaining.toFixed(1)}s — Clicks: ${clickCount} (${cps} cps)`;
            }
            if (remaining <= 0) clearInterval(clickCountdownTimer);
        }, 100);

        if (clickGameTimer) clearTimeout(clickGameTimer);
        clickGameTimer = setTimeout(() => {
            stopClickRace("Time's up!");
        }, duration * 1000);
    });

    // Click during round
    clickButton.addEventListener("click", () => {
        if (!clickGameActive) return;
        clickCount++;
        playSound(clickSfx);
        if (clickScoreLabel) clickScoreLabel.textContent = `Score: ${clickCount} clicks`;
    });
}

// ============================================
// JUMP RUNNER (SIDE-SCROLL, JS-BASED JUMP)
// ============================================
const runnerStartButton = document.getElementById("runnerStartButton");
const runnerArea = document.getElementById("runnerArea");
const runnerCharacter = document.getElementById("runnerCharacter");
const runnerObstacle = document.getElementById("runnerObstacle");
const runnerStatus = document.getElementById("runnerStatus");
const runnerScoreEl = document.getElementById("runnerScore");
const runnerBestEl = document.getElementById("runnerBest");
const runnerMeta = document.getElementById("runnerMeta");
const runnerLivesContainer = document.getElementById("runnerLives");
const runnerModeButtons = document.querySelectorAll(".runner-mode-btn");
const runnerDiffButtons = document.querySelectorAll(".difficulty-btn");

let runnerMode = "endless";        // "endless" | "goal"
let runnerDifficulty = "easy";     // "easy" | "normal" | "hard"
let runnerActive = false;
let runnerStartTime = 0;
let runnerGameLoop = null;

let runnerLives = 5;
let runnerMaxLives = 5;

// Character vertical physics
let runnerY = 15;       // bottom position in px
let runnerVelY = 0;     // vertical velocity
const RUNNER_GROUND_Y = 15;
const RUNNER_GRAVITY = -0.9;  // change per frame (30ms)

// Obstacle horizontal position
let runnerObstacleX = 0;
const RUNNER_OBS_SPEED_PX = 3.5; // px per frame

// Distance / scoring
const RUNNER_WORLD_SPEED = 5;    // meters per second
const RUNNER_GOAL_DISTANCE = 250;

// Difficulty config (Option A style)
// Improved difficulty tuning so jumps can clear obstacles
const diffConfig = {
    easy:   { jumpImpulse: 22, lives: 5, speed: 3.2 },
    normal: { jumpImpulse: 20, lives: 3, speed: 3.6 },
    hard:   { jumpImpulse: 18, lives: 1, speed: 4.0 }
};

// Best stats (time + distance)
let runnerBestTime = loadFromStorage("vp_runnerBestTime", 0);
let runnerBestDist = loadFromStorage("vp_runnerBestDist", 0);

function updateRunnerBestDisplay() {
    const bestDist = Math.round(runnerBestDist);
    if (runnerBestEl) {
        runnerBestEl.textContent = `Best time: ${runnerBestTime}s (Distance: ${bestDist} m)`;
    }
    if (statsRunnerBest) {
        statsRunnerBest.textContent = `Best Jump Runner: ${runnerBestTime}s, ${bestDist} m`;
    }
}

function updateRunnerMeta() {
    if (!runnerMeta) return;
    const cfg = diffConfig[runnerDifficulty] || diffConfig.easy;
    const diffLabel = runnerDifficulty.charAt(0).toUpperCase() + runnerDifficulty.slice(1);

    runnerMeta.innerHTML = `
        <span class="chip">${runnerMode === "endless" ? "Endless mode" : "Goal mode (250m)"}</span>
        <span class="chip">${diffLabel}</span>
        <span class="chip chip-green">${cfg.lives} lives</span>
    `;
}

function updateRunnerLivesDisplay() {
    if (!runnerLivesContainer) return;
    runnerLivesContainer.innerHTML = "";
    for (let i = 0; i < runnerMaxLives; i++) {
        const heart = document.createElement("div");
        heart.classList.add("runner-heart");
        if (i >= runnerLives) heart.classList.add("lost");
        runnerLivesContainer.appendChild(heart);
    }
}

updateRunnerBestDisplay();

// Difficulty & mode
function setRunnerDifficulty(diff) {
    const cfg = diffConfig[diff] || diffConfig.easy;
    runnerDifficulty = diff;
    runnerMaxLives = cfg.lives;
    runnerLives = cfg.lives;

    runnerDiffButtons.forEach(btn => {
        btn.classList.toggle("active", btn.dataset.diff === diff);
    });

    updateRunnerMeta();
    updateRunnerLivesDisplay();
    playSound(diffSelectSfx || clickSfx);
}

function setRunnerMode(mode) {
    runnerMode = mode;
    runnerModeButtons.forEach(btn => {
        btn.classList.toggle("active", btn.dataset.mode === mode);
    });
    updateRunnerMeta();
    playSound(whooshSfx || clickSfx);
}

runnerModeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        setRunnerMode(btn.dataset.mode || "endless");
    });
});

runnerDiffButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        setRunnerDifficulty(btn.dataset.diff || "easy");
    });
});

// Defaults
setRunnerMode("endless");
setRunnerDifficulty("easy");

// Reset positions
function resetRunnerPositions() {
    if (!runnerArea || !runnerCharacter || !runnerObstacle) return;

    const areaRect = runnerArea.getBoundingClientRect();

    // Character
    runnerY = RUNNER_GROUND_Y;
    runnerVelY = 0;
    runnerCharacter.style.bottom = `${runnerY}px`;
    runnerCharacter.style.left = "50px";

    // Obstacle just off right edge
    runnerObstacleX = areaRect.width + 40;
    runnerObstacle.style.left = `${runnerObstacleX}px`;
    runnerObstacle.style.bottom = `${RUNNER_GROUND_Y}px`;
}

// Jump (JS physics)
function runnerJump() {
    if (!runnerActive || !runnerCharacter) return;

    // Only jump if basically on ground
    if (runnerY > RUNNER_GROUND_Y + 1) return;

    const cfg = diffConfig[runnerDifficulty] || diffConfig.easy;
    runnerVelY = cfg.jumpImpulse;
    playSound(jumpSfx || clickSfx);
}

// Space + click
document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        e.preventDefault();
        runnerJump();
    }
});
if (runnerArea) {
    runnerArea.addEventListener("click", () => {
        runnerJump();
    });
}

// End game
function endRunnerGame(win) {
    runnerActive = false;
    setActiveGameCard(null);

    if (runnerGameLoop) {
        clearInterval(runnerGameLoop);
        runnerGameLoop = null;
    }

    const elapsed = (Date.now() - runnerStartTime) / 1000;
    const timeSec = parseFloat(elapsed.toFixed(1));
    const distance = Math.floor(timeSec * RUNNER_WORLD_SPEED);

    // Update best
    if (timeSec > runnerBestTime || distance > runnerBestDist) {
        runnerBestTime = timeSec;
        runnerBestDist = distance;
        saveToStorage("vp_runnerBestTime", runnerBestTime);
        saveToStorage("vp_runnerBestDist", runnerBestDist);
        updateRunnerBestDisplay();
    }

    let msg;
    if (win) {
        msg = `You reached ${RUNNER_GOAL_DISTANCE}m in ${timeSec}s — nice!`;
        playSound(perfectSfx || clickSfx);
    } else {
        msg = `Game over! You reached ${distance}m in ${timeSec}s.`;
        playSound(gameOverSfx || hitSfx);
    }

    if (runnerStatus) runnerStatus.textContent = msg;
    updateStatsPanel();
}

// Start game
function startRunnerGame() {
    if (!runnerArea || !runnerCharacter || !runnerObstacle || !runnerStatus) return;
    if (runnerActive) return;

    runnerActive = true;
    runnerStartTime = Date.now();
    setActiveGameCard(jumpRunnerCard);
    playSound(startFanSfx || clickSfx);

    const cfg = diffConfig[runnerDifficulty] || diffConfig.easy;
    runnerMaxLives = cfg.lives;
    runnerLives = cfg.lives;
    updateRunnerLivesDisplay();
    resetRunnerPositions();

    if (runnerStatus) {
        runnerStatus.textContent =
            `Runner started! Mode: ${runnerMode}, Difficulty: ${runnerDifficulty}, Lives: ${runnerLives}.`;
    }
    if (runnerScoreEl) runnerScoreEl.textContent = "Distance: 0 m";

    // Main loop (30ms)
    if (runnerGameLoop) clearInterval(runnerGameLoop);
    runnerGameLoop = setInterval(() => {
        if (!runnerActive || !runnerArea || !runnerCharacter || !runnerObstacle) return;

        const areaRect = runnerArea.getBoundingClientRect();
        const charRect = runnerCharacter.getBoundingClientRect();
        const obsRect = runnerObstacle.getBoundingClientRect();

        // Vertical physics
        runnerVelY += RUNNER_GRAVITY;
        runnerY += runnerVelY;
        if (runnerY < RUNNER_GROUND_Y) {
            runnerY = RUNNER_GROUND_Y;
            runnerVelY = 0;
        }
        runnerCharacter.style.bottom = `${runnerY}px`;

        // Move obstacle left
        // Move obstacle left (speed depends on difficulty)
	const cfg = diffConfig[runnerDifficulty] || diffConfig.easy;
	runnerObstacleX -= cfg.speed;
	if (runnerObstacleX < -40) {
    runnerObstacleX = areaRect.width + 40;
	}
	runnerObstacle.style.left = `${runnerObstacleX}px`;

        // Time & distance
        const elapsed = (Date.now() - runnerStartTime) / 1000;
        const dist = Math.floor(elapsed * RUNNER_WORLD_SPEED);
        if (runnerScoreEl) runnerScoreEl.textContent = `Distance: ${dist} m`;

        if (runnerMode === "goal" && dist >= RUNNER_GOAL_DISTANCE) {
            endRunnerGame(true);
            return;
        }

        // Collision
        const overlap =
            charRect.left < obsRect.right &&
            charRect.right > obsRect.left &&
            charRect.bottom > obsRect.top &&
            charRect.top < obsRect.bottom;

        if (overlap) {
            runnerLives = Math.max(0, runnerLives - 1);
            updateRunnerLivesDisplay();
            playSound(hitSfx || gameOverSfx);

            if (runnerLives <= 0) {
                endRunnerGame(false);
                return;
            } else {
                if (runnerStatus) runnerStatus.textContent = `Hit! Lives left: ${runnerLives}`;
                runnerObstacleX = areaRect.width + 40;
                runnerObstacle.style.left = `${runnerObstacleX}px`;
            }
        }
    }, 30);
}

if (runnerStartButton) {
    runnerStartButton.addEventListener("click", startRunnerGame);
}

// Make sure best view is synced
updateRunnerBestDisplay();

// ============================================
// REACTION TEST
// ============================================
const reactionStartButton = document.getElementById("reactionStartButton");
const reactionArea = document.getElementById("reactionArea");
const reactionPrompt = document.getElementById("reactionPrompt");
const reactionStatus = document.getElementById("reactionStatus");
const reactionBestLabel = document.getElementById("reactionBest");
const reactionModeButtons = document.querySelectorAll(".reaction-mode-btn");

let reactionMode = "classic";
let reactionState = "idle"; // idle | waiting | ready
let reactionTimer = null;
let reactionStartTimeMs = 0;
let reactionRounds = 0;
let reactionTotalMs = 0;

let bestReactionMs = loadFromStorage("vp_reactionBestMs", null);

function updateReactionBestDisplay() {
    if (reactionBestLabel) {
        reactionBestLabel.textContent =
            bestReactionMs === null ? "Best Reaction: –" : `Best Reaction: ${bestReactionMs} ms`;
    }
    if (statsReactionBest) {
        statsReactionBest.textContent =
            bestReactionMs === null ? "Best Reaction: –" : `Best Reaction: ${bestReactionMs} ms`;
    }
}
updateReactionBestDisplay();

reactionModeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const mode = btn.dataset.mode || "classic";
        reactionMode = mode;
        reactionModeButtons.forEach(b => b.classList.toggle("active", b.dataset.mode === mode));
        playSound(clickSfx);
    });
});

function startReactionRound() {
    if (!reactionArea || !reactionPrompt) return;

    if (reactionTimer) clearTimeout(reactionTimer);
    reactionState = "waiting";
    reactionArea.classList.remove("reaction-ready");
    reactionArea.classList.add("reaction-wait");
    reactionPrompt.textContent = "Wait for green...";
    if (reactionStatus) reactionStatus.textContent = "";
    setActiveGameCard(reactionCard);

    let minDelay = 800;
    let maxDelay = 2500;
    if (reactionMode === "hard") {
        minDelay = 600;
        maxDelay = 1700;
    }

    reactionTimer = setTimeout(() => {
        reactionState = "ready";
        reactionArea.classList.remove("reaction-wait");
        reactionArea.classList.add("reaction-ready");
        reactionPrompt.textContent = "CLICK NOW!";
        reactionStartTimeMs = performance.now();
        playSound(perfectSfx || clickSfx);
    }, minDelay + Math.random() * (maxDelay - minDelay));
}

if (reactionStartButton) {
    reactionStartButton.addEventListener("click", () => {
        reactionRounds = 0;
        reactionTotalMs = 0;
        startReactionRound();
    });
}

if (reactionArea) {
    reactionArea.addEventListener("click", () => {
        if (reactionState === "waiting") {
            if (reactionTimer) clearTimeout(reactionTimer);
            reactionState = "idle";
            reactionArea.classList.remove("reaction-wait", "reaction-ready");
            reactionPrompt.textContent = "Too early! Click Start to try again.";
            if (reactionStatus) reactionStatus.textContent = "Too early.";
            playSound(hitSfx || clickSfx);
        } else if (reactionState === "ready") {
            const now = performance.now();
            const delta = Math.round(now - reactionStartTimeMs);
            reactionState = "idle";
            reactionArea.classList.remove("reaction-wait", "reaction-ready");

            if (reactionMode === "average") {
                reactionRounds++;
                reactionTotalMs += delta;
                if (reactionRounds < 5) {
                    reactionPrompt.textContent = `You: ${delta} ms. Round ${reactionRounds}/5...`;
                    if (reactionStatus) reactionStatus.textContent = "Next round starting...";
                    setTimeout(startReactionRound, 700);
                } else {
                    const avg = Math.round(reactionTotalMs / reactionRounds);
                    reactionPrompt.textContent = `Average: ${avg} ms over 5 rounds.`;
                    if (reactionStatus) reactionStatus.textContent = "Average mode finished.";
                    if (bestReactionMs === null || avg < bestReactionMs) {
                        bestReactionMs = avg;
                        saveToStorage("vp_reactionBestMs", bestReactionMs);
                    }
                    updateReactionBestDisplay();
                    updateStatsPanel();
                }
            } else {
                reactionPrompt.textContent = `Reaction: ${delta} ms`;
                if (reactionStatus) reactionStatus.textContent = "Click Start to try again.";
                if (bestReactionMs === null || delta < bestReactionMs) {
                    bestReactionMs = delta;
                    saveToStorage("vp_reactionBestMs", bestReactionMs);
                }
                updateReactionBestDisplay();
                updateStatsPanel();
            }

            playSound(perfectSfx || clickSfx);
        }
    });
}

// ============================================
// AIM TRAINER
// ============================================
const aimDurationInput = document.getElementById("aimDurationInput");
const aimStartButton = document.getElementById("aimStartButton");
const aimArea = document.getElementById("aimArea");
const aimStatus = document.getElementById("aimStatus");
const aimScoreLabel = document.getElementById("aimScore");
const aimBestLabel = document.getElementById("aimBest");
const aimDiffButtons = document.querySelectorAll(".aim-diff-btn");

let aimDifficulty = "easy";
let aimRunning = false;
let aimDuration = 20;
let aimTimeLeft = 0;
let aimHits = 0;
let aimMisses = 0;
let aimTimer = null;
let aimSpawnTimer = null;

let aimBestHits = loadFromStorage("vp_aimBestHits", 0);

function updateAimBestDisplay() {
    if (aimBestLabel) aimBestLabel.textContent = `Best Aim Trainer score: ${aimBestHits} hits`;
    if (statsAimBest) statsAimBest.textContent = `Best Aim Trainer score: ${aimBestHits} hits`;
}
updateAimBestDisplay();

aimDiffButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        aimDiffButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        aimDifficulty = btn.dataset.diff || "easy";
        playSound(clickSfx);
    });
});

if (aimDurationInput) {
    aimDurationInput.addEventListener("change", () => {
        const v = Number(aimDurationInput.value);
        if (isNaN(v) || v < 5 || v > 60) {
            if (aimStatus) aimStatus.textContent = "Duration must be between 5 and 60 seconds.";
            return;
        }
        aimDuration = v;
    });
}

function spawnAimTarget() {
    if (!aimRunning || !aimArea) return;

    aimArea.innerHTML = "";
    const rect = aimArea.getBoundingClientRect();
    const size = 34;
    const padding = 10;

    const maxX = rect.width - size - padding;
    const maxY = rect.height - size - padding;

    const x = padding + Math.random() * maxX;
    const y = padding + Math.random() * maxY;

    const target = document.createElement("div");
    target.classList.add("aim-target");
    target.style.left = `${x}px`;
    target.style.top = `${y}px`;

    target.addEventListener("click", (e) => {
        e.stopPropagation();
        aimHits++;
        if (aimScoreLabel) aimScoreLabel.textContent = `Score: ${aimHits} hits, ${aimMisses} misses`;
        playSound(clickSfx);
    });

    aimArea.appendChild(target);
}

if (aimArea) {
    aimArea.addEventListener("click", (e) => {
        if (!aimRunning) return;
        if (!e.target.classList.contains("aim-target")) {
            aimMisses++;
            if (aimScoreLabel) aimScoreLabel.textContent = `Score: ${aimHits} hits, ${aimMisses} misses`;
        }
    });
}

function endAimTrainer() {
    aimRunning = false;
    if (aimTimer) clearInterval(aimTimer);
    if (aimSpawnTimer) clearInterval(aimSpawnTimer);
    aimTimer = null;
    aimSpawnTimer = null;

    if (aimStatus) aimStatus.textContent = `Round over — ${aimHits} hits, ${aimMisses} misses.`;
    setActiveGameCard(null);

    if (aimHits > aimBestHits) {
        aimBestHits = aimHits;
        saveToStorage("vp_aimBestHits", aimBestHits);
    }

    updateAimBestDisplay();
    updateStatsPanel();

    if (aimArea) {
        aimArea.innerHTML = "";
        const p = document.createElement("p");
        p.classList.add("aim-placeholder");
        p.textContent = 'Press "Start Aim Trainer" to begin. Click the targets when they appear!';
        aimArea.appendChild(p);
    }
}

if (aimStartButton && aimArea) {
    aimStartButton.addEventListener("click", () => {
        if (aimRunning) return;

        aimRunning = true;
        aimHits = 0;
        aimMisses = 0;
        aimTimeLeft = aimDuration || 20;

        if (aimScoreLabel) aimScoreLabel.textContent = `Score: 0 hits, 0 misses`;
        if (aimStatus) aimStatus.textContent = `Time left: ${aimTimeLeft}s`;

        setActiveGameCard(aimTrainerCard);
        playSound(startFanSfx || clickSfx);

        aimArea.innerHTML = "";

        let interval = 1000;
        if (aimDifficulty === "normal") interval = 800;
        if (aimDifficulty === "hard") interval = 650;

        spawnAimTarget();
        aimSpawnTimer = setInterval(spawnAimTarget, interval);

        aimTimer = setInterval(() => {
            aimTimeLeft--;
            if (aimStatus) aimStatus.textContent = `Time left: ${aimTimeLeft}s`;
            if (aimTimeLeft <= 0) {
                clearInterval(aimTimer);
                endAimTrainer();
            }
        }, 1000);
    });
}

// ============================================
// STATS PANEL
// ============================================
function updateStatsPanel() {
    updateClickBestDisplay();
    updateRunnerBestDisplay();
    updateReactionBestDisplay();
    updateAimBestDisplay();
}

if (resetStatsButton) {
    resetStatsButton.addEventListener("click", () => {
        const ok = confirm("Reset all best scores for all games?");
        if (!ok) return;

        localStorage.removeItem("vp_clickBest");
        localStorage.removeItem("vp_runnerBestTime");
        localStorage.removeItem("vp_runnerBestDist");
        localStorage.removeItem("vp_reactionBestMs");
        localStorage.removeItem("vp_aimBestHits");

        bestClickScore = 0;
        bestClickDuration = 5;
        runnerBestTime = 0;
        runnerBestDist = 0;
        bestReactionMs = null;
        aimBestHits = 0;

        updateClickBestDisplay();
        updateRunnerBestDisplay();
        updateReactionBestDisplay();
        updateAimBestDisplay();
        playSound(whooshSfx || clickSfx);
    });
}

// Initial stats sync
updateStatsPanel();