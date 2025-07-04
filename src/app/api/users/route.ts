import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/auth.config';
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient();

// GET /api/users - Get all users
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// PATCH /api/users - Update current user's profile, notification preferences, or system settings
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const data = await request.json()
    // Validate input (at least one field must be present)
    const allowedFields = ['name', 'email', 'notifyEmail', 'notifySMS', 'theme', 'language']
    const updateData: Record<string, any> = {}
    for (const field of allowedFields) {
      if (data[field] !== undefined) updateData[field] = data[field]
    }
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }
    // Update user by email (from session)
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
      select: { id: true, name: true, email: true, notifyEmail: true, notifySMS: true, theme: true, language: true }
    })
    return NextResponse.json(user)
  } catch (error: any) {
    console.error('Error updating user profile:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
} 