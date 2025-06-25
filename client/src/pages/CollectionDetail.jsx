import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Page,
  Layout,
  Card,
  Text,
  Button,
  TextField,
  Thumbnail,
  Badge,
  Spinner,
  ResourceList,
  ResourceItem,
  Stack,
  Link,
  Icon,
  Divider,
} from '@shopify/polaris';
import { StarFilledIcon, SparklesIcon, CollectionIcon } from '@shopify/polaris-icons';
import { api } from '../utils/api';
import toast from 'react-hot-toast';
import { debounce } from 'lodash';

// Calcul du score SEO amélioré
const calculateSeoScore = (collection) => {
  if (!collection) return 0;
  let score = 0;
  
  // Titre (25 points)
  if (collection.title) {
    score += 15;
    if (collection.title.length >= 30 && collection.title.length <= 60) score += 10;
  }
  
  // Description (25 points)
  if (collection.description) {
    score += 15;
    if (collection.description.length >= 150 && collection.description.length <= 300) score += 10;
  }
  
  // Meta title (25 points)
  if (collection.seo_title) {
    score += 15;
    if (collection.seo_title.length >= 50 && collection.seo_title.length <= 70) score += 10;
  }
  
  // Meta description (25 points)
  if (collection.seo_description) {
    score += 15;
    if (collection.seo_description.length >= 120 && collection.seo_description.length <= 160) score += 10;
  }
  
  return Math.min(score, 100);
};

const CollectionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [loadingCollections, setLoadingCollections] = useState(true);
  const [collection, setCollection] = useState(null);
  const [loadingCollection, setLoadingCollection] = useState(true);
  const [seoScore, setSeoScore] = useState(0);
  const [saving, setSaving] = useState(false);

  // Champs éditables
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  // Références pour le debounce
  const saveTimeoutRef = useRef(null);

  // Charger la liste des collections
  const loadCollections = useCallback(async () => {
    setLoadingCollections(true);
    try {
      const response = await api.collections.getAll();
      setCollections(response.collections || []);
    } catch (e) {
      setCollections([]);
    } finally {
      setLoadingCollections(false);
    }
  }, []);

  // Charger la collection sélectionnée
  const loadCollection = useCallback(async () => {
    setLoadingCollection(true);
    try {
      const response = await api.collections.getById(id);
      setCollection(response.collection);
      setTitle(response.collection.title || '');
      setDescription(response.collection.description || '');
      setSeoTitle(response.collection.seo_title || '');
      setSeoDescription(response.collection.seo_description || '');
      setSeoScore(calculateSeoScore(response.collection));
    } catch (e) {
      setCollection(null);
    } finally {
      setLoadingCollection(false);
    }
  }, [id]);

  // Fonction de sauvegarde
  const saveCollection = useCallback(async (updatedFields) => {
    if (!collection) return;
    
    setSaving(true);
    try {
      const response = await api.collections.update(collection.id, updatedFields);
      if (response.success) {
        toast.success('Modifications enregistrées', {
          duration: 2000,
          icon: '✅',
        });
        // Mettre à jour la collection locale avec la réponse
        setCollection({ ...collection, ...updatedFields });
      }
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde', {
        duration: 3000,
        icon: '❌',
      });
    } finally {
      setSaving(false);
    }
  }, [collection]);

  // Debounce pour auto-save
  const debouncedSave = useCallback((field, value) => {
    // Annuler le timeout précédent
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Nouveau timeout pour sauvegarder après 1 seconde d'inactivité
    saveTimeoutRef.current = setTimeout(() => {
      saveCollection({ [field]: value });
    }, 1000);
  }, [saveCollection]);

  // Recalculer le score SEO à chaque modification
  useEffect(() => {
    setSeoScore(
      calculateSeoScore({
        ...collection,
        title,
        description,
        seo_title: seoTitle,
        seo_description: seoDescription,
      })
    );
  }, [title, description, seoTitle, seoDescription, collection]);

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  useEffect(() => {
    loadCollection();
  }, [loadCollection]);

  // Gestion du clic sur une collection dans la liste
  const handleSelectCollection = (collectionId) => {
    navigate(`/collections/${collectionId}`);
  };

  // Gestionnaires de changement avec auto-save
  const handleTitleChange = (value) => {
    setTitle(value);
    debouncedSave('title', value);
  };

  const handleDescriptionChange = (value) => {
    setDescription(value);
    debouncedSave('description', value);
  };

  const handleSeoTitleChange = (value) => {
    setSeoTitle(value);
    debouncedSave('seo_title', value);
  };

  const handleSeoDescriptionChange = (value) => {
    setSeoDescription(value);
    debouncedSave('seo_description', value);
  };

  // Appel IA
  const handleMagicAI = async (field) => {
    toast.loading('Génération en cours...', { id: 'ai-generation' });
    
    try {
      const response = await api.ai.generateSuggestion({
        resourceType: 'collection',
        resourceId: collection.id,
        field: field,
        context: {
          title,
          description,
          seo_title: seoTitle,
          seo_description: seoDescription,
        }
      });
      
      toast.dismiss('ai-generation');
      
      if (response.suggestion) {
        // Appliquer la suggestion
        switch (field) {
          case 'title':
            handleTitleChange(response.suggestion);
            break;
          case 'description':
            handleDescriptionChange(response.suggestion);
            break;
          case 'seo_title':
            handleSeoTitleChange(response.suggestion);
            break;
          case 'seo_description':
            handleSeoDescriptionChange(response.suggestion);
            break;
        }
        toast.success('Suggestion appliquée !');
      }
    } catch (error) {
      toast.dismiss('ai-generation');
      toast.error('Erreur lors de la génération IA');
    }
  };

  // Badge SEO avec indication détaillée
  const getSEOBadge = (score) => {
    if (score >= 80) {
      return { tone: 'success', label: `${score}/100` };
    } else if (score >= 60) {
      return { tone: 'warning', label: `${score}/100` };
    } else {
      return { tone: 'critical', label: `${score}/100` };
    }
  };

  return (
    <Page fullWidth>
      <Layout>
        {/* Liste des collections à gauche */}
        <Layout.Section secondary>
          <Card title="Collections" sectioned>
            {loadingCollections ? (
              <Spinner accessibilityLabel="Chargement des collections" size="large" />
            ) : (
              <ResourceList
                resourceName={{ singular: 'collection', plural: 'collections' }}
                items={collections}
                renderItem={(item) => {
                  const { id, title, image, seo_score } = item;
                  const seoInfo = getSEOBadge(seo_score || 0);
                  return (
                    <ResourceItem
                      id={id}
                      onClick={() => handleSelectCollection(id)}
                      accessibilityLabel={`Voir ${title}`}
                    >
                      <Stack alignment="center">
                        <Thumbnail
                          source={image || 'https://via.placeholder.com/50'}
                          alt={title}
                          size="small"
                        >
                          <Icon source={CollectionIcon} />
                        </Thumbnail>
                        <div style={{ flex: 1 }}>
                          <Text variant="bodyMd" fontWeight="semibold">{title}</Text>
                        </div>
                        <Badge tone={seoInfo.tone}>{seoInfo.label}</Badge>
                      </Stack>
                    </ResourceItem>
                  );
                }}
              />
            )}
          </Card>
        </Layout.Section>

        {/* Centre : édition de la collection */}
        <Layout.Section>
          {loadingCollection || !collection ? (
            <Card sectioned>
              <Spinner accessibilityLabel="Chargement de la collection" size="large" />
            </Card>
          ) : (
            <Card title="Édition de la collection" sectioned>
              {saving && (
                <div style={{ position: 'absolute', top: 10, right: 10 }}>
                  <Badge tone="info">Sauvegarde...</Badge>
                </div>
              )}
              <Stack vertical gap="400">
                {/* Titre + bouton IA */}
                <Stack alignment="center">
                  <TextField
                    label="Titre"
                    value={title}
                    onChange={handleTitleChange}
                    autoComplete="off"
                    helpText={`${title.length} caractères (idéal: 30-60)`}
                  />
                  <Button icon={SparklesIcon} onClick={() => handleMagicAI('title')}>
                    Magique IA
                  </Button>
                </Stack>
                {/* Description + bouton IA */}
                <Stack alignment="center">
                  <TextField
                    label="Description"
                    value={description}
                    onChange={handleDescriptionChange}
                    multiline={4}
                    helpText={`${description.length} caractères (idéal: 150-300)`}
                  />
                  <Button icon={SparklesIcon} onClick={() => handleMagicAI('description')}>
                    Magique IA
                  </Button>
                </Stack>
                {/* Images */}
                <div>
                  <Text variant="headingSm">Images</Text>
                  <Stack>
                    {collection.image ? (
                      <Thumbnail source={collection.image} alt="Image principale" size="large" />
                    ) : null}
                  </Stack>
                </div>
                {/* Meta title + bouton IA */}
                <Stack alignment="center">
                  <TextField
                    label="Meta title"
                    value={seoTitle}
                    onChange={handleSeoTitleChange}
                    helpText={`${seoTitle.length} caractères (idéal: 50-70)`}
                  />
                  <Button icon={SparklesIcon} onClick={() => handleMagicAI('seo_title')}>
                    Magique IA
                  </Button>
                </Stack>
                {/* Meta description + bouton IA */}
                <Stack alignment="center">
                  <TextField
                    label="Meta description"
                    value={seoDescription}
                    onChange={handleSeoDescriptionChange}
                    multiline={2}
                    helpText={`${seoDescription.length} caractères (idéal: 120-160)`}
                  />
                  <Button icon={SparklesIcon} onClick={() => handleMagicAI('seo_description')}>
                    Magique IA
                  </Button>
                </Stack>
                {/* Lien de la collection */}
                <div>
                  <Text variant="headingSm">Lien de la collection</Text>
                  <Link url={collection.url} external>
                    {collection.url}
                  </Link>
                </div>
              </Stack>
            </Card>
          )}
        </Layout.Section>

        {/* Score SEO en haut à droite */}
        <Layout.Section secondary>
          <Card title="Score SEO" sectioned>
            <Stack alignment="center" distribution="center">
              <Icon source={StarFilledIcon} color="highlight" />
              <Text variant="headingLg" fontWeight="bold">
                {seoScore}/100
              </Text>
            </Stack>
            <Divider />
            <Stack vertical gap="200">
              <Text variant="bodySm" tone={title.length >= 30 && title.length <= 60 ? 'success' : 'critical'}>
                ✓ Titre : {title.length >= 30 && title.length <= 60 ? 'Optimal' : 'À améliorer'}
              </Text>
              <Text variant="bodySm" tone={description.length >= 150 && description.length <= 300 ? 'success' : 'critical'}>
                ✓ Description : {description.length >= 150 && description.length <= 300 ? 'Optimal' : 'À améliorer'}
              </Text>
              <Text variant="bodySm" tone={seoTitle.length >= 50 && seoTitle.length <= 70 ? 'success' : 'critical'}>
                ✓ Meta title : {seoTitle.length >= 50 && seoTitle.length <= 70 ? 'Optimal' : 'À améliorer'}
              </Text>
              <Text variant="bodySm" tone={seoDescription.length >= 120 && seoDescription.length <= 160 ? 'success' : 'critical'}>
                ✓ Meta description : {seoDescription.length >= 120 && seoDescription.length <= 160 ? 'Optimal' : 'À améliorer'}
              </Text>
            </Stack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default CollectionDetail; 