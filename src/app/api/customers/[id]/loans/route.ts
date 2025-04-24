import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const customerId = params.id;

    // Check if customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Fetch loans for the customer
    const loans = await prisma.loan.findMany({
      where: { customerId },
      select: {
        id: true,
        customerId: true,
        status: true,
        type: true,
        amount: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(loans);
  } catch (error) {
    console.error('Error fetching customer loans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer loans' },
      { status: 500 }
    );
  }
} 