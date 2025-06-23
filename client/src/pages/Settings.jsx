import React from 'react';
import { Page, Card, Layout, TextField, Button, FormLayout } from '@shopify/polaris';

export default function Settings() {
  return (
    <Page title="Paramètres">
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <FormLayout>
              <TextField
                label="Clé API OpenAI"
                type="password"
                autoComplete="off"
              />
              <TextField
                label="Langue par défaut"
                value="Français"
              />
              <Button primary>Sauvegarder</Button>
            </FormLayout>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
} 