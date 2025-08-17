import '../scss/app.scss'

import { BackgroundModule } from './modules/background/index.js'

class App {
    constructor() {
        this.modules = new Map();
        this.init();
    }

    async init() {
        try {
            await this.initBackgroundModule();
        } catch (error) {
            console.error('Erreur lors de l\'initialisation de l\'application:', error);
        }
    }

    async initBackgroundModule() {
        try {
            const backgroundModule = new BackgroundModule('networkCanvas');
            const networkBackground = await backgroundModule.init();
            this.modules.set('background', backgroundModule);

            setTimeout(() => {
                if (networkBackground && networkBackground.animationId) {
                    console.log('Animation démarrée avec succès');
                } else {
                    console.log('Animation non démarrée');
                }
            }, 1000);
            
        } catch (error) {
            console.error('Erreur lors de l\'initialisation du module Background:', error);
            throw error;
        }
    }

    getModule(moduleName) {
        const module = this.modules.get(moduleName);
        
        if (!module) {
            console.log('Module non trouvé:', moduleName);
        }
        
        return module;
    }

    destroy() {
        this.modules.forEach((module, name) => {
            if (module && typeof module.destroy === 'function') {
                try {
                    module.destroy();
                } catch (error) {
                    console.error('Erreur lors de la destruction du module:', name, error);
                }
            }
        });
        
        this.modules.clear();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    try {
        window.App = new App();

        if (window.App) {
            console.log('Application initialisée');
        }
        
    } catch (error) {
        console.error('Erreur critique lors du démarrage de l\'application:', error);
    }
});

window.addEventListener('beforeunload', () => {
    if (window.App) {
        try {
            window.App.destroy();
        } catch (error) {
            console.error('Erreur lors du nettoyage:', error);
        }
    } else {
        console.log('Aucune application à nettoyer');
    }
});

window.addEventListener('error', (event) => {
    console.error('Erreur JavaScript globale capturée:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
    });
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Promesse rejetée non gérée:', event.reason);
});

if (import.meta.env.DEV) {
    window.DebugUtils = {
        getApp: () => window.App,
        
        getModules: () => {
            const app = window.App;
            if (!app) return {};
            
            const modules = {};
            app.modules.forEach((module, name) => {
                modules[name] = module;
            });
            return modules;
        },
        
        restartAnimation: () => {
            const backgroundModule = window.App?.getModule('background');
            if (backgroundModule && backgroundModule.isReady()) {
                const networkBg = backgroundModule.getNetworkBackground();
                if (networkBg) {
                    networkBg.stopAnimation();
                    networkBg.startAnimation();
                }
            } else {
                console.log('Module background non disponible');
            }
        },
        
        logStats: () => {
            const backgroundModule = window.App?.getModule('background');
            if (backgroundModule && backgroundModule.isReady()) {
                const networkBg = backgroundModule.getNetworkBackground();
                if (networkBg) {
                    console.log('Statistiques du background', {
                        pointsCount: networkBg.points?.length || 0,
                        connectionsCount: networkBg.connections?.length || 0,
                        animationActive: !!networkBg.animationId,
                        canvasSize: {
                            width: networkBg.canvasManager?.getWidth() || 0,
                            height: networkBg.canvasManager?.getHeight() || 0
                        }
                    });
                }
            } else {
                console.log('Module background non disponible');
            }
        }
    };
}