import { GraphqlQueryError } from '@shopify/shopify-api';
import { getShopifyAPI } from '../config/shopify.js';
import prisma from '../config/prisma.js';
import { logger } from '../utils/logger.js';

class ShopifyService {
  constructor() {
    this.shopify = null;
  }

  async initialize() {
    try {
      this.shopify = getShopifyAPI();
    } catch (error) {
      logger.error('Erreur lors de l\'initialisation du service Shopify:', error);
    }
  }

  // Créer un client GraphQL pour une boutique
  async getGraphQLClient(shop, accessToken) {
    if (!this.shopify) {
      throw new Error('Service Shopify non initialisé');
    }

    const session = {
      shop,
      accessToken,
      state: 'active',
      isOnline: true,
      scope: process.env.SHOPIFY_SCOPES,
    };

    return new this.shopify.clients.Graphql({ session });
  }

  // Synchroniser les produits depuis Shopify
  async syncProducts(shop, accessToken) {
    try {
      const client = await this.getGraphQLClient(shop, accessToken);
      
      // Requête GraphQL pour récupérer les produits
      const query = `
        query getProducts($first: Int!, $after: String) {
          products(first: $first, after: $after) {
            edges {
              node {
                id
                title
                description
                handle
                status
                featuredImage {
                  url
                }
                variants(first: 1) {
                  edges {
                    node {
                      price
                    }
                  }
                }
                seo {
                  title
                  description
                }
                updatedAt
              }
              cursor
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      `;

      let hasNextPage = true;
      let cursor = null;
      const allProducts = [];

      // Paginer à travers tous les produits
      while (hasNextPage) {
        const response = await client.query({
          data: {
            query,
            variables: {
              first: 50,
              after: cursor,
            },
          },
        });

        const products = response.body.data.products;
        allProducts.push(...products.edges.map(edge => edge.node));
        
        hasNextPage = products.pageInfo.hasNextPage;
        cursor = products.pageInfo.endCursor;
      }

      // Sauvegarder les produits en base de données
      const savedProducts = [];
      for (const product of allProducts) {
        const savedProduct = await this.saveProduct(shop, product);
        savedProducts.push(savedProduct);
      }

      logger.info(`✅ ${savedProducts.length} produits synchronisés pour ${shop}`);
      return savedProducts;

    } catch (error) {
      logger.error('Erreur lors de la synchronisation des produits:', error);
      throw error;
    }
  }

  // Sauvegarder un produit en base de données
  async saveProduct(shop, productData) {
    try {
      // Extraire l'ID numérique depuis l'ID GraphQL
      const shopifyId = productData.id.split('/').pop();
      
      // Calculer un score SEO basique
      const seoScore = this.calculateBasicSEOScore(productData);

      const product = await prisma.product.upsert({
        where: {
          shopifyId_shopDomain: {
            shopifyId: shopifyId,
            shopDomain: shop,
          },
        },
        update: {
          title: productData.title,
          description: productData.description || '',
          handle: productData.handle,
          status: productData.status,
          imageUrl: productData.featuredImage?.url || null,
          price: productData.variants?.edges[0]?.node?.price || '0',
          seoTitle: productData.seo?.title || productData.title,
          seoDescription: productData.seo?.description || productData.description || '',
          seoScore: seoScore,
          shopifyUpdatedAt: new Date(productData.updatedAt),
          lastSyncedAt: new Date(),
        },
        create: {
          shopifyId: shopifyId,
          shopDomain: shop,
          title: productData.title,
          description: productData.description || '',
          handle: productData.handle,
          status: productData.status,
          imageUrl: productData.featuredImage?.url || null,
          price: productData.variants?.edges[0]?.node?.price || '0',
          seoTitle: productData.seo?.title || productData.title,
          seoDescription: productData.seo?.description || productData.description || '',
          seoScore: seoScore,
          shopifyUpdatedAt: new Date(productData.updatedAt),
          lastSyncedAt: new Date(),
        },
      });

      return product;
    } catch (error) {
      logger.error('Erreur lors de la sauvegarde du produit:', error);
      throw error;
    }
  }

  // Calculer un score SEO basique
  calculateBasicSEOScore(product) {
    let score = 0;
    
    // Titre (20 points)
    if (product.title) {
      score += 10;
      if (product.title.length >= 30 && product.title.length <= 60) {
        score += 10;
      }
    }

    // Description (30 points)
    if (product.description) {
      score += 15;
      if (product.description.length >= 150) {
        score += 15;
      }
    }

    // SEO Title (20 points)
    if (product.seo?.title && product.seo.title !== product.title) {
      score += 20;
    }

    // SEO Description (20 points)
    if (product.seo?.description && product.seo.description !== product.description) {
      score += 20;
    }

    // Image (10 points)
    if (product.featuredImage?.url) {
      score += 10;
    }

    return Math.min(score, 100);
  }

  // Récupérer les produits depuis la base de données
  async getProducts(shop, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        search = '',
        status = '',
        sort = 'title',
        direction = 'asc',
      } = options;

      const where = {
        shopDomain: shop,
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(status && { status }),
      };

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          orderBy: { [sort]: direction },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.product.count({ where }),
      ]);

      return {
        products: products.map(p => ({
          id: p.shopifyId,
          title: p.title,
          description: p.description,
          price: p.price,
          image: p.imageUrl,
          seo_score: p.seoScore,
          status: p.status.toLowerCase(),
          optimized: p.seoScore >= 80,
          updated_at: p.updatedAt.toISOString(),
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error('Erreur lors de la récupération des produits:', error);
      throw error;
    }
  }

  // Récupérer un produit spécifique
  async getProduct(shop, productId) {
    try {
      const product = await prisma.product.findFirst({
        where: {
          shopifyId: productId,
          shopDomain: shop,
        },
      });

      if (!product) {
        throw new Error('Produit non trouvé');
      }

      return {
        id: product.shopifyId,
        title: product.title,
        description: product.description,
        price: product.price,
        image: product.imageUrl,
        seo_score: product.seoScore,
        seo_title: product.seoTitle,
        seo_description: product.seoDescription,
        status: product.status.toLowerCase(),
        optimized: product.seoScore >= 80,
        updated_at: product.updatedAt.toISOString(),
      };
    } catch (error) {
      logger.error('Erreur lors de la récupération du produit:', error);
      throw error;
    }
  }
}

export default new ShopifyService(); 