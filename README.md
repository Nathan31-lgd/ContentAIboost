# ContentAIBoost

Application Shopify pour l'optimisation SEO avec Intelligence Artificielle.

## 🚀 Fonctionnalités

- **Optimisation SEO automatique** avec IA (OpenAI, Claude, Gemini)
- **Dashboard analytics** avec métriques SEO
- **Gestion des produits** et collections Shopify
- **Optimisation en masse** de votre catalogue
- **Interface moderne** avec React + Tailwind CSS

## 🛠️ Technologies

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express
- **Base de données**: PostgreSQL (Supabase)
- **IA**: OpenAI, Anthropic Claude, Google Gemini
- **Déploiement**: Render

## 📦 Installation

### 1. Cloner le repository
```bash
git clone https://github.com/Nathan31-lgd/ContentAIboost.git
cd ContentAIboost
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configuration des variables d'environnement
```bash
cp env.example .env
```

Remplissez le fichier `.env` avec vos clés API.

### 4. Lancer en développement
```bash
npm run dev
```

## 🚀 Déploiement sur Render

1. **Push sur GitHub**
```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

2. **Créer un Web Service sur Render**
- Connectez votre repository GitHub
- Build Command: `npm install && npm run build`
- Start Command: `npm start`

3. **Variables d'environnement**
Ajoutez toutes les variables du fichier `env.example` dans Render.

## 📋 Configuration Shopify

1. **Partner Dashboard**
- App URL: `https://votre-app.onrender.com`
- Callback URL: `https://votre-app.onrender.com/api/auth/callback`

2. **Permissions requises**
- `read_products`, `write_products`
- `read_collections`, `write_collections`
- `read_themes`, `write_themes`

## 🔧 Développement

### Scripts disponibles
```bash
npm run dev          # Développement (frontend + backend)
npm run dev:server   # Backend seulement
npm run dev:client   # Frontend seulement
npm run build        # Build production
npm start            # Démarrer en production
```

### Structure du projet
```
ContentAIboost/
├── client/          # Frontend React
├── server/          # Backend Node.js
├── prisma/          # Schéma base de données
├── shared/          # Types et constantes partagés
└── dist/            # Build de production
```

## 📄 Licence

MIT

## 🤝 Contribution

Les contributions sont les bienvenues ! Ouvrez une issue ou soumettez une pull request.

## 📞 Support

Pour toute question, contactez [votre-email@example.com] 