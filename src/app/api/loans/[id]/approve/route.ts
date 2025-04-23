import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/auth.config';

const prisma = new PrismaClient();

// POST /api/loans/[id]/approve - Approve or reject a loan
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { action, comments } = data;

    if (!['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be APPROVE or REJECT' },
        { status: 400 }
      );
    }

    // Check if all required documents are verified
    const loan = await prisma.loan.findUnique({
      where: { id: params.id },
      include: {
        documents: true,
      },
    });

    if (!loan) {
      return NextResponse.json(
        { error: 'Loan not found' },
        { status: 404 }
      );
    }

    if (loan.status !== 'PENDING') {
      return NextResponse.json(
        { error: `Cannot ${action.toLowerCase()} loan. Current status: ${loan.status}` },
        { status: 400 }
      );
    }

    const unverifiedDocs = loan.documents.filter(doc => doc.status !== 'VERIFIED');
    if (action === 'APPROVE' && unverifiedDocs.length > 0) {
      return NextResponse.json(
        { error: 'All documents must be verified before approval' },
        { status: 400 }
      );
    }

    const updatedLoan = await prisma.loan.update({
      where: { id: params.id },
      data: {
        status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
        approvedBy: action === 'APPROVE' ? session.user.id : null,
        approvalDate: action === 'APPROVE' ? new Date() : null,
        approvalComments: action === 'APPROVE' ? comments : null,
        rejectionReason: action === 'REJECT' ? comments : null,
        rejectionDate: action === 'REJECT' ? new Date() : null,
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

    return NextResponse.json(updatedLoan);
  } catch (error: any) {
    console.error('Error updating loan:', error);
    return NextResponse.json(
      { error: 'Failed to update loan' },
      { status: 500 }
    );
  }
} 