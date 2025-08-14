<?php
/**
 * Script de nettoyage automatique CIBLÉ
 * Nettoie UNIQUEMENT les fichiers de développement du portfolio
 * Évite vendor/, config/, bin/, var/ et autres fichiers Symfony
 */

class PortfolioCodeCleaner
{
    // Dossiers SPÉCIFIQUES à nettoyer (votre code uniquement)
    private array $targetDirectories = [
        'src/Controller',           // Vos contrôleurs PHP
        'templates',                // Vos templates Twig
        'public/css',               // Vos fichiers CSS
        'public/js',                // Vos fichiers JavaScript
    ];

    // Patterns de nettoyage par type de fichier
    private array $cleaningPatterns = [
        'php' => [
            '/\/\/.*$/m',                    // Commentaires //
            '/(?<!\/\*\*)\s*#.*$/m',         // Commentaires # (sauf docblocks)
            '/\/\*(?!\*)[\s\S]*?\*\//m',    // Commentaires /* */ (sauf docblocks)
        ],
        'js' => [
            '/console\.(log|warn|error|info|debug|trace)\s*\([^)]*\)\s*;?\s*\n?/m',
            '/\/\/.*$/m',                    // Commentaires //
            '/\/\*[\s\S]*?\*\//m',          // Commentaires /* */
        ],
        'css' => [
            '/\/\*[\s\S]*?\*\//m',          // Commentaires /* */
        ],
        'twig' => [
            '/\{\#[\s\S]*?\#\}/m',          // Commentaires {# #}
        ],
    ];

    public function cleanPortfolioCode(): void
    {
        echo "🎯 Nettoyage ciblé du portfolio étudiant\n";
        echo "📂 Dossiers concernés : " . implode(', ', $this->targetDirectories) . "\n\n";
        
        $totalCleaned = 0;
        $totalModifications = 0;

        foreach ($this->targetDirectories as $directory) {
            if (!is_dir($directory)) {
                echo "⚠️  Dossier ignoré (inexistant) : $directory\n";
                continue;
            }

            echo "🔍 Analyse de : $directory\n";
            $result = $this->cleanDirectory($directory);
            $totalCleaned += $result['files'];
            $totalModifications += $result['modifications'];
        }

        echo "\n✅ Nettoyage terminé !\n";
        echo "📊 Résumé : $totalCleaned fichiers traités, $totalModifications lignes supprimées\n";
    }

    private function cleanDirectory(string $directory): array
    {
        $cleanedFiles = 0;
        $totalModifications = 0;

        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($directory, RecursiveDirectoryIterator::SKIP_DOTS)
        );

        foreach ($iterator as $file) {
            if ($file->isFile()) {
                $result = $this->cleanFile($file->getPathname());
                if ($result['cleaned']) {
                    $cleanedFiles++;
                    $totalModifications += $result['modifications'];
                }
            }
        }

        echo "   → $cleanedFiles fichiers nettoyés\n";
        return ['files' => $cleanedFiles, 'modifications' => $totalModifications];
    }

    private function cleanFile(string $filePath): array
    {
        $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
        
        // Gestion spéciale pour les fichiers Twig
        if (str_ends_with($filePath, '.html.twig')) {
            $extension = 'twig';
        }

        // Vérifier si on doit nettoyer ce type de fichier
        if (!isset($this->cleaningPatterns[$extension])) {
            return ['cleaned' => false, 'modifications' => 0];
        }

        $originalContent = file_get_contents($filePath);
        $cleanedContent = $this->applyCleaningPatterns($originalContent, $extension);
        
        // Compter les lignes supprimées
        $originalLines = substr_count($originalContent, "\n");
        $cleanedLines = substr_count($cleanedContent, "\n");
        $modifications = $originalLines - $cleanedLines;

        if ($originalContent !== $cleanedContent) {
            file_put_contents($filePath, $cleanedContent);
            $relativePath = $this->getRelativePath($filePath);
            echo "   🧹 $relativePath (-$modifications lignes)\n";
            return ['cleaned' => true, 'modifications' => $modifications];
        }

        return ['cleaned' => false, 'modifications' => 0];
    }

    private function applyCleaningPatterns(string $content, string $fileType): string
    {
        $cleaned = $content;
        
        foreach ($this->cleaningPatterns[$fileType] as $pattern) {
            $cleaned = preg_replace($pattern, '', $cleaned);
        }

        // Nettoyer les lignes vides excessives (plus de 2 lignes vides)
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
}

// Exécution du script
if (php_sapi_name() !== 'cli') {
    echo "❌ Ce script doit être exécuté en ligne de commande\n";
    exit(1);
}

echo "🚀 Script de nettoyage Portfolio - Version ciblée\n";
echo "📌 Nettoie UNIQUEMENT vos fichiers de développement\n";
echo "🛡️  Évite vendor/, config/, bin/, var/\n\n";

$cleaner = new PortfolioCodeCleaner();
$cleaner->cleanPortfolioCode();