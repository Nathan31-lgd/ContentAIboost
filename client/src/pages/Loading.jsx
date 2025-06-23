import React from 'react';
import { Page, Card, Layout, Spinner } from '@shopify/polaris';

export default function Loading() {
  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Spinner size="large" />
              <p style={{ marginTop: '20px' }}>Chargement en cours...</p>
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
} 