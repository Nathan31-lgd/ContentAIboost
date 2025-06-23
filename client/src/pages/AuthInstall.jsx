import React, { useState, useEffect } from 'react';
import {
  Page,
  Card,
  Layout,
  Button,
  Text,
  InlineStack,
  BlockStack,
  Banner,
  Spinner,
  Badge,
  Icon,
} from '@shopify/polaris';
import {
  ConnectIcon,
  CheckCircleIcon,
  AlertCircleIcon,
} from '@shopify/polaris-icons';
import { useShopify } from '../contexts/ShopifyContext';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

export default function AuthInstall() {
  const { shop } = useShopify();
  const [authStatus, setAuthStatus] = useState('checking');
  const [installing, setInstalling] = useState(false);

  // Vérifier le statut d'authentification
  const checkAuthStatus = async () => {
    if (!shop) return;
    
    try {
      const response = await fetch(`/api/auth/status?shop=${shop}`);
      const data = await response.json();
      
      setAuthStatus(data.authenticated ? 'authenticated' : 'not_authenticated');
    } catch (error) {
      console.error('Erreur lors de la vérification du statut:', error);
      setAuthStatus('error');
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, [shop]);

  // Démarrer l'installation OAuth
  const handleInstall = async () => {
    if (!shop) {
      toast.error('Nom de boutique manquant');
      return;
    }

    setInstalling(true);
    try {
      // Rediriger vers la route d'installation
      window.location.href = `/api/auth/install?shop=${shop}`;
    } catch (error) {
      console.error('Erreur lors de l\'installation:', error);
      toast.error('Erreur lors de l\'installation');
      setInstalling(false);
    }
  };

  // Tester la connexion
  const handleTestConnection = async () => {
    try {
      const response = await api.products.sync();
      if (response.success && response.source === 'shopify') {
        toast.success('Connexion réussie ! Vos produits sont maintenant synchronisés.');
        setAuthStatus('authenticated');
      } else {
        toast.error('Connexion échouée. Veuillez réessayer l\'installation.');
      }
    } catch (error) {
      console.error('Erreur lors du test:', error);
      toast.error('Erreur lors du test de connexion');
    }
  };

  const renderAuthStatus = () => {
    switch (authStatus) {
      case 'checking':
        return (
          <Card>
            <BlockStack gap="400">
              <InlineStack align="center" gap="200">
                <Spinner size="small" />
                <Text variant="bodyMd">Vérification du statut d'authentification...</Text>
              </InlineStack>
            </BlockStack>
          </Card>
        );

      case 'authenticated':
        return (
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <InlineStack gap="200">
                  <Icon source={CheckCircleIcon} tone="success" />
                  <Text variant="headingMd">Authentification réussie</Text>
                </InlineStack>
                <Badge tone="success">Connecté</Badge>
              </InlineStack>
              
              <Text variant="bodyMd">
                Votre boutique <strong>{shop}</strong> est connectée avec succès. 
                Vous pouvez maintenant synchroniser vos produits.
              </Text>
              
              <InlineStack gap="200">
                <Button 
                  primary 
                  onClick={() => window.location.href = '/products'}
                >
                  Voir mes produits
                </Button>
                <Button onClick={handleTestConnection}>
                  Tester la connexion
                </Button>
              </InlineStack>
            </BlockStack>
          </Card>
        );

      case 'not_authenticated':
        return (
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <InlineStack gap="200">
                  <Icon source={AlertCircleIcon} tone="warning" />
                  <Text variant="headingMd">Authentification requise</Text>
                </InlineStack>
                <Badge tone="attention">Non connecté</Badge>
              </InlineStack>
              
              <Text variant="bodyMd">
                Pour accéder à vos produits Shopify, vous devez d'abord authentifier votre boutique.
                Cette étape est nécessaire pour que l'application puisse lire vos produits et les optimiser.
              </Text>
              
              <Banner tone="info">
                <Text variant="bodyMd">
                  L'authentification vous redirigera vers Shopify pour autoriser l'accès à vos données.
                  Aucune information sensible n'est stockée.
                </Text>
              </Banner>
              
              <Button 
                primary 
                icon={ConnectIcon}
                loading={installing}
                onClick={handleInstall}
              >
                {installing ? 'Installation en cours...' : 'Connecter ma boutique'}
              </Button>
            </BlockStack>
          </Card>
        );

      case 'error':
        return (
          <Card>
            <BlockStack gap="400">
              <InlineStack gap="200">
                <Icon source={AlertCircleIcon} tone="critical" />
                <Text variant="headingMd">Erreur de connexion</Text>
              </InlineStack>
              
              <Text variant="bodyMd">
                Une erreur est survenue lors de la vérification de l'authentification.
                Veuillez réessayer.
              </Text>
              
              <Button onClick={checkAuthStatus}>
                Réessayer
              </Button>
            </BlockStack>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <Page 
      title="Authentification Shopify"
      subtitle={shop ? `Boutique: ${shop}` : 'Configuration de l\'accès'}
    >
      <Layout>
        <Layout.Section>
          {renderAuthStatus()}
        </Layout.Section>
        
        <Layout.Section>
          <Card title="Informations">
            <BlockStack gap="300">
              <Text variant="bodyMd">
                <strong>Pourquoi l'authentification est-elle nécessaire ?</strong>
              </Text>
              <Text variant="bodyMd">
                ContentAI Boost a besoin d'accéder à vos produits Shopify pour :
              </Text>
              <ul style={{ paddingLeft: '20px' }}>
                <li>Lire vos produits existants</li>
                <li>Analyser leur contenu SEO</li>
                <li>Générer des suggestions d'optimisation</li>
                <li>Appliquer les améliorations (si autorisé)</li>
              </ul>
              <Text variant="bodyMd">
                Toutes les données sont traitées de manière sécurisée et ne sont jamais partagées.
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
} 