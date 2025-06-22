import React from 'react';
import { Page, Layout, Card, Spinner } from '@shopify/polaris';

const Loading = () => {
  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '60px 0'
            }}>
              <Spinner size="large" />
              <p style={{ marginTop: '20px', color: '#6d7175' }}>Chargement en cours...</p>
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default Loading; 