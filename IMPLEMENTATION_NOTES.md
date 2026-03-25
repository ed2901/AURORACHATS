# Implementation Notes

## System Design Decisions

### 1. No WhatsApp Web Integration
**Decision:** The CRM manages the database only. Agents use WhatsApp Web manually in their browsers.

**Rationale:**
- Avoids complex automation libraries (Baileys, whatsapp-web.js)
- Eliminates Puppeteer/Chrome dependency issues
- Simpler deployment and maintenance
- More reliable than browser automation
- Agents have full control over WhatsApp Web

**Implementation:**
- `whatsappService.js` is simplified to just logging
- No QR code generation or polling
- Instances marked as `is_active` when created
- Reconnect endpoint just marks instance as active

### 2. Database-Centric Architecture
**Decision:** All data flows through PostgreSQL, not through WhatsApp API.

**Benefits:**
- Full message history stored locally
- Language validation happens before any external call
- No dependency on WhatsApp API rate limits
- Complete audit trail of all conversations
- Easy to implement analytics and reporting

**Data Flow:**
```
Agent → CRM API → Language Validation → Database → Message History
```

### 3. Role-Based Access Control
**Decision:** Three roles with specific permissions.

**Roles:**
- **Admin:** System-wide management (instances, users)
- **Supervisor:** Instance-level management (chat reassignment, monitoring)
- **Agent:** Chat-level operations (send messages, create chats)

**Implementation:**
- JWT tokens include role and instanceId
- Middleware enforces role-based access
- Routes check permissions before executing

### 4. Language Validation Strategy
**Decision:** Block high-severity issues, warn on medium/low.

**Severity Levels:**
- **High:** Blocks message (profanity, offensive words)
- **Medium:** Flags message (aggressive tone)
- **Low:** Warning only (missing greeting)

**Implementation:**
- Validation happens in `languageService.js`
- Flagged messages stored with reason
- Supervisor can review flagged messages
- Easy to customize word lists

## Technical Decisions

### 1. State Management (Zustand)
**Why Zustand?**
- Lightweight and simple
- No boilerplate like Redux
- Perfect for this app's complexity level
- Easy to debug

**Stores:**
- `useAuthStore` - User and token
- `useInstanceStore` - Instances and current selection
- `useChatStore` - Chats and messages

### 2. Polling vs WebSocket
**Current:** Polling (5-second intervals)
**Why?**
- Simpler to implement
- Works in all environments
- No server-side complexity
- Sufficient for this use case

**Future:** Can upgrade to WebSocket for real-time updates

### 3. Database Schema Design
**Key Decisions:**
- Separate `users` and `instances` tables (many-to-many via instance_id)
- `chat_assignments` table for audit trail
- `messages` table with `is_flagged` and `flag_reason`
- Indexes on frequently queried columns

**Relationships:**
```
users (1) ──→ (many) instances
instances (1) ──→ (many) clients
instances (1) ──→ (many) chats
clients (1) ──→ (many) chats
chats (1) ──→ (many) messages
users (1) ──→ (many) chats (as assigned_agent)
```

### 4. Authentication Flow
**JWT-Based:**
1. User logs in with email/password
2. Server validates credentials
3. Server generates JWT with user data
4. Client stores JWT in memory
5. Client includes JWT in all API requests
6. Server validates JWT on each request

**Token Payload:**
```json
{
  "id": 1,
  "email": "agent@example.com",
  "role": "agent",
  "instanceId": 5
}
```

## File Organization

### Backend Structure
```
server/
├── db/
│   ├── connection.js      # Pool configuration
│   ├── schema.sql         # Table definitions
│   └── setup.js           # Database initialization
├── middleware/
│   └── auth.js            # JWT verification & role checking
├── routes/
│   ├── auth.js            # Login/register endpoints
│   ├── instances.js       # Instance CRUD
│   ├── users.js           # User management
│   ├── chats.js           # Chat operations
│   └── clients.js         # Client management
├── services/
│   ├── whatsappService.js # Simplified (no integration)
│   └── languageService.js # Message validation
└── index.js               # Express app setup
```

### Frontend Structure
```
client/src/
├── pages/
│   ├── Login.jsx          # Authentication
│   ├── Dashboard.jsx      # Admin/Supervisor view
│   └── AgentDashboard.jsx # Agent view
├── components/
│   ├── ChatWindow.jsx     # Message display & input
│   ├── CreateInstance.jsx # Instance creation
│   ├── ManageUsers.jsx    # User management
│   └── ChatManager.jsx    # Chat reassignment
├── api.js                 # API client with interceptors
├── store.js               # Zustand stores
└── App.jsx                # Routing & layout
```

## API Design Patterns

### Request/Response Format
```javascript
// Success Response
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com"
}

// Error Response
{
  "error": "Invalid credentials"
}

// List Response
[
  { "id": 1, "name": "Item 1" },
  { "id": 2, "name": "Item 2" }
]
```

### Authentication Header
```
Authorization: Bearer <jwt_token>
```

### Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not found
- `500` - Server error

## Security Considerations

### 1. Password Hashing
- Uses bcryptjs with 10 salt rounds
- Passwords never stored in plain text
- Temporary passwords generated for new users

### 2. JWT Security
- Tokens expire after 24 hours
- Secret key should be strong (32+ characters)
- Tokens stored in memory (not localStorage)

### 3. SQL Injection Prevention
- Uses parameterized queries
- All user input sanitized by pg library

### 4. CORS Configuration
- Allows requests from frontend origin
- Credentials included in requests

### 5. Role-Based Access
- Every endpoint checks user role
- Instance-level isolation enforced
- Agents can only see their chats

## Performance Optimizations

### 1. Database Indexes
```sql
CREATE INDEX idx_users_instance ON users(instance_id);
CREATE INDEX idx_chats_agent ON chats(assigned_agent_id);
CREATE INDEX idx_messages_chat ON messages(chat_id);
```

### 2. Query Optimization
- Joins used to fetch related data
- Pagination can be added for large datasets
- Caching can be implemented for frequently accessed data

### 3. Frontend Optimization
- Zustand for efficient state updates
- React.memo for component optimization
- Lazy loading for routes (future)

## Scalability Considerations

### Current Limitations
- Polling every 5 seconds (not real-time)
- Single database connection pool
- No caching layer

### Future Improvements
1. **WebSocket for Real-time Updates**
   - Replace polling with Socket.io
   - Reduce server load
   - Instant message delivery

2. **Redis Caching**
   - Cache frequently accessed data
   - Reduce database queries
   - Session management

3. **Message Queue**
   - Bull/RabbitMQ for async operations
   - Handle language validation asynchronously
   - Batch message processing

4. **Database Optimization**
   - Connection pooling (already using pg Pool)
   - Read replicas for scaling
   - Partitioning large tables

5. **Load Balancing**
   - Multiple server instances
   - Nginx reverse proxy
   - Session persistence

## Testing Strategy

### Unit Tests (Future)
- Language validation logic
- Authentication middleware
- API endpoint handlers

### Integration Tests (Future)
- Database operations
- API workflows
- Role-based access

### E2E Tests (Future)
- User login flow
- Chat creation and messaging
- Instance management

## Deployment Checklist

- [ ] Change JWT_SECRET to strong random string
- [ ] Update database credentials
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain
- [ ] Set up database backups
- [ ] Configure logging
- [ ] Set up monitoring
- [ ] Test all workflows
- [ ] Document deployment process

## Maintenance Tasks

### Regular
- Monitor database size
- Review flagged messages
- Check error logs
- Update dependencies

### Periodic
- Database optimization (VACUUM, ANALYZE)
- Archive old messages
- Update language validation lists
- Security audits

## Known Limitations

1. **No Real-time Updates** - Uses polling instead of WebSocket
2. **No Message Encryption** - Messages stored in plain text
3. **No File Uploads** - Only text messages supported
4. **No Message Editing** - Messages immutable once sent
5. **No Bulk Operations** - No batch message sending
6. **No Analytics** - No built-in reporting

## Future Enhancements

1. **WhatsApp Business API Integration** (optional)
   - Send messages via official API
   - Receive webhooks for incoming messages
   - Requires WhatsApp Business Account

2. **Advanced Analytics**
   - Response time metrics
   - Agent performance tracking
   - Chat volume reports
   - Customer satisfaction scores

3. **Automation**
   - Auto-reply templates
   - Scheduled messages
   - Workflow automation

4. **Integration**
   - CRM system integration
   - Ticketing system integration
   - Slack notifications

5. **Mobile App**
   - React Native app
   - Push notifications
   - Offline support

## Troubleshooting Guide

### Common Issues

**Issue:** "Cannot connect to database"
- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Check database credentials

**Issue:** "Invalid token"
- Token may have expired (24 hours)
- User needs to login again
- Check JWT_SECRET matches

**Issue:** "Insufficient permissions"
- User role doesn't have access
- Check user role in database
- Verify role-based middleware

**Issue:** "Message blocked"
- Message contains blocked word
- Check languageService.js for word list
- Customize as needed

## Code Quality

### Conventions
- Camel case for variables and functions
- PascalCase for components and classes
- Kebab-case for file names (except React components)
- Comments for complex logic
- Descriptive variable names

### Error Handling
- Try-catch blocks for async operations
- Meaningful error messages
- Proper HTTP status codes
- Error logging for debugging

### Code Organization
- Separation of concerns
- Single responsibility principle
- DRY (Don't Repeat Yourself)
- Modular components

---

**Last Updated:** March 2026
**Version:** 1.0.0
