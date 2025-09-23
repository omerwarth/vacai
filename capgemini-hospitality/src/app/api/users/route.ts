import { NextResponse } from 'next/server';
import { cosmosDB } from '@/lib/cosmosdb';

// GET /api/users - Get all users (for testing purposes)
export async function GET() {
  try {
    const users = await cosmosDB.getItems();
    
    // Remove passwords from response
    const safeUsers = users.map(user => {
      const { password, ...safeUser } = user;
      return safeUser;
    });
    
    return NextResponse.json({
      users: safeUsers,
      count: safeUsers.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}