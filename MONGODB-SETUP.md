# Configuración de MongoDB Atlas

## Paso 1: Crear cuenta en MongoDB Atlas

1. Ve a [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Haz clic en "Try Free"
3. Completa el registro con tu email y contraseña

## Paso 2: Crear un cluster gratuito

1. **Selecciona el plan gratuito:**
   - Haz clic en "FREE" (Shared Clusters)
   - Selecciona "M0 Sandbox" (512MB)

2. **Configura el cluster:**
   - **Cloud Provider:** AWS (gratuito)
   - **Region:** Elige la más cercana a ti
   - **Cluster Name:** `clipsearch-cluster`

3. **Haz clic en "Create"**

## Paso 3: Configurar seguridad

### 3.1 Crear usuario de base de datos

1. En el panel de MongoDB Atlas, ve a "Database Access"
2. Haz clic en "Add New Database User"
3. **Configuración:**
   - **Authentication Method:** Password
   - **Username:** `clipsearch`
   - **Password:** `ClipSearch123!` (usa una contraseña segura)
   - **Database User Privileges:** "Read and write to any database"
4. Haz clic en "Add User"

### 3.2 Configurar acceso de red

1. Ve a "Network Access"
2. Haz clic en "Add IP Address"
3. **Para desarrollo:** Haz clic en "Allow Access from Anywhere" (0.0.0.0/0)
4. Haz clic en "Confirm"

## Paso 4: Obtener la URL de conexión

1. Ve a "Database" en el panel principal
2. Haz clic en "Connect"
3. Selecciona "Connect your application"
4. **Copia la URL de conexión**

La URL se ve así:
```
mongodb+srv://clipsearch:ClipSearch123!@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

## Paso 5: Configurar variables de entorno

### 5.1 En desarrollo local

Crea o actualiza el archivo `backend/.env`:

```env
# Base de datos MongoDB
MONGODB_URI=mongodb+srv://clipsearch:ClipSearch123!@cluster0.xxxxx.mongodb.net/clipsearch?retryWrites=true&w=majority

# OpenAI API
OPENAI_API_KEY=tu_api_key_aqui

# Cloudinary (opcional)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

### 5.2 En producción (Render)

Agrega esta variable de entorno en Render:
```
MONGODB_URI=mongodb+srv://clipsearch:ClipSearch123!@cluster0.xxxxx.mongodb.net/clipsearch?retryWrites=true&w=majority
```

## Paso 6: Probar la configuración

### 6.1 Configurar MongoDB

```bash
cd backend
npm run setup:mongodb
```

### 6.2 Migrar datos existentes (si los hay)

```bash
npm run migrate:mongodb
```

### 6.3 Probar el servidor

```bash
npm run dev
```

## Paso 7: Verificar que funciona

1. **Sube un video** desde el frontend
2. **Verifica en MongoDB Atlas** que el documento se creó:
   - Ve a "Browse Collections"
   - Busca la base de datos `clipsearch`
   - Verifica que existe la colección `clips`

## Solución de Problemas

### Error: "Authentication failed"
- Verifica que el usuario y contraseña sean correctos
- Asegúrate de que el usuario tenga permisos de lectura/escritura

### Error: "Network access denied"
- Verifica que la IP esté en la whitelist de MongoDB Atlas
- Para desarrollo, usa `0.0.0.0/0` para permitir todas las IPs

### Error: "Connection timeout"
- Verifica que la URL de conexión sea correcta
- Asegúrate de que el cluster esté activo en MongoDB Atlas

## Ventajas de MongoDB Atlas

✅ **Gratuito:** 512MB de almacenamiento gratis  
✅ **Persistente:** Los datos no se pierden al reiniciar  
✅ **Escalable:** Puedes actualizar a planes pagos cuando crezcas  
✅ **Backup automático:** Copias de seguridad automáticas  
✅ **Monitoreo:** Métricas y logs incluidos  
✅ **Seguridad:** Autenticación y encriptación incluidos  

## Próximos Pasos

1. **Monitoreo:** Configura alertas en MongoDB Atlas
2. **Backup:** Configura backups automáticos
3. **Escalado:** Considera actualizar cuando superes 512MB
4. **Seguridad:** Configura IPs específicas en producción

¡Tu base de datos MongoDB está lista! 🚀 