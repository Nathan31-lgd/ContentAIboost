import React, { useState, useEffect, useCallback } from 'react';
import {
  Page,
  Card,
  Layout,
  DataTable,
  Button,
  Badge,
  Spinner,
  EmptyState,
  Filters,
  ChoiceList,
  TextField,
  Icon,
  ButtonGroup,
  Thumbnail,
  InlineStack,
  Text,
} from '@shopify/polaris';
import {
  SearchIcon,
  StarFilledIcon,
  RefreshIcon,
} from '@shopify/polaris-icons';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../utils/api';
import { useShopify } from '../contexts/ShopifyContext';

export default function Products() {
  const navigate = useNavigate();
  const { showToast } = useShopify();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState([]);
  const [sortValue, setSortValue] = useState('title');
  const [syncing, setSyncing] = useState(false);

  // Charger les produits
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      
      // Essayer d'abord de synchroniser automatiquement en arrière-plan
      try {
        await api.products.sync();
        console.log('Synchronisation automatique réussie');
      } catch (syncError) {
        // Ignorer l'erreur de sync, on essaie de charger quand même
        console.warn('Synchronisation automatique échouée:', syncError);
      }
      
      const response = await api.products.getAll({
        search: searchValue,
        status: statusFilter.join(','),
        sort: sortValue,
      });
      setProducts(response.products || []);
      
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      
      // Si l'erreur indique un problème d'authentification
      if (error.status === 401 || error.message?.includes('Authentication') || error.message?.includes('Token')) {
        toast('Authentification nécessaire. La synchronisation est en cours...', {
          icon: '🔐',
          duration: 4000,
        });
        setProducts([]);
      } 
      // Si l'erreur indique un token expiré
      else if (error.message?.includes('Token d\'accès expiré') || error.message?.includes('requiresReinstall')) {
        toast.error('Session expirée. Redirection vers l\'installation...', {
          icon: '⚠️',
          duration: 5000,
        });
        
        // Rediriger vers l'installation après un délai
        setTimeout(() => {
          const shop = new URLSearchParams(window.location.search).get('shop');
          if (shop) {
            window.location.href = `/api/auth/install?shop=${shop}`;
          } else {
            window.location.href = '/auth/install';
          }
        }, 2000);
        
        setProducts([]);
      } else {
        toast.error('Impossible de charger les produits');
      }
    } finally {
      setLoading(false);
    }
  }, [searchValue, statusFilter, sortValue]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Synchroniser avec Shopify
  const handleSync = async () => {
    try {
      setSyncing(true);
      const response = await api.products.sync();
      
      if (response.success) {
        toast.success(response.message);
        // Recharger les produits après la synchronisation
        await loadProducts();
      }
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      toast.error('Impossible de synchroniser les produits');
    } finally {
      setSyncing(false);
    }
  };

  // Calculer la couleur du badge SEO
  const getSEOBadge = (score) => {
    if (score >= 80) {
      return { tone: 'success', label: `${score}/100` };
    } else if (score >= 60) {
      return { tone: 'warning', label: `${score}/100` };
    } else {
      return { tone: 'critical', label: `${score}/100` };
    }
  };

  // Déterminer le statut d'optimisation
  const getOptimizationStatus = (product) => {
    // On considère qu'un produit est optimisé si son score SEO est >= 80
    const isOptimized = product.seo_score >= 80;
    
    if (isOptimized) {
      return <Badge tone="success">Optimisé</Badge>;
    } else {
      return <Badge tone="attention">À optimiser</Badge>;
    }
  };

  // Gérer l'optimisation d'un produit
  const handleOptimizeProduct = (productId) => {
    navigate(`/products/${productId}`);
  };

  // Gérer l'optimisation en masse
  const handleBulkOptimize = () => {
    if (selectedProducts.length === 0) {
      toast.error('Veuillez sélectionner des produits à optimiser');
      return;
    }
    // TODO: Implémenter l'optimisation en masse
    toast.success(`Optimisation de ${selectedProducts.length} produits lancée`);
  };

  // Préparer les données pour le DataTable
  const rows = products.map((product) => {
    const seoInfo = getSEOBadge(product.seo_score || 0);
    
    return [
      // Image et titre
      <InlineStack gap="400" blockAlign="center">
        <Thumbnail
          source={product.image || 'https://via.placeholder.com/50'}
          alt={product.title}
          size="small"
        />
        <Text variant="bodyMd" fontWeight="semibold">
          {product.title}
        </Text>
      </InlineStack>,
      
      // Prix
      <Text variant="bodyMd">{product.price || '—'}</Text>,
      
      // Score SEO
      <Badge tone={seoInfo.tone}>
        <InlineStack gap="200" blockAlign="center">
          <Icon source={StarFilledIcon} />
          {seoInfo.label}
        </InlineStack>
      </Badge>,
      
      // Statut d'optimisation
      getOptimizationStatus(product),
      
      // Actions
      <ButtonGroup>
        <Button
          size="slim"
          onClick={() => handleOptimizeProduct(product.id)}
          disabled={product.seo_score >= 80}
        >
          {product.seo_score >= 80 ? 'Réoptimiser' : 'Optimiser'}
        </Button>
        <Button
          size="slim"
          plain
          onClick={() => navigate(`/products/${product.id}`)}
        >
          Détails
        </Button>
      </ButtonGroup>,
    ];
  });

  // Gestion de la sélection
  const handleSelectionChange = useCallback((selection) => {
    setSelectedProducts(selection);
  }, []);

  // Filtres
  const filters = [
    {
      key: 'status',
      label: 'Statut d\'optimisation',
      filter: (
        <ChoiceList
          title="Statut d'optimisation"
          titleHidden
          choices={[
            { label: 'Optimisé', value: 'optimized' },
            { label: 'À optimiser', value: 'not_optimized' },
          ]}
          selected={statusFilter}
          onChange={setStatusFilter}
          allowMultiple
        />
      ),
    },
  ];

  const appliedFilters = statusFilter.length > 0
    ? [{
        key: 'status',
        label: `Statut: ${statusFilter.join(', ')}`,
        onRemove: () => setStatusFilter([]),
      }]
    : [];

  if (loading) {
    return (
      <Page title="Produits">
        <Layout>
          <Layout.Section>
            <Card>
              <div style={{ padding: '100px', textAlign: 'center' }}>
                <Spinner size="large" />
              </div>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  if (products.length === 0 && !searchValue && statusFilter.length === 0) {
    return (
      <Page 
        title="Produits"
        primaryAction={{
          content: 'Synchroniser les produits',
          icon: RefreshIcon,
          onAction: handleSync,
          loading: syncing,
        }}
      >
        <Layout>
          <Layout.Section>
            <Card>
              <div style={{ padding: '60px', textAlign: 'center' }}>
                <div style={{ marginBottom: '20px' }}>
                  <Icon source={StarFilledIcon} />
                </div>
                <Text variant="headingMd">Aucun produit trouvé</Text>
                <Text variant="bodyMd" tone="subdued" as="p" style={{ marginTop: '8px', marginBottom: '20px' }}>
                  Synchronisez vos produits depuis votre boutique Shopify pour commencer l'optimisation SEO.
                </Text>
                <Button 
                  primary 
                  onClick={handleSync}
                  loading={syncing}
                  icon={RefreshIcon}
                >
                  Synchroniser les produits maintenant
                </Button>
              </div>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <Page 
      title="Produits"
      subtitle={`${products.length} produit${products.length > 1 ? 's' : ''} trouvé${products.length > 1 ? 's' : ''}`}
      primaryAction={{
        content: 'Synchroniser',
        icon: RefreshIcon,
        onAction: handleSync,
        loading: syncing,
      }}
      secondaryActions={[
        {
          content: 'Optimiser la sélection',
          onAction: handleBulkOptimize,
          disabled: selectedProducts.length === 0,
        },
      ]}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <Filters
              queryValue={searchValue}
              filters={filters}
              appliedFilters={appliedFilters}
              onQueryChange={setSearchValue}
              onQueryClear={() => setSearchValue('')}
              onClearAll={() => {
                setSearchValue('');
                setStatusFilter([]);
              }}
            />
            <DataTable
              columnContentTypes={['text', 'text', 'text', 'text', 'text']}
              headings={[
                'Produit',
                'Prix',
                'Score SEO',
                'Statut',
                'Actions',
              ]}
              rows={rows}
              selectable
              onSelectionChange={handleSelectionChange}
            />
          </Card>
        </Layout.Section>
        
        {selectedProducts.length > 0 && (
          <Layout.Section>
            <Card sectioned>
              <InlineStack align="space-between">
                <Text variant="bodyMd">
                  {selectedProducts.length} produit{selectedProducts.length > 1 ? 's' : ''} sélectionné{selectedProducts.length > 1 ? 's' : ''}
                </Text>
                <Button primary onClick={handleBulkOptimize}>
                  Optimiser la sélection
                </Button>
              </InlineStack>
            </Card>
          </Layout.Section>
        )}
      </Layout>
    </Page>
  );
} 