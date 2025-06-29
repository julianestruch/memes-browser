const { connectDB, testConnection, closeConnection } = require('./mongodb');
const Clip = require('../models/Clip');

// Función para probar la conexión
const testDBConnection = async () => {
  try {
    await testConnection();
    return true;
  } catch (error) {
    console.error('❌ Error probando conexión a MongoDB:', error.message);
    throw error;
  }
};

// Función para obtener todos los clips
const getAllClips = async (limit = 50, skip = 0) => {
  try {
    const clips = await Clip.find()
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    return { rows: clips, rowCount: clips.length };
  } catch (error) {
    console.error('❌ Error obteniendo clips:', error);
    throw error;
  }
};

// Función para obtener un clip por ID
const getClipById = async (id) => {
  try {
    const clip = await Clip.findById(id);
    return clip;
  } catch (error) {
    console.error('❌ Error obteniendo clip por ID:', error);
    throw error;
  }
};

// Función para crear un nuevo clip
const createClip = async (clipData) => {
  try {
    const clip = new Clip(clipData);
    const savedClip = await clip.save();
    return { lastID: savedClip._id, changes: 1 };
  } catch (error) {
    console.error('❌ Error creando clip:', error);
    throw error;
  }
};

// Función para actualizar un clip
const updateClip = async (id, updateData) => {
  try {
    const result = await Clip.findByIdAndUpdate(id, updateData, { new: true });
    return { lastID: result._id, changes: 1 };
  } catch (error) {
    console.error('❌ Error actualizando clip:', error);
    throw error;
  }
};

// Función para eliminar un clip
const deleteClip = async (id) => {
  try {
    const result = await Clip.findByIdAndDelete(id);
    return { lastID: result._id, changes: 1 };
  } catch (error) {
    console.error('❌ Error eliminando clip:', error);
    throw error;
  }
};

// Función para búsqueda por texto
const searchClipsByText = async (query, limit = 10) => {
  try {
    const clips = await Clip.find(
      { $text: { $search: query } },
      { score: { $meta: "textScore" } }
    )
    .sort({ score: { $meta: "textScore" } })
    .limit(parseInt(limit));
    
    return { rows: clips, rowCount: clips.length };
  } catch (error) {
    console.error('❌ Error en búsqueda por texto:', error);
    throw error;
  }
};

// Función para búsqueda por embedding
const searchClipsByEmbedding = async (embedding, limit = 10) => {
  try {
    const clips = await Clip.findByEmbeddingSimilarity(embedding, parseInt(limit));
    return { rows: clips, rowCount: clips.length };
  } catch (error) {
    console.error('❌ Error en búsqueda por embedding:', error);
    throw error;
  }
};

// Función para búsqueda por persona
const searchClipsByPerson = async (person, limit = 10) => {
  try {
    const clips = await Clip.find({
      persons: { $regex: person, $options: 'i' }
    })
    .sort({ created_at: -1 })
    .limit(parseInt(limit));
    
    return { rows: clips, rowCount: clips.length };
  } catch (error) {
    console.error('❌ Error en búsqueda por persona:', error);
    throw error;
  }
};

// Función para obtener estadísticas
const getStats = async () => {
  try {
    const totalClips = await Clip.countDocuments();
    const clipsWithTranscription = await Clip.countDocuments({ combined_text: { $exists: true, $ne: null } });
    const clipsWithEmbedding = await Clip.countDocuments({ embedding: { $exists: true, $ne: null } });
    
    return {
      totalClips,
      clipsWithTranscription,
      clipsWithEmbedding
    };
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    throw error;
  }
};

// Función para migrar datos desde SQLite (si es necesario)
const migrateFromSQLite = async (sqliteData) => {
  try {
    console.log('🔄 Iniciando migración desde SQLite...');
    
    for (const row of sqliteData) {
      const clipData = {
        title: row.title,
        description: row.description,
        file_path: row.file_path,
        thumbnail_path: row.thumbnail_path,
        persons: row.persons,
        created_at: new Date(row.created_at),
        combined_text: row.combined_text,
        video_url: row.video_url,
        cloudinary_public_id: row.cloudinary_public_id,
        duration: row.duration,
        width: row.width,
        height: row.height
      };
      
      // Convertir embedding de string a array si existe
      if (row.embedding) {
        try {
          clipData.embedding = JSON.parse(row.embedding);
        } catch (e) {
          console.warn('⚠️ Error parseando embedding:', e.message);
        }
      }
      
      await Clip.create(clipData);
    }
    
    console.log(`✅ Migración completada: ${sqliteData.length} clips migrados`);
  } catch (error) {
    console.error('❌ Error en migración:', error);
    throw error;
  }
};

module.exports = {
  connectDB,
  testConnection: testDBConnection,
  closeConnection,
  getAllClips,
  getClipById,
  createClip,
  updateClip,
  deleteClip,
  searchClipsByText,
  searchClipsByEmbedding,
  searchClipsByPerson,
  getStats,
  migrateFromSQLite
}; 