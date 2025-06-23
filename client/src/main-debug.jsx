console.log('=== main-debug.jsx loaded ===');

// Test basique sans React
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded');
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = '<h1>ContentAIBoost - Mode Debug</h1><p>Si vous voyez ce message, le JavaScript fonctionne.</p>';
  } else {
    console.error('Root element not found!');
  }
});

// Afficher les paramètres Shopify
const params = new URLSearchParams(window.location.search);
console.log('Shopify params:', {
  shop: params.get('shop'),
  host: params.get('host'),
  hmac: params.get('hmac'),
  timestamp: params.get('timestamp'),
  session: params.get('session')
}); 