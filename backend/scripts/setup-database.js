const { query, run, testConnection } = require('../config/database');
require('dotenv').config();

/**
 * Script para configurar la base de datos SQLite
 * Crea la tabla clips con soporte para búsquedas de texto y Cloudinary
 */
async function setupDatabase() {
  try {
    console.log('🚀 Iniciando configuración de la base de datos SQLite...');
    
    // Probar conexión
    await testConnection();
    
    // Crear tabla clips
    console.log('📋 Creando tabla clips...');
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS clips (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        file_path TEXT NOT NULL,
        thumbnail_path TEXT NOT NULL,
        persons TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        combined_text TEXT,
        embedding TEXT,
        video_url TEXT,
        cloudinary_public_id TEXT,
        duration REAL,
        width INTEGER,
        height INTEGER
      )
    `;
    
    await run(createTableQuery);
    console.log('✅ Tabla clips creada/verificada');
    
    // Crear índices para optimizar búsquedas
    console.log('🔍 Creando índices...');
    
    // Índice para búsquedas por fecha
    await run(`
      CREATE INDEX IF NOT EXISTS idx_clips_created_at 
      ON clips (created_at DESC)
    `);
    console.log('✅ Índice de fecha creado');
    
    // Índice para búsquedas por título
    await run(`
      CREATE INDEX IF NOT EXISTS idx_clips_title 
      ON clips (title)
    `);
    console.log('✅ Índice de título creado');
    
    // Índice para búsquedas de texto completo
    await run(`
      CREATE INDEX IF NOT EXISTS idx_clips_combined_text 
      ON clips (combined_text)
    `);
    console.log('✅ Índice de texto combinado creado');
    
    // Índice para Cloudinary public_id
    await run(`
      CREATE INDEX IF NOT EXISTS idx_clips_cloudinary_id 
      ON clips (cloudinary_public_id)
    `);
    console.log('✅ Índice de Cloudinary creado');
    
    // Verificar que la tabla existe y tiene la estructura correcta
    console.log('🔍 Verificando estructura de la tabla...');
    const tableInfo = await query(`
      PRAGMA table_info(clips)
    `);
    
    console.log('📊 Estructura de la tabla clips:');
    tableInfo.rows.forEach(row => {
      console.log(`  - ${row.name}: ${row.type} ${row.notnull ? '(NOT NULL)' : ''}`);
    });
    
    // Agregar columnas nuevas si no existen
    const columns = tableInfo.rows.map(row => row.name);
    const newColumns = [
      { name: 'embedding', type: 'TEXT' },
      { name: 'video_url', type: 'TEXT' },
      { name: 'cloudinary_public_id', type: 'TEXT' },
      { name: 'duration', type: 'REAL' },
      { name: 'width', type: 'INTEGER' },
      { name: 'height', type: 'INTEGER' }
    ];
    
    for (const column of newColumns) {
      if (!columns.includes(column.name)) {
        console.log(`🆕 Agregando columna ${column.name} a la tabla clips...`);
        await run(`ALTER TABLE clips ADD COLUMN ${column.name} ${column.type}`);
        console.log(`✅ Columna ${column.name} agregada`);
      }
    }
    
    // Contar registros existentes
    const countResult = await query('SELECT COUNT(*) as total FROM clips');
    console.log(`📈 Total de clips en la base de datos: ${countResult.rows[0].total}`);
    
    console.log('🎉 Configuración de la base de datos completada exitosamente!');
    console.log('');
    console.log('📝 Próximos pasos:');
    console.log('   1. Asegúrate de que FFmpeg esté instalado en tu sistema');
    console.log('   2. Configura tu API key de OpenAI en el archivo .env.local');
    console.log('   3. (Opcional) Configura Cloudinary para almacenamiento en la nube');
    console.log('   4. Ejecuta "npm run dev" para iniciar el servidor');
    
  } catch (error) {
    console.error('❌ Error en la configuración de la base de datos:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('✅ Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script falló:', error);
      process.exit(1);
    });
}

module.exports = { setupDatabase }; 