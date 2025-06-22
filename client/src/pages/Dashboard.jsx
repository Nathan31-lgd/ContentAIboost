import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Page, 
  Layout, 
  TextContainer, 
  Badge,
  Button,
  ProgressBar,
  DataTable,
  EmptyState,
  Banner
} from '@shopify/polaris';
// Icônes temporairement désactivées pour le build
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#6d7175', fontSize: '14px' }}>{title}</span>
          <div style={{ color: color === 'success' ? '#108043' : '#202223' }}>
            {icon}
          </div>
        </div>
        <div style={{ fontSize: '32px', fontWeight: '600', color: '#202223' }}>{value}</div>
        {subtitle && (
          <span style={{ color: '#6d7175', fontSize: '14px' }}>{subtitle}</span>
        )}
      </div>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <StatCard
              title="Produits totaux"
              value={stats.totalProducts}
              subtitle={`${stats.optimizedProducts} optimisés`}
              icon={<span>📦</span>}
            />
            <StatCard
              title="Score SEO moyen"
              value={`${stats.averageSeoScore}%`}
              subtitle="En progression"
              icon={<span>📊</span>}
              color="success"
            />
            <StatCard
              title="Collections"
              value={stats.totalCollections}
              subtitle="À optimiser"
              icon={<span>📚</span>}
            />
            <StatCard
              title="Taux d'optimisation"
              value={`${Math.round((stats.optimizedProducts / stats.totalProducts) * 100)}%`}
              subtitle="Objectif : 100%"
              icon={<span>✅</span>}
            />
          </div>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
            </div>
          </Card>

          <Card title="Conseils SEO" sectioned>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <TextContainer>
                <h3>💡 Astuce du jour</h3>
                <p>
                  Utilisez des mots-clés pertinents dans vos titres de produits 
                  pour améliorer votre visibilité sur les moteurs de recherche.
                </p>
              </TextContainer>
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
} 