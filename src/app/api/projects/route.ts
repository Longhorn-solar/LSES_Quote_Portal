import { NextResponse } from 'next/server';
import { getCurrentUser, generateProjectId } from '@/lib/auth';
import { getProjectsByUser, createProject } from '@/lib/db';
import { createEmptyBids } from '@/lib/constants';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const projects = await getProjectsByUser(user.user_id);
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const body = await request.json();
    const { clientName, phoneNumber, siteAddress } = body;
    
    const project = await createProject({
      project_id: generateProjectId(),
      user_id: user.user_id,
      client_name: clientName,
      phone_number: phoneNumber || '',
      project_date: new Date().toISOString().split('T')[0],
      status: 'QUOTING',
      site_address: siteAddress || { address1: '', address2: '', city: '', state: 'TX', zip: '' },
      bids: createEmptyBids()
    });
    
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
