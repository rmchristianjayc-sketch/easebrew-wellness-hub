import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';

const OWNER_SECRET = process.env.ADMIN_SECRET!;
const COACH_SECRET = process.env.COACH_SECRET!;
const JWT_SECRET = new TextEncoder().encode(process.env.ADMIN_SECRET!);

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required.' },
        { status: 400 }
      );
    }

    // Determine role
    let role: 'owner' | 'coach' | null = null;

    if (username === 'owner' && password === OWNER_SECRET) {
      role = 'owner';
    } else if (username === 'coach' && password === COACH_SECRET) {
      role = 'coach';
    }

    if (!role) {
      return NextResponse.json(
        { error: 'Invalid username or password.' },
        { status: 401 }
      );
    }

    // Generate JWT token (valid for 24 hours)
    const token = await new SignJWT({ username, role })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(JWT_SECRET);

    // Set token as httpOnly cookie
    const response = NextResponse.json({
      success: true,
      role,
      username,
    });

    response.cookies.set('eb_admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;

  } catch (err) {
    console.error('Admin login error:', err);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  // Logout — clear cookie
  const response = NextResponse.json({ success: true });
  response.cookies.delete('eb_admin_token');
  return response;
}