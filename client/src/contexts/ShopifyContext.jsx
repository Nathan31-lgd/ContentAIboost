import React, { createContext, useContext, useEffect, useState } from 'react';
import { logger } from '../utils/logger';
import { setAppBridge } from '../utils/api';

const ShopifyContext = createContext();

export const useShopify = () => {
  const context = useContext(ShopifyContext);
  if (!context) {
    throw new Error('useShopify must be used within a ShopifyProvider');
  }
  return context;
};

export const ShopifyProvider = ({ children, appBridge }) => {
  const [shop, setShop] = useState(null);
  const [isEmbedded, setIsEmbedded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Extraire les paramètres de l'URL
    const searchParams = new URLSearchParams(window.location.search);
    const shopParam = searchParams.get('shop');
    const embeddedParam = searchParams.get('embedded');
    
    if (shopParam) {
      setShop(shopParam);
      logger.info('Shop détecté:', shopParam);
    }
    
    setIsEmbedded(embeddedParam === '1' || embeddedParam === 'true');
    
    // Passer App Bridge à l'API si disponible
    if (appBridge) {
      logger.info('Configuration de App Bridge dans l\'API');
      setAppBridge(appBridge);
    }
    
    setIsLoading(false);
  }, [appBridge]);

  // Fonction pour naviguer (utilise App Bridge si disponible)
  const navigate = (path) => {
    if (appBridge?.dispatch) {
      try {
        // Utiliser App Bridge pour la navigation
        appBridge.dispatch({
          type: 'APP::NAVIGATION::REDIRECT',
          payload: {
            path,
          },
        });
      } catch (error) {
        logger.error('Erreur de navigation App Bridge:', error);
        // Fallback : navigation standard
        window.location.href = path;
      }
    } else {
      // Navigation standard si App Bridge n'est pas disponible
      window.location.href = path;
    }
  };

  // Fonction pour afficher un toast (utilise App Bridge si disponible)
  const showToast = (message, isError = false) => {
    if (appBridge?.toast) {
      try {
        appBridge.toast.show(message, {
          duration: 3000,
          isError,
        });
      } catch (error) {
        logger.error('Erreur toast App Bridge:', error);
        // Fallback : utiliser alert
        alert(message);
      }
    } else {
      // Fallback : utiliser alert
      alert(message);
    }
  };

  const value = {
    shop,
    isEmbedded,
    isLoading,
    appBridge,
    navigate,
    showToast,
  };

  return (
    <ShopifyContext.Provider value={value}>
      {children}
    </ShopifyContext.Provider>
  );
}; 