const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Importar configuración de MongoDB
const { connectDB } = require('./config/mongodb');

const app = express();

// Conectar a MongoDB al iniciar el servidor
connectDB()
  .then(() => {
    console.log('✅ Base de datos MongoDB conectada');
  })
  .catch((error) => {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  });

// Configuración de seguridad
app.use(helmet());
app.use(compression());

// Configuración de CORS para producción
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, 'https://your-domain.vercel.app'] // Reemplaza con tu dominio
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana
  message: 'Demasiadas requests desde esta IP'
});
app.use('/api/', limiter);

// Middleware para parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos
app.use('/media', express.static(path.join(__dirname, '../uploads')));

// Importar rutas
const clipsRoutes = require('./routes/clips');

// Usar rutas
app.use('/api/clips', clipsRoutes);

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Ruta para descarga forzada de videos
app.get('/media/download/:filename', (req, res) => {
  const file = req.params.filename;
  const videoPath = path.join(__dirname, '../uploads/videos', file);
  res.download(videoPath, file, (err) => {
    if (err) {
      res.status(404).send('Archivo no encontrado');
    }
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ 
      error: 'Archivo demasiado grande',
      message: 'El archivo excede el tamaño máximo permitido'
    });
  }
  
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
  });
});

// Ruta 404
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    message: 'El endpoint solicitado no existe'
  });
});

// Puerto dinámico para hosting
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`🌍 Modo: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app; 