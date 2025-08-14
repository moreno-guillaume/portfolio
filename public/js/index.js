/**
 * Point d'entrée principal avec modules ES6
 * public/js/index.js
 */

import { CanvasManager } from './background/canvas-manager.js';
import { PointGenerator } from './background/point-generator.js';
import { NetworkBackground } from './background/network.js';

class App {
    constructor()
    {
        this.modules = {};
        this.init();
    }

    async init()
    {
        console.log('🚀 Initialisation de l\'application...');

        try {
            await this.initBackgroundAnimation();
            console.log('✅ Application initialisée avec succès');
        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation:', error);
        }
    }

    async initBackgroundAnimation()
    {
        try {
            this.modules.backgroundAnimation = new NetworkBackground();
            console.log('✅ Module background animation initialisé');
        } catch (error) {
            console.error('❌ Erreur module background:', error);
        }
    }

    getModule(moduleName)
    {
        return this.modules[moduleName];
    }

    destroy()
    {
        Object.values(this.modules).forEach(module => {
            if (module && typeof module.destroy === 'function') {
                module.destroy();
            }
        });
        console.log('🧹 Modules nettoyés');
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    window.App = new App();
});

window.addEventListener('beforeunload', () => {
    if (window.App) {
        window.App.destroy();
    }
});