import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getProjectById, updateProject } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; serviceName: string }> }
) {
  try {
    const { id, serviceName: encodedServiceName } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const project = await getProjectById(id, user.user_id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    const body = await request.json();
    const serviceName = decodeURIComponent(encodedServiceName);
    
    // Update the specific bid
    const bids = project.bids || {};
    bids[serviceName] = {
      ...bids[serviceName],
      ...body,
      serviceName
    };
    
    await updateProject(id, user.user_id, { bids });
    
    return NextResponse.json({ message: 'Bid updated successfully' });
  } catch (error) {
    console.error('Update bid error:', error);
    return NextResponse.json({ error: 'Failed to update bid' }, { status: 500 });
  }
}
