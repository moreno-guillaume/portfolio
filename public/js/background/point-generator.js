export class PointGenerator {
    constructor(canvasWidth, canvasHeight)
    {
        // INFO: PointGenerator implémente un algorithme de placement stratégique des particules
        console.log('info: Initialisation PointGenerator - dimensions:', canvasWidth, 'x', canvasHeight);
        
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        // INFO: Configuration de l'algorithme de placement
        this.margin = 80; // INFO: Marge pour éviter les points trop près des bords
        this.cornerSize = 200; // INFO: Taille des zones de coins privilégiées
        
        console.log('debug: Configuration - marge:', this.margin, 'taille coins:', this.cornerSize);
        
        // TODO: Rendre ces paramètres adaptatifs selon la taille d'écran
        // TODO: Ajouter un mode "density" pour ajuster automatiquement
    }

    updateCanvasDimensions(width, height)
    {
        // INFO: Met à jour les dimensions après redimensionnement de fenêtre
        console.log('debug: Mise à jour dimensions:', this.canvasWidth, 'x', this.canvasHeight, '->', width, 'x', height);
        
        this.canvasWidth = width;
        this.canvasHeight = height;
        
        // DEBUG: Vérifier que les dimensions sont valides
        if (width <= 0 || height <= 0) {
            console.warn('debug: Dimensions invalides reçues:', width, height);
        }
    }

    createPoint(x, y, zone = 'aléatoire')
    {
        // INFO: Factory method pour créer un point avec toutes ses propriétés d'animation
        const point = {
            baseX: x, // INFO: Position de base pour l'animation sinusoïdale
            baseY: y,
            x: x, // INFO: Position actuelle (sera modifiée par l'animation)
            y: y,
            size: Math.random() * 2 + 0.5, // INFO: Taille aléatoire entre 0.5 et 2.5 pixels
            speed: Math.random() * 0.7 + 0.5, // INFO: Vitesse d'animation entre 0.5 et 1.2
            phaseX: Math.random() * Math.PI * 2, // INFO: Phase aléatoire pour variation X
            phaseY: Math.random() * Math.PI * 2, // INFO: Phase aléatoire pour variation Y
            zone: zone // INFO: Zone de génération pour le debugging
        };
        
        // DEBUG: Tracer occasionnellement les points créés
        if (Math.random() < 0.05) { // INFO: Log 5% des points pour éviter le spam
            console.log('debug: Point créé en zone', zone, 'position:', x.toFixed(1), y.toFixed(1));
        }
        
        return point;
    }

    generateStrategicPoints()
    {
        // INFO: Algorithme de génération stratégique pour un placement visuellement équilibré
        console.log('info: Génération stratégique des points commencée');
        const points = [];

        // INFO: Phase 1 - Coins supérieurs (zones de haute densité)
        console.log('debug: Génération coins supérieurs...');
        
        // INFO: Coin supérieur gauche - zone active importante
        const topLeftCount = Math.floor(Math.random() * 2) + 4; // INFO: Entre 4 et 5 points
        for (let i = 0; i < topLeftCount; i++) {
            points.push(this.createPoint(
                this.margin + Math.random() * this.cornerSize,
                this.margin + Math.random() * this.cornerSize,
                'coin supérieur gauche'
            ));
        }

        // INFO: Coin supérieur droit - symétrie avec le gauche
        const topRightCount = Math.floor(Math.random() * 2) + 4;
        for (let i = 0; i < topRightCount; i++) {
            points.push(this.createPoint(
                this.canvasWidth - this.margin - this.cornerSize + Math.random() * this.cornerSize,
                this.margin + Math.random() * this.cornerSize,
                'coin supérieur droit'
            ));
        }

        // INFO: Phase 2 - Bords latéraux (structure verticale)
        console.log('debug: Génération bords latéraux...');
        
        // INFO: Bord gauche - guide vertical
        for (let i = 0; i < 2; i++) {
            points.push(this.createPoint(
                this.margin + Math.random() * 50,
                this.margin + Math.random() * (this.canvasHeight - 2 * this.margin),
                'bord gauche'
            ));
        }

        // INFO: Bord droit - guide vertical symétrique
        for (let i = 0; i < 2; i++) {
            points.push(this.createPoint(
                this.canvasWidth - this.margin - 50 + Math.random() * 50,
                this.margin + Math.random() * (this.canvasHeight - 2 * this.margin),
                'bord droit'
            ));
        }

        // INFO: Phase 3 - Bords horizontaux (structure horizontale)
        console.log('debug: Génération bords horizontaux...');
        
        // INFO: Bord supérieur - connexion entre les coins
        const topBorderCount = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < topBorderCount; i++) {
            points.push(this.createPoint(
                this.margin + Math.random() * (this.canvasWidth - 2 * this.margin),
                this.margin + Math.random() * 50,
                'bord supérieur'
            ));
        }

        // INFO: Bord inférieur - ancrage visuel
        const bottomBorderCount = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < bottomBorderCount; i++) {
            points.push(this.createPoint(
                this.margin + Math.random() * (this.canvasWidth - 2 * this.margin),
                this.canvasHeight - this.margin - 50 + Math.random() * 50,
                'bord inférieur'
            ));
        }

        // INFO: Phase 4 - Remplissage aléatoire pour atteindre la densité cible
        console.log('debug: Remplissage aléatoire...');
        
        const currentCount = points.length;
        const targetTotal = 185; // INFO: Nombre optimal pour l'équilibre performance/visuel
        const randomPointsToAdd = Math.max(0, targetTotal - currentCount);

        console.log('debug: Points stratégiques:', currentCount, '/ Cible:', targetTotal, '/ À ajouter:', randomPointsToAdd);

        for (let i = 0; i < randomPointsToAdd; i++) {
            points.push(this.createPoint(
                this.margin + Math.random() * (this.canvasWidth - 2 * this.margin),
                this.margin + Math.random() * (this.canvasHeight - 2 * this.margin),
                'centre aléatoire'
            ));
        }

        console.log('info: Génération terminée - Total:', points.length, 'points');
        
        // DEBUG: Statistiques de répartition par zone
        const zoneStats = {};
        points.forEach(point => {
            zoneStats[point.zone] = (zoneStats[point.zone] || 0) + 1;
        });
        console.log('debug: Répartition par zones:', zoneStats);
        
        // TODO: Ajouter une validation de la distribution spatiale
        // TODO: Implémenter un algorithme anti-clustering pour éviter les regroupements
        
        return points;
    }

    updatePoints(points, startTime, mouse, mouseInfluenceRadius, mouseInfluenceStrength)
    {
        // INFO: Met à jour les positions avec animation sinusoïdale et interaction souris
        const time = (Date.now() - startTime) * 0.001; // INFO: Temps en secondes depuis le démarrage
        
        // DEBUG: Afficher le temps écoulé occasionnellement
        if (Math.random() < 0.001) { // INFO: 0.1% du temps
            console.log('debug: Temps d\'animation:', time.toFixed(2), 's');
        }

        points.forEach((point, index) => {
            // INFO: Animation sinusoïdale pour un mouvement organique
            // INFO: Utilise sin/cos avec phases différentes pour un mouvement naturel
            const offsetX = Math.sin(time * point.speed + point.phaseX) * 20;
            const offsetY = Math.cos(time * point.speed + point.phaseY) * 15;

            // INFO: Calcul de l'influence de la souris sur chaque point
            const dx = mouse.x - point.baseX;
            const dy = mouse.y - point.baseY;
            const distanceToMouse = Math.sqrt(dx * dx + dy * dy);

            let mouseOffsetX = 0;
            let mouseOffsetY = 0;

            if (distanceToMouse < mouseInfluenceRadius) {
                // INFO: Force d'influence inversement proportionnelle à la distance
                const influence = 1 - (distanceToMouse / mouseInfluenceRadius);
                const angle = Math.atan2(dy, dx); // INFO: Angle vers la souris
                
                // INFO: Calcul des forces de répulsion (effet "push")
                const forceX = Math.cos(angle) * influence * mouseInfluenceStrength;
                const forceY = Math.sin(angle) * influence * mouseInfluenceStrength;

                // INFO: Application de la force en sens inverse (répulsion)
                mouseOffsetX = -forceX;
                mouseOffsetY = -forceY;
                
                // DEBUG: Tracer les interactions souris occasionnellement
                if (Math.random() < 0.001 && influence > 0.5) {
                    console.log('debug: Forte interaction souris sur point', index, 'influence:', influence.toFixed(2));
                }
            }

            // INFO: Position finale = base + animation + interaction souris
            point.x = point.baseX + offsetX + mouseOffsetX;
            point.y = point.baseY + offsetY + mouseOffsetY;
            
            // DEBUG: Vérifier les points qui sortent de l'écran
            if (point.x < -50 || point.x > this.canvasWidth + 50 || 
                point.y < -50 || point.y > this.canvasHeight + 50) {
                if (Math.random() < 0.01) { // INFO: Log rare pour éviter le spam
                    console.warn('debug: Point hors écran:', index, 'position:', point.x.toFixed(1), point.y.toFixed(1));
                }
            }
        });
        
        // TODO: Ajouter des limites pour empêcher les points de sortir trop loin
        // TODO: Implémenter différents types d'interaction (attraction, turbulence)
    }
}