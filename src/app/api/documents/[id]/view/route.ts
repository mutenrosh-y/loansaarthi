import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getSignedUrl } from '@/lib/cloudinary';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      console.error('Unauthorized access attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get document
    const document = await prisma.document.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        url: true,
        cloudinaryPublicId: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        customerId: true,
        type: true,
        expiryDate: true,
        loanId: true,
        uploadedBy: true,
        verifiedBy: true,
      },
    });

    if (!document) {
      console.error('Document not found:', params.id);
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Log document details for debugging
    console.log('Document found:', {
      id: document.id,
      name: document.name,
      url: document.url,
      cloudinaryPublicId: document.cloudinaryPublicId,
    });

    // Get file format from URL
    const format = document.url.split('.').pop() || 'pdf';

    try {
      // Use the stored cloudinaryPublicId directly
      const publicId = document.cloudinaryPublicId;
      console.log('Using stored public_id:', publicId);
      
      // Generate or get cached signed URL
      const signedUrl = await getSignedUrl(publicId, format);
      return NextResponse.json({ url: signedUrl });
    } catch (error) {
      console.error('Error generating signed URL:', {
        documentId: document.id,
        url: document.url,
        format,
        error,
      });
      
      return NextResponse.json(
        { error: 'Failed to generate document URL' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in document view handler:', error);
    return NextResponse.json(
      { error: 'Failed to process document view request' },
      { status: 500 }
    );
  }
} 