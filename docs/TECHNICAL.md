# Documentación Técnica - ClipSearch

## Arquitectura del Sistema

### Stack Tecnológico

**Frontend:**
- Next.js 14 con App Router
- TypeScript
- Tailwind CSS
- Lucide React (iconos)
- Axios (cliente HTTP)

**Backend:**
- Node.js con Express.js
- PostgreSQL con extensión pgvector
- OpenAI API (Whisper + Embeddings)
- FFmpeg (procesamiento de video)
- Multer (manejo de archivos)

### Estructura de la Base de Datos

```sql
CREATE TABLE clips (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  transcription TEXT,
  file_path VARCHAR(500) NOT NULL,
  thumbnail_path VARCHAR(500) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  combined_text_embedding vector(1536)
);
```

**Índices:**
- `idx_clips_embedding_hnsw`: Índice HNSW para búsquedas de similitud
- `idx_clips_created_at`: Índice para ordenamiento por fecha
- `idx_clips_title`: Índice GIN para búsquedas de texto

### Flujo de Procesamiento

1. **Subida de Video:**
   - Usuario sube archivo de video (máx. 100MB)
   - Se valida el formato y se guarda en `/uploads/videos/`
   - Se responde inmediatamente con status 202

2. **Procesamiento Asíncrono:**
   - Extracción de audio con FFmpeg
   - Generación de thumbnail
   - Transcripción con OpenAI Whisper
   - Generación de embeddings con OpenAI
   - Inserción en base de datos

3. **Búsqueda Semántica:**
   - Consulta del usuario convertida a embedding
   - Búsqueda por similitud de coseno en pgvector
   - Resultados ordenados por relevancia

### API Endpoints

#### POST /api/clips/upload
Sube y procesa un clip de video.

**Request:**
```javascript
FormData {
  videoFile: File,
  title: string,
  description?: string
}
```

**Response:**
```javascript
{
  message: string,
  clipId: string,
  status: 'processing'
}
```

#### GET /api/clips/search?q={query}&limit={number}
Búsqueda semántica de clips.

**Response:**
```javascript
{
  query: string,
  results: Clip[],
  total: number
}
```

#### GET /api/clips/recent?limit={number}
Obtiene clips recientes.

**Response:**
```javascript
{
  clips: Clip[],
  total: number
}
```

### Modelos de IA

**Whisper:**
- Modelo: `whisper-1`
- Idioma: Español (configurable)
- Formato de salida: Texto plano

**Embeddings:**
- Modelo: `text-embedding-3-small`
- Dimensiones: 1536
- Método: Combinación de título, descripción y transcripción

### Configuración de Entorno

```env
# Base de datos
DATABASE_URL=postgresql://usuario:password@localhost:5432/clipsearch

# OpenAI
OPENAI_API_KEY=tu_api_key_de_openai

# Servidor
PORT=3001
NEXT_PUBLIC_API_URL=http://localhost:3001

# Archivos
MAX_FILE_SIZE=100MB
UPLOAD_PATH=./uploads

# Embeddings
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSION=1536

# Whisper
WHISPER_MODEL=whisper-1
```

### Optimizaciones

**Base de Datos:**
- Pool de conexiones configurado
- Índices HNSW para búsquedas rápidas
- Prepared statements para seguridad

**Procesamiento:**
- Procesamiento asíncrono para evitar timeouts
- Limpieza automática de archivos temporales
- Validación de archivos antes del procesamiento

**Frontend:**
- Lazy loading de imágenes
- Debouncing en búsquedas
- Estados de carga optimizados

### Seguridad

- Validación de tipos de archivo
- Límites de tamaño de archivo
- Rate limiting en API
- Sanitización de inputs
- Headers de seguridad con Helmet

### Escalabilidad

**Consideraciones:**
- Procesamiento asíncrono permite escalar horizontalmente
- pgvector optimizado para grandes volúmenes
- Separación de frontend y backend
- Configuración de CDN para archivos estáticos

**Mejoras Futuras:**
- Cola de procesamiento (Redis/Bull)
- Almacenamiento en la nube (S3/Azure)
- Cache de embeddings
- Microservicios para procesamiento

### Monitoreo y Logs

- Logs estructurados en consola
- Métricas de rendimiento de queries
- Tracking de errores de procesamiento
- Health checks de servicios

### Testing

**Estrategia:**
- Tests unitarios para servicios
- Tests de integración para API
- Tests E2E para flujos principales
- Mocks para servicios externos (OpenAI, FFmpeg)

### Deployment

**Recomendaciones:**
- Docker para containerización
- Variables de entorno en producción
- SSL/TLS para HTTPS
- Backup automático de base de datos
- Monitoreo de recursos del servidor 