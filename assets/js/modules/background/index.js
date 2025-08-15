// INFO: Point d'entrée du module background - exports centralisés
export { CanvasManager } from './canvas-manager.js';
export { PointGenerator } from './point-generator.js';
export { NetworkBackground } from './network.js';

// INFO: Classe factory pour initialiser facilement le module background
export class BackgroundModule {
    constructor(canvasId = 'networkCanvas') {
        console.log('info: Initialisation du module Background');
        
        // DEBUG: vérification des paramètres
        console.log('debug: Canvas ID:', canvasId);
        
        this.canvasId = canvasId;
        this.networkBackground = null;
        this.isInitialized = false;
    }
    
    async init() {
        console.log('info: Démarrage de l\'initialisation du module Background');
        
        try {
            // INFO: Vérification de la présence du canvas
            const canvas = document.getElementById(this.canvasId);
            if (!canvas) {
                throw new Error(`Canvas ${this.canvasId} introuvable dans le DOM`);
            }
            
            // INFO: Initialisation de l'animation de réseau
            const { NetworkBackground } = await import('./network.js');
            this.networkBackground = new NetworkBackground();
            this.isInitialized = true;
            
            console.log('info: Module Background initialisé avec succès');
            
            return this.networkBackground;
            
        } catch (error) {
            console.error('Erreur lors de l\'initialisation du module Background:', error);
            this.isInitialized = false;
            throw error;
        }
    }
    
    destroy() {
        console.log('info: Destruction du module Background');
        
        if (this.networkBackground && typeof this.networkBackground.destroy === 'function') {
            this.networkBackground.destroy();
        }
        
        this.networkBackground = null;
        this.isInitialized = false;
        
        console.log('info: Module Background détruit');
    }
    
    getNetworkBackground() {
        return this.networkBackground;
    }
    
    isReady() {
        return this.isInitialized && this.networkBackground !== null;
    }
}