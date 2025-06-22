import React from 'react';
import { useParams } from 'react-router-dom';
import { Page, Layout, Card, Text, Button } from '@shopify/polaris';

const CollectionDetail = () => {
  const { id } = useParams();

  return (
    <Page
      title={`Collection ${id}`}
      subtitle="Détails et optimisation SEO"
      breadcrumbs={[{ content: 'Collections', url: '/collections' }]}
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
                Page de détail de la collection {id} - À implémenter
              </Text>
            </Card.Section>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default CollectionDetail; 