import React, { useState, useEffect, useCallback } from 'react';
import {
  Page,
  Card,
  Layout,
  Button,
  Badge,
  Tabs,
  Banner,
  ProgressBar,
  Text,
  Thumbnail,
  EmptyState,
  Spinner,
  Icon,
  Box,
} from '@shopify/polaris';
import {
  ProductIcon,
  CollectionIcon,
  StarFilledIcon,
  ArrowRightIcon,
  SettingsIcon,
} from '@shopify/polaris-icons';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasApiKey, setHasApiKey] = useState(true);
  
  // Données produits
  const [productsStats, setProductsStats] = useState({
    total: 0,
    optimized: 0,
    partial: 0,
    notOptimized: 0,
    score: 0,
  });
  const [recentProducts, setRecentProducts] = useState([]);
  
  // Données collections
  const [collectionsStats, setCollectionsStats] = useState({
    total: 0,
    optimized: 0,
    partial: 0,
    notOptimized: 0,
    score: 0,
  });
  const [recentCollections, setRecentCollections] = useState([]);

  // Charger les données du dashboard
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // Vérifier d'abord si l'utilisateur a une clé API
      const userResponse = await api.users.getProfile();
      const hasKey = userResponse.user?.api_keys?.length > 0;
      setHasApiKey(hasKey);

      // Charger les produits
      const productsResponse = await api.products.getAll({ limit: 1000 });
      const products = productsResponse.products || [];
      
      // Calculer les statistiques des produits
      const optimizedProducts = products.filter(p => p.seo_score >= 80);
      const partialProducts = products.filter(p => p.seo_score >= 50 && p.seo_score < 80);
      const notOptimizedProducts = products.filter(p => p.seo_score < 50);
      
      const avgScore = products.length > 0 
        ? Math.round(products.reduce((sum, p) => sum + (p.seo_score || 0), 0) / products.length)
        : 0;
      
      setProductsStats({
        total: products.length,
        optimized: optimizedProducts.length,
        partial: partialProducts.length,
        notOptimized: notOptimizedProducts.length,
        score: avgScore,
      });
      
      // Récupérer les 5 derniers produits ajoutés
      const sortedProducts = [...products].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      setRecentProducts(sortedProducts.slice(0, 5));
      
      // Charger les collections
      const collectionsResponse = await api.collections.getAll({ limit: 1000 });
      const collections = collectionsResponse.collections || [];
      
      // Calculer les statistiques des collections
      const optimizedCollections = collections.filter(c => c.seo_score >= 80);
      const partialCollections = collections.filter(c => c.seo_score >= 50 && c.seo_score < 80);
      const notOptimizedCollections = collections.filter(c => c.seo_score < 50);
      
      const avgCollectionScore = collections.length > 0
        ? Math.round(collections.reduce((sum, c) => sum + (c.seo_score || 0), 0) / collections.length)
        : 0;
      
      setCollectionsStats({
        total: collections.length,
        optimized: optimizedCollections.length,
        partial: partialCollections.length,
        notOptimized: notOptimizedCollections.length,
        score: avgCollectionScore,
      });
      
      // Récupérer les 5 dernières collections ajoutées
      const sortedCollections = [...collections].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      setRecentCollections(sortedCollections.slice(0, 5));
      
    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error);
      toast.error('Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Calculer la couleur selon le score
  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'critical';
  };

  // Vérifier si un élément est nouveau (moins de 7 jours)
  const isNew = (createdAt) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  // Onglets
  const tabs = [
    {
      id: 'products',
      content: 'Produits',
      icon: ProductIcon,
      badge: productsStats.notOptimized > 0 ? `${productsStats.notOptimized} à optimiser` : null,
    },
    {
      id: 'collections',
      content: 'Collections',
      icon: CollectionIcon,
      badge: collectionsStats.notOptimized > 0 ? `${collectionsStats.notOptimized} à optimiser` : null,
    },
  ];

  if (loading) {
    return (
      <Page title="Tableau de bord">
        <Card sectioned>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <Spinner size="large" />
            <Text>Chargement des données...</Text>
          </div>
        </Card>
      </Page>
    );
  }

  return (
    <Page title="Tableau de bord">
      {!hasApiKey && (
        <Layout>
          <Layout.Section>
            <Banner
              title="Configuration requise"
              tone="info"
              action={{
                content: 'Configurer les clés API',
                icon: SettingsIcon,
                onAction: () => navigate('/settings'),
              }}
            >
              <p>
                Pour utiliser ContentAIBoost, vous devez configurer au moins une clé API (OpenAI, Anthropic ou Google).
                Cliquez sur le bouton ci-dessous pour accéder aux paramètres.
              </p>
            </Banner>
          </Layout.Section>
        </Layout>
      )}

      <Layout>
        <Layout.Section>
          <Card>
            <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab} />
            
            {/* Onglet Produits */}
            {selectedTab === 0 && (
              <Card.Section>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                  {/* Score d'optimisation global */}
                  <Card sectioned>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text variant="headingMd">Score d'optimisation global</Text>
                        <Badge tone={getScoreColor(productsStats.score)} size="large">
                          {productsStats.score}/100
                        </Badge>
                      </div>
                      <ProgressBar 
                        progress={productsStats.score} 
                        tone={getScoreColor(productsStats.score)}
                        size="medium"
                      />
                      <div style={{ display: 'flex', gap: 16 }}>
                        <Badge tone="success">
                          {productsStats.optimized} optimisés
                        </Badge>
                        <Badge tone="warning">
                          {productsStats.partial} partiellement optimisés
                        </Badge>
                        <Badge tone="critical">
                          {productsStats.notOptimized} non optimisés
                        </Badge>
                      </div>
                    </div>
                  </Card>

                  {/* Statistiques */}
                  <div style={{ display: 'flex', gap: 16 }}>
                    <Card sectioned>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <Text variant="headingLg" fontWeight="bold">
                          {productsStats.total}
                        </Text>
                        <Text tone="subdued">Produits au total</Text>
                      </div>
                    </Card>
                    <Card sectioned>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <Text variant="headingLg" fontWeight="bold" tone="critical">
                          {productsStats.notOptimized}
                        </Text>
                        <Text tone="subdued">À optimiser</Text>
                      </div>
                    </Card>
                    <Card sectioned>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <Text variant="headingLg" fontWeight="bold" tone="success">
                          {Math.round((productsStats.optimized / productsStats.total) * 100) || 0}%
                        </Text>
                        <Text tone="subdued">Taux d'optimisation</Text>
                      </div>
                    </Card>
                  </div>

                  {/* Derniers produits ajoutés */}
                  <Card title="Derniers produits ajoutés" sectioned>
                    {recentProducts.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {recentProducts.map((product) => (
                          <div key={product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                              <Thumbnail
                                source={product.image || 'https://via.placeholder.com/50'}
                                alt={product.title}
                                size="small"
                              />
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <Text variant="bodyMd" fontWeight="semibold">
                                    {product.title}
                                  </Text>
                                  {isNew(product.created_at) && (
                                    <Badge tone="success">Nouveau</Badge>
                                  )}
                                </div>
                                <Text variant="bodySm" tone="subdued">
                                  Score SEO: {product.seo_score || 0}/100
                                </Text>
                              </div>
                            </div>
                            <Button
                              plain
                              icon={ArrowRightIcon}
                              onClick={() => navigate(`/products/${product.id}`)}
                            >
                              Optimiser
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        heading="Aucun produit"
                        image=""
                      >
                        <p>Aucun produit n'a été trouvé dans votre boutique.</p>
                      </EmptyState>
                    )}
                  </Card>

                  {/* Bouton vers la page produits */}
                  <Box paddingBlock="400">
                    <Button
                      fullWidth
                      onClick={() => navigate('/products')}
                      icon={ProductIcon}
                    >
                      Voir tous les produits
                    </Button>
                  </Box>
                </div>
              </Card.Section>
            )}

            {/* Onglet Collections */}
            {selectedTab === 1 && (
              <Card.Section>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                  {/* Score d'optimisation global */}
                  <Card sectioned>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text variant="headingMd">Score d'optimisation global</Text>
                        <Badge tone={getScoreColor(collectionsStats.score)} size="large">
                          {collectionsStats.score}/100
                        </Badge>
                      </div>
                      <ProgressBar 
                        progress={collectionsStats.score} 
                        tone={getScoreColor(collectionsStats.score)}
                        size="medium"
                      />
                      <div style={{ display: 'flex', gap: 16 }}>
                        <Badge tone="success">
                          {collectionsStats.optimized} optimisées
                        </Badge>
                        <Badge tone="warning">
                          {collectionsStats.partial} partiellement optimisées
                        </Badge>
                        <Badge tone="critical">
                          {collectionsStats.notOptimized} non optimisées
                        </Badge>
                      </div>
                    </div>
                  </Card>

                  {/* Statistiques */}
                  <div style={{ display: 'flex', gap: 16 }}>
                    <Card sectioned>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <Text variant="headingLg" fontWeight="bold">
                          {collectionsStats.total}
                        </Text>
                        <Text tone="subdued">Collections au total</Text>
                      </div>
                    </Card>
                    <Card sectioned>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <Text variant="headingLg" fontWeight="bold" tone="critical">
                          {collectionsStats.notOptimized}
                        </Text>
                        <Text tone="subdued">À optimiser</Text>
                      </div>
                    </Card>
                    <Card sectioned>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <Text variant="headingLg" fontWeight="bold" tone="success">
                          {Math.round((collectionsStats.optimized / collectionsStats.total) * 100) || 0}%
                        </Text>
                        <Text tone="subdued">Taux d'optimisation</Text>
                      </div>
                    </Card>
                  </div>

                  {/* Dernières collections ajoutées */}
                  <Card title="Dernières collections ajoutées" sectioned>
                    {recentCollections.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {recentCollections.map((collection) => (
                          <div key={collection.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                              <Thumbnail
                                source={collection.image || ''}
                                alt={collection.title}
                                size="small"
                              >
                                <Icon source={CollectionIcon} />
                              </Thumbnail>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <Text variant="bodyMd" fontWeight="semibold">
                                    {collection.title}
                                  </Text>
                                  {isNew(collection.created_at) && (
                                    <Badge tone="success">Nouveau</Badge>
                                  )}
                                </div>
                                <Text variant="bodySm" tone="subdued">
                                  Score SEO: {collection.seo_score || 0}/100 • {collection.products_count || 0} produits
                                </Text>
                              </div>
                            </div>
                            <Button
                              plain
                              icon={ArrowRightIcon}
                              onClick={() => navigate(`/collections/${collection.id}`)}
                            >
                              Optimiser
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        heading="Aucune collection"
                        image=""
                      >
                        <p>Aucune collection n'a été trouvée dans votre boutique.</p>
                      </EmptyState>
                    )}
                  </Card>

                  {/* Bouton vers la page collections */}
                  <Box paddingBlock="400">
                    <Button
                      fullWidth
                      onClick={() => navigate('/collections')}
                      icon={CollectionIcon}
                    >
                      Voir toutes les collections
                    </Button>
                  </Box>
                </div>
              </Card.Section>
            )}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
} 