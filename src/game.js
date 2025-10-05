import { Snake } from './snake.js';
import { Food } from './food.js';
import { PowerUp, POWERUP_TYPES } from './powerups.js';
import { ScoreManager } from './score.js';
import { eatSound } from './sounds.js';

export class Game {
    constructor(canvas, scoreEl, highScoreEl, powerupEl, powerupTimeEl, leaderboardEl) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.scoreEl = scoreEl;
        this.highScoreEl = highScoreEl;
        this.powerupEl = powerupEl;
        this.powerupTimeEl = powerupTimeEl;
        this.leaderboardEl = leaderboardEl;

        this.gridSize = 20;
        this.rows = canvas.height / this.gridSize;
        this.cols = canvas.width / this.gridSize;

        this.snake = new Snake(this.rows, this.cols);
        this.food = new Food(this.rows, this.cols, this.snake.body);
        this.powerup = null;
        this.scoreManager = new ScoreManager();

        this.difficulty = 'medium';
        this.speeds = { easy: 150, medium: 100, hard: 60 };
        this.speed = this.speeds[this.difficulty];
        this.running = false;
        this.paused = false;
        this.powerupTimer = 0;
        this.activePowerup = null;
        this.activePowerupTime = 0;
        this.leaderboard = this.scoreManager.getLeaderboard();
        this.updateLeaderboard();
    }
start() {
        if (this.running) return;
        this.running = true;
        this.paused = false;
        this.reset();
        this.loop();
    }

    reset() {
        this.snake = new Snake(this.rows, this.cols);
        this.food = new Food(this.rows, this.cols, this.snake.body);
        this.powerup = null;
        this.scoreManager.reset();
        this.speed = this.speeds[this.difficulty];
        this.activePowerup = null;
        this.activePowerupTime = 0;
        this.running = true;
        this.paused = false;
        this.updateScore();
        this.updatePowerup();
        this.updateLeaderboard();
        this.draw();
    }

    setDifficulty(diff) {
        this.difficulty = diff;
        this.speed = this.speeds[diff];
    }

    togglePause() {
        if (!this.running) return;
        this.paused = !this.paused;
        if (!this.paused) this.loop();
    }

    handleKey(e) {
        if (!this.running) return;
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            this.snake.changeDirection(e.key);
        }
        if (e.key === ' ') this.togglePause();
    }

    loop() {
        if (!this.running || this.paused) return;
        setTimeout(() => {
            this.update();
            this.draw();
            this.loop();
        }, this.speed);
    }
