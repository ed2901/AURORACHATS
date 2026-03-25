-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  employee_code VARCHAR(100) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'supervisor', 'agent')),
  instance_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Instances (WhatsApp numbers)
CREATE TABLE instances (
  id SERIAL PRIMARY KEY,
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  admin_id INTEGER NOT NULL REFERENCES users(id),
  qr_code TEXT,
  is_active BOOLEAN DEFAULT FALSE,
  session_data TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clients
CREATE TABLE clients (
  id SERIAL PRIMARY KEY,
  instance_id INTEGER NOT NULL REFERENCES instances(id),
  phone_number VARCHAR(20) NOT NULL,
  name VARCHAR(255),
  niu VARCHAR(100),
  reference VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(instance_id, phone_number)
);

-- Chats
CREATE TABLE chats (
  id SERIAL PRIMARY KEY,
  instance_id INTEGER NOT NULL REFERENCES instances(id),
  client_id INTEGER NOT NULL REFERENCES clients(id),
  assigned_agent_id INTEGER REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'closed', 'archived')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  chat_id INTEGER NOT NULL REFERENCES chats(id),
  sender_id INTEGER REFERENCES users(id),
  sender_type VARCHAR(50) NOT NULL CHECK (sender_type IN ('agent', 'client')),
  content TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'text' CHECK (message_type IN ('text', 'pdf')),
  file_url VARCHAR(500),
  is_flagged BOOLEAN DEFAULT FALSE,
  flag_reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat assignments history
CREATE TABLE chat_assignments (
  id SERIAL PRIMARY KEY,
  chat_id INTEGER NOT NULL REFERENCES chats(id),
  assigned_to_id INTEGER NOT NULL REFERENCES users(id),
  assigned_by_id INTEGER NOT NULL REFERENCES users(id),
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_instance ON users(instance_id);
CREATE INDEX idx_instances_admin ON instances(admin_id);
CREATE INDEX idx_clients_instance ON clients(instance_id);
CREATE INDEX idx_chats_instance ON chats(instance_id);
CREATE INDEX idx_chats_agent ON chats(assigned_agent_id);
CREATE INDEX idx_messages_chat ON messages(chat_id);
CREATE INDEX idx_assignments_chat ON chat_assignments(chat_id);
