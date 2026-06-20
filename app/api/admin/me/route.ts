import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.ADMIN_SECRET!);

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('eb_admin_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const { username, role } = payload as { username: string; role: 'owner' | 'coach' };

    return NextResponse.json({ success: true, username, role });

  } catch {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }
}