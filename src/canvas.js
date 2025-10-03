class Canvas {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.context = this.canvas.getContext('2d');
    }

    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawSnake(snake) {
        this.context.fillStyle = 'green';
        snake.body.forEach(segment => {
            this.context.fillRect(segment.x, segment.y, 10, 10);
        });
    }

    drawFood(food) {
        this.context.fillStyle = 'red';
        this.context.fillRect(food.position.x, food.position.y, 10, 10);
    }
}

export default Canvas;
