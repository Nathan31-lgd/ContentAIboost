/**
 * Route racine pour Shopify
 * Sert l'interface principale React
 */

export default function App() {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="description" content="ContentAIBoost - Optimisez le SEO de vos produits et collections Shopify avec l'intelligence artificielle" />
        <meta name="keywords" content="Shopify, SEO, IA, optimisation, produits, collections, mots-clés" />
        <meta name="author" content="ContentAIBoost" />
        
        {/* Shopify App Bridge */}
        <script src="https://cdn.shopify.com/shopifycloud/shopify/assets/shopify/app-bridge.js"></script>
        
        {/* Polaris CSS */}
        <link rel="stylesheet" href="https://cdn.shopify.com/shopifycloud/polaris/build/esm/styles.css" />
        
        <title>ContentAIBoost - Optimisation SEO IA</title>
      </head>
      <body>
        <div id="root">
          {/* L'application React se chargera ici */}
        </div>
        <script type="module" src="/src/main.jsx"></script>
      </body>
    </html>
  );
} 