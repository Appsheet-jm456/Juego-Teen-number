/**
 * Kinetic English Games - Teen Numbers Challenge
 * Educational game for learning numbers 11-19 in English
 * 
 * @author Camilo Marín
 * @version 1.0.0
 */

// ============================================================================
// GAME DATA & CONFIGURATION
// ============================================================================

/**
 * Teen numbers data with their properties
 */
const TEEN_NUMBERS = {
    11: { word: 'eleven', special: true, tip: 'Eleven is a special number — it doesn\'t follow the "teen" pattern!' },
    12: { word: 'twelve', special: true, tip: 'Twelve is unique — remember it separately, not "twoteen"!' },
    13: { word: 'thirteen', special: true, tip: 'Thirteen: "three" changes to "thir" + teen' },
    14: { word: 'fourteen', special: false, tip: 'Fourteen = four + teen. Easy!' },
    15: { word: 'fifteen', special: true, tip: 'Fifteen: "five" becomes "fif" — the V disappears!' },
    16: { word: 'sixteen', special: false, tip: 'Sixteen = six + teen. Simple pattern!' },
    17: { word: 'seventeen', special: false, tip: 'Seventeen = seven + teen. You\'ve got it!' },
    18: { word: 'eighteen', special: true, tip: 'Eighteen: only one T! "Eight" + "een" (not "eightteen")' },
    19: { word: 'nineteen', special: false, tip: 'Nineteen = nine + teen. Almost twenty!' }
};

/**
 * Common misspellings for spelling challenges
 */
const MISSPELLINGS = {
    eleven: ['elevan', 'elaven', 'elleven'],
    twelve: ['twelv', 'twelf', 'twleve'],
    thirteen: ['therteen', 'tirteen', 'thirten'],
    fourteen: ['forteen', 'fourten', 'fortin'],
    fifteen: ['fiveteen', 'fiften', 'fivteen'],
    sixteen: ['sixten', 'sixtean', 'sicksteen'],
    seventeen: ['seventean', 'seventen', 'sevinteen'],
    eighteen: ['eightteen', 'eighten', 'eiteen'],
    nineteen: ['ninteen', 'ninetean', 'nineten']
};

/**
 * Learning tips rotation pool
 */
const GENERAL_TIPS = [
    'Remember: thirteen, fourteen, fifteen... all end in TEEN!',
    'The teen numbers go from 11 to 19.',
    'Practice makes perfect! Keep learning!',
    'Eleven and twelve are the special ones — memorize them!',
    'Most teen numbers = base number + "teen"',
    'Watch the spelling of thirteen, fifteen, and eighteen!',
    'You\'re becoming a teen numbers expert!'
];

/**
 * Addition problems that result in teen numbers
 */
const ADDITION_PROBLEMS = {
    11: [[10, 1], [9, 2], [8, 3], [7, 4], [6, 5]],
    12: [[10, 2], [9, 3], [8, 4], [7, 5], [6, 6]],
    13: [[10, 3], [9, 4], [8, 5], [7, 6]],
    14: [[10, 4], [9, 5], [8, 6], [7, 7]],
    15: [[10, 5], [9, 6], [8, 7]],
    16: [[10, 6], [9, 7], [8, 8]],
    17: [[10, 7], [9, 8]],
    18: [[10, 8], [9, 9]],
    19: [[10, 9]]
};

/**
 * Objects for counting display
 */
const COUNT_OBJECTS = ['⭐', '🌟', '💎', '🔵', '🟢', '🟡', '🔴', '💜', '🧡', '🩵'];

/**
 * Game configuration
 */
const CONFIG = {
    totalQuestions: 20,
    timePerQuestion: 15,
    pointsCorrect: 10,
    maxTimeBonus: 30,
    streakBonus: 5,
    minUniqueBeforeRepeat: 6
};

// ============================================================================
// GAME STATE
// ============================================================================

let gameState = {
    currentQuestion: 0,
    score: 0,
    streak: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    timeRemaining: CONFIG.timePerQuestion,
    timerInterval: null,
    usedNumbers: [],
    usedTips: [],
    currentAnswer: null,
    answered: false,
    audioContext: null
};

// ============================================================================
// DOM ELEMENTS
// ============================================================================

const elements = {
    // Screens
    introScreen: document.getElementById('intro-screen'),
    gameScreen: document.getElementById('game-screen'),
    resultsScreen: document.getElementById('results-screen'),
    
    // Buttons
    startBtn: document.getElementById('start-btn'),
    nextBtn: document.getElementById('next-btn'),
    playAgainBtn: document.getElementById('play-again-btn'),
    
    // Game display
    currentQuestion: document.getElementById('current-question'),
    progressFill: document.getElementById('progress-fill'),
    score: document.getElementById('score'),
    streak: document.getElementById('streak'),
    streakDisplay: document.getElementById('streak-display'),
    
    // Question area
    questionType: document.getElementById('question-type'),
    questionDisplay: document.getElementById('question-display'),
    questionInstruction: document.getElementById('question-instruction'),
    optionsContainer: document.getElementById('options-container'),
    
    // Timer
    timerRing: document.getElementById('timer-ring'),
    timerProgress: document.getElementById('timer-progress'),
    timerText: document.getElementById('timer-text'),
    
    // Feedback
    feedbackContainer: document.getElementById('feedback-container'),
    feedbackIcon: document.getElementById('feedback-icon'),
    feedbackText: document.getElementById('feedback-text'),
    tipContainer: document.getElementById('tip-container'),
    tipText: document.getElementById('tip-text'),
    
    // Results
    finalScore: document.getElementById('final-score'),
    finalCorrect: document.getElementById('final-correct'),
    finalIncorrect: document.getElementById('final-incorrect'),
    finalAccuracy: document.getElementById('final-accuracy'),
    motivationalMessage: document.getElementById('motivational-message'),
    confettiCanvas: document.getElementById('confetti-canvas')
};

// ============================================================================
// AUDIO SYSTEM (Web Audio API)
// ============================================================================

/**
 * Initialize or get the audio context
 * @returns {AudioContext}
 */
function getAudioContext() {
    if (!gameState.audioContext) {
        gameState.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return gameState.audioContext;
}

/**
 * Play a melodic sound
 * @param {Array} frequencies - Array of frequency values
 * @param {number} duration - Duration per note in seconds
 * @param {string} type - Oscillator type
 */
function playMelody(frequencies, duration = 0.15, type = 'sine') {
    try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;
        
        frequencies.forEach((freq, index) => {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            oscillator.type = type;
            oscillator.frequency.value = freq;
            
            gainNode.gain.setValueAtTime(0.3, now + index * duration);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + (index + 1) * duration);
            
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            oscillator.start(now + index * duration);
            oscillator.stop(now + (index + 1) * duration);
        });
    } catch (e) {
        console.log('Audio not available');
    }
}

/**
 * Play correct answer sound (ascending melody: Do-Mi-Sol)
 */
function playCorrectSound() {
    playMelody([523.25, 659.25, 783.99], 0.12); // C5, E5, G5
}

/**
 * Play incorrect answer sound (descending tone)
 */
function playIncorrectSound() {
    playMelody([400, 300], 0.2, 'triangle');
}

/**
 * Play timeout sound
 */
function playTimeoutSound() {
    playMelody([300, 250, 200], 0.15, 'triangle');
}

/**
 * Play intro sound
 */
function playIntroSound() {
    playMelody([392, 440, 494, 523], 0.15); // G4, A4, B4, C5
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Fisher-Yates shuffle algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Get a random element from an array
 * @param {Array} array 
 * @returns {*} Random element
 */
function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Get all teen number values (11-19)
 * @returns {Array} Array of numbers
 */
function getAllTeenNumbers() {
    return Object.keys(TEEN_NUMBERS).map(Number);
}

/**
 * Get a teen number that hasn't been used recently
 * @returns {number} Teen number
 */
function getNextNumber() {
    const allNumbers = getAllTeenNumbers();
    
    // Filter out recently used numbers
    const available = allNumbers.filter(n => !gameState.usedNumbers.includes(n));
    
    let selected;
    if (available.length > 0) {
        selected = getRandomElement(available);
    } else {
        // Reset and pick from all
        gameState.usedNumbers = [];
        selected = getRandomElement(allNumbers);
    }
    
    // Track usage
    gameState.usedNumbers.push(selected);
    if (gameState.usedNumbers.length > CONFIG.minUniqueBeforeRepeat) {
        gameState.usedNumbers.shift();
    }
    
    return selected;
}

/**
 * Get wrong answer options (ensuring no duplicates)
 * @param {number} correctNumber - The correct answer number
 * @param {number} count - Number of wrong options needed
 * @returns {Array} Array of wrong number words
 */
function getWrongOptions(correctNumber, count = 3) {
    const allNumbers = getAllTeenNumbers().filter(n => n !== correctNumber);
    const shuffled = shuffleArray(allNumbers);
    return shuffled.slice(0, count).map(n => TEEN_NUMBERS[n].word);
}

/**
 * Get a learning tip for a number
 * @param {number} num - The teen number
 * @returns {string} Learning tip
 */
function getTip(num) {
    const numberTip = TEEN_NUMBERS[num].tip;
    const generalTips = GENERAL_TIPS.filter(t => !gameState.usedTips.includes(t));
    
    // Prefer number-specific tip, occasionally use general tips
    if (Math.random() < 0.7 || generalTips.length === 0) {
        return numberTip;
    }
    
    const tip = getRandomElement(generalTips);
    gameState.usedTips.push(tip);
    if (gameState.usedTips.length > 4) gameState.usedTips.shift();
    return tip;
}

// ============================================================================
// QUESTION GENERATORS
// ============================================================================

/**
 * Generate a number recognition question
 * @returns {Object} Question data
 */
function generateNumberRecognition() {
    const num = getNextNumber();
    const correctWord = TEEN_NUMBERS[num].word;
    const wrongOptions = getWrongOptions(num);
    const options = shuffleArray([correctWord, ...wrongOptions]);
    
    return {
        type: 'Number Recognition',
        instruction: 'What number is this?',
        display: `<div class="number-display">${num}</div>`,
        options,
        correctAnswer: correctWord,
        number: num
    };
}

/**
 * Generate a counting objects question
 * @returns {Object} Question data
 */
function generateCountingObjects() {
    const num = getNextNumber();
    const correctWord = TEEN_NUMBERS[num].word;
    const wrongOptions = getWrongOptions(num);
    const options = shuffleArray([correctWord, ...wrongOptions]);
    const object = getRandomElement(COUNT_OBJECTS);
    
    let objectsHTML = '<div class="objects-display">';
    for (let i = 0; i < num; i++) {
        objectsHTML += `<span class="object-item">${object}</span>`;
    }
    objectsHTML += '</div>';
    
    return {
        type: 'Count & Identify',
        instruction: 'How many objects are there?',
        display: objectsHTML,
        options,
        correctAnswer: correctWord,
        number: num
    };
}

/**
 * Generate a simple addition question
 * @returns {Object} Question data
 */
function generateAddition() {
    const num = getNextNumber();
    const problems = ADDITION_PROBLEMS[num];
    const [a, b] = getRandomElement(problems);
    const correctWord = TEEN_NUMBERS[num].word;
    const wrongOptions = getWrongOptions(num);
    const options = shuffleArray([correctWord, ...wrongOptions]);
    
    return {
        type: 'Simple Addition',
        instruction: 'What is the answer?',
        display: `
            <div class="math-display">
                <span>${a}</span>
                <span class="operator">+</span>
                <span>${b}</span>
                <span class="equals">=</span>
                <span class="result">?</span>
            </div>
        `,
        options,
        correctAnswer: correctWord,
        number: num
    };
}

/**
 * Generate a spelling check question
 * @returns {Object} Question data
 */
function generateSpellingCheck() {
    const num = getNextNumber();
    const correctWord = TEEN_NUMBERS[num].word;
    const misspellings = shuffleArray(MISSPELLINGS[correctWord]).slice(0, 3);
    const options = shuffleArray([correctWord, ...misspellings]);
    
    return {
        type: 'Spelling Check',
        instruction: 'Which one is spelled correctly?',
        display: `<div class="number-display">${num}</div>`,
        options,
        correctAnswer: correctWord,
        number: num
    };
}

/**
 * Get a random question generator
 * @returns {Function} Question generator function
 */
function getRandomQuestionType() {
    const generators = [
        generateNumberRecognition,
        generateCountingObjects,
        generateAddition,
        generateSpellingCheck
    ];
    return getRandomElement(generators);
}

// ============================================================================
// TIMER FUNCTIONS
// ============================================================================

/**
 * Start the question timer
 */
function startTimer() {
    gameState.timeRemaining = CONFIG.timePerQuestion;
    updateTimerDisplay();
    
    gameState.timerInterval = setInterval(() => {
        gameState.timeRemaining--;
        updateTimerDisplay();
        
        if (gameState.timeRemaining <= 0) {
            handleTimeout();
        }
    }, 1000);
}

/**
 * Stop the timer
 */
function stopTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
}

/**
 * Update the timer display
 */
function updateTimerDisplay() {
    elements.timerText.textContent = gameState.timeRemaining;
    
    // Calculate progress (283 is the circumference of the circle)
    const progress = (gameState.timeRemaining / CONFIG.timePerQuestion) * 283;
    elements.timerProgress.style.strokeDashoffset = 283 - progress;
    
    // Update color classes
    elements.timerRing.classList.remove('warning', 'danger');
    if (gameState.timeRemaining <= 5) {
        elements.timerRing.classList.add('danger');
    } else if (gameState.timeRemaining <= 8) {
        elements.timerRing.classList.add('warning');
    }
}

/**
 * Handle timer timeout
 */
function handleTimeout() {
    if (gameState.answered) return;
    
    stopTimer();
    gameState.answered = true;
    playTimeoutSound();
    
    // Mark incorrect
    gameState.incorrectAnswers++;
    gameState.streak = 0;
    updateStreak();
    
    // Show feedback
    showFeedback(false, 'Time\'s up!');
    showTip(gameState.currentAnswer);
    highlightCorrectAnswer();
    enableNextButton();
}

// ============================================================================
// UI UPDATE FUNCTIONS
// ============================================================================

/**
 * Update the score display
 */
function updateScore() {
    elements.score.textContent = gameState.score;
    elements.score.style.animation = 'none';
    setTimeout(() => {
        elements.score.style.animation = 'correctPulse 0.3s ease';
    }, 10);
}

/**
 * Update the streak display
 */
function updateStreak() {
    elements.streak.textContent = gameState.streak;
    elements.streakDisplay.style.display = gameState.streak > 0 ? 'flex' : 'none';
}

/**
 * Update progress bar
 */
function updateProgress() {
    const progress = (gameState.currentQuestion / CONFIG.totalQuestions) * 100;
    elements.progressFill.style.width = `${progress}%`;
    elements.currentQuestion.textContent = gameState.currentQuestion;
}

/**
 * Show feedback message
 * @param {boolean} isCorrect - Whether the answer was correct
 * @param {string} customMessage - Optional custom message
 */
function showFeedback(isCorrect, customMessage = null) {
    elements.feedbackContainer.classList.remove('correct', 'incorrect', 'show');
    
    setTimeout(() => {
        elements.feedbackContainer.classList.add(isCorrect ? 'correct' : 'incorrect', 'show');
        elements.feedbackIcon.textContent = isCorrect ? '✅' : '❌';
        elements.feedbackText.textContent = customMessage || (isCorrect ? 'Great job!' : 'Try again!');
    }, 10);
}

/**
 * Show learning tip
 * @param {number} num - The teen number
 */
function showTip(num) {
    const tip = getTip(num);
    elements.tipText.textContent = tip;
    elements.tipContainer.classList.add('show');
}

/**
 * Hide feedback and tip
 */
function hideFeedbackAndTip() {
    elements.feedbackContainer.classList.remove('show', 'correct', 'incorrect');
    elements.tipContainer.classList.remove('show');
}

/**
 * Enable the next button
 */
function enableNextButton() {
    elements.nextBtn.disabled = false;
}

/**
 * Disable the next button
 */
function disableNextButton() {
    elements.nextBtn.disabled = true;
}

/**
 * Highlight the correct answer after wrong selection
 */
function highlightCorrectAnswer() {
    const buttons = elements.optionsContainer.querySelectorAll('.option-button');
    buttons.forEach(btn => {
        if (btn.dataset.answer === gameState.currentAnswer.toString()) {
            btn.classList.add('correct');
        }
        btn.disabled = true;
    });
}

// ============================================================================
// QUESTION HANDLING
// ============================================================================

/**
 * Display a new question
 */
function displayQuestion() {
    // Get random question type and generate question
    const generator = getRandomQuestionType();
    const question = generator();
    
    gameState.currentAnswer = question.number;
    gameState.answered = false;
    
    // Update UI
    elements.questionType.textContent = question.type;
    elements.questionDisplay.innerHTML = question.display;
    elements.questionInstruction.textContent = question.instruction;
    
    // Generate option buttons
    elements.optionsContainer.innerHTML = '';
    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-button';
        button.textContent = option;
        button.dataset.answer = Object.keys(TEEN_NUMBERS).find(
            key => TEEN_NUMBERS[key].word === option
        ) || '';
        button.style.animationDelay = `${index * 0.1}s`;
        button.addEventListener('click', () => handleAnswer(option, button, question.correctAnswer));
        elements.optionsContainer.appendChild(button);
    });
    
    // Reset feedback
    hideFeedbackAndTip();
    disableNextButton();
    
    // Start timer
    startTimer();
}

/**
 * Handle user's answer selection
 * @param {string} selected - Selected answer word
 * @param {HTMLElement} button - Clicked button element
 * @param {string} correct - Correct answer word
 */
function handleAnswer(selected, button, correct) {
    if (gameState.answered) return;
    
    stopTimer();
    gameState.answered = true;
    
    const isCorrect = selected === correct;
    
    // Disable all buttons
    const buttons = elements.optionsContainer.querySelectorAll('.option-button');
    buttons.forEach(btn => btn.disabled = true);
    
    if (isCorrect) {
        // Calculate points
        const timeBonus = Math.floor((gameState.timeRemaining / CONFIG.timePerQuestion) * CONFIG.maxTimeBonus);
        const streakBonus = gameState.streak * CONFIG.streakBonus;
        const totalPoints = CONFIG.pointsCorrect + timeBonus + streakBonus;
        
        gameState.score += totalPoints;
        gameState.streak++;
        gameState.correctAnswers++;
        
        button.classList.add('correct');
        playCorrectSound();
        showFeedback(true);
        showTip(gameState.currentAnswer);
    } else {
        gameState.streak = 0;
        gameState.incorrectAnswers++;
        
        button.classList.add('incorrect');
        highlightCorrectAnswer();
        playIncorrectSound();
        showFeedback(false);
        showTip(gameState.currentAnswer);
    }
    
    updateScore();
    updateStreak();
    enableNextButton();
}

/**
 * Move to next question or end game
 */
function nextQuestion() {
    gameState.currentQuestion++;
    updateProgress();
    
    if (gameState.currentQuestion > CONFIG.totalQuestions) {
        endGame();
    } else {
        displayQuestion();
    }
}

// ============================================================================
// GAME FLOW FUNCTIONS
// ============================================================================

/**
 * Switch between screens
 * @param {HTMLElement} targetScreen - Screen to show
 */
function showScreen(targetScreen) {
    const screens = [elements.introScreen, elements.gameScreen, elements.resultsScreen];
    screens.forEach(screen => screen.classList.remove('active'));
    targetScreen.classList.add('active');
}

/**
 * Start a new game
 */
function startGame() {
    // Reset state
    gameState = {
        ...gameState,
        currentQuestion: 1,
        score: 0,
        streak: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        usedNumbers: [],
        usedTips: [],
        answered: false
    };
    
    // Update displays
    updateScore();
    updateStreak();
    updateProgress();
    
    // Show game screen
    showScreen(elements.gameScreen);
    
    // Start first question
    displayQuestion();
}

/**
 * End the game and show results
 */
function endGame() {
    stopTimer();
    
    // Calculate accuracy
    const accuracy = Math.round((gameState.correctAnswers / CONFIG.totalQuestions) * 100);
    
    // Update results display
    elements.finalScore.textContent = gameState.score;
    elements.finalCorrect.textContent = gameState.correctAnswers;
    elements.finalIncorrect.textContent = gameState.incorrectAnswers;
    elements.finalAccuracy.textContent = `${accuracy}%`;
    
    // Set motivational message based on performance
    let message = '';
    if (accuracy >= 90) {
        message = '🌟 Amazing! You\'re a teen numbers master!';
    } else if (accuracy >= 70) {
        message = '👏 Great job! Keep practicing to become a pro!';
    } else if (accuracy >= 50) {
        message = '💪 Good effort! Practice makes perfect!';
    } else {
        message = '🎯 Keep learning! You\'ll get better every time!';
    }
    elements.motivationalMessage.textContent = message;
    
    // Show results screen
    showScreen(elements.resultsScreen);
    
    // Start confetti
    startConfetti();
}

// ============================================================================
// CONFETTI CELEBRATION
// ============================================================================

/**
 * Create confetti celebration effect
 */
function startConfetti() {
    const canvas = elements.confettiCanvas;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const colors = ['#3DD8E6', '#F9C21B', '#D94A2F', '#7CC74C', '#A8D5F2', '#FF69B4'];
    
    // Create particles
    for (let i = 0; i < 150; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            size: Math.random() * 10 + 5,
            color: colors[Math.floor(Math.random() * colors.length)],
            speedY: Math.random() * 3 + 2,
            speedX: Math.random() * 4 - 2,
            rotation: Math.random() * 360,
            rotationSpeed: Math.random() * 10 - 5
        });
    }
    
    let animationFrameId;
    let frame = 0;
    const maxFrames = 300;
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
            ctx.restore();
            
            p.y += p.speedY;
            p.x += p.speedX;
            p.rotation += p.rotationSpeed;
            
            // Reset if off screen
            if (p.y > canvas.height) {
                p.y = -p.size;
                p.x = Math.random() * canvas.width;
            }
        });
        
        frame++;
        if (frame < maxFrames) {
            animationFrameId = requestAnimationFrame(animate);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    
    animate();
    
    // Cleanup on game restart
    elements.playAgainBtn.addEventListener('click', () => {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, { once: true });
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

// Start button
elements.startBtn.addEventListener('click', () => {
    playIntroSound();
    startGame();
});

// Next question button
elements.nextBtn.addEventListener('click', nextQuestion);

// Play again button
elements.playAgainBtn.addEventListener('click', () => {
    playIntroSound();
    startGame();
});

// Handle window resize for confetti canvas
window.addEventListener('resize', () => {
    if (elements.confettiCanvas) {
        elements.confettiCanvas.width = window.innerWidth;
        elements.confettiCanvas.height = window.innerHeight;
    }
});

// ============================================================================
// INITIALIZATION
// ============================================================================

// Show intro screen on load
document.addEventListener('DOMContentLoaded', () => {
    showScreen(elements.introScreen);
});
