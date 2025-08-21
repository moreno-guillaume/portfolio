// Re-exports pour faciliter les imports
export { CanvasManager } from './canvas-manager.js';
export { PointGenerator } from './point-generator.js';
export { NetworkBackground } from './network.js';

export class BackgroundModule {
    constructor(canvasId = 'networkCanvas') {
        console.log('debug: création BackgroundModule avec canvas:', canvasId);
        this.canvasId = canvasId;
        this.networkBackground = null;
        this.isInitialized = false;
    }
    
    async init() {
        console.log('debug: initialisation BackgroundModule');
        
        try {
            // Vérifier que le canvas existe dans le DOM
            const canvas = document.getElementById(this.canvasId);
            if (!canvas) {
                throw new Error(`Canvas ${this.canvasId} introuvable dans le DOM`);
            }
            
            // Import dynamique pour éviter les problèmes de dépendances circulaires
            const { NetworkBackground } = await import('./network.js');
            this.networkBackground = new NetworkBackground();
            this.isInitialized = true;

            console.log('debug: BackgroundModule initialisé avec succès');
            return this.networkBackground;
            
        } catch (error) {
            console.error('Erreur lors de l\'initialisation du module Background:', error);
            this.isInitialized = false;
            throw error;
        }
    }
    
    destroy() {
        console.log('debug: destruction BackgroundModule');
        
        if (this.networkBackground && typeof this.networkBackground.destroy === 'function') {
            this.networkBackground.destroy();
        }
        
        this.networkBackground = null;
        this.isInitialized = false;
        
        console.log('debug: BackgroundModule détruit');
    }
    
    getNetworkBackground() {
        return this.networkBackground;
    }
    
    isReady() {
        return this.isInitialized && this.networkBackground !== null;
    }
}