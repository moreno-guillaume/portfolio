// INFO: Gestionnaire du canvas HTML5 pour le rendu des particules et connexions
export class CanvasManager {
    constructor(canvasId) {
        // INFO: Récupération de l'élément canvas depuis le DOM
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            throw new Error(`Canvas avec l'ID "${canvasId}" introuvable`);
        }

        // INFO: Initialisation du contexte 2D pour le rendu
        this.ctx = this.canvas.getContext('2d');

        // INFO: Chargement des couleurs du thème actuel
        this.colors = this.getThemeColors();
        this.setupCanvas();
    }

    // INFO: Récupération des couleurs depuis les propriétés CSS personnalisées
    getThemeColors() {
        const rootStyles = getComputedStyle(document.documentElement);

        // INFO: Extraction des variables CSS du thème pour le canvas
        const colors = {
            background: rootStyles.getPropertyValue('--canvas-background').trim(),
            points: rootStyles.getPropertyValue('--canvas-points').trim(),
            connections: rootStyles.getPropertyValue('--canvas-connections').trim(),
        };

        // INFO: Couleurs de fallback si les variables CSS ne sont pas définies
        if (!colors.background) {
            colors.background = '#D3DDE4';
            colors.points = '#5E5E5E';
            colors.connections = 'rgba(94, 94, 94, 1)';
        }

        return colors;
    }

    // INFO: Configuration initiale des dimensions du canvas
    setupCanvas() {
        // INFO: Ajustement aux dimensions de la fenêtre
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    // INFO: Effacement complet du canvas avec la couleur de fond
    clear() {
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // INFO: Rendu de toutes les connexions entre les points
    drawConnections(connections, points) {
        connections.forEach((connection, index) => {
            // INFO: Récupération des points à connecter
            const pointA = points[connection.from];
            const pointB = points[connection.to];

            // INFO: Validation de l'existence des points
            if (!pointA || !pointB) {
                return;
            }

            // INFO: Tracé de la ligne de connexion
            this.ctx.beginPath();
            this.ctx.moveTo(pointA.x, pointA.y);
            this.ctx.lineTo(pointB.x, pointB.y);

            // INFO: Application de la couleur avec opacité variable
            this.ctx.strokeStyle = `rgba(94, 94, 94, ${connection.opacity})`;
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        });
    }

    // INFO: Rendu de tous les points sur le canvas
    drawPoints(points) {
        points.forEach((point, index) => {
            // DEBUG: Vérification des coordonnées valides
            if (point.x < 0 || point.y < 0) {
                // DEBUG: Point avec coordonnées négatives détecté
            }

            // INFO: Tracé du cercle représentant le point
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);

            // INFO: Remplissage avec la couleur des points
            this.ctx.fillStyle = this.colors.points;
            this.ctx.fill();
        });
    }

    // INFO: Mise à jour des couleurs lors du changement de thème
    updateThemeColors() {
        this.colors = this.getThemeColors();
    }

    // INFO: Accesseur pour la largeur du canvas
    getWidth() {
        return this.canvas.width;
    }

    // INFO: Accesseur pour la hauteur du canvas
    getHeight() {
        return this.canvas.height;
    }

    // INFO: Méthode principale de rendu combinant tous les éléments
    draw(connections, points) {
        // INFO: Séquence de rendu : effacement puis dessins
        this.clear();
        this.drawConnections(connections, points);
        this.drawPoints(points);
    }

    // INFO: Configuration du gestionnaire de redimensionnement
    onResize(callback) {
        window.addEventListener('resize', () => {
            // INFO: Reconfiguration du canvas aux nouvelles dimensions
            this.setupCanvas();

            // INFO: Exécution du callback de redimensionnement si fourni
            if (typeof callback === 'function') {
                callback();
            }
        });
    }
}