import React, { useState, useEffect } from 'react';
import {
  Page,
  Card,
  Layout,
  Button,
  Text,
  InlineStack,
  BlockStack,
  Badge,
  Divider,
} from '@shopify/polaris';
import { useShopify } from '../contexts/ShopifyContext';
import { api } from '../utils/api';
import { logger } from '../utils/logger';

export default function AuthDebug() {
  const { shop, appBridge } = useShopify();
  const [debugInfo, setDebugInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  // Diagnostiquer l'état de l'authentification
  const runDiagnostic = async () => {
    setLoading(true);
    try {
      logger.info('=== DÉBUT DIAGNOSTIC ===');
      
      // 1. Informations de base
      const basicInfo = {
        shop,
        hasAppBridge: !!appBridge,
        appBridgeType: typeof appBridge,
        currentUrl: window.location.href,
        urlParams: Object.fromEntries(new URLSearchParams(window.location.search)),
      };
      
      logger.info('Informations de base:', basicInfo);

      // 2. Analyser App Bridge
      const appBridgeInfo = {
        available: !!appBridge,
        methods: appBridge ? Object.keys(appBridge) : [],
        hasGetSessionToken: appBridge && typeof appBridge.getSessionToken === 'function',
        hasAuthenticatedFetch: appBridge && !!appBridge.authenticatedFetch,
        hasActions: appBridge && !!appBridge.actions,
        hasSession: appBridge && !!appBridge.session,
      };

      logger.info('App Bridge info:', appBridgeInfo);

      // 3. Tester les méthodes de token
      const tokenTests = {};
      if (appBridge) {
        // Test getSessionToken
        try {
          if (typeof appBridge.getSessionToken === 'function') {
            const token = await appBridge.getSessionToken();
            tokenTests.getSessionToken = { success: !!token, token: token ? 'PRÉSENT' : null };
          }
        } catch (error) {
          tokenTests.getSessionToken = { success: false, error: error.message };
        }

        // Test authenticatedFetch
        tokenTests.authenticatedFetch = { 
          available: !!appBridge.authenticatedFetch,
          type: typeof appBridge.authenticatedFetch
        };

        // Test session
        if (appBridge.session) {
          tokenTests.session = {
            available: true,
            hasToken: !!(appBridge.session.token || appBridge.session.accessToken),
            keys: Object.keys(appBridge.session)
          };
        }
      }

      logger.info('Tests de token:', tokenTests);

      // 4. Vérifier le statut côté serveur
      let serverInfo = {};
      try {
        if (shop) {
          serverInfo = await api.auth.debug(shop);
        }
      } catch (error) {
        serverInfo = { error: error.message };
      }

      logger.info('Info serveur:', serverInfo);

      // 5. Tester une requête produits
      let productTest = {};
      try {
        const response = await api.products.getAll({ limit: 1 });
        productTest = {
          success: true,
          source: response.source,
          needsAuth: response.needsAuth,
          productCount: response.products?.length || 0
        };
      } catch (error) {
        productTest = { success: false, error: error.message };
      }

      const fullDiagnostic = {
        timestamp: new Date().toISOString(),
        basicInfo,
        appBridgeInfo,
        tokenTests,
        serverInfo,
        productTest,
      };

      setDebugInfo(fullDiagnostic);
      logger.info('=== DIAGNOSTIC COMPLET ===', fullDiagnostic);
      
    } catch (error) {
      logger.error('Erreur durant le diagnostic:', error);
      setDebugInfo({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shop) {
      runDiagnostic();
    }
  }, [shop]);

  const renderValue = (value) => {
    if (typeof value === 'boolean') {
      return <Badge tone={value ? 'success' : 'critical'}>{value ? 'OUI' : 'NON'}</Badge>;
    }
    if (typeof value === 'object' && value !== null) {
      return <pre style={{ fontSize: '12px', maxWidth: '400px', overflow: 'auto' }}>
        {JSON.stringify(value, null, 2)}
      </pre>;
    }
    return <Text variant="bodyMd">{String(value)}</Text>;
  };

  const renderSection = (title, data) => (
    <Card title={title}>
      <BlockStack gap="200">
        {Object.entries(data || {}).map(([key, value]) => (
          <InlineStack key={key} align="space-between" gap="400">
            <Text variant="bodyMd" fontWeight="medium">{key}:</Text>
            {renderValue(value)}
          </InlineStack>
        ))}
      </BlockStack>
    </Card>
  );

  return (
    <Page 
      title="Debug Authentification"
      subtitle="Diagnostic des problèmes d'authentification"
      primaryAction={{
        content: 'Relancer le diagnostic',
        onAction: runDiagnostic,
        loading,
      }}
    >
      <Layout>
        {debugInfo?.error && (
          <Layout.Section>
            <Card>
              <Text variant="bodyMd" tone="critical">
                Erreur: {debugInfo.error}
              </Text>
            </Card>
          </Layout.Section>
        )}

        {debugInfo && !debugInfo.error && (
          <>
            <Layout.Section>
              {renderSection('Informations de base', debugInfo.basicInfo)}
            </Layout.Section>

            <Layout.Section>
              {renderSection('App Bridge', debugInfo.appBridgeInfo)}
            </Layout.Section>

            <Layout.Section>
              {renderSection('Tests de token', debugInfo.tokenTests)}
            </Layout.Section>

            <Layout.Section>
              {renderSection('Serveur', debugInfo.serverInfo)}
            </Layout.Section>

            <Layout.Section>
              {renderSection('Test produits', debugInfo.productTest)}
            </Layout.Section>
          </>
        )}

        <Layout.Section>
          <Card title="Actions">
            <BlockStack gap="200">
              <Button onClick={() => window.location.href = '/auth'}>
                Aller à l'authentification
              </Button>
              <Button onClick={() => window.location.href = '/products'}>
                Aller aux produits
              </Button>
              <Button onClick={() => console.log('Debug info:', debugInfo)}>
                Afficher dans la console
              </Button>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
} 