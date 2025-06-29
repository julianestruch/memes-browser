const { connectDB, testConnection } = require('../config/mongodb');
const Clip = require('../models/Clip');
require('dotenv').config();

/**
 * Script para migrar clips existentes al nuevo sistema de aprobación
 * Marca todos los clips existentes como 'approved' para mantener la funcionalidad actual
 */
async function migrateApprovalSystem() {
  try {
    console.log('🚀 Iniciando migración al sistema de aprobación...');
    
    // Conectar a MongoDB
    await connectDB();
    
    // Probar conexión
    await testConnection();
    
    // Contar clips existentes
    const totalClips = await Clip.countDocuments();
    console.log(`📊 Total de clips en la base de datos: ${totalClips}`);
    
    // Contar clips sin status (necesitan migración)
    const clipsWithoutStatus = await Clip.countDocuments({ status: { $exists: false } });
    console.log(`📋 Clips que necesitan migración: ${clipsWithoutStatus}`);
    
    if (clipsWithoutStatus === 0) {
      console.log('✅ Todos los clips ya tienen el campo status configurado');
      return;
    }
    
    // Migrar clips existentes a 'approved'
    console.log('🔄 Migrando clips existentes a estado "approved"...');
    const result = await Clip.updateMany(
      { status: { $exists: false } },
      { 
        $set: { 
          status: 'approved',
          approved_at: new Date(),
          approved_by: 'system_migration'
        }
      }
    );
    
    console.log(`✅ Migración completada: ${result.modifiedCount} clips marcados como aprobados`);
    
    // Verificar el resultado
    const approvedClips = await Clip.countDocuments({ status: 'approved' });
    const pendingClips = await Clip.countDocuments({ status: 'pending' });
    const rejectedClips = await Clip.countDocuments({ status: 'rejected' });
    
    console.log('📊 Estado final de la base de datos:');
    console.log(`  - Aprobados: ${approvedClips}`);
    console.log(`  - Pendientes: ${pendingClips}`);
    console.log(`  - Rechazados: ${rejectedClips}`);
    console.log(`  - Total: ${approvedClips + pendingClips + rejectedClips}`);
    
    console.log('🎉 Migración al sistema de aprobación completada exitosamente!');
    console.log('');
    console.log('📝 Notas importantes:');
    console.log('   - Todos los clips existentes han sido marcados como "approved"');
    console.log('   - Los nuevos clips subidos tendrán estado "pending" por defecto');
    console.log('   - Usa el panel de administrador para aprobar nuevos clips');
    console.log('   - Accede al panel en: http://localhost:3000/admin');
    
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  migrateApprovalSystem()
    .then(() => {
      console.log('✅ Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script falló:', error);
      process.exit(1);
    });
}

module.exports = { migrateApprovalSystem }; 