# Configuración para WSL/Linux

## Problema Conocido

En WSL (Windows Subsystem for Linux), Baileys puede tener problemas de conexión con WhatsApp. Esto es normal y se debe a limitaciones de red en WSL.

## Soluciones

### Opción 1: Usar Windows Nativo (Recomendado)

Si tienes Node.js instalado en Windows (no WSL):

```bash
# En PowerShell (Windows)
cd "C:\Users\[usuario]\OneDrive\Desktop\PROYECTO CRM MULTICHAT"
cd server
npm install
npm run dev
```

Esto evita los problemas de WSL.

### Opción 2: Configurar WSL Correctamente

Si prefieres usar WSL:

#### 1. Actualizar WSL
```bash
wsl --update
```

#### 2. Instalar Dependencias del Sistema
```bash
sudo apt update
sudo apt install -y build-essential python3
```

#### 3. Limpiar y Reinstalar Node Modules
```bash
cd server
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

#### 4. Aumentar Timeouts
En `server/services/whatsappService.js`, línea ~100:
```javascript
}, 60000); // Cambiar de 45000 a 60000 (60 segundos)
```

#### 5. Reintentos Automáticos
El servicio ahora reintenta automáticamente si falla.

### Opción 3: Usar Docker

Si tienes Docker instalado:

```dockerfile
# Crear Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY server/package*.json ./
RUN npm install

COPY server/ .

EXPOSE 5000

CMD ["npm", "run", "dev"]
```

```bash
docker build -t aurora-chat .
docker run -p 5000:5000 aurora-chat
```

---

## Pasos para Hacer Funcionar en WSL

### 1. Verificar Node.js
```bash
node --version  # Debe ser v18+
npm --version   # Debe ser v8+
```

### 2. Limpiar Instalación
```bash
cd server
rm -rf node_modules package-lock.json .wwebjs_auth
npm cache clean --force
npm install
```

### 3. Iniciar Backend
```bash
npm run dev
```

### 4. Esperar Más Tiempo

El QR puede tardar **hasta 60 segundos** en generarse en WSL. Esto es normal.

**No cierres el modal ni hagas refresh.**

### 5. Cuando Aparezca el QR

- Abre WhatsApp en tu teléfono
- Ve a Settings → Linked Devices
- Click "Link a Device"
- Escanea el QR
- Espera a que se conecte (puede tardar 10-20 segundos)

### 6. Si Sigue Sin Funcionar

Intenta reconectar:
1. Click "Refresh QR" en el modal
2. Espera otros 60 segundos
3. Escanea el nuevo QR

---

## Logs Útiles

### Ver Logs del Servidor
```bash
# En la terminal donde corre npm run dev
# Deberías ver algo como:
# [Instance 1] QR Code generated
# [Instance 1] Connected successfully
```

### Ver Logs del Frontend
```bash
# Abre consola del navegador (F12)
# Busca errores en la pestaña Console
```

---

## Alternativa: Usar Windows Nativo

La forma más confiable es usar Node.js directamente en Windows:

### 1. Descargar Node.js
https://nodejs.org/ (LTS)

### 2. Instalar en Windows
- Ejecutar instalador
- Aceptar defaults
- Reiniciar

### 3. Abrir PowerShell
```powershell
cd "C:\Users\[usuario]\OneDrive\Desktop\PROYECTO CRM MULTICHAT\server"
npm install
npm run dev
```

### 4. En otra terminal PowerShell
```powershell
cd "C:\Users\[usuario]\OneDrive\Desktop\PROYECTO CRM MULTICHAT\client"
npm install
npm run dev
```

### 5. Abrir navegador
```
http://localhost:5173
```

---

## Troubleshooting

### "Connection Failure" en logs
- Normal en WSL
- El sistema reintentará automáticamente
- Espera hasta 60 segundos

### "QR code generation timeout"
- Click "Refresh QR"
- Espera otros 60 segundos
- Si sigue fallando, usa Windows nativo

### "Cannot find module"
```bash
cd server
rm -rf node_modules
npm install
```

### Puerto 5000 en uso
```bash
# Cambiar en server/.env
PORT=5001
```

---

## Recomendación Final

**Para mejor experiencia, usa Node.js en Windows nativo, no en WSL.**

WSL tiene limitaciones de red que afectan a Baileys. Windows nativo funciona perfectamente.

---

**Última actualización:** Marzo 2026
