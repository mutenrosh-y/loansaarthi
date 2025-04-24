import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST /api/documents/[id]/verify - Verify or reject a document
export async function POST(
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

    const { action, comments } = await request.json();

    if (!action || !['VERIFY', 'REJECT'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    // Get the document and check if it exists
    const document = await prisma.document.findUnique({
      where: { id: params.id },
      include: {
        loan: true,
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Check if document is already verified or rejected
    if (document.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Document is not in pending status' },
        { status: 400 }
      );
    }

    // Update document status
    const updatedDocument = await prisma.document.update({
      where: { id: params.id },
      data: {
        status: action === 'VERIFY' ? 'VERIFIED' : 'REJECTED',
        verificationComments: comments,
        verifiedBy: session.user.id,
        verifiedAt: new Date(),
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        loan: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    // If document is verified and associated with a loan, check if all documents are verified
    if (action === 'VERIFY' && document.loan) {
      const allDocuments = await prisma.document.findMany({
        where: {
          loanId: document.loan.id,
        },
      });

      const allVerified = allDocuments.every(doc => doc.status === 'VERIFIED');

      if (allVerified) {
        // Update loan status to APPROVED if all documents are verified
        await prisma.loan.update({
          where: { id: document.loan.id },
          data: {
            status: 'APPROVED',
            approvalDate: new Date(),
            approvedBy: session.user.id,
          },
        });
      }
    }

    return NextResponse.json(updatedDocument);
  } catch (error) {
    console.error('Error verifying document:', error);
    return NextResponse.json(
      { error: 'Failed to verify document' },
      { status: 500 }
    );
  }
} 