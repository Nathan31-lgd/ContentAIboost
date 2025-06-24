#!/usr/bin/env node

import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const SHOP = process.argv[2] || 'contentboostai.myshopify.com';
const API_URL = process.env.SHOPIFY_APP_URL || 'https://contentaiboost.onrender.com';

async function runDiagnostic() {
  console.log('🔍 Diagnostic Shopify - ContentAIBoost');
  console.log('=====================================\n');
  
  console.log(`📍 Boutique testée: ${SHOP}`);
  console.log(`🌐 URL de l'app: ${API_URL}\n`);
  
  // 1. Vérifier le statut d'authentification
  console.log('1️⃣ Vérification du statut d\'authentification...');
  try {
    const authResponse = await fetch(`${API_URL}/api/auth/status?shop=${SHOP}`);
    const authData = await authResponse.json();
    
    if (authData.authenticated) {
      console.log('✅ Authentification: VALIDE');
      console.log(`   Boutiques enregistrées: ${authData.allShops.join(', ')}`);
    } else {
      console.log('❌ Authentification: INVALIDE');
      console.log(`   Message: ${authData.message || 'Non spécifié'}`);
    }
  } catch (error) {
    console.log('❌ Erreur lors de la vérification d\'authentification:', error.message);
  }
  
  console.log('');
  
  // 2. Tester la récupération des produits
  console.log('2️⃣ Test de récupération des produits...');
  try {
    const productsResponse = await fetch(`${API_URL}/api/products?shop=${SHOP}`);
    const productsData = await productsResponse.json();
    
    if (productsResponse.ok) {
      console.log('✅ Récupération des produits: SUCCÈS');
      console.log(`   Nombre de produits: ${productsData.total || 0}`);
      console.log(`   Source: ${productsData.source || 'Non spécifié'}`);
    } else {
      console.log('❌ Récupération des produits: ÉCHEC');
      console.log(`   Erreur: ${productsData.error || 'Non spécifié'}`);
      console.log(`   Message: ${productsData.message || 'Non spécifié'}`);
      
      if (productsData.requiresReinstall) {
        console.log('🔄 Action requise: Réinstallation de l\'app');
        console.log(`   URL de réinstallation: ${API_URL}${productsData.redirectUrl}`);
      }
    }
  } catch (error) {
    console.log('❌ Erreur lors de la récupération des produits:', error.message);
  }
  
  console.log('');
  
  // 3. Tester la synchronisation
  console.log('3️⃣ Test de synchronisation des produits...');
  try {
    const syncResponse = await fetch(`${API_URL}/api/products/sync?shop=${SHOP}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const syncData = await syncResponse.json();
    
    if (syncResponse.ok) {
      console.log('✅ Synchronisation: SUCCÈS');
      console.log(`   Message: ${syncData.message || 'Non spécifié'}`);
      console.log(`   Nombre de produits: ${syncData.count || 0}`);
    } else {
      console.log('❌ Synchronisation: ÉCHEC');
      console.log(`   Erreur: ${syncData.error || 'Non spécifié'}`);
      console.log(`   Message: ${syncData.message || 'Non spécifié'}`);
      
      if (syncData.requiresReinstall) {
        console.log('🔄 Action requise: Réinstallation de l\'app');
        console.log(`   URL de réinstallation: ${API_URL}${syncData.redirectUrl}`);
      }
    }
  } catch (error) {
    console.log('❌ Erreur lors de la synchronisation:', error.message);
  }
  
  console.log('');
  
  // 4. Vérifier les scopes
  console.log('4️⃣ Vérification des scopes...');
  console.log(`   Scopes configurés: ${process.env.SHOPIFY_SCOPES || 'Non configurés'}`);
  console.log(`   API Version: ${process.env.SHOPIFY_API_VERSION || '2025-04'}`);
  
  console.log('');
  
  // 5. Recommandations
  console.log('📋 Recommandations:');
  console.log('==================');
  
  console.log('1. Si l\'authentification échoue:');
  console.log('   - Vérifier que l\'app est installée sur la boutique');
  console.log('   - Vérifier les variables d\'environnement sur Render');
  console.log('   - Réinstaller l\'app si nécessaire');
  
  console.log('');
  
  console.log('2. Si la récupération des produits échoue:');
  console.log('   - Vérifier que la boutique a des produits');
  console.log('   - Vérifier les scopes (read_products, write_products)');
  console.log('   - Vérifier que le token d\'accès est valide');
  
  console.log('');
  
  console.log('3. Si la synchronisation échoue:');
  console.log('   - Réinstaller l\'app pour obtenir un nouveau token');
  console.log('   - Vérifier les permissions de l\'app dans Shopify Admin');
  console.log('   - Vérifier les logs du serveur pour plus de détails');
  
  console.log('');
  console.log('🔗 Liens utiles:');
  console.log(`   - Dashboard Render: https://dashboard.render.com`);
  console.log(`   - Shopify Partner Dashboard: https://partners.shopify.com`);
  console.log(`   - Documentation Shopify API: https://shopify.dev/docs/api`);
}

runDiagnostic().catch(console.error); 