import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isEmailAuthorized } from '@/lib/constants';
import { findUserByEmail, createUser, createSession } from '@/lib/db';
import { generateUserId } from '@/lib/auth';

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { session_id } = body;
    
    if (!session_id) {
      return NextResponse.json({ error: 'session_id required' }, { status: 400 });
    }
    
    // Exchange session_id with Emergent auth
    const authResponse = await fetch(
      'https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data',
      {
        headers: { 'X-Session-ID': session_id }
      }
    );
    
    if (!authResponse.ok) {
      return NextResponse.json({ error: 'Invalid session_id' }, { status: 401 });
    }
    
    const authData = await authResponse.json();
    const { email, name, picture, session_token } = authData;
    
    // Check email authorization
    if (!isEmailAuthorized(email)) {
      return NextResponse.json(
        { error: `Access denied. Email '${email}' is not authorized.` },
        { status: 403 }
      );
    }
    
    // Find or create user
    let user = await findUserByEmail(email);
    let userId: string;
    
    if (user) {
      userId = user.user_id;
    } else {
      userId = generateUserId();
      user = await createUser({
        user_id: userId,
        email,
        name,
        picture
      });
    }
    
    // Create session (7 days)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await createSession(userId, session_token, expiresAt);
    
    // Set cookie
    const cookieStore = cookies();
    cookieStore.set('session_token', session_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60
    });
    
    return NextResponse.json({
      user_id: userId,
      email,
      name,
      picture
    });
  } catch (error) {
    console.error('Auth session error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
