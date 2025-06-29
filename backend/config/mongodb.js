const mongoose = require('mongoose');
require('dotenv').config();

console.log('MONGODB_URI:', process.env.MONGODB_URI);

if (!process.env.MONGODB_URI) {
  console.error('❌ ERROR: La variable MONGODB_URI no está definida.\nAsegúrate de tener un archivo .env en la carpeta backend con la línea correcta.');
  process.exit(1);
}

// Configuración de MongoDB
const MONGODB_URI = process.env.MONGODB_URI;

// Opciones de conexión
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10, // Mantener hasta 10 conexiones en el pool
  serverSelectionTimeoutMS: 5000, // Timeout de 5 segundos
  socketTimeoutMS: 45000, // Timeout de socket de 45 segundos
};

// Función para conectar a MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, options);
    console.log(`✅ Conectado a MongoDB: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};

// Función para probar la conexión
const testConnection = async () => {
  try {
    await mongoose.connection.db.admin().ping();
    console.log('✅ Conexión a MongoDB probada correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error probando conexión a MongoDB:', error.message);
    throw error;
  }
};

// Función para cerrar la conexión
const closeConnection = async () => {
  try {
    await mongoose.connection.close();
    console.log('✅ Conexión a MongoDB cerrada correctamente');
  } catch (error) {
    console.error('❌ Error cerrando conexión a MongoDB:', error.message);
  }
};

// Eventos de conexión
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose conectado a MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Error de conexión de Mongoose:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose desconectado de MongoDB');
});

// Manejo de cierre graceful
process.on('SIGINT', async () => {
  await closeConnection();
  process.exit(0);
});

module.exports = {
  connectDB,
  testConnection,
  closeConnection,
  mongoose
}; 