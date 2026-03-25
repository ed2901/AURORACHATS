# Aurora Chat - WhatsApp CRM Multi-User System

A professional CRM system for managing multiple WhatsApp conversations on a single phone number instance with role-based access control, chat management, and language validation.

## 🎯 Key Features

- **Multi-Instance Support** - Manage multiple WhatsApp phone numbers
- **Role-Based Access** - Admin, Supervisor, and Agent roles with specific permissions
- **Chat Management** - Assign, reassign, and close chats
- **Client Management** - Store client info (NIU, reference, contact details)
- **Language Validation** - Block inappropriate messages and flag for review
- **Message History** - Full conversation history with timestamps
- **Real-time Updates** - Polling-based chat updates (5-second intervals)

## 🚀 Quick Start

### Prerequisites
- PostgreSQL 12+
- Node.js 18+
- npm 8+

### Installation (5 minutes)

```bash
# 1. Setup database
cd server
npm run setup-db

# 2. Start backend
npm install
npm run dev

# 3. In new terminal, start frontend
cd client
npm install
npm run dev

# 4. Open browser
# http://localhost:5173
# Login: admin@crm.local / admin123
```

See [QUICK_START.md](QUICK_START.md) for detailed steps.

## 📋 System Architecture

### Database Schema

```
Users (admin, supervisor, agent)
  ↓
Instances (WhatsApp phone numbers)
  ├── Clients (phone, name, NIU, reference)
  │   └── Chats (conversations)
  │       └── Messages (with language validation)
  └── Users (agents assigned to instance)
```

### API Endpoints

**Authentication**
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Create user (admin only)

**Instances**
- `POST /api/instances` - Create WhatsApp instance
- `GET /api/instances` - List instances
- `PUT /api/instances/:id` - Update instance
- `DELETE /api/instances/:id` - Delete instance
- `POST /api/instances/:id/reconnect` - Mark as active

**Users**
- `POST /api/users` - Create user
- `GET /api/users/instance/:id` - List users for instance
- `PUT /api/users/:id` - Update user role

**Clients**
- `POST /api/clients` - Create/update client
- `GET /api/clients/instance/:id` - List clients
- `POST /api/clients/:id/start-chat` - Start new chat

**Chats**
- `GET /api/chats/agent/my-chats` - Agent's assigned chats
- `GET /api/chats/instance/:id` - All chats for instance
- `GET /api/chats/:id/messages` - Chat messages
- `POST /api/chats/:id/send` - Send message (with validation)
- `PUT /api/chats/:id/reassign` - Reassign to agent
- `PUT /api/chats/:id/close` - Close chat

## 👥 User Roles

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
- Cannot create instances

### Agent
- View only assigned chats
- Send messages
- Create new chats
- Cannot reassign or manage other chats

## 🔒 Language Validation

The system automatically validates messages for:

**Blocked Words** (Spanish)
- Offensive terms: moroso, estafador, fraude, ladrón, etc.
- Profanity: idiota, imbécil, tonto, basura, mierda, etc.
- Derogatory: pendejo, cabrón, estúpido, retrasado, etc.

**Aggressive Tone**
- Multiple exclamation marks (!!!)
- Multiple question marks (???)
- All caps words (HELLO)

**Warnings**
- Missing professional greeting (for messages > 20 chars)

Flagged messages are marked with ⚠️ and stored for review.

## 📁 Project Structure

```
project/
├── server/
│   ├── db/
│   │   ├── connection.js       # PostgreSQL connection
│   │   ├── schema.sql          # Database schema
│   │   └── setup.js            # Database initialization
│   ├── middleware/
│   │   └── auth.js             # JWT authentication
│   ├── routes/
│   │   ├── auth.js             # Login/register
│   │   ├── instances.js        # WhatsApp instances
│   │   ├── users.js            # User management
│   │   ├── chats.js            # Chat management
│   │   └── clients.js          # Client management
│   ├── services/
│   │   ├── whatsappService.js  # WhatsApp integration (simplified)
│   │   └── languageService.js  # Language validation
│   ├── index.js                # Express server
│   ├── package.json
│   └── .env                    # Environment variables
│
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx           # Login page
│   │   │   ├── Dashboard.jsx       # Admin/Supervisor dashboard
│   │   │   └── AgentDashboard.jsx  # Agent chat interface
│   │   ├── components/
│   │   │   ├── ChatWindow.jsx      # Chat display & messaging
│   │   │   ├── CreateInstance.jsx  # Create WhatsApp instance
│   │   │   ├── ManageUsers.jsx     # User management
│   │   │   └── ChatManager.jsx     # Chat reassignment
│   │   ├── api.js                  # API client
│   │   ├── store.js                # Zustand state management
│   │   └── App.jsx                 # Main app component
│   ├── package.json
│   └── vite.config.js
│
├── QUICK_START.md              # 5-minute setup guide
├── SETUP_GUIDE.md              # Detailed documentation
└── README.md                   # This file
```

## ⚙️ Configuration

### Environment Variables

**File:** `server/.env`

```env
PORT=5000
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/whatsapp_crm
JWT_SECRET=your_jwt_secret_key_here_change_in_production
NODE_ENV=development
```

### Default Credentials

After setup, login with:
- **Email:** admin@crm.local
- **Password:** admin123

⚠️ Change these credentials in production!

## 🔧 Development

### Backend Development

```bash
cd server

# Install dependencies
npm install

# Start development server (with auto-reload)
npm run dev

# Setup database
npm run setup-db
```

### Frontend Development

```bash
cd client

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🐛 Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution:** Ensure PostgreSQL is running
- Windows: Check Services for "postgresql"
- Mac: `brew services start postgresql`
- Linux: `sudo systemctl start postgresql`

### Port Already in Use
```
Error: listen EADDRINUSE :::5000
```
**Solution:** Change PORT in `.env` or kill process using port 5000

### npm install Fails
```
npm ERR! 404 Not Found
```
**Solution:** Clear npm cache
```bash
npm cache clean --force
npm install
```

### Frontend Can't Connect to Backend
- Verify backend is running on port 5000
- Check CORS is enabled in `server/index.js`
- Verify API_BASE_URL in `client/src/api.js`

## 📊 Workflow Example

### 1. Admin Setup
1. Login as admin
2. Create instance: "Sales Team" (phone: 1234567890)
3. Create users: 2 supervisors, 10 agents
4. Assign users to instance

### 2. Supervisor Monitoring
1. Login as supervisor
2. View all chats for instance
3. Reassign chats between agents
4. Review flagged messages
5. Close completed chats

### 3. Agent Chat Management
1. Login as agent
2. View assigned chats
3. Click "New Chat" to start conversation
4. Enter client phone number
5. Save client info (name, NIU, reference)
6. Send messages (validated for language)
7. System flags inappropriate messages

## 🚀 Production Deployment

### Before Deploying

1. **Change JWT Secret**
   ```env
   JWT_SECRET=<generate-strong-random-string>
   ```

2. **Update Database Credentials**
   ```env
   DB_USER=<production-user>
   DB_PASSWORD=<strong-password>
   DB_HOST=<production-host>
   ```

3. **Set Environment**
   ```env
   NODE_ENV=production
   ```

4. **Build Frontend**
   ```bash
   cd client
   npm run build
   ```

5. **Use Process Manager**
   ```bash
   npm install -g pm2
   pm2 start server/index.js --name "aurora-chat"
   ```

## 📝 License

This project is proprietary and confidential.

## 🤝 Support

For issues or questions, refer to:
- [QUICK_START.md](QUICK_START.md) - 5-minute setup
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Detailed documentation
- Check browser console for frontend errors
- Check terminal for backend errors

## 🎓 Key Technologies

- **Backend:** Node.js, Express, PostgreSQL
- **Frontend:** React, Vite, Zustand
- **Authentication:** JWT
- **Styling:** CSS3
- **Database:** PostgreSQL 12+

---

**Version:** 1.0.0  
**Last Updated:** March 2026
