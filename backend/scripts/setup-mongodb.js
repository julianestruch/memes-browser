const { connectDB, testConnection } = require('../config/database');
const Clip = require('../models/Clip');
require('dotenv').config();

/**
 * Script para configurar MongoDB y crear índices
 */
async function setupMongoDB() {
  try {
    console.log('🚀 Iniciando configuración de MongoDB...');
    
    // Conectar a MongoDB
    await connectDB();
    
    // Probar conexión
    await testConnection();
    
    // Crear índices para optimizar búsquedas
    console.log('🔍 Creando índices...');
    
    // Índice de texto para búsquedas por texto
    await Clip.collection.createIndex(
      { title: 'text', description: 'text', persons: 'text', combined_text: 'text' },
      { name: 'text_search_index' }
    );
    console.log('✅ Índice de texto creado');
    
    // Índice para búsquedas por fecha
    await Clip.collection.createIndex({ created_at: -1 }, { name: 'created_at_index' });
    console.log('✅ Índice de fecha creado');
    
    // Índice para Cloudinary public_id
    await Clip.collection.createIndex({ cloudinary_public_id: 1 }, { name: 'cloudinary_index' });
    console.log('✅ Índice de Cloudinary creado');
    
    // Índice para embedding (si existe)
    await Clip.collection.createIndex({ embedding: 1 }, { name: 'embedding_index' });
    console.log('✅ Índice de embedding creado');
    
    // Índices para el panel de administrador
    await Clip.collection.createIndex({ status: 1 }, { name: 'status_index' });
    console.log('✅ Índice de status creado');
    
    await Clip.collection.createIndex({ status: 1, created_at: -1 }, { name: 'status_created_at_index' });
    console.log('✅ Índice de status y fecha creado');
    
    await Clip.collection.createIndex({ approved_at: -1 }, { name: 'approved_at_index' });
    console.log('✅ Índice de fecha de aprobación creado');
    
    // Verificar que los índices se crearon correctamente
    console.log('🔍 Verificando índices...');
    const indexes = await Clip.collection.indexes();
    console.log('📊 Índices creados:');
    indexes.forEach(index => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
    });
    
    // Contar documentos existentes
    const totalClips = await Clip.countDocuments();
    console.log(`📈 Total de clips en la base de datos: ${totalClips}`);
    
    console.log('🎉 Configuración de MongoDB completada exitosamente!');
    console.log('');
    console.log('📝 Próximos pasos:');
    console.log('   1. Asegúrate de que FFmpeg esté instalado en tu sistema');
    console.log('   2. Configura tu API key de OpenAI en el archivo .env');
    console.log('   3. (Opcional) Configura Cloudinary para almacenamiento en la nube');
    console.log('   4. Ejecuta "npm run dev" para iniciar el servidor');
    
  } catch (error) {
    console.error('❌ Error en la configuración de MongoDB:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  setupMongoDB()
    .then(() => {
      console.log('✅ Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script falló:', error);
      process.exit(1);
    });
}

module.exports = { setupMongoDB }; 