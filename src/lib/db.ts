import { Pool } from 'pg';

// Lazy pool initialization
let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL || '';
    if (!connectionString) {
      throw new Error('No database connection string found');
    }
    pool = new Pool({ 
      connectionString,
      ssl: { rejectUnauthorized: false }
    });
  }
  return pool;
}

// Helper to run queries
async function query(text: string, params?: any[]) {
  const client = await getPool().connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

// Types
export interface User {
  user_id: string;
  email: string;
  name: string;
  picture: string | null;
  created_at: Date;
}

export interface UserSession {
  id: number;
  user_id: string;
  session_token: string;
  expires_at: Date;
  created_at: Date;
}

export interface SiteAddress {
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
}

export interface BidItem {
  serviceName: string;
  selected: boolean;
  estCost: number;
  details: Record<string, any>;
  notes: string;
  aiRecommendations: string;
}

export interface Project {
  project_id: string;
  user_id: string;
  client_name: string;
  phone_number: string;
  project_date: string;
  status: string;
  site_address: SiteAddress;
  bids: Record<string, BidItem>;
  created_at: Date;
  updated_at: Date;
}

// Initialize database tables
export async function initializeDatabase() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id VARCHAR(50) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        picture TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(50) REFERENCES users(user_id),
        session_token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS projects (
        project_id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(50) REFERENCES users(user_id),
        client_name VARCHAR(255) NOT NULL,
        phone_number VARCHAR(50),
        project_date DATE NOT NULL,
        status VARCHAR(50) DEFAULT 'QUOTING',
        site_address JSONB DEFAULT '{}'::jsonb,
        bids JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token)`);

    return { success: true };
  } catch (error) {
    console.error('Database initialization error:', error);
    return { success: false, error: String(error) };
  }
}

// User functions
export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
}

export async function findUserById(userId: string): Promise<User | null> {
  const result = await query('SELECT * FROM users WHERE user_id = $1', [userId]);
  return result.rows[0] || null;
}

export async function createUser(user: Omit<User, 'created_at'>): Promise<User> {
  const result = await query(
    `INSERT INTO users (user_id, email, name, picture)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO UPDATE SET name = $3, picture = $4
     RETURNING *`,
    [user.user_id, user.email, user.name, user.picture]
  );
  return result.rows[0];
}

// Session functions
export async function createSession(userId: string, sessionToken: string, expiresAt: Date): Promise<void> {
  await query(
    `INSERT INTO user_sessions (user_id, session_token, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, sessionToken, expiresAt.toISOString()]
  );
}

export async function findSessionByToken(token: string): Promise<UserSession | null> {
  const result = await query(
    `SELECT * FROM user_sessions WHERE session_token = $1 AND expires_at > NOW()`,
    [token]
  );
  return result.rows[0] || null;
}

export async function deleteSession(token: string): Promise<void> {
  await query('DELETE FROM user_sessions WHERE session_token = $1', [token]);
}

// Project functions
export async function getProjectsByUser(userId: string): Promise<Project[]> {
  const result = await query(
    'SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
}

export async function getProjectById(projectId: string, userId: string): Promise<Project | null> {
  const result = await query(
    'SELECT * FROM projects WHERE project_id = $1 AND user_id = $2',
    [projectId, userId]
  );
  return result.rows[0] || null;
}

export async function createProject(project: Omit<Project, 'created_at' | 'updated_at'>): Promise<Project> {
  const result = await query(
    `INSERT INTO projects (project_id, user_id, client_name, phone_number, project_date, status, site_address, bids)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      project.project_id,
      project.user_id,
      project.client_name,
      project.phone_number,
      project.project_date,
      project.status,
      JSON.stringify(project.site_address),
      JSON.stringify(project.bids)
    ]
  );
  return result.rows[0];
}

export async function updateProject(
  projectId: string,
  userId: string,
  updates: Partial<Pick<Project, 'client_name' | 'phone_number' | 'status' | 'site_address' | 'bids'>>
): Promise<Project | null> {
  const project = await getProjectById(projectId, userId);
  if (!project) return null;
  
  const newClientName = updates.client_name ?? project.client_name;
  const newPhoneNumber = updates.phone_number ?? project.phone_number;
  const newStatus = updates.status ?? project.status;
  const newSiteAddress = updates.site_address ? JSON.stringify(updates.site_address) : JSON.stringify(project.site_address);
  const newBids = updates.bids ? JSON.stringify(updates.bids) : JSON.stringify(project.bids);

  const result = await query(
    `UPDATE projects SET 
      client_name = $1,
      phone_number = $2,
      status = $3,
      site_address = $4::jsonb,
      bids = $5::jsonb,
      updated_at = NOW()
     WHERE project_id = $6 AND user_id = $7
     RETURNING *`,
    [newClientName, newPhoneNumber, newStatus, newSiteAddress, newBids, projectId, userId]
  );
  
  return result.rows[0] || null;
}

export async function deleteProject(projectId: string, userId: string): Promise<boolean> {
  const result = await query(
    'DELETE FROM projects WHERE project_id = $1 AND user_id = $2',
    [projectId, userId]
  );
  return (result.rowCount ?? 0) > 0;
}
