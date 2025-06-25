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
  Divider,
  Icon,
  InlineStack,
} from '@shopify/polaris';
import { StarFilledIcon, SparklesIcon } from '@shopify/polaris-icons';
import { api } from '../utils/api';
import toast from 'react-hot-toast';
import { debounce } from 'lodash';

// Calcul du score SEO amélioré
const calculateSeoScore = (product) => {
  if (!product) return 0;
  let score = 0;
  
  // Titre (20 points)
  if (product.title) {
    score += 10;
    if (product.title.length >= 30 && product.title.length <= 60) score += 10;
  }
  
  // Description (20 points)
  if (product.description) {
    score += 10;
    if (product.description.length >= 150 && product.description.length <= 300) score += 10;
  }
  
  // Meta title (20 points)
  if (product.seo_title) {
    score += 10;
    if (product.seo_title.length >= 50 && product.seo_title.length <= 70) score += 10;
  }
  
  // Meta description (20 points)
  if (product.seo_description) {
    score += 10;
    if (product.seo_description.length >= 120 && product.seo_description.length <= 160) score += 10;
  }
  
  // Images (20 points)
  if (product.images && product.images.length > 0) {
    score += 10;
    if (product.images.length >= 3) score += 10;
  }
  
  return Math.min(score, 100);
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [product, setProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [seoScore, setSeoScore] = useState(0);
  const [saving, setSaving] = useState(false);

  // Champs éditables
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  // Références pour le debounce
  const saveTimeoutRef = useRef(null);

  // Charger la liste des produits
  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const response = await api.products.getAll();
      setProducts(response.products || []);
    } catch (e) {
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  // Charger le produit sélectionné
  const loadProduct = useCallback(async () => {
    setLoadingProduct(true);
    try {
      const response = await api.products.getById(id);
      setProduct(response.product);
      setTitle(response.product.title || '');
      setDescription(response.product.description || '');
      setSeoTitle(response.product.seo_title || '');
      setSeoDescription(response.product.seo_description || '');
      setSeoScore(calculateSeoScore(response.product));
    } catch (e) {
      setProduct(null);
    } finally {
      setLoadingProduct(false);
    }
  }, [id]);

  // Fonction de sauvegarde
  const saveProduct = useCallback(async (updatedFields) => {
    if (!product) return;
    
    setSaving(true);
    try {
      const response = await api.products.update(product.id, updatedFields);
      if (response.success) {
        toast.success('Modifications enregistrées', {
          duration: 2000,
          icon: '✅',
        });
        // Mettre à jour le produit local avec la réponse
        setProduct({ ...product, ...updatedFields });
      }
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde', {
        duration: 3000,
        icon: '❌',
      });
    } finally {
      setSaving(false);
    }
  }, [product]);

  // Debounce pour auto-save
  const debouncedSave = useCallback((field, value) => {
    // Annuler le timeout précédent
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Nouveau timeout pour sauvegarder après 1 seconde d'inactivité
    saveTimeoutRef.current = setTimeout(() => {
      saveProduct({ [field]: value });
    }, 1000);
  }, [saveProduct]);

  // Recalculer le score SEO à chaque modification
  useEffect(() => {
    setSeoScore(
      calculateSeoScore({
        ...product,
        title,
        description,
        seo_title: seoTitle,
        seo_description: seoDescription,
      })
    );
  }, [title, description, seoTitle, seoDescription, product]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  // Gestion du clic sur un produit dans la liste
  const handleSelectProduct = (productId) => {
    navigate(`/products/${productId}`);
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
        resourceType: 'product',
        resourceId: product.id,
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
        {/* Liste des produits à gauche */}
        <Layout.Section secondary>
          <Card title="Produits" sectioned>
            {loadingProducts ? (
              <Spinner accessibilityLabel="Chargement des produits" size="large" />
            ) : (
              <ResourceList
                resourceName={{ singular: 'produit', plural: 'produits' }}
                items={products}
                renderItem={(item) => {
                  const { id, title, image, seo_score } = item;
                  const seoInfo = getSEOBadge(seo_score || 0);
                  return (
                    <ResourceItem
                      id={id}
                      onClick={() => handleSelectProduct(id)}
                      accessibilityLabel={`Voir ${title}`}
                    >
                      <Stack alignment="center">
                        <Thumbnail
                          source={image || 'https://via.placeholder.com/50'}
                          alt={title}
                          size="small"
                        />
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

        {/* Centre : édition du produit */}
        <Layout.Section>
          {loadingProduct || !product ? (
            <Card sectioned>
              <Spinner accessibilityLabel="Chargement du produit" size="large" />
            </Card>
          ) : (
            <Card title="Édition du produit" sectioned>
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
                    {(product.images || []).map((img, idx) => (
                      <Thumbnail key={idx} source={img} alt={`Image ${idx + 1}`} size="large" />
                    ))}
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
                {/* Variantes */}
                <div>
                  <Text variant="headingSm">Variantes</Text>
                  <Stack>
                    {(product.variants || []).map((variant, idx) => (
                      <Badge key={idx}>{variant.title}</Badge>
                    ))}
                  </Stack>
                </div>
                {/* Lien du produit */}
                <div>
                  <Text variant="headingSm">Lien du produit</Text>
                  <Link url={product.url} external>
                    {product.url}
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

export default ProductDetail; 