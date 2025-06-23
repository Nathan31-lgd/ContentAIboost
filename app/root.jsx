/**
 * Route racine pour Shopify/Remix
 * Point d'entrée pour l'interface utilisateur
 */

export default function App() {
  // Cette route sert de point d'entrée
  // L'interface utilisateur réelle est servie par notre client React existant
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>ContentAIboost</title>
      </head>
      <body>
        <div id="app">
          <h1>ContentAIboost</h1>
          <p>App d'optimisation SEO pour Shopify</p>
        </div>
      </body>
    </html>
  );
} 