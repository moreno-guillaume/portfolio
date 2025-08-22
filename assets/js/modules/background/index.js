// INFO: Re-exports pour faciliter l'importation des classes du module background
export { CanvasManager } from './canvas-manager.js';
export { PointGenerator } from './point-generator.js';
export { NetworkBackground } from './network.js';

// INFO: Module wrapper pour l'initialisation et la gestion du background animé
export class BackgroundModule {
    constructor(canvasId = 'networkCanvas') {
        // INFO: Identifiant du canvas cible dans le DOM
        this.canvasId = canvasId;
        
        // INFO: Instance du background animé après initialisation
        this.networkBackground = null;
        
        // INFO: État d'initialisation du module
        this.isInitialized = false;
    }

    // INFO: Initialisation asynchrone du module background avec vérifications
    async init() {
        try {
            // INFO: Vérification de l'existence du canvas dans le DOM
            const canvas = document.getElementById(this.canvasId);
            if (!canvas) {
                throw new Error(`Canvas ${this.canvasId} introuvable dans le DOM`);
            }

            // INFO: Import dynamique pour éviter les dépendances circulaires
            const { NetworkBackground } = await import('./network.js');
            
            // INFO: Création de l'instance du background animé
            this.networkBackground = new NetworkBackground();
            this.isInitialized = true;

            return this.networkBackground;
        } catch (error) {
            console.error('Erreur lors de l\'initialisation du module Background:', error);
            this.isInitialized = false;
            throw error;
        }
    }

    // INFO: Nettoyage propre des ressources du module
    destroy() {
        // INFO: Destruction de l'instance du background si elle existe
        if (this.networkBackground && typeof this.networkBackground.destroy === 'function') {
            this.networkBackground.destroy();
        }

        // INFO: Remise à zéro des références
        this.networkBackground = null;
        this.isInitialized = false;
    }

    // INFO: Accesseur pour récupérer l'instance du background animé
    getNetworkBackground() {
        return this.networkBackground;
    }

    // INFO: Vérification de l'état de préparation du module
    isReady() {
        return this.isInitialized && this.networkBackground !== null;
    }
}