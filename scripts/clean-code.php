<?php
/**

 * Script de nettoyage intelligent et sécurisé
 * Version 2.0 - Ne supprime QUE les vrais commentaires de debug
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
        'public/css',               
        'public/js',                
    ];

    // Patterns TRÈS spécifiques pour les vrais commentaires de debug
    private array $safeCleaningPatterns = [
        'js' => [
            // Console logs avec contenu explicitement de debug
            '/console\.log\s*\(\s*[\'"].*?(debug|test|temp|todo|fixme).*?[\'"].*?\)\s*;?\s*\n?/im',
            '/console\.(warn|error|info)\s*\(\s*[\'"].*?(debug|test|temp).*?[\'"].*?\)\s*;?\s*\n?/im',
            
            // Commentaires avec mots-clés de debug
            '/\/\/\s*(TODO|FIXME|DEBUG|TEST|TEMP|XXX|HACK).*$/m',
            '/\/\/\s*(todo|fixme|debug|test|temp).*$/m',
            
            // Commentaires vides ou très courts
            '/\/\/\s*$/m',
            '/\/\/\s{1,3}$/m',
        ],
        
        'php' => [
            // Commentaires avec mots-clés de debug (PAS les attributs #[...])
            '/(?<!#\[)\/\/\s*(TODO|FIXME|DEBUG|TEST|TEMP|XXX|HACK).*$/m',
            '/(?<!#\[)\/\/\s*(todo|fixme|debug|test|temp).*$/m',
            
            // Commentaires # avec mots-clés de debug (PAS les attributs)
            '/(?<!#\[)#\s*(TODO|FIXME|DEBUG|TEST|TEMP|XXX|HACK).*$/m',
            '/(?<!#\[)#\s*(todo|fixme|debug|test|temp).*$/m',
            
            // Commentaires vides
            '/\/\/\s*$/m',
            '/#\s*$/m',
            
            // Commentaires multilignes avec mots-clés debug (PRÉSERVE docblocks /**)
            '/\/\*(?!\*)\s*(TODO|FIXME|DEBUG|TEST|TEMP)[\s\S]*?\*\//m',
        ],
        
        'css' => [
            // Commentaires CSS avec mots-clés de debug
            '/\/\*\s*(TODO|FIXME|DEBUG|TEST|TEMP)[\s\S]*?\*\//m',
            '/\/\*\s*(todo|fixme|debug|test|temp)[\s\S]*?\*\//m',
        ],
        
        'twig' => [
            // Commentaires Twig avec mots-clés de debug
            '/\{\#\s*(TODO|FIXME|DEBUG|TEST|TEMP)[\s\S]*?\#\}/m',
            '/\{\#\s*(todo|fixme|debug|test|temp)[\s\S]*?\#\}/m',
        ],
    ];

    // Patterns absolument interdits (ne jamais toucher)
    private array $forbiddenPatterns = [
        '/\#\[Route\(/',           // Attributs Route
        '/\#\[.*?\]/',             // Tous attributs PHP 8
        '/\/\*\*[\s\S]*?\*\//',    // Docblocks
        '/\@[A-Za-z]+/',           // Annotations
        '/namespace\s/',           // Déclarations namespace
        '/use\s/',                 // Imports
        '/class\s/',               // Déclarations class
        '/function\s/',            // Déclarations function
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
        echo "🧹 Smart Code Cleaner v2.0\n";
        echo "🛡️  Mode sécurisé : Supprime UNIQUEMENT les commentaires de debug\n";
        echo "⚡ Mode : " . ($this->dryRun ? "DRY-RUN (simulation)" : "NETTOYAGE RÉEL") . "\n\n";
        
        foreach ($this->targetDirectories as $directory) {
            if (!is_dir($directory)) {
                echo "⚠️  Dossier ignoré (inexistant) : $directory\n";
                continue;
            }

            echo "🔍 Analyse de : $directory\n";
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
            if ($file->isFile()) {
                $this->cleanFile($file->getPathname());
            }
        }
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
        $originalContent = file_get_contents($filePath);
        
        // SÉCURITÉ ABSOLUE : Vérifier qu'on ne touche pas à du code critique
        if ($this->containsForbiddenPatterns($originalContent)) {
            echo "   🛡️  PROTÉGÉ : " . $this->getRelativePath($filePath) . " (contient du code critique)\n";
            return;
        }

        $cleanedContent = $this->applySmartCleaning($originalContent, $extension);
        
        $originalLines = substr_count($originalContent, "\n");
        $cleanedLines = substr_count($cleanedContent, "\n");
        $linesRemoved = $originalLines - $cleanedLines;

        if ($originalContent !== $cleanedContent && $linesRemoved > 0) {
            if (!$this->dryRun) {
                file_put_contents($filePath, $cleanedContent);
            }
            
            echo "   " . ($this->dryRun ? "🔍" : "🧹") . " " . 
                 $this->getRelativePath($filePath) . " (-$linesRemoved lignes)\n";
            
            $this->stats['cleaned']++;
            $this->stats['lines_removed'] += $linesRemoved;
        }
    }

    private function containsForbiddenPatterns(string $content): bool
    {
        foreach ($this->forbiddenPatterns as $pattern) {
            if (preg_match($pattern, $content)) {
                return true;
            }
        }
        return false;
    }

    private function applySmartCleaning(string $content, string $fileType): string
    {
        $cleaned = $content;
        
        if (!isset($this->safeCleaningPatterns[$fileType])) {
            return $cleaned;
        }

        foreach ($this->safeCleaningPatterns[$fileType] as $pattern) {
            $cleaned = preg_replace($pattern, '', $cleaned);
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
        echo "\n📊 RÉSUMÉ DU NETTOYAGE\n";
        echo "   Fichiers analysés : {$this->stats['scanned']}\n";
        echo "   Fichiers nettoyés : {$this->stats['cleaned']}\n";
        echo "   Lignes supprimées : {$this->stats['lines_removed']}\n";
        
        if ($this->dryRun) {
            echo "\n💡 C'était un DRY-RUN ! Aucun fichier n'a été modifié.\n";
            echo "   Pour appliquer les changements : php scripts/clean-code.php --apply\n";
        } else {
            echo "\n✅ Nettoyage terminé avec succès !\n";
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
        echo "🧹 Smart Code Cleaner v2.0\n\n";
        echo "Usage:\n";
        echo "  php scripts/clean-code.php           # Mode dry-run (test)\n";
        echo "  php scripts/clean-code.php --apply   # Nettoyage réel\n";
        echo "  php scripts/clean-code.php --test    # Mode dry-run explicite\n";
        echo "  php scripts/clean-code.php --help    # Cette aide\n\n";
        echo "Supprime UNIQUEMENT les commentaires de debug (TODO, FIXME, etc.)\n";
        echo "Préserve les attributs PHP 8, docblocks et code important.\n";
        exit(0);
    }
}

$cleaner = new SmartCodeCleaner($dryRun);

$cleaner->cleanPortfolioCode();