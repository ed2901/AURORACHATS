# WhatsApp CRM Multi-User System - Setup Guide

## Overview
This is a CRM system for managing multiple WhatsApp conversations on a single phone number instance. The system manages the database only - agents use WhatsApp Web manually in their browsers.

**Key Features:**
- Multi-user support (Admin, Supervisor, Agent roles)
- Multiple WhatsApp instances (phone numbers)
- Chat management and assignment
- Client management with NIU and reference fields
- Language validation (blocks inappropriate words)
- Message flagging for review

---

## Prerequisites

1. **PostgreSQL** - Database server
2. **Node.js** - v18+ (for backend)
3. **npm** - Package manager
4. **Git** (optional)

---

## Installation Steps

### 1. Database Setup

**Windows with PostgreSQL installed:**

```bash
# Navigate to server directory
cd server

# Run setup script
npm run setup-db
```

This will:
- Create `whatsapp_crm` database
- Execute schema with all tables
- Create admin user: `admin@crm.local` / `admin123`

**If PostgreSQL is not installed:**
- Download from: https://www.postgresql.org/download/
- Install with default settings (user: postgres, password: postgres)
- Ensure PostgreSQL service is running

### 2. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Start development server
npm run dev
```

Server will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
# In a new terminal, navigate to client directory
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173` (or similar)

---

## Login Credentials

**Default Admin Account:**
- Email: `admin@crm.local`
- Password: `admin123`

---

## System Architecture

### Database Schema

**Users Table**
- Roles: admin, supervisor, agent
- Each user belongs to an instance (except admin)

**Instances Table**
- Represents WhatsApp phone numbers
- `is_active`: Boolean flag for connection status
- Created by admin

**Clients Table**
- Phone number, name, NIU, reference
- Linked to instance

**Chats Table**
- Conversation between agent and client
- Status: open, closed, archived
- Assigned to agent

**Messages Table**
- Message content, sender type (agent/client)
- Flagged if contains inappropriate language
- Stores flag reason

### API Endpoints

**Authentication**
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register (admin only)

**Instances**
- `POST /api/instances` - Create instance (admin)
- `GET /api/instances` - List instances
- `GET /api/instances/:id` - Get instance details
- `PUT /api/instances/:id` - Update instance (admin)
- `DELETE /api/instances/:id` - Delete instance (admin)
- `POST /api/instances/:id/reconnect` - Mark instance as active (admin)

**Users**
- `POST /api/users` - Create user (admin)
- `GET /api/users/instance/:instanceId` - List users for instance
- `PUT /api/users/:id` - Update user role (admin/supervisor)

**Clients**
- `POST /api/clients` - Create/update client
- `GET /api/clients/instance/:instanceId` - List clients
- `POST /api/clients/:clientId/start-chat` - Start new chat

**Chats**
- `GET /api/chats/agent/my-chats` - Get agent's chats
- `GET /api/chats/instance/:instanceId` - Get all chats for instance
- `GET /api/chats/:chatId/messages` - Get chat messages
- `POST /api/chats/:chatId/send` - Send message (validates language)
- `PUT /api/chats/:chatId/reassign` - Reassign chat (supervisor/admin)
- `PUT /api/chats/:chatId/close` - Close chat

---

## User Roles & Permissions

### Admin
- Create instances (WhatsApp numbers)
- Create users (supervisors, agents)
- Edit/delete instances
- View all chats
- Reassign chats

### Supervisor
- View all chats for their instance
- Reassign chats between agents
- Close chats
- Cannot create instances or users

### Agent
- View only their assigned chats
- Send messages
- Create new chats with clients
- Cannot reassign or manage other chats

---

## Workflow

### 1. Admin Creates Instance
1. Login as admin
2. Go to "Instances" tab
3. Click "Create Instance"
4. Enter phone number and name
5. Instance is created and marked as active

### 2. Admin Creates Users
1. Go to "Users" tab
2. Click "Create User"
3. Select role (supervisor or agent)
4. Assign to instance
5. Share temporary password with user

### 3. Agent Starts Chat
1. Login as agent
2. Click "New Chat"
3. Enter client phone number
4. Send initial message
5. Chat is created and assigned to agent

### 4. Agent Manages Clients
1. When starting a chat, can save client info:
   - Name
   - NIU (customer ID)
   - Reference (internal note)
2. This info appears in chat header

### 5. Language Validation
- System blocks messages with inappropriate words
- Flagged messages are marked with ⚠️
- Supervisor can review flagged messages

---

## Language Validation

**Blocked Words (Spanish):**
- moroso, estafador, fraude, ladrón, incompetente
- idiota, imbécil, tonto, basura, mierda
- pendejo, cabrón, estúpido, retrasado, débil, fracaso

**Aggressive Tone Indicators:**
- Multiple exclamation marks (!!!)
- Multiple question marks (???)
- All caps words (HELLO)

**Warnings:**
- Missing professional greeting (for messages > 20 chars)

---

## Environment Variables

**File:** `server/.env`

```
PORT=5000
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/whatsapp_crm
JWT_SECRET=your_jwt_secret_key_here_change_in_production
NODE_ENV=development
```

**For Production:**
- Change `JWT_SECRET` to a strong random string
- Update database credentials
- Set `NODE_ENV=production`

---

## Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution:** Ensure PostgreSQL is running
- Windows: Check Services (postgresql-x64-XX)
- Mac: `brew services start postgresql`
- Linux: `sudo systemctl start postgresql`

### Port Already in Use
```
Error: listen EADDRINUSE :::5000
```
**Solution:** Change PORT in `.env` or kill process using port 5000

### npm install fails
```
npm ERR! 404 Not Found
```
**Solution:** Clear npm cache and retry
```bash
npm cache clean --force
npm install
```

### Frontend can't connect to backend
- Ensure backend is running on port 5000
- Check CORS is enabled in `server/index.js`
- Verify API_BASE_URL in `client/src/api.js`

---

## File Structure

```
project/
├── server/
│   ├── db/
│   │   ├── connection.js
│   │   ├── schema.sql
│   │   └── setup.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── instances.js
│   │   ├── users.js
│   │   ├── chats.js
│   │   └── clients.js
│   ├── services/
│   │   ├── whatsappService.js (simplified)
│   │   └── languageService.js
│   ├── index.js
│   ├── package.json
│   └── .env
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx (admin/supervisor)
│   │   │   └── AgentDashboard.jsx
│   │   ├── components/
│   │   │   ├── ChatWindow.jsx
│   │   │   ├── CreateInstance.jsx
│   │   │   ├── ManageUsers.jsx
│   │   │   └── ChatManager.jsx
│   │   ├── api.js
│   │   ├── store.js
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
└── SETUP_GUIDE.md
```

---

## Next Steps

1. **Customize Language Validation**
   - Edit `server/services/languageService.js`
   - Add/remove words from `badWords` array

2. **Add More Instances**
   - Admin can create multiple WhatsApp instances
   - Each instance can have ~40 agents

3. **Implement Real-time Updates**
   - Consider WebSocket for live chat updates
   - Currently uses polling (5-second intervals)

4. **Add Message History Export**
   - Export chats as PDF/CSV
   - Archive old conversations

5. **Implement Analytics**
   - Track response times
   - Monitor agent performance
   - Chat volume reports

---

## Support

For issues or questions:
1. Check the Troubleshooting section
2. Review error messages in browser console
3. Check server logs in terminal
4. Verify database connection with `npm run setup-db`

