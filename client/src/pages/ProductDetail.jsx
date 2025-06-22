import React from 'react';
import { useParams } from 'react-router-dom';
import { Page, Layout, Card, Text, Button } from '@shopify/polaris';

const ProductDetail = () => {
  const { id } = useParams();

  return (
    <Page
      title={`Produit ${id}`}
      subtitle="Détails et optimisation SEO"
      breadcrumbs={[{ content: 'Produits', url: '/products' }]}
      primaryAction={{
        content: 'Optimiser avec IA',
        onClick: () => {
          // TODO: Implémenter l'optimisation
        }
      }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <Card.Section>
              <Text variant="bodyMd" as="p">
                Page de détail du produit {id} - À implémenter
              </Text>
            </Card.Section>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default ProductDetail; 