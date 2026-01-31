import { cookies } from 'next/headers';
import { findSessionByToken, findUserById } from './db';
import type { User } from './db';

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get('session_token')?.value;
    
    if (!sessionToken) {
      return null;
    }
    
    const session = await findSessionByToken(sessionToken);
    if (!session) {
      return null;
    }
    
    const user = await findUserById(session.user_id);
    return user;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

export function generateUserId(): string {
  return `user_${Math.random().toString(36).substr(2, 12)}`;
}

export function generateProjectId(): string {
  return `proj_${Math.random().toString(36).substr(2, 12)}`;
}
