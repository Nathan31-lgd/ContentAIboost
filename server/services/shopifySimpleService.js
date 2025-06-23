import fetch from 'node-fetch';
import { logger } from '../utils/logger.js';

class ShopifySimpleService {
  // Récupérer les produits directement depuis l'API Shopify
  async getProductsFromShopify(shop, accessToken, options = {}) {
    try {
      const limit = Math.min(parseInt(options.limit) || 50, 250);
      const url = `https://${shop}/admin/api/2025-04/products.json?limit=${limit}`;
      
      const response = await fetch(url, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur API Shopify: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transformer les données pour correspondre au format attendu
      const products = data.products.map(product => ({
        id: product.id.toString(),
        title: product.title,
        description: product.body_html || '',
        handle: product.handle,
        status: product.status,
        image: product.image?.src || product.images?.[0]?.src || null,
        price: product.variants?.[0]?.price || '0',
        seo_score: this.calculateBasicSEOScore(product),
        optimized: false,
        updated_at: product.updated_at,
      }));

      logger.info(`✅ ${products.length} produits récupérés depuis Shopify (API 2025-04)`);
      return products;

    } catch (error) {
      logger.error('Erreur lors de la récupération des produits Shopify:', error);
      throw error;
    }
  }

  // Calculer un score SEO basique
  calculateBasicSEOScore(product) {
    let score = 0;
    
    // Titre (30 points)
    if (product.title) {
      score += 15;
      if (product.title.length >= 30 && product.title.length <= 60) {
        score += 15;
      }
    }

    // Description (40 points)
    if (product.body_html) {
      score += 20;
      const plainText = product.body_html.replace(/<[^>]*>/g, '');
      if (plainText.length >= 150) {
        score += 20;
      }
    }

    // Image (20 points)
    if (product.image) {
      score += 20;
    }

    // Handle/URL (10 points)
    if (product.handle && product.handle.length > 5) {
      score += 10;
    }

    return Math.min(score, 100);
  }

  // Méthode pour récupérer et formater les produits
  async getProducts(shop, accessToken, options = {}) {
    try {
      // Récupérer tous les produits depuis Shopify
      const products = await this.getProductsFromShopify(shop, accessToken);
      
      // Appliquer les filtres
      let filteredProducts = [...products];
      
      // Filtre de recherche
      if (options.search) {
        const searchLower = options.search.toLowerCase();
        filteredProducts = filteredProducts.filter(product =>
          product.title.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower)
        );
      }
      
      // Filtre de statut
      if (options.status) {
        const statusFilters = options.status.split(',');
        if (statusFilters.includes('optimized')) {
          filteredProducts = filteredProducts.filter(product => product.seo_score >= 80);
        }
        if (statusFilters.includes('not_optimized')) {
          filteredProducts = filteredProducts.filter(product => product.seo_score < 80);
        }
      }
      
      // Tri
      const sortField = options.sort || 'title';
      const sortDirection = options.direction || 'asc';
      
      filteredProducts.sort((a, b) => {
        let comparison = 0;
        switch (sortField) {
          case 'price':
            comparison = parseFloat(a.price) - parseFloat(b.price);
            break;
          case 'seo_score':
            comparison = a.seo_score - b.seo_score;
            break;
          case 'updated_at':
            comparison = new Date(a.updated_at) - new Date(b.updated_at);
            break;
          default:
            comparison = a.title.localeCompare(b.title);
            break;
        }
        return sortDirection === 'desc' ? -comparison : comparison;
      });
      
      // Pagination
      const page = parseInt(options.page) || 1;
      const limit = parseInt(options.limit) || 20;
      const startIndex = (page - 1) * limit;
      const paginatedProducts = filteredProducts.slice(startIndex, startIndex + limit);
      
      return {
        products: paginatedProducts,
        total: filteredProducts.length,
        page,
        limit,
        totalPages: Math.ceil(filteredProducts.length / limit),
      };
      
    } catch (error) {
      logger.error('Erreur dans getProducts:', error);
      throw error;
    }
  }

  // Récupérer un produit spécifique
  async getProduct(shop, accessToken, productId) {
    try {
      const url = `https://${shop}/admin/api/2025-04/products/${productId}.json`;
      
      const response = await fetch(url, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Erreur API Shopify: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const product = data.product;
      
      return {
        id: product.id.toString(),
        title: product.title,
        description: product.body_html || '',
        handle: product.handle,
        status: product.status,
        image: product.image?.src || null,
        price: product.variants?.[0]?.price || '0',
        seo_score: this.calculateBasicSEOScore(product),
        seo_title: product.title,
        seo_description: product.body_html ? product.body_html.substring(0, 160) : '',
        optimized: false,
        updated_at: product.updated_at,
      };
      
    } catch (error) {
      logger.error('Erreur lors de la récupération du produit:', error);
      throw error;
    }
  }

  // Récupérer les blogs directement depuis l'API Shopify
  async getBlogsFromShopify(shop, accessToken) {
    try {
      const url = `https://${shop}/admin/api/2025-04/blogs.json`;
      
      const response = await fetch(url, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur API Shopify: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transformer les données pour correspondre au format attendu
      const blogs = data.blogs.map(blog => ({
        id: blog.id.toString(),
        title: blog.title,
        handle: blog.handle,
        created_at: blog.created_at,
        updated_at: blog.updated_at,
        commentable: blog.commentable,
        feedburner: blog.feedburner,
        feedburner_location: blog.feedburner_location,
        tags: blog.tags,
        template_suffix: blog.template_suffix
      }));

      logger.info(`✅ ${blogs.length} blogs récupérés depuis Shopify`);
      return blogs;

    } catch (error) {
      logger.error('Erreur lors de la récupération des blogs Shopify:', error);
      throw error;
    }
  }

  // Récupérer les articles d'un blog
  async getBlogArticlesFromShopify(shop, accessToken, blogId) {
    try {
      const url = `https://${shop}/admin/api/2025-04/blogs/${blogId}/articles.json?limit=50`;
      
      const response = await fetch(url, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur API Shopify: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transformer les données pour correspondre au format attendu
      const articles = data.articles.map(article => ({
        id: article.id.toString(),
        title: article.title,
        author: article.author,
        blog_id: article.blog_id.toString(),
        body_html: article.body_html,
        created_at: article.created_at,
        handle: article.handle,
        published_at: article.published_at,
        summary: article.summary,
        tags: article.tags,
        updated_at: article.updated_at,
        user_id: article.user_id,
        image: article.image?.src || null,
        seo_score: this.calculateBasicSEOScore({
          title: article.title,
          body_html: article.body_html,
          summary: article.summary,
          image: article.image
        }),
        optimized: false
      }));

      logger.info(`✅ ${articles.length} articles récupérés depuis Shopify pour le blog ${blogId}`);
      return articles;

    } catch (error) {
      logger.error('Erreur lors de la récupération des articles de blog Shopify:', error);
      throw error;
    }
  }

  // Méthode pour récupérer et formater les blogs
  async getBlogs(shop, accessToken, options = {}) {
    try {
      // Récupérer tous les blogs depuis Shopify
      const blogs = await this.getBlogsFromShopify(shop, accessToken);
      
      return {
        blogs,
        total: blogs.length,
        page: 1,
        limit: 50,
        totalPages: 1
      };
      
    } catch (error) {
      logger.error('Erreur lors du traitement des blogs:', error);
      throw error;
    }
  }

  // Méthode pour récupérer les articles d'un blog avec options
  async getBlogArticles(shop, accessToken, blogId, options = {}) {
    try {
      // Récupérer tous les articles depuis Shopify
      const articles = await this.getBlogArticlesFromShopify(shop, accessToken, blogId);
      
      // Appliquer les filtres
      let filteredArticles = [...articles];
      
      // Filtre de recherche
      if (options.search) {
        const searchLower = options.search.toLowerCase();
        filteredArticles = filteredArticles.filter(article =>
          article.title.toLowerCase().includes(searchLower) ||
          article.body_html.toLowerCase().includes(searchLower) ||
          article.summary?.toLowerCase().includes(searchLower)
        );
      }
      
      // Tri
      const sortField = options.sort || 'updated_at';
      const sortDirection = options.direction || 'desc';
      
      filteredArticles.sort((a, b) => {
        let comparison = 0;
        switch (sortField) {
          case 'seo_score':
            comparison = a.seo_score - b.seo_score;
            break;
          case 'created_at':
            comparison = new Date(a.created_at) - new Date(b.created_at);
            break;
          case 'published_at':
            comparison = new Date(a.published_at || a.created_at) - new Date(b.published_at || b.created_at);
            break;
          default:
            comparison = new Date(a.updated_at) - new Date(b.updated_at);
            break;
        }
        return sortDirection === 'desc' ? -comparison : comparison;
      });
      
      // Pagination
      const page = parseInt(options.page) || 1;
      const limit = parseInt(options.limit) || 20;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedArticles = filteredArticles.slice(startIndex, endIndex);
      
      return {
        articles: paginatedArticles,
        total: filteredArticles.length,
        page,
        limit,
        totalPages: Math.ceil(filteredArticles.length / limit)
      };
      
    } catch (error) {
      logger.error('Erreur lors du traitement des articles de blog:', error);
      throw error;
    }
  }

  // Récupérer un produit spécifique par son ID
  async getProductById(shop, accessToken, productId) {
    try {
      const url = `https://${shop}/admin/api/2025-04/products/${productId}.json`;
      
      const response = await fetch(url, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Erreur API Shopify: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const product = data.product;
      
      return {
        id: product.id.toString(),
        title: product.title,
        description: product.body_html || '',
        handle: product.handle,
        status: product.status,
        image: product.image?.src || product.images?.[0]?.src || null,
        price: product.variants?.[0]?.price || '0',
        seo_score: this.calculateBasicSEOScore(product),
        seo_title: product.title,
        seo_description: product.body_html ? product.body_html.substring(0, 160) : '',
        optimized: false,
        updated_at: product.updated_at,
      };
      
    } catch (error) {
      logger.error('Erreur lors de la récupération du produit:', error);
      throw error;
    }
  }
}

export default new ShopifySimpleService(); 