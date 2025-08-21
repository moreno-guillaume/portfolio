export class CanvasManager {

    constructor(canvasId) {
        // INFO: récupération de l'élément canvas depuis le DOM par son ID
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            // DEBUG: vérification de l'existence du canvas pour éviter les erreurs silencieuses
            throw new Error(`Canvas avec l'ID "${canvasId}" introuvable`);
        }

        // INFO: initialisation du contexte 2D pour le rendu graphique
        this.ctx = this.canvas.getContext('2d');

        this.colors = this.getThemeColors();
        
        this.setupCanvas();
    }

    getThemeColors() {
        // INFO: accès aux propriétés CSS calculées de l'élément racine
        const rootStyles = getComputedStyle(document.documentElement);
        
        const colors = {
            background: rootStyles.getPropertyValue('--canvas-background').trim(),
            points: rootStyles.getPropertyValue('--canvas-points').trim(),
            connections: rootStyles.getPropertyValue('--canvas-connections').trim()
        };

        // INFO: couleurs de fallback si les variables CSS ne sont pas définies
        if (!colors.background) {
            console.log('debug: variables CSS introuvables, utilisation des couleurs par défaut');


            colors.background = '#D3DDE4';
            colors.points = '#5E5E5E';
            colors.connections = 'rgba(94, 94, 94, 1)';
        }
        
        return colors;
    }

    // INFO: configure les dimensions du canvas pour correspondre à la fenêtre
    setupCanvas() {
        // INFO: ajustement du canvas à la taille complète de la fenêtre
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // DEBUG: vérification des dimensions appliquées
        console.log('debug: canvas redimensionné', { 
            width: this.canvas.width, 
            height: this.canvas.height 
        });
    }

    // INFO: efface le canvas en le remplissant avec la couleur de fond
    clear() {
        // INFO: utilisation de fillRect pour effacer tout le canvas d'un coup
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // INFO: dessine toutes les connexions entre les points avec opacité variable
    drawConnections(connections, points) {
        // INFO: itération sur toutes les connexions calculées
        connections.forEach((connection, index) => {
            const pointA = points[connection.from];
            const pointB = points[connection.to];

            // INFO: vérification de l'existence des points pour éviter les erreurs de rendu
            if (!pointA || !pointB) {
                console.log('debug: connexion ignorée, point manquant', { from: connection.from, to: connection.to });
                return;
            }

            // INFO: tracé d'une ligne entre les deux points
            this.ctx.beginPath();
            this.ctx.moveTo(pointA.x, pointA.y);
            this.ctx.lineTo(pointB.x, pointB.y);

            // INFO: application de l'opacité dynamique pour l'effet visuel
            this.ctx.strokeStyle = `rgba(94, 94, 94, ${connection.opacity})`;
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        });
    }

    // INFO: dessine tous les points/particules sur le canvas
    drawPoints(points) {
        // INFO: rendu de chaque point avec sa taille et position
        points.forEach((point, index) => {
            // DEBUG: vérification de la validité des coordonnées
            if (point.x < 0 || point.y < 0) {
                console.log('debug: point avec coordonnées négatives ignoré', { x: point.x, y: point.y, index });
            }
            
            // INFO: création d'un cercle pour représenter le point
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
            
            // INFO: application de la couleur des points depuis le thème
            this.ctx.fillStyle = this.colors.points;
            this.ctx.fill();
        });
    }

    // INFO: met à jour les couleurs du thème en temps réel
    updateThemeColors() {
        // INFO: recharge les couleurs depuis les variables CSS actuelles
        this.colors = this.getThemeColors();
        console.log('debug: couleurs du thème mises à jour', this.colors);
    }

    // INFO: retourne la largeur actuelle du canvas
    getWidth() {
        return this.canvas.width;
    }

    // INFO: retourne la hauteur actuelle du canvas
    getHeight() {
        return this.canvas.height;
    }

    // INFO: fonction principale de rendu appelée à chaque frame
    draw(connections, points) {
        // INFO: séquence de rendu complète : effacement puis dessin
        this.clear();
        this.drawConnections(connections, points);
        this.drawPoints(points);
    }

    // INFO: configure l'événement de redimensionnement avec callback personnalisé
    onResize(callback) {
        // INFO: écoute des événements de redimensionnement de la fenêtre
        window.addEventListener('resize', () => {
            // DEBUG: log des événements de redimensionnement
            console.log('debug: redimensionnement détecté');
            
            // INFO: reconfiguration automatique du canvas
            this.setupCanvas();
            
            // INFO: exécution du callback si fourni pour notifier les autres composants
            if (typeof callback === 'function') {
                callback();
                console.log('debug: callback de redimensionnement exécuté');
            }
        });
    }
}