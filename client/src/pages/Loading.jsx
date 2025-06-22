import React from 'react';
import { Page, Layout, Card, Spinner, Text, Stack } from '@shopify/polaris';

const Loading = () => {
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
            <Card sectioned>
              <Stack vertical alignment="center" spacing="loose">
                <Spinner size="large" />
                <Text variant="headingMd" as="h2">
                  ContentAIBoost
                </Text>
                <Text variant="bodyMd" as="p" color="subdued">
                  Chargement de votre application...
                </Text>
              </Stack>
            </Card>
          </div>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default Loading; 