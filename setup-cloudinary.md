# ☁️ Configuración de Cloudinary

## ¿Qué es Cloudinary?

Cloudinary es un servicio de almacenamiento en la nube especializado en medios (imágenes, videos, audio). Te ofrece:

- **25GB gratis** de almacenamiento
- **Optimización automática** de videos
- **CDN global** para carga rápida
- **Transformaciones** en tiempo real
- **Seguridad** y privacidad

## 🚀 Pasos para Configurar Cloudinary

### 1. Crear Cuenta en Cloudinary

1. Ve a [cloudinary.com](https://cloudinary.com)
2. Haz clic en "Sign Up For Free"
3. Completa el formulario de registro
4. Verifica tu email

### 2. Obtener Credenciales

Una vez registrado, ve a tu **Dashboard** y copia:

- **Cloud Name**: Aparece en la parte superior
- **API Key**: En la sección "Account Details"
- **API Secret**: En la sección "Account Details"

### 3. Configurar Variables de Entorno

Edita tu archivo `.env.local` y agrega:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

### 4. Probar la Configuración

Ejecuta el script de configuración:

```bash
npm run setup:db
```

### 5. Verificar Funcionamiento

1. Inicia tu aplicación: `npm run dev`
2. Sube un video desde la interfaz
3. Verifica en tu dashboard de Cloudinary que el video aparezca

## 📊 Planes de Cloudinary

| Plan | Almacenamiento | Ancho de Banda | Precio |
|------|----------------|----------------|--------|
| **Free** | 25GB | 25GB/mes | $0 |
| **Advanced** | 225GB | 225GB/mes | $89/mes |
| **Custom** | Personalizado | Personalizado | Contactar |

## 🔧 Configuración Avanzada

### Optimización de Videos

Cloudinary automáticamente:
- Convierte formatos
- Comprime videos
- Genera múltiples calidades
- Optimiza para diferentes dispositivos

### Transformaciones

Puedes agregar transformaciones a las URLs:

```javascript
// Video optimizado para móvil
const mobileUrl = cloudinary.url(publicId, {
  resource_type: 'video',
  quality: 'auto',
  fetch_format: 'auto',
  width: 480
});

// Thumbnail con overlay
const thumbnailUrl = cloudinary.url(publicId, {
  resource_type: 'image',
  width: 300,
  height: 200,
  crop: 'fill',
  gravity: 'center'
});
```

## 🛡️ Seguridad

### Configuración Recomendada

1. **Restringe formatos** permitidos
2. **Establece límites** de tamaño
3. **Usa firmas** para uploads seguros
4. **Configura CORS** apropiadamente

### Variables de Entorno

Nunca subas tus credenciales a GitHub:

```bash
# ✅ Correcto - en .env.local (no en git)
CLOUDINARY_API_SECRET=tu_secreto_aqui

# ❌ Incorrecto - en código
const secret = "tu_secreto_aqui";
```

## 🚨 Solución de Problemas

### Error: "Cloudinary not configured"

**Causa**: Variables de entorno no configuradas
**Solución**: Verifica que `.env.local` tenga las credenciales correctas

### Error: "Upload failed"

**Causa**: Archivo muy grande o formato no soportado
**Solución**: Verifica el tamaño y formato del archivo

### Error: "Rate limit exceeded"

**Causa**: Demasiadas subidas en poco tiempo
**Solución**: Implementa rate limiting en tu aplicación

## 📈 Monitoreo

### Dashboard de Cloudinary

- **Uso de almacenamiento**: Ve a "Media Library"
- **Ancho de banda**: Ve a "Usage"
- **Errores**: Ve a "Activity Log"

### Métricas Importantes

- **Storage used**: Cuánto espacio usas
- **Bandwidth**: Cuánto ancho de banda consumes
- **Transformations**: Cuántas transformaciones haces

## 🎯 Próximos Pasos

1. **Configura Cloudinary** siguiendo esta guía
2. **Prueba subiendo** un video
3. **Verifica** que aparezca en tu dashboard
4. **Configura el hosting** (Render, Vercel, etc.)
5. **¡Disfruta** de tu aplicación en la nube! 🚀

¿Necesitas ayuda con algún paso específico? 