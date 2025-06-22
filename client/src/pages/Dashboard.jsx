import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Page, 
  Layout, 
  TextContainer, 
  Heading,
  DisplayText,
  TextStyle,
  Stack,
  Badge,
  Button,
  ProgressBar,
  DataTable,
  EmptyState,
  Banner
} from '@shopify/polaris';
import {
  ProductsMajor,
  CollectionsMajor,
  AnalyticsMajor,
  CircleTickMajor
} from '@shopify/polaris-icons';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    optimizedProducts: 0,
    totalCollections: 0,
    averageSeoScore: 0
  });
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Simuler le chargement des données
      setTimeout(() => {
        setStats({
          totalProducts: 156,
          optimizedProducts: 45,
          totalCollections: 12,
          averageSeoScore: 72
        });
        setRecentProducts([
          ['T-shirt Premium', 'Non optimisé', '45%', 'Optimiser'],
          ['Jeans Slim Fit', 'Optimisé', '92%', 'Voir détails'],
          ['Sneakers Sport', 'En cours', '67%', 'Continuer'],
        ]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, icon, color = 'base' }) => (
    <Card sectioned>
      <Stack vertical spacing="tight">
        <Stack distribution="equalSpacing" alignment="center">
          <TextStyle variation="subdued">{title}</TextStyle>
          <div style={{ color: color === 'success' ? '#108043' : '#202223' }}>
            {icon}
          </div>
        </Stack>
        <DisplayText size="large">{value}</DisplayText>
        {subtitle && (
          <TextStyle variation="subdued">{subtitle}</TextStyle>
        )}
      </Stack>
    </Card>
  );

  const rows = recentProducts.map(product => [
    product[0],
    <Badge status={product[1] === 'Optimisé' ? 'success' : product[1] === 'En cours' ? 'warning' : 'critical'}>
      {product[1]}
    </Badge>,
    <ProgressBar progress={parseInt(product[2])} size="small" />,
    <Button size="slim" onClick={() => navigate('/products')}>
      {product[3]}
    </Button>
  ]);

  return (
    <Page
      title="Tableau de bord"
      subtitle="Vue d'ensemble de vos optimisations SEO"
      primaryAction={{
        content: 'Optimiser un produit',
        onAction: () => navigate('/products'),
      }}
    >
      <Layout>
        {/* Bannière de bienvenue */}
        <Layout.Section>
          <Banner
            title="Bienvenue dans ContentAIBoost !"
            status="info"
            onDismiss={() => {}}
          >
            <p>
              Commencez par configurer vos clés API dans les paramètres pour activer l'optimisation automatique.
            </p>
          </Banner>
        </Layout.Section>

        {/* Statistiques principales */}
        <Layout.Section>
          <Stack distribution="fillEvenly" spacing="loose">
            <StatCard
              title="Produits totaux"
              value={stats.totalProducts}
              subtitle={`${stats.optimizedProducts} optimisés`}
              icon={<ProductsMajor />}
            />
            <StatCard
              title="Score SEO moyen"
              value={`${stats.averageSeoScore}%`}
              subtitle="En progression"
              icon={<AnalyticsMajor />}
              color="success"
            />
            <StatCard
              title="Collections"
              value={stats.totalCollections}
              subtitle="À optimiser"
              icon={<CollectionsMajor />}
            />
            <StatCard
              title="Taux d'optimisation"
              value={`${Math.round((stats.optimizedProducts / stats.totalProducts) * 100)}%`}
              subtitle="Objectif : 100%"
              icon={<CircleTickMajor />}
            />
          </Stack>
        </Layout.Section>

        {/* Produits récents */}
        <Layout.Section>
          <Card>
            <Card.Header title="Produits récents" />
            <Card.Section>
              {recentProducts.length > 0 ? (
                <DataTable
                  columnContentTypes={['text', 'text', 'numeric', 'text']}
                  headings={['Produit', 'Statut', 'Score SEO', 'Action']}
                  rows={rows}
                />
              ) : (
                <EmptyState
                  heading="Aucun produit trouvé"
                  action={{ content: 'Importer des produits' }}
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                  <p>Commencez par importer vos produits Shopify pour les optimiser.</p>
                </EmptyState>
              )}
            </Card.Section>
          </Card>
        </Layout.Section>

        {/* Actions rapides */}
        <Layout.Section secondary>
          <Card title="Actions rapides" sectioned>
            <Stack vertical spacing="loose">
              <Button fullWidth onClick={() => navigate('/products')}>
                📝 Optimiser des produits
              </Button>
              <Button fullWidth onClick={() => navigate('/bulk-optimization')}>
                🔄 Optimisation en lot
              </Button>
              <Button fullWidth onClick={() => navigate('/collections')}>
                📚 Gérer les collections
              </Button>
              <Button fullWidth primary onClick={() => navigate('/settings')}>
                ⚙️ Configurer l'IA
              </Button>
            </Stack>
          </Card>

          <Card title="Conseils SEO" sectioned>
            <Stack vertical spacing="tight">
              <TextContainer>
                <Heading element="h3">💡 Astuce du jour</Heading>
                <p>
                  Utilisez des mots-clés pertinents dans vos titres de produits 
                  pour améliorer votre visibilité sur les moteurs de recherche.
                </p>
              </TextContainer>
            </Stack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
} 