/*
 * index.js is the main entry point for your JavaScript Snake Game application.
 * 
 * Purpose:
 * - This file is where you initialize and run your game.
 * - You typically import modules (like game.js), set up the canvas, and start the game loop here.
 * - Leaving it blank in a scaffold is common, so you can fill it in as you build your project.
 * 
 * Usage:
 * - Import your main game logic from other files.
 * - Set up the HTML5 Canvas for rendering.
 * - Start the game loop and handle user input.
 * 
 * Example (to be added as you develop):
 * import { Game } from './game.js';
 * const game = new Game();
 * game.start();
 */

// --- Main entry point ---
import { Game } from './game.js';

window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const scoreEl = document.getElementById('score');
    const highScoreEl = document.getElementById('highScore');
    const powerupEl = document.getElementById('powerup');
    const powerupTimeEl = document.getElementById('powerupTime');
    const leaderboardEl = document.getElementById('leaderboard');
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const resetBtn = document.getElementById('resetBtn');
    const difficultySel = document.getElementById('difficulty');

    const game = new Game(canvas, scoreEl, highScoreEl, powerupEl, powerupTimeEl, leaderboardEl);

    startBtn.onclick = () => game.start();
    pauseBtn.onclick = () => game.togglePause();
    resetBtn.onclick = () => game.reset();
    difficultySel.onchange = (e) => game.setDifficulty(e.target.value);

    window.addEventListener('keydown', (e) => game.handleKey(e));
});
