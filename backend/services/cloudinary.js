const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Función para subir video a Cloudinary
const uploadVideo = async (filePath, options = {}) => {
  try {
    console.log('➡️ [Cloudinary] Intentando subir video:', filePath);
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'video',
      folder: 'clipsearch/videos',
      ...options
    });
    console.log('✅ [Cloudinary] Video subido:', result.secure_url);
    return {
      url: result.secure_url,
      public_id: result.public_id,
      duration: result.duration,
      width: result.width,
      height: result.height,
      format: result.format
    };
  } catch (error) {
    console.error('❌ [Cloudinary] Error subiendo video:', error);
    throw error;
  }
};

// Función para subir thumbnail a Cloudinary
const uploadThumbnail = async (filePath, options = {}) => {
  try {
    console.log('➡️ [Cloudinary] Intentando subir thumbnail:', filePath);
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'image',
      folder: 'clipsearch/thumbnails',
      ...options
    });
    console.log('✅ [Cloudinary] Thumbnail subido:', result.secure_url);
    return {
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format
    };
  } catch (error) {
    console.error('❌ [Cloudinary] Error subiendo thumbnail:', error);
    throw error;
  }
};

// Función para obtener URL de video optimizada
const getVideoUrl = (publicId, options = {}) => {
  const defaultOptions = {
    quality: 'auto',
    fetch_format: 'auto',
    ...options
  };
  
  return cloudinary.url(publicId, {
    resource_type: 'video',
    ...defaultOptions
  });
};

// Función para obtener URL de thumbnail optimizada
const getThumbnailUrl = (publicId, options = {}) => {
  const defaultOptions = {
    quality: 'auto',
    fetch_format: 'auto',
    width: 300,
    height: 200,
    crop: 'fill',
    ...options
  };
  
  return cloudinary.url(publicId, {
    resource_type: 'image',
    ...defaultOptions
  });
};

module.exports = {
  uploadVideo,
  uploadThumbnail,
  getVideoUrl,
  getThumbnailUrl
}; 