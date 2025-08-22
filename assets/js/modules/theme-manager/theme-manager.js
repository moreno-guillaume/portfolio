export class ThemeManager {
    constructor() {
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

        this.devNotesConfig = {
            name: 'DevNotes',
            iconClass: 'bi-journal-code',
        };

        this.currentTheme = 'light';
        this.isDevNotesActive = false;

        this.buttonsContainer = null;
        this.devnotesContainer = null;
        this.backgroundModule = null;
        this.isInitialized = false;
    }

    async init(backgroundModule = null) {
        try {
            this.backgroundModule = backgroundModule;
            this.createThemeNavigation();
            this.setupEventListeners();
            this.applyTheme(this.currentTheme);

            this.isInitialized = true;

            return this;
        } catch (error) {
            console.error("Erreur lors de l'initialisation du ThemeManager:", error);
            this.isInitialized = false;
            throw error;
        }
    }

    createThemeNavigation() {
        this.buttonsContainer = document.createElement('div');
        this.buttonsContainer.className = 'theme-navigation';
        this.buttonsContainer.setAttribute('role', 'navigation');
        this.buttonsContainer.setAttribute('aria-label', 'Navigation des thèmes');

        this.devnotesContainer = document.createElement('div');
        this.devnotesContainer.className = 'devnotes-navigation';

        this.themes.forEach((themeConfig, themeKey) => {
            const button = this.createThemeButton(themeKey, themeConfig);
            this.buttonsContainer.appendChild(button);
        });

        const devNotesButton = this.createDevNotesButton();
        this.devnotesContainer.appendChild(devNotesButton);

        document.body.appendChild(this.buttonsContainer);
        document.body.appendChild(this.devnotesContainer);
    }

    createThemeButton(themeKey, themeConfig) {
        const button = document.createElement('button');
        button.className = 'theme-btn';
        button.dataset.theme = themeKey;
        button.setAttribute('type', 'button');
        button.setAttribute('aria-label', `Activer le thème ${themeConfig.name}`);
        button.setAttribute('title', `Thème ${themeConfig.name}`);

        button.innerHTML = `<i class="theme-btn__icon bi ${themeConfig.iconClass}"></i>`;

        if (themeKey === this.currentTheme) {
            button.classList.add('theme-btn--active');
            button.setAttribute('aria-pressed', 'true');
        } else {
            button.setAttribute('aria-pressed', 'false');
        }

        return button;
    }

    createDevNotesButton() {
        const button = document.createElement('button');
        button.className = 'theme-btn';
        button.dataset.action = 'devnotes';

        button.setAttribute('type', 'button');
        button.setAttribute('aria-label', `Toggle ${this.devNotesConfig.name}`);
        button.setAttribute('title', this.devNotesConfig.name);

        button.innerHTML = `<i class="theme-btn__icon bi ${this.devNotesConfig.iconClass}"></i>`;

        button.classList.toggle('theme-btn--active', this.isDevNotesActive);
        button.setAttribute('aria-pressed', this.isDevNotesActive.toString());

        return button;
    }

    setupEventListeners() {
        this.buttonsContainer.addEventListener('click', event => {
            const button = event.target.closest('.theme-btn');
            if (button && button.dataset.theme) {
                this.switchTheme(button.dataset.theme);
            }
        });

        this.devnotesContainer.addEventListener('click', event => {
            const button = event.target.closest('.theme-btn');
            if (button && button.dataset.action === 'devnotes') {
                this.toggleDevNotes();
            }
        });

        document.addEventListener('keydown', event => {
            this.handleKeyboardNavigation(event);
        });
    }

    handleKeyboardNavigation(event) {
        const actionKeys = {
            Digit1: () => this.switchTheme('light'),
            Digit2: () => this.switchTheme('dark'),
            Digit3: () => this.switchTheme('colorblind'),

            Digit4: () => this.toggleDevNotes(),
        };

        if (actionKeys[event.code] && event.target === document.body) {
            event.preventDefault();
            actionKeys[event.code]();
        }
    }

    switchTheme(newTheme) {
        if (!this.themes.has(newTheme)) {
            return false;
        }

        if (newTheme === this.currentTheme) {
            return false;
        }

        this.currentTheme = newTheme;
        this.applyTheme(newTheme);
        this.updateThemeButtonsState();

        return this.isDevNotesActive;
    }

    toggleDevNotes() {

    this.isDevNotesActive = !this.isDevNotesActive;
    this.handleDevNotesToggle(this.isDevNotesActive);
    this.updateDevNotesButtonState();
    return this.isDevNotesActive;
}
    handleDevNotesToggle(isActive) {
        // Exemples possibles :
        // - Afficher/masquer des panels d'informations
        // - Modifier l'interface utilisateur
        // - Activer/désactiver des fonctionnalités de debug
        // - Changer le contenu du main-container

        if (isActive) {
            // Exemple : document.body.classList.add('devnotes-mode');
        } else {
            // Exemple : document.body.classList.remove('devnotes-mode');
        }
    }

    applyTheme(themeKey) {
        const theme = this.themes.get(themeKey);
        if (!theme) {
            console.error('Erreur: Configuration de thème introuvable:', themeKey);
            return;
        }

        this.updateCanvasColors(theme);

        if (this.backgroundModule && this.backgroundModule.isReady()) {
            const networkBackground = this.backgroundModule.getNetworkBackground();
            if (networkBackground && networkBackground.canvasManager) {
                networkBackground.canvasManager.updateThemeColors();
            }
        }
    }

    updateCanvasColors(themeConfig) {
        const root = document.documentElement;
        root.style.setProperty('--canvas-background', themeConfig.canvasBackground);
        root.style.setProperty('--canvas-points', themeConfig.canvasPoints);
        root.style.setProperty('--canvas-connections', themeConfig.canvasConnections);
    }

    updateThemeButtonsState() {
        if (!this.buttonsContainer) return;

        const themeButtons = this.buttonsContainer.querySelectorAll('.theme-btn');
        themeButtons.forEach(button => {
            const isActive = button.dataset.theme === this.currentTheme;
            button.classList.toggle('theme-btn--active', isActive);
            button.setAttribute('aria-pressed', isActive.toString());
        });
    }

    updateDevNotesButtonState() {
        if (!this.devnotesContainer) return;

        const devNotesButton = this.devnotesContainer.querySelector('.theme-btn');
        if (devNotesButton) {
            devNotesButton.classList.toggle('theme-btn--active', this.isDevNotesActive);
            devNotesButton.setAttribute('aria-pressed', this.isDevNotesActive.toString());
        }
    }

    getCurrentTheme() {
        return {
            theme: this.currentTheme,
            devNotes: this.isDevNotesActive,
            themeConfig: this.themes.get(this.currentTheme),
        };
    }

    getThemeConfig(themeKey) {
        return this.themes.get(themeKey) || null;
    }

    isReady() {
        return (
            this.isInitialized && this.buttonsContainer !== null && this.devnotesContainer !== null
        );
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
    }
}
