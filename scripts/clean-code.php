<?php
/**
 * Script de nettoyage intelligent et sécurisé
 * Version 2.1 - Ne supprime QUE les vrais commentaires de debug et info
 * 
 * SÉCURITÉS :
 * - Préserve les attributs PHP 8 (#[...])
 * - Préserve les docblocks importants
 * - Préserve les commentaires de licence
 * - Mode dry-run pour tester
 */

class SmartCodeCleaner
{
   private array $targetDirectories = [
    'src/Controller',           
    'templates',                
    'assets/js',                // Remplace public/js
    'assets/scss',              // Remplace public/css
];

    // Dossiers explicitement exclus du nettoyage
    private array $excludedDirectories = [
        '.git',
        '.github',
        'vendor',
        'node_modules',
        '.phpunit.cache',
        'var',
        'bin',
        'config',
        'migrations',
    ];

    // Patterns TRÈS spécifiques pour les vrais commentaires de debug et info
    private array $safeCleaningPatterns = [
        'js' => [
            // Console logs - VERSION SIMPLE : toute ligne avec console.log + mot-clé
            '/^.*console\.log.*[\'"].*?(debug|test|temp|todo|fixme|info).*$/im',
            '/^.*console\.(warn|error|info).*[\'"].*?(debug|test|temp).*$/im',
            
            // Commentaires avec mots-clés de debug et info
            '/\/\/\s*(TODO|FIXME|DEBUG|TEST|TEMP|XXX|HACK|INFO).*$/m',
            '/\/\/\s*(todo|fixme|debug|test|temp|xxx|hack|info).*$/m',
            
            // Commentaires vides ou très courts
            '/\/\/\s*$/m',
            '/\/\/\s{1,3}$/m',
        ],
        
        'php' => [
            // Commentaires avec mots-clés de debug et info - Version simplifiée et sûre
            '/\/\/\s*(TODO|FIXME|DEBUG|TEST|TEMP|XXX|HACK|INFO).*$/m',
            '/\/\/\s*(todo|fixme|debug|test|temp|xxx|hack|info).*$/m',
            
            // Commentaires vides
            '/\/\/\s*$/m',
            
            // Commentaires multilignes avec mots-clés debug et info (PRÉSERVE docblocks /**)
            '/\/\*(?!\*)\s*(TODO|FIXME|DEBUG|TEST|TEMP|INFO)[\s\S]*?\*\//m',
            '/\/\*(?!\*)\s*(todo|fixme|debug|test|temp|info)[\s\S]*?\*\//m',
        ],
        
        'css' => [
            // Commentaires CSS avec mots-clés de debug et info
            '/\/\*\s*(TODO|FIXME|DEBUG|TEST|TEMP|INFO)[\s\S]*?\*\//m',
            '/\/\*\s*(todo|fixme|debug|test|temp|info)[\s\S]*?\*\//m',
        ],
        
        'twig' => [
            // Commentaires Twig avec mots-clés de debug et info
            '/\{\#\s*(TODO|FIXME|DEBUG|TEST|TEMP|INFO)[\s\S]*?\#\}/m',
            '/\{\#\s*(todo|fixme|debug|test|temp|info)[\s\S]*?\#\}/m',
        ],
        'scss' => [
        // Commentaires SCSS avec mots-clés de debug et info
        '/\/\*\s*(TODO|FIXME|DEBUG|TEST|TEMP|INFO)[\s\S]*?\*\//m',
        '/\/\*\s*(todo|fixme|debug|test|temp|info)[\s\S]*?\*\//m',
        
        // Commentaires // en SCSS
        '/\/\/\s*(TODO|FIXME|DEBUG|TEST|TEMP|XXX|HACK|INFO).*$/m',
        '/\/\/\s*(todo|fixme|debug|test|temp|xxx|hack|info).*$/m',
    ]
    ];

    private bool $dryRun = false;
    private array $stats = [];

    public function __construct(bool $dryRun = false)
    {
        $this->dryRun = $dryRun;
        $this->stats = ['scanned' => 0, 'cleaned' => 0, 'lines_removed' => 0];
    }

    public function cleanPortfolioCode(): void
    {
        echo "Smart Code Cleaner v2.1\n";
        echo "Mode sécurisé : Supprime UNIQUEMENT les commentaires de debug et info\n";
        echo "Mode : " . ($this->dryRun ? "DRY-RUN (simulation)" : "NETTOYAGE RÉEL") . "\n";
        echo "Dossiers exclus : " . implode(', ', $this->excludedDirectories) . "\n\n";
        
        foreach ($this->targetDirectories as $directory) {
            if (!is_dir($directory)) {
                echo "Dossier ignoré (inexistant) : $directory\n";
                continue;
            }

            echo "Analyse de : $directory\n";
            $this->cleanDirectory($directory);
        }

        $this->showSummary();
    }

    private function cleanDirectory(string $directory): void
    {
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($directory, RecursiveDirectoryIterator::SKIP_DOTS)
        );

        foreach ($iterator as $file) {
            if ($file->isFile() && !$this->isInExcludedDirectory($file->getPathname())) {
                $this->cleanFile($file->getPathname());
            }
        }
    }

    private function isInExcludedDirectory(string $filePath): bool
    {
        foreach ($this->excludedDirectories as $excludedDir) {
            if (strpos($filePath, DIRECTORY_SEPARATOR . $excludedDir . DIRECTORY_SEPARATOR) !== false || 
                strpos($filePath, $excludedDir . DIRECTORY_SEPARATOR) === 0) {
                return true;
            }
        }
        return false;
    }

    private function cleanFile(string $filePath): void
    {
        $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
        
        if (str_ends_with($filePath, '.html.twig')) {
            $extension = 'twig';
        }

        if (!isset($this->safeCleaningPatterns[$extension])) {
            return;
        }

        $this->stats['scanned']++;
        
        // Gestion de l'encodage UTF-8
        $originalContent = file_get_contents($filePath);
        if ($originalContent === false) {
            echo "   ERREUR : Impossible de lire " . $this->getRelativePath($filePath) . "\n";
            return;
        }
        
        // Assurer l'encodage UTF-8
        if (!mb_check_encoding($originalContent, 'UTF-8')) {
            $originalContent = mb_convert_encoding($originalContent, 'UTF-8', 'auto');
        }
        
        $cleanedContent = $this->applySmartCleaning($originalContent, $extension);
        
        $originalLines = substr_count($originalContent, "\n");
        $cleanedLines = substr_count($cleanedContent, "\n");
        $linesRemoved = $originalLines - $cleanedLines;
        
        // FIX: Condition corrigée - ne se base plus sur $linesRemoved > 0
        if ($originalContent !== $cleanedContent) {
            if (!$this->dryRun) {
                file_put_contents($filePath, $cleanedContent);
            }
            
            // Calculer les caractères supprimés pour un meilleur affichage
            $charactersRemoved = strlen($originalContent) - strlen($cleanedContent);
            
            echo "   " . ($this->dryRun ? "[TEST]" : "[CLEAN]") . " " . 
                 $this->getRelativePath($filePath) . " (-$charactersRemoved caractères" . 
                 ($linesRemoved > 0 ? ", -$linesRemoved lignes" : "") . ")\n";
            
            $this->stats['cleaned']++;
            $this->stats['lines_removed'] += $linesRemoved;
        }
    }

    private function applySmartCleaning(string $content, string $fileType): string
    {
        $cleaned = $content;
        $originalLength = strlen($content);
        
        if (!isset($this->safeCleaningPatterns[$fileType])) {
            return $cleaned;
        }

        $totalRemoved = 0;
        foreach ($this->safeCleaningPatterns[$fileType] as $pattern) {
            $beforeLength = strlen($cleaned);
            $cleaned = preg_replace($pattern, '', $cleaned);
            $afterLength = strlen($cleaned);
            $totalRemoved += ($beforeLength - $afterLength);
        }

        if ($totalRemoved > 0) {
            echo "      → Supprimé $totalRemoved caractères avec patterns $fileType\n";
        }

        // Nettoyer les lignes vides excessives mais préserver la structure
        $cleaned = preg_replace('/\n\s*\n\s*\n\s*\n/', "\n\n\n", $cleaned);
        
        return $cleaned;
    }

    private function getRelativePath(string $filePath): string
    {
        $cwd = getcwd();
        if (strpos($filePath, $cwd) === 0) {
            return substr($filePath, strlen($cwd) + 1);
        }
        return basename($filePath);
    }

    private function showSummary(): void
    {
        echo "\nRÉSUMÉ DU NETTOYAGE\n";
        echo "   Fichiers analysés : {$this->stats['scanned']}\n";
        echo "   Fichiers nettoyés : {$this->stats['cleaned']}\n";
        echo "   Lignes supprimées : {$this->stats['lines_removed']}\n";
        
        if ($this->dryRun) {
            echo "\nC'était un DRY-RUN ! Aucun fichier n'a été modifié.\n";
            echo "   Pour appliquer les changements : php scripts/clean-code.php --apply\n";
        } else {
            echo "\nNettoyage terminé avec succès !\n";
        }
    }
}

// Gestion des arguments
$dryRun = true; // Par défaut en mode dry-run pour la sécurité

if (isset($argv[1])) {
    if ($argv[1] === '--apply') {
        $dryRun = false;
    } elseif ($argv[1] === '--dry-run' || $argv[1] === '--test') {
        $dryRun = true;
    } elseif ($argv[1] === '--help') {
        echo "Smart Code Cleaner v2.1\n\n";
        echo "Usage:\n";
        echo "  php scripts/clean-code.php           # Mode dry-run (test)\n";
        echo "  php scripts/clean-code.php --apply   # Nettoyage réel\n";
        echo "  php scripts/clean-code.php --test    # Mode dry-run explicite\n";
        echo "  php scripts/clean-code.php --help    # Cette aide\n\n";
        echo "Supprime UNIQUEMENT les commentaires de debug et info (TODO, FIXME, INFO, etc.)\n";
        echo "Préserve les attributs PHP 8, docblocks et code important.\n";
        exit(0);
    }
}

$cleaner = new SmartCodeCleaner($dryRun);
$cleaner->cleanPortfolioCode();