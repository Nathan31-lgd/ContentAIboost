import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAppBridge } from '@shopify/app-bridge-react';
import { getSessionToken } from '@shopify/app-bridge-utils';
import { useAuthStore } from '../store/authStore';
import { logger } from '../utils/logger';

const ShopifyContext = createContext({});

export const useShopify = () => {
  const context = useContext(ShopifyContext);
  if (!context) {
    throw new Error('useShopify doit être utilisé dans un ShopifyProvider');
  }
  return context;
};

export const ShopifyProvider = ({ children }) => {
  let app = null;
  
  // Essayer d'obtenir l'app bridge, mais ne pas échouer si ce n'est pas disponible
  try {
    app = useAppBridge();
  } catch (error) {
    console.warn('App Bridge non disponible:', error.message);
  }

  const { setToken, setUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState(null);

  useEffect(() => {
    const initializeSession = async () => {
      try {
        // Extraire les informations depuis l'URL
        const params = new URLSearchParams(window.location.search);
        const shopDomain = params.get('shop');
        const embedded = params.get('embedded');
        const hmac = params.get('hmac');
        
        console.log('=== ShopifyContext Debug ===');
        console.log('Shop from URL:', shopDomain);
        console.log('Embedded:', embedded);
        console.log('HMAC:', hmac);
        console.log('App Bridge available:', !!app);
        
        if (shopDomain) {
          setShop(shopDomain);
          setUser({ shop: shopDomain });
          console.log('Shop set to:', shopDomain);
        }

        // Seulement essayer d'obtenir le token si App Bridge est disponible
        if (app) {
          try {
            const token = await getSessionToken(app);
            if (token) {
              setToken(token);
              console.log('Session token obtained');
            }
          } catch (tokenError) {
            console.warn('Impossible d\'obtenir le token de session:', tokenError.message);
          }
        } else {
          // Si pas d'App Bridge, créer un token fictif pour les tests
          if (shopDomain) {
            setToken('mock-token-for-development');
            console.log('Using mock token for development');
          }
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de la session:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeSession();
    
    // Seulement configurer le rafraîchissement du token si App Bridge est disponible
    if (app) {
      const interval = setInterval(async () => {
        try {
          const token = await getSessionToken(app);
          if (token) {
            setToken(token);
          }
        } catch (error) {
          console.warn('Erreur lors du rafraîchissement du token:', error.message);
        }
      }, 50 * 60 * 1000); // 50 minutes

      return () => clearInterval(interval);
    }
  }, [app, setToken, setUser]);

  const value = {
    app,
    shop,
    loading,
    isAppBridgeAvailable: !!app,
  };

  return (
    <ShopifyContext.Provider value={value}>
      {children}
    </ShopifyContext.Provider>
  );
}; 