

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
        try {
            await this.initBackgroundAnimation();
            } catch (error) {
            }
    }

    async initBackgroundAnimation()
    {
        try {
            this.modules.backgroundAnimation = new NetworkBackground();
            } catch (error) {
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
        }
}

document.addEventListener('DOMContentLoaded', () => {
    window.App = new App();
});

window.addEventListener('beforeunload', () => {
    if (window.App) {
        window.App.destroy();
    }
});