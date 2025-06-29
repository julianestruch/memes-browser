#!/usr/bin/env node

/**
 * Script de prueba para verificar la configuración de Cloudinary
 * Ejecuta: node test-cloudinary.js
 */

require('dotenv').config();
const cloudinary = require('./backend/services/cloudinary');

async function testCloudinary() {
  console.log('🧪 Probando configuración de Cloudinary...\n');
  
  // Verificar variables de entorno
  const requiredVars = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY', 
    'CLOUDINARY_API_SECRET'
  ];
  
  console.log('📋 Verificando variables de entorno:');
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (value) {
      console.log(`  ✅ ${varName}: ${value.substring(0, 10)}...`);
    } else {
      console.log(`  ❌ ${varName}: NO CONFIGURADA`);
    }
  }
  
  // Verificar si Cloudinary está configurado
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.log('\n⚠️  Cloudinary no está configurado.');
    console.log('   Para configurarlo:');
    console.log('   1. Ve a https://cloudinary.com');
    console.log('   2. Crea una cuenta gratuita');
    console.log('   3. Copia tus credenciales');
    console.log('   4. Agrégalas a tu archivo .env.local');
    console.log('\n   La aplicación funcionará con almacenamiento local.');
    return;
  }
  
  console.log('\n✅ Cloudinary está configurado correctamente!');
  console.log('\n📊 Información de tu cuenta:');
  console.log(`   Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
  console.log(`   API Key: ${process.env.CLOUDINARY_API_KEY.substring(0, 10)}...`);
  console.log(`   API Secret: ${process.env.CLOUDINARY_API_SECRET.substring(0, 10)}...`);
  
  console.log('\n🎯 Próximos pasos:');
  console.log('   1. Ejecuta: npm run dev');
  console.log('   2. Sube un video desde la interfaz');
  console.log('   3. Verifica que aparezca en tu dashboard de Cloudinary');
  console.log('   4. ¡Listo para el hosting! 🚀');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testCloudinary()
    .then(() => {
      console.log('\n✅ Prueba completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Error en la prueba:', error);
      process.exit(1);
    });
}

module.exports = { testCloudinary }; 