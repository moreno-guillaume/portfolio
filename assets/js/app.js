// INFO: Import du SCSS principal
import '../scss/app.scss'

// INFO: Import du module background via son point d'entrée
import { BackgroundModule } from './modules/background/index.js'

// INFO: Classe principale de l'application portfolio
class App {
    constructor() {
        console.log('info: Initialisation de l\'application Portfolio');
        
        // INFO: Registre des modules de l'application
        this.modules = new Map();
        
        // DEBUG: informations sur l'environnement d'exécution
        console.log('debug: User Agent:', navigator.userAgent);
        console.log('debug: Dimensions viewport:', window.innerWidth, 'x', window.innerHeight);
        console.log('debug: Device Pixel Ratio:', window.devicePixelRatio);
        
        this.init();
    }

    async init() {
        console.log('info: Démarrage de la séquence d\'initialisation');
        
        try {
            // INFO: Initialisation du module d'animation de fond
            await this.initBackgroundModule();
            
            // TODO: initialiser le module de navigation
            // TODO: initialiser le module de portfolio
            // TODO: initialiser le module d'interface utilisateur
            
            console.log('info: Application initialisée avec succès');
            
            // DEBUG: état final de l'application
            console.log('debug: Modules chargés:', Array.from(this.modules.keys()));
            
        } catch (error) {
            console.error('Erreur lors de l\'initialisation de l\'application:', error);
            
            // TODO: implémenter un système de fallback gracieux
            // TODO: afficher un message d'erreur utilisateur-friendly
        }
    }

    async initBackgroundModule() {
        console.log('info: Initialisation du module Background');
        
        try {
            // INFO: Instanciation du module Background
            const backgroundModule = new BackgroundModule('networkCanvas');
            
            // INFO: Initialisation du module
            const networkBackground = await backgroundModule.init();
            
            // INFO: Enregistrement du module dans le registre
            this.modules.set('background', backgroundModule);
            
            console.log('info: Module Background initialisé et enregistré');
            
            // DEBUG: vérification du démarrage de l'animation
            setTimeout(() => {
                if (networkBackground && networkBackground.animationId) {
                    console.log('debug: Animation confirmée démarrée');
                } else {
                    console.warn('debug: Animation ne semble pas démarrée');
                }
            }, 1000);
            
        } catch (error) {
            console.error('Erreur lors de l\'initialisation du module Background:', error);
            
            // FIXME: l'échec de l'animation ne doit pas bloquer le reste de l'application
            // TODO: afficher un fond statique en fallback
            throw error;
        }
    }

    getModule(moduleName) {
        // INFO: Accessor pattern pour récupérer des références aux modules
        const module = this.modules.get(moduleName);
        
        if (!module) {
            // DEBUG: module demandé non disponible
            console.warn('debug: Module demandé non trouvé:', moduleName);
            console.log('debug: Modules disponibles:', Array.from(this.modules.keys()));
        }
        
        return module;
    }

    destroy() {
        // INFO: Nettoyage propre de l'application pour éviter les fuites mémoire
        console.log('info: Destruction de l\'application en cours...');
        
        // INFO: Parcours et destruction de tous les modules
        this.modules.forEach((module, name) => {
            if (module && typeof module.destroy === 'function') {
                try {
                    // DEBUG: destruction d'un module spécifique
                    console.log('debug: Destruction du module', name);
                    module.destroy();
                } catch (error) {
                    console.error('Erreur lors de la destruction du module:', name, error);
                }
            }
        });
        
        // INFO: Nettoyage du registre des modules
        this.modules.clear();
        console.log('info: Application détruite proprement');
        
        // TODO: nettoyer les event listeners globaux
        // TODO: annuler les timers et intervals en cours
    }
}

// INFO: Initialisation automatique quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    console.log('info: DOM chargé, initialisation de l\'application');
    
    // DEBUG: vérifier l'état du document
    console.log('debug: Document ready state:', document.readyState);
    console.log('debug: Nombre d\'éléments dans le DOM:', document.querySelectorAll('*').length);
    
    try {
        // INFO: Création de l'instance globale de l'application
        window.App = new App();
        console.log('info: Instance App créée et attachée à window.App');
        
        // DEBUG: vérifier que l'App est accessible globalement
        if (window.App) {
            console.log('debug: window.App accessible:', typeof window.App);
        }
        
    } catch (error) {
        console.error('Erreur critique lors du démarrage de l\'application:', error);
        
        // TODO: implémenter un mode de récupération d'erreur
        // TODO: afficher un message d'erreur à l'utilisateur
    }
});

// INFO: Nettoyage automatique avant déchargement de la page
window.addEventListener('beforeunload', () => {
    console.log('info: Déchargement de la page détecté');
    
    if (window.App) {
        // DEBUG: nettoyage avant fermeture
        console.log('debug: Nettoyage de l\'application avant déchargement');
        
        try {
            window.App.destroy();
        } catch (error) {
            console.error('Erreur lors du nettoyage:', error);
        }
    } else {
        // DEBUG: aucune instance à nettoyer
        console.warn('debug: Aucune instance App à nettoyer');
    }
});

// INFO: Gestionnaire d'erreurs globales pour le debugging
window.addEventListener('error', (event) => {
    console.error('Erreur JavaScript globale capturée:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
    });
    
    // TODO: envoyer les erreurs à un service de monitoring en production
});

// INFO: Gestionnaire pour les promesses rejetées
window.addEventListener('unhandledrejection', (event) => {
    console.error('Promesse rejetée non gérée:', event.reason);
    
    // TODO: implémenter une gestion gracieuse des erreurs async
});

// INFO: Exposition d'utilitaires de debugging en mode développement
if (import.meta.env.DEV) {
    // DEBUG: utilitaires de debug accessibles via la console
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
                    console.log('debug: Animation redémarrée');
                }
            } else {
                console.warn('debug: Module background non disponible');
            }
        },
        logStats: () => {
            const backgroundModule = window.App?.getModule('background');
            if (backgroundModule && backgroundModule.isReady()) {
                const networkBg = backgroundModule.getNetworkBackground();
                if (networkBg) {
                    console.log('debug: Points:', networkBg.points.length);
                    console.log('debug: Connexions:', networkBg.connections.length);
                    console.log('debug: Canvas:', networkBg.canvasManager.getWidth(), 'x', networkBg.canvasManager.getHeight());
                }
            } else {
                console.warn('debug: Module background non disponible pour les stats');
            }
        }
    };
    
    console.log('debug: DebugUtils exposés dans window.DebugUtils');
}

// TODO: ajouter un système de configuration centralisé
// TODO: implémenter un router pour la navigation SPA
// TODO: ajouter un gestionnaire d'état global
// TODO: implémenter un système de thèmes
// TODO: ajouter des métriques de performance