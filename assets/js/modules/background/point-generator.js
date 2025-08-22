// INFO: Classe responsable de la génération et animation des points sur le canvas
export class PointGenerator {
    constructor(canvasWidth, canvasHeight) {
        // INFO: Dimensions du canvas pour le calcul des positions
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        // INFO: Marge pour éviter les points trop près des bords
        this.margin = 80;

        // INFO: Taille des zones de coins pour concentration de points
        this.cornerSize = 200;
    }

    // INFO: Mise à jour des dimensions lors du redimensionnement
    updateCanvasDimensions(width, height) {
        this.canvasWidth = width;
        this.canvasHeight = height;

        // DEBUG: Vérification des dimensions valides
        if (width <= 0 || height <= 0) {
            // DEBUG: Dimensions invalides détectées
        }
    }

    // INFO: Création d'un point avec propriétés d'animation et métadonnées
    createPoint(x, y, zone = 'aléatoire') {
        const point = {
            // INFO: Position de référence fixe pour l'animation
            baseX: x,
            baseY: y,
            // INFO: Position actuelle animée
            x: x,
            y: y,
            // INFO: Propriétés visuelles aléatoires
            size: Math.random() * 2 + 0.5,
            speed: Math.random() * 0.7 + 0.5,
            // INFO: Phases pour mouvement sinusoïdal
            phaseX: Math.random() * Math.PI * 2,
            phaseY: Math.random() * Math.PI * 2,
            // INFO: Zone d'origine pour analytics
            zone: zone,
        };

        // DEBUG: Log occasionnel de création de point
        if (Math.random() < 0.05) {
            // DEBUG: Point créé avec succès
        }

        return point;
    }

    // INFO: Génération stratégique de points selon zones prédéfinies
    generateStrategicPoints() {
        const points = [];

        // INFO: Génération de points dans le coin supérieur gauche
        const topLeftCount = Math.floor(Math.random() * 2) + 4;
        for (let i = 0; i < topLeftCount; i++) {
            points.push(
                this.createPoint(
                    this.margin + Math.random() * this.cornerSize,
                    this.margin + Math.random() * this.cornerSize,
                    'coin supérieur gauche'
                )
            );
        }

        // INFO: Génération de points dans le coin supérieur droit
        const topRightCount = Math.floor(Math.random() * 2) + 4;
        for (let i = 0; i < topRightCount; i++) {
            points.push(
                this.createPoint(
                    this.canvasWidth -
                        this.margin -
                        this.cornerSize +
                        Math.random() * this.cornerSize,
                    this.margin + Math.random() * this.cornerSize,
                    'coin supérieur droit'
                )
            );
        }

        // INFO: Points sur le bord gauche pour continuité visuelle
        for (let i = 0; i < 2; i++) {
            points.push(
                this.createPoint(
                    this.margin + Math.random() * 50,
                    this.margin + Math.random() * (this.canvasHeight - 2 * this.margin),
                    'bord gauche'
                )
            );
        }

        // INFO: Points sur le bord droit pour équilibrage
        for (let i = 0; i < 2; i++) {
            points.push(
                this.createPoint(
                    this.canvasWidth - this.margin - 50 + Math.random() * 50,
                    this.margin + Math.random() * (this.canvasHeight - 2 * this.margin),
                    'bord droit'
                )
            );
        }

        // INFO: Distribution de points sur le bord supérieur
        const topBorderCount = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < topBorderCount; i++) {
            points.push(
                this.createPoint(
                    this.margin + Math.random() * (this.canvasWidth - 2 * this.margin),
                    this.margin + Math.random() * 50,
                    'bord supérieur'
                )
            );
        }

        // INFO: Distribution de points sur le bord inférieur
        const bottomBorderCount = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < bottomBorderCount; i++) {
            points.push(
                this.createPoint(
                    this.margin + Math.random() * (this.canvasWidth - 2 * this.margin),
                    this.canvasHeight - this.margin - 50 + Math.random() * 50,
                    'bord inférieur'
                )
            );
        }

        // INFO: Remplissage du centre pour atteindre le nombre cible
        const currentCount = points.length;
        const targetTotal = 185;
        const randomPointsToAdd = Math.max(0, targetTotal - currentCount);

        for (let i = 0; i < randomPointsToAdd; i++) {
            points.push(
                this.createPoint(
                    this.margin + Math.random() * (this.canvasWidth - 2 * this.margin),
                    this.margin + Math.random() * (this.canvasHeight - 2 * this.margin),
                    'centre aléatoire'
                )
            );
        }

        // DEBUG: Calcul des statistiques de distribution par zone
        const zoneStats = {};
        points.forEach(point => {
            zoneStats[point.zone] = (zoneStats[point.zone] || 0) + 1;
        });

        return points;
    }

    // INFO: Animation des points avec mouvement sinusoïdal et influence de la souris
    updatePoints(points, startTime, mouse, mouseInfluenceRadius, mouseInfluenceStrength) {
        // INFO: Calcul du temps écoulé pour l'animation temporelle
        const time = (Date.now() - startTime) * 0.001;

        // DEBUG: Log périodique des updates de points
        if (Math.random() < 0.001) {
            // DEBUG: Mise à jour des points en cours
        }

        points.forEach((point, index) => {
            // INFO: Calcul du mouvement sinusoïdal de base
            const offsetX = Math.sin(time * point.speed + point.phaseX) * 20;
            const offsetY = Math.cos(time * point.speed + point.phaseY) * 15;

            // INFO: Calcul de l'influence de la souris sur le point
            const dx = mouse.x - point.baseX;
            const dy = mouse.y - point.baseY;
            const distanceToMouse = Math.sqrt(dx * dx + dy * dy);

            let mouseOffsetX = 0;
            let mouseOffsetY = 0;

            // INFO: Application de la force de répulsion de la souris
            if (distanceToMouse < mouseInfluenceRadius) {
                const influence = 1 - distanceToMouse / mouseInfluenceRadius;
                // INFO: Calcul de l'angle pour la direction de la force
                const angle = Math.atan2(dy, dx);

                const forceX = Math.cos(angle) * influence * mouseInfluenceStrength;
                const forceY = Math.sin(angle) * influence * mouseInfluenceStrength;

                // INFO: Force de répulsion (direction opposée)
                mouseOffsetX = -forceX;
                mouseOffsetY = -forceY;

                // DEBUG: Log de l'influence forte de la souris
                if (Math.random() < 0.001 && influence > 0.5) {
                    // DEBUG: Influence souris forte détectée
                }
            }

            // INFO: Application de tous les offsets à la position finale
            point.x = point.baseX + offsetX + mouseOffsetX;
            point.y = point.baseY + offsetY + mouseOffsetY;

            // DEBUG: Vérification des points sortant des limites
            if (
                point.x < -50 ||
                point.x > this.canvasWidth + 50 ||
                point.y < -50 ||
                point.y > this.canvasHeight + 50
            ) {
                if (Math.random() < 0.01) {
                    // DEBUG: Point hors limites détecté
                }
            }
        });
    }
}