# Instalación de WhatsApp Integration

## Paso 1: Actualizar Dependencias

```bash
cd server
npm install
```

Esto instalará:
- `@whiskeysockets/baileys@^6.4.0` - Conexión a WhatsApp
- `qrcode@^1.5.3` - Generación de QR codes

## Paso 2: Iniciar Backend

```bash
npm run dev
```

Deberías ver:
```
Server running on port 5000
```

## Paso 3: Iniciar Frontend

En otra terminal:
```bash
cd client
npm run dev
```

## Paso 4: Flujo de Conexión

### 1. Login en CRM
- Abre http://localhost:5173
- Login con admin@crm.local / admin123

### 2. Crear Instancia
- Click "Create Instance"
- Ingresa número de teléfono y nombre
- Click "Create"

### 3. Escanear QR Code
- Se abre modal con QR code automáticamente
- Abre WhatsApp en tu teléfono
- Ve a Settings → Linked Devices
- Escanea el QR code con la cámara del teléfono
- **Espera a que se conecte** (puede tardar 10-30 segundos)

### 4. Instancia Conectada
- El modal mostrará "Connected Successfully!"
- La instancia aparecerá como "Active" en el dashboard
- Ahora puedes enviar mensajes desde el CRM

---

## 📱 Requisitos del Sistema

### Node.js
- Versión: 18+
- Verificar: `node --version`

### npm
- Versión: 8+
- Verificar: `npm --version`

### PostgreSQL
- Versión: 12+
- Debe estar corriendo
- Verificar: `psql --version`

### Teléfono
- WhatsApp instalado
- Acceso a Settings → Linked Devices
- Conexión a internet estable

---

## 🔧 Troubleshooting

### Error: "Cannot find module '@whiskeysockets/baileys'"

**Solución:**
```bash
cd server
rm -rf node_modules package-lock.json
npm install
```

### QR Code no aparece

**Solución:**
1. Espera 2-3 segundos después de crear la instancia
2. Si no aparece, click "Refresh QR"
3. Verifica que el servidor esté corriendo (npm run dev)

### QR Code expira (30 segundos)

**Solución:**
- Click "Refresh QR" para generar uno nuevo
- Escanea rápidamente

### Conexión falla después de escanear

**Solución:**
1. Verifica conexión a internet en el teléfono
2. Intenta "Reconnect" desde el dashboard
3. Reinicia el servidor: `npm run dev`

### Error: "Port 5000 already in use"

**Solución:**
```bash
# Cambiar puerto en server/.env
PORT=5001

# O matar proceso
lsof -ti:5000 | xargs kill -9
```

---

## ✅ Verificación Post-Instalación

### 1. Backend Health Check
```bash
curl http://localhost:5000/health
```

Respuesta esperada:
```json
{"status":"ok"}
```

### 2. Frontend Load
Abre http://localhost:5173 en navegador

Deberías ver:
- Página de login
- Sin errores en consola (F12)

### 3. Login Test
- Email: admin@crm.local
- Password: admin123

Deberías ver:
- Dashboard cargado
- Botón "Create Instance" visible

### 4. Create Instance Test
1. Click "Create Instance"
2. Ingresa número de teléfono (ej: 1234567890)
3. Ingresa nombre (ej: Mi Instancia)
4. Click "Create"
5. Modal con QR debería aparecer en 2-3 segundos

### 5. Escanear QR Test
1. Abre WhatsApp en tu teléfono
2. Settings → Linked Devices
3. Escanea el QR code
4. Espera a que se conecte
5. Modal debería mostrar "Connected Successfully!"

---

## 🚀 Próximos Pasos

Después de conectar:

1. **Crear Usuarios**
   - Ve a Users tab
   - Crea supervisores y agentes

2. **Crear Clientes**
   - Los agentes pueden crear chats
   - Ingresa número de teléfono del cliente

3. **Enviar Mensajes**
   - Abre un chat
   - Escribe mensaje en el CRM
   - Click "Send"
   - Mensaje aparece en WhatsApp automáticamente

4. **Recibir Mensajes**
   - Los mensajes del cliente aparecen en el CRM
   - Se actualizan cada 5 segundos

---

## 📊 Arquitectura

```
Teléfono (WhatsApp)
        ↓ (Linked Device)
    Baileys (Node.js)
        ↓ (WebSocket)
    CRM (React)
        ↓ (HTTP)
    PostgreSQL (BD)
```

---

## Desinstalación (si es necesario)

```bash
cd server
npm uninstall @whiskeysockets/baileys qrcode
npm install
```

---

## Soporte

Si tienes problemas:

1. Revisa esta guía
2. Abre consola: F12
3. Revisa logs del servidor
4. Intenta reinstalar: `npm install`
5. Reinicia el servidor

---

**Versión:** 2.0.0  
**Última actualización:** Marzo 2026
