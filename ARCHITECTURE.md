# System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         AURORA CHAT CRM                         │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER (React)                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  │  Login Page     │  │  Admin Dashboard │  │ Agent Dashboard  │
│  │                 │  │                  │  │                  │
│  │ • Email input   │  │ • Instances      │  │ • My Chats       │
│  │ • Password      │  │ • Users          │  │ • New Chat       │
│  │ • JWT storage   │  │ • Chat Manager   │  │ • Message Input  │
│  └─────────────────┘  └──────────────────┘  └──────────────────┘
│
│  ┌──────────────────────────────────────────────────────────────┐
│  │              Zustand State Management                        │
│  │  • useAuthStore (user, token)                               │
│  │  • useInstanceStore (instances, current)                    │
│  │  • useChatStore (chats, messages)                           │
│  └──────────────────────────────────────────────────────────────┘
│
│  ┌──────────────────────────────────────────────────────────────┐
│  │              API Client (axios)                              │
│  │  • Interceptors for JWT token                               │
│  │  • Error handling                                           │
│  │  • Base URL: http://localhost:5000/api                      │
│  └──────────────────────────────────────────────────────────────┘
└──────────────────────────────────────────────────────────────────┘
                              ↓ HTTP/REST
┌──────────────────────────────────────────────────────────────────┐
│                    SERVER LAYER (Express)                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────────┐
│  │                    CORS & Middleware                         │
│  │  • CORS enabled for frontend                                │
│  │  • JSON body parser                                         │
│  │  • JWT verification                                         │
│  │  • Role-based access control                                │
│  └──────────────────────────────────────────────────────────────┘
│
│  ┌──────────────────────────────────────────────────────────────┐
│  │                    API Routes                                │
│  │                                                              │
│  │  ┌─────────────────┐  ┌──────────────────┐                 │
│  │  │ Auth Routes     │  │ Instance Routes  │                 │
│  │  │ • POST /login   │  │ • POST /create   │                 │
│  │  │ • POST /register│  │ • GET /list      │                 │
│  │  └─────────────────┘  │ • PUT /update    │                 │
│  │                       │ • DELETE /remove │                 │
│  │  ┌─────────────────┐  │ • POST /reconnect│                 │
│  │  │ User Routes     │  └──────────────────┘                 │
│  │  │ • POST /create  │                                       │
│  │  │ • GET /list     │  ┌──────────────────┐                 │
│  │  │ • PUT /update   │  │ Chat Routes      │                 │
│  │  └─────────────────┘  │ • GET /my-chats  │                 │
│  │                       │ • GET /messages  │                 │
│  │  ┌─────────────────┐  │ • POST /send     │                 │
│  │  │ Client Routes   │  │ • PUT /reassign  │                 │
│  │  │ • POST /create  │  │ • PUT /close     │                 │
│  │  │ • GET /list     │  └──────────────────┘                 │
│  │  │ • POST /start   │                                       │
│  │  └─────────────────┘                                       │
│  └──────────────────────────────────────────────────────────────┘
│
│  ┌──────────────────────────────────────────────────────────────┐
│  │                    Services                                  │
│  │                                                              │
│  │  ┌──────────────────────┐  ┌──────────────────────────────┐ │
│  │  │ Language Service     │  │ WhatsApp Service (Simplified)│ │
│  │  │                      │  │                              │ │
│  │  │ • Validate message   │  │ • Log instance creation      │ │
│  │  │ • Check bad words    │  │ • No actual integration      │ │
│  │  │ • Check tone         │  │ • Database-only management   │ │
│  │  │ • Flag if needed     │  └──────────────────────────────┘ │
│  │  └──────────────────────┘                                   │
│  └──────────────────────────────────────────────────────────────┘
└──────────────────────────────────────────────────────────────────┘
                              ↓ SQL
┌──────────────────────────────────────────────────────────────────┐
│                  DATABASE LAYER (PostgreSQL)                     │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────────┐
│  │                    Connection Pool                           │
│  │  • pg.Pool with connection pooling                          │
│  │  • Automatic connection management                          │
│  │  • Error handling                                           │
│  └──────────────────────────────────────────────────────────────┘
│
│  ┌──────────────────────────────────────────────────────────────┐
│  │                    Tables                                    │
│  │                                                              │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  │ users        │  │ instances    │  │ clients      │      │
│  │  │              │  │              │  │              │      │
│  │  │ • id         │  │ • id         │  │ • id         │      │
│  │  │ • email      │  │ • phone      │  │ • phone      │      │
│  │  │ • password   │  │ • name       │  │ • name       │      │
│  │  │ • role       │  │ • admin_id   │  │ • niu        │      │
│  │  │ • instance_id│  │ • is_active  │  │ • reference  │      │
│  │  └──────────────┘  └──────────────┘  └──────────────┘      │
│  │                                                              │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  │ chats        │  │ messages     │  │ assignments  │      │
│  │  │              │  │              │  │              │      │
│  │  │ • id         │  │ • id         │  │ • id         │      │
│  │  │ • client_id  │  │ • chat_id    │  │ • chat_id    │      │
│  │  │ • agent_id   │  │ • sender_id  │  │ • agent_id   │      │
│  │  │ • status     │  │ • content    │  │ • assigned_by│      │
│  │  │ • created_at │  │ • is_flagged │  │ • assigned_at│      │
│  │  └──────────────┘  └──────────────┘  └──────────────┘      │
│  │                                                              │
│  │  Indexes:                                                   │
│  │  • idx_users_instance                                       │
│  │  • idx_instances_admin                                      │
│  │  • idx_chats_agent                                          │
│  │  • idx_messages_chat                                        │
│  │  • idx_assignments_chat                                     │
│  └──────────────────────────────────────────────────────────────┘
└──────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

### User Login Flow
```
┌─────────────┐
│ User enters │
│ credentials │
└──────┬──────┘
       ↓
┌──────────────────────┐
│ Frontend sends POST  │
│ /api/auth/login      │
└──────┬───────────────┘
       ↓
┌──────────────────────────────────┐
│ Backend validates credentials    │
│ • Query users table              │
│ • Compare password hash          │
└──────┬───────────────────────────┘
       ↓
┌──────────────────────────────────┐
│ Generate JWT token               │
│ • Include: id, email, role       │
│ • Expires: 24 hours              │
└──────┬───────────────────────────┘
       ↓
┌──────────────────────────────────┐
│ Return token to frontend         │
│ • Store in memory                │
│ • Include in all requests        │
└──────┬───────────────────────────┘
       ↓
┌──────────────────────────────────┐
│ Redirect to dashboard            │
│ • Load instances                 │
│ • Load users                     │
│ • Load chats                     │
└──────────────────────────────────┘
```

### Message Send Flow
```
┌──────────────────────┐
│ Agent types message  │
│ in chat window       │
└──────┬───────────────┘
       ↓
┌──────────────────────────────────┐
│ Frontend sends POST              │
│ /api/chats/:id/send              │
│ • Include JWT token              │
│ • Include message content        │
└──────┬───────────────────────────┘
       ↓
┌──────────────────────────────────┐
│ Backend validates request        │
│ • Verify JWT token               │
│ • Check user role (agent)        │
│ • Check chat assignment          │
└──────┬───────────────────────────┘
       ↓
┌──────────────────────────────────┐
│ Language validation              │
│ • Check for bad words            │
│ • Check for aggressive tone      │
│ • Determine if flagged           │
└──────┬───────────────────────────┘
       ↓
┌──────────────────────────────────┐
│ Save to database                 │
│ • INSERT into messages table     │
│ • Set is_flagged if needed       │
│ • Set flag_reason if flagged     │
└──────┬───────────────────────────┘
       ↓
┌──────────────────────────────────┐
│ Return message to frontend       │
│ • Include message ID             │
│ • Include timestamp              │
│ • Include flag status            │
└──────┬───────────────────────────┘
       ↓
┌──────────────────────────────────┐
│ Frontend displays message        │
│ • Show in chat window            │
│ • Show warning if flagged        │
│ • Update message list            │
└──────────────────────────────────┘
```

### Chat Assignment Flow
```
┌──────────────────────────────┐
│ Supervisor selects chat      │
│ and new agent                │
└──────┬───────────────────────┘
       ↓
┌──────────────────────────────────┐
│ Frontend sends PUT               │
│ /api/chats/:id/reassign          │
│ • Include new agent ID           │
│ • Include JWT token              │
└──────┬───────────────────────────┘
       ↓
┌──────────────────────────────────┐
│ Backend validates request        │
│ • Verify JWT token               │
│ • Check user role (supervisor)   │
│ • Verify chat exists             │
└──────┬───────────────────────────┘
       ↓
┌──────────────────────────────────┐
│ Update database                  │
│ • UPDATE chats table             │
│ • Set assigned_agent_id          │
│ • INSERT into assignments table  │
│ • Record who reassigned          │
└──────┬───────────────────────────┘
       ↓
┌──────────────────────────────────┐
│ Return updated chat              │
│ • Include new agent info         │
│ • Include timestamp              │
└──────┬───────────────────────────┘
       ↓
┌──────────────────────────────────┐
│ Frontend updates display         │
│ • Show new agent name            │
│ • Refresh chat list              │
│ • Notify new agent               │
└──────────────────────────────────┘
```

---

## Authentication & Authorization

### JWT Token Structure
```
Header:
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload:
{
  "id": 1,
  "email": "agent@example.com",
  "role": "agent",
  "instanceId": 5,
  "iat": 1234567890,
  "exp": 1234654290
}

Signature:
HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)
```

### Role-Based Access Control
```
┌─────────────────────────────────────────────────────────────┐
│                    RBAC Matrix                              │
├─────────────────────────────────────────────────────────────┤
│ Resource          │ Admin │ Supervisor │ Agent │            │
├─────────────────────────────────────────────────────────────┤
│ Create Instance   │  ✓    │     ✗      │  ✗   │            │
│ Edit Instance     │  ✓    │     ✗      │  ✗   │            │
│ Delete Instance   │  ✓    │     ✗      │  ✗   │            │
│ Create User       │  ✓    │     ✗      │  ✗   │            │
│ View All Chats    │  ✓    │     ✓      │  ✗   │            │
│ View My Chats     │  ✓    │     ✓      │  ✓   │            │
│ Reassign Chat     │  ✓    │     ✓      │  ✗   │            │
│ Send Message      │  ✓    │     ✓      │  ✓   │            │
│ Close Chat        │  ✓    │     ✓      │  ✗   │            │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Relationships

```
users (1) ──────────────────────────────────────── (many) instances
  │                                                    │
  │                                                    │
  │                                                    │ (1)
  │                                                    │
  │                                                    ├──────────────────────────────────────── (many) clients
  │                                                    │
  │                                                    │
  │                                                    └──────────────────────────────────────── (many) chats
  │                                                                                                  │
  │                                                                                                  │
  │                                                                                                  │ (1)
  │                                                                                                  │
  │                                                                                                  ├──────────────────────────────────────── (many) messages
  │                                                                                                  │
  │                                                                                                  │
  │                                                                                                  └──────────────────────────────────────── (many) chat_assignments
  │                                                                                                                                                    │
  │                                                                                                                                                    │
  │                                                                                                                                                    │ (1)
  │                                                                                                                                                    │
  └────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

Legend:
(1) = One
(many) = Many
──── = Relationship
```

---

## Deployment Architecture

### Development
```
┌─────────────────────────────────────────────────────────────┐
│                    Developer Machine                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │ Frontend Dev     │  │ Backend Dev      │               │
│  │ npm run dev      │  │ npm run dev      │               │
│  │ :5173            │  │ :5000            │               │
│  └──────────────────┘  └──────────────────┘               │
│           ↓                      ↓                         │
│  ┌──────────────────────────────────────┐                │
│  │    PostgreSQL (localhost:5432)       │                │
│  └──────────────────────────────────────┘                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Production
```
┌─────────────────────────────────────────────────────────────┐
│                    Production Server                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────┐                │
│  │    Nginx (Reverse Proxy)             │                │
│  │    • HTTPS (Let's Encrypt)           │                │
│  │    • Load balancing                  │                │
│  │    • Static file serving             │                │
│  └──────────────────────────────────────┘                │
│           ↓                                               │
│  ┌──────────────────────────────────────┐                │
│  │    Node.js (PM2)                     │                │
│  │    • Multiple instances              │                │
│  │    • Auto-restart                    │                │
│  │    • Monitoring                      │                │
│  └──────────────────────────────────────┘                │
│           ↓                                               │
│  ┌──────────────────────────────────────┐                │
│  │    PostgreSQL                        │                │
│  │    • Backups                         │                │
│  │    • Replication (optional)          │                │
│  │    • Monitoring                      │                │
│  └──────────────────────────────────────┘                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Scalability Considerations

### Current Bottlenecks
1. **Polling** - 5-second intervals for updates
2. **Single Database** - No read replicas
3. **No Caching** - Every request hits database
4. **Single Server** - No load balancing

### Scaling Solutions

#### Horizontal Scaling
```
┌─────────────────────────────────────────────────────────────┐
│                    Load Balancer                            │
│                    (Nginx/HAProxy)                          │
└──────────────────────────────────────────────────────────────┘
         ↓              ↓              ↓
    ┌────────┐     ┌────────┐     ┌────────┐
    │Node.js │     │Node.js │     │Node.js │
    │Server1 │     │Server2 │     │Server3 │
    └────────┘     └────────┘     └────────┘
         ↓              ↓              ↓
    └──────────────────────────────────────┘
              ↓
         ┌─────────────┐
         │ PostgreSQL  │
         │ (Primary)   │
         └─────────────┘
              ↓
         ┌─────────────┐
         │ PostgreSQL  │
         │ (Replica)   │
         └─────────────┘
```

#### Caching Layer
```
┌──────────────────────────────────────┐
│    Application Server                │
└──────────────────────────────────────┘
         ↓
┌──────────────────────────────────────┐
│    Redis Cache                       │
│    • User sessions                   │
│    • Instance data                   │
│    • Chat metadata                   │
└──────────────────────────────────────┘
         ↓
┌──────────────────────────────────────┐
│    PostgreSQL Database               │
└──────────────────────────────────────┘
```

#### Real-time Updates
```
┌──────────────────────────────────────┐
│    Frontend (React)                  │
└──────────────────────────────────────┘
         ↓ WebSocket
┌──────────────────────────────────────┐
│    Socket.io Server                  │
│    • Real-time events                │
│    • Message broadcasting            │
│    • Presence tracking               │
└──────────────────────────────────────┘
         ↓
┌──────────────────────────────────────┐
│    PostgreSQL Database               │
└──────────────────────────────────────┘
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Layers                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Layer 1: Network Security                                 │
│  • HTTPS/TLS encryption                                    │
│  • Firewall rules                                          │
│  • DDoS protection                                         │
│                                                             │
│  Layer 2: Application Security                             │
│  • JWT authentication                                      │
│  • Role-based access control                               │
│  • Input validation                                        │
│  • SQL injection prevention                                │
│                                                             │
│  Layer 3: Data Security                                    │
│  • Password hashing (bcryptjs)                             │
│  • Database encryption                                     │
│  • Backup encryption                                       │
│  • Audit logging                                           │
│                                                             │
│  Layer 4: Monitoring                                       │
│  • Error logging                                           │
│  • Access logging                                          │
│  • Performance monitoring                                  │
│  • Security alerts                                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

**Last Updated:** March 2026  
**Version:** 1.0.0
