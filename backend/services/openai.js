// Archivo deshabilitado temporalmente. No se usa OpenAI ni Whisper en el MVP local. 

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
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY no configurada');

  const formData = new FormData();
  formData.append('file', fs.createReadStream(audioPath));
  formData.append('model', 'whisper-1');
  // formData.append('language', 'es'); // Eliminar o comentar para autodetección
  formData.append('response_format', 'text');

  const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
    headers: {
      ...formData.getHeaders(),
      'Authorization': `Bearer ${apiKey}`,
    },
    maxBodyLength: Infinity,
    timeout: 120000 // 2 minutos
  });

  return response.data;
}

/**
 * Genera un embedding vectorial para un texto usando OpenAI
 * @param {string} text - Texto a embebir
 * @returns {Promise<number[]>} - Vector de embedding
 */
async function generateEmbedding(text) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY no configurada');

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
  return response.data.data[0].embedding;
}

module.exports = {
  transcribeAudio,
  generateEmbedding
}; 