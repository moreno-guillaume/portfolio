// INFO: Point d'entrée principal de l'application portfolio
// INFO: Implémente le pattern Module pour l'organisation des fonctionnalités

import { CanvasManager } from './background/canvas-manager.js';
import { PointGenerator } from './background/point-generator.js';
import { NetworkBackground } from './background/network.js';

class App {
    constructor()
    {
        // INFO: Architecture modulaire pour faciliter l'ajout de nouvelles fonctionnalités
        console.log('info: Initialisation de l\'application Portfolio');
        
        this.modules = {}; // INFO: Registre des modules chargés
        
        // DEBUG: Vérifier l'environnement d'exécution
        console.log('debug: User Agent:', navigator.userAgent);
        console.log('debug: Dimensions viewport:', window.innerWidth, 'x', window.innerHeight);
        console.log('debug: Device Pixel Ratio:', window.devicePixelRatio);
        
        this.init();
    }

    async init()
    {
        // INFO: Séquence d'initialisation asynchrone pour gérer les dépendances
        console.log('info: Démarrage de la séquence d\'initialisation');
        
        try {
            // INFO: Phase 1 - Initialisation de l'animation de fond
            await this.initBackgroundAnimation();
            
            // TODO: Phase 2 - Initialiser le système de navigation
            // TODO: Phase 3 - Charger le contenu dynamique du portfolio
            // TODO: Phase 4 - Initialiser les animations de scroll
            // TODO: Phase 5 - Configurer les interactions utilisateur
            
            console.log('info: Application initialisée avec succès');
            
            // DEBUG: État final de l'application
            console.log('debug: Modules chargés:', Object.keys(this.modules));
            
        } catch (error) {
            console.error('Erreur lors de l\'initialisation de l\'application:', error);
            
            // TODO: Implémenter un système de fallback gracieux
            // TODO: Afficher un message d'erreur utilisateur-friendly
        }
    }

    async initBackgroundAnimation()
    {
        // INFO: Initialise l'animation de réseau de particules en arrière-plan
        console.log('info: Initialisation du module d\'animation de fond');
        
        try {
            // DEBUG: Vérifier que le canvas existe dans le DOM
            const canvas = document.getElementById('networkCanvas');
            if (!canvas) {
                throw new Error('Canvas networkCanvas introuvable dans le DOM');
            }
            
            console.log('debug: Canvas trouvé, dimensions:', canvas.clientWidth, 'x', canvas.clientHeight);
            
            // INFO: Instanciation du module d'animation
            this.modules.backgroundAnimation = new NetworkBackground();
            
            console.log('info: Module d\'animation de fond initialisé avec succès');
            
            // DEBUG: Vérifier que l'animation démarre
            setTimeout(() => {
                if (this.modules.backgroundAnimation.animationId) {
                    console.log('debug: Animation confirmée démarrée');
                } else {
                    console.warn('debug: Animation ne semble pas démarrée');
                }
            }, 1000);
            
        } catch (error) {
            console.error('Erreur lors de l\'initialisation de l\'animation de fond:', error);
            
            // INFO: L'échec de l'animation ne doit pas bloquer le reste de l'application
            // TODO: Afficher un fond statique en fallback
            throw error; // INFO: Remonter l'erreur pour le moment en dev
        }
    }

    getModule(moduleName)
    {
        // INFO: Accessor pattern pour récupérer des références aux modules
        const module = this.modules[moduleName];
        
        if (!module) {
            console.warn('debug: Module demandé non trouvé:', moduleName);
            console.log('debug: Modules disponibles:', Object.keys(this.modules));
        }
        
        return module;
    }

    destroy()
    {
        // INFO: Nettoyage propre de l'application pour éviter les fuites mémoire
        console.log('info: Destruction de l\'application en cours...');
        
        // INFO: Parcourt tous les modules et appelle leur méthode destroy si elle existe
        Object.values(this.modules).forEach((module, index) => {
            if (module && typeof module.destroy === 'function') {
                try {
                    console.log('debug: Destruction du module', index);
                    module.destroy();
                } catch (error) {
                    console.error('Erreur lors de la destruction d\'un module:', error);
                }
            }
        });
        
        // INFO: Vide le registre des modules
        this.modules = {};
        
        console.log('info: Application détruite proprement');
        
        // TODO: Nettoyer les event listeners globaux
        // TODO: Annuler les timers et intervals en cours
    }
}

// INFO: Initialisation automatique quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    console.log('info: DOM chargé, initialisation de l\'application');
    
    // DEBUG: Vérifier l'état du document
    console.log('debug: Document ready state:', document.readyState);
    console.log('debug: Nombre d\'éléments dans le DOM:', document.querySelectorAll('*').length);
    
    try {
        // INFO: Création de l'instance globale de l'application
        window.App = new App();
        console.log('info: Instance App créée et attachée à window.App');
        
        // DEBUG: Vérifier que l'App est accessible globalement
        if (window.App) {
            console.log('debug: window.App accessible:', typeof window.App);
        }
        
    } catch (error) {
        console.error('Erreur critique lors du démarrage de l\'application:', error);
        
        // TODO: Implémenter un mode de récupération d'erreur
        // TODO: Afficher un message d'erreur à l'utilisateur
    }
});

// INFO: Nettoyage automatique avant déchargement de la page
window.addEventListener('beforeunload', () => {
    console.log('info: Déchargement de la page détecté');
    
    if (window.App) {
        console.log('debug: Nettoyage de l\'application avant déchargement');
        
        try {
            window.App.destroy();
        } catch (error) {
            console.error('Erreur lors du nettoyage:', error);
        }
    } else {
        console.warn('debug: Aucune instance App à nettoyer');
    }
});

// DEBUG: Gestionnaire d'erreurs globales pour le debugging
window.addEventListener('error', (event) => {
    console.error('Erreur JavaScript globale capturée:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
    });
    
    // TODO: Envoyer les erreurs à un service de monitoring en production
});

// DEBUG: Gestionnaire pour les promesses rejetées
window.addEventListener('unhandledrejection', (event) => {
    console.error('Promesse rejetée non gérée:', event.reason);
    
    // TODO: Implémenter une gestion gracieuse des erreurs async
});

// INFO: Exposition d'utilitaires de debugging en mode développement
if (process?.env?.NODE_ENV === 'development') {
    // DEBUG: Utilitaires de debug accessibles via la console
    window.DebugUtils = {
        getApp: () => window.App,
        getModules: () => window.App?.modules || {},
        restartAnimation: () => {
            const bg = window.App?.getModule('backgroundAnimation');
            if (bg) {
                bg.stopAnimation();
                bg.startAnimation();
                console.log('debug: Animation redémarrée');
            }
        },
        logStats: () => {
            const bg = window.App?.getModule('backgroundAnimation');
            if (bg) {
                console.log('debug: Points:', bg.points.length);
                console.log('debug: Connexions:', bg.connections.length);
                console.log('debug: Canvas:', bg.canvasManager.getWidth(), 'x', bg.canvasManager.getHeight());
            }
        }
    };
    
    console.log('debug: DebugUtils exposés dans window.DebugUtils');
}

// TODO: Ajouter un système de modules dynamiques
// TODO: Implémenter un router pour la navigation SPA
// TODO: Ajouter un gestionnaire d'état global
// TODO: Implémenter un système de thèmes
// TODO: Ajouter des métriques de performance