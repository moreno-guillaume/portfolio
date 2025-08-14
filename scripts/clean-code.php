<?php
/**
 * Script de nettoyage automatique du code
 * Supprime les commentaires et console.log lors des PR dev -> main
 * 
 * Usage: php scripts/clean-code.php <directory>
 * Exemple: php scripts/clean-code.php src/
 */

class CodeCleaner
{
    private array $patterns = [
        // JavaScript - console logs
        'js_console' => [
            '/console\.(log|warn|error|info|debug|trace|table|group|groupEnd|count|time|timeEnd)\s*\([^)]*\)\s*;?\s*\n?/m',
            '/console\.(log|warn|error|info|debug|trace|table|group|groupEnd|count|time|timeEnd)\s*\(`[^`]*`\)\s*;?\s*\n?/m',
        ],
        
        // JavaScript - commentaires
        'js_comments' => [
            '/\/\/.*$/m',                    // Commentaires //
            '/\/\*[\s\S]*?\*\//m',          // Commentaires /* */
        ],
        
        // PHP - commentaires (en gardant les docblocks importants)
        'php_comments' => [
            '/(?<!\/\*\*)\s*\/\/.*$/m',      // Commentaires // (sauf docblocks)
            '/(?<!\/\*\*)\s*#.*$/m',         // Commentaires #
            '/\/\*(?!\*)[\s\S]*?\*\//m',    // Commentaires /* */ (sauf docblocks)
        ],
        
        // CSS - commentaires
        'css_comments' => [
            '/\/\*[\s\S]*?\*\//m',          // Commentaires /* */
        ],
        
        // Twig - commentaires
        'twig_comments' => [
            '/\{\#[\s\S]*?\#\}/m',          // Commentaires {# #}
        ],
    ];

    private array $fileExtensions = [
        'js' => ['js'],
        'php' => ['php'],
        'css' => ['css'],
        'twig' => ['twig', 'html.twig'],
    ];

    public function cleanDirectory(string $directory): void
    {
        echo "Nettoyage du code dans : $directory\n";
        
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($directory, RecursiveDirectoryIterator::SKIP_DOTS)
        );

        $cleanedFiles = 0;
        
        foreach ($iterator as $file) {
            if ($file->isFile()) {
                $cleaned = $this->cleanFile($file->getPathname());
                if ($cleaned) {
                    $cleanedFiles++;
                }
            }
        }
        
        echo "Nettoyage terminé : $cleanedFiles fichiers traités\n";
    }

    private function cleanFile(string $filePath): bool
    {
        $extension = pathinfo($filePath, PATHINFO_EXTENSION);
        $type = $this->getFileType($extension, $filePath);
        
        if (!$type) {
            return false; // Type de fichier non géré
        }

        $originalContent = file_get_contents($filePath);
        $cleanedContent = $this->applyCleaningRules($originalContent, $type);
        
        if ($originalContent !== $cleanedContent) {
            file_put_contents($filePath, $cleanedContent);
            echo "🔧 Nettoyé : " . basename($filePath) . "\n";
            return true;
        }
        
        return false;
    }

    private function getFileType(string $extension, string $filePath): ?string
    {
        foreach ($this->fileExtensions as $type => $extensions) {
            if (in_array($extension, $extensions)) {
                return $type;
            }
        }
        
        // Cas spécial pour les fichiers .twig
        if (str_ends_with($filePath, '.html.twig')) {
            return 'twig';
        }
        
        return null;
    }

    private function applyCleaningRules(string $content, string $type): string
    {
        $cleaned = $content;
        
        // Appliquer les règles spécifiques au type de fichier
        switch ($type) {
            case 'js':
                $cleaned = $this->applyPatterns($cleaned, 'js_console');
                $cleaned = $this->applyPatterns($cleaned, 'js_comments');
                break;
                
            case 'php':
                $cleaned = $this->applyPatterns($cleaned, 'php_comments');
                break;
                
            case 'css':
                $cleaned = $this->applyPatterns($cleaned, 'css_comments');
                break;
                
            case 'twig':
                $cleaned = $this->applyPatterns($cleaned, 'twig_comments');
                break;
        }
        
        // Nettoyer les lignes vides multiples
        $cleaned = preg_replace('/\n\s*\n\s*\n/', "\n\n", $cleaned);
        
        return $cleaned;
    }

    private function applyPatterns(string $content, string $patternGroup): string
    {
        $cleaned = $content;
        
        foreach ($this->patterns[$patternGroup] as $pattern) {
            $cleaned = preg_replace($pattern, '', $cleaned);
        }
        
        return $cleaned;
    }

    public function preserveImportantComments(string $content): string
    {
        // Préserver les commentaires importants (licences, docblocks, etc.)
        $importantPatterns = [
            '/\/\*\*[\s\S]*?\*\//',         // Docblocks PHP
            '/\/\*\s*@[\s\S]*?\*\//',       // Annotations
            '/\/\*\s*(TODO|FIXME|NOTE)[\s\S]*?\*\//', // Commentaires de développement importants
        ];
        
        // Cette méthode peut être étendue pour préserver certains commentaires
        return $content;
    }
}

// Utilisation du script
if ($argc < 2) {
    echo "Usage: php clean-code.php <directory>\n";
    echo "Exemple: php clean-code.php src/\n";
    exit(1);
}

$directory = $argv[1];

if (!is_dir($directory)) {
    echo "❌ Erreur: Le répertoire '$directory' n'existe pas.\n";
    exit(1);
}

$cleaner = new CodeCleaner();
$cleaner->cleanDirectory($directory);

echo "🎉 Nettoyage automatique terminé !\n";