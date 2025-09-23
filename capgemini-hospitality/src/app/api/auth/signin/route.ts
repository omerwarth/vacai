import { NextRequest, NextResponse } from 'next/server';
import { cosmosDB } from '@/lib/cosmosdb';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const users = await cosmosDB.getItems(`SELECT * FROM c WHERE c.email = "${email}"`);
    
    if (users.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = users[0];

    // Check password (in production, compare with hashed password)
    if (user.password !== password) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update last login time
    const updatedUser = {
      ...user,
      lastLoginAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await cosmosDB.updateItem(user.id, updatedUser);

    // Don't return password in response
    const { password: _, ...userResponse } = updatedUser;

    return NextResponse.json({
      message: 'Signed in successfully!',
      user: userResponse
    });

  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json(
      { error: 'Failed to sign in' },
      { status: 500 }
    );
  }
}