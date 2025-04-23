import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/auth.config';

const prisma = new PrismaClient();

// GET /api/loans - Get all loans
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const loans = await prisma.loan.findMany({
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(loans);
  } catch (error) {
    console.error('Error fetching loans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch loans' },
      { status: 500 }
    );
  }
}

// POST /api/loans - Create a new loan
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    // Validate required fields
    const requiredFields = ['customerId', 'amount', 'interestRate', 'term', 'type', 'purpose'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create loan
    const loan = await prisma.loan.create({
      data: {
        ...data,
        status: 'PENDING',
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(loan, { status: 201 });
  } catch (error: any) {
    console.error('Error creating loan:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A loan with this ID already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create loan' },
      { status: 500 }
    );
  }
} 