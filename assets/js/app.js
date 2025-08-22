import '../scss/app.scss';


// INFO: Import du module de gestion du background animé
import { BackgroundModule } from './modules/background/index.js';

// INFO: Import du gestionnaire de thèmes pour l'interface utilisateur

import { ThemeManager } from './modules/theme-manager/index.js';

// INFO: Classe principale de l'application gérant l'initialisation et la coordination des modules
class App {
    constructor() {
        // INFO: Collection des modules de l'application pour gestion centralisée
        this.modules = new Map();
        this.init();
    }

    // INFO: Initialisation séquentielle des modules de l'application
    async init() {
        try {
            // INFO: Initialisation du module background en premier pour le canvas
            await this.initBackgroundModule();

            // INFO: Initialisation du gestionnaire de thèmes après le background
            await this.initThemeManager();
        } catch (error) {
            console.error("Erreur lors de l'initialisation de l'application:", error);
        }
    }

    // INFO: Initialisation du module de background avec gestion d'erreurs
    async initBackgroundModule() {
        try {
            // INFO: Création de l'instance du module background
            const backgroundModule = new BackgroundModule('networkCanvas');
            
            // INFO: Initialisation asynchrone du module
            await backgroundModule.init();
            
            // INFO: Enregistrement dans la collection des modules
            this.modules.set('background', backgroundModule);
        } catch (error) {
            console.error("Erreur lors de l'initialisation du module Background:", error);
            throw error;
        }
    }

    // INFO: Initialisation du gestionnaire de thèmes avec liaison au background
    async initThemeManager() {
        try {
            // INFO: Création de l'instance du gestionnaire de thèmes
            const themeManager = new ThemeManager();

            // INFO: Récupération du module background pour coordination
            const backgroundModule = this.modules.get('background');

            // INFO: Initialisation avec référence au background pour synchronisation
            await themeManager.init(backgroundModule);

            // INFO: Enregistrement du gestionnaire de thèmes
            this.modules.set('themeManager', themeManager);
        } catch (error) {
            console.error("Erreur lors de l'initialisation du ThemeManager:", error);

            // INFO: Erreur non-critique, l'application peut fonctionner sans thèmes
            console.warn('info: application continue sans gestionnaire de thèmes');
        }
    }

    // INFO: Récupération d'un module spécifique par son nom
    getModule(moduleName) {
        const module = this.modules.get(moduleName);
        return module;
    }

    // INFO: Nettoyage propre de tous les modules lors de la fermeture
    destroy() {
        this.modules.forEach((module, name) => {
            // INFO: Vérification de l'existence de la méthode destroy
            if (module && typeof module.destroy === 'function') {
                try {
                    module.destroy();
                } catch (error) {
                    console.error('Erreur lors de la destruction du module:', name, error);
                }
            }
        });

        // INFO: Vidage de la collection des modules
        this.modules.clear();
    }
}

// INFO: Initialisation de l'application lors du chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
    try {
        // INFO: Création de l'instance globale de l'application
        window.App = new App();
    } catch (error) {
        console.error("Erreur critique lors du démarrage de l'application:", error);
    }
});

// INFO: Nettoyage avant fermeture de la page
window.addEventListener('beforeunload', () => {
    if (window.App) {
        try {
            window.App.destroy();
        } catch (error) {
            console.error('Erreur lors du nettoyage:', error);
        }
    }
});

// INFO: Gestionnaire global d'erreurs JavaScript
window.addEventListener('error', event => {
    console.error('Erreur JavaScript globale capturée:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
    });
});

// INFO: Gestionnaire des promesses rejetées non gérées
window.addEventListener('unhandledrejection', event => {
    console.error('Promesse rejetée non gérée:', event.reason);
});

// INFO: Utilitaires de débogage disponibles en mode développement
if (import.meta.env.DEV) {
    window.DebugUtils = {
        // INFO: Accès à l'instance principale de l'application
        getApp: () => window.App,

        // INFO: Récupération de tous les modules pour inspection
        getModules: () => {
            const app = window.App;
            if (!app) return {};

            const modules = {};
            app.modules.forEach((module, name) => {
                modules[name] = module;
            });
            return modules;
        },

        // INFO: Redémarrage de l'animation pour tests de performance
        restartAnimation: () => {
            const backgroundModule = window.App?.getModule('background');
            if (backgroundModule && backgroundModule.isReady()) {
                const networkBg = backgroundModule.getNetworkBackground();
                if (networkBg) {
                    networkBg.stopAnimation();
                    networkBg.startAnimation();
                }
            }
        },

        // INFO: Changement de thème via console pour tests
        switchTheme: themeName => {
            const themeManager = window.App?.getModule('themeManager');
            if (themeManager && themeManager.isReady()) {
                const result = themeManager.switchTheme(themeName);

                return result;
            } else {
                return false;
            }
        },

        // INFO: Affichage des statistiques de performance et d'état
        logStats: () => {
            const backgroundModule = window.App?.getModule('background');
            const themeManager = window.App?.getModule('themeManager');

            // INFO: Collection des statistiques des différents modules
            const stats = {
                background: null,
                theme: null,
            };

            // INFO: Statistiques du module background si disponible
            if (backgroundModule && backgroundModule.isReady()) {
                const networkBg = backgroundModule.getNetworkBackground();
                if (networkBg) {
                    stats.background = {
                        pointsCount: networkBg.points?.length || 0,
                        connectionsCount: networkBg.connections?.length || 0,
                        animationActive: !!networkBg.animationId,
                        canvasSize: {
                            width: networkBg.canvasManager?.getWidth() || 0,
                            height: networkBg.canvasManager?.getHeight() || 0,
                        },
                    };
                }
            }

            // INFO: Statistiques du gestionnaire de thèmes si disponible
            if (themeManager && themeManager.isReady()) {
                stats.theme = themeManager.getCurrentTheme();
            }

            return stats;
        },
    };
}