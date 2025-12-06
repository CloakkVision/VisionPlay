// ===== BASIC ELEMENTS =====
const body = document.body;

// Buttons and text elements
const colorButton = document.getElementById("colorButton");
const titleButton = document.getElementById("titleButton");
const fontButton = document.getElementById("fontButton");
const title = document.getElementById("title");

// Theme selector
const themeSelect = document.getElementById("themeSelect");
const soundToggleButton = document.getElementById("soundToggleButton");

// Stats elements
const statsClickBest = document.getElementById("statsClickBest");
const statsRunnerBest = document.getElementById("statsRunnerBest");
const statsReactionBest = document.getElementById("statsReactionBest");
const resetStatsButton = document.getElementById("resetStatsButton");

// Navigation
const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");
const navLinks = document.querySelectorAll(".nav-link");

// Game card sections (for active glow)
const clickRaceCard = document.getElementById("clickRaceSection");
const jumpRunnerCard = document.getElementById("jumpRunnerSection");
const reactionCard = document.getElementById("reactionSection");

// Badges for Jump Runner
const runnerModeBadge = document.getElementById("runnerModeBadge");
const runnerDiffBadge = document.getElementById("runnerDiffBadge");
const runnerLivesBadge = document.getElementById("runnerLivesBadge");

// ===== LOCAL STORAGE HELPERS =====
function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        // ignore if blocked
    }
}

function loadFromStorage(key, defaultValue) {
    try {
        const raw = localStorage.getItem(key);
        if (raw === null) return defaultValue;
        return JSON.parse(raw);
    } catch (e) {
        return defaultValue;
    }
}

// ===== SOUND EFFECTS =====
let clickSfx,
    jumpSfx,
    hitSfx,
    gameOverSfx,
    bgMusic,
    diffSelectSfx,
    whooshSfx,
    perfectSfx,
    hoverSfx,
    startFanSfx;

let soundEnabled = true;

try {
    clickSfx      = new Audio("click.mp3");
    jumpSfx       = new Audio("jump.mp3");
    hitSfx        = new Audio("hit.mp3");
    gameOverSfx   = new Audio("gameover.mp3");
    bgMusic       = new Audio("bgmusic.mp3");
    diffSelectSfx = new Audio("diffselect.mp3");
    whooshSfx     = new Audio("whoosh.mp3");
    perfectSfx    = new Audio("perfect.mp3");
    hoverSfx      = new Audio("hover.mp3");
    startFanSfx   = new Audio("startfan.mp3");

    if (bgMusic) {
        bgMusic.loop = true;
        bgMusic.volume = 0.25;
    }
} catch (e) {
    // ignore
}

function playSound(sfx) {
    if (!soundEnabled) return;
    if (!sfx || !sfx.play) return;
    try {
        sfx.currentTime = 0;
        sfx.play();
    } catch (e) {
        // ignore
    }
}

// Sound toggle WITH background music resume
if (soundToggleButton) {
    soundToggleButton.addEventListener("click", () => {
        // Play click before toggling so you hear it
        if (soundEnabled) {
            playSound(clickSfx);
        }

        // Flip the mute state
        soundEnabled = !soundEnabled;
        soundToggleButton.textContent = soundEnabled ? "Sound: On" : "Sound: Off";
        soundToggleButton.classList.toggle("muted", !soundEnabled);
        soundToggleButton.setAttribute("aria-pressed", soundEnabled ? "false" : "true");

        // If turning sound OFF -> pause music
        if (!soundEnabled && bgMusic) {
            bgMusic.pause();
        }

        // If turning sound ON -> resume music
        if (soundEnabled && bgMusic) {
            bgMusic.play().catch(() => {
                // ignore autoplay errors
            });
        }
    });
}

// ===== ACTIVE GAME CARD GLOW =====
function setActiveGameCard(card) {
    [clickRaceCard, jumpRunnerCard, reactionCard].forEach(c => {
        if (!c) return;
        c.classList.remove("active-game");
    });
    if (card) {
        card.classList.add("active-game");
    }
}

// ===== NAV BEHAVIOR =====
if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
        const isOpen = navMenu.classList.toggle("open");
        playSound(clickSfx);
        navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
}

navLinks.forEach(link => {
    link.addEventListener("click", () => {
        if (navMenu && navMenu.classList.contains("open")) {
            navMenu.classList.remove("open");
        }
        playSound(clickSfx);
    });

    link.addEventListener("mouseenter", () => {
        playSound(hoverSfx);
    });
});

// ===== ACCENT COLOR CYCLER =====
const accentColors = ["#4c6fff", "#ec4899", "#22c55e", "#eab308", "#f97316"];
let accentIndex = 0;

function applyAccentColor() {
    const color = accentColors[accentIndex];
    document.documentElement.style.setProperty("--accent-color", color);
}

function changeAccentColor() {
    accentIndex = (accentIndex + 1) % accentColors.length;
    applyAccentColor();
}

if (colorButton) {
    colorButton.addEventListener("click", () => {
        changeAccentColor();
        playSound(clickSfx);
    });
}

applyAccentColor();

// ===== TITLE TOGGLE + TYPEWRITER =====
const originalTitleText = "Welcome to VisionPlay";
const altTitleText = "A tiny web arcade with games and random facts.";
let showingOriginalTitle = true;
let typewriterHasRun = false;

function runTypewriterOnce() {
    if (typewriterHasRun) return;
    typewriterHasRun = true;

    const text = originalTitleText;
    title.textContent = "";
    let index = 0;

    const interval = setInterval(() => {
        title.textContent += text[index];
        index++;
        if (index >= text.length) {
            clearInterval(interval);
        }
    }, 80);
}

function toggleTitle() {
    playSound(clickSfx);
    if (showingOriginalTitle) {
        title.textContent = altTitleText;
        showingOriginalTitle = false;
    } else {
        title.textContent = originalTitleText;
        showingOriginalTitle = true;
    }
}

if (titleButton) {
    titleButton.addEventListener("click", toggleTitle);
}

runTypewriterOnce();

// ===== FONT CYCLER =====
const fonts = [
    "Arial, sans-serif",
    "Verdana, sans-serif",
    "Georgia, serif",
    "'Courier New', monospace"
];
let fontIndex = 0;

function changeFont() {
    fontIndex = (fontIndex + 1) % fonts.length;
    body.style.fontFamily = fonts[fontIndex];
}

if (fontButton) {
    fontButton.addEventListener("click", () => {
        changeFont();
        playSound(clickSfx);
    });
}

// ===== THEME SWITCHER =====
function applyTheme(name) {
    body.classList.remove("theme-dark", "theme-light", "theme-neon");
    body.classList.add(`theme-${name}`);
}

const storedTheme = loadFromStorage("vp_theme", "dark");

if (themeSelect) {
    themeSelect.value = storedTheme;
    applyTheme(storedTheme);

    themeSelect.addEventListener("change", (event) => {
        const t = event.target.value;
        applyTheme(t);
        saveToStorage("vp_theme", t);
        playSound(clickSfx);
    });
} else {
    applyTheme(storedTheme);
}

// ===== RANDOM FACTS =====
const factText = document.getElementById("factText");

const worldFacts = [
    "Honey never spoils.",
    "Bananas are berries, but strawberries aren't.",
    "There are more stars in the universe than grains of sand on Earth.",
    "The Eiffel Tower can grow taller in summer because metal expands when it's hot.",
    "A single bolt of lightning can heat the air to five times hotter than the surface of the sun.",
    "Some deserts, like the Arctic, are cold deserts because they get very little rain.",
    "New Zealand was the first country to give women the right to vote in 1893."
];

const animalFacts = [
    "Octopuses have three hearts and blue blood.",
    "Cows have best friends and can get stressed when they are separated.",
    "A group of flamingos is called a 'flamboyance'.",
    "Some turtles can breathe through their butts when they hibernate underwater.",
    "Sloths move so slowly that algae can grow on their fur.",
    "A shrimp's heart is located in its head.",
    "Elephants can recognize themselves in a mirror, which is a sign of intelligence."
];

const spaceFacts = [
    "In space, astronauts can grow a little taller because their spine stretches without gravity.",
    "Space is completely silent because there is no air to carry sound.",
    "Neutron stars can spin hundreds of times per second.",
    "Venus spins in the opposite direction to Earth.",
    "One day on Venus is longer than one year on Venus.",
    "Jupiter is so big that more than 1,300 Earths could fit inside it.",
    "The footprints left on the Moon could stay there for millions of years because there is no wind."
];

const gameFacts = [
    "The first commercially successful video game was Pong, released in 1972.",
    "Minecraft is one of the best-selling video games of all time.",
    "Speedrunners try to beat games as fast as possible, often using glitches.",
    "Tetris has been ported to almost every gaming platform ever created.",
    "The original name for Pac-Man was 'Puck-Man' in Japan.",
    "Some games secretly change difficulty in the background to keep players engaged.",
    "Game controllers used to only have a few buttons; now they can have more than 15 controls."
];

const techFacts = [
    "The first computer mouse was made of wood.",
    "Around 90% of the world’s data has been created in just the last few years.",
    "The word 'robot' comes from a Czech word meaning 'forced labor'.",
    "The first 1GB hard drive, released in 1980, weighed over 200 kilograms.",
    "More people in the world own a mobile phone than a toothbrush.",
    "The first website went online in 1991 and is still accessible.",
    "Computer viruses have existed since the 1980s."
];

const historyFacts = [
    "Ancient Egyptians used hieroglyphs over 5,000 years ago.",
    "The Great Wall of China is more than 20,000 kilometers long.",
    "The shortest war in history lasted about 38 minutes (Anglo-Zanzibar War in 1896).",
    "In ancient Rome, people cleaned clothes using urine because of the ammonia.",
    "Some medieval castles had secret passages for escape during attacks.",
    "The first Olympic Games took place in ancient Greece over 2,700 years ago.",
    "The Titanic was considered 'unsinkable' before it sank in 1912."
];

if (factText) {
    document.querySelectorAll(".fact-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            playSound(clickSfx);

            const type = btn.dataset.type;
            let list = null;

            if (type === "world")   list = worldFacts;
            if (type === "animal")  list = animalFacts;
            if (type === "space")   list = spaceFacts;
            if (type === "game")    list = gameFacts;
            if (type === "tech")    list = techFacts;
            if (type === "history") list = historyFacts;

            if (!list || list.length === 0) return;

            const index = Math.floor(Math.random() * list.length);
            factText.textContent = list[index];
        });
    });
}

// ===== MINI GAME 1: CLICK RACE =====
const gameStartButton = document.getElementById("gameStartButton");
const gameClickButton = document.getElementById("gameClickButton");
const gameStatus = document.getElementById("gameStatus");
const gameDurationInput = document.getElementById("gameDurationInput");
const timePresetButtons = document.querySelectorAll(".time-preset-btn");
const gameTimerLabel = document.getElementById("gameTimerLabel");

// Load best click stats from storage
let bestClickScore = 0;
let bestClickDurationSeconds = 5;
let gameDurationSeconds = 5;

const storedClick = loadFromStorage("vp_clickBest", null);
if (storedClick && typeof storedClick.score === "number" && typeof storedClick.duration === "number") {
    bestClickScore = storedClick.score;
    bestClickDurationSeconds = storedClick.duration;
}

function getClickRank(score) {
    if (score >= 60) return "Rank: Machine";
    if (score >= 40) return "Rank: Lightning";
    if (score >= 25) return "Rank: Fast";
    if (score >= 10) return "Rank: Warming up";
    return "Rank: Beginner";
}

if (gameStartButton && gameClickButton && gameStatus) {
    let gameActive = false;
    let clickCount = 0;
    let gameTimerId = null;
    let gameCountdownInterval = null;
    let gameStartTime = 0;

    function updateClickStats() {
        const durationForBest = bestClickDurationSeconds || gameDurationSeconds || 1;
        const bestCps = (bestClickScore / durationForBest).toFixed(1);

        if (statsClickBest) {
            statsClickBest.textContent =
                `Best Click Race score: ${bestClickScore} clicks (${bestCps} cps over ${durationForBest}s)`;
        }
    }

    function applyDuration(seconds) {
        gameDurationSeconds = seconds;

        timePresetButtons.forEach(btn => {
            const btnValue = parseInt(btn.dataset.seconds, 10);
            const isActive = btnValue === gameDurationSeconds;
            btn.classList.toggle("active", isActive);
        });

        if (gameDurationInput) {
            gameDurationInput.value = gameDurationSeconds;
        }

        gameStatus.textContent =
            `Round length set to ${gameDurationSeconds} seconds. Press "Start game" to begin.`;

        if (gameTimerLabel) {
            gameTimerLabel.textContent = `Time left: ${gameDurationSeconds.toFixed(1)}s`;
        }

        updateClickStats();
    }

    function startClickRace() {
        if (gameActive) return;

        playSound(startFanSfx || clickSfx);
        setActiveGameCard(clickRaceCard);

        gameActive = true;
        clickCount = 0;
        gameStatus.textContent = "Game started! Click the button as fast as you can!";
        gameClickButton.disabled = false;

        if (gameTimerId) clearTimeout(gameTimerId);
        if (gameCountdownInterval) clearInterval(gameCountdownInterval);

        gameStartTime = Date.now();

        if (gameTimerLabel) {
            gameTimerLabel.textContent = `Time left: ${gameDurationSeconds.toFixed(1)}s`;
        }

        // Live countdown
        gameCountdownInterval = setInterval(() => {
            if (!gameActive) {
                clearInterval(gameCountdownInterval);
                return;
            }
            const elapsed = (Date.now() - gameStartTime) / 1000;
            const remaining = Math.max(0, gameDurationSeconds - elapsed);
            if (gameTimerLabel) {
                gameTimerLabel.textContent = `Time left: ${remaining.toFixed(1)}s`;
            }
            if (remaining <= 0) {
                clearInterval(gameCountdownInterval);
            }
        }, 100);

        // End-of-round
        gameTimerId = setTimeout(() => {
            gameActive = false;
            gameClickButton.disabled = true;
            setActiveGameCard(null);

            if (gameCountdownInterval) clearInterval(gameCountdownInterval);
            if (gameTimerLabel) {
                gameTimerLabel.textContent = "Time left: 0.0s";
            }

            const cps = gameDurationSeconds > 0
                ? (clickCount / gameDurationSeconds).toFixed(1)
                : "0.0";
            const rank = getClickRank(clickCount);

            gameStatus.textContent =
                `Time's up! You clicked ${clickCount} times (${cps} clicks/sec). ${rank}`;

            if (clickCount > bestClickScore) {
                bestClickScore = clickCount;
                bestClickDurationSeconds = gameDurationSeconds;
                saveToStorage("vp_clickBest", {
                    score: bestClickScore,
                    duration: bestClickDurationSeconds
                });
                updateClickStats();
            }

            playSound(gameOverSfx);
        }, gameDurationSeconds * 1000);
    }

    function handleClickRaceClick() {
        if (!gameActive) return;
        clickCount++;
        gameStatus.textContent = `Clicks: ${clickCount}`;
        playSound(clickSfx);
    }

    // Wire buttons
    gameStartButton.addEventListener("click", startClickRace);
    gameClickButton.addEventListener("click", handleClickRaceClick);

    // Preset time buttons
    timePresetButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const seconds = parseInt(btn.dataset.seconds, 10);
            if (!isNaN(seconds)) {
                playSound(clickSfx);
                applyDuration(seconds);
            }
        });

        btn.addEventListener("mouseenter", () => {
            playSound(hoverSfx);
        });
    });

    // Custom duration input
    if (gameDurationInput) {
        gameDurationInput.addEventListener("change", () => {
            let value = parseInt(gameDurationInput.value, 10);
            if (isNaN(value)) value = 5;
            if (value < 3) value = 3;
            if (value > 60) value = 60;

            playSound(clickSfx);
            gameDurationSeconds = value;
            timePresetButtons.forEach(btn => btn.classList.remove("active"));
            gameDurationInput.value = value;
            gameStatus.textContent =
                `Custom round length set to ${gameDurationSeconds} seconds. Press "Start game" to begin.`;

            if (gameTimerLabel) {
                gameTimerLabel.textContent = `Time left: ${gameDurationSeconds.toFixed(1)}s`;
            }

            updateClickStats();
        });

        gameDurationInput.value = gameDurationSeconds;
    }

    applyDuration(gameDurationSeconds);
    updateClickStats();
}

// ===== MINI GAME 2: JUMP RUNNER =====
const runnerStartButton = document.getElementById("runnerStartButton");
const runnerArea = document.getElementById("runnerArea");
const runnerCharacter = document.getElementById("runnerCharacter");
const runnerObstacle = document.getElementById("runnerObstacle");
const runnerStatus = document.getElementById("runnerStatus");
const runnerScoreElement = document.getElementById("runnerScore");
const runnerBestElement = document.getElementById("runnerBest");

const runnerOverlay = document.getElementById("runnerOverlay");
const runnerOverlayMessage = document.getElementById("runnerOverlayMessage");
const runnerOverlayReplay = document.getElementById("runnerOverlayReplay");

const runnerModeButtons = document.querySelectorAll(".runner-mode-btn");
const diffButtons = document.querySelectorAll(".difficulty-btn");

// Load runner best from storage
let runnerBestTime = loadFromStorage("vp_runnerBestTime", 0);
let difficulty = "normal";
let runnerMode = "endless"; // "endless" or "goal"

const difficultySettings = {
    easy:   { obstacleSpeed: "2.2s", jumpHeight: 95, jumpDuration: 650, lives: 5 },
    normal: { obstacleSpeed: "1.6s", jumpHeight: 80, jumpDuration: 550, lives: 3 },
    hard:   { obstacleSpeed: "1.2s", jumpHeight: 70, jumpDuration: 450, lives: 1 }
};

let runnerActive = false;
let runnerStartTime = 0;
let runnerCollisionInterval = null;
let runnerTimerInterval = null;
let isJumping = false;
let runnerLives = 3;

const RUNNER_SPEED_METERS_PER_SEC = 5;
const GOAL_DISTANCE = 250;

function livesToHearts(lives) {
    const safeLives = Math.max(0, lives);
    return "Lives: " + "♥".repeat(safeLives || 0);
}

function updateRunnerBestDisplay() {
    const bestDistance = runnerBestTime * RUNNER_SPEED_METERS_PER_SEC;

    if (runnerBestElement) {
        runnerBestElement.textContent =
            `Best time: ${runnerBestTime}s (Distance: ${bestDistance} m)`;
    }
    if (statsRunnerBest) {
        statsRunnerBest.textContent =
            `Best Jump Runner: ${runnerBestTime}s, ${bestDistance} m`;
    }
}

updateRunnerBestDisplay();

function startRunnerGame() {
    if (!runnerArea || !runnerCharacter || !runnerObstacle || !runnerStatus) return;
    if (runnerActive) return;

    playSound(startFanSfx || clickSfx);
    setActiveGameCard(jumpRunnerCard);

    if (runnerOverlay) {
        runnerOverlay.style.display = "none";
    }

    const settings = difficultySettings[difficulty] || difficultySettings.normal;

    runnerActive = true;
    runnerLives = settings.lives;
    runnerStartTime = Date.now();
    runnerStatus.textContent =
        `Game started! Mode: ${runnerMode}. Lives: ${runnerLives}. Difficulty: ${difficulty}. Press spacebar or click to jump.`;

    if (runnerScoreElement) {
        runnerScoreElement.textContent = "Distance: 0 m";
    }
    if (runnerLivesBadge) {
        runnerLivesBadge.textContent = livesToHearts(runnerLives);
    }

    runnerObstacle.style.animation =
        `runner-obstacle-move ${settings.obstacleSpeed} linear infinite`;

    if (runnerCollisionInterval) clearInterval(runnerCollisionInterval);
    runnerCollisionInterval = setInterval(checkRunnerCollision, 40);

    if (runnerTimerInterval) clearInterval(runnerTimerInterval);
    runnerTimerInterval = setInterval(updateRunnerTime, 500);

    if (bgMusic && soundEnabled) {
        bgMusic.play().catch(() => {});
    }
}

function endRunnerGame(message) {
    runnerActive = false;
    setActiveGameCard(null);

    if (runnerObstacle) {
        runnerObstacle.style.animation = "none";
    }

    if (runnerCollisionInterval) clearInterval(runnerCollisionInterval);
    if (runnerTimerInterval) clearInterval(runnerTimerInterval);

    if (runnerStatus) {
        runnerStatus.textContent = message;
    }

    if (runnerOverlay && runnerOverlayMessage) {
        runnerOverlayMessage.textContent = message;
        runnerOverlay.style.display = "flex";
    }

    playSound(gameOverSfx);
}

function updateRunnerTime() {
    if (!runnerActive) return;
    const seconds = Math.floor((Date.now() - runnerStartTime) / 1000);
    const distance = seconds * RUNNER_SPEED_METERS_PER_SEC;

    if (runnerMode === "goal" && distance >= GOAL_DISTANCE) {
        if (seconds > runnerBestTime) {
            runnerBestTime = seconds;
            saveToStorage("vp_runnerBestTime", runnerBestTime);
            updateRunnerBestDisplay();
        }

        endRunnerGame(
            `You reached the finish! ${distance} m in ${seconds}s on ${difficulty} (Mode: Goal).`
        );
        return;
    }

    if (runnerStatus) {
        runnerStatus.textContent =
            `Time survived: ${seconds}s | Lives: ${runnerLives} | Mode: ${runnerMode} | Difficulty: ${difficulty}`;
    }

    if (runnerScoreElement) {
        runnerScoreElement.textContent = `Distance: ${distance} m`;
    }

    if (seconds > 0 && seconds % 15 === 0) {
        playSound(perfectSfx);
    }
}

function resetObstacle() {
    if (!runnerObstacle) return;
    const settings = difficultySettings[difficulty] || difficultySettings.normal;

    runnerObstacle.style.animation = "none";
    void runnerObstacle.offsetWidth;
    runnerObstacle.style.animation =
        `runner-obstacle-move ${settings.obstacleSpeed} linear infinite`;

    playSound(whooshSfx);
}

function checkRunnerCollision() {
    if (!runnerActive) return;
    if (!runnerCharacter || !runnerObstacle) return;

    const charRect = runnerCharacter.getBoundingClientRect();
    const obsRect = runnerObstacle.getBoundingClientRect();

    const charSafe = {
        left: charRect.left + 4,
        right: charRect.right - 4,
        top: charRect.top + 4,
        bottom: charRect.bottom - 2
    };

    const obsSafe = {
        left: obsRect.left + 4,
        right: obsRect.right - 4,
        top: obsRect.top + 4,
        bottom: obsRect.bottom - 2
    };

    const noOverlap =
        charSafe.right < obsSafe.left ||
        charSafe.left > obsSafe.right ||
        charSafe.bottom < obsSafe.top ||
        charSafe.top > obsSafe.bottom;

    if (!noOverlap) {
        runnerLives -= 1;
        if (runnerLivesBadge) {
            runnerLivesBadge.textContent = livesToHearts(Math.max(runnerLives, 0));
        }

        if (runnerLives <= 0) {
            const seconds = Math.floor((Date.now() - runnerStartTime) / 1000);
            const distance = seconds * RUNNER_SPEED_METERS_PER_SEC;

            if (seconds > runnerBestTime) {
                runnerBestTime = seconds;
                saveToStorage("vp_runnerBestTime", runnerBestTime);
                updateRunnerBestDisplay();
            }

            endRunnerGame(
                `Game over! You survived ${seconds}s and ran ${distance} m on ${difficulty} (Mode: ${runnerMode}).`
            );
        } else {
            if (runnerStatus) {
                runnerStatus.textContent =
                    `Ouch! You got hit. Lives left: ${runnerLives} | Mode: ${runnerMode} | Difficulty: ${difficulty}`;
            }
            playSound(hitSfx);
            resetObstacle();
        }
    }
}

// Jump – always allowed
function jump() {
    if (isJumping) return;
    if (!runnerCharacter) return;

    isJumping = true;

    const settings = difficultySettings[difficulty] || difficultySettings.normal;
    runnerCharacter.style.setProperty("--jump-height", settings.jumpHeight + "px");
    runnerCharacter.style.setProperty("--jump-duration", settings.jumpDuration + "ms");

    runnerCharacter.classList.add("jump");
    playSound(jumpSfx);

    setTimeout(() => {
        runnerCharacter.classList.remove("jump");
        isJumping = false;
    }, settings.jumpDuration);
}

// Difficulty buttons
function setDifficulty(newDiff) {
    difficulty = newDiff || "normal";
    const settings = difficultySettings[difficulty] || difficultySettings.normal;

    if (runnerStatus) {
        runnerStatus.textContent =
            `Difficulty set to: ${difficulty} (Lives: ${settings.lives}). Mode: ${runnerMode}. Press "Start runner game" to play.`;
    }

    diffButtons.forEach(btn => {
        const isActive = btn.dataset.diff === difficulty;
        btn.classList.toggle("active", isActive);
    });

    if (runnerDiffBadge) {
        runnerDiffBadge.textContent =
            `Difficulty: ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`;
        runnerDiffBadge.classList.remove("badge-diff-easy", "badge-diff-normal", "badge-diff-hard");
        runnerDiffBadge.classList.add("badge-diff-" + difficulty);
    }

    if (runnerLivesBadge) {
        runnerLivesBadge.textContent = livesToHearts(settings.lives);
    }

    playSound(diffSelectSfx);
}

diffButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        setDifficulty(btn.dataset.diff);
    });

    btn.addEventListener("mouseenter", () => {
        playSound(hoverSfx);
    });
});

// Runner mode buttons
function setRunnerMode(newMode) {
    runnerMode = newMode || "endless";

    runnerModeButtons.forEach(btn => {
        const isActive = btn.dataset.mode === runnerMode;
        btn.classList.toggle("active", isActive);
    });

    if (runnerStatus) {
        runnerStatus.textContent =
            `Mode set to: ${runnerMode}. Press "Start runner game" to play.`;
    }

    if (runnerModeBadge) {
        const label = runnerMode === "endless" ? "Endless" : "Goal (250m)";
        runnerModeBadge.textContent = `Mode: ${label}`;
    }
}

runnerModeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const mode = btn.dataset.mode;
        if (mode === "endless" || mode === "goal") {
            playSound(clickSfx);
            setRunnerMode(mode);
        }
    });

    btn.addEventListener("mouseenter", () => {
        playSound(hoverSfx);
    });
});

// Initial mode + difficulty
setDifficulty(difficulty);
setRunnerMode(runnerMode);

// Wire Runner buttons and area
if (runnerStartButton) {
    runnerStartButton.addEventListener("click", startRunnerGame);
}

if (runnerArea) {
    runnerArea.addEventListener("click", () => {
        jump();
    });
}

if (runnerOverlayReplay) {
    runnerOverlayReplay.addEventListener("click", () => {
        playSound(clickSfx);
        if (runnerOverlay) {
            runnerOverlay.style.display = "none";
        }
        startRunnerGame();
    });
}

// Keyboard controls (SPACE + B/T/F)
document.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();

    if (event.code === "Space") {
        event.preventDefault();
        jump();
        return;
    }

    if (key === "b") {
        changeAccentColor();
    } else if (key === "t") {
        toggleTitle();
    } else if (key === "f") {
        changeFont();
    }
});

// ===== MINI GAME 3: REACTION TEST =====
const reactionStartButton = document.getElementById("reactionStartButton");
const reactionArea = document.getElementById("reactionArea");
const reactionPrompt = document.getElementById("reactionPrompt");
const reactionStatus = document.getElementById("reactionStatus");
const reactionBestElement = document.getElementById("reactionBest");
const reactionModeButtons = document.querySelectorAll(".reaction-mode-btn");

let reactionMode = "classic";        // "classic" | "average" | "hard"
let reactionState = "idle";          // "idle" | "waiting" | "ready"
let reactionTimeoutId = null;
let reactionStartTime = 0;
let reactionTimes = [];              // used in average mode
let reactionBestMs = loadFromStorage("vp_reactionBestMs", null); // lowest reaction time (ms)

function setReactionMode(newMode) {
    reactionMode = newMode;

    reactionModeButtons.forEach(btn => {
        const isActive = btn.dataset.mode === reactionMode;
        btn.classList.toggle("active", isActive);
    });

    let modeText = "";
    if (reactionMode === "classic") {
        modeText = "Classic. Wait for green, then click as fast as you can.";
    } else if (reactionMode === "average") {
        modeText = "Average (5). React 5 times, then see your average.";
    } else if (reactionMode === "hard") {
        modeText = "Hard. If you click too early or react too slowly, you fail.";
    }

    if (reactionStatus) {
        reactionStatus.textContent = `Mode: ${modeText}`;
    }
    if (reactionPrompt) {
        reactionPrompt.textContent = "Press Start to begin.";
    }
    setReactionVisualState("idle");
}

function setReactionVisualState(state) {
    if (!reactionArea) return;

    reactionArea.classList.remove("reaction-idle", "reaction-waiting", "reaction-ready");

    if (state === "idle") {
        reactionArea.classList.add("reaction-idle");
    } else if (state === "waiting") {
        reactionArea.classList.add("reaction-waiting");
    } else if (state === "ready") {
        reactionArea.classList.add("reaction-ready");
    }

    reactionState = state;
}

function formatMs(ms) {
    return `${ms} ms`;
}

function updateReactionBest(ms) {
    if (reactionBestMs === null || ms < reactionBestMs) {
        reactionBestMs = ms;
        saveToStorage("vp_reactionBestMs", reactionBestMs);

        if (reactionBestElement) {
            reactionBestElement.textContent = `Best reaction: ${formatMs(reactionBestMs)}`;
        }
        if (statsReactionBest) {
            statsReactionBest.textContent = `Best Reaction: ${formatMs(reactionBestMs)}`;
        }

        playSound(perfectSfx);
    }
}

// If we already had a best reaction saved, show it
if (reactionBestMs !== null) {
    if (reactionBestElement) {
        reactionBestElement.textContent = `Best reaction: ${formatMs(reactionBestMs)}`;
    }
    if (statsReactionBest) {
        statsReactionBest.textContent = `Best Reaction: ${formatMs(reactionBestMs)}`;
    }
}

function scheduleReactionTrial() {
    if (!reactionArea || !reactionPrompt || !reactionStatus) return;

    setReactionVisualState("waiting");
    reactionPrompt.textContent = "Wait for green...";
    reactionStatus.textContent = "Don't click yet.";

    let minDelay, maxDelay;
    if (reactionMode === "hard") {
        minDelay = 700;
        maxDelay = 2500;
    } else {
        minDelay = 1000;
        maxDelay = 3000;
    }

    const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;

    if (reactionTimeoutId) clearTimeout(reactionTimeoutId);

    reactionTimeoutId = setTimeout(() => {
        setReactionVisualState("ready");
        reactionPrompt.textContent = "CLICK!";
        reactionStatus.textContent = "Now!";
        reactionStartTime = performance.now();
        playSound(clickSfx);
    }, delay);
}

function startReactionTest() {
    if (!reactionArea || !reactionPrompt || !reactionStatus) return;

    if (reactionTimeoutId) clearTimeout(reactionTimeoutId);
    reactionTimes = [];

    playSound(startFanSfx || clickSfx);
    setActiveGameCard(reactionCard);

    if (reactionMode === "average") {
        reactionStatus.textContent = "Average mode: Round 1 of 5. Wait for green.";
    } else {
        reactionStatus.textContent = "Get ready. Wait for green.";
    }

    setReactionVisualState("waiting");
    scheduleReactionTrial();
}

function handleReactionClick() {
    if (!reactionArea || !reactionPrompt || !reactionStatus) return;
    if (reactionState === "idle") return;

    const now = performance.now();

    // Early click
    if (reactionState === "waiting") {
        playSound(hitSfx);

        if (reactionMode === "hard") {
            setReactionVisualState("idle");
            if (reactionTimeoutId) clearTimeout(reactionTimeoutId);
            setActiveGameCard(null);
            reactionStatus.textContent = "Too early! Hard mode failed. Press Start to try again.";
            reactionPrompt.textContent = "Press Start to try again.";
        } else {
            setReactionVisualState("idle");
            if (reactionTimeoutId) clearTimeout(reactionTimeoutId);
            setActiveGameCard(null);
            reactionStatus.textContent = "Too early! Only click when it turns green. Press Start to retry.";
            reactionPrompt.textContent = "Press Start to try again.";
        }
        return;
    }

    // Correct time
    if (reactionState === "ready") {
        const ms = Math.round(now - reactionStartTime);
        playSound(clickSfx);
        setReactionVisualState("idle");

        if (reactionMode === "classic" || reactionMode === "hard") {
            if (reactionMode === "hard" && ms > 300) {
                playSound(gameOverSfx);
                reactionStatus.textContent =
                    `Too slow for Hard mode! You reacted in ${formatMs(ms)} (need under 300 ms).`;
                reactionPrompt.textContent = "Press Start to try again.";
                setActiveGameCard(null);
            } else {
                reactionStatus.textContent = `Your reaction time: ${formatMs(ms)}.`;
                reactionPrompt.textContent = "Press Start to play again.";
                updateReactionBest(ms);
                setActiveGameCard(null);
            }
        } else if (reactionMode === "average") {
            reactionTimes.push(ms);
            const roundsTotal = 5;

            if (reactionTimes.length < roundsTotal) {
                const nextRound = reactionTimes.length + 1;
                reactionStatus.textContent =
                    `Round ${reactionTimes.length} of ${roundsTotal}: ${formatMs(ms)}. Get ready for round ${nextRound}.`;
                scheduleReactionTrial();
            } else {
                const sum = reactionTimes.reduce((a, b) => a + b, 0);
                const avg = Math.round(sum / reactionTimes.length);
                reactionStatus.textContent =
                    `All 5 rounds done! Times: ${reactionTimes.map(formatMs).join(", ")}. Average: ${formatMs(avg)}.`;
                reactionPrompt.textContent = "Press Start to play again.";
                updateReactionBest(avg);
                setActiveGameCard(null);
            }
        }

        return;
    }
}

// Wire Reaction Test listeners
if (reactionStartButton && reactionArea && reactionPrompt && reactionStatus) {
    reactionStartButton.addEventListener("click", () => {
        startReactionTest();
    });

    reactionArea.addEventListener("click", () => {
        handleReactionClick();
    });

    reactionModeButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const mode = btn.dataset.mode;
            if (!mode) return;
            playSound(clickSfx);
            setReactionMode(mode);
        });

        btn.addEventListener("mouseenter", () => {
            playSound(hoverSfx);
        });
    });

    setReactionMode(reactionMode);
}

// ===== RESET STATS BUTTON (with confirmation) =====
if (resetStatsButton) {
    resetStatsButton.addEventListener("click", () => {
        const ok = confirm("Reset all best scores? This cannot be undone.");
        if (!ok) {
            playSound(hitSfx);
            return;
        }

        bestClickScore = 0;
        bestClickDurationSeconds = 5;
        runnerBestTime = 0;
        reactionBestMs = null;

        saveToStorage("vp_clickBest", { score: bestClickScore, duration: bestClickDurationSeconds });
        saveToStorage("vp_runnerBestTime", runnerBestTime);
        saveToStorage("vp_reactionBestMs", reactionBestMs);

        if (statsClickBest) {
            statsClickBest.textContent = "Best Click Race score: 0 clicks";
        }
        if (statsRunnerBest) {
            statsRunnerBest.textContent = "Best Jump Runner: 0s, 0 m";
        }
        if (statsReactionBest) {
            statsReactionBest.textContent = "Best Reaction: –";
        }
        if (runnerBestElement) {
            runnerBestElement.textContent = "Best time: 0s (Distance: 0 m)";
        }
        if (reactionBestElement) {
            reactionBestElement.textContent = "Best reaction: –";
        }

        if (runnerStatus) {
            runnerStatus.textContent = "Stats reset. Try for a new high score!";
        }

        playSound(clickSfx);
    });
}

// ===== EXTRA HOVER SOUND ON KEY BUTTONS =====
const hoverButtons = [
    gameStartButton,
    gameClickButton,
    runnerStartButton,
    resetStatsButton,
    reactionStartButton
];

hoverButtons.forEach(btn => {
    if (!btn) return;
    btn.addEventListener("mouseenter", () => {
        playSound(hoverSfx);
    });
});