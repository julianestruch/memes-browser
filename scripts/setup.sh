#!/bin/bash

# Script de configuración para ClipSearch
echo "🚀 Configurando ClipSearch..."

# Verificar que Node.js esté instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor, instala Node.js 18+ primero."
    exit 1
fi

# Verificar que npm esté instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado. Por favor, instala npm primero."
    exit 1
fi

# Verificar que FFmpeg esté instalado
if ! command -v ffmpeg &> /dev/null; then
    echo "⚠️  FFmpeg no está instalado. Por favor, instala FFmpeg para el procesamiento de video."
    echo "   - Windows: https://ffmpeg.org/download.html"
    echo "   - macOS: brew install ffmpeg"
    echo "   - Ubuntu: sudo apt install ffmpeg"
fi

# Verificar que PostgreSQL esté instalado
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL no está instalado. Por favor, instala PostgreSQL 14+ con pgvector."
    echo "   - https://github.com/pgvector/pgvector"
fi

echo "📦 Instalando dependencias..."

# Instalar dependencias del proyecto principal
npm install

# Instalar dependencias del frontend
cd frontend
npm install
cd ..

# Instalar dependencias del backend
cd backend
npm install
cd ..

# Crear directorios necesarios
mkdir -p uploads/videos
mkdir -p uploads/thumbnails
mkdir -p uploads/audio

echo "✅ Dependencias instaladas correctamente"

# Verificar archivo de configuración
if [ ! -f ".env.local" ]; then
    echo "📝 Creando archivo de configuración..."
    cp env.example .env.local
    echo "⚠️  Por favor, edita el archivo .env.local con tus credenciales:"
    echo "   - DATABASE_URL: URL de tu base de datos PostgreSQL"
    echo "   - OPENAI_API_KEY: Tu API key de OpenAI"
    echo "   - Otras configuraciones según necesites"
else
    echo "✅ Archivo de configuración .env.local ya existe"
fi

echo ""
echo "🎉 Configuración completada!"
echo ""
echo "📝 Próximos pasos:"
echo "   1. Configura tu archivo .env.local con las credenciales correctas"
echo "   2. Ejecuta 'npm run setup:db' para configurar la base de datos"
echo "   3. Ejecuta 'npm run dev' para iniciar el servidor"
echo ""
echo "🌐 El frontend estará disponible en: http://localhost:3000"
echo "📡 El backend estará disponible en: http://localhost:3001" 