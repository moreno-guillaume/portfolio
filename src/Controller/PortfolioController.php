<?php
namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class PortfolioController extends AbstractController
{
    #[Route('/', name: 'portfolio_index')]
    public function index(): Response
    {
        $viteJs = null;
        $viteCss = [];
        
        if ($this->getParameter('kernel.environment') === 'prod') {
            $manifestPath = $this->getParameter('kernel.project_dir') . '/public/build/.vite/manifest.json';
            if (file_exists($manifestPath)) {
                $manifest = json_decode(file_get_contents($manifestPath), true);
                $viteJs = $manifest['js/app.js']['file'] ?? null;
                $viteCss = $manifest['js/app.js']['css'] ?? [];
            }
        }

        return $this->render('portfolio/index.html.twig', [
            'vite_js' => $viteJs,
            'vite_css' => $viteCss,
        ]);
    }
}