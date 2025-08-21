
import '../scss/app.scss'


import * as bootstrap from 'bootstrap'


import { BackgroundModule } from './modules/background/index.js'


import { ThemeManager } from './modules/theme-manager/index.js'


class App {
    constructor() {
        
        this.modules = new Map();

        
        this.init();
    }

    
    async init() {
        
        try {
            
            await this.initBackgroundModule();


            await this.initThemeManager();


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

                } else {

                }
            }, 1000);
            
        } catch (error) {
            console.error('Erreur lors de l\'initialisation du module Background:', error);
            
            throw error;
        }
    }


    async initThemeManager() {
        try {
            
            const themeManager = new ThemeManager();
            
            
            const backgroundModule = this.modules.get('background');
            
            
            await themeManager.init(backgroundModule);
            
            
            this.modules.set('themeManager', themeManager);
            
            
            if (themeManager.isReady()) {

            } else {

            }
            
        } catch (error) {
            console.error('Erreur lors de l\'initialisation du ThemeManager:', error);
            
            console.warn('info: application continue sans gestionnaire de thèmes');
        }
    }


    getModule(moduleName) {
        
        const module = this.modules.get(moduleName);
        
        if (!module) {


                moduleName, 
                available: Array.from(this.modules.keys()) 
            });

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

            }
        },


        switchTheme: (themeName) => {
            const themeManager = window.App?.getModule('themeManager');
            if (themeManager && themeManager.isReady()) {
                const result = themeManager.switchTheme(themeName);

                return result;
            } else {

                return false;
            }
        },


        logStats: () => {
            const backgroundModule = window.App?.getModule('background');
            const themeManager = window.App?.getModule('themeManager');
            
            const stats = {
                background: null,
                theme: null
            };
            
            
            if (backgroundModule && backgroundModule.isReady()) {
                const networkBg = backgroundModule.getNetworkBackground();
                if (networkBg) {

                    stats.background = {

                        pointsCount: networkBg.points?.length || 0,
                        connectionsCount: networkBg.connections?.length || 0,
                        animationActive: !!networkBg.animationId,
                        canvasSize: {
                            width: networkBg.canvasManager?.getWidth() || 0,
                            height: networkBg.canvasManager?.getHeight() || 0
                        }
                    };
                }

            }
            
            
            if (themeManager && themeManager.isReady()) {
                stats.theme = themeManager.getCurrentTheme();
            }
            

            return stats;
        }
    };


}