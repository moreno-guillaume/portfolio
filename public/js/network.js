// JavaScript pour l'animation réseau - Étape 2 : Points fixes


// Création du canvas + points fixes ( pas d'aléatoire, pas d'anim )
class NetworkBackground {
    constructor()
    {
        this.canvas = document.getElementById('networkCanvas');
        if (!this.canvas) {
            // A voir par la suite
            console.error('Canvas introuvable');
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        //Création du tableau
        this.points = [];
        // Appel d'init
        this.init();
    }

    init()
    {
        this.setupCanvas();
        this.createFixedPoints();
        this.draw();
        this.setupEvents();
    }

    setupCanvas()
    {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        // A supprimer
        console.log(`Canvas : ${this.canvas.width}x${this.canvas.height}`);
    }

    createFixedPoints()
    {
        // 10 points de test
        this.points = [
            { x: 100, y: 100, size: 3 },
            { x: 300, y: 150, size: 5 },
            { x: 200, y: 250, size: 2 },
            { x: 400, y: 200, size: 4 },
            { x: 150, y: 350, size: 3 },
            { x: 350, y: 300, size: 2 },
            { x: 250, y: 400, size: 5 },
            { x: 500, y: 250, size: 3 },
            { x: 450, y: 400, size: 2 },
            { x: 550, y: 150, size: 4 }
        ];
        console.log(`${this.points.length} points créés`);
    }

    draw()
    {
        // Effacer le canvas
        this.ctx.fillStyle = '#F1F4F7';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Dessiner les points
        this.points.forEach(point => {
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
            this.ctx.fillStyle = '#5E5E5E';
            this.ctx.fill();
        });
    }

    setupEvents()
    {
        window.addEventListener('resize', () => {
            this.setupCanvas();
            this.draw();
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new NetworkBackground();
});