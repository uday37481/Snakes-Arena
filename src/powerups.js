export const POWERUP_TYPES = [
    { type: 'speed', color: '#ff0' },
    { type: 'slow', color: '#0ff' },
    { type: 'double', color: '#f0f' },
    { type: 'life', color: '#fff' }
];

export class PowerUp {
    constructor(rows, cols, snakeBody, foodPos) {
        this.rows = rows;
        this.cols = cols;
        const choice = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
        this.type = choice.type;
        this.color = choice.color;
        this.position = this.randomPos(snakeBody, foodPos);
    }
