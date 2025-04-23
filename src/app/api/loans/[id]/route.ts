import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/auth.config';

const prisma = new PrismaClient();

// GET /api/loans/[id] - Get a single loan
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const loan = await prisma.loan.findUnique({
      where: { id: params.id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
          },
        },
      },
    });

    if (!loan) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    }

    return NextResponse.json(loan);
  } catch (error) {
    console.error('Error fetching loan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch loan' },
      { status: 500 }
    );
  }
}

// PUT /api/loans/[id] - Update a loan
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    // Validate required fields
    const requiredFields = ['amount', 'interestRate', 'tenure', 'type', 'purpose'];
    for (const field of requiredFields) {
      if (!data[field]) {
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
    const emiAmount = (principal * rate * Math.pow(1 + rate, time)) / (Math.pow(1 + rate, time) - 1);
    const totalAmount = emiAmount * time;

    const loan = await prisma.loan.update({
      where: { id: params.id },
      data: {
        ...data,
        emiAmount,
        totalAmount,
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

    return NextResponse.json(loan);
  } catch (error: any) {
    console.error('Error updating loan:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Failed to update loan' },
      { status: 500 }
    );
  }
}

// DELETE /api/loans/[id] - Delete a loan
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.loan.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Loan deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting loan:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Failed to delete loan' },
      { status: 500 }
    );
  }
} 