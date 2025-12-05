// ===== BASIC ELEMENTS =====
const body = document.body;

// Buttons and text elements
const colorButton = document.getElementById("colorButton");
const titleButton = document.getElementById("titleButton");
const fontButton = document.getElementById("fontButton");
const title = document.getElementById("title");

// Theme selector
const themeSelect = document.getElementById("themeSelect");

// Stats elements
const statsClickBest = document.getElementById("statsClickBest");
const statsRunnerBest = document.getElementById("statsRunnerBest");

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
    colorButton.addEventListener("click", changeAccentColor);
}

// Start with default accent
applyAccentColor();

// ===== TITLE TOGGLE + TYPEWRITER =====
const originalTitleText = "Hi, I'm Cloakk_Vision";
const altTitleText = "I’m learning to code and this is my first website.";
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

// Run typewriter when script loads
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
    fontButton.addEventListener("click", changeFont);
}

// ===== THEME SWITCHER =====
function applyTheme(name) {
    body.classList.remove("theme-dark", "theme-light", "theme-neon");
    body.classList.add(`theme-${name}`);
}

if (themeSelect) {
    themeSelect.addEventListener("change", (event) => {
        applyTheme(event.target.value);
    });
    // initial theme
    applyTheme(themeSelect.value || "dark");
}

// ===== RANDOM FACTS =====
const factButton = document.getElementById("factButton");
const factText = document.getElementById("factText");

if (factButton && factText) {
    const facts = [
        "This is my first website, and it keeps getting better as I learn.",
        "JavaScript lets web pages react when you click or type.",
        "HTML is for structure, CSS is for design, JavaScript is for behavior.",
        "Small projects like this are how real developers start.",
        "I can reuse pieces of this project in future websites.",
        "Every change I make here is real coding practice."
    ];

    factButton.addEventListener("click", () => {
        const index = Math.floor(Math.random() * facts.length);
        factText.textContent = facts[index];
    });
}

// ===== MINI GAME 1: CLICK RACE =====
const gameStartButton = document.getElementById("gameStartButton");
const gameClickButton = document.getElementById("gameClickButton");
const gameStatus = document.getElementById("gameStatus");

let bestClickScore = 0;

if (gameStartButton && gameClickButton && gameStatus) {
    let gameActive = false;
    let clickCount = 0;
    let gameTimerId = null;

    function updateClickStats() {
        if (statsClickBest) {
            statsClickBest.textContent = `Best Click Race score: ${bestClickScore} clicks`;
        }
    }

    function startClickRace() {
        if (gameActive) return;

        gameActive = true;
        clickCount = 0;
        gameStatus.textContent = "Game started! Click the button as fast as you can!";
        gameClickButton.disabled = false;

        if (gameTimerId) clearTimeout(gameTimerId);

        gameTimerId = setTimeout(() => {
            gameActive = false;
            gameClickButton.disabled = true;
            gameStatus.textContent = `Time's up! You clicked ${clickCount} times.`;

            if (clickCount > bestClickScore) {
                bestClickScore = clickCount;
                updateClickStats();
            }
        }, 5000);
    }

    function handleClickRaceClick() {
        if (!gameActive) return;
        clickCount++;
        gameStatus.textContent = `Clicks: ${clickCount}`;
    }

    gameStartButton.addEventListener("click", startClickRace);
    gameClickButton.addEventListener("click", handleClickRaceClick);

    // Initialize stats text
    if (statsClickBest) {
        statsClickBest.textContent = `Best Click Race score: ${bestClickScore} clicks`;
    }
}

// ===== MINI GAME 2: JUMP RUNNER (spacebar jump, easier, 3 lives + best time) =====
const runnerStartButton = document.getElementById("runnerStartButton");
const runnerArea = document.getElementById("runnerArea");
const runnerCharacter = document.getElementById("runnerCharacter");
const runnerObstacle = document.getElementById("runnerObstacle");
const runnerStatus = document.getElementById("runnerStatus");
const runnerBestElement = document.getElementById("runnerBest");

let runnerBestTime = 0;

if (runnerStartButton && runnerArea && runnerCharacter && runnerObstacle && runnerStatus) {
    let runnerActive = false;
    let runnerStartTime = 0;
    let runnerCollisionInterval = null;
    let runnerTimerInterval = null;
    let isJumping = false;
    let runnerLives = 3;

    function updateRunnerBestDisplay() {
        if (runnerBestElement) {
            runnerBestElement.textContent = `Best time: ${runnerBestTime}s`;
        }
        if (statsRunnerBest) {
            statsRunnerBest.textContent = `Best Jump Runner time: ${runnerBestTime}s`;
        }
    }

    function startRunnerGame() {
        if (runnerActive) return;

        runnerActive = true;
        runnerLives = 3;
        runnerStartTime = Date.now();
        runnerStatus.textContent = "Game started! Lives: 3. Press spacebar to jump over the obstacle.";

        // Start obstacle animation (slower to make game easier)
        runnerObstacle.style.animation = "runner-obstacle-move 1.6s linear infinite";

        // Collision check
        if (runnerCollisionInterval) clearInterval(runnerCollisionInterval);
        runnerCollisionInterval = setInterval(checkRunnerCollision, 40);

        // Time update
        if (runnerTimerInterval) clearInterval(runnerTimerInterval);
        runnerTimerInterval = setInterval(updateRunnerTime, 500);
    }

    function endRunnerGame(message) {
        runnerActive = false;
        runnerObstacle.style.animation = "none";

        if (runnerCollisionInterval) clearInterval(runnerCollisionInterval);
        if (runnerTimerInterval) clearInterval(runnerTimerInterval);

        runnerStatus.textContent = message;
    }

    function updateRunnerTime() {
        if (!runnerActive) return;
        const seconds = Math.floor((Date.now() - runnerStartTime) / 1000);
        runnerStatus.textContent = `Time survived: ${seconds}s | Lives: ${runnerLives}`;
    }

    function resetObstacle() {
        // Restart the obstacle animation so it moves again from the right
        runnerObstacle.style.animation = "none";
        // Force reflow
        void runnerObstacle.offsetWidth;
        // Restart with the same (slow) speed
        runnerObstacle.style.animation = "runner-obstacle-move 1.6s linear infinite";
    }

    function checkRunnerCollision() {
        if (!runnerActive) return;

        const charRect = runnerCharacter.getBoundingClientRect();
        const obsRect = runnerObstacle.getBoundingClientRect();

        // Shrink hitbox a bit to make it more forgiving
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

            if (runnerLives <= 0) {
                const seconds = Math.floor((Date.now() - runnerStartTime) / 1000);

                // Update best time if this run is better
                if (seconds > runnerBestTime) {
                    runnerBestTime = seconds;
                    updateRunnerBestDisplay();
                }

                endRunnerGame(`Game over! You survived ${seconds}s with 0 lives left.`);
            } else {
                runnerStatus.textContent = `Ouch! You got hit. Lives left: ${runnerLives}`;
                // Reset obstacle so you get a moment before it comes again
                resetObstacle();
            }
        }
    }

    function jump() {
        if (!runnerActive || isJumping) return;
        isJumping = true;
        runnerCharacter.classList.add("jump");
        setTimeout(() => {
            runnerCharacter.classList.remove("jump");
            isJumping = false;
        }, 550);
    }

    runnerStartButton.addEventListener("click", startRunnerGame);

    // Spacebar + other shortcuts
    document.addEventListener("keydown", (event) => {
        const key = event.key.toLowerCase();

        if (event.code === "Space") {
            event.preventDefault();
            jump();
            return;
        }

        // Other shortcuts
        if (key === "b") {
            changeAccentColor();
        } else if (key === "t") {
            toggleTitle();
        } else if (key === "f") {
            changeFont();
        }
    });

    // Initialize stats displays
    updateRunnerBestDisplay();
} else {
    // Even if runner is missing, still set up global shortcuts (B, T, F)
    document.addEventListener("keydown", (event) => {
        const key = event.key.toLowerCase();

        if (event.code === "Space") {
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
}