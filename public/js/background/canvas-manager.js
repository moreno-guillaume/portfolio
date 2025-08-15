export class CanvasManager {
    constructor(canvasId)
    {
        // INFO: CanvasManager gère l'affichage et les opérations de rendu du canvas HTML5
        console.log('info: Initialisation du CanvasManager avec canvas ID:', canvasId);
        
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error('debug: Canvas introuvable avec ID:', canvasId);
            throw new Error(`Canvas avec l'ID "${canvasId}" introuvable`);
        }

        // INFO: Utilise le contexte 2D pour les opérations de dessin vectoriel
        this.ctx = this.canvas.getContext('2d');
        console.log('info: Contexte 2D obtenu avec succès');
        
        this.setupCanvas();
    }

    setupCanvas()
    {
        // INFO: Dimensionne le canvas à la taille complète de la fenêtre pour un effet plein écran
        console.log('debug: Configuration canvas - dimensions avant:', this.canvas.width, 'x', this.canvas.height);
        
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        console.log('debug: Configuration canvas - nouvelles dimensions:', this.canvas.width, 'x', this.canvas.height);
        
        // TODO: Ajouter le support des écrans haute densité (devicePixelRatio)
        // INFO: Pour les écrans Retina, multiplier les dimensions par devicePixelRatio
    }

    getWidth()
    {
        // INFO: Retourne la largeur actuelle du canvas en pixels
        return this.canvas.width;
    }

    getHeight()
    {
        // INFO: Retourne la hauteur actuelle du canvas en pixels
        return this.canvas.height;
    }

    clear()
    {
        // INFO: Efface complètement le canvas avec une couleur de fond définie
        // INFO: Couleur #F1F4F7 = gris très clair pour un arrière-plan neutre
        this.ctx.fillStyle = '#F1F4F7';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // DEBUG: Vérifier que le canvas est bien effacé
        console.log('debug: Canvas effacé avec couleur #F1F4F7');
    }

    drawConnections(connections, points)
    {
        // INFO: Dessine les connexions entre les points avec opacité variable selon la distance
        console.log('debug: Rendu de', connections.length, 'connexions');
        
        connections.forEach((connection, index) => {
            const pointA = points[connection.from];
            const pointB = points[connection.to];

            // DEBUG: Vérifier que les points existent
            if (!pointA || !pointB) {
                console.warn('debug: Points manquants pour la connexion', index);
                return;
            }

            this.ctx.beginPath();
            this.ctx.moveTo(pointA.x, pointA.y);
            this.ctx.lineTo(pointB.x, pointB.y);
            
            // INFO: Utilise rgba pour l'opacité dynamique basée sur la distance et l'interaction souris
            this.ctx.strokeStyle = `rgba(94, 94, 94, ${connection.opacity})`;
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        });
        
        // DEBUG: Compter les connexions rendues
        console.log('debug: Connexions rendues avec succès:', connections.length);
    }

    drawPoints(points)
    {
        // INFO: Dessine les points comme des cercles pleins avec taille variable
        console.log('debug: Rendu de', points.length, 'points');
        
        points.forEach((point, index) => {
            // DEBUG: Vérifier les coordonnées des points
            if (point.x < 0 || point.y < 0) {
                console.warn('debug: Point avec coordonnées négatives:', index, point);
            }
            
            this.ctx.beginPath();
            // INFO: arc(x, y, radius, startAngle, endAngle) - cercle complet avec Math.PI * 2
            this.ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
            this.ctx.fillStyle = '#5E5E5E'; // INFO: Gris moyen pour la visibilité
            this.ctx.fill();
        });
        
        // DEBUG: Performance du rendu des points
        console.log('debug: Points rendus avec succès:', points.length);
    }

    draw(connections, points)
    {
        // INFO: Méthode principale de rendu - efface puis dessine connexions et points
        // INFO: Ordre important: fond → connexions → points (pour la superposition)
        console.log('debug: Début du cycle de rendu');
        
        this.clear();
        this.drawConnections(connections, points);
        this.drawPoints(points);
        
        // DEBUG: Temps de rendu pour optimisation
        console.log('debug: Cycle de rendu terminé');
        // TODO: Ajouter un profiler de performance pour mesurer le FPS
    }

    onResize(callback)
    {
        // INFO: Écoute les changements de taille de fenêtre pour maintenir le canvas plein écran
        window.addEventListener('resize', () => {
            console.log('debug: Redimensionnement détecté');
            
            this.setupCanvas();
            
            // INFO: Appelle le callback pour permettre la régénération des points
            if (typeof callback === 'function') {
                callback();
                console.log('debug: Callback de redimensionnement exécuté');
            }
        });
        
        console.log('info: Gestionnaire de redimensionnement configuré');
        // TODO: Ajouter un délai (debounce) pour éviter trop d'appels lors du redimensionnement
    }
}