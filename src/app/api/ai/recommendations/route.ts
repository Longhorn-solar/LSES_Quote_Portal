import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

// Placeholder endpoint: AI recommendations are currently disabled.
// Future integration can use process.env.FUTURE_AI_PROVIDER_KEY.

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    await request.json();

    return NextResponse.json({
      recommendations:
        'AI recommendations are currently disabled. Placeholder is active for future provider integration using FUTURE_AI_PROVIDER_KEY.'
    });
  } catch (error) {
    console.error('AI recommendations error:', error);
    return NextResponse.json({ recommendations: 'Failed to generate recommendations.' });
  }
}
