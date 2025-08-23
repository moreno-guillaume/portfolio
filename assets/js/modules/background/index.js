export { CanvasManager } from './canvas-manager.js';
export { PointGenerator } from './point-generator.js';
export { NetworkBackground } from './network.js';

export class BackgroundModule {
    constructor(canvasId = 'networkCanvas') {
        this.canvasId = canvasId;
        this.networkBackground = null;
        this.isInitialized = false;
    }

    async init() {
        try {
            const canvas = document.getElementById(this.canvasId);
            if (!canvas) {
                throw new Error(`Canvas ${this.canvasId} introuvable dans le DOM`);
            }

            const { NetworkBackground } = await import('./network.js');
            this.networkBackground = new NetworkBackground();
            this.isInitialized = true;

            return this.networkBackground;
        } catch (error) {
            console.error("Erreur lors de l'initialisation du module Background:", error);
            this.isInitialized = false;
            throw error;
        }
    }

    destroy() {
        if (this.networkBackground && typeof this.networkBackground.destroy === 'function') {
            this.networkBackground.destroy();
        }

        this.networkBackground = null;
        this.isInitialized = false;
    }

    getNetworkBackground() {
        return this.networkBackground;
    }

    isReady() {
        return this.isInitialized && this.networkBackground !== null;
    }
}
