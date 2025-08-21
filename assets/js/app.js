import '../scss/app.scss'



// INFO: import complet de Bootstrap JavaScript avec tous les composants
import * as bootstrap from 'bootstrap'

// INFO: import du module de gestion du background animé
import { BackgroundModule } from './modules/background/index.js'

// INFO: import du nouveau module de gestion des thèmes
import { ThemeManager } from './modules/theme-manager/index.js'

// INFO: classe principale de l'application gérant l'initialisation et les modules


class App {
    constructor() {
        this.modules = new Map();
        this.init();
    }

    async init() {
        try {
            await this.initBackgroundModule();


            
            // INFO: initialisation du gestionnaire de thèmes après le background
            await this.initThemeManager();
            
            console.log('info: application initialisée avec succès');


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



    // INFO: initialisation du module de gestion des thèmes
    async initThemeManager() {
        try {
            // INFO: création de l'instance du gestionnaire de thèmes
            const themeManager = new ThemeManager();
            
            // INFO: récupération du module de background pour coordination
            const backgroundModule = this.modules.get('background');
            
            // INFO: initialisation avec référence au module de background
            await themeManager.init(backgroundModule);
            
            // INFO: enregistrement du module pour accès ultérieur
            this.modules.set('themeManager', themeManager);
            
            // DEBUG: vérification de l'initialisation du gestionnaire de thèmes
            if (themeManager.isReady()) {
                console.log('debug: gestionnaire de thèmes opérationnel');
            } else {
                console.warn('debug: gestionnaire de thèmes non prêt après initialisation');

            }
            
        } catch (error) {
            console.error('Erreur lors de l\'initialisation du ThemeManager:', error);

            // INFO: non-critique, l'application peut fonctionner sans thèmes

            console.warn('info: application continue sans gestionnaire de thèmes');
        }
    }


    // INFO: récupère un module spécifique par son nom depuis la collection


    getModule(moduleName) {
        const module = this.modules.get(moduleName);
        
        if (!module) {

            console.log('debug: module demandé introuvable', { 
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

        

        // INFO: changement de thème via console pour debug

        switchTheme: (themeName) => {
            const themeManager = window.App?.getModule('themeManager');
            if (themeManager && themeManager.isReady()) {
                const result = themeManager.switchTheme(themeName);

                console.log('debug: changement de thème via console:', themeName, result);
                return result;
            } else {
                console.log('debug: gestionnaire de thèmes non disponible');
                return false;
            }
        },
        
        // INFO: affichage des statistiques de performance et d'état


        logStats: () => {
            const backgroundModule = window.App?.getModule('background');
            const themeManager = window.App?.getModule('themeManager');
            
            const stats = {
                background: null,
                theme: null
            };
            

            // INFO: statistiques du module de background
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
            
            // INFO: statistiques du gestionnaire de thèmes

            if (themeManager && themeManager.isReady()) {
                stats.theme = themeManager.getCurrentTheme();
            }
            

            console.log('debug: statistiques de l\'application', stats);

            return stats;
        }
    };


    console.log('debug: DebugUtils exposés sur window.DebugUtils avec nouvelles fonctions thématiques');

}