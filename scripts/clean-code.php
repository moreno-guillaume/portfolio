<?php
/**
 * Script de nettoyage intelligent et simplifié
 * Version 3.0 - Délègue le formatage à Prettier, focus sur la suppression propre
 * 
 * PHILOSOPHY: 
 * - Ce script supprime intelligemment les commentaires de debug
 * - Prettier gère le formatage et l'espacement
 * - JSHint valide la syntaxe finale
 * - Chaque outil fait ce qu'il fait de mieux
 */

class SmartCodeCleaner
{
    private array $targetDirectories = [
        'src/Controller',           
        'templates',                
        'assets/js',                
        'assets/scss',              
    ];

    private array $excludedDirectories = [
        '.git', '.github', 'vendor', 'node_modules', 
        '.phpunit.cache', 'var', 'bin', 'config', 'migrations',
    ];

    // Patterns améliorés pour gérer les console.log multi-lignes
    private array $cleaningPatterns = [
        'js' => [
            // Console logs avec mots-clés de debug (version multi-lignes)
            '/console\.log\s*\(\s*[\'"`][^\'"`]*(?:debug|test|temp|todo|fixme|info)[^\'"`]*[\'"`][\s\S]*?\);?/m',
            '/console\.(warn|error|info)\s*\(\s*[\'"`][^\'"`]*(?:debug|test|temp)[^\'"`]*[\'"`][\s\S]*?\);?/m',
            
            // Commentaires avec mots-clés de debug
            '/\/\/\s*(?:TODO|FIXME|DEBUG|TEST|TEMP|XXX|HACK|INFO).*$/m',
            '/\/\/\s*(?:todo|fixme|debug|test|temp|xxx|hack|info).*$/m',
            '/\/\/\s*$/m',
        ],
        
        'php' => [
            '/\/\/\s*(?:TODO|FIXME|DEBUG|TEST|TEMP|XXX|HACK|INFO).*$/m',
            '/\/\/\s*(?:todo|fixme|debug|test|temp|xxx|hack|info).*$/m',
            '/\/\/\s*$/m',
            '/\/\*(?!\*)\s*(?:TODO|FIXME|DEBUG|TEST|TEMP|INFO)[\s\S]*?\*\//m',
            '/\/\*(?!\*)\s*(?:todo|fixme|debug|test|temp|info)[\s\S]*?\*\//m',
        ],
        
        'css' => [
            '/\/\*\s*(?:TODO|FIXME|DEBUG|TEST|TEMP|INFO)[\s\S]*?\*\//m',
            '/\/\*\s*(?:todo|fixme|debug|test|temp|info)[\s\S]*?\*\//m',
        ],
        
        'scss' => [
            '/\/\*\s*(?:TODO|FIXME|DEBUG|TEST|TEMP|INFO)[\s\S]*?\*\//m',
            '/\/\*\s*(?:todo|fixme|debug|test|temp|info)[\s\S]*?\*\//m',
            '/\/\/\s*(?:TODO|FIXME|DEBUG|TEST|TEMP|XXX|HACK|INFO).*$/m',
            '/\/\/\s*(?:todo|fixme|debug|test|temp|xxx|hack|info).*$/m',
        ],
        
        'twig' => [
            '/\{\#\s*(?:TODO|FIXME|DEBUG|TEST|TEMP|INFO)[\s\S]*?\#\}/m',
            '/\{\#\s*(?:todo|fixme|debug|test|temp|info)[\s\S]*?\#\}/m',
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
        echo "Smart Code Cleaner v3.0\n";
        echo "Focus: Suppression propre des commentaires de debug\n";
        echo "Formatage: Delégué à Prettier\n";
        echo "Validation: Déléguée à ESLint\n";
        echo "Mode : " . ($this->dryRun ? "DRY-RUN (simulation)" : "NETTOYAGE RÉEL") . "\n\n";
        
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

        if (!isset($this->cleaningPatterns[$extension])) {
            return;
        }

        $this->stats['scanned']++;
        
        $originalContent = file_get_contents($filePath);
        if ($originalContent === false) {
            echo "   ERREUR : Impossible de lire " . $this->getRelativePath($filePath) . "\n";
            return;
        }
        
        if (!mb_check_encoding($originalContent, 'UTF-8')) {
            $originalContent = mb_convert_encoding($originalContent, 'UTF-8', 'auto');
        }
        
        $cleanedContent = $this->applyCleaning($originalContent, $extension);
        
        // Post-nettoyage minimal - Prettier finalisera
        $cleanedContent = $this->basicCleanup($cleanedContent);
        
        $this->processResults($filePath, $originalContent, $cleanedContent);
    }

    private function applyCleaning(string $content, string $fileType): string
    {
        $cleaned = $content;
        $totalChanges = 0;
        
        foreach ($this->cleaningPatterns[$fileType] as $pattern) {
            $before = $cleaned;
            $cleaned = preg_replace($pattern, '', $cleaned);
            
            if ($before !== $cleaned) {
                $totalChanges++;
                if ($this->dryRun) {
                    echo "      -> Pattern appliqué (changement detecté)\n";
                }
            }
        }
        
        return $cleaned;
    }

    /**
     * Nettoyage minimal - Prettier fera le reste
     */
    private function basicCleanup(string $content): string
    {
        // Supprimer seulement les lignes complètement vides en excès
        $content = preg_replace('/\n\s*\n\s*\n\s*\n+/', "\n\n\n", $content);
        
        // Nettoyer les espaces en fin de ligne
        $content = preg_replace('/[ \t]+$/m', '', $content);
        
        return $content;
    }

    private function processResults(string $filePath, string $originalContent, string $cleanedContent): void
    {
        $originalLines = substr_count($originalContent, "\n");
        $cleanedLines = substr_count($cleanedContent, "\n");
        $linesRemoved = $originalLines - $cleanedLines;
        
        if ($originalContent !== $cleanedContent) {
            if (!$this->dryRun) {
                file_put_contents($filePath, $cleanedContent);
            }
            
            $charactersRemoved = strlen($originalContent) - strlen($cleanedContent);
            
            echo "   " . ($this->dryRun ? "[TEST]" : "[CLEAN]") . " " . 
                 $this->getRelativePath($filePath);
            
            if ($charactersRemoved > 0) {
                echo " (-$charactersRemoved caractères";
                if ($linesRemoved > 0) {
                    echo ", -$linesRemoved lignes";
                }
                echo ")";
            }
            echo "\n";
            
            $this->stats['cleaned']++;
            $this->stats['lines_removed'] += $linesRemoved;
        }
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
        echo "\nRÉSUMÉ DU NETTOYAGE v3.0\n";
        echo "========================\n";
        echo "   Fichiers analysés : {$this->stats['scanned']}\n";
        echo "   Fichiers nettoyés : {$this->stats['cleaned']}\n";
        echo "   Lignes supprimées : {$this->stats['lines_removed']}\n";
        echo "\n";
        echo "   ℹ️  Le formatage sera finalisé par Prettier\n";
        echo "   ℹ️  La syntaxe sera validée par ESLint\n";
        
        if ($this->dryRun) {
            echo "\nC'était un DRY-RUN ! Aucun fichier n'a été modifié.\n";
            echo "   Pour appliquer : php scripts/clean-code.php --apply\n";
        } else {
            echo "\nNettoyage terminé avec succès !\n";
            echo "   -> Appliquez Prettier pour finaliser le formatage\n";
            echo "   -> Lancez JSHint pour valider la syntaxe\n";
        }
    }
}

// Gestion des arguments
$dryRun = true;

if (isset($argv[1])) {
    if ($argv[1] === '--apply') {
        $dryRun = false;
    } elseif ($argv[1] === '--dry-run' || $argv[1] === '--test') {
        $dryRun = true;
    } elseif ($argv[1] === '--help') {
        echo "Smart Code Cleaner v3.0\n\n";
        echo "WORKFLOW INTÉGRÉ avec Prettier + ESLint\n\n";
        echo "Usage:\n";
        echo "  php scripts/clean-code.php           # Mode dry-run (test)\n";
        echo "  php scripts/clean-code.php --apply   # Nettoyage réel\n";
        echo "  php scripts/clean-code.php --test    # Mode dry-run explicite\n";
        echo "  php scripts/clean-code.php --help    # Cette aide\n\n";
        echo "Workflow recommandé :\n";
        echo "  1. php scripts/clean-code.php --apply\n";
        echo "  2. prettier --write 'assets/js/**/*.js'\n";
        echo "  3. eslint assets/js/**/*.js\n\n";
        echo "Ou directement via le CI qui automatise tout !\n\n";
        echo "Fonctionnalités v3.0 :\n";
        echo "  ✓ Suppression propre des commentaires de debug et info\n";
        echo "  ✓ Préservation des attributs PHP 8, docblocks et code important\n";
        echo "  ✓ Patterns optimisés pour console.log debug\n";
        echo "  ✓ Nettoyage minimal - délègue le formatage à Prettier\n";
        echo "  ✓ Compatible avec la validation ESLint\n";
        echo "  ✓ Focus sur la robustesse et la simplicité\n";
        exit(0);
    }
}

$cleaner = new SmartCodeCleaner($dryRun);
$cleaner->cleanPortfolioCode();