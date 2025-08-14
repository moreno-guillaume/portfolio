<?php
/**
 * Script de nettoyage automatique du code
 * Supprime les commentaires et console.log lors des PR dev -> main
 * 
 * Usage: php scripts/clean-code.php <directory>
 * Exemple: php scripts/clean-code.php .
 */

class CodeCleaner
{
    private array $patterns = [
        'js_console' => [
            '/console\.(log|warn|error|info|debug|trace|table|group|groupEnd|count|time|timeEnd)\s*\([^)]*\)\s*;?\s*\n?/m',
            '/console\.(log|warn|error|info|debug|trace|table|group|groupEnd|count|time|timeEnd)\s*\(`[^`]*`\)\s*;?\s*\n?/m',
        ],
        'js_comments' => [
            '/\/\/.*$/m',
            '/\/\*[\s\S]*?\*\
        ],
        'php_comments' => [
            '/(?<!\/\*\*)\s*\/\/.*$/m',
            '/(?<!\/\*\*)\s*
            '/\/\*(?!\*)[\s\S]*?\*\
        ],
        'css_comments' => [
            '/\/\*[\s\S]*?\*\
        ],
        'twig_comments' => [
            '/\{\
        ],
        'yaml_comments' => [
            '/^\s*
            '/\s+
        ],
    ];

    private array $fileExtensions = [
        'js' => ['js'],
        'php' => ['php'],
        'css' => ['css'],
        'twig' => ['twig', 'html.twig'],
        'yaml' => ['yml', 'yaml'],
    ];

    private array $excludedDirs = [
        '.git',
        'node_modules',
        'vendor',
        '.phpunit.cache',
        'var/cache',
        'var/log',
    ];

    public function cleanDirectory(string $directory): void
    {
        echo "Nettoyage du code dans : $directory\n";
        
        if (!is_dir($directory)) {
            echo "Erreur : Le répertoire '$directory' n'existe pas.\n";
            return;
        }

        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($directory, RecursiveDirectoryIterator::SKIP_DOTS)
        );

        $cleanedFiles = 0;
        $totalModifications = 0;
        
        foreach ($iterator as $file) {
            if ($file->isFile() && !$this->isExcluded($file->getPathname())) {
                $result = $this->cleanFile($file->getPathname());
                if ($result['cleaned']) {
                    $cleanedFiles++;
                    $totalModifications += $result['modifications'];
                }
            }
        }
        
        echo "Nettoyage terminé : $cleanedFiles fichiers traités\n";
        if ($totalModifications > 0) {
            echo "Total des modifications : $totalModifications suppressions\n";
        }
    }

    private function isExcluded(string $filePath): bool
    {
        foreach ($this->excludedDirs as $excludedDir) {
            if (strpos($filePath, $excludedDir) !== false) {
                return true;
            }
        }
        return false;
    }

    private function cleanFile(string $filePath): array
    {
        $extension = pathinfo($filePath, PATHINFO_EXTENSION);
        $type = $this->getFileType($extension, $filePath);
        
        if (!$type) {
            return ['cleaned' => false, 'modifications' => 0];
        }

        $originalContent = file_get_contents($filePath);
        $originalLines = substr_count($originalContent, "\n") + 1;
        
        $cleanedContent = $this->applyCleaningRules($originalContent, $type);
        $cleanedLines = substr_count($cleanedContent, "\n") + 1;
        
        $modifications = $originalLines - $cleanedLines;
        
        if ($originalContent !== $cleanedContent) {
            file_put_contents($filePath, $cleanedContent);
            echo "Nettoyé : " . $this->getRelativePath($filePath) . " (-$modifications lignes)\n";
            return ['cleaned' => true, 'modifications' => $modifications];
        }
        
        return ['cleaned' => false, 'modifications' => 0];
    }

    private function getRelativePath(string $filePath): string
    {
        $cwd = getcwd();
        if (strpos($filePath, $cwd) === 0) {
            return substr($filePath, strlen($cwd) + 1);
        }
        return $filePath;
    }

    private function getFileType(string $extension, string $filePath): ?string
    {
        foreach ($this->fileExtensions as $type => $extensions) {
            if (in_array($extension, $extensions)) {
                return $type;
            }
        }
        if (str_ends_with($filePath, '.html.twig')) {
            return 'twig';
        }
        
        return null;
    }

    private function applyCleaningRules(string $content, string $type): string
    {
        $cleaned = $content;
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
                
            case 'yaml':
                $cleaned = $this->applyPatterns($cleaned, 'yaml_comments');
                break;
        }
        $cleaned = preg_replace('/\n\s*\n\s*\n\s*\n/', "\n\n\n", $cleaned);
        
        return $cleaned;
    }

    private function applyPatterns(string $content, string $patternGroup): string
    {
        $cleaned = $content;
        
        if (!isset($this->patterns[$patternGroup])) {
            return $cleaned;
        }
        
        foreach ($this->patterns[$patternGroup] as $pattern) {
            $cleaned = preg_replace($pattern, '', $cleaned);
        }
        
        return $cleaned;
    }
}
if ($argc < 2) {
    echo "Usage: php clean-code.php <directory>\n";
    echo "Exemple: php clean-code.php .\n";
    echo "Exemple: php clean-code.php src/\n";
    exit(1);
}

$directory = $argv[1];

$cleaner = new CodeCleaner();
$cleaner->cleanDirectory($directory);

echo "Nettoyage automatique terminé !\n";