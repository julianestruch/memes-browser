const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { connectDB, migrateFromSQLite } = require('../config/database');
require('dotenv').config();

/**
 * Script para migrar datos desde SQLite a MongoDB
 */
async function migrateToMongoDB() {
  try {
    console.log('🚀 Iniciando migración de SQLite a MongoDB...');
    
    // Conectar a MongoDB
    await connectDB();
    console.log('✅ Conectado a MongoDB');
    
    // Conectar a SQLite
    const dbPath = path.join(__dirname, '../../data/clipsearch.db');
    const sqliteDb = new sqlite3.Database(dbPath);
    
    console.log('📊 Leyendo datos de SQLite...');
    
    // Leer todos los clips de SQLite
    const sqliteData = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM clips ORDER BY created_at', (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
    
    console.log(`📈 Encontrados ${sqliteData.length} clips en SQLite`);
    
    if (sqliteData.length === 0) {
      console.log('ℹ️ No hay datos para migrar');
      return;
    }
    
    // Migrar datos a MongoDB
    await migrateFromSQLite(sqliteData);
    
    // Cerrar conexión de SQLite
    sqliteDb.close();
    
    console.log('🎉 Migración completada exitosamente!');
    console.log('');
    console.log('📝 Próximos pasos:');
    console.log('   1. Verifica que los datos se migraron correctamente');
    console.log('   2. Prueba las funcionalidades de la aplicación');
    console.log('   3. Una vez confirmado, puedes eliminar el archivo SQLite');
    
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  migrateToMongoDB()
    .then(() => {
      console.log('✅ Script de migración completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script de migración falló:', error);
      process.exit(1);
    });
}

module.exports = { migrateToMongoDB }; 