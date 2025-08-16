// INFO: Générateur de points pour l'animation de réseau de particules
export class PointGenerator {
    constructor(canvasWidth, canvasHeight)
    {
        // INFO: Dimensions du canvas pour calculer les positions des points
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        // INFO: Marges pour éviter que les points apparaissent trop près des bords
        this.margin = 80; 
        // INFO: Taille des zones de coin où concentrer plus de points
        this.cornerSize = 200; 

        // DEBUG: Vérification des dimensions lors de l'initialisation
        console.log('debug: PointGenerator initialisé avec dimensions:', canvasWidth, 'x', canvasHeight);
    }

    updateCanvasDimensions(width, height)
    {
        // INFO: Mise à jour des dimensions quand le canvas est redimensionné
        this.canvasWidth = width;
        this.canvasHeight = height;
        
        // DEBUG: Validation des nouvelles dimensions
        if (width <= 0 || height <= 0) {
            console.warn('debug: Dimensions invalides pour le canvas:', width, height);
        }
    }

    createPoint(x, y, zone = 'aléatoire')
    {
        // INFO: Création d'un point avec ses propriétés d'animation
        const point = {
            baseX: x, // Position de base X (point de référence)
            baseY: y, // Position de base Y (point de référence)
            x: x, // Position actuelle X (animée)
            y: y, // Position actuelle Y (animée)
            size: Math.random() * 2 + 0.5, // Taille du point (0.5 à 2.5)
            speed: Math.random() * 0.7 + 0.5, // Vitesse d'animation (0.5 à 1.2)
            phaseX: Math.random() * Math.PI * 2, // Phase initiale pour mouvement X
            phaseY: Math.random() * Math.PI * 2, // Phase initiale pour mouvement Y
            zone: zone // Zone de placement pour le debugging
        };
        
        // TODO: Ajouter des points spéciaux avec des propriétés différentes
        if (Math.random() < 0.05) { 
            // TEMP: 5% de chance d'avoir un point spécial (à implémenter)
        }
        
        return point;
    }

    generateStrategicPoints()
    {
        // INFO: Génération stratégique des points pour un rendu équilibré
        const points = [];

        // INFO: Concentration de points dans les coins pour un effet visuel attrayant
        const topLeftCount = Math.floor(Math.random() * 2) + 4; 
        for (let i = 0; i < topLeftCount; i++) {
            points.push(this.createPoint(
                this.margin + Math.random() * this.cornerSize,
                this.margin + Math.random() * this.cornerSize,
                'coin supérieur gauche'
            ));
        }

        // INFO: Coin supérieur droit
        const topRightCount = Math.floor(Math.random() * 2) + 4;
        for (let i = 0; i < topRightCount; i++) {
            points.push(this.createPoint(
                this.canvasWidth - this.margin - this.cornerSize + Math.random() * this.cornerSize,
                this.margin + Math.random() * this.cornerSize,
                'coin supérieur droit'
            ));
        }

        // INFO: Points sur les bords pour créer des connexions intéressantes
        for (let i = 0; i < 2; i++) {
            points.push(this.createPoint(
                this.margin + Math.random() * 50,
                this.margin + Math.random() * (this.canvasHeight - 2 * this.margin),
                'bord gauche'
            ));
        }

        // INFO: Bord droit
        for (let i = 0; i < 2; i++) {
            points.push(this.createPoint(
                this.canvasWidth - this.margin - 50 + Math.random() * 50,
                this.margin + Math.random() * (this.canvasHeight - 2 * this.margin),
                'bord droit'
            ));
        }

        // INFO: Points sur les bords horizontaux
        const topBorderCount = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < topBorderCount; i++) {
            points.push(this.createPoint(
                this.margin + Math.random() * (this.canvasWidth - 2 * this.margin),
                this.margin + Math.random() * 50,
                'bord supérieur'
            ));
        }

        // INFO: Bord inférieur
        const bottomBorderCount = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < bottomBorderCount; i++) {
            points.push(this.createPoint(
                this.margin + Math.random() * (this.canvasWidth - 2 * this.margin),
                this.canvasHeight - this.margin - 50 + Math.random() * 50,
                'bord inférieur'
            ));
        }

        // INFO: Remplissage avec des points aléatoires pour atteindre le nombre cible
        const currentCount = points.length;
        const targetTotal = 185; // TODO: Rendre ce nombre configurable
        const randomPointsToAdd = Math.max(0, targetTotal - currentCount);

        // DEBUG: Affichage du nombre de points générés par zone
        for (let i = 0; i < randomPointsToAdd; i++) {
            points.push(this.createPoint(
                this.margin + Math.random() * (this.canvasWidth - 2 * this.margin),
                this.margin + Math.random() * (this.canvasHeight - 2 * this.margin),
                'centre aléatoire'
            ));
        }

        // DEBUG: Statistiques de répartition des points par zone
        const zoneStats = {};
        points.forEach(point => {
            zoneStats[point.zone] = (zoneStats[point.zone] || 0) + 1;
        });
        console.log('debug: Répartition des points par zone:', zoneStats);

        return points;
    }

    updatePoints(points, startTime, mouse, mouseInfluenceRadius, mouseInfluenceStrength)
    {
        // INFO: Animation des points avec mouvement naturel et interaction souris
        const time = (Date.now() - startTime) * 0.001; // Temps en secondes
        
        // DEBUG: Affichage périodique du nombre de points animés
        if (Math.random() < 0.001) { 
            console.log('debug: Animation de', points.length, 'points');
        }

        points.forEach((point, index) => {
            // INFO: Mouvement naturel sinusoïdal autour de la position de base
            const offsetX = Math.sin(time * point.speed + point.phaseX) * 20;
            const offsetY = Math.cos(time * point.speed + point.phaseY) * 15;

            // INFO: Calcul de l'influence de la souris sur le point
            const dx = mouse.x - point.baseX;
            const dy = mouse.y - point.baseY;
            const distanceToMouse = Math.sqrt(dx * dx + dy * dy);

            let mouseOffsetX = 0;
            let mouseOffsetY = 0;

            if (distanceToMouse < mouseInfluenceRadius) {
                // INFO: Application de la force de répulsion de la souris
                const influence = 1 - (distanceToMouse / mouseInfluenceRadius);
                const angle = Math.atan2(dy, dx); // Angle depuis la souris vers le point
                
                // INFO: Calcul de la force de répulsion basée sur la distance
                const forceX = Math.cos(angle) * influence * mouseInfluenceStrength;
                const forceY = Math.sin(angle) * influence * mouseInfluenceStrength;

                // INFO: Application de la force opposée pour repousser le point
                mouseOffsetX = -forceX;
                mouseOffsetY = -forceY;
                
                // DEBUG: Log des interactions fortes avec la souris
                if (Math.random() < 0.001 && influence > 0.5) {
                    console.log('debug: Forte interaction souris avec point', index);
                }
            }

            // INFO: Application de tous les déplacements au point
            point.x = point.baseX + offsetX + mouseOffsetX;
            point.y = point.baseY + offsetY + mouseOffsetY;
            
            // DEBUG: Vérification que les points restent dans des limites raisonnables
            if (point.x < -50 || point.x > this.canvasWidth + 50 || 
                point.y < -50 || point.y > this.canvasHeight + 50) {
                if (Math.random() < 0.01) { 
                    console.warn('debug: Point hors limites:', point.x, point.y);
                }
            }
        });

        // TODO: Ajouter un système de collision entre points
        // FIXME: Optimiser les calculs de distance pour de meilleures performances
    }
}