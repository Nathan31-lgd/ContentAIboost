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
  const app = useAppBridge();
  const { setToken, setUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState(null);

  useEffect(() => {
    const initializeSession = async () => {
      try {
        // Récupérer le token de session Shopify
        const token = await getSessionToken(app);
        
        if (token) {
          // Stocker le token dans le store
          setToken(token);
          
          // Extraire les informations de la boutique depuis l'URL
          const params = new URLSearchParams(window.location.search);
          const shopDomain = params.get('shop');
          
          if (shopDomain) {
            setShop(shopDomain);
            setUser({ shop: shopDomain });
          }
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de la session:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeSession();
    
    // Rafraîchir le token toutes les 50 minutes
    const interval = setInterval(async () => {
      try {
        const token = await getSessionToken(app);
        if (token) {
          setToken(token);
        }
      } catch (error) {
        console.error('Erreur lors du rafraîchissement du token:', error);
      }
    }, 50 * 60 * 1000); // 50 minutes

    return () => clearInterval(interval);
  }, [app, setToken, setUser]);

  const value = {
    app,
    shop,
    loading,
  };

  return (
    <ShopifyContext.Provider value={value}>
      {children}
    </ShopifyContext.Provider>
  );
}; 