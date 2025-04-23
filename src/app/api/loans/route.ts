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
    console.log('Session:', JSON.stringify(session, null, 2));
    
    if (!session) {
      console.error('No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.user || !session.user.id) {
      console.error('Session user or user ID is missing:', session);
      return NextResponse.json({ error: 'User ID not found in session' }, { status: 500 });
    }

    const data = await request.json();
    console.log('Received loan data:', data);
    
    // Validate required fields
    const requiredFields = ['customerId', 'amount', 'interestRate', 'tenure', 'type', 'purpose'];
    for (const field of requiredFields) {
      if (!data[field]) {
        console.error(`Missing required field: ${field}`);
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Calculate EMI and total amount
    const principal = parseFloat(data.amount);
    const rate = parseFloat(data.interestRate) / 100 / 12; // Monthly interest rate
    const time = parseInt(data.tenure);
    
    // Check for NaN values
    if (isNaN(principal) || isNaN(rate) || isNaN(time)) {
      console.error('Invalid numeric values:', { principal, rate, time });
      return NextResponse.json(
        { error: 'Invalid numeric values for amount, interest rate, or tenure' },
        { status: 400 }
      );
    }
    
    // Check for zero or negative values
    if (principal <= 0 || rate <= 0 || time <= 0) {
      console.error('Zero or negative values:', { principal, rate, time });
      return NextResponse.json(
        { error: 'Amount, interest rate, and tenure must be positive values' },
        { status: 400 }
      );
    }
    
    const emiAmount = (principal * rate * Math.pow(1 + rate, time)) / (Math.pow(1 + rate, time) - 1);
    const totalAmount = emiAmount * time;

    console.log('Creating loan with data:', {
      ...data,
      emiAmount,
      totalAmount,
      status: 'PENDING',
      createdBy: session.user.id,
    });

    // Create loan
    const loan = await prisma.loan.create({
      data: {
        ...data,
        emiAmount,
        totalAmount,
        status: 'PENDING',
        createdBy: session.user.id,
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
    console.error('Error stack:', error.stack);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A loan with this ID already exists' },
        { status: 400 }
      );
    }
    
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Referenced customer or user does not exist' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: `Failed to create loan: ${error.message}` },
      { status: 500 }
    );
  }
} 