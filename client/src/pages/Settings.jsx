import React, { useState } from 'react';
import {
  Page,
  Layout,
  Card,
  FormLayout,
  TextField,
  Select,
  Checkbox,
  Button,
  Banner,
  Stack,
  Badge,
  Icon,
  TextContainer,
  Heading
} from '@shopify/polaris';
import {
  CircleTickMajor,
  CircleAlertMajor
} from '@shopify/polaris-icons';
import toast from 'react-hot-toast';

export default function Settings() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    openaiKey: '',
    claudeKey: '',
    geminiKey: '',
    defaultAI: 'openai',
    autoOptimize: false,
    optimizeOnImport: false,
    language: 'fr',
    tone: 'professional'
  });

  const [apiStatus, setApiStatus] = useState({
    openai: false,
    claude: false,
    gemini: false
  });

  const handleChange = (field) => (value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const testApiKey = async (provider) => {
    setLoading(true);
    try {
      // Simuler le test de l'API
      setTimeout(() => {
        setApiStatus(prev => ({ ...prev, [provider]: true }));
        toast.success(`${provider.toUpperCase()} API connectée avec succès !`);
        setLoading(false);
      }, 1000);
    } catch (error) {
      toast.error(`Erreur de connexion ${provider}`);
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      // Simuler la sauvegarde
      setTimeout(() => {
        toast.success('Paramètres sauvegardés avec succès !');
        setLoading(false);
      }, 1000);
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
      setLoading(false);
    }
  };

  const AIProviderCard = ({ provider, title, description }) => (
    <Card sectioned>
      <Stack vertical spacing="loose">
        <Stack distribution="equalSpacing" alignment="center">
          <Heading>{title}</Heading>
          {apiStatus[provider] ? (
            <Badge status="success" icon={CircleTickMajor}>Connecté</Badge>
          ) : (
            <Badge status="critical" icon={CircleAlertMajor}>Non configuré</Badge>
          )}
        </Stack>
        
        <TextContainer>
          <p>{description}</p>
        </TextContainer>
        
        <TextField
          label="Clé API"
          value={settings[`${provider}Key`]}
          onChange={handleChange(`${provider}Key`)}
          type="password"
          autoComplete="off"
          helpText={`Entrez votre clé API ${title}`}
        />
        
        <Button
          onClick={() => testApiKey(provider)}
          loading={loading}
          disabled={!settings[`${provider}Key`]}
        >
          Tester la connexion
        </Button>
      </Stack>
    </Card>
  );

  return (
    <Page
      title="Paramètres"
      subtitle="Configurez ContentAIBoost selon vos besoins"
      primaryAction={{
        content: 'Sauvegarder',
        onAction: saveSettings,
        loading: loading
      }}
    >
      <Layout>
        <Layout.Section>
          <Banner
            title="Configuration requise"
            status="warning"
          >
            <p>
              Vous devez configurer au moins une API d'IA pour utiliser les fonctionnalités d'optimisation automatique.
            </p>
          </Banner>
        </Layout.Section>

        {/* Configuration des APIs */}
        <Layout.Section>
          <TextContainer>
            <Heading>Configuration des APIs d'Intelligence Artificielle</Heading>
          </TextContainer>
          
          <Stack vertical spacing="loose">
            <AIProviderCard
              provider="openai"
              title="OpenAI (GPT-4)"
              description="Utilisez GPT-4 pour des optimisations de haute qualité avec une compréhension contextuelle avancée."
            />
            
            <AIProviderCard
              provider="claude"
              title="Anthropic Claude"
              description="Claude offre des réponses nuancées et créatives, idéal pour du contenu engageant."
            />
            
            <AIProviderCard
              provider="gemini"
              title="Google Gemini"
              description="Gemini Pro pour des optimisations rapides et efficaces avec l'IA de Google."
            />
          </Stack>
        </Layout.Section>

        {/* Préférences d'optimisation */}
        <Layout.Section>
          <Card title="Préférences d'optimisation" sectioned>
            <FormLayout>
              <Select
                label="IA par défaut"
                options={[
                  { label: 'OpenAI GPT-4', value: 'openai' },
                  { label: 'Anthropic Claude', value: 'claude' },
                  { label: 'Google Gemini', value: 'gemini' }
                ]}
                value={settings.defaultAI}
                onChange={handleChange('defaultAI')}
                helpText="Choisissez l'IA à utiliser par défaut pour les optimisations"
              />
              
              <Select
                label="Langue des optimisations"
                options={[
                  { label: 'Français', value: 'fr' },
                  { label: 'English', value: 'en' },
                  { label: 'Español', value: 'es' },
                  { label: 'Deutsch', value: 'de' }
                ]}
                value={settings.language}
                onChange={handleChange('language')}
              />
              
              <Select
                label="Ton du contenu"
                options={[
                  { label: 'Professionnel', value: 'professional' },
                  { label: 'Amical', value: 'friendly' },
                  { label: 'Luxueux', value: 'luxury' },
                  { label: 'Technique', value: 'technical' },
                  { label: 'Décontracté', value: 'casual' }
                ]}
                value={settings.tone}
                onChange={handleChange('tone')}
                helpText="Le ton à adopter pour les descriptions générées"
              />
            </FormLayout>
          </Card>
        </Layout.Section>

        {/* Options automatiques */}
        <Layout.Section secondary>
          <Card title="Automatisation" sectioned>
            <Stack vertical spacing="loose">
              <Checkbox
                label="Optimisation automatique"
                checked={settings.autoOptimize}
                onChange={handleChange('autoOptimize')}
                helpText="Active l'optimisation automatique en arrière-plan"
              />
              
              <Checkbox
                label="Optimiser lors de l'import"
                checked={settings.optimizeOnImport}
                onChange={handleChange('optimizeOnImport')}
                helpText="Optimise automatiquement les nouveaux produits importés"
              />
            </Stack>
          </Card>

          <Card title="Informations" sectioned>
            <Stack vertical spacing="tight">
              <TextContainer>
                <p><strong>Version :</strong> 1.0.0</p>
                <p><strong>Dernière mise à jour :</strong> 22 juin 2025</p>
                <p><strong>Support :</strong> support@contentaiboost.com</p>
              </TextContainer>
            </Stack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}