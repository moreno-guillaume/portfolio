<?php
$manifestPath = __DIR__ . '/../public/build/.vite/manifest.json';

if (!file_exists($manifestPath)) {
    echo "Manifest non trouvé\n";
    exit(1);
}

$manifest = json_decode(file_get_contents($manifestPath), true);
$jsFile = $manifest['js/app.js']['file'];
$cssFiles = $manifest['js/app.js']['css'] ?? [];

echo "Nouveaux assets:\n";
echo "JS: $jsFile\n";
echo "CSS: " . implode(', ', $cssFiles) . "\n";
?>