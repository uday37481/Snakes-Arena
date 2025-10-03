class Food {
    constructor() {
        this.position = this.spawn();
    }

    spawn() {
        const x = Math.floor(Math.random() * canvas.width / 10) * 10;
        const y = Math.floor(Math.random() * canvas.height / 10) * 10;
        return { x, y };
    }
}

export default Food;
