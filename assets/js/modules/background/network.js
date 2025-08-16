import { CanvasManager } from './canvas-manager.js';
import { PointGenerator } from './point-generator.js';


// INFO: classe principale pour gérer l'animation de fond en réseau de particules
// INFO: crée un effet visuel de points connectés avec interaction souris
export class NetworkBackground {
    constructor()
    {

        // INFO: initialisation des gestionnaires principaux


        this.canvasManager = new CanvasManager('networkCanvas');
        this.pointGenerator = new PointGenerator(
            this.canvasManager.getWidth(),
            this.canvasManager.getHeight()
        );

        // INFO: stockage des données d'animation
        this.points = [];
        this.connections = [];
        this.animationId = null;
        this.startTime = Date.now();



        // INFO: configuration des paramètres visuels pour l'interaction
        this.maxDistance = 120; // INFO: distance maximum pour créer une connexion entre points
        this.mouse = { x: 0, y: 0 }; // INFO: position actuelle de la souris dans le viewport
        this.mouseInfluenceRadius = 120; // INFO: rayon d'influence de la souris sur les particules
        this.mouseInfluenceStrength = 30; // INFO: force d'attraction/répulsion de la souris

        // INFO: l'initialisation est différée pour permettre la configuration complète du DOM
        this.init();
    }

    // INFO: initialise le système complet d'animation avec tous ses composants
    init()
    {

        // TODO: ajouter une option pour désactiver l'animation sur mobile pour optimiser les performances


        this.points = this.pointGenerator.generateStrategicPoints();

        // INFO: configuration des gestionnaires d'événements pour l'interactivité
        this.setupMouseEvents();
        this.setupResizeEvents();
        this.startAnimation();
    }



    // INFO: configuration de la détection des mouvements de souris pour l'interactivité


    setupMouseEvents()
    {
        // INFO: suivi en temps réel de la position de la souris dans le document
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
            
            // DEBUG: monitoring occasionnel des événements souris pour vérifier la responsivité
            if (Math.random() < 0.01) { 
                console.log('debug: position souris mise à jour', { x: e.clientX, y: e.clientY, timestamp: Date.now() });
            }
        });
    }

    // INFO: gestion du redimensionnement de la fenêtre pour maintenir l'aspect visuel


    setupResizeEvents()
    {
        // INFO: recalcul automatique des dimensions lors du redimensionnement
        this.canvasManager.onResize(() => {


            // INFO: updateCanvasDimensions recalcule la grille de points pour maintenir une densité constante


            this.pointGenerator.updateCanvasDimensions(
                this.canvasManager.getWidth(),
                this.canvasManager.getHeight()
            );

            // INFO: régénération des points avec les nouvelles dimensions
            this.points = this.pointGenerator.generateStrategicPoints();
        });
    }



    // INFO: calcule les connexions entre points proches selon la distance maximum définie

    calculateConnections()
    {
        // INFO: réinitialisation du tableau des connexions à chaque frame
        this.connections = [];
        let connectionsCalculated = 0;

        // INFO: algorithme O(n²) pour calculer toutes les distances entre points
        // TODO: optimiser avec un algorithme spatial comme un quadtree pour de meilleures performances

        for (let i = 0; i < this.points.length; i++) {
            for (let j = i + 1; j < this.points.length; j++) {
                const pointA = this.points[i];
                const pointB = this.points[j];

                // INFO: calcul de distance euclidienne standard entre deux points
                const dx = pointA.x - pointB.x;
                const dy = pointA.y - pointB.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.maxDistance) {
                    // INFO: calcul d'opacité inversement proportionnelle à la distance
                    let opacity = (1 - distance / this.maxDistance) * 0.5;

                    // INFO: calcul de l'influence de la souris sur l'opacité des connexions
                    const midX = (pointA.x + pointB.x) / 2;
                    const midY = (pointA.y + pointB.y) / 2;
                    const mouseDistanceToLine = Math.sqrt(
                        Math.pow(this.mouse.x - midX, 2) + Math.pow(this.mouse.y - midY, 2)
                    );

                    // INFO: effet de surbrillance des connexions proches de la souris
                    if (mouseDistanceToLine < this.mouseInfluenceRadius) {
                        const mouseInfluence = 1 - (mouseDistanceToLine / this.mouseInfluenceRadius);
                        opacity += mouseInfluence * 0.3;
                    }

                    this.connections.push({
                        from: i,
                        to: j,
                        opacity: Math.min(opacity, 0.8) // INFO: limitation de l'opacité maximum à 0.8
                    });
                    
                    connectionsCalculated++;
                }
            }
        }
        
        // DEBUG: surveillance des performances de calcul des connexions
        if (Math.random() < 0.1) { 


            console.log('debug: connexions calculées', { 


                total: connectionsCalculated, 
                points: this.points.length,
                ratio: (connectionsCalculated / (this.points.length * (this.points.length - 1) / 2)).toFixed(3)
            });
        }
    }



    // INFO: boucle principale d'animation utilisant requestAnimationFrame pour la fluidité


    animate()
    {
        // DEBUG: mesure des performances de frame pour le monitoring
        const frameStart = performance.now();

        // INFO: mise à jour des positions des points avec influence de la souris
        this.pointGenerator.updatePoints(
            this.points,
            this.startTime,
            this.mouse,
            this.mouseInfluenceRadius,
            this.mouseInfluenceStrength
        );

        // INFO: calcul des connexions dynamiques entre les points
        this.calculateConnections();

        // INFO: rendu visuel final sur le canvas
        this.canvasManager.draw(this.connections, this.points);

        // DEBUG: monitoring des performances d'animation pour détecter les ralentissements
        const frameTime = performance.now() - frameStart;
        if (Math.random() < 0.01) { 


            console.log('debug: performance frame', { 


                frameTime: frameTime.toFixed(2) + 'ms',
                fps: Math.round(1000 / frameTime)
            });

            


            // FIXME: optimiser si le frametime dépasse 16.67ms (60fps)

            if (frameTime > 16.67) { 
                console.warn('debug: frame lente détectée', frameTime + 'ms');
            }
        }

        // INFO: planification de la prochaine frame d'animation
        this.animationId = requestAnimationFrame(() => this.animate());
    }



    // INFO: démarre l'animation principale avec vérification de l'état précédent
    startAnimation()
    {
        // INFO: arrêt de l'animation précédente si elle existe pour éviter les conflits


        if (this.animationId) {
            console.log('info: arrêt de l\'animation en cours avant redémarrage');
            this.stopAnimation();
        }
        
        this.animate();
    }

    // INFO: arrête l'animation en cours et libère les ressources


    stopAnimation()
    {
        // INFO: annulation de la frame programmée pour stopper le cycle d'animation
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
            console.log('info: animation arrêtée proprement');
        } else {
            console.log('debug: tentative d\'arrêt d\'une animation déjà inactive');
        }
    }

    // INFO: nettoyage complet de l'instance pour éviter les fuites mémoire
    destroy()
    {
        // TODO: ajouter le nettoyage des event listeners pour éviter les fuites mémoire
        // INFO: arrêt de l'animation avant destruction
        this.stopAnimation();
        console.log('info: NetworkBackground détruit proprement');
    }
}