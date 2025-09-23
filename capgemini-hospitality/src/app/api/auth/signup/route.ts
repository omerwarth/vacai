import { NextRequest, NextResponse } from 'next/server';
import { cosmosDB } from '@/lib/cosmosdb';

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName } = await request.json();

    // Basic validation
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await cosmosDB.getItems(`SELECT * FROM c WHERE c.email = "${email}"`);
    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create new user
    const newUser = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      email,
      firstName,
      lastName,
      password, // In production, this should be hashed
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const result = await cosmosDB.createItem(newUser);

    // Don't return password in response
    const { password: _, ...userResponse } = result;

    return NextResponse.json({
      message: 'Account created successfully!',
      user: userResponse
    }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}