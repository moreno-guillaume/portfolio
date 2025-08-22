import { CanvasManager } from './canvas-manager.js';
import { PointGenerator } from './point-generator.js';

// INFO: Classe principale gérant l'animation de fond avec particules connectées
export class NetworkBackground {
    constructor() {
        // INFO: Initialisation du gestionnaire de canvas pour le rendu
        this.canvasManager = new CanvasManager('networkCanvas');
        
        // INFO: Générateur de points avec dimensions du canvas
        this.pointGenerator = new PointGenerator(
            this.canvasManager.getWidth(),
            this.canvasManager.getHeight()
        );

        // INFO: Propriétés de state de l'animation
        this.points = [];
        this.connections = [];
        this.animationId = null;
        this.startTime = Date.now();

        // INFO: Configuration des paramètres de connexion et interaction souris
        this.maxDistance = 120;
        this.mouse = { x: 0, y: 0 };
        this.mouseInfluenceRadius = 120;
        this.mouseInfluenceStrength = 30;

        this.init();
    }

    // INFO: Initialisation complète du système d'animation
    init() {
        // INFO: Génération des points selon la stratégie définie
        this.points = this.pointGenerator.generateStrategicPoints();

        this.setupMouseEvents();
        this.setupResizeEvents();
        this.startAnimation();
    }

    // INFO: Configuration des événements de suivi de la souris
    setupMouseEvents() {
        document.addEventListener('mousemove', e => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;

            // DEBUG: Log périodique de la position souris pour vérification
            if (Math.random() < 0.01) {
                console.log('debug: position souris mise à jour', {
                    x: e.clientX,
                    y: e.clientY,
                    timestamp: Date.now(),
                });
            }
        });
    }

    // INFO: Gestion du redimensionnement de fenêtre avec recalcul des points
    setupResizeEvents() {
        this.canvasManager.onResize(() => {
            // INFO: Mise à jour des dimensions du générateur de points
            this.pointGenerator.updateCanvasDimensions(
                this.canvasManager.getWidth(),
                this.canvasManager.getHeight()
            );

            // INFO: Régénération des points selon les nouvelles dimensions
            this.points = this.pointGenerator.generateStrategicPoints();
        });
    }

    // INFO: Calcul des connexions entre points selon distance et influence souris
    calculateConnections() {
        this.connections = [];
        let connectionsCalculated = 0;

        // INFO: Double boucle pour tester toutes les paires de points
        for (let i = 0; i < this.points.length; i++) {
            for (let j = i + 1; j < this.points.length; j++) {
                const pointA = this.points[i];
                const pointB = this.points[j];

                // INFO: Calcul de la distance euclidienne entre les points
                const dx = pointA.x - pointB.x;
                const dy = pointA.y - pointB.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // INFO: Création de connexion si distance inférieure au seuil
                if (distance < this.maxDistance) {
                    // INFO: Calcul de l'opacité basée sur la distance
                    let opacity = (1 - distance / this.maxDistance) * 0.5;

                    // INFO: Influence de la souris sur l'opacité des connexions
                    const midX = (pointA.x + pointB.x) / 2;
                    const midY = (pointA.y + pointB.y) / 2;
                    const mouseDistanceToLine = Math.sqrt(
                        Math.pow(this.mouse.x - midX, 2) + Math.pow(this.mouse.y - midY, 2)
                    );

                    if (mouseDistanceToLine < this.mouseInfluenceRadius) {
                        const mouseInfluence = 1 - mouseDistanceToLine / this.mouseInfluenceRadius;
                        opacity += mouseInfluence * 0.3;
                    }

                    this.connections.push({
                        from: i,
                        to: j,
                        opacity: Math.min(opacity, 0.8),
                    });

                    connectionsCalculated++;
                }
            }
        }

        // DEBUG: Statistiques périodiques des connexions calculées
        if (Math.random() < 0.1) {
            console.log('debug: connexions calculées', {
                total: connectionsCalculated,
                points: this.points.length,
                ratio: (
                    connectionsCalculated /
                    ((this.points.length * (this.points.length - 1)) / 2)
                ).toFixed(3),
            });
        }
    }

    // INFO: Boucle principale d'animation avec mesure de performance
    animate() {
        const frameStart = performance.now();

        // INFO: Mise à jour des positions des points avec animation temporelle
        this.pointGenerator.updatePoints(
            this.points,
            this.startTime,
            this.mouse,
            this.mouseInfluenceRadius,
            this.mouseInfluenceStrength
        );

        // INFO: Recalcul des connexions à chaque frame
        this.calculateConnections();

        // INFO: Rendu final sur le canvas
        this.canvasManager.draw(this.connections, this.points);

        // DEBUG: Monitoring des performances de rendu
        const frameTime = performance.now() - frameStart;
        if (Math.random() < 0.01) {
            console.log('debug: performance frame', {
                frameTime: frameTime.toFixed(2) + 'ms',
                fps: Math.round(1000 / frameTime),
            });

            // DEBUG: Alerte si frame trop lente
            if (frameTime > 16.67) {
                // TODO: Implémenter optimisation si performance dégradée
            }
        }

        // INFO: Programmation de la prochaine frame
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    // INFO: Démarrage de l'animation avec gestion des redémarrages
    startAnimation() {
        // INFO: Arrêt de l'animation précédente si existante
        if (this.animationId) {
            this.stopAnimation();
        }

        this.animate();
    }

    // INFO: Arrêt propre de l'animation
    stopAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        } else {
            // DEBUG: Tentative d'arrêt sans animation active
        }
    }

    // INFO: Nettoyage des ressources lors de la destruction
    destroy() {
        this.stopAnimation();
    }
}