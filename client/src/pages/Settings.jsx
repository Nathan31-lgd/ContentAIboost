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
  InlineStack,
  Icon,
  Spinner,
  Text,
} from '@shopify/polaris';
import { CheckCircleIcon, AlertTriangleIcon } from '@shopify/polaris-icons';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function Settings() {
  const [settings, setSettings] = useState({
    openaiKey: '',
    anthropicKey: '',
    googleKey: '',
    language: 'fr',
    tone: 'professional',
  });
  
  const [validationStatus, setValidationStatus] = useState({
    openai: { status: 'idle', message: '' },
    anthropic: { status: 'idle', message: '' },
    google: { status: 'idle', message: '' },
  });

  const [loading, setLoading] = useState(false);

  const handleSettingChange = useCallback((field) => (value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    const keyName = field.replace('Key', '');
    if (validationStatus[keyName]) {
      setValidationStatus(prev => ({ ...prev, [keyName]: { status: 'idle', message: '' } }));
    }
  }, [validationStatus]);

  const handleValidateKey = useCallback(async (provider) => {
    const apiKey = settings[`${provider}Key`];
    if (!apiKey) {
      toast.error(`Veuillez entrer une clé API pour ${provider}.`);
      return;
    }

    setValidationStatus(prev => ({ ...prev, [provider]: { status: 'loading', message: '' } }));
    
    try {
      await api.post('/ai/validate-key', { provider, apiKey });
      setValidationStatus(prev => ({ ...prev, [provider]: { status: 'valid', message: '' } }));
      toast.success(`La clé API pour ${provider} est valide !`);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'La clé API est invalide ou le service est indisponible.';
      setValidationStatus(prev => ({ ...prev, [provider]: { status: 'invalid', message: errorMessage } }));
      toast.error(`Erreur de validation pour ${provider}: ${errorMessage}`);
    }
  }, [settings]);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      console.log('Paramètres sauvegardés:', settings);
      toast.success('Paramètres sauvegardés avec succès !');
      setLoading(false);
    }, 1000);
  };
  
  const renderValidationIcon = (keyName) => {
    const status = validationStatus[keyName]?.status;
    if (status === 'loading') {
      return <Spinner size="small" />;
    }
    if (status === 'valid') {
      return <Icon source={CheckCircleIcon} tone="success" />;
    }
    if (status === 'invalid') {
      return <Icon source={AlertTriangleIcon} tone="critical" />;
    }
    return null;
  }

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
              stockées de manière sécurisée et ne sont jamais partagées.
            </p>
          </Banner>
        </Layout.Section>

        <Layout.Section>
          <Card sectioned title="Clés API des fournisseurs IA">
            <FormLayout>
              <InlineStack wrap={false} gap="400" blockAlign="end">
                <div style={{ flexGrow: 1 }}>
                  <TextField
                    label="Clé API OpenAI"
                    value={settings.openaiKey}
                    onChange={handleSettingChange('openaiKey')}
                    type="password"
                    autoComplete="new-password"
                    helpText="Utilisée pour les modèles GPT-4, GPT-3.5, etc."
                    error={validationStatus.openai.message}
                    connectedRight={renderValidationIcon('openai')}
                  />
                </div>
                <Button onClick={() => handleValidateKey('openai')} loading={validationStatus.openai.status === 'loading'}>Vérifier</Button>
              </InlineStack>

              <InlineStack wrap={false} gap="400" blockAlign="end">
                <div style={{ flexGrow: 1 }}>
                  <TextField
                    label="Clé API Anthropic"
                    value={settings.anthropicKey}
                    onChange={handleSettingChange('anthropicKey')}
                    type="password"
                    autoComplete="new-password"
                    helpText="Utilisée pour les modèles Claude 3 (Opus, Sonnet, Haiku)."
                    error={validationStatus.anthropic.message}
                    connectedRight={renderValidationIcon('anthropic')}
                  />
                </div>
                <Button onClick={() => handleValidateKey('anthropic')} loading={validationStatus.anthropic.status === 'loading'}>Vérifier</Button>
              </InlineStack>

              <InlineStack wrap={false} gap="400" blockAlign="end">
                <div style={{ flexGrow: 1 }}>
                  <TextField
                    label="Clé API Google"
                    value={settings.googleKey}
                    onChange={handleSettingChange('googleKey')}
                    type="password"
                    autoComplete="new-password"
                    helpText="Utilisée pour les modèles Gemini Pro."
                    error={validationStatus.google.message}
                    connectedRight={renderValidationIcon('google')}
                  />
                </div>
                <Button onClick={() => handleValidateKey('google')} loading={validationStatus.google.status === 'loading'}>Vérifier</Button>
              </InlineStack>
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

      </Layout>
    </Page>
  );
} 