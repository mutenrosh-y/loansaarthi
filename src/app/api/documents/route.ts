import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const documents = await prisma.document.findMany({
      include: {
        customer: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform the data to match the frontend interface
    const transformedDocuments = documents.map(doc => ({
      id: doc.id,
      name: doc.name,
      type: doc.type,
      customerName: doc.customer.name,
      size: 'N/A', // We don't store file size in the database
      status: doc.status,
      uploadedAt: doc.createdAt.toISOString(),
      expiryDate: doc.expiryDate?.toISOString() || null,
    }));

    return NextResponse.json(transformedDocuments);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
} 