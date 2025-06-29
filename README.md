# ClipSearch 🎬

Una plataforma de búsqueda de clips de video que permite encontrar contenido basado en transcripciones automáticas y búsquedas de texto inteligentes.

## 🚀 Características

- **Subida de clips**: Sube videos y obtén transcripciones automáticas con Whisper
- **Búsqueda de texto**: Encuentra clips usando búsquedas de texto en título, descripción y transcripción
- **Procesamiento automático**: Generación automática de thumbnails y transcripciones
- **Interfaz moderna**: Diseño responsive con Next.js y Tailwind CSS

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **Backend**: Node.js + Express.js
- **Base de Datos**: SQLite (archivo local)
- **IA**: OpenAI Whisper para transcripciones
- **Procesamiento**: FFmpeg

## 📋 Prerrequisitos

- Node.js 18+
- FFmpeg instalado en el sistema
- Cuenta de OpenAI (para Whisper API)

## 🚀 Instalación

1. **Clonar el repositorio**
```bash
git clone <tu-repositorio>
cd clipsearch
```

2. **Instalar dependencias**
```bash
npm run install:all
```

3. **Configurar variables de entorno**
```bash
# Crear archivo .env.local en la raíz del proyecto
cp env.example .env.local
```

Editar `.env.local` con tus credenciales:
```env
# OpenAI
OPENAI_API_KEY=tu_api_key_de_openai

# Configuración del servidor
PORT=3001
NEXT_PUBLIC_API_URL=http://localhost:3001
```

4. **Configurar la base de datos**
```bash
npm run setup:db
```

5. **Ejecutar el proyecto**
```bash
npm run dev
```

El frontend estará disponible en `http://localhost:3000` y el backend en `http://localhost:3001`.

## 📁 Estructura del Proyecto

```
clipsearch/
├── frontend/          # Aplicación Next.js
├── backend/           # API Express.js
├── data/              # Base de datos SQLite (se crea automáticamente)
├── uploads/           # Archivos subidos (se crea automáticamente)
│   ├── videos/
│   └── thumbnails/
└── docs/             # Documentación adicional
```

## 🎯 Uso

1. **Subir un clip**: Ve a `/upload` y sube un video con título y descripción
2. **Buscar clips**: Usa la búsqueda principal para encontrar clips por contenido
3. **Reproducir**: Haz clic en cualquier clip para reproducirlo

## 🔧 Configuración de FFmpeg

Asegúrate de tener FFmpeg instalado:

**Windows:**
- Descarga desde: https://ffmpeg.org/download.html
- Agrega FFmpeg al PATH del sistema

**macOS:**
```bash
brew install ffmpeg
```

**Ubuntu:**
```bash
sudo apt install ffmpeg
```

## 📝 API Endpoints

- `POST /api/clips/upload` - Subir y procesar un clip
- `GET /api/clips/search?q=query` - Búsqueda de clips
- `GET /media/{type}/{filename}` - Servir archivos estáticos

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

MIT License - ver archivo LICENSE para detalles. 