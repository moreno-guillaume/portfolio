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
    
         // Animation
        this.animationId = null;
        this.startTime = Date.now();

            // Position de la souris
        this.mouse = { x: 0, y: 0 };
        // influences suggérées par l'ia, à contrôler
        this.mouseInfluenceRadius = 120;
        this.mouseInfluenceStrength = 30;

        // Appel d'init
        this.init();
    }

    init()
    {
        this.setupCanvas();
        this.createAnimatedPoints();
        this.setupMouseEvents();
        this.startAnimation();
        this.setupEvents();
        this.draw();
    }


    setupCanvas()
    {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        // A supprimer
        console.log(`Canvas : ${this.canvas.width}x${this.canvas.height}`);
    }

    /*createFixedPoints()
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
    }*/

         createAnimatedPoints() {
        // Créer 10 points avec position de base et paramètres d'animation
        this.points = [
            { baseX: 100, baseY: 100, x: 100, y: 100, size: 3, speed: 0.8, phaseX: 0, phaseY: 1 },
            { baseX: 300, baseY: 150, x: 300, y: 150, size: 5, speed: 0.6, phaseX: 2, phaseY: 0.5 },
            { baseX: 200, baseY: 250, x: 200, y: 250, size: 2, speed: 1.0, phaseX: 4, phaseY: 2 },
            { baseX: 400, baseY: 200, x: 400, y: 200, size: 4, speed: 0.7, phaseX: 1, phaseY: 3 },
            { baseX: 150, baseY: 350, x: 150, y: 350, size: 3, speed: 0.9, phaseX: 3, phaseY: 1.5 },
            { baseX: 350, baseY: 300, x: 350, y: 300, size: 2, speed: 0.5, phaseX: 5, phaseY: 0 },
            { baseX: 250, baseY: 400, x: 250, y: 400, size: 5, speed: 0.8, phaseX: 2.5, phaseY: 4 },
            { baseX: 500, baseY: 250, x: 500, y: 250, size: 3, speed: 1.1, phaseX: 1.5, phaseY: 2.5 },
            { baseX: 450, baseY: 400, x: 450, y: 400, size: 2, speed: 0.6, phaseX: 3.5, phaseY: 1 },
            { baseX: 550, baseY: 150, x: 550, y: 150, size: 4, speed: 0.7, phaseX: 0.5, phaseY: 3.5 }
        ];
        console.log(`${this.points.length} points animés créés`);
    }

   setupMouseEvents() {
        // Suivre le mouvement de la souris
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        
        console.log('Événements souris configurés');
    }

        updatePoints() {
        const time = (Date.now() - this.startTime) * 0.001; // Temps en secondes
        
        this.points.forEach(point => {
            // Mouvement organique lent avec des sinus/cosinus
            const offsetX = Math.sin(time * point.speed + point.phaseX) * 20;
            const offsetY = Math.cos(time * point.speed + point.phaseY) * 15;

            // Calcul de l'influence de la souris
            const dx = this.mouse.x - point.baseX;
            const dy = this.mouse.y - point.baseY;
            const distanceToMouse = Math.sqrt(dx * dx + dy * dy);
            
            let mouseOffsetX = 0;
            let mouseOffsetY = 0;
            
       // Si la souris est dans la zone d'influence
            if (distanceToMouse < this.mouseInfluenceRadius) {
                // Calcul de l'influence (1 = max, 0 = aucune)
                const influence = 1 - (distanceToMouse / this.mouseInfluenceRadius);
                
                // Direction pour "repousser" le point (effet magnétique inversé)
                const angle = Math.atan2(dy, dx);
                
                // Force de répulsion
                const forceX = Math.cos(angle) * influence * this.mouseInfluenceStrength;
                const forceY = Math.sin(angle) * influence * this.mouseInfluenceStrength;
                
                // Appliquer l'effet (répulsion = - force)
                mouseOffsetX = -forceX;
                mouseOffsetY = -forceY;
            }
            
            // Position finale = base + animation + effet souris
            point.x = point.baseX + offsetX + mouseOffsetX;
            point.y = point.baseY + offsetY + mouseOffsetY; 
        });
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
                    let opacity = (1 - distance / this.maxDistance) * 0.5;

            // Renforcer les lignes près de la souris
                    const midX = (pointA.x + pointB.x) / 2;
                    const midY = (pointA.y + pointB.y) / 2;
                    const mouseDistanceToLine = Math.sqrt(
                        (this.mouse.x - midX) ** 2 + (this.mouse.y - midY) ** 2
                    );
                    
                    if (mouseDistanceToLine < this.mouseInfluenceRadius) {
                        const mouseInfluence = 1 - (mouseDistanceToLine / this.mouseInfluenceRadius);
                        opacity += mouseInfluence * 0.3; // Bonus d'opacité
                    }
                    
                    this.connections.push({
                        from: i,
                        to: j,
                        opacity: Math.min(opacity, 0.8) // Cap à 0.8
                    });
                }
            }
        }
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

     animate() {
        this.updatePoints();
        this.calculateConnections();
        this.draw();
        
        // Programmer la prochaine frame
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    startAnimation() {
        console.log('Animation démarrée');
        this.animate();
    }

    stopAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
     setupEvents() {
        window.addEventListener('resize', () => {
            this.setupCanvas();
        });
        
        // Arrêter l'animation si on quitte la page
        window.addEventListener('beforeunload', () => {
            this.stopAnimation();
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new NetworkBackground();
});