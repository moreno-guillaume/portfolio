// INFO: import des styles globaux de l'application
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
        // INFO: utilisation d'une Map pour stocker les modules avec leurs identifiants
        this.modules = new Map();

        // INFO: initialisation asynchrone différée
        this.init();
    }

    // INFO: méthode d'initialisation principale avec gestion d'erreurs
    async init() {
        // INFO: initialisation séquentielle des modules de l'application
        try {
            // INFO: démarrage du module de background en premier
            await this.initBackgroundModule();
            
            // INFO: initialisation du gestionnaire de thèmes après le background
            await this.initThemeManager();
            
            console.log('info: application initialisée avec succès');
        } catch (error) {
            console.error('Erreur lors de l\'initialisation de l\'application:', error);
            // TODO: ajouter un système de fallback en cas d'échec d'initialisation
        }
    }

    // INFO: initialisation spécifique du module de background avec canvas
    async initBackgroundModule() {
        // INFO: création et configuration du module d'animation de fond
        try {
            // INFO: instanciation du module avec l'ID du canvas cible
            const backgroundModule = new BackgroundModule('networkCanvas');
            
            // INFO: initialisation asynchrone du module et récupération de l'instance
            const networkBackground = await backgroundModule.init();
            
            // INFO: enregistrement du module dans la collection pour référence future
            this.modules.set('background', backgroundModule);

            // DEBUG: vérification différée de l'état de l'animation
            setTimeout(() => {
                if (networkBackground && networkBackground.animationId) {
                    console.log('debug: animation de background démarrée avec succès');
                } else {
                    console.log('debug: animation de background non démarrée ou arrêtée');
                }
            }, 1000);
            
        } catch (error) {
            console.error('Erreur lors de l\'initialisation du module Background:', error);
            // INFO: propagation de l'erreur pour gestion au niveau supérieur
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
        // INFO: recherche du module dans la Map avec gestion des cas d'absence
        const module = this.modules.get(moduleName);
        
        if (!module) {
            console.log('debug: module demandé introuvable', { 
                moduleName, 
                available: Array.from(this.modules.keys()) 
            });
        }
        
        return module;
    }

    // INFO: méthode de nettoyage complète de l'application et de ses ressources
    destroy() {
        // INFO: destruction séquentielle de tous les modules enregistrés
        this.modules.forEach((module, name) => {
            if (module && typeof module.destroy === 'function') {
                try {
                    // INFO: appel de la méthode destroy de chaque module
                    module.destroy();
                    console.log('info: module détruit', name);
                } catch (error) {
                    console.error('Erreur lors de la destruction du module:', name, error);
                }
            }
        });
        
        // INFO: vidage de la collection des modules
        this.modules.clear();
        console.log('info: application détruite proprement');
    }
}

// INFO: initialisation de l'application au chargement complet du DOM
document.addEventListener('DOMContentLoaded', () => {
    // INFO: création de l'instance principale de l'application
    try {
        // INFO: exposition de l'application sur window pour l'accès global
        window.App = new App();

        // DEBUG: vérification de la création réussie de l'application
        if (window.App) {
            console.log('debug: application créée et exposée sur window.App');
        }
        
    } catch (error) {
        console.error('Erreur critique lors du démarrage de l\'application:', error);
        // TODO: implémenter un système de notification d'erreur pour l'utilisateur
    }
});

// INFO: nettoyage automatique avant la fermeture/rechargement de la page
window.addEventListener('beforeunload', () => {
    // INFO: destruction propre de l'application pour éviter les fuites mémoire
    if (window.App) {
        console.log('info: destruction de l\'application avant fermeture');
        try {
            window.App.destroy();
        } catch (error) {
            console.error('Erreur lors du nettoyage:', error);
        }
    } else {
        console.log('debug: aucune application à nettoyer');
    }
});

// INFO: gestionnaire global des erreurs JavaScript non capturées
window.addEventListener('error', (event) => {
    console.error('Erreur JavaScript globale capturée:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
    });
    
    // TODO: envoyer les erreurs critiques vers un service de monitoring
});

// INFO: gestionnaire des promesses rejetées non gérées
window.addEventListener('unhandledrejection', (event) => {
    console.error('Promesse rejetée non gérée:', event.reason);
    
    // TODO: implémenter un système de fallback pour les promesses échouées
});

// INFO: utilitaires de debug disponibles uniquement en mode développement
if (import.meta.env.DEV) {
    // INFO: exposition d'outils de debug sur window pour inspection en console
    window.DebugUtils = {
        // INFO: accès direct à l'instance de l'application
        getApp: () => window.App,
        
        // INFO: récupération de tous les modules actifs sous forme d'objet
        getModules: () => {
            const app = window.App;
            if (!app) return {};
            
            const modules = {};
            app.modules.forEach((module, name) => {
                modules[name] = module;
            });
            return modules;
        },
        
        // INFO: redémarrage manuel de l'animation pour les tests
        restartAnimation: () => {
            const backgroundModule = window.App?.getModule('background');
            if (backgroundModule && backgroundModule.isReady()) {
                const networkBg = backgroundModule.getNetworkBackground();
                if (networkBg) {
                    networkBg.stopAnimation();
                    networkBg.startAnimation();
                    console.log('debug: animation redémarrée manuellement');
                }
            } else {
                console.log('debug: module background non disponible pour redémarrage');
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