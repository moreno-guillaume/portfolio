// INFO: Module de gestion des thèmes visuels de l'application
// INFO: Contrôle les couleurs du canvas et l'interface selon le thème sélectionné

export class ThemeManager {
    constructor() {
        // INFO: Map des thèmes disponibles avec leurs configurations
        this.themes = new Map([
            ['light', {
                name: 'Clair',
                canvasBackground: '#e3ecf0',
                canvasPoints: '#5E5E5E', 
                canvasConnections: 'rgba(94, 94, 94, 1)',
                icon: '☀️'
            }],
            ['dark', {
                name: 'Sombre',
                canvasBackground: '#1a1a1a',
                canvasPoints: '#ecf0f1',
                canvasConnections: 'rgba(236, 240, 241, 1)',
                icon: '🌙'
            }],
            ['colorblind', {
                name: 'Accessible',
                canvasBackground: '#f0f4f8',
                canvasPoints: '#0066cc',
                canvasConnections: 'rgba(0, 102, 204, 1)',
                icon: '👁️'
            }],
            ['devnotes', {
                name: 'DevNotes',
                canvasBackground: '#f8f9fa', // INFO: Sera hérité dynamiquement
                canvasPoints: '#6c757d',
                canvasConnections: 'rgba(108, 117, 125, 1)',
                icon: '📝'
            }]
        ]);

        // INFO: État actuel du gestionnaire de thèmes
        this.currentTheme = 'light';
        this.previousTheme = 'light'; // INFO: Pour DevNotes qui hérite du thème précédent
        this.buttonsContainer = null;
        this.devnotesContainer = null; // INFO: Container séparé pour DevNotes
        this.backgroundModule = null;
        this.isInitialized = false;

        // DEBUG: Vérification de l'initialisation
        console.log('debug: ThemeManager créé avec', this.themes.size, 'thèmes disponibles');
    }

    // INFO: Initialisation du module avec création de l'interface
    async init(backgroundModule = null) {
        try {
            // INFO: Référence vers le module de background pour mise à jour des couleurs
            this.backgroundModule = backgroundModule;

            // INFO: Création de l'interface utilisateur
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

    // INFO: Création des boutons de navigation thématique
    createThemeNavigation() {
        // INFO: Container pour les 3 boutons de thèmes principaux (gauche)
        this.buttonsContainer = document.createElement('div');
        this.buttonsContainer.className = 'theme-navigation';
        this.buttonsContainer.setAttribute('role', 'navigation');
        this.buttonsContainer.setAttribute('aria-label', 'Navigation des thèmes');

        // INFO: Container pour le bouton DevNotes (droite)
        this.devnotesContainer = document.createElement('div');
        this.devnotesContainer.className = 'devnotes-navigation';

        // INFO: Génération des boutons pour chaque thème avec positionnement
        this.themes.forEach((themeConfig, themeKey) => {
            const button = this.createThemeButton(themeKey, themeConfig);
            
            // INFO: Séparation des boutons selon leur type
            if (themeKey === 'devnotes') {
                // INFO: DevNotes va dans le container de droite
                this.devnotesContainer.appendChild(button);
            } else {
                // INFO: Les autres thèmes vont dans le container de gauche
                this.buttonsContainer.appendChild(button);
            }
        });

        // INFO: Insertion des deux containers dans le DOM
        document.body.appendChild(this.buttonsContainer);
        document.body.appendChild(this.devnotesContainer);
        
        // DEBUG: Vérification de l'insertion DOM
        console.log('debug: Navigation thématique créée avec 3 boutons à gauche et 1 à droite');
    }

    // INFO: Création d'un bouton de thème individuel
    createThemeButton(themeKey, themeConfig) {
        const button = document.createElement('button');
        button.className = 'theme-btn';
        button.dataset.theme = themeKey;
        button.setAttribute('type', 'button');
        button.setAttribute('aria-label', `Activer le thème ${themeConfig.name}`);
        button.setAttribute('title', `Thème ${themeConfig.name}`);

        // INFO: Contenu du bouton avec icône uniquement (pas de texte)
        button.innerHTML = `
            <span class="theme-btn__icon">${themeConfig.icon}</span>
        `;

        // INFO: Marquage du thème actuel
        if (themeKey === this.currentTheme) {
            button.classList.add('theme-btn--active');
            button.setAttribute('aria-pressed', 'true');
        } else {
            button.setAttribute('aria-pressed', 'false');
        }

        return button;
    }

    // INFO: Configuration des événements utilisateur
    setupEventListeners() {
        // INFO: Délégation d'événements sur les deux containers pour optimiser les performances
        this.buttonsContainer.addEventListener('click', (event) => {
            const button = event.target.closest('.theme-btn');
            if (button && button.dataset.theme) {
                this.switchTheme(button.dataset.theme);
            }
        });

        this.devnotesContainer.addEventListener('click', (event) => {
            const button = event.target.closest('.theme-btn');
            if (button && button.dataset.theme) {
                this.switchTheme(button.dataset.theme);
            }
        });

        // INFO: Support du clavier pour l'accessibilité
        document.addEventListener('keydown', (event) => {
            this.handleKeyboardNavigation(event);
        });

        // DEBUG: Vérification de l'attachement des événements
        console.log('debug: Événements de navigation thématique configurés sur les deux containers');
    }

    // INFO: Gestion de la navigation clavier pour l'accessibilité
    handleKeyboardNavigation(event) {
        // INFO: Raccourcis clavier pour changement rapide de thème
        const themeKeys = {
            'Digit1': 'light',
            'Digit2': 'dark', 
            'Digit3': 'colorblind',
            'Digit4': 'devnotes'
        };
        
        // INFO: Application du thème si touche valide pressée
        if (themeKeys[event.code] && event.target === document.body) {
            event.preventDefault();
            this.switchTheme(themeKeys[event.code]);
            
            // DEBUG: Log des raccourcis clavier utilisés
            console.log('debug: Changement de thème via clavier:', themeKeys[event.code]);
        }
    }

    // INFO: Changement de thème principal avec validation
    switchTheme(newTheme) {
        // INFO: Validation de l'existence du thème demandé
        if (!this.themes.has(newTheme)) {
            console.warn('debug: Thème demandé inexistant:', newTheme);
            return false;
        }

        // INFO: Pas de changement si c'est le thème actuel
        if (newTheme === this.currentTheme) {
            console.log('debug: Thème déjà actif:', newTheme);
            return false;
        }

        // INFO: Sauvegarde du thème précédent pour DevNotes
        if (newTheme === 'devnotes') {
            // INFO: DevNotes hérite du thème précédent
            this.previousTheme = this.currentTheme;
        } else {
            this.previousTheme = this.currentTheme;
            this.currentTheme = newTheme;
        }

        // INFO: Application du nouveau thème
        this.applyTheme(newTheme);
        this.updateButtonsState(newTheme);

        // DEBUG: Confirmation du changement de thème
        console.log('debug: Thème changé de', this.previousTheme, 'vers', newTheme);
        
        return true;
    }

    // INFO: Application des couleurs d'un thème au canvas
    applyTheme(themeKey) {
        const theme = this.themes.get(themeKey);
        if (!theme) {
            console.error('Erreur: Configuration de thème introuvable:', themeKey);
            return;
        }

        // INFO: Gestion spéciale pour DevNotes qui hérite des couleurs
        let colorsToApply = theme;
        if (themeKey === 'devnotes' && this.previousTheme !== 'devnotes') {
            const previousThemeConfig = this.themes.get(this.previousTheme);
            if (previousThemeConfig) {
                // INFO: DevNotes utilise les couleurs du thème précédent
                colorsToApply = {
                    ...theme,
                    canvasBackground: previousThemeConfig.canvasBackground,
                    canvasPoints: previousThemeConfig.canvasPoints,
                    canvasConnections: previousThemeConfig.canvasConnections
                };
                console.log('debug: DevNotes hérite des couleurs de:', this.previousTheme);
            }
        }

        // INFO: Mise à jour des variables CSS pour le canvas
        this.updateCanvasColors(colorsToApply);

        // INFO: Notification du module de background si disponible
        if (this.backgroundModule && this.backgroundModule.isReady()) {
            const networkBackground = this.backgroundModule.getNetworkBackground();
            if (networkBackground && networkBackground.canvasManager) {
                // INFO: Demande de mise à jour des couleurs du canvas
                networkBackground.canvasManager.updateThemeColors();
                console.log('debug: Couleurs du canvas mises à jour pour le thème:', themeKey);
            }
        }

        // DEBUG: Affichage des couleurs appliquées
        console.log('debug: Couleurs appliquées:', {
            theme: themeKey,
            background: colorsToApply.canvasBackground,
            points: colorsToApply.canvasPoints
        });
    }

    // INFO: Mise à jour des variables CSS personnalisées
    updateCanvasColors(themeConfig) {
        const root = document.documentElement;
        
        // INFO: Application des nouvelles variables CSS
        root.style.setProperty('--canvas-background', themeConfig.canvasBackground);
        root.style.setProperty('--canvas-points', themeConfig.canvasPoints);
        root.style.setProperty('--canvas-connections', themeConfig.canvasConnections);

        // DEBUG: Vérification de l'application des variables
        const updatedBg = getComputedStyle(root).getPropertyValue('--canvas-background').trim();
        console.log('debug: Variable CSS mise à jour --canvas-background:', updatedBg);
    }

    // INFO: Mise à jour de l'état visuel des boutons
    updateButtonsState(activeTheme) {
        if (!this.buttonsContainer && !this.devnotesContainer) return;

        // INFO: Recherche des boutons dans les deux containers
        const allButtons = [
            ...this.buttonsContainer.querySelectorAll('.theme-btn'),
            ...this.devnotesContainer.querySelectorAll('.theme-btn')
        ];
        
        allButtons.forEach(button => {
            const isActive = button.dataset.theme === activeTheme;
            
            // INFO: Mise à jour des classes et attributs ARIA
            button.classList.toggle('theme-btn--active', isActive);
            button.setAttribute('aria-pressed', isActive.toString());
        });

        // DEBUG: Confirmation de la mise à jour des boutons
        console.log('debug: État des boutons mis à jour pour le thème:', activeTheme);
    }

    // INFO: Récupération du thème actuellement actif
    getCurrentTheme() {
        return {
            current: this.currentTheme,
            previous: this.previousTheme,
            config: this.themes.get(this.currentTheme)
        };
    }

    // INFO: Récupération de la configuration d'un thème spécifique
    getThemeConfig(themeKey) {
        return this.themes.get(themeKey) || null;
    }

    // INFO: Vérification de l'état d'initialisation
    isReady() {
        return this.isInitialized && this.buttonsContainer !== null && this.devnotesContainer !== null;
    }

    // INFO: Nettoyage complet du module
    destroy() {
        // INFO: Suppression des événements et éléments DOM
        if (this.buttonsContainer) {
            this.buttonsContainer.remove();
            this.buttonsContainer = null;
        }

        if (this.devnotesContainer) {
            this.devnotesContainer.remove();
            this.devnotesContainer = null;
        }

        // INFO: Réinitialisation des références
        this.backgroundModule = null;
        this.isInitialized = false;

        console.log('info: ThemeManager détruit proprement');
    }
}