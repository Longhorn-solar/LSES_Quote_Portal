import { NextResponse } from 'next/server';
import { SERVICES_DB } from '@/lib/constants';

export async function GET() {
  return NextResponse.json(SERVICES_DB);
}
