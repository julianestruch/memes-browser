const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const cloudinaryService = require('./cloudinary');
require('dotenv').config();

// Configurar FFmpeg path si es necesario
// ffmpeg.setFfmpegPath('/usr/local/bin/ffmpeg');

/**
 * Genera un thumbnail del video
 * @param {string} videoPath - Ruta al archivo de video
 * @param {string} outputPath - Ruta donde guardar el thumbnail
 * @param {number} time - Tiempo en segundos para tomar el frame (default: 1 segundo)
 * @returns {Promise<string>} - Ruta del thumbnail generado
 */
const generateThumbnail = async (videoPath, outputPath, time = 1) => {
  return new Promise((resolve, reject) => {
    console.log(`🖼️  Generando thumbnail de: ${videoPath}`);
    
    ffmpeg(videoPath)
      .screenshots({
        timestamps: [time],
        filename: path.basename(outputPath),
        folder: path.dirname(outputPath),
        size: '320x240'
      })
      .on('end', () => {
        console.log(`✅ Thumbnail generado exitosamente: ${outputPath}`);
        resolve(outputPath);
      })
      .on('error', (err) => {
        console.error(`❌ Error generando thumbnail: ${err.message}`);
        reject(new Error(`Error generando thumbnail: ${err.message}`));
      });
  });
};

/**
 * Obtiene información del video (duración, dimensiones, etc.)
 * @param {string} videoPath - Ruta al archivo de video
 * @returns {Promise<Object>} - Información del video
 */
const getVideoInfo = async (videoPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        console.error(`❌ Error obteniendo información del video: ${err.message}`);
        reject(new Error(`Error obteniendo información del video: ${err.message}`));
        return;
      }
      
      const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
      const audioStream = metadata.streams.find(stream => stream.codec_type === 'audio');
      
      const info = {
        duration: metadata.format.duration,
        size: metadata.format.size,
        bitrate: metadata.format.bit_rate,
        format: metadata.format.format_name,
        video: videoStream ? {
          codec: videoStream.codec_name,
          width: videoStream.width,
          height: videoStream.height,
          fps: eval(videoStream.r_frame_rate)
        } : null,
        audio: audioStream ? {
          codec: audioStream.codec_name,
          channels: audioStream.channels,
          sampleRate: audioStream.sample_rate
        } : null
      };
      
      console.log(`📊 Información del video obtenida: ${JSON.stringify(info, null, 2)}`);
      resolve(info);
    });
  });
};

/**
 * Procesa un video completo: genera thumbnail y sube a Cloudinary
 * @param {string} videoPath - Ruta al archivo de video original
 * @param {string} uploadsDir - Directorio base de uploads
 * @returns {Promise<{thumbnailUrl: string, videoInfo: Object}>} - URLs de Cloudinary e información
 */
const processVideo = async (videoPath, uploadsDir) => {
  try {
    console.log(`🎬 Procesando video: ${videoPath}`);
    // Crear directorio de thumbnails si no existe
    const thumbnailsDir = path.join(uploadsDir, 'thumbnails');
    await fs.mkdir(thumbnailsDir, { recursive: true });
    // Generar nombre único para el thumbnail
    const videoId = uuidv4();
    const localThumbnailPath = path.join(thumbnailsDir, `${videoId}.jpg`);
    // Obtener información del video
    const videoInfo = await getVideoInfo(videoPath);
    // Generar thumbnail
    let thumbnailUrl = '';
    try {
      const generatedThumbnailPath = await generateThumbnail(videoPath, localThumbnailPath, 1);
      // Subir thumbnail a Cloudinary
      if (process.env.CLOUDINARY_CLOUD_NAME) {
        try {
          const thumbnailResult = await cloudinaryService.uploadThumbnail(generatedThumbnailPath);
          thumbnailUrl = thumbnailResult.url;
          // Limpiar archivo local
          await cleanupFile(generatedThumbnailPath);
        } catch (cloudinaryThumbErr) {
          console.error('❌ Error subiendo thumbnail a Cloudinary:', cloudinaryThumbErr);
          thumbnailUrl = `/media/thumbnails/${path.basename(generatedThumbnailPath)}`;
        }
      } else {
        // Fallback a almacenamiento local
        thumbnailUrl = `/media/thumbnails/${path.basename(generatedThumbnailPath)}`;
      }
    } catch (err) {
      console.warn('⚠️ No se pudo generar thumbnail:', err.message);
      thumbnailUrl = '';
    }
    return {
      thumbnailUrl,
      videoInfo
    };
  } catch (error) {
    console.error('❌ Error procesando video:', error);
    throw new Error(`Error procesando video: ${error.message}`);
  }
};

/**
 * Sube un video a Cloudinary
 * @param {string} videoPath - Ruta al archivo de video
 * @returns {Promise<Object>} - Información del video subido
 */
const uploadVideoToCloudinary = async (videoPath) => {
  try {
    console.log(`☁️  Subiendo video a Cloudinary: ${videoPath}`);
    
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      throw new Error('Cloudinary no está configurado');
    }
    
    const result = await cloudinaryService.uploadVideo(videoPath);
    console.log(`✅ Video subido exitosamente a Cloudinary`);
    
    return result;
  } catch (error) {
    console.error('❌ Error subiendo video a Cloudinary:', error);
    throw error;
  }
};

/**
 * Valida si un archivo es un video válido
 * @param {string} filePath - Ruta al archivo
 * @returns {Promise<boolean>} - True si es un video válido
 */
const isValidVideo = async (filePath) => {
  try {
    const info = await getVideoInfo(filePath);
    return info.video !== null;
  } catch (error) {
    return false;
  }
};

/**
 * Limpia archivos temporales
 * @param {string} filePath - Ruta al archivo a eliminar
 */
const cleanupFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
    console.log(`🗑️  Archivo eliminado: ${filePath}`);
  } catch (error) {
    console.warn(`⚠️  No se pudo eliminar archivo: ${filePath}`, error.message);
  }
};

/**
 * Extrae el audio de un video y lo guarda como .mp3
 * @param {string} videoPath - Ruta al archivo de video
 * @param {string} outputDir - Directorio donde guardar el audio
 * @returns {Promise<string>} - Ruta del archivo de audio generado
 */
const extractAudio = async (videoPath, outputDir) => {
  return new Promise((resolve, reject) => {
    const audioId = uuidv4();
    const audioPath = path.join(outputDir, `${audioId}.mp3`);
    ffmpeg(videoPath)
      .noVideo()
      .audioCodec('libmp3lame')
      .audioBitrate('128k')
      .save(audioPath)
      .on('end', () => {
        console.log(`🎵 Audio extraído exitosamente: ${audioPath}`);
        resolve(audioPath);
      })
      .on('error', (err) => {
        console.error(`❌ Error extrayendo audio: ${err.message}`);
        reject(new Error(`Error extrayendo audio: ${err.message}`));
      });
  });
};

module.exports = {
  generateThumbnail,
  getVideoInfo,
  processVideo,
  uploadVideoToCloudinary,
  isValidVideo,
  cleanupFile,
  extractAudio
}; 