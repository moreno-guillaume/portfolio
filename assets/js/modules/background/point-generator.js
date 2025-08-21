export class PointGenerator {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        this.margin = 80;

        this.cornerSize = 200;
    }

    updateCanvasDimensions(width, height) {
        this.canvasWidth = width;
        this.canvasHeight = height;

        if (width <= 0 || height <= 0) {
        }
    }

    createPoint(x, y, zone = 'aléatoire') {
        const point = {
            baseX: x, // Position de base X (point de référence)
            baseY: y, // Position de base Y (point de référence)
            x: x, // Position actuelle X (animée)
            y: y, // Position actuelle Y (animée)
            size: Math.random() * 2 + 0.5, // Taille du point (0.5 à 2.5)
            speed: Math.random() * 0.7 + 0.5, // Vitesse d'animation (0.5 à 1.2)
            phaseX: Math.random() * Math.PI * 2, // Phase initiale pour mouvement X
            phaseY: Math.random() * Math.PI * 2, // Phase initiale pour mouvement Y
            zone: zone, // Zone de placement pour le debugging
        };

        if (Math.random() < 0.05) {
        }

        return point;
    }

    generateStrategicPoints() {
        const points = [];

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

        for (let i = 0; i < 2; i++) {
            points.push(
                this.createPoint(
                    this.margin + Math.random() * 50,
                    this.margin + Math.random() * (this.canvasHeight - 2 * this.margin),
                    'bord gauche'
                )
            );
        }

        for (let i = 0; i < 2; i++) {
            points.push(
                this.createPoint(
                    this.canvasWidth - this.margin - 50 + Math.random() * 50,
                    this.margin + Math.random() * (this.canvasHeight - 2 * this.margin),
                    'bord droit'
                )
            );
        }

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

        const zoneStats = {};
        points.forEach(point => {
            zoneStats[point.zone] = (zoneStats[point.zone] || 0) + 1;
        });

        return points;
    }

    updatePoints(points, startTime, mouse, mouseInfluenceRadius, mouseInfluenceStrength) {
        const time = (Date.now() - startTime) * 0.001; // Temps en secondes

        if (Math.random() < 0.001) {
        }

        points.forEach((point, index) => {
            const offsetX = Math.sin(time * point.speed + point.phaseX) * 20;
            const offsetY = Math.cos(time * point.speed + point.phaseY) * 15;

            const dx = mouse.x - point.baseX;
            const dy = mouse.y - point.baseY;
            const distanceToMouse = Math.sqrt(dx * dx + dy * dy);

            let mouseOffsetX = 0;
            let mouseOffsetY = 0;

            if (distanceToMouse < mouseInfluenceRadius) {
                const influence = 1 - distanceToMouse / mouseInfluenceRadius;
                const angle = Math.atan2(dy, dx); // Angle depuis la souris vers le point

                const forceX = Math.cos(angle) * influence * mouseInfluenceStrength;
                const forceY = Math.sin(angle) * influence * mouseInfluenceStrength;

                mouseOffsetX = -forceX;
                mouseOffsetY = -forceY;

                if (Math.random() < 0.001 && influence > 0.5) {
                }
            }

            point.x = point.baseX + offsetX + mouseOffsetX;
            point.y = point.baseY + offsetY + mouseOffsetY;

            if (
                point.x < -50 ||
                point.x > this.canvasWidth + 50 ||
                point.y < -50 ||
                point.y > this.canvasHeight + 50
            ) {
                if (Math.random() < 0.01) {
                }
            }
        });
    }
}
