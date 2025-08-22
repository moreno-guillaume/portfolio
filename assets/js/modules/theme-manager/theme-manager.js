// INFO: Gestionnaire de thèmes visuels et mode développeur pour l'application
export class ThemeManager {
    constructor() {
        // INFO: Configuration des thèmes disponibles avec propriétés CSS
        this.themes = new Map([
            [
                'light',
                {
                    name: 'Clair',
                    canvasBackground: '#e3ecf0',
                    canvasPoints: '#5E5E5E',
                    canvasConnections: 'rgba(94, 94, 94, 1)',
                    iconClass: 'bi-sun',
                    buttonStyle: 'light',
                },
            ],
            [
                'dark',
                {
                    name: 'Sombre',
                    canvasBackground: '#1a1a1a',
                    canvasPoints: '#ecf0f1',
                    canvasConnections: 'rgba(236, 240, 241, 1)',
                    iconClass: 'bi-moon',
                    buttonStyle: 'dark',
                },
            ],
            [
                'colorblind',
                {
                    name: 'Accessible',
                    canvasBackground: '#f0f4f8',
                    canvasPoints: '#0066cc',
                    canvasConnections: 'rgba(0, 102, 204, 1)',
                    iconClass: 'bi-eye',
                    buttonStyle: 'light',
                },
            ],
        ]);

        // INFO: Configuration du bouton DevNotes pour fonctionnalités développeur
        this.devNotesConfig = {
            name: 'DevNotes',
            iconClass: 'bi-journal-code',
        };

        // INFO: État initial du gestionnaire de thèmes
        this.currentTheme = 'light';
        this.isDevNotesActive = false;

        // INFO: Références aux éléments DOM créés dynamiquement
        this.buttonsContainer = null;
        this.devnotesContainer = null;
        this.backgroundModule = null;
        this.isInitialized = false;
    }

    // INFO: Initialisation complète du gestionnaire avec liaison au module background
    async init(backgroundModule = null) {
        try {
            // INFO: Liaison avec le module background pour synchronisation
            this.backgroundModule = backgroundModule;
            
            // INFO: Création de l'interface utilisateur des thèmes
            this.createThemeNavigation();
            
            // INFO: Configuration des gestionnaires d'événements
            this.setupEventListeners();
            
            // INFO: Application du thème par défaut
            this.applyTheme(this.currentTheme);

            this.isInitialized = true;

            return this;
        } catch (error) {
            console.error("Erreur lors de l'initialisation du ThemeManager:", error);
            this.isInitialized = false;
            throw error;
        }
    }

    // INFO: Création des éléments de navigation des thèmes dans le DOM
    createThemeNavigation() {
        // INFO: Container principal pour les boutons de thèmes
        this.buttonsContainer = document.createElement('div');
        this.buttonsContainer.className = 'theme-navigation';
        this.buttonsContainer.setAttribute('role', 'navigation');
        this.buttonsContainer.setAttribute('aria-label', 'Navigation des thèmes');

        // INFO: Container séparé pour le bouton DevNotes
        this.devnotesContainer = document.createElement('div');
        this.devnotesContainer.className = 'devnotes-navigation';

        // INFO: Génération des boutons pour chaque thème disponible
        this.themes.forEach((themeConfig, themeKey) => {
            const button = this.createThemeButton(themeKey, themeConfig);
            this.buttonsContainer.appendChild(button);
        });

        // INFO: Création et ajout du bouton DevNotes
        const devNotesButton = this.createDevNotesButton();
        this.devnotesContainer.appendChild(devNotesButton);

        // INFO: Injection des containers dans le DOM
        document.body.appendChild(this.buttonsContainer);
        document.body.appendChild(this.devnotesContainer);
    }

    // INFO: Création d'un bouton de thème avec attributs d'accessibilité
    createThemeButton(themeKey, themeConfig) {
        const button = document.createElement('button');
        button.className = 'theme-btn';
        button.dataset.theme = themeKey;
        
        // INFO: Configuration des attributs d'accessibilité
        button.setAttribute('type', 'button');
        button.setAttribute('aria-label', `Activer le thème ${themeConfig.name}`);
        button.setAttribute('title', `Thème ${themeConfig.name}`);

        // INFO: Insertion de l'icône correspondante
        button.innerHTML = `<i class="theme-btn__icon bi ${themeConfig.iconClass}"></i>`;

        // INFO: Marquage visuel du thème actif
        if (themeKey === this.currentTheme) {
            button.classList.add('theme-btn--active');
            button.setAttribute('aria-pressed', 'true');
        } else {
            button.setAttribute('aria-pressed', 'false');
        }

        return button;
    }

    // INFO: Création du bouton DevNotes avec état toggle
    createDevNotesButton() {
        const button = document.createElement('button');
        button.className = 'theme-btn';
        button.dataset.action = 'devnotes';

        // INFO: Attributs d'accessibilité pour le toggle DevNotes
        button.setAttribute('type', 'button');
        button.setAttribute('aria-label', `Toggle ${this.devNotesConfig.name}`);
        button.setAttribute('title', this.devNotesConfig.name);

        // INFO: Icône spécifique au mode développeur
        button.innerHTML = `<i class="theme-btn__icon bi ${this.devNotesConfig.iconClass}"></i>`;

        // INFO: État initial basé sur l'activation des DevNotes
        button.classList.toggle('theme-btn--active', this.isDevNotesActive);
        button.setAttribute('aria-pressed', this.isDevNotesActive.toString());

        return button;
    }

    // INFO: Configuration des gestionnaires d'événements pour l'interface
    setupEventListeners() {
        // INFO: Gestionnaire des clics sur les boutons de thèmes
        this.buttonsContainer.addEventListener('click', event => {
            const button = event.target.closest('.theme-btn');
            if (button && button.dataset.theme) {
                this.switchTheme(button.dataset.theme);
            }
        });

        // INFO: Gestionnaire du clic sur le bouton DevNotes
        this.devnotesContainer.addEventListener('click', event => {
            const button = event.target.closest('.theme-btn');
            if (button && button.dataset.action === 'devnotes') {
                this.toggleDevNotes();
            }
        });

        // INFO: Navigation au clavier pour accessibilité
        document.addEventListener('keydown', event => {
            this.handleKeyboardNavigation(event);
        });
    }

    // INFO: Gestion de la navigation au clavier avec raccourcis
    handleKeyboardNavigation(event) {
        // INFO: Mapping des touches numériques aux actions
        const actionKeys = {
            Digit1: () => this.switchTheme('light'),
            Digit2: () => this.switchTheme('dark'),
            Digit3: () => this.switchTheme('colorblind'),
            // INFO: Raccourci pour basculer les DevNotes
            Digit4: () => this.toggleDevNotes(),
        };

        // INFO: Exécution seulement si le body a le focus
        if (actionKeys[event.code] && event.target === document.body) {
            event.preventDefault();
            actionKeys[event.code]();
        }
    }

    // INFO: Changement de thème avec validation et mise à jour de l'interface
    switchTheme(newTheme) {
        // INFO: Validation de l'existence du thème demandé
        if (!this.themes.has(newTheme)) {
            return false;
        }

        // INFO: Éviter le changement vers le thème déjà actif
        if (newTheme === this.currentTheme) {
            return false;
        }

        // INFO: Application du nouveau thème
        this.currentTheme = newTheme;
        this.applyTheme(newTheme);
        this.updateThemeButtonsState();

        return this.isDevNotesActive;
    }

    // INFO: Basculement de l'état DevNotes avec mise à jour interface
    toggleDevNotes() {

        // INFO: Inversion de l'état actuel des DevNotes
        this.isDevNotesActive = !this.isDevNotesActive;
        
        // INFO: Déclenchement du gestionnaire de changement d'état
        this.handleDevNotesToggle(this.isDevNotesActive);
        
        // INFO: Mise à jour visuelle du bouton
        this.updateDevNotesButtonState();
        
        return this.isDevNotesActive;
    }

    // INFO: Gestionnaire des actions lors du toggle DevNotes

    handleDevNotesToggle(isActive) {
        // TODO: Implémenter les fonctionnalités DevNotes spécifiques
        // INFO: Exemples d'actions possibles selon l'état
        if (isActive) {
            // DEBUG: Mode DevNotes activé
        } else {
            // DEBUG: Mode DevNotes désactivé
        }
    }

    // INFO: Application d'un thème avec mise à jour des couleurs CSS
    applyTheme(themeKey) {
        const theme = this.themes.get(themeKey);
        if (!theme) {
            console.error('Erreur: Configuration de thème introuvable:', themeKey);
            return;
        }

        // INFO: Mise à jour des variables CSS pour le canvas
        this.updateCanvasColors(theme);

        // INFO: Synchronisation avec le module background si disponible
        if (this.backgroundModule && this.backgroundModule.isReady()) {
            const networkBackground = this.backgroundModule.getNetworkBackground();
            if (networkBackground && networkBackground.canvasManager) {
                networkBackground.canvasManager.updateThemeColors();
            }
        }
    }

    // INFO: Mise à jour des propriétés CSS personnalisées pour les couleurs
    updateCanvasColors(themeConfig) {
        const root = document.documentElement;
        // INFO: Application des variables CSS du thème sélectionné
        root.style.setProperty('--canvas-background', themeConfig.canvasBackground);
        root.style.setProperty('--canvas-points', themeConfig.canvasPoints);
        root.style.setProperty('--canvas-connections', themeConfig.canvasConnections);
    }

    // INFO: Mise à jour visuelle des boutons de thèmes selon sélection
    updateThemeButtonsState() {
        if (!this.buttonsContainer) return;

        const themeButtons = this.buttonsContainer.querySelectorAll('.theme-btn');
        themeButtons.forEach(button => {
            // INFO: Marquage visuel du bouton actif
            const isActive = button.dataset.theme === this.currentTheme;
            button.classList.toggle('theme-btn--active', isActive);
            button.setAttribute('aria-pressed', isActive.toString());
        });
    }

    // INFO: Mise à jour de l'état visuel du bouton DevNotes
    updateDevNotesButtonState() {
        if (!this.devnotesContainer) return;

        const devNotesButton = this.devnotesContainer.querySelector('.theme-btn');
        if (devNotesButton) {
            // INFO: Synchronisation de l'apparence avec l'état interne
            devNotesButton.classList.toggle('theme-btn--active', this.isDevNotesActive);
            devNotesButton.setAttribute('aria-pressed', this.isDevNotesActive.toString());
        }
    }

    // INFO: Récupération de l'état complet du gestionnaire de thèmes
    getCurrentTheme() {
        return {
            theme: this.currentTheme,
            devNotes: this.isDevNotesActive,
            themeConfig: this.themes.get(this.currentTheme),
        };
    }

    // INFO: Récupération de la configuration d'un thème spécifique
    getThemeConfig(themeKey) {
        return this.themes.get(themeKey) || null;
    }

    // INFO: Vérification de l'état d'initialisation complète
    isReady() {
        return (
            this.isInitialized && 
            this.buttonsContainer !== null && 
            this.devnotesContainer !== null
        );
    }

    // INFO: Nettoyage des ressources et suppression des éléments DOM
    destroy() {
        // INFO: Suppression du container des boutons de thèmes
        if (this.buttonsContainer) {
            this.buttonsContainer.remove();
            this.buttonsContainer = null;
        }

        // INFO: Suppression du container DevNotes
        if (this.devnotesContainer) {
            this.devnotesContainer.remove();
            this.devnotesContainer = null;
        }

        // INFO: Nettoyage des références
        this.backgroundModule = null;
        this.isInitialized = false;
    }
}