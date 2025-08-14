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

    createAnimatedPoints()
    {
        // Vider le tableau
        this.points = [];

        // Paramètres de placement
        const margin = 50; // Marge depuis les bords
        const cornerSize = 200; // Taille de la zone des coins

        console.log('Génération de points avec placement stratégique...');

        // === 1. AMAS OBLIGATOIRES DANS LES COINS SUPÉRIEURS ===

        // Coin supérieur gauche (2-3 points)
        const topLeftCount = Math.floor(Math.random() * 2) + 2; // 2 ou 3 points
        for (let i = 0; i < topLeftCount; i++) {
            this.points.push(this.createPoint(
                margin + Math.random() * cornerSize,           // x: margin à margin+200
                margin + Math.random() * cornerSize,           // y: margin à margin+200
                'coin supérieur gauche'
            ));
        }

        // Coin supérieur droit (2-3 points)
        const topRightCount = Math.floor(Math.random() * 2) + 2; // 2 ou 3 points
        for (let i = 0; i < topRightCount; i++) {
            this.points.push(this.createPoint(
                this.canvas.width - margin - cornerSize + Math.random() * cornerSize,  // x: depuis la droite
                margin + Math.random() * cornerSize,                                   // y: margin à margin+200
                'coin supérieur droit'
            ));
        }

        // === 2. POINTS SUR LES BORDS D'ÉCRAN ===

        // Bord gauche (2 points)
        for (let i = 0; i < 2; i++) {
            this.points.push(this.createPoint(
                margin + Math.random() * 50,                    // x: près du bord gauche
                margin + Math.random() * (this.canvas.height - 2 * margin), // y: toute la hauteur
                'bord gauche'
            ));
        }

        // Bord droit (2 points)
        for (let i = 0; i < 2; i++) {
            this.points.push(this.createPoint(
                this.canvas.width - margin - 50 + Math.random() * 50,      // x: près du bord droit
                margin + Math.random() * (this.canvas.height - 2 * margin), // y: toute la hauteur
                'bord droit'
            ));
        }

        // Bord supérieur (1-2 points)
        const topBorderCount = Math.floor(Math.random() * 2) + 1; // 1 ou 2 points
        for (let i = 0; i < topBorderCount; i++) {
            this.points.push(this.createPoint(
                margin + Math.random() * (this.canvas.width - 2 * margin),  // x: toute la largeur
                margin + Math.random() * 50,                                // y: près du bord supérieur
                'bord supérieur'
            ));
        }

        // Bord inférieur (1-2 points)
        const bottomBorderCount = Math.floor(Math.random() * 2) + 1; // 1 ou 2 points
        for (let i = 0; i < bottomBorderCount; i++) {
            this.points.push(this.createPoint(
                margin + Math.random() * (this.canvas.width - 2 * margin),   // x: toute la largeur
                this.canvas.height - margin - 50 + Math.random() * 50,       // y: près du bord inférieur
                'bord inférieur'
            ));
        }

        // === 3. POINTS ALÉATOIRES AU CENTRE ===

        // Compléter avec des points aléatoires pour avoir ~15 points au total
        const currentCount = this.points.length;
        const targetTotal = 55;
        const randomPointsToAdd = Math.max(0, targetTotal - currentCount);

        for (let i = 0; i < randomPointsToAdd; i++) {
            this.points.push(this.createPoint(
                margin + Math.random() * (this.canvas.width - 2 * margin),   // x: dans la zone centrale
                margin + Math.random() * (this.canvas.height - 2 * margin),  // y: dans la zone centrale
                'centre aléatoire'
            ));
        }

        console.log(`${this.points.length} points créés avec placement stratégique`);
        console.log(` - Coins supérieurs: ${topLeftCount + topRightCount} points`);
        console.log(` - Bords: ${4 + topBorderCount + bottomBorderCount} points`);
        console.log(` - Centre aléatoire: ${randomPointsToAdd} points`);
    }

// Fonction helper pour créer un point
    createPoint(x, y, zone = 'aléatoire')
    {
        return {
            baseX: x,
            baseY: y,
            x: x,
            y: y,
            size: Math.random() * 3 + 2,                    // 2 à 5 pixels
            speed: Math.random() * 0.7 + 0.5,               // 0.5 à 1.2
            phaseX: Math.random() * Math.PI * 2,            // 0 à 2π
            phaseY: Math.random() * Math.PI * 2,            // 0 à 2π
            zone: zone // Pour debug (optionnel)
        };
    }

    setupMouseEvents()
    {
        // Suivre le mouvement de la souris
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
         });

         console.log('Événements souris configurés');
    }

    updatePoints()
    {
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

    calculateConnections()
    {
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
                        (this.mouse.x - midX) *  * 2 + (this.mouse.y - midY) *  * 2
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

    animate()
    {
        this.updatePoints();
        this.calculateConnections();
        this.draw();

        // Programmer la prochaine frame
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    startAnimation()
    {
        console.log('Animation démarrée');
        this.animate();
    }

    stopAnimation()
    {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    setupEvents()
    {
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