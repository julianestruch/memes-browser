const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const fetch = require('node-fetch');

const { transcribeAudio, generateEmbedding } = require('../services/openai');
const { processVideo, isValidVideo, cleanupFile, extractAudio, uploadVideoToCloudinary } = require('../services/videoProcessor');
const cloudinaryService = require('../services/cloudinary');

const router = express.Router();

// Configuración de Multer para subida de archivos
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '../../uploads/videos');
    try {
      await fs.mkdir(uploadsDir, { recursive: true });
      cb(null, uploadsDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
  fileFilter: (req, file, cb) => {
    // Ampliar tipos permitidos
    const allowedTypes = /mp4|avi|mov|mkv|webm|flv|3gp|mpeg|mpg|wmv|ogg|m4v|x-msvideo|quicktime|x-matroska|x-flv|x-ms-wmv|x-msvideo|x-ms-asf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype.toLowerCase());
    console.log('📝 Subida de archivo:', file.originalname, '| MIME:', file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      console.warn('❌ Archivo rechazado por tipo:', file.originalname, '| MIME:', file.mimetype);
      cb(new Error('Solo se permiten archivos de video'));
    }
  }
});

/**
 * POST /api/clips/upload
 * Sube y guarda un clip de video con soporte para Cloudinary
 */
router.post('/upload', upload.single('videoFile'), async (req, res) => {
  const { title, description, persons } = req.body;
  const videoFile = req.file;
  
  try {
    // Validaciones
    if (!videoFile) {
      return res.status(400).json({
        error: 'Archivo de video requerido',
        message: 'Por favor, selecciona un archivo de video'
      });
    }
    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        error: 'Título requerido',
        message: 'El título es obligatorio'
      });
    }
    
    console.log(`🎬 Procesando video: ${videoFile.originalname}`);
    
    // Procesar video (generar thumbnail y obtener info)
    const uploadsDir = path.join(__dirname, '../../uploads');
    const { thumbnailUrl, videoInfo } = await processVideo(videoFile.path, uploadsDir);
    
    // Extraer audio y transcribir ANTES de eliminar el archivo local
    let transcription = '';
    try {
      const audioDir = path.join(__dirname, '../../uploads/audio');
      await fs.mkdir(audioDir, { recursive: true });
      const audioPath = await extractAudio(videoFile.path, audioDir);
      transcription = await transcribeAudio(audioPath);
      await cleanupFile(audioPath);
    } catch (err) {
      console.warn('⚠️ No se pudo transcribir el audio:', err.message);
      transcription = '';
    }

    // Subir video a Cloudinary si está configurado
    let videoUrl = '';
    let cloudinaryPublicId = null;
    let cloudinaryUploadSuccess = false;
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      try {
        console.log('☁️ Subiendo video a Cloudinary...');
        const cloudinaryResult = await uploadVideoToCloudinary(videoFile.path);
        videoUrl = cloudinaryResult.url;
        cloudinaryPublicId = cloudinaryResult.public_id;
        cloudinaryUploadSuccess = true;
        console.log('✅ Video subido a Cloudinary:', videoUrl);
      } catch (cloudinaryError) {
        console.error('❌ Error subiendo video a Cloudinary:', cloudinaryError);
        videoUrl = `/media/videos/${path.basename(videoFile.path)}`;
      }
    } else {
      // Usar almacenamiento local
      videoUrl = `/media/videos/${path.basename(videoFile.path)}`;
    }
    // Limpiar archivo local solo si la subida a Cloudinary fue exitosa
    if (cloudinaryUploadSuccess) {
      try {
        await cleanupFile(videoFile.path);
        console.log('🗑️  Archivo local eliminado tras subida exitosa a Cloudinary');
      } catch (cleanupErr) {
        console.warn('⚠️ No se pudo eliminar archivo local:', cleanupErr.message);
      }
    }

    // Generar embedding combinando todos los campos relevantes
    let embedding = null;
    try {
      const combinedText = [
        title,
        description || '',
        persons || '',
        transcription || ''
      ].join(' ');
      embedding = await generateEmbedding(combinedText);
    } catch (err) {
      console.warn('⚠️ No se pudo generar embedding:', err.message);
      embedding = null;
    }

    // Guardar en MongoDB
    const clipData = {
      title: title.trim(),
      description: description ? description.trim() : null,
      file_path: videoUrl,
      thumbnail_path: thumbnailUrl,
      persons: persons || null,
      combined_text: transcription,
      embedding: embedding,
      video_url: videoUrl,
      cloudinary_public_id: cloudinaryPublicId,
      duration: videoInfo?.duration || null,
      width: videoInfo?.video?.width || null,
      height: videoInfo?.video?.height || null
    };
    
    const Clip = require('../models/Clip');
    const result = await Clip.create(clipData);
    
    res.status(201).json({
      message: 'Clip subido exitosamente',
      clipId: result.lastID,
      status: 'success',
      transcription,
      videoUrl,
      thumbnailUrl,
      cloudinary: !!cloudinaryPublicId
    });
  } catch (error) {
    console.error('❌ Error en upload:', error);
    res.status(500).json({
      error: 'Error procesando el clip',
      message: error.message
    });
  }
});

/**
 * GET /api/clips/search
 * Búsqueda de clips por texto
 */
router.get('/search', async (req, res) => {
  const { q, limit = 10 } = req.query;
  
  try {
    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        error: 'Consulta requerida',
        message: 'Por favor, proporciona un término de búsqueda'
      });
    }

    console.log(`🔍 Búsqueda: "${q}" (límite: ${limit})`);

    // Intentar búsqueda por embedding primero
    let embedding = null;
    try {
      embedding = await generateEmbedding(q);
    } catch (err) {
      console.warn('⚠️ No se pudo generar embedding para búsqueda:', err.message);
    }

    let results = { rows: [], rowCount: 0 };

    if (embedding) {
      // Búsqueda por similitud de embedding
      console.log('🧠 Búsqueda por embedding...');
      results = await Clip.searchClipsByEmbedding(embedding, limit);
    }

    // Si no hay resultados por embedding, buscar por texto
    if (results.rowCount === 0) {
      console.log('📝 Búsqueda por texto...');
      results = await Clip.searchClipsByText(q, limit);
    }

    // Si aún no hay resultados, buscar por persona
    if (results.rowCount === 0) {
      console.log('👤 Búsqueda por persona...');
      results = await Clip.searchClipsByPerson(q, limit);
    }

    console.log(`✅ Búsqueda completada: ${results.rowCount} resultados`);

    res.json({
      clips: results.rows,
      total: results.rowCount,
      query: q,
      searchType: embedding ? 'embedding' : 'text'
    });

  } catch (error) {
    console.error('❌ Error en búsqueda:', error);
    res.status(500).json({
      error: 'Error en la búsqueda',
      message: error.message
    });
  }
});

/**
 * GET /api/clips/recent
 * Obtiene clips recientes (solo aprobados)
 */
router.get('/recent', async (req, res) => {
  const { limit = 12 } = req.query;
  
  try {
    const Clip = require('../models/Clip');
    const clips = await Clip.find({ status: 'approved' })
      .sort({ created_at: -1 })
      .limit(parseInt(limit));
    
    const formattedClips = clips.map(clip => ({
      id: clip._id,
      title: clip.title,
      description: clip.description,
      filePath: clip.video_url || clip.file_path,
      thumbnailPath: clip.thumbnail_path,
      createdAt: clip.created_at,
      persons: clip.persons ? clip.persons.split(',') : [],
      duration: clip.duration,
      width: clip.width,
      height: clip.height
    }));
    
    res.json({
      clips: formattedClips,
      total: formattedClips.length
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo clips recientes:', error);
    res.status(500).json({
      error: 'Error obteniendo clips recientes',
      message: error.message
    });
  }
});

/**
 * GET /api/clips/semantic-search
 * Búsqueda semántica de clips usando IA (solo aprobados)
 */
router.get('/semantic-search', async (req, res) => {
  const { q, limit = 10 } = req.query;
  try {
    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        error: 'Consulta requerida',
        message: 'Por favor, proporciona un término de búsqueda'
      });
    }
    
    // Generar embedding de la consulta
    const queryEmbedding = await generateEmbedding(q.trim());
    
    // Búsqueda por similitud de embedding (solo clips aprobados)
    const Clip = require('../models/Clip');
    const clips = await Clip.find({ 
      status: 'approved',
      embedding: { $exists: true, $ne: null } 
    });
    
    // Calcular similitud coseno para cada clip
    const clipsWithSimilarity = clips.map(clip => {
      if (!clip.embedding || !Array.isArray(clip.embedding)) {
        return { clip, similarity: 0 };
      }
      
      const similarity = cosineSimilarity(queryEmbedding, clip.embedding);
      return { clip, similarity };
    });

    // Ordenar por similitud y devolver los mejores resultados
    const bestClips = clipsWithSimilarity
      .filter(item => item.similarity > 0.1)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, parseInt(limit))
      .map(item => ({
        id: item.clip._id,
        title: item.clip.title,
        description: item.clip.description,
        filePath: item.clip.video_url || item.clip.file_path,
        thumbnailPath: item.clip.thumbnail_path,
        createdAt: item.clip.created_at,
        persons: item.clip.persons ? item.clip.persons.split(',') : [],
        duration: item.clip.duration,
        width: item.clip.width,
        height: item.clip.height,
        similarity: item.similarity
      }));
    
    res.json({
      query: q,
      results: bestClips,
      total: bestClips.length
    });
  } catch (error) {
    console.error('❌ Error en búsqueda semántica:', error);
    res.status(500).json({
      error: 'Error en la búsqueda semántica',
      message: error.message
    });
  }
});

// Función para calcular similitud coseno (copiada del modelo)
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

// DESCARGA SEGURA: /api/clips/download/:id
router.get('/download/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const Clip = require('../models/Clip');
    const clip = await Clip.findById(id);
    if (!clip) {
      return res.status(404).json({ error: 'Clip no encontrado' });
    }
    
    const videoUrl = clip.video_url || clip.file_path;
    
    // Si es Cloudinary, hacer proxy seguro
    if (videoUrl && videoUrl.includes('cloudinary.com')) {
      const response = await fetch(videoUrl);
      if (!response.ok) throw new Error('No se pudo descargar el video de Cloudinary');
      res.setHeader('Content-Disposition', `attachment; filename="clip.mp4"`);
      res.setHeader('Content-Type', 'video/mp4');
      response.body.pipe(res);
      return;
    }
    
    // Si es local
    const videoPath = path.join(__dirname, '../../uploads/videos', path.basename(videoUrl));
    res.download(videoPath, 'clip.mp4', (err) => {
      if (err) {
        res.status(500).json({ error: 'No se pudo descargar el archivo', message: err.message });
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Error en la descarga', message: err.message });
  }
});

// ===== RUTAS DEL PANEL DE ADMINISTRADOR =====

/**
 * GET /api/admin/stats
 * Obtiene estadísticas del panel de administrador
 */
router.get('/admin/stats', async (req, res) => {
  try {
    const Clip = require('../models/Clip');
    const stats = await Clip.getAdminStats();
    
    res.json(stats);
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas de admin:', error);
    res.status(500).json({
      error: 'Error obteniendo estadísticas',
      message: error.message
    });
  }
});

/**
 * GET /api/admin/pending
 * Obtiene clips pendientes de aprobación
 */
router.get('/admin/pending', async (req, res) => {
  const { limit = 20, skip = 0 } = req.query;
  
  try {
    const Clip = require('../models/Clip');
    const clips = await Clip.findPendingClips(parseInt(limit), parseInt(skip));
    
    const formattedClips = clips.map(clip => ({
      id: clip._id,
      title: clip.title,
      description: clip.description,
      filePath: clip.video_url || clip.file_path,
      thumbnailPath: clip.thumbnail_path,
      createdAt: clip.created_at,
      persons: clip.persons ? clip.persons.split(',') : [],
      duration: clip.duration,
      width: clip.width,
      height: clip.height,
      status: clip.status
    }));
    
    res.json({
      clips: formattedClips,
      total: formattedClips.length
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo clips pendientes:', error);
    res.status(500).json({
      error: 'Error obteniendo clips pendientes',
      message: error.message
    });
  }
});

/**
 * POST /api/admin/approve/:id
 * Aprueba un clip
 */
router.post('/admin/approve/:id', async (req, res) => {
  const id = req.params.id;
  const { approvedBy = 'admin' } = req.body;
  
  try {
    const Clip = require('../models/Clip');
    const clip = await Clip.approveClip(id, approvedBy);
    
    if (!clip) {
      return res.status(404).json({ error: 'Clip no encontrado' });
    }
    
    res.json({
      message: 'Clip aprobado correctamente',
      clip: {
        id: clip._id,
        title: clip.title,
        status: clip.status,
        approved_at: clip.approved_at,
        approved_by: clip.approved_by
      }
    });
    
  } catch (error) {
    console.error('❌ Error aprobando clip:', error);
    res.status(500).json({
      error: 'Error aprobando clip',
      message: error.message
    });
  }
});

/**
 * POST /api/admin/reject/:id
 * Rechaza un clip
 */
router.post('/admin/reject/:id', async (req, res) => {
  const id = req.params.id;
  const { rejectedBy = 'admin', reason = 'No cumple con las políticas' } = req.body;
  
  try {
    const Clip = require('../models/Clip');
    const clip = await Clip.rejectClip(id, rejectedBy, reason);
    
    if (!clip) {
      return res.status(404).json({ error: 'Clip no encontrado' });
    }
    
    res.json({
      message: 'Clip rechazado correctamente',
      clip: {
        id: clip._id,
        title: clip.title,
        status: clip.status,
        approved_at: clip.approved_at,
        approved_by: clip.approved_by,
        rejection_reason: clip.rejection_reason
      }
    });
    
  } catch (error) {
    console.error('❌ Error rechazando clip:', error);
    res.status(500).json({
      error: 'Error rechazando clip',
      message: error.message
    });
  }
});

/**
 * DELETE /api/admin/delete/:id
 * Borra un clip permanentemente
 */
router.delete('/admin/delete/:id', async (req, res) => {
  const id = req.params.id;
  
  try {
    const Clip = require('../models/Clip');
    
    // Obtener clip antes de eliminarlo
    const clip = await Clip.findById(id);
    if (!clip) {
      return res.status(404).json({ error: 'Clip no encontrado' });
    }
    
    let cloudinaryError = null;
    
    // Eliminar de Cloudinary si existe public_id
    if (clip.cloudinary_public_id) {
      try {
        // Eliminar video
        await cloudinaryService.deleteFile(clip.cloudinary_public_id, 'video');
        console.log('✅ Eliminado video de Cloudinary:', clip.cloudinary_public_id);
      } catch (err) {
        cloudinaryError = err.message;
        console.warn('⚠️ No se pudo eliminar video de Cloudinary:', err.message);
      }
    }
    
    // Eliminar thumbnail de Cloudinary si la URL es de Cloudinary
    const extractCloudinaryPublicId = (url) => {
      if (!url || !url.includes('cloudinary.com')) return null;
      const matches = url.match(/\/upload\/v\d+\/(.+)\.[a-zA-Z0-9]+$/);
      return matches ? matches[1] : null;
    };
    
    const thumbCloudinaryId = extractCloudinaryPublicId(clip.thumbnail_path);
    if (thumbCloudinaryId) {
      try {
        await cloudinaryService.deleteFile(thumbCloudinaryId, 'image');
        console.log('✅ Eliminado thumbnail de Cloudinary:', thumbCloudinaryId);
      } catch (err) {
        cloudinaryError = (cloudinaryError ? cloudinaryError + ' | ' : '') + err.message;
        console.warn('⚠️ No se pudo eliminar thumbnail de Cloudinary:', err.message);
      }
    }
    
    // Eliminar archivos locales (por compatibilidad)
    const videoPath = path.join(__dirname, '../../uploads/videos', path.basename(clip.file_path));
    const thumbPath = path.join(__dirname, '../../uploads/thumbnails', path.basename(clip.thumbnail_path));
    try { await fs.unlink(videoPath); } catch {}
    try { await fs.unlink(thumbPath); } catch {}
    
    // Eliminar de MongoDB
    await Clip.findByIdAndDelete(id);
    
    res.json({ 
      message: 'Clip borrado permanentemente', 
      cloudinary: cloudinaryError ? `Error: ${cloudinaryError}` : 'ok' 
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al borrar el clip', message: err.message });
  }
});

/**
 * GET /api/admin/all
 * Obtiene todos los clips (pendientes, aprobados y rechazados)
 */
router.get('/admin/all', async (req, res) => {
  const { limit = 50, skip = 0 } = req.query;
  try {
    const Clip = require('../models/Clip');
    const clips = await Clip.find({})
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    const formattedClips = clips.map(clip => ({
      id: clip._id,
      title: clip.title,
      description: clip.description,
      filePath: clip.video_url || clip.file_path,
      thumbnailPath: clip.thumbnail_path,
      createdAt: clip.created_at,
      persons: clip.persons ? clip.persons.split(',') : [],
      duration: clip.duration,
      width: clip.width,
      height: clip.height,
      status: clip.status,
      approved_at: clip.approved_at,
      approved_by: clip.approved_by,
      rejection_reason: clip.rejection_reason
    }));
    res.json({
      clips: formattedClips,
      total: formattedClips.length
    });
  } catch (error) {
    console.error('❌ Error obteniendo todos los clips:', error);
    res.status(500).json({
      error: 'Error obteniendo todos los clips',
      message: error.message
    });
  }
});

module.exports = router;