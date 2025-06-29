# 🚀 Guía de Hosting Gratuito - ClipSearch

## Migración a MongoDB

**¡IMPORTANTE!** Hemos migrado de SQLite a MongoDB para mejor soporte en la nube. Los datos ahora son persistentes y no se pierden al reiniciar.

### Configuración de MongoDB

#### Opción 1: MongoDB Atlas (Recomendado - Gratuito)
1. Ve a [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Crea una cuenta gratuita
3. Crea un nuevo cluster (gratuito)
4. Configura un usuario y contraseña
5. Obtén la URL de conexión
6. Agrega la URL a tu variable de entorno `MONGODB_URI`

#### Opción 2: MongoDB Local (Desarrollo)
1. Instala MongoDB en tu máquina local
2. Usa la URL: `mongodb://localhost:27017/clipsearch`

### Variables de Entorno Actualizadas

```env
# Base de datos MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/clipsearch

# OpenAI API
OPENAI_API_KEY=tu_api_key_aqui

# Cloudinary (opcional)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# URLs para producción
NEXT_PUBLIC_API_URL=https://tu-backend.railway.app
FRONTEND_URL=https://tu-frontend.vercel.app
BACKEND_URL=https://tu-backend.railway.app
```

### Migración de Datos Existentes

Si tienes datos en SQLite que quieres migrar:

```bash
# En el directorio backend
npm run migrate:mongodb
```

### Configuración Inicial

```bash
# Configurar MongoDB y crear índices
npm run setup:mongodb

# Iniciar el servidor
npm run dev
```

## Hosting en Render

### 1. Preparar el Proyecto

1. **Sube tu código a GitHub:**
   ```bash
   git add .
   git commit -m "Migración a MongoDB"
   git push origin main
   ```

2. **Configura MongoDB Atlas:**
   - Crea un cluster gratuito en MongoDB Atlas
   - Obtén la URL de conexión
   - La URL se ve así: `mongodb+srv://username:password@cluster.mongodb.net/clipsearch`

### 2. Configurar Render

1. **Ve a [Render](https://render.com) y crea una cuenta**

2. **Crea un nuevo Web Service:**
   - Conecta tu repositorio de GitHub
   - Selecciona el repositorio de tu proyecto

3. **Configuración del servicio:**
   - **Name:** `clipsearch-backend`
   - **Environment:** `Node`
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Root Directory:** `backend`

### 3. Variables de Entorno en Render

Agrega estas variables de entorno en Render:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/clipsearch
OPENAI_API_KEY=tu_api_key_aqui
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
NEXT_PUBLIC_API_URL=https://tu-backend.railway.app
FRONTEND_URL=https://tu-frontend.vercel.app
BACKEND_URL=https://tu-backend.railway.app
```

### 4. Desplegar el Frontend en Vercel

1. **Ve a [Vercel](https://vercel.com) y crea una cuenta**

2. **Importa tu repositorio:**
   - Conecta tu repositorio de GitHub
   - Selecciona el repositorio

3. **Configuración:**
   - **Framework Preset:** `Next.js`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

4. **Variables de Entorno en Vercel:**
   ```env
   NEXT_PUBLIC_API_URL=https://tu-backend.railway.app
   ```

### 5. Configurar CORS

Asegúrate de que tu backend permita requests desde tu frontend:

```javascript
// En backend/server.js
const corsOptions = {
  origin: [
    'https://tu-frontend.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true
};
```

## Ventajas de MongoDB

✅ **Persistencia:** Los datos no se pierden al reiniciar  
✅ **Escalabilidad:** Puede manejar más datos y consultas  
✅ **Flexibilidad:** Esquema flexible para futuras mejoras  
✅ **Hosting gratuito:** MongoDB Atlas ofrece 512MB gratis  
✅ **Búsquedas avanzadas:** Índices de texto y similitud  

## Solución de Problemas

### Error de Conexión a MongoDB
- Verifica que la URL de MongoDB Atlas sea correcta
- Asegúrate de que la IP de Render esté en la whitelist de MongoDB Atlas
- Usa `0.0.0.0/0` en MongoDB Atlas para permitir todas las IPs

### Error de CORS
- Verifica que las URLs del frontend estén en la configuración de CORS
- Asegúrate de que las variables de entorno estén configuradas correctamente

### Error de Variables de Entorno
- Verifica que todas las variables estén configuradas en Render
- Asegúrate de que no haya espacios extra en las URLs

## Próximos Pasos

1. **Monitoreo:** Configura logs y monitoreo en Render
2. **Backup:** Configura backups automáticos en MongoDB Atlas
3. **Escalado:** Considera actualizar a un plan pago cuando crezcas
4. **CDN:** Configura Cloudinary como CDN para mejor rendimiento

¡Tu aplicación ahora está lista para producción con MongoDB! 🚀

## Opción Recomendada: Render (Completamente Gratuito)

### 1. Preparar el Repositorio

1. **Sube tu código a GitHub**
```bash
git add .
git commit -m "Preparado para hosting"
git push origin main
```

2. **Asegúrate de tener estos archivos en tu repositorio:**
- `render.yaml` (ya creado)
- `package.json` en la raíz
- `backend/package.json`
- `frontend/package.json`

### 2. Configurar Render

1. **Ve a [render.com](https://render.com) y crea una cuenta**

2. **Crea un nuevo "Blueprint" (despliegue automático)**
   - Conecta tu repositorio de GitHub
   - Render detectará automáticamente el `render.yaml`

3. **Configura las variables de entorno:**
   - `OPENAI_API_KEY`: Tu clave de OpenAI
   - `NODE_ENV`: `production`

### 3. URLs que obtendrás:
- **Frontend**: `https://tu-app.onrender.com`
- **Backend**: `https://tu-backend.onrender.com`

## Opción Alternativa: Vercel + Railway

### 1. Frontend en Vercel
1. Ve a [vercel.com](https://vercel.com)
2. Conecta tu repositorio
3. Configura:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 2. Backend en Railway
1. Ve a [railway.app](https://railway.app)
2. Conecta tu repositorio
3. Configura:
   - **Root Directory**: `backend`
   - **Start Command**: `npm start`

### 3. Variables de entorno en Railway:
```
NODE_ENV=production
OPENAI_API_KEY=tu_api_key
PORT=3001
```

## ⚠️ Consideraciones Importantes

### Almacenamiento de Archivos
En hosting gratuito, el almacenamiento local se pierde al reiniciar. Opciones:

1. **Cloudinary** (Gratis hasta 25GB):
```bash
npm install cloudinary
```

2. **AWS S3** (Gratis hasta 5GB)

3. **Google Cloud Storage** (Gratis hasta 5GB)

### Base de Datos
- **SQLite**: No funciona bien en hosting (se pierde al reiniciar)
- **PostgreSQL**: Incluido gratis en Render/Railway
- **MongoDB Atlas**: 512MB gratis

## 🔧 Configuración para Almacenamiento en la Nube

### Opción 1: Cloudinary (Recomendado)

1. **Instalar dependencia:**
```bash
cd backend && npm install cloudinary
```

2. **Configurar en backend/services/cloudinary.js:**
```javascript
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = cloudinary;
```

3. **Variables de entorno adicionales:**
```
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

## 📊 Comparación de Opciones Gratuitas

| Servicio | Frontend | Backend | Base de Datos | Almacenamiento | Despertar |
|----------|----------|---------|---------------|----------------|-----------|
| **Render** | ✅ Gratis | ✅ Gratis | ✅ PostgreSQL | ❌ Local | ⏰ 15 min |
| **Vercel + Railway** | ✅ Gratis | ⚠️ $5/mes | ✅ PostgreSQL | ❌ Local | ⚡ Instantáneo |
| **Heroku** | ✅ Gratis | ✅ Gratis | ✅ PostgreSQL | ❌ Local | ⏰ 30 min |
| **Netlify + Railway** | ✅ Gratis | ⚠️ $5/mes | ✅ PostgreSQL | ❌ Local | ⚡ Instantáneo |

## 🎯 Recomendación Final

**Para empezar**: Render (todo gratis, fácil configuración)
**Para producción**: Vercel + Railway (más rápido, más confiable)

¿Quieres que te ayude a configurar alguna de estas opciones? 