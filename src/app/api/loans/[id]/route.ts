import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/auth.config';
import { calculateEMI } from "@/lib/loan";

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
        documents: true,
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
  console.log("PUT /api/loans/[id] - Start processing loan update");
  
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    console.error("Unauthorized access attempt - no valid session");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const loanData = await request.json();
    console.log("Received loan update data:", loanData);

    // Validate required fields
    const requiredFields = ["amount", "interestRate", "tenure", "type", "purpose"];
    const missingFields = requiredFields.filter(field => !loanData[field]);
    
    if (missingFields.length > 0) {
      console.error("Missing required fields:", missingFields);
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // Calculate EMI and total amount
    const emiAmount = calculateEMI(
      loanData.amount,
      loanData.interestRate,
      loanData.tenure
    );
    const totalAmount = emiAmount * loanData.tenure;

    console.log("Calculated loan details:", {
      emiAmount,
      totalAmount,
      tenure: loanData.tenure
    });

    // Update loan in database
    const updatedLoan = await prisma.loan.update({
      where: { id: params.id },
      data: {
        amount: loanData.amount,
        interestRate: loanData.interestRate,
        tenure: loanData.tenure,
        type: loanData.type,
        purpose: loanData.purpose,
        emiAmount,
        totalAmount,
        updatedAt: new Date(),
      },
    });

    console.log("Loan updated successfully:", updatedLoan);
    return NextResponse.json(updatedLoan);
  } catch (error) {
    console.error("Error updating loan:", error);
    return NextResponse.json(
      { error: "Failed to update loan" },
      { status: 500 }
    );
  }
}

// DELETE /api/loans/[id] - Delete a loan
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log("DELETE /api/loans/[id] - Start processing loan deletion");
  
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    console.error("Unauthorized access attempt - no valid session");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const loan = await prisma.loan.delete({
      where: { id: params.id },
    });
    
    console.log("Loan deleted successfully:", loan);
    return NextResponse.json(loan);
  } catch (error) {
    console.error("Error deleting loan:", error);
    return NextResponse.json(
      { error: "Failed to delete loan" },
      { status: 500 }
    );
  }
}

// PATCH /api/loans/[id] - Update loan status
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { status, comments, disbursedDate } = await request.json()
    if (!status) {
      return NextResponse.json({ error: 'Missing status' }, { status: 400 })
    }
    // Validate allowed status values
    const allowed = ['PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'CLOSED']
    if (!allowed.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }
    // Optionally: Add logic to restrict invalid transitions
    // e.g., can't go from REJECTED to ACTIVE, etc.
    const loan = await prisma.loan.findUnique({ where: { id: params.id } })
    if (!loan) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 })
    }
    // Example: Disallow REJECTED/APPROVED to ACTIVE unless previously APPROVED
    if (loan.status === 'REJECTED' && status !== 'REJECTED') {
      return NextResponse.json({ error: 'Cannot change status from REJECTED' }, { status: 400 })
    }
    // Update status and optionally comments/disbursedDate
    const updatedLoan = await prisma.loan.update({
      where: { id: params.id },
      data: {
        status,
        approvalComments: comments ?? loan.approvalComments,
        disbursedDate: disbursedDate ?? loan.disbursedDate,
        updatedAt: new Date(),
      },
    })
    return NextResponse.json(updatedLoan)
  } catch (error) {
    console.error('Error updating loan status:', error)
    return NextResponse.json({ error: 'Failed to update loan status' }, { status: 500 })
  }
} 