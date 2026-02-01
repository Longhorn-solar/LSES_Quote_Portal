import { createClient } from '@vercel/postgres';

// Lazy client initialization
let client: ReturnType<typeof createClient> | null = null;

async function getClient() {
  if (!client) {
    client = createClient({ 
      connectionString: process.env.POSTGRES_URL 
    });
    await client.connect();
  }
  return client;
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
    const db = await getClient();
    
    await db.sql`
      CREATE TABLE IF NOT EXISTS users (
        user_id VARCHAR(50) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        picture TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await db.sql`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(50) REFERENCES users(user_id),
        session_token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await db.sql`
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
    `;

    await db.sql`CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id)`;
    await db.sql`CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token)`;

    return { success: true };
  } catch (error) {
    console.error('Database initialization error:', error);
    return { success: false, error: String(error) };
  }
}

// User functions
export async function findUserByEmail(email: string): Promise<User | null> {
  const db = await getClient();
  const result = await db.sql`SELECT * FROM users WHERE email = ${email}`;
  return result.rows[0] as User || null;
}

export async function findUserById(userId: string): Promise<User | null> {
  const db = await getClient();
  const result = await db.sql`SELECT * FROM users WHERE user_id = ${userId}`;
  return result.rows[0] as User || null;
}

export async function createUser(user: Omit<User, 'created_at'>): Promise<User> {
  const db = await getClient();
  const result = await db.sql`
    INSERT INTO users (user_id, email, name, picture)
    VALUES (${user.user_id}, ${user.email}, ${user.name}, ${user.picture})
    ON CONFLICT (email) DO UPDATE SET name = ${user.name}, picture = ${user.picture}
    RETURNING *
  `;
  return result.rows[0] as User;
}

// Session functions
export async function createSession(userId: string, sessionToken: string, expiresAt: Date): Promise<void> {
  const db = await getClient();
  await db.sql`
    INSERT INTO user_sessions (user_id, session_token, expires_at)
    VALUES (${userId}, ${sessionToken}, ${expiresAt.toISOString()})
  `;
}

export async function findSessionByToken(token: string): Promise<UserSession | null> {
  const db = await getClient();
  const result = await db.sql`
    SELECT * FROM user_sessions WHERE session_token = ${token} AND expires_at > NOW()
  `;
  return result.rows[0] as UserSession || null;
}

export async function deleteSession(token: string): Promise<void> {
  const db = await getClient();
  await db.sql`DELETE FROM user_sessions WHERE session_token = ${token}`;
}

// Project functions
export async function getProjectsByUser(userId: string): Promise<Project[]> {
  const db = await getClient();
  const result = await db.sql`
    SELECT * FROM projects WHERE user_id = ${userId} ORDER BY created_at DESC
  `;
  return result.rows as Project[];
}

export async function getProjectById(projectId: string, userId: string): Promise<Project | null> {
  const db = await getClient();
  const result = await db.sql`
    SELECT * FROM projects WHERE project_id = ${projectId} AND user_id = ${userId}
  `;
  return result.rows[0] as Project || null;
}

export async function createProject(project: Omit<Project, 'created_at' | 'updated_at'>): Promise<Project> {
  const db = await getClient();
  const result = await db.sql`
    INSERT INTO projects (project_id, user_id, client_name, phone_number, project_date, status, site_address, bids)
    VALUES (
      ${project.project_id},
      ${project.user_id},
      ${project.client_name},
      ${project.phone_number},
      ${project.project_date},
      ${project.status},
      ${JSON.stringify(project.site_address)},
      ${JSON.stringify(project.bids)}
    )
    RETURNING *
  `;
  return result.rows[0] as Project;
}

export async function updateProject(
  projectId: string,
  userId: string,
  updates: Partial<Pick<Project, 'client_name' | 'phone_number' | 'status' | 'site_address' | 'bids'>>
): Promise<Project | null> {
  const db = await getClient();
  const project = await getProjectById(projectId, userId);
  if (!project) return null;
  
  const newClientName = updates.client_name ?? project.client_name;
  const newPhoneNumber = updates.phone_number ?? project.phone_number;
  const newStatus = updates.status ?? project.status;
  const newSiteAddress = updates.site_address ? JSON.stringify(updates.site_address) : JSON.stringify(project.site_address);
  const newBids = updates.bids ? JSON.stringify(updates.bids) : JSON.stringify(project.bids);

  const result = await db.sql`
    UPDATE projects SET 
      client_name = ${newClientName},
      phone_number = ${newPhoneNumber},
      status = ${newStatus},
      site_address = ${newSiteAddress}::jsonb,
      bids = ${newBids}::jsonb,
      updated_at = NOW()
    WHERE project_id = ${projectId} AND user_id = ${userId}
    RETURNING *
  `;
  
  return result.rows[0] as Project || null;
}

export async function deleteProject(projectId: string, userId: string): Promise<boolean> {
  const db = await getClient();
  const result = await db.sql`
    DELETE FROM projects WHERE project_id = ${projectId} AND user_id = ${userId}
  `;
  return (result.rowCount ?? 0) > 0;
}
