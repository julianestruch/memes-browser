// Servicio de OpenAI para transcripciones y embeddings

const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
require('dotenv').config();

/**
 * Transcribe un archivo de audio usando OpenAI Whisper
 * @param {string} audioPath - Ruta al archivo de audio
 * @returns {Promise<string>} - Transcripción generada
 */
async function transcribeAudio(audioPath) {
  console.log(`🎤 Iniciando transcripción con Whisper: ${audioPath}`);
  
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY no configurada');
    throw new Error('OPENAI_API_KEY no configurada');
  }

  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(audioPath));
    formData.append('model', 'whisper-1');
    // formData.append('language', 'es'); // Eliminar o comentar para autodetección
    formData.append('response_format', 'text');

    console.log('📤 Enviando archivo a OpenAI Whisper...');
    
    const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${apiKey}`,
      },
      maxBodyLength: Infinity,
      timeout: 300000 // 5 minutos para videos más largos
    });

    console.log('✅ Transcripción completada:', response.data.substring(0, 100) + '...');
    return response.data;
  } catch (error) {
    console.error('❌ Error en transcripción Whisper:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Genera un embedding vectorial para un texto usando OpenAI
 * @param {string} text - Texto a embebir
 * @returns {Promise<number[]>} - Vector de embedding
 */
async function generateEmbedding(text) {
  console.log(`🧠 Generando embedding para texto: ${text.substring(0, 50)}...`);
  
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY no configurada');
    throw new Error('OPENAI_API_KEY no configurada');
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/embeddings',
      {
        input: text,
        model: 'text-embedding-3-small'
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );
    
    console.log('✅ Embedding generado exitosamente');
    return response.data.data[0].embedding;
  } catch (error) {
    console.error('❌ Error generando embedding:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = {
  transcribeAudio,
  generateEmbedding
}; 