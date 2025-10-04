export class ScoreManager {
    constructor() {
        this.score = 0;
        this.highScore = Number(localStorage.getItem('snakeHighScore')) || 0;
        this.leaderboard = JSON.parse(localStorage.getItem('snakeLeaderboard') || '[]');
    }

    increase(amount) {
        this.score += amount;
        if (this.score > this.highScore) {
            this.highScore = this.score;
        }
    }

    reset() {
        this.score = 0;
    }
