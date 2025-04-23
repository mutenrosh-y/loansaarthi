import { NextResponse } from 'next/server';
import { PrismaClient, LoanStatus } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/auth.config';

const prisma = new PrismaClient();

// GET /api/customers/[id] - Get a specific customer
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const customer = await prisma.customer.findUnique({
      where: {
        id: params.id,
      },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        loans: {
          select: {
            id: true,
            amount: true,
            interestRate: true,
            tenure: true,
            status: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}

// PUT /api/customers/[id] - Update a customer
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
    const requiredFields = ['name', 'email', 'phone', 'address', 'city', 'state', 'country', 'branchId', 'assignedTo'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const customer = await prisma.customer.update({
      where: {
        id: params.id,
      },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        branchId: data.branchId,
        assignedTo: data.assignedTo,
      },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(customer);
  } catch (error: any) {
    console.error('Error updating customer:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A customer with this email already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

// DELETE /api/customers/[id] - Delete a customer
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if customer has any active loans
    const customerWithLoans = await prisma.customer.findUnique({
      where: {
        id: params.id,
      },
      include: {
        _count: {
          select: {
            loans: {
              where: {
                status: LoanStatus.DISBURSED,
              },
            },
          },
        },
      },
    });

    if (!customerWithLoans) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    if (customerWithLoans._count.loans > 0) {
      return NextResponse.json(
        { error: 'Cannot delete customer with active loans' },
        { status: 400 }
      );
    }

    await prisma.customer.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
} 