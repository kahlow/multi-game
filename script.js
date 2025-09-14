class MultiplicationGame {
    constructor() {
        this.currentQuestion = 0;
        this.totalQuestions = 20;
        this.score = 0;
        this.wrongAnswers = this.loadWrongAnswers();
        this.currentProblem = null;
        this.gameStarted = false;

        this.funnyMessages = {
            correct: [
                "🎉 BOOM! You crushed it like a bug!",
                "💥 SICK! That answer was slimier than a slug!",
                "🚀 RADICAL! You're more accurate than a ninja!",
                "🤖 LEGENDARY! That was grosser than picking your nose!",
                "⚡ WICKED! You're on fire like a dragon!",
                "🎯 NASTY! In the best way possible!",
                "💪 BEAST MODE! You smashed it like a hammer!",
                "🔥 STELLAR! That was cooler than frozen snot!"
            ],
            incorrect: [
                "💀 Oops! That answer was as wrong as putting ketchup on ice cream!",
                "🤢 Yikes! Close, but not quite - try again, booger brain!",
                "👽 Nope! That's more wrong than alien homework!",
                "🦠 Uh oh! That answer needs to go back to math jail!",
                "🤮 Whoopsie! That's grosser than expired milk!",
                "🧟 Not quite! Even zombies could do better!",
                "💩 Almost! But that answer stinks worse than my gym socks!",
                "🐛 Try again! That answer crawled away like a scared worm!"
            ]
        };

        this.initializeEventListeners();
        this.loadGameData();
    }

    loadWrongAnswers() {
        try {
            const saved = localStorage.getItem('multiplication_wrong_answers');
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.error('Error loading wrong answers:', error);
            return {};
        }
    }

    saveWrongAnswers() {
        try {
            localStorage.setItem('multiplication_wrong_answers', JSON.stringify(this.wrongAnswers));
        } catch (error) {
            console.error('Error saving wrong answers:', error);
        }
    }

    loadGameData() {
        try {
            const saved = localStorage.getItem('multiplication_game_data');
            if (saved) {
                const data = JSON.parse(saved);
                this.wrongAnswers = { ...this.wrongAnswers, ...data.wrongAnswers };
            }
        } catch (error) {
            console.error('Error loading game data:', error);
        }
    }

    saveGameData() {
        try {
            const data = {
                wrongAnswers: this.wrongAnswers,
                lastPlayed: new Date().toISOString()
            };
            localStorage.setItem('multiplication_game_data', JSON.stringify(data));
        } catch (error) {
            console.error('Error saving game data:', error);
        }
    }

    initializeEventListeners() {
        document.getElementById('start-game').addEventListener('click', () => this.startGame());
        document.getElementById('play-again').addEventListener('click', () => this.resetGame());
        document.getElementById('practice-missed').addEventListener('click', () => this.startPracticeMode());
    }

    startGame() {
        const questionCount = parseInt(document.getElementById('question-count').value);
        if (questionCount < 5 || questionCount > 200) {
            alert('Please enter a number between 5 and 200!');
            return;
        }

        this.totalQuestions = questionCount;
        this.currentQuestion = 0;
        this.score = 0;
        this.gameStarted = true;
        this.missedProblems = [];

        this.showScreen('game-screen');
        this.updateProgress();
        this.generateQuestion();
    }

    startPracticeMode() {
        const missedKeys = Object.keys(this.wrongAnswers);
        if (missedKeys.length === 0) {
            alert("Great job! You don't have any missed problems to practice!");
            return;
        }

        this.totalQuestions = Math.min(missedKeys.length * 3, 50);
        this.currentQuestion = 0;
        this.score = 0;
        this.gameStarted = true;
        this.practiceMode = true;
        this.missedProblems = [];

        this.showScreen('game-screen');
        this.updateProgress();
        this.generateQuestion();
    }

    generateQuestion() {
        let num1, num2;

        if (this.practiceMode && Object.keys(this.wrongAnswers).length > 0) {
            const wrongKeys = Object.keys(this.wrongAnswers);
            const randomKey = wrongKeys[Math.floor(Math.random() * wrongKeys.length)];
            [num1, num2] = randomKey.split('x').map(n => parseInt(n));
        } else {
            num1 = this.getWeightedNumber();
            num2 = this.getWeightedNumber();
        }

        this.currentProblem = { num1, num2, answer: num1 * num2 };

        document.getElementById('question').textContent = `${num1} × ${num2} = ?`;
        this.generateAnswerChoices();
        this.clearFeedback();
    }

    getWeightedNumber() {
        const weights = [];
        for (let i = 0; i <= 9; i++) {
            let weight = 1;
            if (i >= 6) weight = 3;
            if (this.wrongAnswers[`${i}x${i}`] ||
                Object.keys(this.wrongAnswers).some(key => key.includes(`${i}x`) || key.includes(`x${i}`))) {
                weight = 4;
            }

            for (let j = 0; j < weight; j++) {
                weights.push(i);
            }
        }

        return weights[Math.floor(Math.random() * weights.length)];
    }

    generateAnswerChoices() {
        const correctAnswer = this.currentProblem.answer;
        const choices = new Set([correctAnswer]);

        while (choices.size < 4) {
            const variation = Math.floor(Math.random() * 4);
            let wrongAnswer;

            switch (variation) {
                case 0:
                    wrongAnswer = correctAnswer + Math.floor(Math.random() * 10) + 1;
                    break;
                case 1:
                    wrongAnswer = Math.max(1, correctAnswer - Math.floor(Math.random() * 10) - 1);
                    break;
                case 2:
                    wrongAnswer = this.currentProblem.num1 * (this.currentProblem.num2 + 1);
                    break;
                case 3:
                    wrongAnswer = this.currentProblem.num1 * Math.max(0, this.currentProblem.num2 - 1);
                    break;
            }

            if (wrongAnswer > 0 && wrongAnswer <= 100) {
                choices.add(wrongAnswer);
            }
        }

        const shuffled = Array.from(choices).sort(() => Math.random() - 0.5);
        const answerButtons = document.querySelectorAll('.answer-btn');

        answerButtons.forEach((btn, index) => {
            btn.textContent = shuffled[index];
            btn.dataset.answer = shuffled[index];
            btn.className = 'answer-btn';
            btn.onclick = () => this.checkAnswer(parseInt(shuffled[index]), btn);
        });
    }

    checkAnswer(selectedAnswer, buttonElement) {
        const isCorrect = selectedAnswer === this.currentProblem.answer;
        const buttons = document.querySelectorAll('.answer-btn');

        buttons.forEach(btn => {
            btn.onclick = null;
            const btnAnswer = parseInt(btn.dataset.answer);
            if (btnAnswer === this.currentProblem.answer) {
                btn.classList.add('correct');
            } else if (btn === buttonElement && !isCorrect) {
                btn.classList.add('incorrect');
            }
        });

        if (isCorrect) {
            this.score++;
            this.showFeedback(this.getRandomMessage('correct'), 'correct');
        } else {
            const problemKey = `${this.currentProblem.num1}x${this.currentProblem.num2}`;
            this.wrongAnswers[problemKey] = (this.wrongAnswers[problemKey] || 0) + 1;
            this.missedProblems.push({
                problem: `${this.currentProblem.num1} × ${this.currentProblem.num2}`,
                correctAnswer: this.currentProblem.answer,
                selectedAnswer: selectedAnswer
            });
            this.showFeedback(this.getRandomMessage('incorrect'), 'incorrect');
        }

        this.updateScore();
        this.saveWrongAnswers();

        setTimeout(() => {
            this.currentQuestion++;
            if (this.currentQuestion < this.totalQuestions) {
                this.updateProgress();
                this.generateQuestion();
            } else {
                this.endGame();
            }
        }, 2000);
    }

    getRandomMessage(type) {
        const messages = this.funnyMessages[type];
        return messages[Math.floor(Math.random() * messages.length)];
    }

    showFeedback(message, type) {
        const feedback = document.getElementById('feedback');
        feedback.textContent = message;
        feedback.className = `feedback ${type}`;
    }

    clearFeedback() {
        const feedback = document.getElementById('feedback');
        feedback.textContent = '';
        feedback.className = 'feedback';
    }

    updateScore() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('total').textContent = this.currentQuestion + 1;
        const accuracy = Math.round((this.score / (this.currentQuestion + 1)) * 100);
        document.getElementById('accuracy').textContent = `${accuracy}%`;
    }

    updateProgress() {
        const progress = ((this.currentQuestion) / this.totalQuestions) * 100;
        document.getElementById('progress-fill').style.width = `${progress}%`;
        document.getElementById('progress-text').textContent =
            `Question ${this.currentQuestion + 1} of ${this.totalQuestions}`;
    }

    endGame() {
        this.gameStarted = false;
        this.practiceMode = false;
        this.saveGameData();

        const finalScore = `${this.score}/${this.totalQuestions}`;
        const finalAccuracy = Math.round((this.score / this.totalQuestions) * 100);

        document.getElementById('final-score').textContent = finalScore;
        document.getElementById('final-accuracy').textContent = `${finalAccuracy}%`;

        this.displayMissedProblems();
        this.showScreen('results-screen');
    }

    displayMissedProblems() {
        const missedList = document.getElementById('missed-list');
        const missedSection = document.getElementById('missed-problems');

        if (this.missedProblems.length === 0) {
            missedSection.style.display = 'none';
        } else {
            missedSection.style.display = 'block';
            missedList.innerHTML = '';

            this.missedProblems.forEach(problem => {
                const problemDiv = document.createElement('div');
                problemDiv.className = 'missed-problem';
                problemDiv.innerHTML = `
                    <strong>${problem.problem} = ${problem.correctAnswer}</strong>
                    <span style="color: #ff6b6b; margin-left: 15px;">
                        (You answered: ${problem.selectedAnswer})
                    </span>
                `;
                missedList.appendChild(problemDiv);
            });
        }
    }

    resetGame() {
        this.currentQuestion = 0;
        this.score = 0;
        this.gameStarted = false;
        this.practiceMode = false;
        this.missedProblems = [];

        document.getElementById('question-count').value = 20;
        this.showScreen('setup-screen');
    }

    showScreen(screenId) {
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => screen.classList.add('hidden'));
        document.getElementById(screenId).classList.remove('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MultiplicationGame();
});