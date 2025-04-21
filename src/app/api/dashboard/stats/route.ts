import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../../auth/auth.config';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const [
      totalCustomers,
      totalLoans,
      pendingLoans,
      approvedLoans,
      totalDocuments,
      pendingDocuments,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.loan.count(),
      prisma.loan.count({
        where: {
          status: 'PENDING',
        },
      }),
      prisma.loan.count({
        where: {
          status: 'APPROVED',
        },
      }),
      prisma.document.count(),
      prisma.document.count({
        where: {
          status: 'PENDING',
        },
      }),
    ]);

    return NextResponse.json({
      totalCustomers,
      totalLoans,
      pendingLoans,
      approvedLoans,
      totalDocuments,
      pendingDocuments,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 