import React, { useState, useEffect, useCallback } from 'react';
import {
  Page,
  Layout,
  Card,
  ResourceList,
  ResourceItem,
  Thumbnail,
  Badge,
  Filters,
  ChoiceList,
  Button,
  Modal,
  FormLayout,
  TextField,
  TextContainer,
  ProgressBar,
  Banner,
  EmptyState
} from '@shopify/polaris';
// Icônes temporairement désactivées pour le build
import toast from 'react-hot-toast';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [queryValue, setQueryValue] = useState('');
  const [statusFilter, setStatusFilter] = useState([]);
  const [modalActive, setModalActive] = useState(false);
  const [optimizingProduct, setOptimizingProduct] = useState(null);
  const [optimizationProgress, setOptimizationProgress] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      // Simuler le chargement des produits
      setTimeout(() => {
        setProducts([
          {
            id: '1',
            title: 'T-shirt Premium Coton Bio',
            image: 'https://via.placeholder.com/50',
            price: '29.99',
            seoScore: 45,
            status: 'not_optimized',
            description: 'T-shirt haute qualité...'
          },
          {
            id: '2',
            title: 'Jean Slim Fit Stretch',
            image: 'https://via.placeholder.com/50',
            price: '79.99',
            seoScore: 82,
            status: 'optimized',
            description: 'Jean moderne avec coupe ajustée...'
          },
          {
            id: '3',
            title: 'Sneakers Sport Performance',
            image: 'https://via.placeholder.com/50',
            price: '99.99',
            seoScore: 67,
            status: 'in_progress',
            description: 'Chaussures de sport légères...'
          }
        ]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      toast.error('Erreur lors du chargement des produits');
      setLoading(false);
    }
  };

  const handleOptimizeProduct = useCallback((product) => {
    setOptimizingProduct(product);
    setModalActive(true);
    setOptimizationProgress(0);

    // Simuler l'optimisation
    const interval = setInterval(() => {
      setOptimizationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setModalActive(false);
            toast.success(`${product.title} optimisé avec succès !`);
            // Mettre à jour le produit
            setProducts(prevProducts =>
              prevProducts.map(p =>
                p.id === product.id
                  ? { ...p, status: 'optimized', seoScore: 95 }
                  : p
              )
            );
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  }, []);

  const handleQueryValueRemove = useCallback(() => setQueryValue(''), []);
  const handleStatusFilterRemove = useCallback(() => setStatusFilter([]), []);
  const handleClearAll = useCallback(() => {
    handleQueryValueRemove();
    handleStatusFilterRemove();
  }, [handleQueryValueRemove, handleStatusFilterRemove]);

  const filters = [
    {
      key: 'status',
      label: 'Statut',
      filter: (
        <ChoiceList
          title="Statut"
          titleHidden
          choices={[
            { label: 'Optimisé', value: 'optimized' },
            { label: 'Non optimisé', value: 'not_optimized' },
            { label: 'En cours', value: 'in_progress' },
          ]}
          selected={statusFilter}
          onChange={setStatusFilter}
          allowMultiple
        />
      ),
      shortcut: true,
    },
  ];

  const appliedFilters = !isEmpty(statusFilter)
    ? [{
        key: 'status',
        label: disambiguateLabel('status', statusFilter),
        onRemove: handleStatusFilterRemove,
      }]
    : [];

  const filterControl = (
    <Filters
      queryValue={queryValue}
      filters={filters}
      appliedFilters={appliedFilters}
      onQueryChange={setQueryValue}
      onQueryClear={handleQueryValueRemove}
      onClearAll={handleClearAll}
    />
  );

  const promotedBulkActions = [
    {
      content: 'Optimiser la sélection',
      onAction: () => {
        toast.success(`Optimisation de ${selectedItems.length} produits lancée`);
      },
    },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'optimized':
        return <Badge status="success">Optimisé</Badge>;
      case 'in_progress':
        return <Badge status="warning">En cours</Badge>;
      default:
        return <Badge status="critical">Non optimisé</Badge>;
    }
  };

  const getSeoScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'critical';
  };

  const renderItem = (item) => {
    const { id, title, image, price, seoScore, status, description } = item;

    return (
      <ResourceItem
        id={id}
        media={<Thumbnail source={image} alt={title} />}
        accessibilityLabel={`View details for ${title}`}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontWeight: '600', marginBottom: '4px' }}>{title}</h3>
            <div style={{ color: '#6d7175', fontSize: '14px' }}>{description}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
            <span style={{ fontWeight: '600' }}>{price} €</span>
            {getStatusBadge(status)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
            <span style={{ fontSize: '14px' }}>Score SEO</span>
            <Badge status={getSeoScoreColor(seoScore)}>{seoScore}/100</Badge>
          </div>
          <div>
            <Button
              primary={status !== 'optimized'}
              onClick={() => handleOptimizeProduct(item)}
              disabled={status === 'in_progress'}
            >
              {status === 'optimized' ? 'Ré-optimiser' : 'Optimiser'}
            </Button>
          </div>
        </div>
      </ResourceItem>
    );
  };

  return (
    <Page
      title="Produits"
      subtitle="Gérez et optimisez vos produits"
      primaryAction={{
        content: 'Importer des produits',
        onAction: () => toast.info('Import des produits depuis Shopify...'),
      }}
      secondaryActions={[
        {
          content: 'Optimisation en lot',
          onAction: () => window.location.href = '/bulk-optimization',
        },
      ]}
    >
      <Layout>
        <Layout.Section>
          <Banner
            title="Conseil d'optimisation"
            status="info"
            onDismiss={() => {}}
          >
            <p>
              Les produits avec un score SEO inférieur à 60 devraient être optimisés en priorité 
              pour améliorer votre visibilité sur les moteurs de recherche.
            </p>
          </Banner>
        </Layout.Section>

        <Layout.Section>
          <Card>
            {products.length > 0 ? (
              <ResourceList
                resourceName={{ singular: 'produit', plural: 'produits' }}
                items={products}
                renderItem={renderItem}
                selectedItems={selectedItems}
                onSelectionChange={setSelectedItems}
                promotedBulkActions={promotedBulkActions}
                filterControl={filterControl}
                loading={loading}
              />
            ) : (
              <EmptyState
                heading="Aucun produit trouvé"
                action={{
                  content: 'Importer des produits',
                  onAction: () => toast.info('Import en cours...'),
                }}
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>Importez vos produits depuis Shopify pour commencer l'optimisation SEO.</p>
              </EmptyState>
            )}
          </Card>
        </Layout.Section>
      </Layout>

      <Modal
        open={modalActive}
        onClose={() => setModalActive(false)}
        title="Optimisation en cours"
        primaryAction={{
          content: 'Fermer',
          onAction: () => setModalActive(false),
          disabled: optimizationProgress < 100,
        }}
      >
        <Modal.Section>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <TextContainer>
              <p>
                Optimisation de <strong>{optimizingProduct?.title}</strong> avec l'intelligence artificielle...
              </p>
            </TextContainer>
            <ProgressBar progress={optimizationProgress} />
            <span style={{ color: '#6d7175', fontSize: '14px' }}>
              {optimizationProgress < 30 && "Analyse du contenu actuel..."}
              {optimizationProgress >= 30 && optimizationProgress < 60 && "Génération du titre optimisé..."}
              {optimizationProgress >= 60 && optimizationProgress < 90 && "Amélioration de la description..."}
              {optimizationProgress >= 90 && "Finalisation de l'optimisation..."}
            </span>
          </div>
        </Modal.Section>
      </Modal>
    </Page>
  );
}

function isEmpty(value) {
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  return value === '' || value == null;
}

function disambiguateLabel(key, value) {
  switch (key) {
    case 'status':
      return value.map(val => {
        switch (val) {
          case 'optimized': return 'Optimisé';
          case 'not_optimized': return 'Non optimisé';
          case 'in_progress': return 'En cours';
          default: return val;
        }
      }).join(', ');
    default:
      return value;
  }
} 