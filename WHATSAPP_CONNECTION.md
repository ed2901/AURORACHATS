# WhatsApp Connection Guide

## Cómo Conectar WhatsApp al CRM

### Opción 1: Crear Nueva Instancia

1. **Login como Admin**
   - Email: `admin@crm.local`
   - Password: `admin123`

2. **Ir a Instances Tab**
   - Click en "Create Instance"

3. **Llenar Formulario**
   - Phone Number: Número de WhatsApp (ej: 1234567890)
   - Instance Name: Nombre descriptivo (ej: "Sales Team")

4. **Click en "Create"**
   - Se abrirá automáticamente un modal con QR code

5. **Escanear QR**
   - Abre WhatsApp en tu teléfono
   - Ve a Settings → Linked Devices
   - Click en "Link a Device"
   - Apunta la cámara al QR code en el modal

6. **Esperar Conexión**
   - El sistema detectará automáticamente cuando se escanee
   - Verás "Connected Successfully!" en el modal
   - Click en "Done"

7. **Instancia Lista**
   - La instancia aparecerá con estado "Active"
   - Ahora puedes crear usuarios y chats

---

### Opción 2: Reconectar Instancia Existente

Si una instancia se desconecta:

1. **En el Dashboard**
   - Ve a Instances tab
   - Busca la instancia con estado "Inactive"

2. **Click en "Reconnect"**
   - Se abrirá el modal con nuevo QR code

3. **Escanear Nuevo QR**
   - Mismo proceso que arriba
   - Abre WhatsApp → Settings → Linked Devices
   - Link a Device
   - Escanea el QR

4. **Confirmar Conexión**
   - Espera a que se conecte
   - Click en "Done"

---

## Requisitos

- ✅ Teléfono con WhatsApp instalado
- ✅ Acceso a WhatsApp Web (Settings → Linked Devices)
- ✅ Conexión a internet en el teléfono
- ✅ Conexión a internet en la computadora

---

## Troubleshooting

### "QR Code Generation Timeout"
**Problema:** El QR no se genera en 30 segundos

**Soluciones:**
1. Click en "Refresh QR" en el modal
2. Verifica que el backend esté corriendo (`npm run dev`)
3. Revisa la consola del servidor para errores

### "Connection Failed"
**Problema:** El QR se escanea pero no conecta

**Soluciones:**
1. Verifica que WhatsApp esté actualizado en el teléfono
2. Intenta desconectar otros dispositivos de WhatsApp Web
3. Click en "Refresh QR" y escanea de nuevo
4. Reinicia el servidor backend

### "Instance Shows Inactive"
**Problema:** La instancia se desconecta después de conectar

**Soluciones:**
1. Click en "Reconnect"
2. Escanea el nuevo QR
3. Verifica que el teléfono tenga conexión a internet
4. Revisa que no haya cerrado sesión en WhatsApp Web

### "Modal No Se Abre"
**Problema:** Al crear instancia, no aparece el modal

**Soluciones:**
1. Verifica que JavaScript esté habilitado en el navegador
2. Abre la consola (F12) y busca errores
3. Recarga la página
4. Intenta en otro navegador

---

## Características

### Conexión Automática
- El sistema detecta automáticamente cuando se escanea el QR
- No necesitas hacer nada más después de escanear
- El modal se actualiza en tiempo real

### Múltiples Instancias
- Puedes conectar varios números de WhatsApp
- Cada uno funciona de forma independiente
- Cada instancia puede tener ~40 agentes

### Reconexión Rápida
- Si se desconecta, solo click en "Reconnect"
- Genera nuevo QR automáticamente
- No pierdes el historial de chats

### Seguridad
- Las sesiones se guardan localmente en el servidor
- No se comparten credenciales
- Cada instancia es independiente

---

## Cómo Funciona Internamente

1. **Backend (Baileys)**
   - Usa la librería Baileys para conectar a WhatsApp
   - Genera QR code usando la API de WhatsApp
   - Mantiene la sesión activa en el servidor

2. **Frontend (React)**
   - Muestra el QR en un modal
   - Polling cada 2 segundos para verificar conexión
   - Actualiza automáticamente cuando se conecta

3. **Base de Datos**
   - Guarda el estado de la instancia (active/inactive)
   - Almacena todos los mensajes
   - Mantiene historial de chats

---

## Próximos Pasos

Después de conectar una instancia:

1. **Crear Usuarios**
   - Ve a Users tab
   - Click en "Add User"
   - Crea supervisores y agentes

2. **Asignar Usuarios**
   - Cada usuario se asigna a una instancia
   - Los agentes ven solo sus chats asignados

3. **Empezar Chats**
   - Los agentes pueden crear nuevos chats
   - Ingresan número de teléfono del cliente
   - El sistema valida el lenguaje automáticamente

4. **Gestionar Chats**
   - Supervisores pueden reasignar chats
   - Ver historial completo
   - Cerrar chats completados

---

## Límites y Consideraciones

- **Máximo 1 dispositivo por número:** WhatsApp solo permite 1 conexión activa por número
- **Sesión activa:** La sesión se mantiene mientras el servidor esté corriendo
- **Reinicio del servidor:** Si reinicia el servidor, necesita reconectar
- **Múltiples números:** Puedes conectar diferentes números de WhatsApp

---

## Soporte

Si tienes problemas:

1. Revisa esta guía
2. Abre la consola del navegador (F12)
3. Revisa los logs del servidor
4. Intenta reconectar la instancia
5. Reinicia el servidor si es necesario

---

**Última actualización:** Marzo 2026  
**Versión:** 1.0.0
