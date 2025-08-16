#!/bin/bash

# Script de verification de la configuration de deploiement
# INFO: Verifie que tous les fichiers necessaires sont presents et correctement configures
# TODO: Ajouter verification des permissions sur les fichiers critiques

echo "Verification de la configuration de deploiement OVH"
echo "=================================================="

# Variables de controle des erreurs et avertissements
ERRORS=0
WARNINGS=0

# INFO: Fonction d'affichage des resultats avec codes de retour
# DEBUG: Utilise des codes couleur pour faciliter la lecture
check_file() {
    if [ -f "$1" ]; then
        echo "✓ $1 existe"
    else
        echo "✗ $1 manquant"
        ERRORS=$((ERRORS + 1))
        # DEBUG: Afficher le chemin complet pour aider au debugging
        echo "debug: chemin verifie: $(pwd)/$1"
    fi
}

# DEBUG: Fonction pour verifier le contenu des fichiers de configuration
# FIXME: Ameliorer la detection de contenu avec regex plus precises
check_content() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo "✓ $1 contient $3"
    else
        echo "✗ $1 ne contient pas $3"
        ERRORS=$((ERRORS + 1))
        # DEBUG: Afficher un extrait du fichier pour debugging
        echo "debug: premiere ligne du fichier $1:"
        head -n1 "$1" 2>/dev/null || echo "debug: fichier illisible"
    fi
}

# Verification des fichiers obligatoires pour le deploiement
echo ""
echo "1. Verification des fichiers de configuration"
echo "--------------------------------------------"

# INFO: Ces fichiers sont indispensables pour le deploiement automatique
check_file ".github/workflows/deploy-prod.yml"
check_file ".env.prod"
check_file "public/.htaccess"
check_file ".htaccess"

# TODO: Ajouter verification du fichier robots.txt pour le SEO
# check_file "public/robots.txt"

# INFO: Verification du contenu des fichiers critiques pour le deploiement
# DEBUG: S'assurer que les variables importantes sont bien definies
echo ""
echo "2. Verification du contenu des fichiers"
echo "--------------------------------------"

if [ -f ".env.prod" ]; then
    check_content ".env.prod" "APP_ENV=prod" "l'environnement de production"
    check_content ".env.prod" "APP_DEBUG=false" "le debug desactive"
    
    # TODO: Ameliorer la detection de cle par defaut avec regex plus robuste
    # INFO: Verification que la cle secrete par defaut a ete remplacee
    if grep -q "REMPLACER_PAR_UNE_VRAIE_CLE" ".env.prod"; then
        echo "⚠ .env.prod contient encore la cle par defaut"
        WARNINGS=$((WARNINGS + 1))
        # DEBUG: Rappel de la commande pour generer une cle
        echo "debug: generer une cle avec: php -r \"echo bin2hex(random_bytes(16)) . PHP_EOL;\""
    else
        echo "✓ .env.prod contient une cle secrete personnalisee"
    fi
    
    # TODO: Verifier la longueur de la cle secrete (doit etre 32 caracteres)
else
    # DEBUG: Information supplementaire si le fichier est absent
    echo "debug: .env.prod absent, creer depuis .env.prod.example ou artifact"
fi

if [ -f ".github/workflows/deploy-prod.yml" ]; then
    check_content ".github/workflows/deploy-prod.yml" "FTP_HOST" "la configuration FTP"
    check_content ".github/workflows/deploy-prod.yml" "SamKirkland/FTP-Deploy-Action" "l'action de deploiement"
    
    # DEBUG: Verification de la syntaxe YAML basique
    if command -v yamllint &> /dev/null; then
        if yamllint ".github/workflows/deploy-prod.yml" &> /dev/null; then
            echo "✓ Syntaxe YAML valide"
        else
            echo "⚠ Erreurs de syntaxe YAML detectees"
            WARNINGS=$((WARNINGS + 1))
        fi
    fi
else
    # DEBUG: Aide pour creer le fichier manquant
    echo "debug: workflow absent, copier depuis l'artifact deploy-prod.yml"
fi

# Verification des outils necessaires au deploiement
echo ""
echo "3. Verification des outils necessaires"
echo "-------------------------------------"

# INFO: Ces outils sont requis pour le build et le deploiement
if command -v php &> /dev/null; then
    PHP_VERSION=$(php --version | head -n1)
    echo "✓ PHP disponible ($PHP_VERSION)"
    
    # TODO: Verifier que PHP >= 8.2 comme requis par Symfony
    # DEBUG: Extraction de la version numerique pour comparaison
    if php -r "exit(version_compare(PHP_VERSION, '8.2.0', '>=') ? 0 : 1);"; then
        echo "✓ Version PHP compatible (>= 8.2)"
    else
        echo "⚠ Version PHP peut etre incompatible"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo "✗ PHP non disponible"
    ERRORS=$((ERRORS + 1))
    # DEBUG: Suggestion d'installation selon l'OS
    echo "debug: installer PHP 8.2+ requis pour Symfony"
fi

if command -v composer &> /dev/null; then
    COMPOSER_VERSION=$(composer --version | head -n1)
    echo "✓ Composer disponible ($COMPOSER_VERSION)"
    
    # DEBUG: Verification que composer.json existe
    if [ -f "composer.json" ]; then
        echo "✓ composer.json present"
    else
        echo "⚠ composer.json absent"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo "✗ Composer non disponible"
    ERRORS=$((ERRORS + 1))
    # DEBUG: URL d'installation de Composer
    echo "debug: installer depuis https://getcomposer.org/"
fi

if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✓ npm disponible (version $NPM_VERSION)"
    
    # TODO: Verifier que npm >= 8 pour compatibilite avec package-lock v2
    # DEBUG: Verification du package.json
    if [ -f "package.json" ]; then
        echo "✓ package.json present"
    else
        echo "⚠ package.json absent"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo "✗ npm non disponible"
    ERRORS=$((ERRORS + 1))
    # DEBUG: Suggestion d'installation Node.js
    echo "debug: installer Node.js depuis https://nodejs.org/"
fi

# Verification des scripts du projet
echo ""
echo "4. Verification des scripts du projet"
echo "------------------------------------"

if [ -f "scripts/clean-code.php" ]; then
    echo "✓ Script de nettoyage disponible"
    
    # INFO: Test du script de nettoyage en mode dry-run
    # DEBUG: Verification que le script fonctionne sans erreur PHP
    if php scripts/clean-code.php --test &> /dev/null; then
        echo "✓ Script de nettoyage fonctionnel"
    else
        echo "⚠ Script de nettoyage avec erreurs"
        WARNINGS=$((WARNINGS + 1))
        # DEBUG: Afficher la premiere ligne d'erreur
        echo "debug: erreur detectee:"
        php scripts/clean-code.php --test 2>&1 | head -n1
    fi
    
    # TODO: Verifier que le script detecte bien tous les mots-cles
    # TEMP: Test basique avec un fichier temporaire
    echo "// TODO: test temporaire" > /tmp/test-clean.js
    if php scripts/clean-code.php --test 2>&1 | grep -q "test-clean.js"; then
        echo "✓ Detection des commentaires fonctionne"
    else
        echo "⚠ Detection des commentaires incertaine"
        WARNINGS=$((WARNINGS + 1))
    fi
    rm -f /tmp/test-clean.js
else
    echo "✗ Script de nettoyage manquant"
    ERRORS=$((ERRORS + 1))
    # DEBUG: Information sur l'emplacement attendu
    echo "debug: script attendu dans scripts/clean-code.php"
fi

# Verification de la configuration Symfony
echo ""
echo "5. Verification de la configuration Symfony"
echo "------------------------------------------"

if [ -f "composer.json" ]; then
    echo "✓ composer.json present"
    
    # INFO: Verification que Symfony est bien installe
    if grep -q "symfony/framework-bundle" "composer.json"; then
        echo "✓ Symfony detecte dans composer.json"
        
        # DEBUG: Verification des dependances Symfony critiques
        if grep -q "symfony/console" "composer.json"; then
            echo "✓ Console Symfony disponible"
        fi
    else
        echo "⚠ Symfony non detecte dans composer.json"
        WARNINGS=$((WARNINGS + 1))
        # DEBUG: Verification alternative
        echo "debug: verifier que c'est bien un projet Symfony"
    fi
    
    # TODO: Verifier la version de Symfony (doit etre >= 6.0)
else
    echo "✗ composer.json manquant"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "package.json" ]; then
    echo "✓ package.json present"
    
    # INFO: Verification que Vite est configure pour le build
    if grep -q "vite" "package.json"; then
        echo "✓ Vite detecte dans package.json"
        
        # DEBUG: Verification du script de build
        if grep -q "\"build\":" "package.json"; then
            echo "✓ Script build configure"
        else
            echo "⚠ Script build manquant dans package.json"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        echo "⚠ Vite non detecte dans package.json"
        WARNINGS=$((WARNINGS + 1))
        # DEBUG: Suggestion de configuration
        echo "debug: ajouter vite comme dependance de dev"
    fi
else
    echo "✗ package.json manquant"
    ERRORS=$((ERRORS + 1))
fi

# Test du build pour verifier que tout fonctionne
echo ""
echo "6. Test du build"
echo "---------------"

if [ -f "package.json" ] && command -v npm &> /dev/null; then
    echo "Test du build Vite..."
    # TEMP: Redirection stderr pour eviter le spam de logs pendant le test
    # DEBUG: Sauvegarde des logs de build pour debugging si echec
    if npm run build > /tmp/build.log 2>&1; then
        echo "✓ Build Vite reussi"
        
        # INFO: Verification que Vite a bien genere les assets dans public/build
        if [ -d "public/build" ]; then
            echo "✓ Dossier public/build cree"
            
            # DEBUG: Affichage du contenu genere
            BUILD_FILES=$(ls public/build/ 2>/dev/null | wc -l)
            echo "debug: $BUILD_FILES fichiers generes dans public/build/"
            
            # TODO: Verifier la presence du manifest.json genere par Vite
            if [ -f "public/build/manifest.json" ]; then
                echo "✓ Manifest Vite genere"
            else
                echo "⚠ Manifest Vite manquant"
                WARNINGS=$((WARNINGS + 1))
            fi
        else
            echo "⚠ Dossier public/build non trouve"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        echo "✗ Echec du build Vite"
        ERRORS=$((ERRORS + 1))
        # DEBUG: Affichage des premieres lignes d'erreur
        echo "debug: erreurs de build:"
        head -n5 /tmp/build.log 2>/dev/null
    fi
    
    # TEMP: Nettoyage du fichier de log temporaire
    rm -f /tmp/build.log
else
    echo "⚠ Impossible de tester le build (dependances manquantes)"
    WARNINGS=$((WARNINGS + 1))
fi

# DEBUG: Verification de la configuration Git pour les commits automatiques
echo ""
echo "7. Verification de Git"
echo "--------------------"

if git status &> /dev/null; then
    echo "✓ Repository Git detecte"
    
    CURRENT_BRANCH=$(git branch --show-current)
    echo "✓ Branche actuelle: $CURRENT_BRANCH"
    
    # TODO: Verifier aussi que la branche dev existe et est synchronisee
    if git show-ref --verify --quiet refs/heads/dev; then
        echo "✓ Branche dev existe"
    else
        echo "⚠ Branche dev non trouvee"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    # INFO: Verification de la configuration du remote origin
    if git remote get-url origin &> /dev/null; then
        REMOTE_URL=$(git remote get-url origin)
        echo "✓ Remote origin configure ($REMOTE_URL)"
        
        # DEBUG: Verification que c'est bien un repo GitHub
        if echo "$REMOTE_URL" | grep -q "github.com"; then
            echo "✓ Repository GitHub detecte"
        else
            echo "⚠ Repository non-GitHub, actions GitHub indisponibles"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        echo "⚠ Remote origin non configure"
        WARNINGS=$((WARNINGS + 1))
        # DEBUG: Commande pour configurer le remote
        echo "debug: configurer avec: git remote add origin <URL>"
    fi
    
    # FIXME: Verifier s'il y a des changements non commites qui pourraient interferer
    if ! git diff-index --quiet HEAD --; then
        echo "⚠ Changements non commites detectes"
        WARNINGS=$((WARNINGS + 1))
        echo "debug: commiter les changements avant deploiement"
    fi
else
    echo "✗ Pas dans un repository Git"
    ERRORS=$((ERRORS + 1))
    # DEBUG: Guide d'initialisation Git
    echo "debug: initialiser avec: git init && git remote add origin <URL>"
fi

# Resume final avec recommendations
echo ""
echo "Resume de la verification"
echo "========================"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "✓ Configuration complete et prete pour le deploiement"
    echo ""
    echo "Prochaines etapes:"
    echo "1. Generer une cle secrete Symfony si pas encore fait"
    echo "2. Configurer les secrets GitHub (FTP_HOST, FTP_USERNAME, etc.)"
    echo "3. Commiter et pusher la feature branch"
    echo "4. Suivre le workflow habituel: feature → dev → main"
    # DEBUG: Rappel du workflow complet
    echo ""
    echo "debug: workflow complet:"
    echo "  feature/tool/ovh-connect → dev → main → auto-clean → prod → OVH"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo "⚠ Configuration fonctionnelle avec $WARNINGS avertissement(s)"
    echo "Le deploiement devrait fonctionner mais verifiez les points ci-dessus"
    # TODO: Ajouter details sur comment corriger chaque avertissement
    exit 0
else
    echo "✗ Configuration incomplete: $ERRORS erreur(s), $WARNINGS avertissement(s)"
    echo "Corrigez les erreurs avant de proceder au deploiement"
    # DEBUG: Suggestion de relancer le script apres corrections
    echo ""
    echo "debug: relancer ce script apres avoir corrige les erreurs"
    echo "debug: certaines erreurs peuvent necessiter l'installation d'outils"
    exit 1
fi