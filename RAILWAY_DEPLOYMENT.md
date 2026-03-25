# Deployment en Railway

## Paso 1: Preparar el Repositorio

```bash
git add .
git commit -m "Prepare for Railway deployment"
git push
```

## Paso 2: Crear Proyecto en Railway

1. Ve a https://railway.app
2. Click "New Project"
3. Click "Deploy from GitHub"
4. Selecciona tu repositorio
5. Autoriza Railway

## Paso 3: Configurar Variables de Entorno

En Railway Dashboard:

1. Click en tu proyecto
2. Ve a "Variables"
3. Agrega estas variables:

```
PORT=5000
NODE_ENV=production
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]
```

## Paso 4: Agregar PostgreSQL

1. Click "Add Service"
2. Selecciona "PostgreSQL"
3. Railway generará automáticamente `DATABASE_URL`

## Paso 5: Configurar el Servicio

1. En tu servicio Node.js, ve a "Settings"
2. Root Directory: `server`
3. Start Command: `npm run start`
4. Build Command: `npm install`

## Paso 6: Deploy

Railway deployará automáticamente cuando hagas push a GitHub.

---

## Variables de Entorno Necesarias

```
PORT=5000
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:port/database
```

---

## Verificar Deployment

1. Ve a tu proyecto en Railway
2. Click en el servicio Node.js
3. Ve a "Deployments"
4. Verifica que el build fue exitoso
5. Copia la URL pública (ej: `https://your-app.railway.app`)

---

## Conectar Frontend

En `client/src/api.js`, cambia:

```javascript
const API_BASE_URL = 'https://your-app.railway.app/api';
```

Luego deploy el frontend en Vercel o Netlify.

---

## Troubleshooting

### Error: "Cannot find module"
```bash
# En Railway, ejecuta:
npm install
```

### Error: "Database connection failed"
- Verifica que `DATABASE_URL` esté configurada
- Verifica que PostgreSQL esté corriendo
- Verifica credenciales

### Error: "Port already in use"
- Railway asigna el puerto automáticamente
- Usa `process.env.PORT` (ya está en index.js)

---

## Monitoreo

1. Ve a "Logs" en Railway
2. Verifica que el servidor esté corriendo
3. Busca errores de conexión

---

## Próximos Pasos

1. Deploy backend en Railway
2. Deploy frontend en Vercel/Netlify
3. Conecta frontend a backend
4. Prueba la aplicación completa

