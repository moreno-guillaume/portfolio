<?php
namespace App\Service;

class ViteAssetService
{
    private string $manifestPath;
    private ?array $manifest = null;

    public function __construct(string $projectDir)
    {
        $this->manifestPath = $projectDir . '/public/build/.vite/manifest.json';
    }

    private function loadManifest(): void
    {
        if ($this->manifest === null && file_exists($this->manifestPath)) {
            $this->manifest = json_decode(file_get_contents($this->manifestPath), true) ?: [];
        }
    }

    public function getJsFile(): ?string
    {
        $this->loadManifest();
        return $this->manifest['js/app.js']['file'] ?? null;
    }

    public function getCssFiles(): array
    {
        $this->loadManifest();
        return $this->manifest['js/app.js']['css'] ?? [];
    }
}