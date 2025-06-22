import React from 'react';
import { Card, Page, Layout } from '@shopify/polaris';

const AuthLayout = ({ children }) => {
  return (
    <Page>
      <Layout>
        <Layout.Section>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh'
          }}>
            <div style={{ width: '400px' }}>
              <Card sectioned>
                {children}
              </Card>
            </div>
          </div>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default AuthLayout; 