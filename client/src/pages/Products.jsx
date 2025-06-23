import React from 'react';
import { Page, Card, Layout, DataTable, Button } from '@shopify/polaris';

export default function Products() {
  const rows = [
    ['T-shirt', '29.99€', 'Actif'],
    ['Jeans', '79.99€', 'Actif'],
    ['Sneakers', '99.99€', 'Actif'],
  ];

  return (
    <Page title="Produits">
      <Layout>
        <Layout.Section>
          <Card>
            <DataTable
              columnContentTypes={['text', 'text', 'text']}
              headings={['Nom', 'Prix', 'Statut']}
              rows={rows}
            />
          </Card>
        </Layout.Section>
        <Layout.Section>
          <Card sectioned>
            <Button primary fullWidth>Optimiser tous les produits</Button>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
} 