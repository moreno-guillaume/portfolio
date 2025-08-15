import { CanvasManager } from './canvas-manager.js';
import { PointGenerator } from './point-generator.js';

export class NetworkBackground {
    constructor()
    {
        // INFO: NetworkBackground orchestre l'animation complète du réseau de particules connectées
        console.log('info: Initialisation de NetworkBackground - Animation de réseau de particules');

        // INFO: Initialisation des gestionnaires principaux
        this.canvasManager = new CanvasManager('networkCanvas');
        this.pointGenerator = new PointGenerator(
            this.canvasManager.getWidth(),
            this.canvasManager.getHeight()
        );

        // INFO: État de l'animation et des données
        this.points = [];
        this.connections = [];
        this.animationId = null;
        this.startTime = Date.now();
        console.log('debug: Temps de démarrage enregistré:', this.startTime);

        // INFO: Configuration de l'algorithme de connexion et d'interaction
        this.maxDistance = 120; // INFO: Distance maximale pour créer une connexion entre points
        this.mouse = { x: 0, y: 0 }; // INFO: Position actuelle de la souris
        this.mouseInfluenceRadius = 120; // INFO: Rayon d'influence de la souris sur les particules
        this.mouseInfluenceStrength = 30; // INFO: Force d'attraction/répulsion de la souris
        
        console.log('debug: Configuration - maxDistance:', this.maxDistance, 'mouseRadius:', this.mouseInfluenceRadius);
        
        // TODO: Rendre ces paramètres configurables via des props ou un fichier de config
        // TODO: Ajouter un mode mobile avec des paramètres adaptés

        this.init();
    }

    init()
    {
        // INFO: Séquence d'initialisation complète de l'animation
        console.log('info: Début de l\'initialisation de l\'animation réseau');
        
        this.points = this.pointGenerator.generateStrategicPoints();
        console.log('debug: Points générés:', this.points.length);
        
        this.setupMouseEvents();
        this.setupResizeEvents();
        this.startAnimation();
        
        console.log('info: NetworkBackground initialisé avec succès');
        // DEBUG: Afficher la configuration finale
        console.log('debug: Configuration finale - Points:', this.points.length, 'Canvas:', this.canvasManager.getWidth(), 'x', this.canvasManager.getHeight());
    }

    setupMouseEvents()
    {
        // INFO: Configure le suivi de la souris pour l'interaction en temps réel
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
            
            // DEBUG: Afficher périodiquement la position de la souris
            if (Math.random() < 0.01) { // INFO: Affichage 1% du temps pour éviter le spam
                console.log('debug: Position souris:', this.mouse.x, this.mouse.y);
            }
        });
        
        console.log('info: Gestionnaire d\'événements souris configuré');
        
        // TODO: Ajouter le support des événements tactiles pour mobile
        // TODO: Ajouter un mode "click" pour créer des ondulations
    }

    setupResizeEvents()
    {
        // INFO: Gère le redimensionnement dynamique de la fenêtre
        this.canvasManager.onResize(() => {
            console.log('debug: Redimensionnement en cours...');

            // INFO: Met à jour les dimensions du générateur de points
            this.pointGenerator.updateCanvasDimensions(
                this.canvasManager.getWidth(),
                this.canvasManager.getHeight()
            );

            // INFO: Régénère tous les points avec la nouvelle disposition
            this.points = this.pointGenerator.generateStrategicPoints();
            
            console.log('debug: Points régénérés après redimensionnement:', this.points.length);
            console.log('debug: Nouvelles dimensions:', this.canvasManager.getWidth(), 'x', this.canvasManager.getHeight());
        });
        
        console.log('info: Gestionnaire de redimensionnement configuré');
    }

    calculateConnections()
    {
        // INFO: Algorithme de calcul des connexions entre points basé sur la distance euclidienne
        // INFO: Complexité O(n²) - examine toutes les paires de points
        this.connections = [];
        let connectionsCalculated = 0;

        for (let i = 0; i < this.points.length; i++) {
            for (let j = i + 1; j < this.points.length; j++) {
                const pointA = this.points[i];
                const pointB = this.points[j];

                // INFO: Calcul de la distance euclidienne entre deux points
                const dx = pointA.x - pointB.x;
                const dy = pointA.y - pointB.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.maxDistance) {
                    // INFO: Opacité inversement proportionnelle à la distance
                    let opacity = (1 - distance / this.maxDistance) * 0.5;

                    // INFO: Calcul de l'influence de la souris sur l'opacité de la ligne
                    const midX = (pointA.x + pointB.x) / 2;
                    const midY = (pointA.y + pointB.y) / 2;
                    const mouseDistanceToLine = Math.sqrt(
                        Math.pow(this.mouse.x - midX, 2) + Math.pow(this.mouse.y - midY, 2)
                    );

                    // INFO: Augmente l'opacité des lignes proches de la souris
                    if (mouseDistanceToLine < this.mouseInfluenceRadius) {
                        const mouseInfluence = 1 - (mouseDistanceToLine / this.mouseInfluenceRadius);
                        opacity += mouseInfluence * 0.3;
                    }

                    this.connections.push({
                        from: i,
                        to: j,
                        opacity: Math.min(opacity, 0.8) // INFO: Limite l'opacité maximale
                    });
                    
                    connectionsCalculated++;
                }
            }
        }
        
        // DEBUG: Statistiques de performance des connexions
        if (Math.random() < 0.1) { // INFO: Affichage 10% du temps
            console.log('debug: Connexions calculées:', connectionsCalculated, '/', this.points.length * (this.points.length - 1) / 2);
        }
        
        // TODO: Optimiser avec un spatial hashing pour réduire la complexité
        // TODO: Ajouter un cache pour les connexions stables
    }

    animate()
    {
        // INFO: Boucle d'animation principale utilisant requestAnimationFrame pour 60 FPS
        const frameStart = performance.now();

        // INFO: Mise à jour des positions des points avec animation sinusoïdale et influence souris
        this.pointGenerator.updatePoints(
            this.points,
            this.startTime,
            this.mouse,
            this.mouseInfluenceRadius,
            this.mouseInfluenceStrength
        );

        // INFO: Recalcul des connexions à chaque frame pour la réactivité
        this.calculateConnections();

        // INFO: Rendu final sur le canvas
        this.canvasManager.draw(this.connections, this.points);

        // DEBUG: Mesure de performance occasionnelle
        const frameTime = performance.now() - frameStart;
        if (Math.random() < 0.01) { // INFO: Monitoring 1% du temps
            console.log('debug: Temps de frame:', frameTime.toFixed(2), 'ms');
            if (frameTime > 16.67) { // INFO: Détection des frames lentes (< 60 FPS)
                console.warn('debug: Frame lente détectée:', frameTime.toFixed(2), 'ms');
            }
        }

        // INFO: Planification de la prochaine frame
        this.animationId = requestAnimationFrame(() => this.animate());
        
        // TODO: Ajouter un système de pause/reprise
        // TODO: Implémenter un FPS limiter configurable
    }

    startAnimation()
    {
        // INFO: Démarre la boucle d'animation principale
        console.log('info: Démarrage de l\'animation réseau');
        
        // DEBUG: Vérifier l'état avant démarrage
        if (this.animationId) {
            console.warn('debug: Animation déjà en cours, arrêt de l\'ancienne');
            this.stopAnimation();
        }
        
        this.animate();
        console.log('info: Animation démarrée avec succès');
    }

    stopAnimation()
    {
        // INFO: Arrête proprement la boucle d'animation
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
            console.log('info: Animation arrêtée');
        } else {
            console.log('debug: Aucune animation à arrêter');
        }
    }

    // INFO: Méthode de nettoyage pour éviter les fuites mémoire
    destroy()
    {
        console.log('info: Destruction de NetworkBackground');
        
        this.stopAnimation();
        
        // TODO: Nettoyer les event listeners
        // TODO: Libérer les références aux objets lourds
        
        console.log('info: NetworkBackground détruit');
    }
}