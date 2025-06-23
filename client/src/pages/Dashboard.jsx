import React from 'react';
import { Page, Card, Layout, Button } from '@shopify/polaris';

export default function Dashboard() {
  return (
    <Page title="Tableau de bord">
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <h2>Bienvenue dans ContentAIBoost</h2>
            <p>Votre application d'optimisation SEO pour Shopify</p>
            <Button primary>Commencer</Button>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
} 