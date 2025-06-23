import React, { useState, useCallback } from 'react';
import {
  Page,
  Layout,
  Card,
  FormLayout,
  TextField,
  Select,
  Button,
  Banner,
  TextContainer,
} from '@shopify/polaris';
import toast from 'react-hot-toast';

export default function Settings() {
  const [settings, setSettings] = useState({
    openaiKey: '',
    claudeKey: '',
    geminiKey: '',
    language: 'fr',
    tone: 'professional',
  });
  const [loading, setLoading] = useState(false);

  const handleSettingChange = useCallback((field) => (value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = () => {
    setLoading(true);
    // Simuler un appel API
    setTimeout(() => {
      console.log('Paramètres sauvegardés:', settings);
      toast.success('Paramètres sauvegardés avec succès !');
      setLoading(false);
    }, 1000);
  };

  return (
    <Page
      title="Paramètres"
      subtitle="Configurez les clés API et les préférences de l'IA"
      primaryAction={{
        content: 'Sauvegarder',
        onAction: handleSave,
        loading: loading,
      }}
    >
      <Layout>
        <Layout.Section>
          <Banner title="Configuration importante" status="info">
            <p>
              Vous devez fournir au moins une clé API pour que les
              fonctionnalités d'optimisation fonctionnent. Vos clés sont
              stockées de manière sécurisée.
            </p>
          </Banner>
        </Layout.Section>

        <Layout.Section>
          <Card sectioned title="Clés API des fournisseurs IA">
            <FormLayout>
              <TextField
                label="Clé API OpenAI"
                value={settings.openaiKey}
                onChange={handleSettingChange('openaiKey')}
                type="password"
                autoComplete="new-password"
                helpText="Utilisée pour les modèles GPT-4, GPT-3.5, etc."
              />
              <TextField
                label="Clé API Anthropic"
                value={settings.claudeKey}
                onChange={handleSettingChange('claudeKey')}
                type="password"
                autoComplete="new-password"
                helpText="Utilisée pour les modèles Claude 3 (Opus, Sonnet, Haiku)."
              />
              <TextField
                label="Clé API Google"
                value={settings.geminiKey}
                onChange={handleSettingChange('geminiKey')}
                type="password"
                autoComplete="new-password"
                helpText="Utilisée pour les modèles Gemini Pro."
              />
            </FormLayout>
          </Card>
        </Layout.Section>
        
        <Layout.Section>
          <Card sectioned title="Préférences de contenu">
            <FormLayout>
              <Select
                label="Langue des optimisations"
                options={[
                  { label: 'Français', value: 'fr' },
                  { label: 'Anglais', value: 'en' },
                  { label: 'Espagnol', value: 'es' },
                  { label: 'Allemand', value: 'de' },
                  { label: 'Italien', value: 'it' },
                ]}
                value={settings.language}
                onChange={handleSettingChange('language')}
                helpText="La langue cible pour la génération de contenu."
              />
              <Select
                label="Ton du contenu"
                options={[
                  { label: 'Professionnel', value: 'professional' },
                  { label: 'Amical et engageant', value: 'friendly' },
                  { label: 'Expert et technique', value: 'technical' },
                  { label: 'Haut de gamme / luxe', value: 'luxury' },
                  { label: 'Simple et direct', value: 'simple' },
                ]}
                value={settings.tone}
                onChange={handleSettingChange('tone')}
                helpText="Le style d'écriture que l'IA adoptera."
              />
            </FormLayout>
          </Card>
        </Layout.Section>

        <Layout.Section>
           <TextContainer>
             <p>N'oubliez pas de sauvegarder vos changements.</p>
           </TextContainer>
        </Layout.Section>

      </Layout>
    </Page>
  );
} 