


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
            console.error('Erreur lors de l\'initialisation de l\'application:', error);


        }
    }

    async initBackgroundAnimation()
    {


        try {
            
            const canvas = document.getElementById('networkCanvas');
            if (!canvas) {
                throw new Error('Canvas networkCanvas introuvable dans le DOM');
            }


            this.modules.backgroundAnimation = new NetworkBackground();


            setTimeout(() => {
                if (this.modules.backgroundAnimation.animationId) {

                } else {

                }
            }, 1000);
            
        } catch (error) {
            console.error('Erreur lors de l\'initialisation de l\'animation de fond:', error);


            throw error; 
        }
    }

    getModule(moduleName)
    {
        
        const module = this.modules[moduleName];
        
        if (!module) {


        }
        
        return module;
    }

    destroy()
    {


        Object.values(this.modules).forEach((module, index) => {
            if (module && typeof module.destroy === 'function') {
                try {

                    module.destroy();
                } catch (error) {
                    console.error('Erreur lors de la destruction d\'un module:', error);
                }
            }
        });
        
        
        this.modules = {};


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


if (process?.env?.NODE_ENV === 'development') {
    
    window.DebugUtils = {
        getApp: () => window.App,
        getModules: () => window.App?.modules || {},
        restartAnimation: () => {
            const bg = window.App?.getModule('backgroundAnimation');
            if (bg) {
                bg.stopAnimation();
                bg.startAnimation();

            }
        },
        logStats: () => {
            const bg = window.App?.getModule('backgroundAnimation');
            if (bg) {


            }
        }
    };
    

}


