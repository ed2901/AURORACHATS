# Quick Start - 5 Minutes

## Step 1: Setup Database (1 min)

```bash
cd server
npm run setup-db
```

**Expected output:**
```
✓ Base de datos creada
✓ Schema ejecutado correctamente
✓ Usuario admin creado
  Email: admin@crm.local
  Password: admin123
```

## Step 2: Start Backend (1 min)

```bash
# Still in server directory
npm install
npm run dev
```

**Expected output:**
```
Server running on port 5000
```

## Step 3: Start Frontend (1 min)

```bash
# New terminal window
cd client
npm install
npm run dev
```

**Expected output:**
```
VITE v... ready in ... ms

➜  Local:   http://localhost:5173/
```

## Step 4: Login (1 min)

1. Open browser: `http://localhost:5173`
2. Login with:
   - Email: `admin@crm.local`
   - Password: `admin123`

## Step 5: Create Your First Instance (1 min)

1. Click "Create Instance"
2. Enter:
   - Name: "My WhatsApp"
   - Phone: "1234567890"
3. Click "Create"

**Done!** Your CRM is ready to use.

---

## Next: Create Users

1. Go to "Users" tab
2. Click "Create User"
3. Enter:
   - Email: agent@example.com
   - Name: Agent Name
   - Employee Code: AGENT001
   - Role: agent
4. Share the temporary password with the agent

---

## Common Issues

**"Cannot connect to database"**
- Make sure PostgreSQL is running
- Windows: Check Services for "postgresql"

**"Port 5000 already in use"**
- Change PORT in `server/.env`
- Or kill the process: `lsof -ti:5000 | xargs kill -9`

**"npm install fails"**
- Run: `npm cache clean --force`
- Then: `npm install`

---

## System is Ready When:

✅ Backend running on port 5000
✅ Frontend running on port 5173
✅ Can login with admin@crm.local
✅ Can create instances
✅ Can create users

See `SETUP_GUIDE.md` for detailed documentation.
