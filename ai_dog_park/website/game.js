class AITermsGame {
    constructor() {
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.gameStarted = false;
        this.questionAnswered = false;
        this.dogs = [];
        this.availableDogs = 10; // Number of dogs available to be placed
        this.dogsInPark = 0; // Number of dogs already in the park
        this.totalDefinitions = 0; // Total number of definitions in JSON
        
        this.initializeElements();
        this.loadQuestions();
    }
    
    initializeElements() {
        // Screen elements
        this.loadingScreen = document.getElementById('loading-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.finalScreen = document.getElementById('final-screen');
        
        // Game elements
        this.scoreElement = document.getElementById('score');
        this.currentQuestionElement = document.getElementById('current-question');
        this.totalQuestionsElement = document.getElementById('total-questions');
        this.progressFill = document.getElementById('progress-fill');
        this.definitionText = document.getElementById('definition-text');
        this.answersGrid = document.getElementById('answers-grid');
        this.gameNameElement = document.getElementById('game-name');
        
        // Dog elements
        this.walkingDogsContainer = document.getElementById('walking-dogs-container');
        this.dogParkContainer = document.getElementById('dog-park-container');
        
        // Control elements
        this.nextQuestionBtn = document.getElementById('next-question');
        this.restartGameBtn = document.getElementById('restart-game');
        this.playAgainBtn = document.getElementById('play-again');
        
        // Final screen elements
        this.finalScore = document.getElementById('final-score');
        this.finalTotal = document.getElementById('final-total');
        this.performanceFeedback = document.getElementById('performance-feedback');
        
        // Event listeners
        this.nextQuestionBtn.addEventListener('click', () => this.nextQuestion());
        this.restartGameBtn.addEventListener('click', () => this.restartGame());
        this.playAgainBtn.addEventListener('click', () => this.restartGame());
    }
    
    createDog(index, direction = null) {
        const dogContainer = document.createElement('div');
        dogContainer.className = 'css-dog';
        dogContainer.id = `dog-${index}`;
        
        dogContainer.innerHTML = `
            <div class="dog-flipper">
                <div class="dog-head">
                    <div class="dog-ear ear-left"></div>
                    <div class="dog-eye eye-left"></div>
                    <div class="dog-eye eye-right"></div>
                    <div class="dog-nose"></div>
                </div>
                <div class="dog-snout"></div>
                <div class="dog-body"></div>
                <div class="dog-leg leg-fl"></div>
                <div class="dog-leg leg-fr"></div>
                <div class="dog-leg leg-bl"></div>
                <div class="dog-leg leg-br"></div>
                <div class="dog-tail"></div>
            </div>
        `;
        
        return dogContainer;
    }
    
    initializeDogs() {
        // Clear existing dogs
        this.walkingDogsContainer.innerHTML = '';
        this.dogParkContainer.innerHTML = '';
        this.dogs = [];
        this.dogsInPark = 0;
        
        // Set total definitions count
        this.totalDefinitions = this.questions.length;
        
        // Initialize available dogs to 10
        this.availableDogs = 10;
        
        // Create only the available dogs (10)
        for (let i = 0; i < this.availableDogs; i++) {
            const dogWrapper = document.createElement('div');
            dogWrapper.className = 'dog-wrapper';
            
            // Set initial position and walking direction
            const direction = Math.random() > 0.5 ? 'walking-right' : 'walking-left';
            dogWrapper.classList.add(direction);
            
            // Create dog with appropriate direction
            const dog = this.createDog(i, direction);
            dogWrapper.appendChild(dog);
            
            // Random vertical position (adjusted for smaller container)
            dogWrapper.style.top = `${Math.random() * 5}px`;
            
            // Random animation delay
            dogWrapper.style.animationDelay = `${Math.random() * 12}s`;
            
            this.walkingDogsContainer.appendChild(dogWrapper);
            this.dogs.push({
                element: dogWrapper,
                dogElement: dog,
                inPark: false,
                id: i,
                currentDirection: direction
            });
        }
        
        // Update UI to show dog counts
        this.updateDogCountDisplay();
    }
    
    moveDogToPark() {
        // Check if we can move a dog to the park
        if (!this.canMoveDogToPark()) {
            console.log('Cannot move dog to park - would exceed total definitions');
            return;
        }
        
        // Find the first dog not in the park
        const availableDog = this.dogs.find(dog => !dog.inPark);
        
        if (availableDog) {
            availableDog.inPark = true;
            const dogWrapper = availableDog.element;
            const dogElement = availableDog.dogElement;
            
            // Remove from walking container
            if (dogWrapper.parentNode === this.walkingDogsContainer) {
                this.walkingDogsContainer.removeChild(dogWrapper);
            }
            
            // Remove walking animation classes
            dogWrapper.classList.remove('walking-right', 'walking-left');
            
            // Add to park with new animation
            const parkDirection = Math.random() > 0.5 ? 'walking-right' : 'walking-left';
            dogWrapper.classList.add(parkDirection);
            
            // Update dog direction based on new direction
            if (parkDirection === 'walking-left') {
                dogWrapper.style.transform = 'scaleX(-1)';
            }
            
            // Random position in park (adjusted for smaller container)
            dogWrapper.style.top = `${-10 + Math.random() * 5}px`;
            dogWrapper.style.animationDuration = '16s'; // Even slower in the park
            
            this.dogParkContainer.appendChild(dogWrapper);
            
            // Update counts
            this.dogsInPark++;
            this.updateAvailableDogs();
            this.updateDogCountDisplay();
        }
    }
    
    canMoveDogToPark() {
        // Check if moving a dog would exceed the total definitions
        return (this.dogsInPark + this.availableDogs) <= this.totalDefinitions;
    }
    
    flipDogsOutsidePark() {
        // Get all dogs that are not in the park
        const dogsOutsidePark = this.dogs.filter(dog => !dog.inPark);
        
        dogsOutsidePark.forEach((dog, index) => {
            // Add a small delay for each dog to create a wave effect
            setTimeout(() => {
                const dogWrapper = dog.element;
                const dogElement = dog.dogElement;
                const dogFlipper = dogElement.querySelector('.dog-flipper');
                
                // Pause the walking animation
                dogWrapper.style.animationPlayState = 'paused';
                
                // Add the flipping animation class
                dogFlipper.classList.add('dog-flipping');
                
                // Remove the animation class and resume walking after it completes
                setTimeout(() => {
                    dogFlipper.classList.remove('dog-flipping');
                    // Resume the walking animation
                    dogWrapper.style.animationPlayState = 'running';
                }, 1500); // Match the animation duration (1.5s)
            }, index * 100); // Stagger the animations by 100ms
        });
    }
    
    updateAvailableDogs() {
        // Calculate how many dogs should be available
        const totalDogsAllowed = this.totalDefinitions - this.dogsInPark;
        
        // Keep available dogs at 10 until we need to reduce
        if (totalDogsAllowed >= 10) {
            this.availableDogs = 10;
        } else {
            this.availableDogs = totalDogsAllowed;
        }
        
        // Add new dogs if needed (when dogs in park increases but we still have room)
        const currentWalkingDogs = this.dogs.filter(dog => !dog.inPark).length;
        const dogsToAdd = this.availableDogs - currentWalkingDogs;
        
        if (dogsToAdd > 0) {
            for (let i = 0; i < dogsToAdd; i++) {
                const newId = this.dogs.length;
                const dogWrapper = document.createElement('div');
                dogWrapper.className = 'dog-wrapper';
                
                // Set initial position and walking direction
                const direction = Math.random() > 0.5 ? 'walking-right' : 'walking-left';
                dogWrapper.classList.add(direction);
                
                // Create dog with appropriate direction
                const dog = this.createDog(newId, direction);
                dogWrapper.appendChild(dog);
                
                // Random vertical position
                dogWrapper.style.top = `${Math.random() * 5}px`;
                
                // Random animation delay
                dogWrapper.style.animationDelay = `${Math.random() * 12}s`;
                
                this.walkingDogsContainer.appendChild(dogWrapper);
                this.dogs.push({
                    element: dogWrapper,
                    dogElement: dog,
                    inPark: false,
                    id: newId,
                    currentDirection: direction
                });
            }
        }
    }
    
    updateDogCountDisplay() {
        // Update UI elements if they exist (you may want to add these to your HTML)
        const availableDogsElement = document.getElementById('available-dogs-count');
        const parkedDogsElement = document.getElementById('parked-dogs-count');
        
        if (availableDogsElement) {
            availableDogsElement.textContent = this.availableDogs;
        }
        if (parkedDogsElement) {
            parkedDogsElement.textContent = this.dogsInPark;
        }
        
        // Log for debugging
        console.log(`Dogs in park: ${this.dogsInPark}, Available dogs: ${this.availableDogs}, Total definitions: ${this.totalDefinitions}`);
    }
    
    loadQuestions() {
        try {
            // Check if terms variable exists
            if (typeof terms === 'undefined') {
                throw new Error('terms variable not found. Make sure terms.js is loaded before game.js');
            }

            const data = terms;

            // Set the game name
            if (data.game_name && this.gameNameElement) {
                this.gameNameElement.textContent = data.game_name;
            }

            // Convert the JSON data to question format
            this.questions = this.processQuestionsData(data);
            this.shuffleArray(this.questions);
            
            // Hide loading screen and start game
            this.loadingScreen.classList.add('hidden');
            this.startGame();
            
        } catch (error) {
            console.error('Error loading questions:', error);
            this.showError('Failed to load questions. Please check that terms.js is loaded properly.', error);
        }
    }
    
    processQuestionsData(data) {
        const questions = [];
        
        // Check if data has a terms array
        const terms = data.terms;
        
        if (!Array.isArray(terms)) {
            throw new Error('Invalid JSON format: expected an array of terms');
        }
        
        terms.forEach(term => {
            if (term.term && term.definition) {
                questions.push({
                    definition: term.definition,
                    correctAnswer: term.term,
                    difficulty: term.difficulty || 'medium'
                });
            }
        });
        
        if (questions.length === 0) {
            throw new Error('No valid questions found in the JSON file');
        }
        
        return questions;
    }
    
    generateAnswerChoices(correctAnswer, allQuestions) {
        const choices = [correctAnswer];
        const otherAnswers = allQuestions
            .map(q => q.correctAnswer)
            .filter(answer => answer !== correctAnswer);
        
        // Add 3 random wrong answers
        while (choices.length < 4 && otherAnswers.length > 0) {
            const randomIndex = Math.floor(Math.random() * otherAnswers.length);
            const randomAnswer = otherAnswers.splice(randomIndex, 1)[0];
            choices.push(randomAnswer);
        }
        
        // If we don't have enough questions, pad with generic wrong answers
        while (choices.length < 4) {
            choices.push(`Option ${choices.length}`);
        }
        
        this.shuffleArray(choices);
        return choices;
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    startGame() {
        this.gameStarted = true;
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.questionAnswered = false;
        
        this.totalQuestionsElement.textContent = this.questions.length;
        this.updateScore();
        this.updateProgress();
        
        this.gameScreen.classList.remove('hidden');
        this.finalScreen.classList.add('hidden');
        
        // Initialize dogs
        this.initializeDogs();
        
        this.showQuestion();
    }
    
    showQuestion() {
        if (this.currentQuestionIndex >= this.questions.length) {
            this.endGame();
            return;
        }
        
        this.questionAnswered = false;
        const currentQuestion = this.questions[this.currentQuestionIndex];
        
        // Update question display
        this.currentQuestionElement.textContent = this.currentQuestionIndex + 1;
        this.definitionText.textContent = currentQuestion.definition;
        
        // Generate answer choices
        const choices = this.generateAnswerChoices(currentQuestion.correctAnswer, this.questions);
        
        // Clear previous answers
        this.answersGrid.innerHTML = '';
        
        // Create answer buttons
        choices.forEach(choice => {
            const button = document.createElement('button');
            button.className = 'answer-btn';
            button.textContent = choice;
            button.addEventListener('click', () => this.selectAnswer(choice, currentQuestion.correctAnswer));
            this.answersGrid.appendChild(button);
        });
        
        // Hide next question button
        this.nextQuestionBtn.classList.add('hidden');
        this.restartGameBtn.classList.add('hidden');
        
        // Update progress
        this.updateProgress();
    }
    
    selectAnswer(selectedAnswer, correctAnswer) {
        if (this.questionAnswered) return;
        
        this.questionAnswered = true;
        const isCorrect = selectedAnswer === correctAnswer;
        
        // Disable all buttons and show results
        const buttons = this.answersGrid.querySelectorAll('.answer-btn');
        buttons.forEach(button => {
            button.classList.add('disabled');
            
            if (button.textContent === correctAnswer) {
                button.classList.add('correct');
            } else if (button.textContent === selectedAnswer && !isCorrect) {
                button.classList.add('incorrect');
            }
        });
        
        // Update score and move dog if correct, or make dogs flip if incorrect
        if (isCorrect) {
            this.score++;
            this.updateScore();
            
            // Move a dog to the park
            setTimeout(() => {
                this.moveDogToPark();
            }, 500);
        } else {
            // Make all dogs outside the park flip
            this.flipDogsOutsidePark();
        }
        
        // Show next question button or end game
        setTimeout(() => {
            if (this.currentQuestionIndex < this.questions.length - 1) {
                this.nextQuestionBtn.classList.remove('hidden');
            } else {
                // Last question - show end game option
                this.restartGameBtn.classList.remove('hidden');
                setTimeout(() => this.endGame(), 2000);
            }
        }, 500);
    }
    
    
    nextQuestion() {
        this.currentQuestionIndex++;
        this.showQuestion();
    }
    
    updateScore() {
        this.scoreElement.textContent = this.score;
    }
    
    updateProgress() {
        const progress = ((this.currentQuestionIndex) / this.questions.length) * 100;
        this.progressFill.style.width = `${progress}%`;
    }
    
    endGame() {
        this.gameScreen.classList.add('hidden');
        this.finalScreen.classList.remove('hidden');
        
        // Update final score
        this.finalScore.textContent = this.score;
        this.finalTotal.textContent = this.questions.length;
        
        // Calculate percentage and provide feedback
        const percentage = (this.score / this.questions.length) * 100;
        this.showPerformanceFeedback(percentage);
        
        // Update progress to 100%
        this.progressFill.style.width = '100%';
    }
    
    showPerformanceFeedback(percentage) {
        let message, className;
        
        if (percentage >= 80) {
            message = "🏆 Excellent! You're an AI expert! All the dogs are happy in the park!";
            className = 'excellent';
        } else if (percentage >= 60) {
            message = "👍 Good job! You saved many dogs! Keep learning to save them all!";
            className = 'good';
        } else {
            message = "📚 Keep studying! The more you learn, the more dogs you can save!";
            className = 'needs-improvement';
        }
        
        this.performanceFeedback.textContent = message;
        this.performanceFeedback.className = `performance-feedback ${className}`;
    }
    
    restartGame() {
        // Shuffle questions again for variety
        this.shuffleArray(this.questions);
        this.startGame();
    }
    
    showError(message, error) {
        let errorMessage = `<p>${message}</p>`;
        if (error) {
            errorMessage += `<p style="color: #ff0000; font-family: monospace; margin-top: 10px;">${error.toString()}</p>`;
        }

        this.loadingScreen.innerHTML = `
            <div style="text-align: center; color: #f44336;">
                <h2>⚠️ Error</h2>
                ${errorMessage}
                <p style="margin-top: 20px; font-size: 0.9em; color: #666;">
                    Make sure the 'terms.js' file is loaded properly and contains the terms variable.<br>
                    The data should have the following structure:<br>
                    <code style="background: #f5f5f5; padding: 10px; border-radius: 5px; display: inline-block; margin-top: 10px;">
                    const terms = {<br>
                    &nbsp;&nbsp;"game_name": "Your Game Name",<br>
                    &nbsp;&nbsp;"terms": [<br>
                    &nbsp;&nbsp;&nbsp;&nbsp;{<br>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"term": "Machine Learning",<br>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"definition": "A subset of AI..."<br>
                    &nbsp;&nbsp;&nbsp;&nbsp;}<br>
                    &nbsp;&nbsp;]<br>
                    };
                    </code>
                </p>
            </div>
        `;
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new AITermsGame();
});
