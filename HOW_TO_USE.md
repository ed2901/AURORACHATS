# Cómo Usar Aurora Chat CRM

## 🚀 Inicio Rápido

### 1. Instalar y Ejecutar

**Backend:**
```bash
cd server
npm install
npm run setup-db
npm run dev
```

**Frontend (nueva terminal):**
```bash
cd client
npm install
npm run dev
```

### 2. Abrir en Navegador
```
http://localhost:5173
```

### 3. Login
- **Email:** admin@crm.local
- **Password:** admin123

---

## 👨‍💼 Para Administradores

### Crear Instancia (Número de WhatsApp)

1. Click en **"Create Instance"**
2. Ingresa:
   - **Phone Number:** Tu número de WhatsApp (ej: 1234567890)
   - **Instance Name:** Nombre descriptivo (ej: "Sales Team")
3. Click **"Create"**
4. ¡Listo! La instancia aparece en la lista

### Crear Usuarios

1. Ve a tab **"Users"**
2. Click **"Add User"**
3. Ingresa:
   - **Email:** email@example.com
   - **Full Name:** Nombre del usuario
   - **Employee Code:** Código único (ej: AGENT001)
   - **Role:** Selecciona (agent o supervisor)
4. Click **"Create User"**
5. Se genera contraseña temporal (comparte con el usuario)

### Gestionar Instancias

- **Edit:** Cambiar nombre o número
- **Delete:** Eliminar instancia (borra todo)
- **Open WhatsApp Web:** Abre WhatsApp Web en nueva pestaña
- **Reconnect:** Marca instancia como activa

---

## 👤 Para Agentes

### Login

1. Abre http://localhost:5173
2. Ingresa tu email y contraseña
3. Click **"Login"**

### Ver Mis Chats

- Ves todos los chats asignados a ti
- Cada chat muestra:
  - Nombre del cliente
  - NIU (si está guardado)
  - Referencia (si está guardada)

### Crear Nuevo Chat

1. Click **"New Chat"**
2. Ingresa número de teléfono del cliente
3. Click **"Start Chat"**
4. El chat aparece en tu lista

### Enviar Mensajes

1. Click en un chat para abrirlo
2. Escribe tu mensaje
3. Click **"Send"**
4. El mensaje se valida automáticamente

**Nota:** El mensaje se bloquea si contiene palabras inapropiadas.

### Abrir WhatsApp Web

1. Click **"Open WhatsApp Web"** en la esquina superior derecha
2. Se abre WhatsApp Web en nueva pestaña
3. Escanea QR con tu teléfono (primera vez)
4. ¡Conectado!

### Enviar Mensajes en WhatsApp Web

1. En WhatsApp Web, busca el número del cliente
2. Envía el mensaje manualmente
3. El CRM registra automáticamente en la BD

---

## 👨‍💼 Para Supervisores

### Ver Todos los Chats

1. Ve a tab **"Chats"**
2. Ves todos los chats de la instancia
3. Cada chat muestra:
   - Cliente
   - Agente asignado
   - Estado (open, closed, archived)

### Reasignar Chat

1. En la lista de chats, selecciona un chat
2. Click en el dropdown "Reassign to..."
3. Selecciona nuevo agente
4. El chat se reasigna automáticamente

### Cerrar Chat

1. En la lista de chats, selecciona un chat
2. Click **"Close"**
3. El chat se marca como cerrado

### Revisar Mensajes Flagged

- Los mensajes con palabras inapropiadas aparecen marcados con ⚠️
- Puedes ver la razón del flag
- El agente debe reescribir el mensaje

---

## 📱 Flujo Completo de Ejemplo

### Día 1: Setup

```
Admin:
  1. Crea instancia "Sales Team" (número: 1234567890)
  2. Crea 3 agentes: Juan, María, Carlos
  3. Todos asignados a "Sales Team"
```

### Día 2: Agentes Trabajan

```
Juan (Agent):
  1. Login en CRM
  2. Ve 5 chats asignados
  3. Click "Open WhatsApp Web"
  4. Escanea QR (primera vez)
  5. En WhatsApp Web, busca cliente
  6. Envía mensaje manualmente
  7. CRM registra el mensaje

María (Agent):
  1. Login en CRM
  2. Ve 3 chats asignados
  3. Click "Open WhatsApp Web"
  4. Ya está conectada (no necesita escanear)
  5. Responde mensajes en WhatsApp Web
  6. CRM registra todo

Carlos (Agent):
  1. Login en CRM
  2. Ve 4 chats asignados
  3. Mismo flujo que Juan y María
```

### Día 3: Supervisor Monitorea

```
Supervisor:
  1. Login en CRM
  2. Ve tab "Chats"
  3. Ve todos los 12 chats
  4. Ve quién está respondiendo
  5. Si Juan está saturado, reasigna 2 chats a Carlos
  6. Revisa mensajes flagged
  7. Todo registrado en la BD
```

---

## 🔑 Funcionalidades Principales

### ✅ Gestión de Usuarios
- Crear admin, supervisores, agentes
- Asignar a instancias
- Contraseñas temporales

### ✅ Gestión de Instancias
- Crear múltiples números de WhatsApp
- Editar información
- Eliminar instancias

### ✅ Gestión de Chats
- Crear chats con clientes
- Asignar a agentes
- Reasignar entre agentes
- Cerrar chats

### ✅ Gestión de Clientes
- Guardar nombre
- Guardar NIU (customer ID)
- Guardar referencia (nota interna)

### ✅ Validación de Lenguaje
- Bloquea palabras inapropiadas
- Detecta tono agresivo
- Flagging automático

### ✅ Historial Completo
- Todos los mensajes guardados
- Timestamps
- Quién envió qué

---

## 🎯 Casos de Uso

### Caso 1: Nuevo Cliente Llama

```
1. Agent ve que llega un cliente nuevo
2. En CRM, click "New Chat"
3. Ingresa número del cliente
4. En WhatsApp Web, busca el número
5. Envía primer mensaje
6. CRM registra la conversación
```

### Caso 2: Reasignar por Saturación

```
1. Supervisor ve que Agent A tiene 10 chats
2. Agent B tiene 2 chats
3. Supervisor reasigna 3 chats de A a B
4. Agent B ve los nuevos chats
5. Continúa la conversación
6. Historial se mantiene
```

### Caso 3: Mensaje Inapropiado

```
1. Agent intenta enviar: "Eres un moroso"
2. CRM bloquea el mensaje
3. Agent ve advertencia
4. Agent reescribe: "Necesitamos que pagues"
5. CRM permite el mensaje
6. Se envía en WhatsApp Web
```

---

## ⚙️ Configuración

### Cambiar Contraseña

1. Login en CRM
2. (Próximamente: Perfil → Cambiar contraseña)

### Cambiar Nombre de Instancia

1. Admin → Dashboard
2. Click "Edit" en la instancia
3. Cambia el nombre
4. Click "Save"

### Cambiar Rol de Usuario

1. Admin → Users tab
2. (Próximamente: Click en usuario → Cambiar rol)

---

## 🆘 Troubleshooting

### "No puedo conectarme a WhatsApp Web"

1. Click "Open WhatsApp Web"
2. Escanea QR con tu teléfono
3. Si no aparece QR, recarga la página

### "Mi chat no aparece"

1. Recarga la página (F5)
2. Verifica que estés asignado al chat
3. Contacta al supervisor

### "No puedo enviar mensaje"

1. Verifica que el mensaje no tenga palabras inapropiadas
2. Intenta reescribir
3. Si sigue fallando, contacta al admin

### "Se desconectó WhatsApp Web"

1. Click "Open WhatsApp Web" de nuevo
2. Escanea QR
3. Reconectado

---

## 📞 Soporte

### Preguntas Frecuentes

**P: ¿Dónde envío los mensajes?**
R: En WhatsApp Web (https://web.whatsapp.com). El CRM solo registra.

**P: ¿Puedo ver el historial?**
R: Sí. Todos los mensajes se guardan en el CRM.

**P: ¿Qué pasa si se desconecta?**
R: Reconecta en WhatsApp Web. El CRM sigue funcionando.

**P: ¿Puedo cambiar mi contraseña?**
R: Próximamente en la sección de Perfil.

**P: ¿Cuántos chats puedo tener?**
R: Ilimitados. El sistema es escalable.

---

## 🎓 Mejores Prácticas

1. **Guarda info del cliente:** Nombre, NIU, referencia
2. **Sé profesional:** El lenguaje se valida automáticamente
3. **Responde rápido:** Los clientes esperan respuesta
4. **Cierra chats:** Cuando termines, marca como cerrado
5. **Usa referencias:** Para recordar contexto del cliente

---

**Versión:** 1.0.0  
**Última actualización:** Marzo 2026
