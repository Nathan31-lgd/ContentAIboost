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
  CollectionIcon,
} from '@shopify/polaris-icons';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../utils/api';
import { useShopify } from '../contexts/ShopifyContext';

export default function Collections() {
  const navigate = useNavigate();
  const { showToast } = useShopify();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollections, setSelectedCollections] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState([]);
  const [sortValue, setSortValue] = useState('title');
  const [syncing, setSyncing] = useState(false);

  // Charger les collections
  const loadCollections = useCallback(async () => {
    try {
      setLoading(true);
      
      // Essayer d'abord de synchroniser automatiquement en arrière-plan
      try {
        await api.collections.sync();
        console.log('Synchronisation automatique des collections réussie');
      } catch (syncError) {
        // Ignorer l'erreur de sync, on essaie de charger quand même
        console.warn('Synchronisation automatique échouée:', syncError);
      }
      
      const response = await api.collections.getAll({
        search: searchValue,
        status: statusFilter.join(','),
        sort: sortValue,
      });
      setCollections(response.collections || []);
      
    } catch (error) {
      console.error('Erreur lors du chargement des collections:', error);
      
      // Si l'erreur indique un problème d'authentification
      if (error.status === 401 || error.message?.includes('Authentication') || error.message?.includes('Token')) {
        toast('Authentification nécessaire. La synchronisation est en cours...', {
          icon: '🔐',
          duration: 4000,
        });
        setCollections([]);
      } else {
        toast.error('Impossible de charger les collections');
      }
    } finally {
      setLoading(false);
    }
  }, [searchValue, statusFilter, sortValue]);

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  // Synchroniser avec Shopify
  const handleSync = async () => {
    try {
      setSyncing(true);
      const response = await api.collections.sync();
      
      if (response.success) {
        toast.success(response.message);
        // Recharger les collections après la synchronisation
        await loadCollections();
      }
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      toast.error('Impossible de synchroniser les collections');
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
  const getOptimizationStatus = (collection) => {
    // On considère qu'une collection est optimisée si son score SEO est >= 80
    const isOptimized = collection.seo_score >= 80;
    
    if (isOptimized) {
      return <Badge tone="success">Optimisée</Badge>;
    } else {
      return <Badge tone="attention">À optimiser</Badge>;
    }
  };

  // Gérer l'optimisation d'une collection
  const handleOptimizeCollection = (collectionId) => {
    navigate(`/collections/${collectionId}`);
  };

  // Gérer l'optimisation en masse
  const handleBulkOptimize = () => {
    if (selectedCollections.length === 0) {
      toast.error('Veuillez sélectionner des collections à optimiser');
      return;
    }
    // TODO: Implémenter l'optimisation en masse
    toast.success(`Optimisation de ${selectedCollections.length} collections lancée`);
  };

  // Préparer les données pour le DataTable
  const rows = collections.map((collection) => {
    const seoInfo = getSEOBadge(collection.seo_score || 0);
    
    return [
      // Image et titre
      <InlineStack gap="400" blockAlign="center">
        <Thumbnail
          source={collection.image || ''}
          alt={collection.title}
          size="small"
        >
          <Icon source={CollectionIcon} />
        </Thumbnail>
        <div>
          <Text variant="bodyMd" fontWeight="semibold">
            {collection.title}
          </Text>
          <Text variant="bodySm" tone="subdued">
            {collection.products_count || 0} produits
          </Text>
        </div>
      </InlineStack>,
      
      // Type de collection
      <Badge tone="info">
        {collection.collection_type === 'smart' ? 'Automatique' : 'Manuelle'}
      </Badge>,
      
      // Score SEO
      <Badge tone={seoInfo.tone}>
        <InlineStack gap="200" blockAlign="center">
          <Icon source={StarFilledIcon} />
          {seoInfo.label}
        </InlineStack>
      </Badge>,
      
      // Statut d'optimisation
      getOptimizationStatus(collection),
      
      // Actions
      <ButtonGroup>
        <Button
          size="slim"
          onClick={() => handleOptimizeCollection(collection.id)}
          disabled={collection.seo_score >= 80}
        >
          {collection.seo_score >= 80 ? 'Réoptimiser' : 'Optimiser'}
        </Button>
        <Button
          size="slim"
          plain
          onClick={() => navigate(`/collections/${collection.id}`)}
        >
          Détails
        </Button>
      </ButtonGroup>,
    ];
  });

  // Gestion de la sélection
  const handleSelectionChange = useCallback((selection) => {
    setSelectedCollections(selection);
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
            { label: 'Optimisée', value: 'optimized' },
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
      <Page title="Collections">
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

  if (collections.length === 0 && !searchValue && statusFilter.length === 0) {
    return (
      <Page 
        title="Collections"
        primaryAction={{
          content: 'Synchroniser les collections',
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
                  <Icon source={CollectionIcon} />
                </div>
                <Text variant="headingMd">Aucune collection trouvée</Text>
                <Text variant="bodyMd" tone="subdued" as="p" style={{ marginTop: '8px', marginBottom: '20px' }}>
                  Synchronisez vos collections depuis votre boutique Shopify pour commencer l'optimisation SEO.
                </Text>
                <Button 
                  primary 
                  onClick={handleSync}
                  loading={syncing}
                  icon={RefreshIcon}
                >
                  Synchroniser les collections maintenant
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
      title="Collections"
      subtitle={`${collections.length} collection${collections.length > 1 ? 's' : ''} trouvée${collections.length > 1 ? 's' : ''}`}
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
          disabled: selectedCollections.length === 0,
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
                'Collection',
                'Type',
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
        
        {selectedCollections.length > 0 && (
          <Layout.Section>
            <Card sectioned>
              <InlineStack align="space-between">
                <Text variant="bodyMd">
                  {selectedCollections.length} collection{selectedCollections.length > 1 ? 's' : ''} sélectionnée{selectedCollections.length > 1 ? 's' : ''}
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