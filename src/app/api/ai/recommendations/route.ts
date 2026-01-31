import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

// TODO: MIGRATE AI TO CUSTOMER'S OWN GEMINI KEY LATER
// Currently using Emergent LLM Key (gemini-2.0-flash-lite for cost efficiency)

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const { serviceName, notes, otherSelectedServices } = await request.json();
    
    const EMERGENT_LLM_KEY = process.env.EMERGENT_LLM_KEY;
    if (!EMERGENT_LLM_KEY) {
      return NextResponse.json({ recommendations: 'AI service not configured.' });
    }
    
    const prompt = `
You are a senior technical consultant for Longhorn Solar, an expert in residential energy efficiency in Central Texas.

The user is configuring the service: "${serviceName}".
The overall project currently includes: [${otherSelectedServices?.join(', ') || 'none'}].

Site conditions and specific client notes:
"${notes}"

Analyze the project and provide a professional brief focused on:

1. **Price & Scope Impact**: Identify specific site conditions mentioned that will likely increase or decrease the final price.
2. **Order of Operations**: If multiple services are selected, what is the mandatory or recommended sequence?
3. **Longhorn Synergy Opportunities**: How does this service benefit from or improve the other selected offerings?
4. **Critical Pitfalls**: Specific Central Texas construction risks (Heat, humidity, attic accessibility).

Format the output with bold headers. Keep it professional and concise.
`;

    // Use Emergent LLM integration
    const response = await fetch('https://api.emergentagent.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${EMERGENT_LLM_KEY}`
      },
      body: JSON.stringify({
        model: 'gemini-2.0-flash-lite',
        messages: [
          { role: 'system', content: 'You are an expert energy efficiency consultant for Longhorn Solar in Central Texas.' },
          { role: 'user', content: prompt }
        ]
      })
    });
    
    if (!response.ok) {
      console.error('AI API error:', await response.text());
      return NextResponse.json({ recommendations: 'Failed to generate recommendations. Please try again.' });
    }
    
    const data = await response.json();
    const recommendations = data.choices?.[0]?.message?.content || 'No recommendations generated.';
    
    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('AI recommendations error:', error);
    return NextResponse.json({ recommendations: 'Failed to generate recommendations.' });
  }
}
