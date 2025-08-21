
// INFO: Module de gestion des thèmes visuels et du toggle DevNotes
// INFO: Sépare la logique thèmes (mutuellement exclusifs) et DevNotes (toggle indépendant)

export class ThemeManager {
    constructor() {
        // INFO: Map des thèmes principaux uniquement (sans DevNotes)

        this.themes = new Map([
            ['light', {
                name: 'Clair',
                canvasBackground: '#e3ecf0',
                canvasPoints: '#5E5E5E', 
                canvasConnections: 'rgba(94, 94, 94, 1)',
                iconClass: 'bi-sun',
                buttonStyle: 'light'
            }],
            ['dark', {
                name: 'Sombre',
                canvasBackground: '#1a1a1a',
                canvasPoints: '#ecf0f1',
                canvasConnections: 'rgba(236, 240, 241, 1)',
                iconClass: 'bi-moon',
                buttonStyle: 'dark'
            }],
            ['colorblind', {
                name: 'Accessible',
                canvasBackground: '#f0f4f8',
                canvasPoints: '#0066cc',
                canvasConnections: 'rgba(0, 102, 204, 1)',
                iconClass: 'bi-eye',
                buttonStyle: 'light'
            }]
        ]);


        // INFO: Configuration DevNotes séparée (pas un thème)

        this.devNotesConfig = {
            name: 'DevNotes',
            iconClass: 'bi-journal-code'
        };


        // INFO: États séparés pour thèmes et DevNotes
        this.currentTheme = 'light';
        this.isDevNotesActive = false; // INFO: État indépendant du toggle DevNotes

        
        this.buttonsContainer = null;
        this.devnotesContainer = null;
        this.backgroundModule = null;
        this.isInitialized = false;


        console.log('debug: ThemeManager créé avec', this.themes.size, 'thèmes et DevNotes indépendant');

    }

    async init(backgroundModule = null) {
        try {
            this.backgroundModule = backgroundModule;
            this.createThemeNavigation();
            this.setupEventListeners();
            this.applyTheme(this.currentTheme);

            this.isInitialized = true;

            console.log('info: ThemeManager initialisé avec succès');

            return this;
            
        } catch (error) {
            console.error('Erreur lors de l\'initialisation du ThemeManager:', error);
            this.isInitialized = false;
            throw error;
        }
    }

    createThemeNavigation() {

        // INFO: Container pour les 3 boutons de thèmes (gauche)

        this.buttonsContainer = document.createElement('div');
        this.buttonsContainer.className = 'theme-navigation';
        this.buttonsContainer.setAttribute('role', 'navigation');
        this.buttonsContainer.setAttribute('aria-label', 'Navigation des thèmes');


        // INFO: Container pour le bouton DevNotes (droite)
        this.devnotesContainer = document.createElement('div');
        this.devnotesContainer.className = 'devnotes-navigation';

        // INFO: Création des boutons de thèmes principaux

        this.themes.forEach((themeConfig, themeKey) => {
            const button = this.createThemeButton(themeKey, themeConfig);
            this.buttonsContainer.appendChild(button);
        });


        // INFO: Création du bouton DevNotes séparé
        const devNotesButton = this.createDevNotesButton();
        this.devnotesContainer.appendChild(devNotesButton);

        // INFO: Insertion dans le DOM
        document.body.appendChild(this.buttonsContainer);
        document.body.appendChild(this.devnotesContainer);
        
        console.log('debug: Navigation créée avec 3 thèmes mutuellement exclusifs + DevNotes toggle');

    }

    createThemeButton(themeKey, themeConfig) {
        const button = document.createElement('button');
        button.className = 'theme-btn';
        button.dataset.theme = themeKey;
        button.setAttribute('type', 'button');
        button.setAttribute('aria-label', `Activer le thème ${themeConfig.name}`);
        button.setAttribute('title', `Thème ${themeConfig.name}`);

        button.innerHTML = `<i class="theme-btn__icon bi ${themeConfig.iconClass}"></i>`;

        // INFO: Marquage du thème actuel

        if (themeKey === this.currentTheme) {
            button.classList.add('theme-btn--active');
            button.setAttribute('aria-pressed', 'true');
        } else {
            button.setAttribute('aria-pressed', 'false');
        }

        return button;
    }


    // INFO: Création du bouton DevNotes avec logique de toggle
    createDevNotesButton() {
        const button = document.createElement('button');
        button.className = 'theme-btn';
        button.dataset.action = 'devnotes'; // INFO: data-action au lieu de data-theme

        button.setAttribute('type', 'button');
        button.setAttribute('aria-label', `Toggle ${this.devNotesConfig.name}`);
        button.setAttribute('title', this.devNotesConfig.name);

        button.innerHTML = `<i class="theme-btn__icon bi ${this.devNotesConfig.iconClass}"></i>`;


        // INFO: État initial du toggle DevNotes

        button.classList.toggle('theme-btn--active', this.isDevNotesActive);
        button.setAttribute('aria-pressed', this.isDevNotesActive.toString());

        return button;
    }

    setupEventListeners() {

        // INFO: Événements pour les boutons de thèmes (gauche)

        this.buttonsContainer.addEventListener('click', (event) => {
            const button = event.target.closest('.theme-btn');
            if (button && button.dataset.theme) {
                this.switchTheme(button.dataset.theme);
            }
        });


        // INFO: Événements pour le bouton DevNotes (droite)

        this.devnotesContainer.addEventListener('click', (event) => {
            const button = event.target.closest('.theme-btn');
            if (button && button.dataset.action === 'devnotes') {
                this.toggleDevNotes();
            }
        });


        // INFO: Support clavier

        document.addEventListener('keydown', (event) => {
            this.handleKeyboardNavigation(event);
        });


        console.log('debug: Événements configurés séparément pour thèmes et DevNotes');

    }

    handleKeyboardNavigation(event) {
        const actionKeys = {
            'Digit1': () => this.switchTheme('light'),
            'Digit2': () => this.switchTheme('dark'), 
            'Digit3': () => this.switchTheme('colorblind'),

            'Digit4': () => this.toggleDevNotes() // INFO: DevNotes = toggle, pas switch

        };
        
        if (actionKeys[event.code] && event.target === document.body) {
            event.preventDefault();
            actionKeys[event.code]();
          console.log('debug: Action clavier:', event.code);
        }
    }

    // INFO: Changement de thème (mutuellement exclusif)
    switchTheme(newTheme) {
        if (!this.themes.has(newTheme)) {
            console.warn('debug: Thème inexistant:', newTheme);

            return false;
        }

        if (newTheme === this.currentTheme) {

            console.log('debug: Thème déjà actif:', newTheme);

            return false;
        }

        this.currentTheme = newTheme;
        this.applyTheme(newTheme);
        this.updateThemeButtonsState();


        console.log('debug: Thème changé vers:', newTheme);
        return true;
    }

    // INFO: Toggle DevNotes (indépendant des thèmes)

    toggleDevNotes() {
        this.isDevNotesActive = !this.isDevNotesActive;
        this.updateDevNotesButtonState();


        // INFO: Ici vous pouvez ajouter la logique spécifique à DevNotes
        // Par exemple : afficher/masquer des informations, changer l'interface, etc.
        this.handleDevNotesToggle(this.isDevNotesActive);

        console.log('debug: DevNotes toggle:', this.isDevNotesActive ? 'ON' : 'OFF');
        return this.isDevNotesActive;
    }

    // INFO: Gestion de l'activation/désactivation de DevNotes
    handleDevNotesToggle(isActive) {
        // TODO: Implémenter la logique spécifique DevNotes

        // Exemples possibles :
        // - Afficher/masquer des panels d'informations
        // - Modifier l'interface utilisateur
        // - Activer/désactiver des fonctionnalités de debug
        // - Changer le contenu du main-container
        
        if (isActive) {

            console.log('info: DevNotes activé - implémenter logique spécifique');
            // Exemple : document.body.classList.add('devnotes-mode');
        } else {
            console.log('info: DevNotes désactivé - nettoyer interface');

            // Exemple : document.body.classList.remove('devnotes-mode');
        }
    }

    applyTheme(themeKey) {
        const theme = this.themes.get(themeKey);
        if (!theme) {
            console.error('Erreur: Configuration de thème introuvable:', themeKey);
            return;
        }


        // INFO: Mise à jour uniquement des couleurs du canvas, pas des boutons

        this.updateCanvasColors(theme);

        if (this.backgroundModule && this.backgroundModule.isReady()) {
            const networkBackground = this.backgroundModule.getNetworkBackground();
            if (networkBackground && networkBackground.canvasManager) {
                networkBackground.canvasManager.updateThemeColors();

                console.log('debug: Canvas mis à jour pour le thème:', themeKey);

            }
        }
    }

    updateCanvasColors(themeConfig) {
        const root = document.documentElement;
        root.style.setProperty('--canvas-background', themeConfig.canvasBackground);
        root.style.setProperty('--canvas-points', themeConfig.canvasPoints);
        root.style.setProperty('--canvas-connections', themeConfig.canvasConnections);

        // INFO: Les boutons gardent un style uniforme, pas de variables CSS pour eux
    }

    // INFO: Supprimé updateButtonsStyle() - les boutons gardent un style uniforme

    // INFO: Mise à jour des boutons de thèmes uniquement

    updateThemeButtonsState() {
        if (!this.buttonsContainer) return;

        const themeButtons = this.buttonsContainer.querySelectorAll('.theme-btn');
        themeButtons.forEach(button => {
            const isActive = button.dataset.theme === this.currentTheme;
            button.classList.toggle('theme-btn--active', isActive);
            button.setAttribute('aria-pressed', isActive.toString());
        });
    }

    // INFO: Mise à jour du bouton DevNotes uniquement

    updateDevNotesButtonState() {
        if (!this.devnotesContainer) return;

        const devNotesButton = this.devnotesContainer.querySelector('.theme-btn');
        if (devNotesButton) {
            devNotesButton.classList.toggle('theme-btn--active', this.isDevNotesActive);
            devNotesButton.setAttribute('aria-pressed', this.isDevNotesActive.toString());
        }
    }


    // INFO: Getters pour l'état actuel

    getCurrentTheme() {
        return {
            theme: this.currentTheme,
            devNotes: this.isDevNotesActive,
            themeConfig: this.themes.get(this.currentTheme)
        };
    }

    getThemeConfig(themeKey) {
        return this.themes.get(themeKey) || null;
    }

    isReady() {
        return this.isInitialized && this.buttonsContainer !== null && this.devnotesContainer !== null;
    }

    destroy() {
        if (this.buttonsContainer) {
            this.buttonsContainer.remove();
            this.buttonsContainer = null;
        }

        if (this.devnotesContainer) {
            this.devnotesContainer.remove();
            this.devnotesContainer = null;
        }

        this.backgroundModule = null;
        this.isInitialized = false;

        console.log('info: ThemeManager détruit proprement');

    }
}