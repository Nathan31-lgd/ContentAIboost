# 🔧 Guide de résolution : Synchronisation des produits Shopify

## 🚨 Problème identifié
L'application ne peut pas synchroniser les produits car l'authentification Shopify a expiré ou est invalide.

## ✅ Solutions étape par étape

### **Solution 1 : Réinstallation de l'app (Recommandée)**

#### **Étape 1 : Accéder à l'URL d'installation**
```
https://contentaiboost.onrender.com/api/auth/install?shop=contentboostai.myshopify.com
```

#### **Étape 2 : Suivre le processus d'installation**
1. Cliquer sur le lien ci-dessus
2. Se connecter à votre compte Shopify
3. Autoriser l'application avec les permissions demandées
4. Confirmer l'installation

#### **Étape 3 : Vérifier l'installation**
- Aller dans votre Shopify Admin
- Applications > Applications installées
- Vérifier que "ContentAIBoost" est listée et active

### **Solution 2 : Vérification des variables d'environnement**

#### **Variables requises sur Render :**
```bash
SHOPIFY_API_KEY=votre_api_key
SHOPIFY_API_SECRET=votre_api_secret
SHOPIFY_SCOPES=read_products,write_products,read_content,write_content,read_themes,write_themes
SHOPIFY_APP_URL=https://contentaiboost.onrender.com
DATABASE_URL=votre_url_postgresql
```

#### **Vérification dans le Partner Dashboard :**
1. Aller sur https://partners.shopify.com
2. Sélectionner votre app "ContentAIBoost"
3. Vérifier les URLs de redirection :
   - **App URL** : `https://contentaiboost.onrender.com`
   - **Allowed redirection URLs** : 
     - `https://contentaiboost.onrender.com/api/auth/callback`
     - `https://contentaiboost.onrender.com/api/auth/shopify/callback`

### **Solution 3 : Diagnostic automatique**

#### **Lancer le script de diagnostic :**
```bash
node diagnostic-shopify.js contentboostai.myshopify.com
```

#### **Interpréter les résultats :**
- ✅ **Authentification: VALIDE** = App fonctionnelle
- ❌ **Authentification: INVALIDE** = Réinstallation nécessaire
- ✅ **Récupération des produits: SUCCÈS** = Synchronisation OK
- ❌ **Récupération des produits: ÉCHEC** = Problème de permissions

### **Solution 4 : Vérification manuelle**

#### **Test de l'API directement :**
```bash
# Test d'authentification
curl "https://contentaiboost.onrender.com/api/auth/status?shop=contentboostai.myshopify.com"

# Test de récupération des produits
curl "https://contentaiboost.onrender.com/api/products?shop=contentboostai.myshopify.com"

# Test de synchronisation
curl -X POST "https://contentaiboost.onrender.com/api/products/sync?shop=contentboostai.myshopify.com"
```

## 🔍 Causes possibles du problème

### **1. Token d'accès expiré**
- **Cause** : Les tokens Shopify peuvent expirer
- **Solution** : Réinstaller l'app pour obtenir un nouveau token

### **2. App désinstallée**
- **Cause** : L'app a été désinstallée de la boutique
- **Solution** : Réinstaller l'app

### **3. Scopes insuffisants**
- **Cause** : L'app n'a pas les permissions nécessaires
- **Solution** : Vérifier les scopes dans le Partner Dashboard

### **4. Variables d'environnement incorrectes**
- **Cause** : Configuration manquante sur Render
- **Solution** : Vérifier et corriger les variables d'environnement

### **5. Problème de base de données**
- **Cause** : Les tokens ne sont pas persistés correctement
- **Solution** : Vérifier la connexion PostgreSQL sur Render

## 📋 Checklist de résolution

- [ ] **1. Réinstaller l'app** via l'URL d'installation
- [ ] **2. Vérifier les variables d'environnement** sur Render
- [ ] **3. Tester l'authentification** avec le script de diagnostic
- [ ] **4. Vérifier les permissions** dans Shopify Admin
- [ ] **5. Tester la synchronisation** des produits
- [ ] **6. Vérifier les logs** sur Render pour les erreurs

## 🚀 Après résolution

### **Fonctionnalités disponibles :**
- ✅ **Synchronisation automatique** des produits
- ✅ **Affichage des produits** dans l'interface
- ✅ **Optimisation SEO** avec IA
- ✅ **Modification des produits** directement dans l'app
- ✅ **Optimisation en masse** des produits et collections

### **Prochaines étapes :**
1. **Tester la synchronisation** avec quelques produits
2. **Configurer les clés API IA** (OpenAI, Claude, etc.)
3. **Lancer une optimisation** de test
4. **Vérifier les résultats** dans Shopify

## 📞 Support

Si le problème persiste après avoir suivi ce guide :

1. **Vérifier les logs Render** : https://dashboard.render.com
2. **Consulter la documentation Shopify** : https://shopify.dev/docs/api
3. **Vérifier le Partner Dashboard** : https://partners.shopify.com

---

**Note** : Ce guide couvre les problèmes les plus courants de synchronisation. Si le problème persiste, il peut s'agir d'un problème spécifique à votre configuration ou à l'environnement. 