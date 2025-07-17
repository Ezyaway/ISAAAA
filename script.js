// Game state management
let currentScreen = 'gift';
let captchaAnswer = 0;
let confettiInterval = null;
let captchaStage = 0; // 0: math, 1: emoji, 2: devil, 3: drawing, 4: wordle, 5: academic, 6: clock
let emojiLevel = 0; // 0: 3x3, 1: 5x5, 2: 9x9, 3: 12x12, 4: 15x15
let lives = 3;
let clockHours = 0;
let clockMinutes = 0;
let targetTime = { hours: 3, minutes: 15 };
let timeChangeInterval = null;
let happyEmojisFound = [];
let totalHappyEmojis = 0;
let emojiSpecialMessageTimeout = null;
let levelStartTime = 0;

// New captcha states
let drawingLives = 3;
let emojiCount = 0;
let userDrawing = [];
let currentColor = 'black';
let selectedEmoji = null;
let wordleAttempts = 0;
let currentWord = '';
let wordleWords = ['parabens', 'isaaaaaa', 'isabelaa', 'bacifra2', 'alfredos', 'bohringe', 'nicoemat', 'marretas', 'palavrao', 'dezoitos', 'caralhos'];
let targetWord = '';
let currentGuess = '';
let academicTimer = 30;
let academicTimerInterval = null;

// Devil captcha state
let devilLives = 3;
let devilsCaught = 0;
let devilFallInterval = null;
let normalFallInterval = null;
let devilGameActive = false;
let mouseX = 0;
let mouseY = 0;

// Screen elements
const giftScreen = document.getElementById('gift-screen');
const captchaScreen = document.getElementById('captcha-screen');
const emojiCaptchaScreen = document.getElementById('emoji-captcha-screen');
const devilCaptchaScreen = document.getElementById('devil-captcha-screen');
const drawingCaptchaScreen = document.getElementById('drawing-captcha-screen');
const wordleCaptchaScreen = document.getElementById('wordle-captcha-screen');
const academicCaptchaScreen = document.getElementById('academic-captcha-screen');
const clockCaptchaScreen = document.getElementById('clock-captcha-screen');
const celebrationScreen = document.getElementById('celebration-screen');
const robotScreen = document.getElementById('robot-screen');

// Interactive elements
const giftBox = document.getElementById('gift-box');
const captchaText = document.getElementById('captcha-text');
const captchaOptions = document.getElementById('captcha-options');
const captchaFeedback = document.getElementById('captcha-feedback');
const restartBtn = document.getElementById('restart-btn');
const retryBtn = document.getElementById('retry-btn');
const confettiContainer = document.getElementById('confetti-container');

// Emoji captcha elements
const emojiGrid = document.getElementById('emoji-grid');
const emojiProgress = document.getElementById('emoji-progress');
const livesDisplay = document.getElementById('lives-display');
const emojiFeedback = document.getElementById('emoji-feedback');
const emojiLoading = document.getElementById('emoji-loading');

// Clock captcha elements
const hourHand = document.getElementById('hour-hand');
const minuteHand = document.getElementById('minute-hand');
const currentClockTime = document.getElementById('current-clock-time');
const targetTimeDisplay = document.getElementById('target-time');
const confirmTimeBtn = document.getElementById('confirm-time-btn');
const clockFeedback = document.getElementById('clock-feedback');

// Devil captcha elements
const devilGameArea = document.getElementById('devil-game-area');
const devilLivesDisplay = document.getElementById('devil-lives-display');
const devilsCaughtDisplay = document.getElementById('devils-caught');
const devilFeedback = document.getElementById('devil-feedback');

// Academic captcha elements
const academicText = document.getElementById('academic-text');
const charCount = document.getElementById('char-count');
const academicTimerDisplay = document.getElementById('academic-timer');
const academicFeedback = document.getElementById('academic-feedback');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeGame();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Gift box click handler
    giftBox.addEventListener('click', openGift);
    
    // Restart button handler
    restartBtn.addEventListener('click', restartGame);
    
    // Retry button handler
    retryBtn.addEventListener('click', restartGame);
    
    // Clock controls
    confirmTimeBtn.addEventListener('click', confirmTime);
    
    // Add hover sound effect simulation through visual feedback
    giftBox.addEventListener('mouseenter', function() {
        this.style.filter = 'brightness(1.1) drop-shadow(0 0 20px rgba(255,255,255,0.5))';
    });
    
    giftBox.addEventListener('mouseleave', function() {
        this.style.filter = 'none';
    });
    
    // Secret cheat code handler
    let keySequence = [];
    document.addEventListener('keydown', function(event) {
        const code = event.code;

        if (code === 'Digit8' && event.shiftKey) {
            keySequence.push('shift8');
        } else if (code === 'Digit1' && keySequence.includes('shift8')) {
            keySequence.push('1');
        } else {
            keySequence = [];
        }

        if (keySequence.join('-') === 'shift8-1') {
            advanceToNextStage();
            keySequence = [];
        }
    });

    
    // Clock scroll and keyboard controls
    document.addEventListener('wheel', handleClockScroll);
    document.addEventListener('keydown', handleKeyboardInput);
    
    // Mouse tracking for devil captcha
    document.addEventListener('mousemove', trackMouse);
}

// Initialize the game
function initializeGame() {
    currentScreen = 'gift';
    captchaStage = 0;
    emojiLevel = 0;
    lives = 3;
    devilLives = 3;
    devilsCaught = 0;
    clockHours = 0;
    clockMinutes = 0;
    happyEmojisFound = [];
    totalHappyEmojis = 0;
    devilGameActive = false;
    clearInterval(timeChangeInterval);
    clearInterval(devilFallInterval);
    clearInterval(normalFallInterval);
    clearTimeout(emojiSpecialMessageTimeout);
    showScreen('gift');
    generateCaptcha();
    generateNewTargetTime();
}

// Screen management
function showScreen(screenName) {
    // Hide all screens
    giftScreen.classList.remove('active');
    captchaScreen.classList.remove('active');
    emojiCaptchaScreen.classList.remove('active');
    devilCaptchaScreen.classList.remove('active');
    academicCaptchaScreen.classList.remove('active');
    clockCaptchaScreen.classList.remove('active');
    celebrationScreen.classList.remove('active');
    robotScreen.classList.remove('active');
    
    // Clear any intervals when switching screens
    if (screenName !== 'devil-captcha') {
        clearInterval(devilFallInterval);
        clearInterval(normalFallInterval);
        devilGameActive = false;
    }
    if (screenName !== 'academic-captcha') {
        clearInterval(academicTimerInterval);
    }
    
    // Show the requested screen with a slight delay for smooth transition
    setTimeout(() => {
        switch(screenName) {
            case 'gift':
                giftScreen.classList.add('active');
                break;
            case 'captcha':
                captchaScreen.classList.add('active');
                break;
            case 'emoji-captcha':
                emojiCaptchaScreen.classList.add('active');
                break;
            case 'devil-captcha':
                devilCaptchaScreen.classList.add('active');
                startDevilCaptcha();
                break;
            case 'academic-captcha':
                academicCaptchaScreen.classList.add('active');
                initializeAcademic();
                break;
            case 'clock-captcha':
                clockCaptchaScreen.classList.add('active');
                startTimeChangeChallenge();
                break;
            case 'celebration':
                celebrationScreen.classList.add('active');
                displayUserDrawing();
                startConfetti();
                break;
            case 'robot':
                robotScreen.classList.add('active');
                break;
        }
        currentScreen = screenName;
    }, 100);
}

// Gift opening animation and transition
function openGift() {
    // Add opening animation
    giftBox.style.animation = 'giftOpen 1s ease-out forwards';
    
    // Add CSS for the opening animation
    if (!document.querySelector('#gift-open-style')) {
        const style = document.createElement('style');
        style.id = 'gift-open-style';
        style.textContent = `
            @keyframes giftOpen {
                0% { transform: scale(1) rotate(0deg); }
                25% { transform: scale(1.1) rotate(-5deg); }
                50% { transform: scale(1.2) rotate(5deg); }
                75% { transform: scale(1.3) rotate(-10deg); }
                100% { 
                    transform: scale(2) rotate(0deg); 
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Show sparkle explosion effect
    createSparkleExplosion();
    
    // Transition to captcha screen after animation
    setTimeout(() => {
        showScreen('captcha');
        giftBox.style.animation = 'giftFloat 3s ease-in-out infinite';
        giftBox.style.opacity = '1';
        giftBox.style.transform = 'scale(1)';
    }, 1000);
}

// Create sparkle explosion effect
function createSparkleExplosion() {
    const sparkleEmojis = ['✨', '⭐', '💫', '🌟', '💥', '🎆'];
    const giftRect = giftBox.getBoundingClientRect();
    const centerX = giftRect.left + giftRect.width / 2;
    const centerY = giftRect.top + giftRect.height / 2;
    
    for (let i = 0; i < 15; i++) {
        const sparkle = document.createElement('div');
        sparkle.textContent = sparkleEmojis[Math.floor(Math.random() * sparkleEmojis.length)];
        sparkle.style.position = 'fixed';
        sparkle.style.left = centerX + 'px';
        sparkle.style.top = centerY + 'px';
        sparkle.style.fontSize = '2rem';
        sparkle.style.pointerEvents = 'none';
        sparkle.style.zIndex = '1000';
        
        const angle = (i / 15) * 2 * Math.PI;
        const distance = 100 + Math.random() * 100;
        const endX = centerX + Math.cos(angle) * distance;
        const endY = centerY + Math.sin(angle) * distance;
        
        sparkle.style.animation = `sparkleExplosion 1s ease-out forwards`;
        
        // Add explosion animation
        if (!document.querySelector('#sparkle-explosion-style')) {
            const style = document.createElement('style');
            style.id = 'sparkle-explosion-style';
            style.textContent = `
                @keyframes sparkleExplosion {
                    0% {
                        transform: scale(0) rotate(0deg);
                        opacity: 1;
                    }
                    50% {
                        transform: scale(1.5) rotate(180deg);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(0) rotate(360deg);
                        opacity: 0;
                        left: ${endX}px;
                        top: ${endY}px;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(sparkle);
        
        // Remove sparkle after animation
        setTimeout(() => {
            if (sparkle.parentNode) {
                sparkle.parentNode.removeChild(sparkle);
            }
        }, 1000);
    }
}

// Generate a random math captcha
function generateCaptcha() {
    const operations = ['+', '-', '×'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let num1, num2, answer;
    
    switch(operation) {
        case '+':
            num1 = Math.floor(Math.random() * 20) + 1;
            num2 = Math.floor(Math.random() * 20) + 1;
            answer = num1 + num2;
            break;
        case '-':
            num1 = Math.floor(Math.random() * 20) + 10;
            num2 = Math.floor(Math.random() * num1);
            answer = num1 - num2;
            break;
        case '×':
            num1 = Math.floor(Math.random() * 10) + 1;
            num2 = Math.floor(Math.random() * 10) + 1;
            answer = num1 * num2;
            break;
    }
    
    captchaAnswer = answer;
    captchaText.textContent = `${num1} ${operation} ${num2} = ?`;
    
    generateCaptchaOptions(answer);
}

// Generate captcha answer options
function generateCaptchaOptions(correctAnswer) {
    const options = [correctAnswer];
    
    // Generate 3 wrong answers
    while (options.length < 4) {
        const wrongAnswer = correctAnswer + Math.floor(Math.random() * 20) - 10;
        if (wrongAnswer > 0 && !options.includes(wrongAnswer)) {
            options.push(wrongAnswer);
        }
    }
    
    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
    }
    
    // Clear previous options
    captchaOptions.innerHTML = '';
    
    // Create option buttons
    options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'captcha-option';
        button.textContent = option;
        button.addEventListener('click', () => checkCaptchaAnswer(option, button));
        captchaOptions.appendChild(button);
    });
}

// Check captcha answer
function checkCaptchaAnswer(selectedAnswer, buttonElement) {
    const allButtons = captchaOptions.querySelectorAll('.captcha-option');
    
    if (selectedAnswer === captchaAnswer) {
        // Correct answer
        buttonElement.classList.add('correct');
        captchaFeedback.innerHTML = '<p class="success">🎉 Correto! Avançando para próxima etapa... ✨</p>';
        
        // Disable all buttons
        allButtons.forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.6';
        });
        
        // Transition to emoji captcha screen
        setTimeout(() => {
            captchaStage = 1;
            showScreen('emoji-captcha');
            generateEmojiCaptcha();
        }, 2000);
        
    } else {
        // Wrong answer - now leads to robot screen
        showScreen('robot');
    }
}

// Start confetti animation
function startConfetti() {
    clearInterval(confettiInterval);
    
    const confettiEmojis = ['🎉', '🎊', '🎈', '🎂', '✨', '⭐', '💫', '🌟', '🥳', '🎁'];
    
    confettiInterval = setInterval(() => {
        for (let i = 0; i < 3; i++) {
            createConfettiPiece(confettiEmojis);
        }
    }, 200);
    
    // Stop confetti after 10 seconds
    setTimeout(() => {
        clearInterval(confettiInterval);
    }, 10000);
}

// Create individual confetti piece
function createConfettiPiece(emojis) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    
    // Random horizontal position
    confetti.style.left = Math.random() * 100 + '%';
    
    // Random animation duration and delay
    const duration = Math.random() * 3 + 2; // 2-5 seconds
    const delay = Math.random() * 2; // 0-2 seconds delay
    
    confetti.style.animationDuration = duration + 's';
    confetti.style.animationDelay = delay + 's';
    
    // Random rotation and size
    const rotation = Math.random() * 360;
    const scale = Math.random() * 0.8 + 0.6; // 0.6-1.4 scale
    
    confetti.style.transform = `rotate(${rotation}deg) scale(${scale})`;
    
    confettiContainer.appendChild(confetti);
    
    // Remove confetti after animation
    setTimeout(() => {
        if (confetti.parentNode) {
            confetti.parentNode.removeChild(confetti);
        }
    }, (duration + delay) * 1000);
}

// Emoji Captcha Functions
function generateEmojiCaptcha() {
    const levelSizes = [3, 5, 9, 12, 15];
    const levelNames = ['3x3', '5x5', '9x9', '12x12', '15x15'];
    const gridSize = levelSizes[emojiLevel];
    
    // Update progress display
    emojiProgress.textContent = `Nível ${emojiLevel + 1}/5 - Grade ${levelNames[emojiLevel]}`;
    updateLivesDisplay();
    
    // Clear previous grid
    emojiGrid.innerHTML = '';
    emojiGrid.className = `emoji-grid size-${gridSize}`;
    
    // Define emoji sets
    const sadEmojis = ['😥', '😓', '😔', '😕', '😞', '😟', '😭', '😢', '😩', '😰', '🤕', '🤥', '🥺'];
    const happyEmojis = ['😂', '😀', '😆', '😄', '🙃', '🤭'];
    
    // Calculate emoji distribution
    const totalCells = gridSize * gridSize;
    const happyCount = Math.floor(totalCells * 0.33);
    const sadCount = totalCells - happyCount;
    
    // Create emoji array
    const emojiArray = [];
    
    // Add happy emojis
    for (let i = 0; i < happyCount; i++) {
        emojiArray.push({
            emoji: happyEmojis[Math.floor(Math.random() * happyEmojis.length)],
            isHappy: true
        });
    }
    
    // Add sad emojis
    for (let i = 0; i < sadCount; i++) {
        emojiArray.push({
            emoji: sadEmojis[Math.floor(Math.random() * sadEmojis.length)],
            isHappy: false
        });
    }
    
    // Shuffle array
    for (let i = emojiArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [emojiArray[i], emojiArray[j]] = [emojiArray[j], emojiArray[i]];
    }
    
    // Reset game state
    happyEmojisFound = [];
    totalHappyEmojis = happyCount;
    levelStartTime = Date.now();
    
    // Create grid items
    emojiArray.forEach((item, index) => {
        const emojiItem = document.createElement('div');
        emojiItem.className = 'emoji-item';
        emojiItem.textContent = item.emoji;
        emojiItem.dataset.index = index;
        emojiItem.dataset.isHappy = item.isHappy;
        
        emojiItem.addEventListener('click', () => handleEmojiClick(emojiItem));
        emojiGrid.appendChild(emojiItem);
    });
    
    // Update feedback
    emojiFeedback.innerHTML = '<p>🎯 Clique apenas nos emojis felizes!</p>';
    emojiFeedback.className = 'emoji-feedback';
    
    // Special handling for 15x15 level
    if (emojiLevel === 4) {
        handle15x15Level();
    }
}

function handle15x15Level() {
    // After 5 seconds, show "isso vai demoraaar..."
    setTimeout(() => {
        showEmojiSpecialMessage("isso vai demoraaar...");
        
        // After 10 more seconds, show "vamo logo, vai"
        setTimeout(() => {
            showEmojiSpecialMessage("vamo logo, vai...");
            
            // After 10 more seconds, start loading and proceed
            setTimeout(() => {
                hideEmojiSpecialMessage();
                emojiFeedback.innerHTML = '<p class="success">🎉 Perfeito! Carregando próxima etapa... ✨</p>';
                
                // Show loading overlay
                emojiLoading.classList.add('active');
                
                setTimeout(() => {
                    emojiLoading.classList.remove('active');
                    captchaStage = 2;
                    showScreen('devil-captcha');
                }, 4000);
            }, 10000);
        }, 10000);
    }, 5000);
}

function showEmojiSpecialMessage(message) {
    hideEmojiSpecialMessage(); // Clear any existing message
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'emoji-special-message';
    messageDiv.id = 'emoji-special-message';
    messageDiv.textContent = message;
    
    emojiCaptchaScreen.appendChild(messageDiv);
}

function hideEmojiSpecialMessage() {
    const existingMessage = document.getElementById('emoji-special-message');
    if (existingMessage) {
        existingMessage.remove();
    }
}

function handleEmojiClick(emojiItem) {
    const index = parseInt(emojiItem.dataset.index);
    const isHappy = emojiItem.dataset.isHappy === 'true';
    
    if (happyEmojisFound.includes(index)) {
        return; // Already clicked
    }
    
    if (isHappy) {
        // Correct click
        emojiItem.classList.add('clicked');
        happyEmojisFound.push(index);
        
        // Check if all happy emojis found
        if (happyEmojisFound.length === totalHappyEmojis) {
            emojiFeedback.innerHTML = '<p class="success">🎉 Perfeito! Carregando próximo nível... ✨</p>';
            
            // Show loading overlay
            emojiLoading.classList.add('active');
            
            setTimeout(() => {
                emojiLoading.classList.remove('active');
                
                if (emojiLevel < 4) {
                    // Next level
                    emojiLevel++;
                    generateEmojiCaptcha();
                } else {
                    // Completed all emoji levels, go to devil captcha
                    captchaStage = 2;
                    showScreen('devil-captcha');
                }
            }, 4000);
        }
    } else {
        // Wrong click
        emojiItem.classList.add('wrong');
        lives--;
        updateLivesDisplay();
        
        setTimeout(() => {
            emojiItem.classList.remove('wrong');
        }, 1000);
        
        if (lives <= 0) {
            // Game over
            showScreen('robot');
        } else {
            emojiFeedback.innerHTML = `<p class="error">❌ Ops! Você tem ${lives} vida${lives > 1 ? 's' : ''} restante${lives > 1 ? 's' : ''}!</p>`;
            
            setTimeout(() => {
                emojiFeedback.innerHTML = '<p>🎯 Clique apenas nos emojis felizes!</p>';
                emojiFeedback.className = 'emoji-feedback';
            }, 2000);
        }
    }
}

function updateLivesDisplay() {
    const hearts = '❤️'.repeat(lives);
    livesDisplay.textContent = hearts;
}

// Clock Captcha Functions
function initializeClock() {
    clockHours = 0;
    clockMinutes = 0;
    updateClockDisplay();
    updateClockTime();
    clockFeedback.innerHTML = '<p>🎯 Ajuste o relógio para o horário solicitado!</p>';
    clockFeedback.className = 'clock-feedback';
}

function updateClockDisplay() {
    const hourAngle = (clockHours % 12) * 30 + (clockMinutes * 0.5);
    const minuteAngle = clockMinutes * 6;
    
    hourHand.style.transform = `rotate(${hourAngle}deg)`;
    minuteHand.style.transform = `rotate(${minuteAngle}deg)`;
}

function updateClockTime() {
    const hours = clockHours.toString().padStart(2, '0');
    const minutes = clockMinutes.toString().padStart(2, '0');
    currentClockTime.textContent = `${hours}:${minutes}`;
}

function handleClockScroll(event) {
    if (currentScreen !== 'clock-captcha') return;
    
    event.preventDefault();
    const delta = event.deltaY > 0 ? 1 : -1;
    
    if (event.shiftKey) {
        // Adjust hours
        clockHours = (clockHours + delta + 24) % 24;
    } else {
        // Adjust minutes
        clockMinutes = (clockMinutes + delta + 60) % 60;
    }
    
    updateClockDisplay();
    updateClockTime();
}

function handleKeyboardInput(event) {
    if (currentScreen !== 'clock-captcha') return;
    
    switch(event.key) {
        case 'ArrowLeft':
            event.preventDefault();
            clockMinutes = (clockMinutes - 1 + 60) % 60;
            break;
        case 'ArrowRight':
            event.preventDefault();
            clockMinutes = (clockMinutes + 1) % 60;
            break;
        case 'ArrowUp':
            event.preventDefault();
            clockHours = (clockHours - 1 + 24) % 24;
            break;
        case 'ArrowDown':
            event.preventDefault();
            clockHours = (clockHours + 1) % 24;
            break;
    }
    
    updateClockDisplay();
    updateClockTime();
}

function generateNewTargetTime() {
    targetTime.hours = Math.floor(Math.random() * 12) + 1;
    targetTime.minutes = Math.floor(Math.random() * 60); // Any minute - more difficult
    
    const timeString = `${targetTime.hours.toString().padStart(2, '0')}:${targetTime.minutes.toString().padStart(2, '0')}`;
    targetTimeDisplay.textContent = `Horário solicitado: ${timeString}`;
}

function startTimeChangeChallenge() {
    // Change time every 5-10 seconds - much more frequent
    let changeInterval = 5000 + Math.random() * 5000;
    
    timeChangeInterval = setInterval(() => {
        // Always change time, regardless of user progress
        generateNewTargetTime();
        clockFeedback.innerHTML = '<p class="error">⚠️ Horário alterado! Ajuste novamente!</p>';
        
        setTimeout(() => {
            clockFeedback.innerHTML = '<p>🎯 Ajuste o relógio para o horário solicitado!</p>';
            clockFeedback.className = 'clock-feedback';
        }, 2000);
        
        // Make it progressively harder by reducing interval
        if (changeInterval > 2000) {
            changeInterval -= 500;
        }
    }, changeInterval);
}

function confirmTime() {
    const currentHours = clockHours === 0 ? 12 : clockHours > 12 ? clockHours - 12 : clockHours;
    
    if (currentHours === targetTime.hours && clockMinutes === targetTime.minutes) {
        // Correct time
        clearInterval(timeChangeInterval);
        clockFeedback.innerHTML = '<p class="success">🎉 Horário correto! Parabéns! ✨</p>';
        
        setTimeout(() => {
            showScreen('celebration');
        }, 2000);
    } else {
        // Wrong time
        showScreen('robot');
    }
}

// Devil Captcha Functions
function startDevilCaptcha() {
    devilLives = 3;
    devilsCaught = 0;
    updateDevilDisplay();
    devilGameActive = false;
    
    // Clear game area
    devilGameArea.innerHTML = '';
    devilFeedback.innerHTML = '<p>⏳ Aguarde 10 segundos...</p>';
    
    // Wait 10 seconds before starting
    setTimeout(() => {
        devilGameActive = true;
        devilFeedback.innerHTML = '<p>🎯 Clique nos diabinhos para capturá-los!</p>';
        startDevilFalling();
        startNormalFalling();
    }, 10000);
}

function startDevilFalling() {
    devilFallInterval = setInterval(() => {
        if (devilGameActive) {
            createFallingDevil();
        }
    }, 5000); // Every 5 seconds
}

function startNormalFalling() {
    normalFallInterval = setInterval(() => {
        if (devilGameActive) {
            createFallingNormalEmoji();
        }
    }, 2000); // Every 2 seconds
}

function createFallingDevil() {
    const devil = document.createElement('div');
    devil.className = 'falling-emoji devil';
    devil.textContent = '👹';
    devil.style.left = Math.random() * (devilGameArea.offsetWidth - 50) + 'px';
    devil.dataset.isDevil = 'true';
    
    let currentX = parseFloat(devil.style.left);
    let currentY = -50;
    let velocityX = 0;
    
    devil.addEventListener('click', () => catchDevil(devil));
    devilGameArea.appendChild(devil);
    
    // Animation loop for devil movement
    const animateDevil = () => {
        if (!devilGameActive || !devil.parentNode) return;
        
        // Calculate distance to mouse
        const devilRect = devil.getBoundingClientRect();
        const gameAreaRect = devilGameArea.getBoundingClientRect();
        const relativeMouseX = mouseX - gameAreaRect.left;
        const relativeMouseY = mouseY - gameAreaRect.top;
        
        const devilCenterX = currentX + 25; // 25 is half of emoji width
        const devilCenterY = currentY + 25;
        
        // Calculate distance to mouse
        const distanceToMouse = Math.sqrt(
            Math.pow(relativeMouseX - devilCenterX, 2) + 
            Math.pow(relativeMouseY - devilCenterY, 2)
        );
        
        // If mouse is close, try to escape
        if (distanceToMouse < 100) {
            const escapeX = devilCenterX - relativeMouseX;
            const escapeY = devilCenterY - relativeMouseY;
            const escapeLength = Math.sqrt(escapeX * escapeX + escapeY * escapeY);
            
            if (escapeLength > 0) {
                velocityX = (escapeX / escapeLength) * 4; // Faster escape speed
            }
        } else {
            velocityX *= 0.9; // Slow down when mouse is far
        }
        
        // Update position
        currentX += velocityX;
        currentY += 4; // Faster fall speed
        
        // Keep within bounds
        currentX = Math.max(0, Math.min(devilGameArea.offsetWidth - 50, currentX));
        
        devil.style.left = currentX + 'px';
        devil.style.top = currentY + 'px';
        
        // Check if devil escaped
        if (currentY > devilGameArea.offsetHeight) {
            devilLives--;
            updateDevilDisplay();
            devil.remove();
            
            if (devilLives <= 0) {
                endDevilGame(false);
                return;
            }
            
            devilFeedback.innerHTML = `<p class="error">❌ Um diabinho escapou! Vidas restantes: ${devilLives}</p>`;
            setTimeout(() => {
                if (devilGameActive) {
                    devilFeedback.innerHTML = '<p>🎯 Clique nos diabinhos para capturá-los!</p>';
                }
            }, 2000);
        } else {
            requestAnimationFrame(animateDevil);
        }
    };
    
    requestAnimationFrame(animateDevil);
}

function createFallingNormalEmoji() {
    const normalEmojis = ['😀', '😂', '🎉', '⭐', '✨', '🌟', '🎊', '🎈', '🎁', '🎂'];
    const emoji = document.createElement('div');
    emoji.className = 'falling-emoji normal';
    emoji.textContent = normalEmojis[Math.floor(Math.random() * normalEmojis.length)];
    emoji.style.left = Math.random() * (devilGameArea.offsetWidth - 50) + 'px';
    emoji.dataset.isDevil = 'false';
    
    devilGameArea.appendChild(emoji);
    
    // Remove after animation completes
    setTimeout(() => {
        if (emoji.parentNode) {
            emoji.remove();
        }
    }, 6000);
}

function catchDevil(devil) {
    if (!devilGameActive) return;
    
    devil.classList.add('caught');
    devilsCaught++;
    updateDevilDisplay();
    
    setTimeout(() => {
        devil.remove();
    }, 500);
    
    if (devilsCaught >= 5) {
        endDevilGame(true);
    } else {
        devilFeedback.innerHTML = `<p class="success">🎉 Diabinho capturado! ${5 - devilsCaught} restantes!</p>`;
        setTimeout(() => {
            if (devilGameActive) {
                devilFeedback.innerHTML = '<p>🎯 Clique nos diabinhos para capturá-los!</p>';
            }
        }, 1500);
    }
}

function endDevilGame(success) {
    devilGameActive = false;
    clearInterval(devilFallInterval);
    clearInterval(normalFallInterval);
    
    // Clear all falling emojis
    const fallingEmojis = devilGameArea.querySelectorAll('.falling-emoji');
    fallingEmojis.forEach(emoji => emoji.remove());
    
    if (success) {
        devilFeedback.innerHTML = '<p class="success">🎉 Todos os diabinhos capturados! Avançando... ✨</p>';
        setTimeout(() => {
            captchaStage = 3;
            showScreen('academic-captcha');
        }, 2000);
    } else {
        showScreen('robot');
    }
}

function updateDevilDisplay() {
    const hearts = '❤️'.repeat(devilLives);
    devilLivesDisplay.textContent = hearts;
    devilsCaughtDisplay.textContent = `${devilsCaught}/5`;
}

function trackMouse(event) {
    mouseX = event.clientX;
    mouseY = event.clientY;
}

// Secret function to advance stages (testing only)
function advanceToNextStage() {
    if (currentScreen === 'math-captcha') {
        showScreen('emoji-captcha');
        startEmojiCaptcha();
    } else if (currentScreen === 'emoji-captcha') {
        showScreen('devil-captcha');
        startDevilCaptcha();
    } else if (currentScreen === 'wordle-captcha') {
        showScreen('academic-captcha');
        startAcademicCaptcha();
    } else if (currentScreen === 'academic-captcha') {
        showScreen('clock-captcha');
        startClockCaptcha();
    } else if (currentScreen === 'clock-captcha') {
        showScreen('celebration');
        startCelebration();
    }
}

// Restart the game
function restartGame() {
    // Clear any existing confetti and intervals
    clearInterval(confettiInterval);
    clearInterval(timeChangeInterval);
    clearInterval(devilFallInterval);
    clearInterval(normalFallInterval);
    clearInterval(academicTimerInterval);
    clearTimeout(emojiSpecialMessageTimeout);
    confettiContainer.innerHTML = '';
    
    // Clear drawing canvas
    if (drawingCanvas) drawingCanvas.innerHTML = '';
    if (userDrawingDisplay) userDrawingDisplay.innerHTML = '';
    
    // Reset all game state
    captchaStage = 0;
    emojiLevel = 0;
    lives = 3;
    devilLives = 3;
    devilsCaught = 0;
    drawingLives = 3;
    emojiCount = 0;
    academicTimer = 30;
    clockHours = 0;
    clockMinutes = 0;
    happyEmojisFound = [];
    totalHappyEmojis = 0;
    devilGameActive = false;
    
    // Clear any special messages
    hideEmojiSpecialMessage();
    
    // Reset captcha feedback
    captchaFeedback.innerHTML = '<p>🎯 Escolha a resposta correta!</p>';
    captchaFeedback.className = 'captcha-feedback';
    
    // Generate new captcha and target time
    generateCaptcha();
    generateNewTargetTime();
    
    // Return to gift screen
    showScreen('gift');
}


// Academic Captcha Functions
function initializeAcademic() {
    academicTimer = 30;
    clearInterval(academicTimerInterval);
    
    academicText.value = '';
    charCount.textContent = '0';
    academicFeedback.innerHTML = '<p>📝 Escreva pelo menos 2000 caracteres!</p>';
    
    // Setup character counter
    academicText.addEventListener('input', updateCharCount);
    
    // Start timer after 2 seconds
    setTimeout(() => {
        startAcademicTimer();
    }, 2000);
}

function updateCharCount() {
    const count = academicText.value.length;
    charCount.textContent = count;
    
    if (count >= 2000) {
        academicFeedback.innerHTML = '<p class="success">🎉 Excelente análise! Avançando... ✨</p>';
        clearInterval(academicTimerInterval);
        setTimeout(() => {
            captchaStage = 6;
            showScreen('clock-captcha');
            initializeClock();
        }, 2000);
    }
}

function startAcademicTimer() {
    academicTimerInterval = setInterval(() => {
        academicTimer--;
        academicTimerDisplay.textContent = academicTimer;
        
        if (academicTimer <= 0) {
            clearInterval(academicTimerInterval);
            showScreen('robot');
        }
    }, 1000);
}

// Add some fun interactions
document.addEventListener('keydown', function(event) {
    // Easter egg: Press space for extra sparkles on gift screen
    if (event.code === 'Space' && currentScreen === 'gift') {
        event.preventDefault();
        createSparkleExplosion();
    }
    
    // Easter egg: Press enter to trigger confetti on celebration screen
    if (event.code === 'Enter' && currentScreen === 'celebration') {
        startConfetti();
    }
});

// Add mobile touch support
let touchStartTime = 0;

giftBox.addEventListener('touchstart', function(e) {
    touchStartTime = Date.now();
});

giftBox.addEventListener('touchend', function(e) {
    const touchDuration = Date.now() - touchStartTime;
    if (touchDuration < 500) { // Short tap
        e.preventDefault();
        if (currentScreen === 'gift') {
            openGift();
        }
    }
});

// Prevent zoom on double tap for better mobile experience
document.addEventListener('touchend', function(event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

let lastTouchEnd = 0;

// Add performance optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimized confetti creation
const createOptimizedConfetti = debounce(createConfettiPiece, 50);

console.log('🎉 Birthday Gift Page Loaded Successfully! 🎂');
console.log('🎯 Click the gift to start your birthday surprise! ✨');
