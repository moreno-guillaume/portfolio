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
        //Création du tableau contenant les points
       this.points = [];
       //creation du tableau de connexions
        this.connections = [];

        // Distance max pour connecter deux points
        this.maxDistance = 200;
    
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

    calculateConnections() {
        this.connections = [];
        
        // Comparer chaque point avec tous les autres
        for (let i = 0; i < this.points.length; i++) {
            for (let j = i + 1; j < this.points.length; j++) {
                const pointA = this.points[i];
                const pointB = this.points[j];
                
                // Calculer la distance entre les deux points
                const dx = pointA.x - pointB.x;
                const dy = pointA.y - pointB.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // creation d'une connexion si les points sont suffisemment proches
                if (distance < this.maxDistance) {
                    // Opacité basée sur la distance (plus proche = plus visible)
                    const opacity = (1 - distance / this.maxDistance) * 0.5;
                    
                    this.connections.push({
                        from: i,
                        to: j,
                        opacity: opacity
                    });
                }
            }
        }
        
        console.log(`${this.connections.length} connexions créées`);
    }
    draw()
    {
        // Effacer le canvas
        this.ctx.fillStyle = '#F1F4F7';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

          // Dessiner les connexions d'abord (derrière les points)
        this.connections.forEach(connection => {
            const pointA = this.points[connection.from];
            const pointB = this.points[connection.to];
            
            this.ctx.beginPath();
            this.ctx.moveTo(pointA.x, pointA.y);
            this.ctx.lineTo(pointB.x, pointB.y);
            this.ctx.strokeStyle = `rgba(94, 94, 94, ${connection.opacity})`;
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        });

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
            this.calculateConnections(); // Recalculer si besoin
            this.draw();
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new NetworkBackground();
});