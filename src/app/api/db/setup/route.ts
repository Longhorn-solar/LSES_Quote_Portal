import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/db';

export async function POST() {
  try {
    const result = await initializeDatabase();
    return NextResponse.json(result);
  } catch (error) {
    console.error('DB setup error:', error);
    return NextResponse.json({ error: 'Database setup failed' }, { status: 500 });
  }
}
