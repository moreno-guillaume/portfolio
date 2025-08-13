class App {
    constructor() {
        this.modules = {};
        this.init();
    }

    async init() {
        
        try {
            // Initialiser les différents modules
            await this.initBackgroundAnimation();
            
        } catch (error) {
            console.error('Erreur lors de l\'initialisation:', error);
        }
    }

    async initBackgroundAnimation() {
        try {
            // Vérifier que toutes les classes background sont disponibles
            if (typeof CanvasManager === 'undefined') {
                throw new Error('CanvasManager non trouvé. Vérifiez que background/canvas-manager.js est chargé.');
            }
            if (typeof PointGenerator === 'undefined') {
                throw new Error('PointGenerator non trouvé. Vérifiez que background/point-generator.js est chargé.');
            }
            if (typeof NetworkBackground === 'undefined') {
                throw new Error('NetworkBackground non trouvé. Vérifiez que background/network.js est chargé.');
            }

            // Initialiser l'animation de background
            this.modules.backgroundAnimation = new NetworkBackground();
            
        } catch (error) {
            console.error('Erreur module background:', error);
        }
    }

    // Futures méthodes pour d'autres modules ici

    // Méthode pour accéder aux modules depuis l'extérieur
    getModule(moduleName) {
        return this.modules[moduleName];
    }

    // Méthode pour nettoyer les modules (avant navigation, etc.)
    destroy() {
        Object.values(this.modules).forEach(module => {
            if (module && typeof module.destroy === 'function') {
                module.destroy();
            }
        });
    }
}

// Initialisation automatique au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
    window.App = new App();
});

// Nettoyage avant de quitter la page
window.addEventListener('beforeunload', () => {
    if (window.App) {
        window.App.destroy();
    }
});