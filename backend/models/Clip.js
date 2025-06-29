const mongoose = require('mongoose');

const clipSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  file_path: {
    type: String,
    required: true
  },
  thumbnail_path: {
    type: String,
    required: true
  },
  persons: {
    type: String,
    trim: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  combined_text: {
    type: String
  },
  embedding: {
    type: [Number] // Array de números para el embedding
  },
  video_url: {
    type: String
  },
  cloudinary_public_id: {
    type: String
  },
  duration: {
    type: Number
  },
  width: {
    type: Number
  },
  height: {
    type: Number
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approved_at: {
    type: Date
  },
  approved_by: {
    type: String
  },
  rejection_reason: {
    type: String
  }
}, {
  timestamps: true // Agrega createdAt y updatedAt automáticamente
});

// Índices para optimizar búsquedas
clipSchema.index({ title: 'text', description: 'text', persons: 'text', combined_text: 'text' });
clipSchema.index({ created_at: -1 });
clipSchema.index({ cloudinary_public_id: 1 });
clipSchema.index({ status: 1 });
clipSchema.index({ status: 1, created_at: -1 });
clipSchema.index({ approved_at: -1 });

// Método estático para búsqueda por similitud de embedding
clipSchema.statics.findByEmbeddingSimilarity = async function(queryEmbedding, limit = 10) {
  if (!queryEmbedding || !Array.isArray(queryEmbedding)) {
    return [];
  }

  const clips = await this.find({ embedding: { $exists: true, $ne: null } });
  
  // Calcular similitud coseno para cada clip
  const clipsWithSimilarity = clips.map(clip => {
    if (!clip.embedding || !Array.isArray(clip.embedding)) {
      return { clip, similarity: 0 };
    }
    
    const similarity = cosineSimilarity(queryEmbedding, clip.embedding);
    return { clip, similarity };
  });

  // Ordenar por similitud y devolver los mejores resultados
  return clipsWithSimilarity
    .filter(item => item.similarity > 0.1) // Filtrar resultados con baja similitud
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
    .map(item => item.clip);
};

// Método estático para obtener clips pendientes de aprobación
clipSchema.statics.findPendingClips = async function(limit = 50, skip = 0) {
  return this.find({ status: 'pending' })
    .sort({ created_at: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(skip));
};

// Método estático para aprobar un clip
clipSchema.statics.approveClip = async function(clipId, approvedBy) {
  return this.findByIdAndUpdate(clipId, {
    status: 'approved',
    approved_at: new Date(),
    approved_by: approvedBy
  }, { new: true });
};

// Método estático para rechazar un clip
clipSchema.statics.rejectClip = async function(clipId, rejectedBy, reason) {
  return this.findByIdAndUpdate(clipId, {
    status: 'rejected',
    approved_at: new Date(),
    approved_by: rejectedBy,
    rejection_reason: reason
  }, { new: true });
};

// Método estático para obtener estadísticas de administrador
clipSchema.statics.getAdminStats = async function() {
  const [pending, approved, rejected, total] = await Promise.all([
    this.countDocuments({ status: 'pending' }),
    this.countDocuments({ status: 'approved' }),
    this.countDocuments({ status: 'rejected' }),
    this.countDocuments()
  ]);

  return {
    pending,
    approved,
    rejected,
    total
  };
};

// Función para calcular similitud coseno
function cosineSimilarity(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
    return 0;
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

module.exports = mongoose.model('Clip', clipSchema); 