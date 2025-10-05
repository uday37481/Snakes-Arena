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

    update() {
        // Snake movement
        const ateFood = this.snake.move(this.food.position);

        // Power-up logic
        if (this.powerup && this.snake.headEquals(this.powerup.position)) {
            this.applyPowerup(this.powerup.type);
            this.powerup = null;
        }

        // Food eaten
        if (ateFood) {
            try {
                eatSound.currentTime = 0;
                eatSound.play();
            } catch (e) {}
            this.scoreManager.increase(this.activePowerup === 'double' ? 2 : 1);
            this.food.spawn(this.snake.body);
            // Speed up with score milestones
            if (this.scoreManager.score % 5 === 0 && this.speed > 40) this.speed -= 5;
        }

        // Power-up spawn
        if (!this.powerup && Math.random() < 0.02) {
            this.powerup = new PowerUp(this.rows, this.cols, this.snake.body, this.food.position);
            this.powerupTimer = 150; // ~15 seconds
        }

        // Power-up timer
        if (this.powerup) {
            this.powerupTimer--;
            if (this.powerupTimer <= 0) this.powerup = null;
        }

        // Active power-up timer
        if (this.activePowerup) {
            this.activePowerupTime--;
            if (this.activePowerupTime <= 0) this.activePowerup = null;
        }

        // Collision detection
        if (this.snake.checkCollision(this.rows, this.cols)) {
            this.running = false;
            this.scoreManager.saveHighScore();
            this.updateLeaderboard();
        }

        this.updateScore();
        this.updatePowerup();
    }

    applyPowerup(type) {
        switch (type) {
            case 'speed':
                this.speed = Math.max(30, this.speed - 30);
                this.activePowerup = 'speed';
                this.activePowerupTime = 50;
                break;
            case 'slow':
                this.speed = Math.min(200, this.speed + 50);
                this.activePowerup = 'slow';
                this.activePowerupTime = 50;
                break;
            case 'double':
                this.activePowerup = 'double';
                this.activePowerupTime = 50;
                break;
            case 'life':
                this.snake.extraLife();
                this.activePowerup = 'life';
                this.activePowerupTime = 1;
                break;
        }
    }

    updateScore() {
        this.scoreEl.textContent = this.scoreManager.score;
        this.highScoreEl.textContent = this.scoreManager.highScore;
    }

    updatePowerup() {
        this.powerupEl.textContent = this.activePowerup ? this.activePowerup : 'None';
        this.powerupTimeEl.textContent = this.activePowerup ? Math.ceil(this.activePowerupTime / 10) : '0';
    }

    updateLeaderboard() {
        let html = '<h3>Leaderboard</h3><ol style="transition: opacity 0.5s; opacity: 1;">';
        this.leaderboard = this.scoreManager.getLeaderboard();
        for (let i = 0; i < this.leaderboard.length; i++) {
            const score = this.leaderboard[i];
            const highlight = score === this.scoreManager.score ? ' style="background:#333;color:#ff0;border-radius:6px;"' : '';
            html += `<li${highlight}><strong>Player</strong>: ${score}</li>`;
        }
        html += '</ol>';
        this.leaderboardEl.innerHTML = html;
        this.leaderboardEl.style.opacity = 0;
        setTimeout(() => { this.leaderboardEl.style.opacity = 1; }, 100);
    }

    draw() {
        // Clear
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw snake
        for (let i = 0; i < this.snake.body.length; i++) {
            let [x, y] = this.snake.body[i];
            if (i === 0) {
                // Head with eyes
                this.ctx.fillStyle = '#0f0';
                this.roundRect(
                    x * this.gridSize, y * this.gridSize,
                    this.gridSize, this.gridSize, 8, true, false
                );
                // Eyes
                this.ctx.fillStyle = '#222';
                let eyeOffset = this.snake.direction === 'ArrowUp' ? [6, 2] :
                                this.snake.direction === 'ArrowDown' ? [6, 14] :
                                this.snake.direction === 'ArrowLeft' ? [2, 6] : [14, 6];
                this.ctx.beginPath();
                this.ctx.arc(x * this.gridSize + eyeOffset[0], y * this.gridSize + eyeOffset[1], 3, 0, 2 * Math.PI);
                this.ctx.arc(x * this.gridSize + eyeOffset[0] + 6, y * this.gridSize + eyeOffset[1], 3, 0, 2 * Math.PI);
                this.ctx.fill();
            } else if (i === this.snake.body.length - 1) {
                // Tail
                this.ctx.fillStyle = '#093';
                this.roundRect(
                    x * this.gridSize, y * this.gridSize,
                    this.gridSize, this.gridSize, 10, true, false
                );
            } else {
                // Body
                this.ctx.fillStyle = '#3f3';
                this.roundRect(
                    x * this.gridSize, y * this.gridSize,
                    this.gridSize, this.gridSize, 6, true, false
                );
            }
        }

        // Draw food
        this.ctx.fillStyle = '#f00';
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.position[0] * this.gridSize + this.gridSize / 2,
            this.food.position[1] * this.gridSize + this.gridSize / 2,
            this.gridSize / 2.2, 0, 2 * Math.PI
        );
        this.ctx.fill();

        // Draw power-up
        if (this.powerup) {
            this.ctx.save();
            this.ctx.globalAlpha = 0.8;
            this.ctx.fillStyle = this.powerup.color;
            this.ctx.beginPath();
            this.ctx.arc(
                this.powerup.position[0] * this.gridSize + this.gridSize / 2,
                this.powerup.position[1] * this.gridSize + this.gridSize / 2,
                this.gridSize / 2, 0, 2 * Math.PI
            );
            this.ctx.fill();
            this.ctx.restore();
        }

        // Game over text with fade-in
        if (!this.running) {
            this.ctx.save();
            this.ctx.globalAlpha = 0.1;
            this.ctx.fillStyle = '#fff';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.restore();

            this.ctx.save();
            this.ctx.globalAlpha = 1;
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '32px sans-serif';
            this.ctx.fillText('Game Over', 100, 200);
            this.ctx.restore();
        }
    }

    // Helper for rounded rectangles
    roundRect(x, y, w, h, r, fill, stroke) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + r, y);
        this.ctx.lineTo(x + w - r, y);
        this.ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        this.ctx.lineTo(x + w, y + h - r);
        this.ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        this.ctx.lineTo(x + r, y + h);
        this.ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        this.ctx.lineTo(x, y + r);
        this.ctx.quadraticCurveTo(x, y, x + r, y);
        this.ctx.closePath();
        if (fill) this.ctx.fill();
        if (stroke) this.ctx.stroke();
    }
}
