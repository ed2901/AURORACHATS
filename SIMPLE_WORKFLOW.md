# Flujo Simplificado - Sin QR Codes

## 🎯 Concepto

El CRM **NO se conecta a WhatsApp**. Solo gestiona la base de datos.

Los usuarios usan **WhatsApp Web manualmente** en sus navegadores, y el CRM registra todo en la BD.

---

## 📋 Flujo de Uso

### 1. Admin Crea Instancia

```
Admin → Dashboard → "Create Instance"
  ↓
Ingresa:
  - Phone Number: 1234567890
  - Instance Name: "Sales Team"
  ↓
Click "Create"
  ↓
Instancia creada en BD con is_active = true
```

**Eso es todo.** No hay QR, no hay conexión automática.

### 2. Admin Crea Usuarios

```
Admin → Users Tab → "Add User"
  ↓
Ingresa:
  - Email: agent@example.com
  - Name: Agent Name
  - Role: agent
  - Instance: Sales Team
  ↓
Click "Create"
  ↓
Usuario creado y asignado a instancia
```

### 3. Agent Abre WhatsApp Web

```
Agent → Abre navegador
  ↓
Va a: https://web.whatsapp.com
  ↓
Escanea QR con su teléfono (WhatsApp Web normal)
  ↓
Conectado a WhatsApp Web
```

**Esto es completamente manual y normal.**

### 4. Agent Crea Chat en CRM

```
Agent → Login en CRM
  ↓
Dashboard → "New Chat"
  ↓
Ingresa:
  - Client Phone: 9876543210
  - Message: "Hola, ¿cómo estás?"
  ↓
Click "Start Chat"
  ↓
Chat creado en BD
```

### 5. Agent Envía Mensaje

```
Agent → En WhatsApp Web (en otra pestaña)
  ↓
Busca el número del cliente
  ↓
Envía el mensaje manualmente
  ↓
El mensaje se registra en CRM (manual o automático)
```

---

## 🔄 Flujo Completo

```
┌─────────────────────────────────────────────────────────────┐
│                    AURORA CHAT CRM                          │
│                                                             │
│  Admin crea instancia → Crea usuarios → Asigna a instancia │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    AGENT WORKFLOW                           │
│                                                             │
│  1. Login en CRM                                            │
│  2. Ve sus chats asignados                                 │
│  3. Abre WhatsApp Web en otra pestaña                      │
│  4. Envía mensajes manualmente                             │
│  5. CRM registra todo en la BD                             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE                                 │
│                                                             │
│  - Chats (quién habla con quién)                           │
│  - Messages (historial completo)                           │
│  - Clients (info del cliente)                              │
│  - Users (agentes, supervisores)                           │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Ventajas

- ✅ **Simple** - No hay complejidad de conexión
- ✅ **Confiable** - Usa WhatsApp Web nativo
- ✅ **Seguro** - No hay automatización riesgosa
- ✅ **Flexible** - Agentes tienen control total
- ✅ **Rápido** - Sin dependencias complejas
- ✅ **Escalable** - Múltiples agentes sin problemas

---

## 📊 Qué Hace el CRM

### ✅ Sí Hace
- Gestiona usuarios (admin, supervisor, agent)
- Crea instancias (números de WhatsApp)
- Registra chats (conversaciones)
- Guarda mensajes (historial)
- Valida lenguaje (bloquea palabras inapropiadas)
- Asigna chats a agentes
- Reasigna chats entre agentes
- Cierra chats completados
- Genera reportes

### ❌ No Hace
- No se conecta a WhatsApp
- No genera QR codes
- No envía mensajes automáticamente
- No recibe mensajes automáticamente
- No maneja sesiones de WhatsApp

---

## 🚀 Cómo Empezar

### 1. Instalar
```bash
cd server
npm install
npm run setup-db
npm run dev
```

### 2. Iniciar Frontend
```bash
cd client
npm install
npm run dev
```

### 3. Login
- Email: admin@crm.local
- Password: admin123

### 4. Crear Instancia
- Click "Create Instance"
- Ingresa número y nombre
- Click "Create"
- ¡Listo!

### 5. Crear Usuarios
- Ve a Users tab
- Click "Add User"
- Crea agentes

### 6. Agentes Usan CRM + WhatsApp Web
- Agentes login en CRM
- Abren WhatsApp Web en otra pestaña
- Envían mensajes manualmente
- CRM registra todo

---

## 📝 Ejemplo Práctico

### Día 1: Setup
```
Admin crea instancia "Sales Team" (número: 1234567890)
Admin crea 3 agentes: Juan, María, Carlos
Admin asigna todos a "Sales Team"
```

### Día 2: Agentes Trabajan
```
Juan:
  - Login en CRM
  - Ve 5 chats asignados
  - Abre WhatsApp Web
  - Responde mensajes manualmente
  - CRM registra todo

María:
  - Login en CRM
  - Ve 3 chats asignados
  - Abre WhatsApp Web
  - Responde mensajes manualmente
  - CRM registra todo

Carlos:
  - Login en CRM
  - Ve 4 chats asignados
  - Abre WhatsApp Web
  - Responde mensajes manualmente
  - CRM registra todo
```

### Día 3: Supervisor Monitorea
```
Supervisor:
  - Login en CRM
  - Ve todos los chats (12 total)
  - Ve quién está respondiendo
  - Puede reasignar chats si es necesario
  - Revisa mensajes flagged
```

---

## 🎯 Casos de Uso

### Caso 1: Nuevo Cliente
```
1. Agent crea chat en CRM con número del cliente
2. Agent abre WhatsApp Web
3. Agent busca el número
4. Agent envía primer mensaje
5. CRM registra la conversación
```

### Caso 2: Reasignar Chat
```
1. Supervisor ve que Agent A está saturado
2. Supervisor reasigna chat a Agent B
3. Agent B ve el chat en su lista
4. Agent B continúa la conversación
5. CRM mantiene historial completo
```

### Caso 3: Validación de Lenguaje
```
1. Agent intenta enviar: "Eres un moroso"
2. CRM bloquea el mensaje (palabra inapropiada)
3. Agent ve advertencia
4. Agent reescribe: "Necesitamos que pagues"
5. CRM permite el mensaje
```

---

## 🔐 Seguridad

- ✅ JWT authentication
- ✅ Role-based access
- ✅ Instance-level isolation
- ✅ Message validation
- ✅ Audit trail

---

## 📞 Soporte

### Preguntas Comunes

**P: ¿Cómo envío mensajes?**
R: Manualmente en WhatsApp Web. El CRM solo registra.

**P: ¿Puedo automatizar mensajes?**
R: No. El CRM es solo para gestión y registro.

**P: ¿Qué pasa si se desconecta WhatsApp Web?**
R: El agent se reconecta manualmente. El CRM sigue funcionando.

**P: ¿Puedo ver el historial?**
R: Sí. El CRM guarda todos los mensajes.

**P: ¿Puedo reasignar chats?**
R: Sí. Los supervisores pueden reasignar entre agentes.

---

## ✨ Resumen

**El CRM es un gestor de chats, no un bot de WhatsApp.**

Los agentes usan WhatsApp Web normalmente, y el CRM registra y organiza todo.

**Simple, confiable, efectivo.**

---

**Versión:** 1.0.0  
**Última actualización:** Marzo 2026
